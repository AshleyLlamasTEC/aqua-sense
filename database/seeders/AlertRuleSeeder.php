<?php

namespace Database\Seeders;

use App\Models\AlertRule;
use App\Models\Device;
use App\Models\DeviceSensor;
use App\Models\SensorType;
use App\Models\TelemetryReading;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * AlertRuleSeeder
 * ─────────────────────────────────────────────────────────────────────────
 * Crea reglas de alerta de ejemplo para los sensores del dispositivo Alpha.
 * Archivo: database/seeders/AlertRuleSeeder.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class AlertRuleSeeder extends Seeder
{
    public function run(): void
    {
        $device = Device::where('name', 'ESP32 Nodo Alpha')->first();
        if (! $device) return;

        // Reglas por tipo de sensor (slug) con múltiples niveles de severidad
        $rules = [
            'ph' => [
                [
                    'name'         => 'pH Crítico Bajo',
                    'min_value'    => 6.0,
                    'max_value'    => null,
                    'cooldown_min' => 15,
                ],
                [
                    'name'         => 'pH Advertencia',
                    'min_value'    => 6.5,
                    'max_value'    => 8.5,
                    'cooldown_min' => 30,
                ],
                [
                    'name'         => 'pH Crítico Alto',
                    'min_value'    => null,
                    'max_value'    => 9.0,
                    'cooldown_min' => 15,
                ],
            ],
            'temperature' => [
                [
                    'name'         => 'Temperatura Baja',
                    'min_value'    => 18.0,
                    'max_value'    => null,
                    'cooldown_min' => 60,
                ],
                [
                    'name'         => 'Temperatura Alta Crítica',
                    'min_value'    => null,
                    'max_value'    => 32.0,
                    'cooldown_min' => 30,
                ],
            ],
            'dissolved_oxygen' => [
                [
                    'name'         => 'Oxígeno Disuelto Bajo',
                    'min_value'    => 5.0,
                    'max_value'    => null,
                    'cooldown_min' => 10,
                ],
            ],
        ];

        foreach ($rules as $sensorSlug => $sensorRules) {
            $sensorType   = SensorType::where('slug', $sensorSlug)->first();
            if (! $sensorType) continue;

            $deviceSensor = DeviceSensor::where('device_id', $device->id)
                                        ->where('sensor_type_id', $sensorType->id)
                                        ->first();
            if (! $deviceSensor) continue;

            foreach ($sensorRules as $rule) {
                AlertRule::firstOrCreate(
                    [
                        'device_sensor_id' => $deviceSensor->id,
                        'name'             => $rule['name'],
                    ],
                    array_merge($rule, [
                        'device_sensor_id' => $deviceSensor->id,
                        'is_active'        => true,
                    ])
                );
            }
        }

        $this->command->info('✓ Reglas de alerta creadas.');
    }
}
