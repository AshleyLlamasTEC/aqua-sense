<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// ══════════════════════════════════════════════════════════════════════════
// MODELO: TelemetryReading
// ══════════════════════════════════════════════════════════════════════════
/**
 * Una lectura individual de un sensor en un momento específico.
 * Modelo inmutable — nunca se actualiza, solo se crea y consulta.
 *
 * Regla de oro: NUNCA cargar sin filtros de tiempo o límite.
 * Un DeviceSensor activo puede generar 1 lectura/min = 525,600 filas/año.
 *
 * quality_flag:
 *   0 = OK      → mostrar en gráficas
 *   1 = DUDOSO  → mostrar con indicador visual de advertencia
 *   2 = ERROR   → ocultar, pero conservar para auditoría
 *
 * @property int    $id
 * @property int    $device_sensor_id
 * @property float  $value             (ya calibrado)
 * @property string|null $raw_value    (valor crudo del sensor)
 * @property int    $quality_flag
 * @property \Carbon\Carbon $recorded_at
 */
class TelemetryReading extends Model
{
    use HasFactory;

    /**
     * Sin updated_at — las lecturas son inmutables.
     * UPDATED_AT = null le dice a Eloquent que no gestione esa columna.
     */
    const UPDATED_AT = null;

    /**
     * created_at tampoco existe — usamos recorded_at.
     * Redefinimos CREATED_AT para que Eloquent use nuestra columna custom.
     */
    const CREATED_AT = 'recorded_at';

    protected $fillable = [
        'device_sensor_id',
        'value',
        'raw_value',
        'quality_flag',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'value'       => 'decimal:4',
            'quality_flag'=> 'integer',
            'recorded_at' => 'datetime',
        ];
    }

    // ── Relaciones ─────────────────────────────────────────────────────

    /**
     * El sensor que generó esta lectura.
     *
     * Uso habitual (carga con eager loading para evitar N+1):
     *   TelemetryReading::with('deviceSensor.sensorType')
     *       ->whereBetween('recorded_at', [$from, $to])
     *       ->get()
     */
    public function deviceSensor(): BelongsTo
    {
        return $this->belongsTo(DeviceSensor::class);
    }

    // ── Scopes ─────────────────────────────────────────────────────────

    /** Solo lecturas válidas para gráficas */
    public function scopeValid($query)
    {
        return $query->where('quality_flag', 0);
    }

    /** Lecturas en un rango de tiempo */
    public function scopeInPeriod($query, $from, $to)
    {
        return $query->whereBetween('recorded_at', [$from, $to]);
    }

    /** Lecturas recientes (últimas N) */
    public function scopeRecent($query, int $limit = 100)
    {
        return $query->orderByDesc('recorded_at')->limit($limit);
    }
}


// ══════════════════════════════════════════════════════════════════════════
// MODELO: AlertRule
// ══════════════════════════════════════════════════════════════════════════
/**
 * Define CUÁNDO generar una alerta para un sensor.
 * Puede haber múltiples reglas por sensor con distintos umbrales y severidad.
 *
 * @property int    $id
 * @property int    $device_sensor_id
 * @property string $name
 * @property float|null $min_value
 * @property float|null $max_value
 * @property int    $cooldown_min
 * @property bool   $is_active
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
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_value'  => 'decimal:4',
            'max_value'  => 'decimal:4',
            'is_active'  => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ── Relaciones ─────────────────────────────────────────────────────

    public function deviceSensor(): BelongsTo
    {
        return $this->belongsTo(DeviceSensor::class);
    }

    /**
     * Todos los eventos que esta regla ha generado.
     *
     * Uso:
     *   $rule->alerts()->whereNull('resolved_at')->get()  // alertas activas
     *   $rule->alerts()->latest('triggered_at')->first()  // última alerta
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    // ── Métodos de negocio ─────────────────────────────────────────────

    /**
     * Evalúa si un valor viola esta regla.
     *
     * Uso en AlertEvaluationService:
     *   if ($rule->isViolatedBy($reading->value)) { ... }
     */
    public function isViolatedBy(float $value): bool
    {
        if ($this->min_value !== null && $value < (float)$this->min_value) {
            return true;
        }
        if ($this->max_value !== null && $value > (float)$this->max_value) {
            return true;
        }
        return false;
    }

    /**
     * Verifica si está en período de cooldown (no enviar nueva alerta).
     *
     * Consulta la última alerta de esta regla y compara con el cooldown.
     */
    public function isInCooldown(): bool
    {
        $lastAlert = $this->alerts()
                          ->latest('triggered_at')
                          ->first();

        if (! $lastAlert) return false;

        return $lastAlert->triggered_at->gt(
            now()->subMinutes($this->cooldown_min)
        );
    }

    // ── Scopes ─────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}


