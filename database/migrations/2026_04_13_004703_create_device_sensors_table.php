<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: device_sensors
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Es la tabla de configuración de instancia — la más importante del
 *   sistema junto con telemetry_readings. Define CÓMO un sensor específico
 *   está conectado a un dispositivo específico.
 *
 *   Si sensor_types es el "catálogo del fabricante", device_sensors es
 *   la "ficha de instalación" de ese sensor en ese ESP32 concreto.
 *
 * Analogía:
 *   sensor_types  = el modelo de auto (Toyota Corolla 2024)
 *   device_sensors = tu Toyota Corolla con matrícula XYZ, calibrado para
 *                    la altitud de tu ciudad, con intervalos de revisión
 *                    ajustados a tu uso particular.
 *
 * Relaciones:
 *   - belongsTo → devices          (a qué ESP32 pertenece)
 *   - belongsTo → sensor_types     (qué tipo de sensor es)
 *   - hasMany   → telemetry_readings  (todas las lecturas de esta instancia)
 *   - hasMany   → alert_rules         (umbrales de alerta configurados)
 *   - hasMany   → device_sensor_calibrations (historial de calibraciones)
 *
 * Calibración (fórmula aplicada en el backend antes de guardar):
 *   valor_real = (valor_raw * calibration_factor) + calibration_offset
 *
 *   Ejemplo sensor de pH con drift:
 *     raw = 6.80, factor = 1.0, offset = +0.15 → real = 6.95
 *
 *   Los valores en telemetry_readings se guardan YA calibrados.
 *   raw_value guarda el valor original para auditoría.
 *
 * Notas de diseño:
 *   - pin: referencia al GPIO del ESP32 (ej: "GPIO34", "A0", "I2C_0x63").
 *     Es string para soportar distintos protocolos (analógico, I2C, UART).
 *   - sample_interval_s: el ESP32 lee este valor del servidor al arrancar
 *     (o periódicamente) para saber cada cuántos segundos medir.
 *   - is_active: permite deshabilitar un sensor roto sin borrar su historial.
 *   - unique(['device_id', 'pin']): un pin no puede tener dos sensores.
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_sensors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('device_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('sensor_type_id')
                  ->constrained('sensor_types')  // nombre explícito porque no sigue la convención
                  ->restrictOnDelete();           // No eliminar el tipo si hay instancias usando lo

            // Pin físico donde está conectado el sensor en el ESP32
            // Ejemplos: "GPIO34", "GPIO35", "I2C_0x63", "UART_1"
            $table->string('pin', 20);

            // Cada cuántos segundos el ESP32 debe tomar una lectura de este sensor
            // Default 60 = una lectura por minuto
            $table->unsignedSmallInteger('sample_interval_s')->default(60);

            // Parámetros de calibración
            // valor_real = (raw * factor) + offset
            $table->decimal('calibration_offset', 8, 4)->default(0.0000);
            $table->decimal('calibration_factor', 8, 4)->default(1.0000);

            // false = sensor desconectado o en mantenimiento
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Un mismo pin no puede tener dos sensores asignados en el mismo dispositivo
            $table->unique(['device_id', 'pin']);

            // Índice para la query frecuente al cargar el panel de un dispositivo
            $table->index(['device_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_sensors');
    }
};
