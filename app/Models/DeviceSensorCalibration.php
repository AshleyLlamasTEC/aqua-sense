<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: DeviceSensorCalibration
 * ─────────────────────────────────────────────────────────────────────────
 * Historial inmutable de cambios en los parámetros de calibración.
 * Cada vez que un técnico ajusta calibration_offset o calibration_factor
 * en un DeviceSensor, el Observer registra automáticamente el cambio aquí.
 *
 * ¿Para qué sirve este historial?
 *   1. AUDITORÍA: "El 15 de marzo alguien cambió el offset de 0 a +0.15"
 *   2. DIAGNÓSTICO: si los datos del sensor cambiaron bruscamente, ver si
 *      coincide con una recalibración.
 *   3. RECÁLCULO: si la calibración anterior era incorrecta, con el
 *      raw_value en telemetry_readings y este historial se puede recalcular
 *      el valor real histórico.
 *
 * Quién inserta estos registros:
 *   DeviceSensorObserver::updating() — automáticamente, sin intervención
 *   del developer en el controller.
 *
 * Relaciones:
 *   belongsTo → DeviceSensor
 *
 * Archivo: app/Models/DeviceSensorCalibration.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class DeviceSensorCalibration extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_sensor_id',
        'old_offset',
        'new_offset',
        'old_factor',
        'new_factor',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'old_offset' => 'decimal:4',
            'new_offset' => 'decimal:4',
            'old_factor' => 'decimal:4',
            'new_factor' => 'decimal:4',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * El sensor cuya calibración fue modificada.
     * Uso: $calibration->deviceSensor->device->name
     */
    public function deviceSensor(): BelongsTo
    {
        return $this->belongsTo(DeviceSensor::class);
    }
}
