<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * MODELO: Aquarium
 * ─────────────────────────────────────────────────────────────────────────
 * Representa el acuario o estanque físico. Es el contenedor lógico
 * principal que el usuario ve en la UI. Un acuario tiene uno o más
 * dispositivos ESP32 instalados que monitorean sus parámetros.
 *
 * @property int         $id
 * @property int         $user_id
 * @property string      $name
 * @property string|null $description
 * @property float|null  $volume_liters
 * @property string|null $species
 * @property bool        $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * ─────────────────────────────────────────────────────────────────────────
 */
class Aquarium extends Model
{
    use HasFactory;

    protected $table = 'aquariums';

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'volume_liters',
        'species',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'volume_liters' => 'decimal:2',
            'is_active'     => 'boolean',    // Convierte 0/1 de MySQL a true/false PHP
            'created_at'    => 'datetime',
            'updated_at'    => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * El usuario dueño de este acuario.
     *
     * BelongsTo: la FK (user_id) está en ESTA tabla (aquariums).
     * "Este acuario pertenece a un usuario."
     *
     * Uso:
     *   $aquarium->user           // objeto User
     *   $aquarium->user->name     // nombre del dueño
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Dispositivos ESP32 instalados en este acuario.
     *
     * HasMany: la FK (aquarium_id) está en la tabla devices.
     * "Este acuario tiene muchos dispositivos."
     *
     * Uso:
     *   $aquarium->devices                           // todos los dispositivos
     *   $aquarium->devices()->where('status', 'online')->get()
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    /**
     * Todos los sensores de todos los dispositivos de este acuario.
     *
     * HasManyThrough: relación "a través de" — salta la tabla devices.
     *
     * SQL equivalente:
     *   SELECT device_sensors.*
     *   FROM device_sensors
     *   JOIN devices ON device_sensors.device_id = devices.id
     *   WHERE devices.aquarium_id = {$this->id}
     *
     * Uso:
     *   $aquarium->sensors                           // todos los sensores
     *   $aquarium->sensors()->where('is_active', true)->get()
     *
     * Parámetros de hasManyThrough:
     *   1. Modelo final (DeviceSensor)
     *   2. Modelo intermedio (Device)
     *   3. FK del intermedio en la tabla pivote → devices.aquarium_id
     *   4. FK del final en la tabla pivote     → device_sensors.device_id
     *   5. PK local                            → aquariums.id
     *   6. PK del intermedio                   → devices.id
     */
    public function sensors(): HasManyThrough
    {
        return $this->hasManyThrough(
            DeviceSensor::class,    // Destino final
            Device::class,          // Tabla intermedia
            'aquarium_id',          // FK en devices
            'device_id',            // FK en device_sensors
            'id',                   // PK de aquariums
            'id'                    // PK de devices
        );
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Solo acuarios activos.
     * Uso: Aquarium::active()->get()
     *      $user->aquariums()->active()->get()
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
