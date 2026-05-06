<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\DeviceSensor;
use App\Models\SensorType;
use Illuminate\Database\Seeder;

/**
 * DeviceSensorSeeder
 * ─────────────────────────────────────────────────────────────
 * Configura sensores físicos instalados en cada ESP32.
 *
 * Filosofía:
 *   Cada dispositivo recibe una configuración coherente:
 *
 *   GPIO34 → temperatura
 *   GPIO35 → pH
 *   GPIO32 → TDS
 *
 * En el futuro algunos dispositivos podrían tener:
 *   - oxígeno disuelto
 *   - amonio
 *   - ORP
 *   - nivel de agua
 */
class DeviceSensorSeeder extends Seeder
{
    public function run(): void
    {
        $devices = Device::all();

        $temperature = SensorType::where(
            'slug',
            'temperature'
        )->first();

        $ph = SensorType::where(
            'slug',
            'ph'
        )->first();

        $tds = SensorType::where(
            'slug',
            'tds'
        )->first();


        foreach ($devices as $device) {

            $this->createTemperatureSensor(
                $device,
                $temperature
            );

            $this->createPhSensor(
                $device,
                $ph
            );

            $this->createTdsSensor(
                $device,
                $tds
            );

        }
    }


    private function createTemperatureSensor(
        Device $device,
        SensorType $type
    ): void {

        DeviceSensor::create([
            'device_id' => $device->id,
            'sensor_type_id' => $type->id,

            'pin' => 'GPIO34',

            'sample_interval_s' => 30,

            'calibration_offset' => 0.0000,
            'calibration_factor' => 1.0000,

            'is_active' => true,
        ]);
    }


    private function createPhSensor(
        Device $device,
        SensorType $type
    ): void {

        DeviceSensor::create([
            'device_id' => $device->id,
            'sensor_type_id' => $type->id,

            'pin' => 'GPIO35',

            'sample_interval_s' => 60,

            'calibration_offset' => fake()->randomFloat(
                4,
                -0.2000,
                0.2000
            ),

            'calibration_factor' => fake()->randomFloat(
                4,
                0.9800,
                1.0200
            ),

            'is_active' => true,
        ]);
    }


    private function createTdsSensor(
        Device $device,
        SensorType $type
    ): void {

        DeviceSensor::create([
            'device_id' => $device->id,
            'sensor_type_id' => $type->id,

            'pin' => 'GPIO32',

            'sample_interval_s' => 45,

            'calibration_offset' => fake()->randomFloat(
                4,
                -5,
                5
            ),

            'calibration_factor' => fake()->randomFloat(
                4,
                0.9500,
                1.0500
            ),

            'is_active' => true,
        ]);
    }
}
