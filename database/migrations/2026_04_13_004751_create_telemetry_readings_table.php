<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: telemetry_readings
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   El repositorio de datos masivos del sistema. Cada fila es una lectura
 *   individual de un sensor en un momento específico. Es la tabla que más
 *   crecerá con el tiempo y la que más se consultará.
 *
 *   Estimación de volumen:
 *   - 10 dispositivos × 5 sensores × 1 lectura/min = 50 filas/min
 *   - = 72,000 filas/día = ~26 millones/año por 10 dispositivos.
 *   - Con 100 dispositivos → 260 millones de filas al año.
 *
 * Relaciones:
 *   - belongsTo → device_sensors   (qué sensor generó esta lectura)
 *
 * Por qué NO tiene updated_at:
 *   Las lecturas de sensores son INMUTABLES — representan un hecho físico
 *   ocurrido en el pasado. Nunca se editan. Omitir updated_at ahorra
 *   espacio y evita actualizaciones accidentales.
 *
 * Estrategia de índices (crítica para performance):
 *   La query más común es: "dame las últimas N lecturas del sensor X
 *   entre la fecha A y la fecha B". El índice compuesto (device_sensor_id,
 *   recorded_at) cubre exactamente esa consulta.
 *
 *   Orden DESC en el índice porque casi siempre queremos los datos
 *   más RECIENTES primero.
 *
 * quality_flag (bandera de calidad):
 *   Permite filtrar lecturas defectuosas en las gráficas sin eliminarlas.
 *   0 = OK        → lectura normal, mostrar en gráficas
 *   1 = DUDOSO    → posible error de calibración, mostrar con advertencia
 *   2 = ERROR     → lectura inválida (sensor desconectado, valor fuera de
 *                   rango físico del hardware), ocultar en gráficas
 *
 * raw_value:
 *   El valor tal como lo reportó el ESP32 ANTES de aplicar calibración.
 *   Se guarda para auditoría y para recalibrar históricamente si los
 *   parámetros de calibración cambian.
 *
 * Optimizaciones futuras (cuando el volumen sea muy alto):
 *   1. Particionar por rango de fecha: ALTER TABLE ... PARTITION BY RANGE
 *      En Laravel no hay soporte nativo — se hace con SQL raw en el seeder
 *      o con una migración especializada.
 *   2. Tabla de agregados por hora (telemetry_hourly_aggregates) con
 *      AVG, MIN, MAX para consultas de rangos amplios (> 7 días).
 *   3. En producción: considerar TimescaleDB (extensión PostgreSQL)
 *      o InfluxDB como complemento para series de tiempo.
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telemetry_readings', function (Blueprint $table) {
            // id sin unsignedBigInteger explícito — $table->id() lo genera
            // Para volúmenes > 1 billón considerar PARTITION BY para no
            // depender del autoincrement secuencial
            $table->id();

            $table->foreignId('device_sensor_id')
                  ->constrained('device_sensors')
                  ->cascadeOnDelete(); // Si se elimina el sensor, sus lecturas también

            // Valor calibrado y listo para mostrar al usuario
            // precision=10, scale=4 soporta valores como 9999.9999
            $table->decimal('value', 10, 4);

            // Valor crudo del ADC o protocolo del sensor, antes de calibración
            // String porque algunos sensores devuelven formato especial ("6.80pH")
            $table->string('raw_value', 50)->nullable();

            // 0=OK, 1=Dudoso, 2=Error — tinyInteger = 1 byte (vs 4 de integer)
            $table->tinyInteger('quality_flag')->default(0)->unsigned();

            // El timestamp de CUÁNDO ocurrió la medición física en el ESP32
            // Diferente de created_at (cuándo llegó al servidor)
            // useCurrent() pone el valor por defecto como NOW() en MySQL
            $table->timestamp('recorded_at')->useCurrent();

            // NO $table->timestamps() — las lecturas son inmutables
            // Solo guardamos recorded_at, no created_at ni updated_at

            // ─── Índices ────────────────────────────────────────────────
            // Índice principal: cubre "SELECT * WHERE device_sensor_id = X
            // AND recorded_at BETWEEN A AND B ORDER BY recorded_at DESC"
            $table->index(['device_sensor_id', 'recorded_at']);

            // Índice para filtrar lecturas problemáticas:
            // "dame las lecturas con errores de todos los sensores hoy"
            $table->index(['quality_flag', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_readings');
    }
};
