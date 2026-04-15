<?php
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  app/Policies/DevicePolicy.php                                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
/**
 * La DevicePolicy es más compleja que AquariumPolicy porque un dispositivo
 * puede tener múltiples usuarios con distintos roles (owner / viewer).
 *
 * Reglas de negocio:
 *   - OWNER: puede ver, editar, eliminar el dispositivo y gestionar sensores
 *   - VIEWER: solo puede ver datos y gráficas — no puede modificar nada
 *   - El owner del ACUARIO también puede gestionar sus dispositivos
 */

namespace App\Policies;

use App\Models\Device;
use App\Models\User;

class DevicePolicy
{
    /**
     * Determina si el usuario tiene algún rol sobre el dispositivo.
     * Reutilizable internamente para view y viewAny.
     */
    private function hasAccess(User $user, Device $device): bool
    {
        // Es dueño del acuario donde está el dispositivo
        if ($device->aquarium->user_id === $user->id) {
            return true;
        }

        // Tiene acceso explícito vía user_devices
        return $device->users()
                      ->where('users.id', $user->id)
                      ->exists();
    }

    private function isOwner(User $user, Device $device): bool
    {
        // Dueño del acuario = owner implícito del dispositivo
        if ($device->aquarium->user_id === $user->id) {
            return true;
        }

        return $device->users()
                      ->where('users.id', $user->id)
                      ->wherePivot('role', 'owner')
                      ->exists();
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Device $device): bool
    {
        return $this->hasAccess($user, $device);
    }

    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Solo owners pueden modificar el dispositivo.
     */
    public function update(User $user, Device $device): bool
    {
        return $this->isOwner($user, $device);
    }

    public function delete(User $user, Device $device): bool
    {
        return $this->isOwner($user, $device);
    }

    /**
     * Gestionar sensores (crear/editar/eliminar device_sensors)
     * requiere ser owner del dispositivo.
     */
    public function manageSensors(User $user, Device $device): bool
    {
        return $this->isOwner($user, $device);
    }
}
