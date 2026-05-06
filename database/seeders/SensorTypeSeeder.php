<?php

namespace Database\Seeders;

use App\Models\SensorType;
use Illuminate\Database\Seeder;

/**
 * SensorTypeSeeder
 * ─────────────────────────────────────────────────────────────────────────
 * Puebla el catálogo de tipos de sensores disponibles en el sistema.
 * Estos datos son ESTÁTICOS — los provee el sistema, no el usuario.
 * Se ejecuta en todos los entornos (producción y desarrollo).
 *
 * Campos:
 *   slug      → identificador de máquina (nunca cambiar en producción)
 *   op_min/max → rango operativo del HARDWARE del sensor
 *   safe_min/max → rango BIOLÓGICO seguro para los especímenes
 *
 * Archivo: database/seeders/SensorTypeSeeder.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class SensorTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name'        => 'pH',
                'slug'        => 'ph',
                'unit'        => 'pH',
                'description' => 'Medición de acidez/alcalinidad del agua. Escala 0-14. Crítico para la salud de peces y plantas.',
                'op_min'      => 0.0,
                'op_max'      => 14.0,
                'safe_min'    => 6.5,   // Mínimo para acuaponía general
                'safe_max'    => 8.5,   // Máximo para acuaponía general
            ],
            [
                'name'        => 'Temperatura',
                'slug'        => 'temperature',
                'unit'        => '°C',
                'description' => 'Temperatura del agua. Crítico: determina metabolismo de peces y actividad bacteriana.',
                'op_min'      => -10.0, // Límite sensor DS18B20
                'op_max'      => 85.0,  // Límite sensor DS18B20
                'safe_min'    => 18.0,
                'safe_max'    => 30.0,
            ],
            [
                'name'        => 'TDS (Sólidos Disueltos)',
                'slug'        => 'tds',
                'unit'        => 'ppm',
                'description' => 'Total de sólidos disueltos. Indica concentración de nutrientes, sales y minerales.',
                'op_min'      => 0.0,
                'op_max'      => 9999.0,
                'safe_min'    => 150.0,
                'safe_max'    => 800.0,
            ],
            [
                'name'        => 'Turbidez',
                'slug'        => 'turbidity',
                'unit'        => 'NTU',
                'description' => 'Claridad del agua. Alto NTU indica partículas en suspensión — puede indicar algas o desechos.',
                'op_min'      => 0.0,
                'op_max'      => 4000.0,
                'safe_min'    => 0.0,
                'safe_max'    => 100.0,
            ],
            [
                'name'        => 'Oxígeno Disuelto',
                'slug'        => 'dissolved_oxygen',
                'unit'        => 'mg/L',
                'description' => 'Concentración de oxígeno en agua. Parámetro más crítico — peces mueren si cae <3 mg/L.',
                'op_min'      => 0.0,
                'op_max'      => 20.0,
                'safe_min'    => 5.0,   // Mínimo vital para peces
                'safe_max'    => 15.0,  // Supersaturación puede causar embolia gaseosa
            ],
            [
                'name'        => 'Conductividad Eléctrica',
                'slug'        => 'ec',
                'unit'        => 'μS/cm',
                'description' => 'Conductividad eléctrica del agua. Correlaciona con TDS y concentración de nutrientes.',
                'op_min'      => 0.0,
                'op_max'      => 10000.0,
                'safe_min'    => 200.0,
                'safe_max'    => 1500.0,
            ],
            [
                'name'        => 'Nivel de Agua',
                'slug'        => 'water_level',
                'unit'        => 'cm',
                'description' => 'Nivel del agua en el tanque. Depende de las dimensiones del contenedor específico.',
                'op_min'      => 0.0,
                'op_max'      => 500.0,
                'safe_min'    => null,  // Configurar en alert_rules por instalación
                'safe_max'    => null,
            ],
            [
                'name'        => 'Amonio (NH₃/NH₄⁺)',
                'slug'        => 'ammonia',
                'unit'        => 'mg/L',
                'description' => 'Concentración de amonio. Tóxico para peces en forma no ionizada (NH₃). Producido por desechos.',
                'op_min'      => 0.0,
                'op_max'      => 50.0,
                'safe_min'    => 0.0,
                'safe_max'    => 1.0,   // >1 mg/L es estresante, >3 mg/L letal
            ],
        ];

        foreach ($types as $type) {
            // updateOrCreate evita duplicados al re-ejecutar el seeder
            // Busca por slug (único), actualiza o crea con el resto de campos
            SensorType::updateOrCreate(
                ['slug' => $type['slug']],
                $type
            );
        }

        $this->command->info('✓ ' . count($types) . ' tipos de sensores en el catálogo.');
    }
}
