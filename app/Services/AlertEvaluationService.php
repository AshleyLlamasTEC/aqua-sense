<?php
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  app/Services/AlertEvaluationService.php                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝

namespace App\Services;

use App\Models\Alert;
use App\Models\AlertRule;
use App\Models\DeviceSensor;
use App\Models\TelemetryReading;
use App\Notifications\AlertTriggeredNotification;
use Illuminate\Support\Facades\DB;

class AlertEvaluationService
{
    /**
     * Evalúa todas las reglas activas de un sensor contra una nueva lectura.
     * Se llama de forma asíncrona desde TelemetryService (afterResponse).
     *
     * Flujo:
     *   1. Carga las alert_rules activas del sensor
     *   2. Por cada regla: verifica si el valor la viola
     *   3. Si la viola y no está en cooldown → crea Alert y notifica
     *   4. Si hay alertas activas que YA NO se violan → las resuelve
     */
    public function evaluate(TelemetryReading $reading, DeviceSensor $sensor): void
    {
        $rules = AlertRule::where('device_sensor_id', $sensor->id)
            ->where('is_active', true)
            ->get();

        if ($rules->isEmpty()) return;

        $value = (float) $reading->value;

        foreach ($rules as $rule) {
            if ($rule->isViolatedBy($value)) {
                $this->triggerAlert($rule, $reading, $value);
            } else {
                $this->resolveActiveAlerts($rule);
            }
        }
    }

    /**
     * Crea una nueva alerta si no está en cooldown.
     */
    private function triggerAlert(AlertRule $rule, TelemetryReading $reading, float $value): void
    {
        // Verificar cooldown antes de crear otra alerta
        if ($rule->isInCooldown()) return;

        $alert = DB::transaction(function () use ($rule, $value) {
            return Alert::create([
                'alert_rule_id'   => $rule->id,
                'triggered_value' => $value,
                'severity'        => $rule->severity ?? 'warning',
                'triggered_at'    => now(),
            ]);
        });

        // Notificar al dueño del dispositivo
        // Navegamos por las relaciones: alertRule → deviceSensor → device → aquarium → user
        $user = $rule->deviceSensor->device->aquarium->user;
        $user->notify(new AlertTriggeredNotification($alert, $rule));
    }

    /**
     * Resuelve alertas activas de una regla que ya no está siendo violada.
     * Cuando el pH vuelve a rango normal, la alerta se marca como resuelta.
     */
    private function resolveActiveAlerts(AlertRule $rule): void
    {
        Alert::where('alert_rule_id', $rule->id)
             ->whereNull('resolved_at')
             ->update(['resolved_at' => now()]);
    }
}
