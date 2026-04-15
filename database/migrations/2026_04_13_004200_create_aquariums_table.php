<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: aquariums
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Representa la entidad física de un acuario o estanque. Actúa como
 *   agrupador lógico entre el usuario y sus dispositivos. En la UI es
 *   la unidad principal que el usuario visualiza en el dashboard:
 *   "Acuario Principal", "Estanque Norte", etc.
 *
 * Posición en la jerarquía:
 *   users → aquariums → devices → device_sensors → telemetry_readings
 *
 * Relaciones:
 *   - belongsTo → users      (dueño del acuario)
 *   - hasMany   → devices    (dispositivos ESP32 instalados en este acuario)
 *
 * Notas de diseño:
 *   - volume_liters: permite cálculos de dosificación o alertas basadas
 *     en volumen (ej: "la temperatura subió 2°C en 10 litros").
 *   - species: texto libre — "Trucha arco iris", "Tilapia", etc.
 *     En una versión avanzada podría ser FK a una tabla de especies
 *     con rangos ideales predefinidos.
 *   - is_active: soft-disable sin eliminar datos históricos.
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aquariums', function (Blueprint $table) {
            $table->id();

            // FK a users — constrained() = FK + índice + cascade delete automático
            // Si el usuario se elimina, sus acuarios también se eliminan.
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->string('name');                          // "Acuario Principal"
            $table->text('description')->nullable();          // Descripción libre
            $table->decimal('volume_liters', 8, 2)->nullable(); // Volumen en litros (ej: 1500.50)
            $table->string('species')->nullable();            // Especie principal cultivada

            // true = monitoreando activamente | false = pausado/inactivo
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Índice en user_id para acelerar: "Dame todos los acuarios del usuario X"
            // constrained() ya crea el índice, pero lo dejamos explícito como documentación
            // (Laravel lo omite si ya existe — no genera error)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aquariums');
    }
};
