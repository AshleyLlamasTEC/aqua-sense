<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder
 * ─────────────────────────────────────────────────────────────────────────
 * Seeder maestro que orquesta la ejecución de todos los seeders.
 * Se ejecuta con: php artisan db:seed
 * O junto con las migraciones: php artisan migrate --seed
 *
 * ORDEN IMPORTANTE:
 *   Los seeders respetan las dependencias de FK:
 *   1. SensorTypeSeeder    → catálogo (sin FK)
 *   2. UserSeeder          → usuarios de prueba
 *   3. AquariumSeeder      → requiere users
 *   4. DeviceSeeder        → requiere aquariums
 *   5. DeviceSensorSeeder  → requiere devices + sensor_types
 *   6. AlertRuleSeeder     → requiere device_sensors
 *   7. TelemetrySeeder     → requiere device_sensors (solo en desarrollo)
 *
 * ¿Cuándo NO correr TelemetrySeeder?
 *   En producción, nunca. Genera datos falsos masivos.
 *   Solo para desarrollo local y demos.
 *
 * Archivo: database/seeders/DatabaseSeeder.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // 1. Catálogo estático de tipos de sensores (siempre)
            SensorTypeSeeder::class,

            // 2. Datos de prueba (solo en entornos que no son producción)
            // En producción, estos seeders crean datos ficticios no deseados
        ]);

        // Seeders de desarrollo — solo en local/staging
        if (! app()->isProduction()) {
            $this->call([
                UserSeeder::class,
                AquariumSeeder::class,
                DeviceSeeder::class,
                DeviceSensorSeeder::class,
                AlertRuleSeeder::class,
                TelemetrySeeder::class,
            ]);
        }
    }
}
