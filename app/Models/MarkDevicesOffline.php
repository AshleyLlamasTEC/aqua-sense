<?php

namespace App\Jobs;

use App\Models\Device;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Job: MarkDevicesOffline
 * ─────────────────────────────────────────────────────────────────────────
 * Detecta dispositivos que llevan más de N minutos sin reportar datos
 * y los marca como 'offline'. Se ejecuta periódicamente desde el scheduler.
 *
 * ¿Cómo saber si un ESP32 se cayó?
 *   El dispositivo no envía un "me voy a desconectar" — simplemente deja
 *   de enviar datos. Detectamos el silencio comparando last_seen_at
 *   con el threshold configurado.
 *
 * Configuración del scheduler en routes/console.php:
 *   Schedule::job(new MarkDevicesOffline)->everyFiveMinutes();
 *
 * Archivo: app/Jobs/MarkDevicesOffline.php
 * ─────────────────────────────────────────────────────────────────────────
 */
class MarkDevicesOffline implements ShouldQueue
{
    use Queueable, InteractsWithQueue;

    /**
     * Minutos sin reportar para considerar un dispositivo offline.
     * Si el sensor mide cada 60s, un threshold de 5 min da margen
     * para reconexiones WiFi temporales.
     */
    private int $thresholdMinutes;

    public function __construct(int $thresholdMinutes = 5)
    {
        $this->thresholdMinutes = $thresholdMinutes;
    }

    public function handle(): void
    {
        // Scope stale(): dispositivos con status='online' Y
        // last_seen_at < ahora - $thresholdMinutes
        $staleDevices = Device::stale($this->thresholdMinutes)->get();

        if ($staleDevices->isEmpty()) {
            return;
        }

        // Actualizar en batch (una sola query) en lugar de loop
        // para no saturar BD con muchos UPDATE individuales
        Device::whereIn('id', $staleDevices->pluck('id'))
              ->update([
                  'status'     => 'offline',
                  'updated_at' => now(),
              ]);

        \Illuminate\Support\Facades\Log::info('Dispositivos marcados offline', [
            'count'      => $staleDevices->count(),
            'device_ids' => $staleDevices->pluck('id')->toArray(),
            'threshold'  => "{$this->thresholdMinutes} min",
        ]);
    }
}
