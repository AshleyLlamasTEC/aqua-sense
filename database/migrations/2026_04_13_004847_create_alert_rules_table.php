<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: alert_rules
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Define las CONDICIONES que deben cumplirse para que el sistema genere
 *   una alerta. Separa la "definición" del "evento" — esta tabla describe
 *   cuándo alertar; la tabla `alerts` registra cada vez que ocurrió.
 *
 *   Ejemplo de regla:
 *   "Para el sensor de pH del Acuario Principal, alertar si el valor sale
 *    del rango 6.5–8.5, pero no más de una alerta cada 30 minutos."
 *
 * Relaciones:
 *   - belongsTo → device_sensors   (a qué sensor aplica esta regla)
 *   - hasMany   → alerts            (eventos generados por esta regla)
 *
 * Por qué no está en device_sensors directamente:
 *   Un sensor puede tener MÚLTIPLES reglas. Por ejemplo:
 *   - Regla 1: pH < 6.0 → CRÍTICO (alerta inmediata)
 *   - Regla 2: pH < 6.5 → ADVERTENCIA (alerta cada 30 min)
 *   - Regla 3: pH > 9.0 → CRÍTICO
 *   Si los umbrales vivieran en device_sensors, solo habría una regla posible.
 *
 * Lógica de evaluación (en AlertEvaluationService):
 *   1. Llega una lectura nueva con value = X
 *   2. Se buscan todas las alert_rules activas para ese device_sensor_id
 *   3. Para cada regla: si X < min_value OR X > max_value → viola la regla
 *   4. Se verifica cooldown: ¿hubo una alerta de esta regla en los últimos
 *      cooldown_min minutos?
 *   5. Si no hubo cooldown → crear registro en `alerts` y notificar
 *
 * Notas de diseño:
 *   - cooldown_min: evita el spam de alertas. Si el pH baja a 5.9 y el
 *     sensor mide cada 60s, sin cooldown recibirías una alerta por minuto.
 *   - min_value y max_value ambos nullable: permite reglas de solo límite
 *     inferior ("alerta si temperatura < 15°C") sin definir máximo.
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alert_rules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('device_sensor_id')
                  ->constrained('device_sensors')
                  ->cascadeOnDelete();

            // Nombre descriptivo de la regla para mostrar en UI
            $table->string('name'); // Ej: "pH Crítico Bajo", "Temperatura Alta"

            // Umbral inferior — NULL = sin límite inferior
            $table->decimal('min_value', 10, 4)->nullable();

            // Umbral superior — NULL = sin límite superior
            $table->decimal('max_value', 10, 4)->nullable();

            // Minutos de espera mínima entre alertas de la misma regla
            // Default 30 = no más de 1 alerta cada 30 minutos por esta regla
            $table->unsignedSmallInteger('cooldown_min')->default(30);

            // false = regla desactivada temporalmente sin eliminarla
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Índice para la evaluación en tiempo real:
            // "dame todas las reglas activas del sensor X"
            $table->index(['device_sensor_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alert_rules');
    }
};
