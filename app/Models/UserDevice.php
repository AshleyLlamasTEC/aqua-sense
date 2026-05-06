<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model: UserDevice
 * ─────────────────────────────────────────────────────────────────────────
 * Tabla pivot entre users y devices, con la columna extra `role`.
 *
 * ¿Por qué un modelo propio en lugar de solo una tabla pivot?
 *   Las tablas pivot "simples" (sin columnas extra) no necesitan modelo.
 *   Esta tabla tiene `role` ('owner' | 'viewer'), lo que la hace una
 *   entidad de negocio que puede consultarse directamente.
 *
 * Dos formas de acceder a esta relación:
 *
 *   1. Vía BelongsToMany (más común para consultas):
 *      $user->devices()->wherePivot('role', 'owner')->get()
 *      $device->users()->withPivot('role')->get()
 *
 *   2. Vía este modelo (útil para updateOrCreate, queries directas):
 *      UserDevice::where('device_id', $id)->with('user')->get()
 *      UserDevice::updateOrCreate(['user_id'=>$u, 'device_id'=>$d], ['role'=>'viewer'])
 *
 * Roles:
 *   owner  → creó el dispositivo, puede editar, eliminar, compartir
 *   viewer → acceso solo lectura: ver datos y gráficas
 *
 * Archivo: app/Models/UserDevice.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class UserDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device_id',
        'role',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * El usuario que tiene acceso.
     * Uso: $userDevice->user->name
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * El dispositivo al que se tiene acceso.
     * Uso: $userDevice->device->name
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    /** Solo registros de propietarios. */
    public function scopeOwners($query)
    {
        return $query->where('role', 'owner');
    }

    /** Solo registros de espectadores. */
    public function scopeViewers($query)
    {
        return $query->where('role', 'viewer');
    }
}
