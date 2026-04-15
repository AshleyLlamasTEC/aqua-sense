<?php

namespace App\Observers;

use App\Models\DeviceSensor;
use App\Models\DeviceSensorCalibration;

/**
 * OBSERVER: DeviceSensorObserver
 * ─────────────────────────────────────────────────────────────────────────
 * Los Observers en Laravel escuchan eventos del ciclo de vida de un modelo
 * (creating, created, updating, updated, deleting, deleted) y ejecutan
 * lógica sin ensuciar el modelo ni el controller.
 *
 * Este Observer resuelve un problema específico:
 *   "Cada vez que se cambie calibration_offset o calibration_factor de un
 *    sensor, registrar automáticamente el cambio en el historial."
 *
 * Sin Observer, habría que recordar llamar a DeviceSensorCalibration::create()
 * en cada lugar del código que actualice la calibración — frágil y propenso
 * a olvidos. El Observer lo centraliza.
 *
 * Cómo registrar este Observer:
 *   En App\Providers\AppServiceProvider::boot():
 *
 *   use App\Models\DeviceSensor;
 *   use App\Observers\DeviceSensorObserver;
 *
 *   DeviceSensor::observe(DeviceSensorObserver::class);
 *
 *   O usando el atributo (Laravel 11+):
 *   En el modelo DeviceSensor agregar:
 *   #[ObservedBy(DeviceSensorObserver::class)]
 * ─────────────────────────────────────────────────────────────────────────
 */
class DeviceSensorObserver
{
    /**
     * Se ejecuta ANTES de actualizar el modelo.
     *
     * isDirty() comprueba si el atributo cambió en la instancia actual
     * (comparando con el valor original cargado de la BD).
     *
     * Usamos 'updating' (no 'updated') para acceder al valor ORIGINAL
     * antes de que se escriba en BD. Después de 'updated' ya es tarde
     * para leer el valor anterior con getOriginal().
     */
    public function updating(DeviceSensor $sensor): void
    {
        // Solo registrar si cambió la calibración
        if (! $sensor->isDirty(['calibration_offset', 'calibration_factor'])) {
            return;
        }

        DeviceSensorCalibration::create([
            'device_sensor_id' => $sensor->id,
            // getOriginal() devuelve el valor que está en BD antes del cambio
            'old_offset'       => $sensor->getOriginal('calibration_offset'),
            'new_offset'       => $sensor->calibration_offset,
            // Nota: en una versión más completa podrías también loguear factor
        ]);
    }
}
