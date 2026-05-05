<?php

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * StoreDeviceRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para REGISTRAR un nuevo dispositivo ESP32.
 *
 * Campos que vienen del frontend cuando el usuario registra un ESP32:
 *   - aquarium_id:      a qué acuario pertenece
 *   - name:             nombre descriptivo (ej: "Nodo Tanque Norte")
 *   - mac_address:      dirección MAC única del ESP32 (AA:BB:CC:DD:EE:FF)
 *   - ip_address:       IP local opcional (puede cambiar con DHCP)
 *   - firmware_version: versión del firmware cargado en el ESP32
 *
 * El campo api_key NO viene del frontend — se genera automáticamente
 * en el controller con bin2hex(random_bytes(32)).
 *
 * Ruta que lo usa:
 *   POST /api/v1/devices → DeviceController@store
 *
 * Archivo: app/Http/Requests/Device/StoreDeviceRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class StoreDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // FK al acuario — debe existir en la tabla aquariums
            // La validación 'exists' hace un SELECT COUNT(*) en BD
            'aquarium_id' => ['required', 'integer', 'exists:aquariums,id'],

            // Nombre descriptivo del dispositivo
            'name'        => ['required', 'string', 'max:100'],

            // Dirección MAC del ESP32
            // Reglas en cadena:
            //   'size:17'  → exactamente 17 caracteres (AA:BB:CC:DD:EE:FF = 17)
            //   'regex'    → formato hexadecimal con separadores ':'
            //   Rule::unique → no puede existir otro device con la misma MAC
            'mac_address' => [
                'required',
                'string',
                'size:17',
                'regex:/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/',
                Rule::unique('devices', 'mac_address'),
            ],

            // IP local del dispositivo en la red
            // 'ip' de Laravel valida tanto IPv4 como IPv6
            'ip_address'       => ['nullable', 'ip'],

            // Versión del firmware (ej: "1.2.4", "v2.0.0-beta")
            'firmware_version' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'aquarium_id.required' => 'Debes seleccionar un acuario para el dispositivo.',
            'aquarium_id.exists'   => 'El acuario seleccionado no existe.',
            'name.required'        => 'El nombre del dispositivo es obligatorio.',
            'mac_address.required' => 'La dirección MAC del ESP32 es obligatoria.',
            'mac_address.size'     => 'La MAC address debe tener exactamente 17 caracteres (AA:BB:CC:DD:EE:FF).',
            'mac_address.regex'    => 'El formato de MAC address debe ser AA:BB:CC:DD:EE:FF (hexadecimal con dos puntos).',
            'mac_address.unique'   => 'Ya existe un dispositivo registrado con esa dirección MAC.',
            'ip_address.ip'        => 'El formato de dirección IP no es válido.',
            'firmware_version.max' => 'La versión del firmware no puede superar 20 caracteres.',
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
        ];
    }
}
