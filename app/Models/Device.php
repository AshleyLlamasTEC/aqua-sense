<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * MODELO: Device
 * ─────────────────────────────────────────────────────────────────────────
 * Representa el microcontrolador ESP32 físico. Es el nodo de la red IoT
 * que conecta el mundo físico (sensores) con el sistema (API).
 *
 * Responsabilidad en el sistema:
 *   - Autenticarse con api_key al enviar telemetría
 *   - Reportar su estado (online/offline) implícitamente con cada request
 *   - Contener la configuración de sus sensores (device_sensors)
 *
 * @property int         $id
 * @property int         $aquarium_id
 * @property string      $name
 * @property string      $mac_address
 * @property string|null $ip_address
 * @property string|null $firmware_version
 * @property string      $api_key           (hash SHA-256, 64 chars)
 * @property string      $status            online|offline|maintenance
 * @property \Carbon\Carbon|null $last_seen_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * ─────────────────────────────────────────────────────────────────────────
 */
class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'aquarium_id',
        'name',
        'mac_address',
        'ip_address',
        'firmware_version',
        'api_key',
        'status',
        'last_seen_at',
    ];

    /**
     * api_key está en $hidden para que NUNCA aparezca en respuestas JSON.
     * Incluso siendo un hash, no debe exponerse — es información sensible.
     */
    protected $hidden = [
        'api_key',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
            'created_at'   => 'datetime',
            'updated_at'   => 'datetime',
        ];
    }

    // ══════════════════════════════════════════════════════════════════════
    // RELACIONES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * El acuario donde está físicamente instalado este dispositivo.
     *
     * BelongsTo: la FK (aquarium_id) está en esta tabla.
     */
    public function aquarium(): BelongsTo
    {
        return $this->belongsTo(Aquarium::class);
    }

    /**
     * Los sensores conectados a este dispositivo.
     *
     * HasMany: la FK (device_id) está en device_sensors.
     * Cada DeviceSensor es un sensor físico en un pin específico.
     *
     * Uso:
     *   $device->sensors                                    // todos
     *   $device->sensors()->where('is_active', true)->get() // solo activos
     *   $device->sensors()->with('sensorType')->get()       // con tipo
     */
    public function sensors(): HasMany
    {
        return $this->hasMany(DeviceSensor::class);
    }

    /**
     * Usuarios con acceso a este dispositivo (M:N con rol).
     *
     * BelongsToMany a través de la tabla pivot user_devices.
     * withPivot('role') → accede al rol: $device->users->first()->pivot->role
     *
     * Uso:
     *   $device->users                                    // todos
     *   $device->users()->wherePivot('role', 'owner')    // solo el dueño
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_devices')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    /**
     * Registros de la tabla pivot user_devices (acceso directo con columnas extra).
     */
    public function userDevices(): HasMany
    {
        return $this->hasMany(UserDevice::class);
    }

    // ══════════════════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Genera y devuelve una nueva API key en texto plano, guarda el hash.
     *
     * Flujo:
     *   1. Genera 32 bytes aleatorios → 64 chars hex
     *   2. Guarda el hash SHA-256 en la BD (nunca el valor original)
     *   3. Devuelve el valor original para mostrarlo UNA SOLA VEZ al usuario
     *
     * El hash SHA-256 de una key de 64 chars hex es computacionalmente
     * imposible de revertir — seguro incluso si la BD se filtra.
     *
     * Uso en DeviceController:
     *   $plainKey = $device->regenerateApiKey();
     *   // Mostrar $plainKey al usuario ahora — ya no se puede recuperar después
     */
    public function regenerateApiKey(): string
    {
        $plainKey = bin2hex(random_bytes(32)); // 64 chars hex
        $this->update(['api_key' => hash('sha256', $plainKey)]);
        return $plainKey;
    }

    /**
     * Verifica si una API key en texto plano coincide con el hash almacenado.
     *
     * Uso en DeviceApiKeyMiddleware:
     *   $device = Device::where('mac_address', $mac)->first();
     *   if (! $device->verifyApiKey($request->header('X-Device-Key'))) {
     *       abort(401);
     *   }
     */
    public function verifyApiKey(string $plainKey): bool
    {
        return hash_equals($this->api_key, hash('sha256', $plainKey));
        // hash_equals() es tiempo constante — previene timing attacks
    }

    /**
     * Marca el dispositivo como visto ahora mismo (llama al guardar el request).
     * Actualiza last_seen_at y status a 'online'.
     */
    public function markAsSeen(): void
    {
        $this->update([
            'last_seen_at' => now(),
            'status'       => 'online',
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCOPES
    // ══════════════════════════════════════════════════════════════════════

    public function scopeOnline($query)
    {
        return $query->where('status', 'online');
    }

    public function scopeOffline($query)
    {
        return $query->where('status', 'offline');
    }

    /**
     * Dispositivos que no reportan hace más de $minutes minutos.
     * Útil para el job que detecta dispositivos caídos.
     *
     * Uso: Device::stale(5)->get() → caídos en los últimos 5 min
     */
    public function scopeStale($query, int $minutes = 5)
    {
        return $query->where('last_seen_at', '<', now()->subMinutes($minutes))
                     ->where('status', 'online');
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACCESSORS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Devuelve hace cuánto tiempo fue visto por última vez, en texto legible.
     * Uso: $device->last_seen_human  → "hace 3 minutos"
     */
    public function getLastSeenHumanAttribute(): string
    {
        return $this->last_seen_at
            ? $this->last_seen_at->diffForHumans()
            : 'Nunca';
    }
}
