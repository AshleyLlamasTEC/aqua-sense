<?php

namespace Database\Seeders;

use App\Models\Aquarium;
use App\Models\Device;
use App\Models\DeviceSensor;
use App\Models\SensorType;
use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Database\Seeder;

/**
 * AquariumSeeder
 * ─────────────────────────────────────────────────────────────────────────
 * Crea acuarios de ejemplo para el usuario admin.
 * Archivo: database/seeders/AquariumSeeder.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class AquariumSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@aqua.test')->firstOrFail();

        $aquariums = [
            [
                'name'          => 'Acuario Principal',
                'description'   => 'Tanque principal de producción — Tilapia Nilótica',
                'volume_liters' => 2500.00,
                'species'       => 'Tilapia nilótica',
                'is_active'     => true,
            ],
            [
                'name'          => 'Estanque Norte',
                'description'   => 'Estanque exterior de cría',
                'volume_liters' => 5000.00,
                'species'       => 'Trucha arco iris',
                'is_active'     => true,
            ],
            [
                'name'          => 'Tanque de Cuarentena',
                'description'   => 'Para peces nuevos o enfermos',
                'volume_liters' => 500.00,
                'species'       => 'Mixto',
                'is_active'     => false,
            ],
        ];

        foreach ($aquariums as $data) {
            $admin->aquariums()->firstOrCreate(['name' => $data['name']], $data);
        }

        $this->command->info('✓ ' . count($aquariums) . ' acuarios creados.');
    }
}
