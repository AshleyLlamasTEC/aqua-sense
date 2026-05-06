<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * UserSeeder
 * ─────────────────────────────────────────────────────────────────────────
 * Crea usuarios de prueba con credenciales conocidas para desarrollo.
 *
 * Usuarios creados:
 *   admin@aqua.test / password  → usuario principal para el demo
 *   demo@aqua.test  / password  → usuario secundario para probar sharing
 *
 * Archivo: database/seeders/UserSeeder.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@aqua.test'],
            [
                'name'              => 'Administrador',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'demo@aqua.test'],
            [
                'name'              => 'Usuario Demo',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✓ Usuarios de prueba creados: admin@aqua.test / password');
    }
}