// ══════════════════════════════════════════════════════════════════════════
// MODELO: Alert
// ══════════════════════════════════════════════════════════════════════════
/**
 * Registro de un evento de alerta ocurrido.
 * Una regla puede generar cientos de alertas a lo largo del tiempo.
 *
 * Ciclo de vida:
 *   DISPARADA (resolved_at = null) → RESUELTA (resolved_at = timestamp)
 *
 * @property int    $id
 * @property int    $alert_rule_id
 * @property float  $triggered_value
 * @property string $severity        info|warning|critical
 * @property \Carbon\Carbon $triggered_at
 * @property \Carbon\Carbon|null $resolved_at
 */
class Alert extends Model
{
    use HasFactory;

    // Sin updated_at — solo triggered_at y resolved_at
    const UPDATED_AT = null;
    const CREATED_AT = 'triggered_at';

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

    // ── Relaciones ─────────────────────────────────────────────────────

    public function alertRule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class);
    }

    // ── Accesores ─────────────────────────────────────────────────────

    /** true si la alerta sigue activa (sin resolver) */
    public function getIsActiveAttribute(): bool
    {
        return $this->resolved_at === null;
    }

    // ── Scopes ─────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->whereNull('resolved_at');
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    // ── Métodos de negocio ─────────────────────────────────────────────

    /** Marca la alerta como resuelta */
    public function resolve(): void
    {
        $this->update(['resolved_at' => now()]);
    }
}


// ══════════════════════════════════════════════════════════════════════════
// MODELO: DeviceSensorCalibration
// ══════════════════════════════════════════════════════════════════════════
/**
 * Historial de cambios de calibración de un sensor.
 * Se inserta automáticamente desde el Observer de DeviceSensor.
 *
 * @property int   $id
 * @property int   $device_sensor_id
 * @property float $old_offset
 * @property float $new_offset
 * @property string|null $notes
 */
class DeviceSensorCalibration extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_sensor_id',
        'old_offset',
        'new_offset',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'old_offset' => 'decimal:4',
            'new_offset' => 'decimal:4',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function deviceSensor(): BelongsTo
    {
        return $this->belongsTo(DeviceSensor::class);
    }
}


// ══════════════════════════════════════════════════════════════════════════
// MODELO: UserDevice  (tabla pivot con columnas extra)
// ══════════════════════════════════════════════════════════════════════════
/**
 * Acceso de un usuario a un dispositivo con un rol específico.
 *
 * Aunque devices y users tienen relación BelongsToMany, este modelo
 * existe explícitamente porque la tabla pivot tiene columna extra (role)
 * y es útil consultarla directamente en ciertos contextos.
 *
 * Alternativa de uso: $user->devices()->wherePivot('role', 'owner')
 * Este modelo: UserDevice::where('user_id', $id)->with('device')->get()
 *
 * @property int    $id
 * @property int    $user_id
 * @property int    $device_id
 * @property string $role       owner|viewer
 */
class UserDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device_id',
        'role',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    // ── Scopes ─────────────────────────────────────────────────────────

    public function scopeOwners($query)
    {
        return $query->where('role', 'owner');
    }

    public function scopeViewers($query)
    {
        return $query->where('role', 'viewer');
    }
}
