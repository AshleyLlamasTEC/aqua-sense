<?php

namespace App\Http\Requests\AlertRule;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateAlertRuleRequest
 * ─────────────────────────────────────────────────────────────────────────
 * Valida los datos para ACTUALIZAR una regla de alerta existente.
 *
 * Casos de uso frecuentes:
 *   - Ajustar umbrales después de calibrar el sensor
 *   - Cambiar cooldown si hay demasiadas notificaciones
 *   - Desactivar temporalmente sin eliminar la regla
 *   - Escalar severidad de 'warning' a 'critical'
 *
 * Particularidad de la validación cruzada al actualizar:
 *   El usuario puede enviar SOLO max_value sin min_value.
 *   Necesitamos combinar el valor nuevo (del request) con el actual (de BD)
 *   para poder validar que min siga siendo < max.
 *   Accedemos al modelo actual vía $this->route('rule') (Route Model Binding).
 *
 * Ruta que lo usa:
 *   PUT /api/v1/devices/{device}/sensors/{sensor}/alert-rules/{rule}
 *   → AlertRuleController@update
 *
 * Archivo: app/Http/Requests/AlertRule/UpdateAlertRuleRequest.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class UpdateAlertRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['sometimes', 'required', 'string', 'max:100'],
            'min_value'    => ['sometimes', 'nullable', 'numeric'],
            'max_value'    => ['sometimes', 'nullable', 'numeric'],
            'cooldown_min' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1440'],
            'severity'     => ['sometimes', Rule::in(['info', 'warning', 'critical'])],
            'is_active'    => ['sometimes', 'boolean'],
        ];
    }

    /**
     * withValidator()
     * ─────────────────────────────────────────────────────────────────────
     * Validación cruzada al actualizar.
     *
     * Combinamos el valor del request (si vino) con el valor actual en BD
     * para asegurar que min_value siga siendo < max_value después del update.
     *
     * Ejemplo:
     *   BD actual:        min_value=6.5, max_value=8.5
     *   Request enviado:  { "max_value": 6.0 }   ← solo max_value
     *   Resultado merge:  min=6.5, max=6.0  → INVÁLIDO (min >= max)
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            // $this->route('rule') devuelve el modelo AlertRule actual
            // gracias al Route Model Binding en la ruta
            $rule = $this->route('rule');

            // Usar el valor del request si vino, o el valor actual de BD
            $minValue = $this->has('min_value')
                ? $this->input('min_value')
                : ($rule?->min_value);

            $maxValue = $this->has('max_value')
                ? $this->input('max_value')
                : ($rule?->max_value);

            // Solo comparar si ambos tienen un valor después del merge
            if ($minValue !== null && $maxValue !== null) {
                if ((float) $minValue >= (float) $maxValue) {
                    $v->errors()->add(
                        'min_value',
                        'El valor mínimo debe ser estrictamente menor que el valor máximo.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Si envías el nombre, no puede estar vacío.',
            'cooldown_min.min' => 'El cooldown mínimo es 1 minuto.',
            'cooldown_min.max' => 'El cooldown máximo es 1440 minutos (24 horas).',
            'severity.in'      => 'La severidad debe ser: info, warning o critical.',
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
