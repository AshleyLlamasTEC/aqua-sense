<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: TelemetryReading
 * ─────────────────────────────────────────────────────────────────────────
 * Representa UNA lectura de un sensor en un instante de tiempo.
 * Es el modelo de mayor volumen del sistema — puede acumular decenas
 * de millones de filas al año con múltiples dispositivos activos.
 *
 * REGLA FUNDAMENTAL: nunca cargar sin filtros de tiempo o LIMIT.
 *   MAL:  $sensor->readings()->get()         → puede traer millones de filas
 *   BIEN: $sensor->readings()->recent(100)->get()
 *   BIEN: $sensor->readings()->inPeriod($from, $to)->get()
 *
 * Inmutabilidad:
 *   Las lecturas representan hechos físicos ocurridos en el pasado.
 *   Nunca se editan. Por eso se desactivan created_at/updated_at
 *   estándar y se usa sólo recorded_at.
 *
 * quality_flag:
 *   0 → OK      | Lectura válida, mostrar en gráficas
 *   1 → DUDOSO  | Posible deriva de calibración, mostrar con advertencia
 *   2 → ERROR   | Fuera del rango operativo del hardware, ocultar
 *
 * Relaciones:
 *   belongsTo → DeviceSensor   (qué sensor generó esta lectura)
 *
 * Archivo: app/Models/TelemetryReading.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class TelemetryReading extends Model
{
    use HasFactory;

    /**
     * CREATED_AT redefinido a 'recorded_at'.
     * Así Eloquent usa nuestra columna como timestamp de creación
     * y $reading->created_at funciona igual que $reading->recorded_at.
     */
    const CREATED_AT = 'recorded_at';

    /**
     * UPDATED_AT = null desactiva completamente la gestión de updated_at.
     * Las lecturas son INMUTABLES — Eloquent no intentará tocar esa columna.
     * (La columna tampoco existe en la migración.)
     */
    const UPDATED_AT = null;

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
            'value'        => 'decimal:4',
            'quality_flag' => 'integer',
            'recorded_at'  => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * El sensor que generó esta lectura.
     *
     * Siempre usar with() para evitar N+1 al listar lecturas:
     *   TelemetryReading::with('deviceSensor.sensorType')->...
     */
    public function deviceSensor(): BelongsTo
    {
        return $this->belongsTo(DeviceSensor::class);
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Solo lecturas con quality_flag = 0 (válidas para mostrar en gráficas).
     * Uso: $sensor->readings()->valid()->get()
     */
    public function scopeValid($query)
    {
        return $query->where('quality_flag', 0);
    }

    /**
     * Lecturas dentro de un rango de tiempo.
     * Uso: $sensor->readings()->inPeriod($from, $to)->get()
     */
    public function scopeInPeriod($query, $from, $to)
    {
        return $query->whereBetween('recorded_at', [$from, $to]);
    }

    /**
     * Últimas N lecturas ordenadas por más reciente.
     * Siempre acotar la cantidad para no saturar memoria.
     * Uso: $sensor->readings()->recent(100)->get()
     */
    public function scopeRecent($query, int $limit = 100)
    {
        return $query->orderByDesc('recorded_at')->limit($limit);
    }
}
