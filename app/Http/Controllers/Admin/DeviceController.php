<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\UserDevice;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Gestiona el ciclo de vida de los Nodos IoT de AquaSense.
 * Incluye vinculación (Claim), configuración (Edit/Update) y desvinculación (Destroy).
 */
class DeviceController extends Controller
{
    use AuthorizesRequests;

    /**
     * Proceso de vinculación (Claiming) de hardware pre-provisionado.
     * Transfiere el dispositivo de estado 'unpaired' a la cuenta del usuario.
     */
    public function claim(Request $request)
    {
        $validated = $request->validate([
            'aquarium_id'       => ['required', 'exists:aquariums,id'],
            'device_identifier' => ['required', 'string'], // UUID o ID de fábrica
        ]);

        try {
            $device = DB::transaction(function () use ($validated) {
                // Bloqueo de fila para evitar que dos usuarios vinculen el mismo ID simultáneamente
                $device = Device::query()
                    ->where('uuid', $validated['device_identifier'])
                    ->lockForUpdate()
                    ->first();

                if (!$device) {
                    throw ValidationException::withMessages([
                        'device_identifier' => 'El identificador AquaSense no existe.'
                    ]);
                }

                if ($device->status !== 'unpaired') {
                    throw ValidationException::withMessages([
                        'device_identifier' => 'Este dispositivo ya se encuentra vinculado a otro ecosistema.'
                    ]);
                }

                // Actualización del estado del hardware
                $device->update([
                    'aquarium_id' => $validated['aquarium_id'],
                    'status'      => 'offline', // Pasa a offline esperando primer latido (heartbeat)
                ]);

                // Registro de propiedad en la tabla pivote
                UserDevice::firstOrCreate([
                    'user_id'   => auth()->id(),
                    'device_id' => $device->id,
                ], [
                    'role' => 'owner',
                ]);

                return $device;
            });

            return redirect()->route('admin.devices.edit', ['device' => $device->id, 'onboarding' => 1])
                ->with('success', '¡Dispositivo vinculado con éxito! Vamos a configurarlo.');

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Error crítico de comunicación con el hardware.');
        }
    }

    /**
     * Muestra el panel de configuración técnica del dispositivo.
     */
    public function edit(Device $device)
    {
        // Validación de Policy para asegurar que el usuario es dueño del nodo
        $this->authorize('update', $device);

        $device->load([
            'sensors.sensorType',
            'sensors.alertRules',
            'sensors.calibrations' => fn($q) => $q->latest(),
        ]);

        return Inertia::render('Admin/Devices/Edit', [
            'device'       => $device,
            'isOnboarding' => request()->boolean('onboarding'),
        ]);
    }

    /**
     * Actualiza la metadata administrativa del dispositivo.
     */
    public function update(Request $request, Device $device)
    {
        $this->authorize('update', $device);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            // Aquí puedes añadir ajustes de intervalo de muestreo o reglas globales
        ]);

        $device->update($validated);

        return back()->with('success', 'Configuración del nodo actualizada.');
    }

    /**
     * Desvincula el dispositivo (Unpair).
     * El hardware vuelve a estar disponible para ser reclamado.
     */
    public function destroy(Device $device)
    {
        $this->authorize('delete', $device);

        try {
            DB::transaction(function () use ($device) {
                // El dispositivo vuelve a fábrica virtualmente
                $device->update([
                    'aquarium_id' => null,
                    'status'      => 'unpaired',
                ]);

                // Eliminamos la relación de propiedad
                UserDevice::where('device_id', $device->id)->delete();
            });

            return redirect()->route('admin.aquariums.index')
                ->with('info', 'El dispositivo ha sido desvinculado correctamente.');

        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'No se pudo completar la desvinculación.');
        }
    }
}
