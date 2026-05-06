<?php

namespace App\Jobs;

use App\Models\DeviceSensor;
use App\Models\TelemetryReading;
use App\Services\AlertEvaluationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Job: EvaluateAlertRules
 * ─────────────────────────────────────────────────────────────────────────
 * Evalúa todas las reglas de alerta de un sensor contra una nueva
 * lectura. Se despacha de forma ASÍNCRONA desde TelemetryService.
 *
 * ¿Por qué un Job y no llamar al Service directamente?
 * ─────────────────────────────────────────────────────────────────────────
 * El ESP32 hace un POST y espera la respuesta. Si la evaluación de alertas
 * se hace de forma síncrona, el ESP32 espera:
 *   - Consulta de reglas en BD        (~5ms)
 *   - Evaluación de umbrales          (~1ms)
 *   - Creación de Alert en BD         (~5ms)
 *   - Envío de email (SMTP)           (~300-2000ms) ← cuello de botella
 *
 * Con el Job en cola (async), el ESP32 recibe respuesta en ~15ms
 * y el email se envía en background sin bloquear.
 *
 * ¿Cómo funciona la cola en Laravel?
 *   1. dispatch(new EvaluateAlertRules($reading, $sensor)) → inserta
 *      un registro en la tabla `jobs` (o Redis si usas ese driver)
 *   2. El worker (`php artisan queue:work`) lee de la cola y ejecuta handle()
 *   3. Si falla, reintenta automáticamente $tries veces
 *
 * Configuración de cola:
 *   .env → QUEUE_CONNECTION=database  (desarrollo)
 *           QUEUE_CONNECTION=redis     (producción, con Horizon)
 *
 * Comandos útiles:
 *   php artisan queue:work             → procesar jobs en primer plano
 *   php artisan queue:listen           → como work pero reinicia con cambios
 *   php artisan horizon                → dashboard Horizon (producción)
 *   php artisan queue:failed           → ver jobs fallidos
 *   php artisan queue:retry all        → reintentar todos los fallidos
 *
 * Archivo: app/Jobs/EvaluateAlertRules.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class EvaluateAlertRules implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    /**
     * Número máximo de intentos si el Job falla.
     * Después de $tries intentos fallidos, pasa a la tabla failed_jobs.
     */
    public int $tries = 3;

    /**
     * Segundos de espera entre reintentos.
     * [60, 120, 300] → esperar 1 min, luego 2 min, luego 5 min.
     */
    public array $backoff = [60, 120, 300];

    /**
     * Tiempo máximo de ejecución del Job en segundos.
     * Si supera este tiempo, se marca como fallido.
     */
    public int $timeout = 30;

    /**
     * SerializesModels convierte los modelos a sus IDs para la cola
     * y los rehidrata al ejecutar el Job.
     *
     * ¿Por qué serializar los modelos en lugar de los IDs?
     *   Comodidad — Eloquent se encarga de rehidratar automáticamente.
     *   El modelo puede haber cambiado entre que se despachó y se ejecutó,
     *   así que SerializesModels siempre recarga desde BD al ejecutar.
     */
    public function __construct(
        private readonly TelemetryReading $reading,
        private readonly DeviceSensor     $sensor,
    ) {}

    /**
     * handle()
     * ─────────────────────────────────────────────────────────────────────
     * Lógica principal del Job. Se inyectan dependencias automáticamente
     * por el service container de Laravel.
     *
     * No necesitamos instanciar AlertEvaluationService manualmente —
     * Laravel lo hace a través del type-hint.
     */
    public function handle(AlertEvaluationService $alertService): void
    {
        // El service ya contiene toda la lógica de evaluación:
        // carga reglas, compara umbrales, verifica cooldown,
        // crea alertas y notifica al usuario.
        $alertService->evaluate($this->reading, $this->sensor);
    }

    /**
     * failed()
     * ─────────────────────────────────────────────────────────────────────
     * Se ejecuta cuando el Job agota todos sus reintentos.
     * Aquí podemos registrar el error o notificar al administrador.
     *
     * $exception contiene el error que causó el último fallo.
     */
    public function failed(\Throwable $exception): void
    {
        // Registrar en el log del sistema
        \Illuminate\Support\Facades\Log::error('EvaluateAlertRules Job falló', [
            'reading_id'       => $this->reading->id,
            'device_sensor_id' => $this->sensor->id,
            'error'            => $exception->getMessage(),
            'trace'            => $exception->getTraceAsString(),
        ]);
    }
}
