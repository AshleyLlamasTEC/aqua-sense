<?php

namespace App\Http\Requests\DeviceSensor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * StoreDeviceSensorRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para AGREGAR un sensor físico a un dispositivo ESP32.
 *
 * Contexto de uso:
 *   El usuario en el dashboard selecciona un dispositivo y le agrega
 *   un sensor: "En el GPIO34 de este ESP32 hay un sensor de pH".
 *
 * Restricción de negocio importante:
 *   Un pin físico solo puede tener UN sensor asignado por dispositivo.
 *   No puedes conectar dos sensores al mismo GPIO34.
 *   Esto se valida con Rule::unique con condición WHERE device_id = X.
 *
 * Ruta que lo usa:
 *   POST /api/v1/devices/{device}/sensors → DeviceSensorController@store
 *
 * Nota sobre {device} en la ruta:
 *   Laravel resuelve {device} automáticamente (Route Model Binding).
 *   $this->route('device') devuelve el objeto Device completo.
 *
 * Archivo: app/Http/Requests/DeviceSensor/StoreDeviceSensorRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class StoreDeviceSensorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtenemos el ID del dispositivo de la ruta para la validación de unicidad del pin.
        // Route Model Binding devuelve el objeto Device, de ahí extraemos el id.
        $deviceId = $this->route('device')?->id ?? $this->route('device');

        return [
            // FK al catálogo de tipos de sensores (sensor_types.id)
            // 'exists' hace: SELECT COUNT(*) FROM sensor_types WHERE id = ?
            'sensor_type_id' => ['required', 'integer', 'exists:sensor_types,id'],

            // Pin físico del ESP32 donde está conectado el sensor
            // Ejemplos: "GPIO34", "GPIO35", "A0", "I2C_0x63", "UART_1"
            // Restricción: único por dispositivo (un pin = un sensor)
            'pin' => [
                'required',
                'string',
                'max:20',
                // Rule::unique con where() = unicidad condicional:
                // "No puede existir otro device_sensor con el mismo pin
                //  para este mismo device_id"
                // SQL: WHERE pin = ? AND device_id = $deviceId
                Rule::unique('device_sensors', 'pin')
                    ->where(fn ($query) => $query->where('device_id', $deviceId)),
            ],

            // Intervalo de muestreo en segundos
            // Rango: mínimo 5 segundos, máximo 86400 (= 24 horas)
            // Si no se envía, el modelo usa default: 60 segundos
            'sample_interval_s' => ['nullable', 'integer', 'min:5', 'max:86400'],

            // Offset de calibración para corregir deriva del sensor
            // Fórmula: valor_real = (raw * factor) + offset
            // Rango: -100 a +100 (offsets mayores indican sensor defectuoso)
            'calibration_offset' => ['nullable', 'numeric', 'between:-100,100'],

            // Factor de calibración para escalar la lectura
            // Default: 1.0 (sin escala). Rango permitido: 0.001 a 1000
            'calibration_factor' => ['nullable', 'numeric', 'between:0.001,1000'],

            // Si no se envía, el modelo usa default: true
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'sensor_type_id.required' => 'Debes seleccionar el tipo de sensor.',
            'sensor_type_id.exists'   => 'El tipo de sensor seleccionado no existe en el catálogo.',
            'pin.required'            => 'El pin de conexión es obligatorio (ej: GPIO34).',
            'pin.max'                 => 'El nombre del pin no puede superar 20 caracteres.',
            'pin.unique'              => 'Ese pin ya está asignado a otro sensor en este dispositivo.',
            'sample_interval_s.min'   => 'El intervalo mínimo de muestreo es 5 segundos.',
            'sample_interval_s.max'   => 'El intervalo máximo de muestreo es 86400 segundos (24 horas).',
            'calibration_offset.between' => 'El offset de calibración debe estar entre -100 y 100.',
            'calibration_factor.between' => 'El factor de calibración debe estar entre 0.001 y 1000.',
        ];
    }

    public function attributes(): array
    {
        return [
            'sensor_type_id'     => 'tipo de sensor',
            'pin'                => 'pin de conexión',
            'sample_interval_s'  => 'intervalo de muestreo',
            'calibration_offset' => 'offset de calibración',
            'calibration_factor' => 'factor de calibración',
            'is_active'          => 'estado activo',
        ];
    }
}
