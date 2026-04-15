<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * MODELO: User
 * ─────────────────────────────────────────────────────────────────────────
 * Extiende Authenticatable (en lugar de Model) porque este modelo maneja
 * autenticación. Authenticatable provee los métodos que Laravel necesita
 * para login, guards, etc.
 *
 * Traits incluidos:
 *   - HasApiTokens   → Laravel Sanctum. Agrega métodos como $user->createToken()
 *                      y la relación tokens(). Necesario para autenticación SPA
 *                      y API tokens de usuarios.
 *   - HasFactory     → Permite usar User::factory() en tests y seeders.
 *   - Notifiable     → Agrega $user->notify() y la relación notifications().
 *                      Laravel lo usa para el sistema de notificaciones nativo.
 *
 * @property int         $id
 * @property string      $name
 * @property string      $email
 * @property string      $password
 * @property string|null $email_verified_at
 * @property string|null $remember_token
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * ─────────────────────────────────────────────────────────────────────────
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * $fillable define qué columnas pueden asignarse masivamente.
     * Es una medida de seguridad contra Mass Assignment — sin esta lista,
     * un atacante podría enviar campos arbitrarios en el request y
     * modificar columnas sensibles como `is_admin`.
     *
     * Alternativa: usar $guarded = ['id'] para proteger solo el ID.
     * Para modelos grandes, $guarded es más mantenible.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * $hidden evita que estas columnas aparezcan en JSON/arrays.
     * Crucial para que password y remember_token nunca se expongan
     * en respuestas de API, aunque el modelo sea serializado.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * $casts convierte automáticamente los tipos al acceder al atributo.
     * - 'datetime'  → convierte el string de MySQL a objeto Carbon (manipulación de fechas)
     * - 'hashed'    → hashea automáticamente password al asignarlo ($user->password = 'texto')
     *                 Requiere Laravel 10+. Antes se hacía en el setter o en el controller.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'created_at'        => 'datetime',
            'updated_at'        => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Un usuario tiene muchos acuarios.
     *
     * HasMany: la FK (user_id) está en la tabla HIJA (aquariums).
     * Laravel infiere la FK como "{nombre_modelo}_id" → "user_id".
     *
     * Uso:
     *   $user->aquariums                    // Collection de Aquarium
     *   $user->aquariums()->where('is_active', true)->get()
     *   $user->aquariums()->create([...])   // Crea y asocia automáticamente
     */
    public function aquariums(): HasMany
    {
        return $this->hasMany(Aquarium::class);
    }

    /**
     * Registros de acceso del usuario a dispositivos (tabla pivot con rol).
     *
     * Diferente de aquariums(): aquí accedemos directamente a la tabla
     * pivot user_devices, que tiene una columna extra `role`.
     * Útil para: "¿a qué dispositivos tiene acceso este usuario y con qué rol?"
     */
    public function userDevices(): HasMany
    {
        return $this->hasMany(UserDevice::class);
    }

    /**
     * Dispositivos accesibles por este usuario (relación M:N a través de user_devices).
     *
     * BelongsToMany: Laravel busca la tabla pivot "device_user" por convención
     * (orden alfabético), pero aquí la tabla se llama "user_devices" — debemos
     * especificarla explícitamente.
     *
     * withPivot('role') → incluye la columna extra `role` al acceder al pivot:
     *   $user->devices->first()->pivot->role  // "owner" o "viewer"
     *
     * Uso:
     *   $user->devices                                  // todos los dispositivos
     *   $user->devices()->wherePivot('role', 'owner')   // solo los que posee
     */
    public function devices()
    {
        return $this->belongsToMany(Device::class, 'user_devices')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES (filtros reutilizables)
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Scope para usuarios con email verificado.
     * Uso: User::verified()->get()
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }
}
