<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: Alert
 * ─────────────────────────────────────────────────────────────────────────
 * Registra CADA EVENTO en que una regla fue violada.
 * Es el log de incidentes del sistema.
 *
 * Ciclo de vida de una alerta:
 *   DISPARADA  → resolved_at = NULL    (problema activo)
 *   RESUELTA   → resolved_at = timestamp (valor volvió al rango)
 *
 * Una alerta se resuelve de dos formas:
 *   1. Automáticamente: cuando la siguiente lectura ya no viola la regla
 *      (AlertEvaluationService::resolveActiveAlerts)
 *   2. Manualmente: el usuario pulsa "Resolver" en el dashboard
 *      (AlertController::resolve)
 *
 * Relaciones:
 *   belongsTo → AlertRule   (qué regla fue violada)
 *
 * Archivo: app/Models/Alert.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class Alert extends Model
{
    use HasFactory;

    /**
     * Usamos 'triggered_at' como timestamp de creación.
     * No existe updated_at — una alerta no se edita, solo se resuelve
     * actualizando resolved_at.
     */
    const CREATED_AT = 'triggered_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'alert_rule_id',
        'triggered_value',
        'severity',
        'triggered_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'triggered_value' => 'decimal:4',
            'triggered_at'    => 'datetime',
            'resolved_at'     => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * La regla de alerta que generó este evento.
     *
     * Con eager loading para evitar N+1 al listar alertas:
     *   Alert::with('alertRule.deviceSensor.sensorType')->get()
     *
     * Acceso típico para mostrar contexto en la UI:
     *   $alert->alertRule->name
     *   $alert->alertRule->deviceSensor->device->aquarium->name
     */
    public function alertRule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class);
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACCESSORS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Indica si la alerta sigue activa (sin resolver).
     *
     * Uso en el frontend (prop de Inertia):
     *   if ($alert->is_active) { // mostrar botón "Resolver" }
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->resolved_at === null;
    }

    // ══════════════════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Marca la alerta como resuelta con el timestamp actual.
     *
     * Uso en AlertController:
     *   $alert->resolve();
     *
     * Y en AlertEvaluationService cuando el valor vuelve al rango:
     *   Alert::where(...)->active()->each->resolve();
     */
    public function resolve(): void
    {
        $this->update(['resolved_at' => now()]);
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    /** Alertas sin resolver (resolved_at IS NULL). */
    public function scopeActive($query)
    {
        return $query->whereNull('resolved_at');
    }

    /** Alertas ya resueltas. */
    public function scopeResolved($query)
    {
        return $query->whereNotNull('resolved_at');
    }

    /** Solo alertas críticas. */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    /** Solo alertas de advertencia. */
    public function scopeWarning($query)
    {
        return $query->where('severity', 'warning');
    }
}
