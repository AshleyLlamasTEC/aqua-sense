<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: alerts
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Registro histórico de CADA EVENTO de alerta que ocurrió. Mientras
 *   alert_rules define "cuándo alertar", esta tabla registra "cuándo
 *   efectivamente ocurrió y qué valor lo disparó".
 *
 *   Es el log de incidentes del sistema — permite ver el historial
 *   de problemas por acuario, por sensor, por período de tiempo.
 *
 * Relaciones:
 *   - belongsTo → alert_rules   (qué regla fue violada)
 *
 * Ciclo de vida de una alerta:
 *   1. DISPARADA: llega lectura fuera de rango → se crea el registro
 *      con triggered_at = now(), resolved_at = NULL
 *   2. ACTIVA: mientras las lecturas sigan fuera de rango
 *   3. RESUELTA: cuando una lectura vuelve al rango → se actualiza
 *      resolved_at = now()
 *
 *   Una alerta "activa" es: WHERE resolved_at IS NULL
 *
 * Severidad:
 *   El sistema podría tener reglas con distinta gravedad:
 *   - 'info'     → aviso informativo (ej: pH ligeramente bajo)
 *   - 'warning'  → requiere atención pronto
 *   - 'critical' → acción inmediata requerida (ej: temperatura letal)
 *
 *   La severidad se define en alert_rules y se copia aquí al crear
 *   la alerta para tener un snapshot histórico preciso (si cambia
 *   la regla después, el historial sigue siendo correcto).
 *
 * Notas de diseño:
 *   - triggered_value: el valor exacto que disparó la alerta. Importante
 *     para el historial — "el pH llegó a 5.2 el 15 de marzo".
 *   - No tiene updated_at porque resolved_at cumple esa función.
 *   - El índice en (alert_rule_id, resolved_at) acelera la query de
 *     "alertas activas" y "historial de la regla X".
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('alert_rule_id')
                  ->constrained('alert_rules')
                  ->cascadeOnDelete();

            // Valor exacto que violó el umbral (snapshot histórico)
            $table->decimal('triggered_value', 10, 4);

            // Severidad copiada desde la regla al momento del disparo
            // (snapshot — si la regla cambia después, el historial es correcto)
            $table->enum('severity', ['info', 'warning', 'critical'])
                  ->default('warning');

            // Cuándo ocurrió la violación del umbral
            $table->timestamp('triggered_at')->useCurrent();

            // Cuándo el valor volvió al rango normal — NULL = alerta aún activa
            $table->timestamp('resolved_at')->nullable();

            // Solo triggered_at como timestamp — no timestamps() completo
            // porque no necesitamos created_at/updated_at separados

            // ─── Índices ────────────────────────────────────────────────
            // Query más frecuente: "alertas activas" (resolved_at IS NULL)
            $table->index(['alert_rule_id', 'resolved_at']);

            // Para el dashboard: "todas las alertas críticas activas del sistema"
            $table->index(['severity', 'resolved_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
