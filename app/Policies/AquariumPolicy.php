<?php

namespace App\Policies;

use App\Models\Aquarium;
use App\Models\User;

class AquariumPolicy
{
    /**
     * Listar acuarios.
     */
    public function viewAny(
        User $user
    ): bool
    {
        return true;
    }

    /**
     * Ver un acuario.
     */
    public function view(
        User $user,
        Aquarium $aquarium
    ): bool
    {
        return $user->id === $aquarium->user_id;
    }

    /**
     * Crear.
     */
    public function create(
        User $user
    ): bool
    {
        return true;
    }

    /**
     * Editar.
     */
    public function update(
        User $user,
        Aquarium $aquarium
    ): bool
    {
        return $user->id === $aquarium->user_id;
    }

    /**
     * Eliminar.
     */
    public function delete(
        User $user,
        Aquarium $aquarium
    ): bool
    {
        return $user->id === $aquarium->user_id;
    }
}
