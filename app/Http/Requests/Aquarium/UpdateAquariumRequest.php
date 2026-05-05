<?php

namespace App\Http\Requests\Aquarium;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateAquariumRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para ACTUALIZAR un acuario existente.
 *
 * Diferencia clave respecto a StoreAquariumRequest:
 *   Todos los campos usan la regla 'sometimes' al inicio del array.
 *
 * ¿Qué hace 'sometimes'?
 *   Le dice a Laravel: "solo valida este campo SI está presente en el request".
 *   Esto habilita actualizaciones PARCIALES (PATCH semántico):
 *     - PUT   { "name": "Nuevo nombre", "species": "Tilapia" }  → actualiza solo esos 2
 *     - PUT   { "is_active": false }                            → solo desactiva
 *   Sin 'sometimes', enviar solo name sin volume_liters fallaría porque
 *   volume_liters no estaría presente.
 *
 * Ruta que lo usa:
 *   PUT /api/v1/aquariums/{aquarium} → AquariumController@update
 *
 * Archivo: app/Http/Requests/Aquarium/UpdateAquariumRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class UpdateAquariumRequest extends FormRequest
{
    /**
     * authorize()
     * La autorización real (¿es dueño?) se hace en el controller
     * con $this->authorize('update', $aquarium) → AquariumPolicy@update.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * rules()
     * ─────────────────────────────────────────────────────────────────────
     * Patrón: ['sometimes', 'required', ...resto_de_reglas]
     *
     *   'sometimes' → solo validar si el campo viene en el request
     *   'required'  → si viene, no puede estar vacío
     *
     * Para campos opcionales en el negocio (nullable):
     *   ['sometimes', 'nullable', ...] → si viene, puede ser null o valor
     */
    public function rules(): array
    {
        return [
            // Si viene name, debe ser string no vacío de máx 100 chars
            'name'          => ['sometimes', 'required', 'string', 'max:100'],

            // Si viene description, puede ser null o texto de máx 500 chars
            'description'   => ['sometimes', 'nullable', 'string', 'max:500'],

            // Si viene volume_liters, puede ser null (para borrarlo) o un número positivo
            'volume_liters' => ['sometimes', 'nullable', 'numeric', 'min:0.01', 'max:999999.99'],

            // Si viene species, puede ser null o texto
            'species'       => ['sometimes', 'nullable', 'string', 'max:100'],

            // Si viene is_active, debe ser boolean
            'is_active'     => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'Si envías el nombre, no puede estar vacío.',
            'name.max'              => 'El nombre no puede superar 100 caracteres.',
            'volume_liters.numeric' => 'El volumen debe ser un número.',
            'volume_liters.min'     => 'El volumen debe ser mayor a 0 litros.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'          => 'nombre',
            'description'   => 'descripción',
            'volume_liters' => 'volumen (litros)',
            'species'       => 'especie',
            'is_active'     => 'estado activo',
        ];
    }
}
