<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model: AlertRule
 * ─────────────────────────────────────────────────────────────────────────
 * Define CUÁNDO generar una alerta para un sensor específico.
 * Una regla describe la CONDICIÓN; la tabla alerts registra cada
 * vez que esa condición fue violada.
 *
 * Un sensor puede tener MÚLTIPLES reglas con distintos umbrales:
 *   - Regla 1: pH < 6.0   → severity=critical (acción inmediata)
 *   - Regla 2: pH < 6.5   → severity=warning  (vigilar de cerca)
 *   - Regla 3: pH > 9.0   → severity=critical
 *
 * Lógica de evaluación (ver AlertEvaluationService):
 *   Si value < min_value  OR  value > max_value  → regla violada
 *   Si violada Y sin cooldown activo → crear Alert y notificar
 *
 * Relaciones:
 *   belongsTo → DeviceSensor   (a qué sensor aplica)
 *   hasMany   → Alert          (eventos generados por esta regla)
 *
 * Archivo: app/Models/AlertRule.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class AlertRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_sensor_id',
        'name',
        'min_value',
        'max_value',
        'cooldown_min',
        'severity',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_value'    => 'decimal:4',
            'max_value'    => 'decimal:4',
            'cooldown_min' => 'integer',
            'is_active'    => 'boolean',
            'created_at'   => 'datetime',
            'updated_at'   => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * El sensor al que aplica esta regla.
     *
     * Uso:
     *   $rule->deviceSensor->device->aquarium->user  → dueño para notificar
     */
    public function deviceSensor(): BelongsTo
    {
        return $this->belongsTo(DeviceSensor::class);
    }

    /**
     * Todos los eventos de alerta generados por esta regla.
     *
     * Uso:
     *   $rule->alerts()->whereNull('resolved_at')->get()  // alertas activas
     *   $rule->alerts()->latest('triggered_at')->first()  // última alerta
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    // ══════════════════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Evalúa si un valor viola esta regla.
     *
     * Lógica OR: cualquiera de los umbrales que falle dispara la alerta.
     *   min_value=null → sin límite inferior
     *   max_value=null → sin límite superior
     *
     * Uso en AlertEvaluationService:
     *   if ($rule->isViolatedBy($reading->value)) { ... }
     */
    public function isViolatedBy(float $value): bool
    {
        if ($this->min_value !== null && $value < (float) $this->min_value) {
            return true;
        }
        if ($this->max_value !== null && $value > (float) $this->max_value) {
            return true;
        }
        return false;
    }

    /**
     * Verifica si la regla está en período de cooldown.
     *
     * Cooldown: tiempo mínimo entre alertas consecutivas de la MISMA regla.
     * Evita el spam: sin cooldown, un pH de 5.9 con 60 lecturas/hora
     * generaría 60 notificaciones por email en una hora.
     *
     * Consulta la última alerta generada y compara su timestamp
     * con ahora menos el período de cooldown.
     */
    public function isInCooldown(): bool
    {
        $lastAlert = $this->alerts()
                          ->latest('triggered_at')
                          ->first();

        if (! $lastAlert) {
            return false; // Nunca ha disparado → sin cooldown
        }

        // ¿La última alerta fue hace menos de cooldown_min minutos?
        return $lastAlert->triggered_at->gt(
            now()->subMinutes($this->cooldown_min)
        );
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    /** Solo reglas activas. */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
