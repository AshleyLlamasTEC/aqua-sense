<?php

namespace App\Http\Requests\AlertRule;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * StoreAlertRuleRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para CREAR una regla de alerta sobre un sensor.
 *
 * Una regla de alerta define:
 *   - Nombre descriptivo (ej: "pH Crítico Bajo")
 *   - Umbral mínimo: alertar si el valor cae por debajo de min_value
 *   - Umbral máximo: alertar si el valor supera max_value
 *   - Cooldown: minutos de espera entre alertas repetidas del mismo problema
 *   - Severidad: info, warning o critical
 *
 * Restricción de negocio:
 *   Debe definirse AL MENOS un umbral (min_value o max_value).
 *   Una regla sin ningún umbral no tiene sentido — nunca dispararía.
 *   Esta validación cruzada (depende de dos campos) se implementa
 *   en withValidator(), que tiene acceso a todos los campos validados.
 *
 * Ruta que lo usa:
 *   POST /api/v1/devices/{device}/sensors/{sensor}/alert-rules
 *   → AlertRuleController@store
 *
 * Archivo: app/Http/Requests/AlertRule/StoreAlertRuleRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class StoreAlertRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Nombre descriptivo de la regla — visible en el panel de alertas
            'name' => ['required', 'string', 'max:100'],

            // Umbral inferior — null = sin límite mínimo
            // Si value < min_value → se dispara la alerta
            'min_value' => ['nullable', 'numeric'],

            // Umbral superior — null = sin límite máximo
            // Si value > max_value → se dispara la alerta
            'max_value' => ['nullable', 'numeric'],

            // Minutos entre alertas de la misma regla (evitar spam)
            // Min: 1 minuto | Max: 1440 minutos (24 horas)
            // Default en el modelo: 30 minutos
            'cooldown_min' => ['nullable', 'integer', 'min:1', 'max:1440'],

            // Severidad — determina la urgencia visual en el dashboard
            // y puede usarse para filtrar qué notificaciones enviar por email/SMS
            'severity' => ['nullable', Rule::in(['info', 'warning', 'critical'])],

            'is_active' => ['boolean'],
        ];
    }

    /**
     * withValidator()
     * ─────────────────────────────────────────────────────────────────────
     * Permite agregar validaciones CRUZADAS que dependen de múltiples campos.
     * Se ejecuta DESPUÉS de que rules() valida los campos individualmente.
     *
     * $validator->after(function($v) { ... }) agrega callbacks que corren
     * al final del proceso de validación. Si agregan errores, el request
     * falla con 422 igual que si fallara una regla normal.
     *
     * Aquí validamos dos restricciones de negocio:
     *   1. Al menos un umbral debe estar definido
     *   2. Si ambos están definidos, min debe ser < max
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $min = $this->input('min_value');
            $max = $this->input('max_value');

            // Restricción 1: sin umbrales, la regla nunca dispara
            if ($min === null && $max === null) {
                $v->errors()->add(
                    'min_value',
                    'Debes definir al menos un umbral: mínimo, máximo, o ambos.'
                );
            }

            // Restricción 2: si ambos están presentes, min debe ser < max
            // sin esto, una regla "pH entre 9.0 y 6.5" sería válida pero nunca dispararía
            if ($min !== null && $max !== null && (float) $min >= (float) $max) {
                $v->errors()->add(
                    'min_value',
                    'El valor mínimo debe ser estrictamente menor que el valor máximo.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'El nombre de la regla es obligatorio.',
            'name.max'             => 'El nombre no puede superar 100 caracteres.',
            'cooldown_min.min'     => 'El cooldown mínimo es 1 minuto.',
            'cooldown_min.max'     => 'El cooldown máximo es 1440 minutos (24 horas).',
            'cooldown_min.integer' => 'El cooldown debe ser un número entero de minutos.',
            'severity.in'          => 'La severidad debe ser: info, warning o critical.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'         => 'nombre de la regla',
            'min_value'    => 'umbral mínimo',
            'max_value'    => 'umbral máximo',
            'cooldown_min' => 'cooldown (minutos)',
            'severity'     => 'severidad',
            'is_active'    => 'estado activo',
        ];
    }
}
