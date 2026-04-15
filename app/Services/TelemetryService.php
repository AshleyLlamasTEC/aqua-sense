<?php
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  app/Services/TelemetryService.php                                      ║
// ╚══════════════════════════════════════════════════════════════════════════╝
/**
 * ¿Por qué un Service?
 * ─────────────────────────────────────────────────────────────────────────
 * El controller recibe el request y devuelve la respuesta.
 * El service contiene la lógica de negocio.
 *
 * Si metiéramos toda la lógica de ingesta en TelemetryController@store,
 * el método tendría 80+ líneas con calibración, validación de rangos,
 * evaluación de alertas, actualización de cache y broadcast.
 * Un método de controller debe tener ≤ 15 líneas.
 *
 * El service es testeable de forma independiente (sin HTTP).
 * El controller solo llama: $this->telemetryService->ingest($data, $device)
 */

namespace App\Services;

use App\Events\TelemetryReceived;
use App\Models\Device;
use App\Models\DeviceSensor;
use App\Models\TelemetryReading;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TelemetryService
{
    public function __construct(
        private readonly AlertEvaluationService $alertService
    ) {}

    /**
     * Procesa un array de lecturas crudas del ESP32.
     * Puede recibir 1 o N lecturas (batch).
     *
     * Flujo por cada lectura:
     *   1. Carga el DeviceSensor y verifica que pertenezca al dispositivo
     *   2. Aplica calibración al valor crudo
     *   3. Determina el quality_flag comparando con rangos operativos
     *   4. Persiste en telemetry_readings
     *   5. Actualiza cache con última lectura (para el dashboard live)
     *   6. Lanza el evento TelemetryReceived (broadcast → WebSocket)
     *   7. Despacha el job de evaluación de alertas (async, no bloquea)
     *
     * @param  array   $readings  Array de datos validados
     * @param  Device  $device    Dispositivo autenticado
     * @return TelemetryReading[] Array de lecturas persistidas
     */
    public function ingest(array $readings, Device $device): array
    {
        $persisted = [];

        // DB::transaction garantiza que si cualquier lectura del batch falla,
        // ninguna se guarda — consistencia total o rollback total
        DB::transaction(function () use ($readings, $device, &$persisted) {
            foreach ($readings as $data) {
                $reading = $this->processReading($data, $device);
                if ($reading) {
                    $persisted[] = $reading;
                }
            }
        });

        return $persisted;
    }

    /**
     * Procesa una lectura individual.
     * Devuelve null si el device_sensor no pertenece al dispositivo (seguridad).
     */
    private function processReading(array $data, Device $device): ?TelemetryReading
    {
        // Cargar el sensor con su tipo para calibración y validación
        $sensor = DeviceSensor::with('sensorType')
            ->where('id', $data['device_sensor_id'])
            ->where('device_id', $device->id) // ← seguridad: el sensor debe ser de ESTE dispositivo
            ->where('is_active', true)
            ->first();

        // Si el sensor no pertenece al dispositivo autenticado → ignorar silenciosamente
        // (no lanzar error para no interrumpir el resto del batch)
        if (! $sensor) {
            return null;
        }

        $rawValue = (float) $data['value'];

        // Aplicar fórmula de calibración: valor_real = (raw * factor) + offset
        $calibratedValue = $sensor->applyCalibration($rawValue);

        // Determinar calidad de la lectura
        $qualityFlag = $this->determineQualityFlag($calibratedValue, $sensor);

        // Persiste la lectura
        $reading = TelemetryReading::create([
            'device_sensor_id' => $sensor->id,
            'value'            => $calibratedValue,
            'raw_value'        => $data['raw_value'] ?? (string) $rawValue,
            'quality_flag'     => $data['quality_flag'] ?? $qualityFlag,
            'recorded_at'      => $data['recorded_at'] ?? now(),
        ]);

        // Actualizar cache con la última lectura para el dashboard live
        // TTL de 10 minutos — si el sensor deja de reportar, el cache expira
        $cacheKey = "sensor:{$sensor->id}:latest";
        Cache::put($cacheKey, [
            'value'       => $calibratedValue,
            'unit'        => $sensor->sensorType->unit,
            'recorded_at' => $reading->recorded_at->toISOString(),
            'quality'     => $qualityFlag,
        ], now()->addMinutes(10));

        // Broadcast vía WebSocket (Laravel Reverb + Echo en el frontend)
        // El evento lleva los datos mínimos necesarios para actualizar la UI
        event(new TelemetryReceived($reading, $sensor));

        // Evaluar alertas de forma asíncrona (no bloquea la respuesta al ESP32)
        // El ESP32 debe recibir una respuesta rápida para no timeout
        dispatch(fn () => $this->alertService->evaluate($reading, $sensor))
            ->afterResponse(); // Se ejecuta después de enviar la respuesta HTTP

        return $reading;
    }

    /**
     * Determina el quality_flag basándose en los rangos operativos del sensor.
     *
     * 0 = OK      → dentro del rango operativo del hardware
     * 1 = DUDOSO  → fuera del rango biológico seguro pero dentro del hardware
     * 2 = ERROR   → fuera del rango operativo del hardware (sensor defectuoso)
     */
    private function determineQualityFlag(float $value, DeviceSensor $sensor): int
    {
        $type = $sensor->sensorType;

        if (! $type->isWithinOperationalRange($value)) {
            return 2; // ERROR: el hardware no puede medir este valor
        }

        return 0; // OK
    }

    /**
     * Obtiene datos históricos de un sensor agregados por intervalo.
     *
     * El parámetro $interval permite evitar devolver millones de puntos
     * al frontend cuando el rango de tiempo es grande.
     *
     * Intervalos soportados: '5m', '15m', '1h', '6h', '1d'
     *
     * @param  DeviceSensor $sensor
     * @param  string       $from      ISO 8601
     * @param  string       $to        ISO 8601
     * @param  string       $interval  Agrupación temporal
     * @return \Illuminate\Support\Collection
     */
    public function getHistorical(
        DeviceSensor $sensor,
        string $from,
        string $to,
        string $interval = '1h'
    ) {
        $groupFormat = match ($interval) {
            '5m'  => '%Y-%m-%d %H:%i',
            '15m' => '%Y-%m-%d %H:%i',
            '1h'  => '%Y-%m-%d %H:00',
            '6h'  => '%Y-%m-%d %H:00',
            '1d'  => '%Y-%m-%d',
            default => '%Y-%m-%d %H:00',
        };

        // Agrupación en MySQL con DATE_FORMAT para truncar el timestamp
        // Devuelve AVG, MIN, MAX por intervalo — suficiente para gráficas
        return TelemetryReading::where('device_sensor_id', $sensor->id)
            ->where('quality_flag', 0) // Solo lecturas válidas
            ->whereBetween('recorded_at', [$from, $to])
            ->selectRaw("
                DATE_FORMAT(recorded_at, '{$groupFormat}') as period,
                AVG(value) as avg_value,
                MIN(value) as min_value,
                MAX(value) as max_value,
                COUNT(*) as count
            ")
            ->groupByRaw("DATE_FORMAT(recorded_at, '{$groupFormat}')")
            ->orderBy('period')
            ->get();
    }

    /**
     * Obtiene la última lectura de un sensor desde cache.
     * Si no está en cache, la busca en BD y la cachea.
     */
    public function getLatest(DeviceSensor $sensor): ?array
    {
        return Cache::remember(
            "sensor:{$sensor->id}:latest",
            now()->addMinutes(10),
            function () use ($sensor) {
                $reading = $sensor->latestReading;
                if (! $reading) return null;

                return [
                    'value'       => $reading->value,
                    'unit'        => $sensor->sensorType->unit,
                    'recorded_at' => $reading->recorded_at->toISOString(),
                    'quality'     => $reading->quality_flag,
                ];
            }
        );
    }
}
