<?php

namespace App\Http\Requests\Aquarium;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreAquariumRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para CREAR un acuario nuevo.
 *
 * ¿Por qué un FormRequest separado del controller?
 *   El controller debe ser delgado — solo orquestar. La validación y
 *   autorización tienen su propio ciclo de vida: se ejecutan ANTES
 *   de que el método del controller sea invocado por Laravel.
 *   Si fallan, Laravel lanza automáticamente:
 *     - 403 si authorize() devuelve false
 *     - 422 con los errores de validación en JSON si rules() falla
 *
 * Ruta que lo usa:
 *   POST /api/v1/aquariums → AquariumController@store
 *
 * Archivo: app/Http/Requests/Aquarium/StoreAquariumRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class StoreAquariumRequest extends FormRequest
{
    /**
     * authorize()
     * ─────────────────────────────────────────────────────────────────────
     * Decide si el usuario autenticado puede ejecutar esta acción.
     *
     * Devolvemos true porque la ruta ya está protegida por auth:sanctum.
     * La autorización granular se delega a la AquariumPolicy desde el
     * controller con $this->authorize('create', Aquarium::class).
     *
     * Ejemplo de restricción por plan:
     *   return $this->user()->aquariums()->count() < $this->user()->plan->max_aquariums;
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * rules()
     * ─────────────────────────────────────────────────────────────────────
     * Reglas de validación para cada campo del request.
     *
     * Convenciones Laravel:
     *   'required'  → presente y no vacío
     *   'nullable'  → puede ser null o ausente (sin lanzar error)
     *   'string'    → debe ser texto
     *   'max:N'     → máximo N caracteres
     *   'numeric'   → entero o decimal
     *   'min:N'     → valor mínimo (numérico cuando se combina con 'numeric')
     *   'boolean'   → acepta true, false, 1, 0, "1", "0"
     */
    public function rules(): array
    {
        return [
            // Nombre del acuario — obligatorio, máximo 100 chars
            'name'          => ['required', 'string', 'max:100'],

            // Descripción libre del acuario — opcional
            'description'   => ['nullable', 'string', 'max:500'],

            // Volumen del tanque en litros — opcional, positivo
            // max:999999.99 previene valores absurdos
            'volume_liters' => ['nullable', 'numeric', 'min:0.01', 'max:999999.99'],

            // Especie principal cultivada — texto libre, opcional
            'species'       => ['nullable', 'string', 'max:100'],

            // Estado activo/inactivo — si no se envía, el modelo usa default(true)
            'is_active'     => ['boolean'],
        ];
    }

    /**
     * messages()
     * ─────────────────────────────────────────────────────────────────────
     * Mensajes de error personalizados en español.
     * Formato de clave: 'campo.regla'
     * Sobrescriben los mensajes en inglés de Laravel.
     */
    public function messages(): array
    {
        return [
            'name.required'         => 'El nombre del acuario es obligatorio.',
            'name.max'              => 'El nombre no puede superar 100 caracteres.',
            'volume_liters.numeric' => 'El volumen debe ser un número.',
            'volume_liters.min'     => 'El volumen debe ser mayor a 0 litros.',
            'volume_liters.max'     => 'El volumen no puede superar 999,999.99 litros.',
        ];
    }

    /**
     * attributes()
     * ─────────────────────────────────────────────────────────────────────
     * Renombra los campos en los mensajes de error automáticos.
     * "The volume_liters field..." → "El campo volumen (litros)..."
     */
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
