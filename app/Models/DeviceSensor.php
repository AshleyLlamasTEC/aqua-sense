<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * MODELO: DeviceSensor
 * ─────────────────────────────────────────────────────────────────────────
 * La tabla de configuración de instancia — el corazón del sistema.
 *
 * Representa la unión física entre:
 *   - Un sensor específico (tipo: pH, temperatura, etc.)
 *   - Un dispositivo específico (ESP32 con ID X)
 *   - Un pin específico (GPIO34)
 *
 * Y define CÓMO debe comportarse ese sensor en ese contexto:
 *   - Cada cuánto medir (sample_interval_s)
 *   - Cómo corregir su deriva (calibration_offset, calibration_factor)
 *   - Qué umbrales generan alertas (→ alert_rules)
 *
 * Es el nodo central del grafo de relaciones:
 *   device ──< device_sensors >── sensor_types
 *                   │
 *                   ├──< telemetry_readings
 *                   ├──< alert_rules ──< alerts
 *                   └──< device_sensor_calibrations
 *
 * @property int    $id
 * @property int    $device_id
 * @property int    $sensor_type_id
 * @property string $pin
 * @property int    $sample_interval_s
 * @property float  $calibration_offset
 * @property float  $calibration_factor
 * @property bool   $is_active
 * ─────────────────────────────────────────────────────────────────────────
 */
class DeviceSensor extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'sensor_type_id',
        'pin',
        'sample_interval_s',
        'calibration_offset',
        'calibration_factor',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'calibration_offset' => 'decimal:4',
            'calibration_factor' => 'decimal:4',
            'is_active'          => 'boolean',
            'created_at'         => 'datetime',
            'updated_at'         => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * El dispositivo ESP32 al que pertenece este sensor.
     *
     * BelongsTo: la FK (device_id) está en ESTA tabla.
     * "Este sensor pertenece a un dispositivo."
     *
     * Uso:
     *   $deviceSensor->device             // objeto Device
     *   $deviceSensor->device->aquarium   // acuario donde está instalado
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * El tipo de sensor (catálogo: pH, temperatura, TDS, etc.).
     *
     * BelongsTo: la FK (sensor_type_id) está en ESTA tabla.
     * "Este sensor es de tipo X."
     *
     * Uso:
     *   $deviceSensor->sensorType->unit   // "pH", "°C", "ppm"
     *   $deviceSensor->sensorType->slug   // "ph", "temp", "tds"
     */
    public function sensorType(): BelongsTo
    {
        return $this->belongsTo(SensorType::class);
    }

    /**
     * Todas las lecturas de telemetría de este sensor.
     *
     * HasMany: la FK (device_sensor_id) está en telemetry_readings.
     * Esta es la relación de mayor volumen del sistema.
     *
     * IMPORTANTE: Siempre usar constraints de tiempo para no cargar
     * millones de registros:
     *
     * Uso:
     *   // MAL — puede cargar millones de filas
     *   $sensor->readings->all()
     *
     *   // BIEN — siempre acota por tiempo o cantidad
     *   $sensor->readings()->latest('recorded_at')->limit(100)->get()
     *   $sensor->readings()->whereBetween('recorded_at', [$from, $to])->get()
     */
    public function readings(): HasMany
    {
        return $this->hasMany(TelemetryReading::class);
    }

    /**
     * La lectura más reciente de este sensor.
     *
     * HasOne con orderBy — Eloquent genera un JOIN eficiente.
     * Uso:
     *   $sensor->latestReading           // objeto TelemetryReading o null
     *   $sensor->latestReading->value    // último valor medido
     */
    public function latestReading()
    {
        return $this->hasOne(TelemetryReading::class)
                    ->latestOfMany('recorded_at');
    }

    /**
     * Reglas de alerta configuradas para este sensor.
     *
     * Un sensor puede tener múltiples reglas (crítico bajo, advertencia alta, etc.)
     *
     * Uso:
     *   $sensor->alertRules                              // todas las reglas
     *   $sensor->alertRules()->where('is_active', true) // solo activas
     */
    public function alertRules(): HasMany
    {
        return $this->hasMany(AlertRule::class);
    }

    /**
     * Historial de calibraciones de este sensor.
     *
     * Uso:
     *   $sensor->calibrations()->latest()->first()  // última calibración
     */
    public function calibrations(): HasMany
    {
        return $this->hasMany(DeviceSensorCalibration::class);
    }

    // ══════════════════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Aplica la fórmula de calibración a un valor crudo.
     *
     * Fórmula: valor_real = (raw * factor) + offset
     *
     * Ejemplos:
     *   Sensor perfecto:   raw=7.0,  factor=1.0, offset=0.0  → 7.0
     *   Sensor con drift:  raw=6.85, factor=1.0, offset=0.15 → 7.0
     *   Sensor escalado:   raw=3.5,  factor=2.0, offset=0.0  → 7.0
     *
     * Uso en TelemetryService:
     *   $calibratedValue = $deviceSensor->applyCalibration($rawValue);
     */
    public function applyCalibration(float $rawValue): float
    {
        return ($rawValue * (float)$this->calibration_factor)
             + (float)$this->calibration_offset;
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
