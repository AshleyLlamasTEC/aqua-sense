<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * MODELO: SensorType
 * ─────────────────────────────────────────────────────────────────────────
 * Catálogo de tipos de sensores — datos estáticos del fabricante.
 * Se puebla con seeders y raramente cambia.
 *
 * Ejemplos en BD:
 *   { slug: "ph",   name: "pH",          unit: "pH",   op_min: 0,  op_max: 14   }
 *   { slug: "temp", name: "Temperatura", unit: "°C",   op_min: -10, op_max: 85  }
 *   { slug: "tds",  name: "TDS",         unit: "ppm",  op_min: 0,  op_max: 9999 }
 *   { slug: "do",   name: "Oxígeno Dis.", unit: "mg/L", op_min: 0,  op_max: 20  }
 *   { slug: "turb", name: "Turbidez",    unit: "NTU",  op_min: 0,  op_max: 4000 }
 *
 * @property int    $id
 * @property string $name
 * @property string $slug
 * @property string $unit
 * @property float|null $op_min
 * @property float|null $op_max
 * @property float|null $safe_min
 * @property float|null $safe_max
 * ─────────────────────────────────────────────────────────────────────────
 */
class SensorType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'unit',
        'description',
        'op_min',
        'op_max',
        'safe_min',
        'safe_max',
    ];

    protected function casts(): array
    {
        return [
            'op_min'   => 'decimal:4',
            'op_max'   => 'decimal:4',
            'safe_min' => 'decimal:4',
            'safe_max' => 'decimal:4',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Todas las instancias físicas de este tipo de sensor.
     *
     * HasMany: "Este tipo de sensor puede estar instalado en muchos dispositivos."
     *
     * Uso:
     *   $sensorType->deviceSensors          // todas las instancias
     *   SensorType::where('slug', 'ph')
     *       ->first()
     *       ->deviceSensors()
     *       ->with('device.aquarium')
     *       ->get()
     */
    public function deviceSensors(): HasMany
    {
        return $this->hasMany(DeviceSensor::class);
    }

    // ══════════════════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Verifica si un valor está dentro del rango operativo del hardware.
     * Si está fuera, la lectura debería marcarse como quality_flag=2 (error).
     */
    public function isWithinOperationalRange(float $value): bool
    {
        if ($this->op_min !== null && $value < $this->op_min) return false;
        if ($this->op_max !== null && $value > $this->op_max) return false;
        return true;
    }

    /**
     * Verifica si un valor está dentro del rango biológico seguro.
     */
    public function isWithinSafeRange(float $value): bool
    {
        if ($this->safe_min !== null && $value < $this->safe_min) return false;
        if ($this->safe_max !== null && $value > $this->safe_max) return false;
        return true;
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Buscar por slug de forma segura.
     * Uso: SensorType::bySlug('ph')->first()
     */
    public function scopeBySlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }
}
