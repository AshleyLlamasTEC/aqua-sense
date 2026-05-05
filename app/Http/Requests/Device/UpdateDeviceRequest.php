<?php

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateDeviceRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para ACTUALIZAR un dispositivo ESP32 existente.
 *
 * Puntos importantes respecto a StoreDeviceRequest:
 *
 * 1. UNIQUENESS IGNORE:
 *    Al actualizar, la validación unique de mac_address debe ignorar
 *    el propio dispositivo. Sin esto, actualizar cualquier otro campo
 *    (como el nombre) fallaría con "MAC ya en uso" porque la propia
 *    MAC del dispositivo ya está en la BD.
 *
 *    Rule::unique('devices', 'mac_address')->ignore($deviceId)
 *    genera: WHERE mac_address = ? AND id != $deviceId
 *
 * 2. ROUTE MODEL BINDING:
 *    $this->route('device') puede devolver el objeto Device (si Laravel
 *    ya lo resolvió via Route Model Binding) o el ID numérico (si no).
 *    Por eso usamos: $this->route('device')?->id ?? $this->route('device')
 *
 * 3. CAMPOS PROTEGIDOS:
 *    api_key no está en las reglas — no se puede actualizar desde aquí.
 *    Para regenerar la key existe el endpoint POST /devices/{id}/regenerate-key.
 *
 * Ruta que lo usa:
 *   PUT /api/v1/devices/{device} → DeviceController@update
 *
 * Archivo: app/Http/Requests/Device/UpdateDeviceRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class UpdateDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Route Model Binding puede devolver el objeto Device o solo el ID.
        // ?->id intenta acceder a la propiedad id del objeto.
        // ?? $this->route('device') usa el valor crudo (ID) como fallback.
        $deviceId = $this->route('device')?->id ?? $this->route('device');

        return [
            // Si cambia de acuario, el nuevo debe existir en BD
            'aquarium_id' => ['sometimes', 'integer', 'exists:aquariums,id'],

            // Si actualiza el nombre, no puede estar vacío
            'name'        => ['sometimes', 'required', 'string', 'max:100'],

            // Si actualiza la MAC, validar formato e unicidad ignorando el propio registro
            'mac_address' => [
                'sometimes',
                'string',
                'size:17',
                'regex:/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/',
                // ignore($deviceId) → WHERE mac_address = ? AND id != $deviceId
                Rule::unique('devices', 'mac_address')->ignore($deviceId),
            ],

            'ip_address'       => ['sometimes', 'nullable', 'ip'],
            'firmware_version' => ['sometimes', 'nullable', 'string', 'max:20'],

            // El estado se puede cambiar manualmente (ej: poner en 'maintenance')
            'status' => ['sometimes', Rule::in(['online', 'offline', 'maintenance'])],
        ];
    }

    public function messages(): array
    {
        return [
            'aquarium_id.exists'  => 'El acuario seleccionado no existe.',
            'name.required'       => 'Si envías el nombre, no puede estar vacío.',
            'mac_address.size'    => 'La MAC address debe tener exactamente 17 caracteres (AA:BB:CC:DD:EE:FF).',
            'mac_address.regex'   => 'El formato de MAC address debe ser AA:BB:CC:DD:EE:FF.',
            'mac_address.unique'  => 'Ya existe un dispositivo con esa dirección MAC.',
            'ip_address.ip'       => 'El formato de IP no es válido.',
            'status.in'           => 'El estado debe ser: online, offline o maintenance.',
        ];
    }

    public function attributes(): array
    {
        return [
            'aquarium_id'      => 'acuario',
            'name'             => 'nombre',
            'mac_address'      => 'dirección MAC',
            'ip_address'       => 'dirección IP',
            'firmware_version' => 'versión de firmware',
            'status'           => 'estado',
        ];
    }
}
