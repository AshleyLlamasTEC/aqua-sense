<?php

namespace App\Http\Requests\Telemetry;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreTelemetryRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos que el ESP32 envía al endpoint de ingesta de telemetría.
 *
 * Este FormRequest es especial por dos razones:
 *
 * 1. EL REMITENTE NO ES UN USUARIO — es un dispositivo ESP32.
 *    La autenticación ya fue hecha por DeviceApiKeyMiddleware con X-Device-Key.
 *    authorize() devuelve true porque el middleware ya rechazó los no autorizados.
 *
 * 2. SOPORTA DOS FORMATOS EN EL MISMO ENDPOINT:
 *
 *    FORMATO SIMPLE (una lectura por request):
 *    POST /api/v1/telemetry
 *    {
 *      "device_sensor_id": 3,
 *      "value": 7.24,
 *      "raw_value": "724",
 *      "recorded_at": "2026-04-11T14:32:00Z"
 *    }
 *
 *    FORMATO BATCH (N lecturas por request — más eficiente para el ESP32):
 *    POST /api/v1/telemetry
 *    {
 *      "readings": [
 *        { "device_sensor_id": 3, "value": 7.24, "recorded_at": "2026-04-11T14:32:00Z" },
 *        { "device_sensor_id": 4, "value": 25.1 }
 *      ]
 *    }
 *
 *    El batch es preferible porque el ESP32 hace UNA conexión TCP para enviar
 *    todos sus sensores. Cada conexión HTTP tiene overhead (~50-200ms) que
 *    en un dispositivo embebido con WiFi importa para la vida de la batería.
 *
 * Ruta que lo usa:
 *   POST /api/v1/telemetry → TelemetryController@store
 *
 * Archivo: app/Http/Requests/Telemetry/StoreTelemetryRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class StoreTelemetryRequest extends FormRequest
{
    /**
     * Los dispositivos no usan Sanctum. La autenticación fue hecha por
     * DeviceApiKeyMiddleware antes de que este request llegara aquí.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * rules()
     * ─────────────────────────────────────────────────────────────────────
     * Detecta el formato automáticamente según si el JSON contiene 'readings'.
     *
     * Para el formato batch, la notación con punto (.) accede a cada
     * elemento del array:
     *   'readings.*.device_sensor_id' = campo device_sensor_id de CADA elemento
     *   'readings.*' = cada elemento del array readings
     */
    public function rules(): array
    {
        // FORMATO BATCH: el JSON contiene la clave "readings"
        if ($this->has('readings')) {
            return [
                // El array completo debe tener entre 1 y 50 elementos
                // max:50 previene abusos (el ESP32 no debería enviar más de eso)
                'readings'                    => ['required', 'array', 'min:1', 'max:50'],

                // Notación punto-asterisco: valida CADA elemento del array
                'readings.*.device_sensor_id' => ['required', 'integer', 'exists:device_sensors,id'],

                // El valor medido — el TelemetryService aplicará calibración
                'readings.*.value'            => ['required', 'numeric'],

                // Valor crudo antes de calibración — para auditoría
                'readings.*.raw_value'        => ['nullable', 'string', 'max:50'],

                // Si el ESP32 tiene RTC puede enviar su propio timestamp
                // Si no lo envía, el servidor usará now()
                'readings.*.recorded_at'      => ['nullable', 'date'],

                // El ESP32 puede marcar una lectura como sospechosa (1) o error (2)
                // 0=OK es el default si no se envía
                'readings.*.quality_flag'     => ['nullable', 'integer', 'between:0,2'],
            ];
        }

        // FORMATO SIMPLE: una lectura directamente en el root del JSON
        return [
            'device_sensor_id' => ['required', 'integer', 'exists:device_sensors,id'],
            'value'            => ['required', 'numeric'],
            'raw_value'        => ['nullable', 'string', 'max:50'],
            'recorded_at'      => ['nullable', 'date'],
            'quality_flag'     => ['nullable', 'integer', 'between:0,2'],
        ];
    }

    public function messages(): array
    {
        return [
            'readings.required'                    => 'El array de lecturas es obligatorio.',
            'readings.max'                         => 'El batch no puede contener más de 50 lecturas por request.',
            'readings.*.device_sensor_id.required' => 'Cada lectura debe incluir el device_sensor_id.',
            'readings.*.device_sensor_id.exists'   => 'El sensor con ID :input no está registrado en el sistema.',
            'readings.*.value.required'            => 'Cada lectura debe incluir un valor numérico.',
            'readings.*.value.numeric'             => 'El valor de la lectura debe ser numérico.',
            'readings.*.quality_flag.between'      => 'El quality_flag debe ser 0 (OK), 1 (dudoso) o 2 (error).',
            'device_sensor_id.required'            => 'El device_sensor_id es obligatorio.',
            'device_sensor_id.exists'              => 'El sensor indicado no está registrado en el sistema.',
            'value.required'                       => 'El valor de la lectura es obligatorio.',
            'value.numeric'                        => 'El valor de la lectura debe ser numérico.',
        ];
    }

    public function attributes(): array
    {
        return [
            'device_sensor_id'    => 'ID del sensor',
            'value'               => 'valor medido',
            'raw_value'           => 'valor crudo',
            'recorded_at'         => 'timestamp de medición',
            'quality_flag'        => 'bandera de calidad',
            'readings'            => 'lecturas',
            'readings.*.value'    => 'valor medido',
        ];
    }
}
