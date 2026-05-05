<?php

namespace App\Http\Requests\DeviceSensor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateDeviceSensorRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para ACTUALIZAR la configuración de un sensor existente.
 *
 * Casos de uso frecuentes para este endpoint:
 *   - Recalibrar un sensor: cambiar calibration_offset después de limpiar
 *   - Ajustar frecuencia: cambiar sample_interval_s de 60 a 30 segundos
 *   - Desactivar sensor: is_active → false (sin perder historial)
 *   - Cambiar pin: reasignar el sensor a otro GPIO
 *
 * Dos parámetros de ruta:
 *   {device} → el dispositivo padre (Route Model Binding → objeto Device)
 *   {sensor} → el sensor a actualizar (Route Model Binding → objeto DeviceSensor)
 *
 * Validación de unicidad del pin al actualizar:
 *   Igual que en Store, pero con ->ignore($sensorId) para excluir
 *   el propio sensor de la verificación.
 *   Sin esto, actualizar cualquier otro campo (ej: sample_interval_s)
 *   fallaría porque el propio pin ya está "en uso" por este sensor.
 *
 * Ruta que lo usa:
 *   PUT /api/v1/devices/{device}/sensors/{sensor} → DeviceSensorController@update
 *
 * Archivo: app/Http/Requests/DeviceSensor/UpdateDeviceSensorRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class UpdateDeviceSensorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Extraer IDs de ambos parámetros de ruta
        $deviceId = $this->route('device')?->id ?? $this->route('device');
        $sensorId = $this->route('sensor')?->id ?? $this->route('sensor');

        return [
            // Si cambia el tipo de sensor, el nuevo tipo debe existir en el catálogo
            'sensor_type_id' => ['sometimes', 'integer', 'exists:sensor_types,id'],

            // Si cambia el pin:
            //   - Validar unicidad dentro del mismo dispositivo
            //   - Ignorar el propio sensor (->ignore) para no fallar en actualizaciones
            //     donde el pin no cambia
            'pin' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('device_sensors', 'pin')
                    ->where(fn ($query) => $query->where('device_id', $deviceId))
                    ->ignore($sensorId),
                    // SQL generado: WHERE pin = ? AND device_id = $deviceId AND id != $sensorId
            ],

            'sample_interval_s'  => ['sometimes', 'nullable', 'integer', 'min:5', 'max:86400'],

            // Los parámetros de calibración son los más actualizados frecuentemente
            'calibration_offset' => ['sometimes', 'nullable', 'numeric', 'between:-100,100'],
            'calibration_factor' => ['sometimes', 'nullable', 'numeric', 'between:0.001,1000'],

            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'sensor_type_id.exists'      => 'El tipo de sensor seleccionado no existe en el catálogo.',
            'pin.unique'                 => 'Ese pin ya está asignado a otro sensor en este dispositivo.',
            'pin.max'                    => 'El nombre del pin no puede superar 20 caracteres.',
            'sample_interval_s.min'      => 'El intervalo mínimo es 5 segundos.',
            'sample_interval_s.max'      => 'El intervalo máximo es 86400 segundos (24 horas).',
            'calibration_offset.between' => 'El offset debe estar entre -100 y 100.',
            'calibration_factor.between' => 'El factor debe estar entre 0.001 y 1000.',
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
