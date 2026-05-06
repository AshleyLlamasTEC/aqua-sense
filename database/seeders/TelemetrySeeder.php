<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\DeviceSensor;
use App\Models\TelemetryReading;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * TelemetrySeeder
 * ─────────────────────────────────────────────────────────────────────────
 * Genera datos históricos de telemetría realistas para las gráficas D3.
 * SOLO para desarrollo local — NUNCA en producción.
 *
 * Estrategia de generación:
 *   - Simula valores realistas con ruido gaussiano alrededor de un valor base
 *   - Algunos valores ocasionalmente salen de rango (simula eventos reales)
 *   - Usa bulk insert para rendimiento — no crea un registro a la vez
 *
 * ¿Por qué bulk insert?
 *   Generar 7 días × 1440 min × 5 sensores = 50,400 filas.
 *   Con create() individual → ~50,000 queries → muy lento.
 *   Con insert() en chunks de 500 → ~100 queries → rápido.
 *
 * Archivo: database/seeders/TelemetrySeeder.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class TelemetrySeeder extends Seeder
{
    /**
     * Días de datos históricos a generar.
     * 7 días = suficiente para ver tendencias en las gráficas.
     */
    private int $days = 7;

    /**
     * Valores base y ruido por tipo de sensor.
     * base  = valor medio simulado
     * noise = amplitud máxima de la variación aleatoria
     * drift = variación lenta acumulada (simulación de deriva)
     */
    private array $sensorProfiles = [
        'ph'              => ['base' => 7.2, 'noise' => 0.15, 'drift' => 0.02],
        'temperature'     => ['base' => 25.5, 'noise' => 0.8,  'drift' => 0.1],
        'tds'             => ['base' => 380.0, 'noise' => 15.0, 'drift' => 2.0],
        'turbidity'       => ['base' => 12.0, 'noise' => 2.0,  'drift' => 0.5],
        'dissolved_oxygen'=> ['base' => 7.5, 'noise' => 0.3,  'drift' => 0.05],
    ];

    public function run(): void
    {
        $device = Device::where('name', 'ESP32 Nodo Alpha')->first();
        if (! $device) {
            $this->command->warn('No se encontró ESP32 Nodo Alpha. Ejecuta DeviceSeeder primero.');
            return;
        }

        $sensors = $device->sensors()->with('sensorType')->get();
        if ($sensors->isEmpty()) {
            $this->command->warn('No hay sensores. Ejecuta DeviceSensorSeeder primero.');
            return;
        }

        $totalInserted = 0;

        foreach ($sensors as $sensor) {
            $slug    = $sensor->sensorType->slug ?? null;
            $profile = $this->sensorProfiles[$slug] ?? ['base' => 50.0, 'noise' => 5.0, 'drift' => 0.5];

            $readings = $this->generateReadings($sensor->id, $sensor->sample_interval_s, $profile);
            $totalInserted += count($readings);

            // Insertar en chunks para no saturar memoria ni BD
            foreach (array_chunk($readings, 500) as $chunk) {
                DB::table('telemetry_readings')->insert($chunk);
            }

            $this->command->info("  ✓ {$sensor->sensorType->name}: " . count($readings) . " lecturas");
        }

        $this->command->info("✓ Total: {$totalInserted} lecturas históricas generadas ({$this->days} días).");
    }

    /**
     * Genera el array de lecturas para un sensor.
     * Simula variación realista con algo de ruido gaussiano aproximado.
     */
    private function generateReadings(int $sensorId, int $intervalSeconds, array $profile): array
    {
        $readings    = [];
        $now         = Carbon::now();
        $start       = $now->copy()->subDays($this->days);
        $current     = $start->copy();
        $currentBase = $profile['base'];

        while ($current->lte($now)) {
            // Ruido gaussiano aproximado: suma de dos valores aleatorios
            // (distribución triangular ≈ gaussiana para propósitos de demo)
            $noise = (lcg_value() + lcg_value() - 1) * $profile['noise'];

            // Deriva lenta: el valor base se desplaza gradualmente
            $currentBase += (lcg_value() - 0.5) * $profile['drift'];

            // Calcular valor final, asegurar que sea positivo
            $value = max(0, round($currentBase + $noise, 4));

            $readings[] = [
                'device_sensor_id' => $sensorId,
                'value'            => $value,
                'raw_value'        => (string) $value,
                'quality_flag'     => 0, // Todas OK para el demo
                'recorded_at'      => $current->toDateTimeString(),
            ];

            $current->addSeconds($intervalSeconds);
        }

        return $readings;
    }
}
