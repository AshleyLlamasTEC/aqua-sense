<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: sensor_types
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Catálogo maestro de hardware — diccionario de los TIPOS de sensores
 *   disponibles en el mercado. Se puebla una sola vez (con seeders) y
 *   raramente cambia. No almacena instancias físicas, sino definiciones.
 *
 *   Ejemplos de registros:
 *   ┌────────────────┬──────┬──────────┬────────┬──────────┐
 *   │ name           │ slug │ unit     │ op_min │ op_max   │
 *   ├────────────────┼──────┼──────────┼────────┼──────────┤
 *   │ pH             │ ph   │ pH       │ 0.00   │ 14.00    │
 *   │ Temperatura    │ temp │ °C       │ -10.00 │ 85.00    │
 *   │ TDS            │ tds  │ ppm      │ 0.00   │ 9999.00  │
 *   │ Turbidez       │ turb │ NTU      │ 0.00   │ 4000.00  │
 *   │ Oxígeno Disuel │ do   │ mg/L     │ 0.00   │ 20.00    │
 *   └────────────────┴──────┴──────────┴────────┴──────────┘
 *
 * Relaciones:
 *   - hasMany → device_sensors  (muchas instancias físicas de este tipo)
 *
 * Diferencia clave:
 *   sensor_types = el MODELO del sensor (ej: "sensor de pH Atlas EZO")
 *   device_sensors = la INSTANCIA física conectada a un pin de un ESP32
 *
 * Notas de diseño:
 *   - slug: identificador legible por máquinas (ej: "ph", "temperature_c").
 *     Permite referenciar en código sin depender del ID numérico, que puede
 *     variar entre entornos (local vs producción).
 *   - op_min / op_max: rango operativo del HARDWARE (límites del sensor).
 *   - safe_min / safe_max: rango BIOLÓGICO seguro para los especímenes.
 *     Un sensor de temperatura opera entre -10°C y 85°C (op_*), pero
 *     el rango seguro para tilapia es 25°C–30°C (safe_*).
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensor_types', function (Blueprint $table) {
            $table->id();

            $table->string('name');           // Nombre legible: "Sensor de pH"
            $table->string('slug')->unique(); // Identificador de máquina: "ph"
            $table->string('unit');           // Unidad de medida: "pH", "°C", "ppm", "NTU"
            $table->text('description')->nullable();

            // Rango operativo del HARDWARE del sensor
            // precision=8, scale=4 → soporta valores como 9999.9999
            $table->decimal('op_min', 8, 4)->nullable();   // Mínimo del sensor
            $table->decimal('op_max', 8, 4)->nullable();   // Máximo del sensor

            // Rango seguro para los ESPECÍMENES (puede diferir por especie)
            // Estos son los defaults — cada device_sensor puede sobrescribirlos
            // mediante sus alert_rules
            $table->decimal('safe_min', 8, 4)->nullable(); // Mínimo biológico sugerido
            $table->decimal('safe_max', 8, 4)->nullable(); // Máximo biológico sugerido

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_types');
    }
};
