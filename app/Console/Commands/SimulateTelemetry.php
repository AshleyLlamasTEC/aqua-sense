<?php

namespace App\Console\Commands;

use App\Jobs\EvaluateAlertRules;
use App\Models\DeviceSensor;
use App\Models\TelemetryReading;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SimulateTelemetry extends Command
{
    protected $signature = 'simulate:telemetry
        {--device=        : ID del dispositivo específico}
        {--interval=5     : Segundos entre rondas (mínimo 1)}
        {--anomaly-rate=5 : % de probabilidad de error (0-100)}
        {--packet-loss=2  : % de probabilidad de que el paquete no llegue (realismo IoT)}
        {--rounds=0       : Cuántas veces ejecutar (0 = infinito)}
        {--no-alerts      : Desactivar el despacho de Jobs de alertas}
        {--dry-run        : No persistir en Base de Datos}';

    protected $description = '[DEV] Emulador de hardware ESP32 para telemetría de acuarios.';

    private array $profiles = [
        'ph'          => ['base' => 7.2,  'noise' => 0.08, 'drift' => 0.005, 'safe' => [6.5, 8.5]],
        'temperature' => ['base' => 25.5, 'noise' => 0.4,  'drift' => 0.02,  'safe' => [18.0, 30.0]],
        'tds'         => ['base' => 380.0, 'noise' => 8.0,  'drift' => 0.5,   'safe' => [150.0, 800.0]],
    ];

    private array $state = [];

    public function handle(): int
    {
        if (app()->isProduction()) {
            $this->error('🚨 Comando bloqueado en producción.');
            return self::FAILURE;
        }

        $sensors = $this->getSensors();
        if ($sensors->isEmpty()) return self::FAILURE;

        $this->initializeState($sensors);
        $this->renderHeader($sensors);

        $round = 0;
        while (true) {
            $round++;
            $maxRounds = (int) $this->option('rounds');

            $this->line("\n <fg=cyan;options=bold>── Ronda #{$round}</> <fg=gray>" . now()->format('H:i:s') . "</>");

            foreach ($sensors as $sensor) {
                // Simulación de pérdida de paquete
                if (rand(1, 100) <= (int)$this->option('packet-loss')) {
                    $this->line("  <fg=yellow;options=bold>✕ PERDIDO</>  <fg=white>{$sensor->sensorType->name}</> <fg=gray>(Simulación de fallo de red)</>");
                    continue;
                }

                $result = $this->processSensor($sensor);
                $this->renderSensorLine($result);
            }

            if ($maxRounds > 0 && $round >= $maxRounds) break;

            $this->waitInterruptible((int)$this->option('interval'));

            // Limpieza de memoria en ciclos largos
            if ($round % 50 === 0) {
                gc_collect_cycles();
                $this->info("  [Sistema] Memoria optimizada...");
            }
        }

        $this->info("\n✓ Simulación finalizada.");
        return self::SUCCESS;
    }

    private function processSensor(DeviceSensor $sensor): array
    {
        $slug = $sensor->sensorType->slug;
        $profile = $this->profiles[$slug] ?? $this->profiles['ph'];
        $sId = $sensor->id;

        // 1. Evolución del Drift (Deriva térmica/química)
        $this->state[$sId]['drift'] += (lcg_value() - 0.5) * $profile['drift'];
        $this->state[$sId]['base'] += $this->state[$sId]['drift'] * 0.1;

        // 2. Generar Valor con Box-Muller (Ruido Normal)
        // 2. Generar Valor con Box-Muller (Ruido Normal)
        $isAnomaly = rand(1, 100) <= (int)$this->option('anomaly-rate');

        $rawValue = $this->generateRawValue(
            $profile,
            $this->state[$sId]['base'],
            $isAnomaly
        );

        // detectar anomalía natural después de generar
        [$min, $max] = $profile['safe'];
        if ($rawValue < $min || $rawValue > $max) {
            $isAnomaly = true;
        }

        // 3. Calibración (Lógica del Modelo)
        $calibrated = round($sensor->applyCalibration($rawValue), 4);

        $data = [
            'sensor_id'  => $sId,
            'name'       => $sensor->sensorType->name,
            'unit'       => $sensor->sensorType->unit,
            'raw'        => $rawValue,
            'value'      => $calibrated,
            'is_anomaly' => $isAnomaly,
            'persisted'  => false
        ];

        if (!$this->option('dry-run')) {
            DB::transaction(function () use ($sId, $calibrated, $rawValue, $sensor, &$data) {

                $reading = TelemetryReading::create([
                    'device_sensor_id' => $sId,
                    'value'            => $calibrated,
                    'raw_value'        => (string) round($rawValue, 4),
                    'quality_flag'     => $data['is_anomaly'] ? 1 : 0,
                    'recorded_at'      => now(),
                ]);

                $data['persisted'] = true;
                $data['id'] = $reading->id;

                Cache::put("sensor:{$sId}:latest", [
                    'value' => $calibrated,
                    'unit' => $sensor->sensorType->unit,
                    'recorded_at' => now()->toIsoString()
                ], now()->addMinutes(5));

                if (!$this->option('no-alerts')) {
                    EvaluateAlertRules::dispatch($reading, $sensor);
                }
            });
        }

        return $data;
    }

    private function generateRawValue($profile, $base, $isAnomaly): float
    {
        $u1 = max(1e-10, lcg_value());
        $u2 = lcg_value();
        $noise = sqrt(-2.0 * log($u1)) * cos(2.0 * M_PI * $u2) * $profile['noise'];

        if ($isAnomaly) {
            [$min, $max] = $profile['safe'];
            return rand(0, 1) ? $min - (abs($noise) + 1.5) : $max + (abs($noise) + 1.5);
        }

        [$min, $max] = $profile['safe'];

        $value = $base + $noise;

        return max($min - 2, min($max + 2, $value));
    }

    private function getSensors()
    {
        return DeviceSensor::query()
            ->where('is_active', true)
            ->when($this->option('device'), fn($q) => $q->where('device_id', $this->option('device')))
            ->with(['sensorType', 'device'])
            ->get();
    }

    private function initializeState($sensors)
    {
        foreach ($sensors as $s) {
            $p = $this->profiles[$s->sensorType->slug] ?? $this->profiles['ph'];
            $this->state[$s->id] = ['base' => $p['base'], 'drift' => 0];
        }
    }

    private function renderHeader($sensors)
    {
        $this->newLine();
        $this->line(' <fg=green;options=bold>AquaSense Hardware Emulator v2.0</>');
        $this->line(" <fg=gray>Simulando {$sensors->count()} sensores activos...</>");
        $this->line(' <fg=gray>─────────────────────────────────────────────────────</>');
    }

    private function renderSensorLine($r)
    {
        $status = $r['is_anomaly'] ? '<fg=red;options=bold>⚠ ANOMALÍA</>' : '<fg=green>✓ NORMAL  </>';
        $idTag = $r['persisted'] ? "<fg=gray>[ID:{$r['id']}]</>" : "<fg=yellow>[DRY]</>";

        $this->line(sprintf(
            "  %s  <fg=white>%-15s</> <fg=cyan;options=bold>%8.4f %-4s</> <fg=gray>raw:%7.2f</> %s",
            $status,
            $r['name'],
            $r['value'],
            $r['unit'],
            $r['raw'],
            $idTag
        ));
    }

    private function waitInterruptible(int $seconds): void
    {
        for ($i = 0; $i < $seconds; $i++) {
            sleep(1);
        }
    }
}
