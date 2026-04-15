<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: user_devices  (tabla pivot con columnas extra)
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Implementa el sistema de permisos compartidos. Un dispositivo es
 *   "propiedad" del usuario que lo creó (owner), pero puede ser compartido
 *   con otros usuarios en modo solo lectura (viewer).
 *
 *   Esto permite escenarios como:
 *   - Empresa con múltiples operadores que monitorean los mismos estanques.
 *   - Técnico de mantenimiento con acceso temporal a un dispositivo.
 *   - Investigador con acceso de lectura a datos de producción.
 *
 * Por qué es tabla pivot y no solo un campo en devices:
 *   Un campo owner_id en devices solo permitiría un dueño. Esta tabla
 *   permite N usuarios con distintos roles por dispositivo (relación M:N).
 *
 * Relaciones:
 *   - belongsTo → users    (quién tiene el acceso)
 *   - belongsTo → devices  (a qué dispositivo)
 *
 * Roles disponibles:
 *   - 'owner'  → creó el dispositivo, puede editarlo y eliminarlo
 *   - 'viewer' → solo puede leer datos y ver gráficas
 *   (En el futuro podría agregarse 'operator' con permisos intermedios)
 *
 * Notas de diseño:
 *   - unique(['user_id', 'device_id']): un usuario no puede tener dos roles
 *     en el mismo dispositivo simultáneamente.
 *   - Laravel reconoce esta tabla como pivot si tiene exactamente las FKs
 *     en orden alfabético (device_id, user_id), pero al tener la columna
 *     extra `role` necesitamos withPivot() en el modelo.
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('device_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // Rol del usuario sobre este dispositivo
            $table->enum('role', ['owner', 'viewer'])->default('viewer');

            $table->timestamps();

            // Un usuario solo puede tener UN rol por dispositivo
            $table->unique(['user_id', 'device_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
