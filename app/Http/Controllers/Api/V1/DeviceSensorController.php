<?php
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  app/Http/Controllers/Api/V1/DeviceSensorController.php                 ║
// ╚══════════════════════════════════════════════════════════════════════════╝
/**
 * Gestiona los sensores físicos de un dispositivo específico.
 * Es un "controller anidado" — siempre opera bajo un {device}.
 *
 * Rutas (nested bajo devices):
 *   GET    /api/v1/devices/{device}/sensors            → index
 *   POST   /api/v1/devices/{device}/sensors            → store
 *   GET    /api/v1/devices/{device}/sensors/{sensor}   → show
 *   PUT    /api/v1/devices/{device}/sensors/{sensor}   → update
 *   DELETE /api/v1/devices/{device}/sensors/{sensor}   → destroy
 *   GET    /api/v1/devices/{device}/sensors/{sensor}/calibrations → calibrationHistory
 */

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeviceSensor\StoreDeviceSensorRequest;
use App\Http\Requests\DeviceSensor\UpdateDeviceSensorRequest;
use App\Models\Device;
use App\Models\DeviceSensor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceSensorController extends Controller
{
    /**
     * GET /api/v1/devices/{device}/sensors
     *
     * Lista todos los sensores del dispositivo con su tipo y última lectura.
     * El ESP32 puede consultar este endpoint al arrancar para obtener
     * su configuración completa (pines, intervalos de muestreo, etc.)
     */
    public function index(Device $device): JsonResponse
    {
        $this->authorize('view', $device);

        $sensors = $device->sensors()
            ->with(['sensorType', 'latestReading'])
            ->withCount('readings')
            ->get();

        return response()->json([
            'data'            => $sensors,
            'device_id'       => $device->id,
            'device_name'     => $device->name,
            // El ESP32 necesita este campo para configurar sus intervalos
            'sample_config'   => $sensors->map(fn ($s) => [
                'pin'              => $s->pin,
                'device_sensor_id' => $s->id,
                'interval_s'       => $s->sample_interval_s,
                'is_active'        => $s->is_active,
            ]),
        ]);
    }

    /**
     * POST /api/v1/devices/{device}/sensors
     *
     * Agrega un nuevo sensor físico al dispositivo.
     *
     * Request:
     * {
     *   "sensor_type_id": 1,
     *   "pin": "GPIO34",
     *   "sample_interval_s": 60,
     *   "calibration_offset": 0.15
     * }
     */
    public function store(StoreDeviceSensorRequest $request, Device $device): JsonResponse
    {
        $this->authorize('manageSensors', $device);

        $sensor = $device->sensors()->create($request->validated());
        $sensor->load('sensorType');

        return response()->json([
            'message' => "Sensor agregado en pin {$sensor->pin}.",
            'data'    => $sensor,
        ], 201);
    }

    /**
     * GET /api/v1/devices/{device}/sensors/{sensor}
     *
     * Detalle de un sensor con sus reglas de alerta y últimas 20 lecturas.
     */
    public function show(Device $device, DeviceSensor $sensor): JsonResponse
    {
        $this->authorize('view', $device);
        $this->ensureSensorBelongsToDevice($sensor, $device);

        $sensor->load([
            'sensorType',
            'alertRules' => fn ($q) => $q->active(),
            'latestReading',
            'calibrations' => fn ($q) => $q->latest()->limit(5),
        ]);

        // Últimas 20 lecturas para mini-gráfica en la vista de detalle
        $recentReadings = $sensor->readings()
            ->valid()
            ->recent(20)
            ->get(['value', 'recorded_at']);

        return response()->json([
            'data'            => $sensor,
            'recent_readings' => $recentReadings,
        ]);
    }

    /**
     * PUT /api/v1/devices/{device}/sensors/{sensor}
     *
     * Actualiza la configuración del sensor.
     * Si cambia la calibración, el Observer registra el historial automáticamente.
     */
    public function update(UpdateDeviceSensorRequest $request, Device $device, DeviceSensor $sensor): JsonResponse
    {
        $this->authorize('manageSensors', $device);
        $this->ensureSensorBelongsToDevice($sensor, $device);

        $sensor->update($request->validated());

        return response()->json([
            'message' => 'Sensor actualizado correctamente.',
            'data'    => $sensor->fresh()->load('sensorType'),
        ]);
    }

    /**
     * DELETE /api/v1/devices/{device}/sensors/{sensor}
     *
     * Elimina el sensor y TODOS sus datos históricos (cascade).
     * Pide confirmación en el frontend antes de llamar este endpoint.
     */
    public function destroy(Device $device, DeviceSensor $sensor): JsonResponse
    {
        $this->authorize('manageSensors', $device);
        $this->ensureSensorBelongsToDevice($sensor, $device);

        $pin = $sensor->pin;
        $sensor->delete();

        return response()->json([
            'message' => "Sensor en pin {$pin} eliminado junto con todos sus datos históricos.",
        ]);
    }

    /**
     * GET /api/v1/devices/{device}/sensors/{sensor}/calibrations
     *
     * Historial de calibraciones del sensor — útil para auditoría.
     */
    public function calibrationHistory(Device $device, DeviceSensor $sensor): JsonResponse
    {
        $this->authorize('view', $device);
        $this->ensureSensorBelongsToDevice($sensor, $device);

        $calibrations = $sensor->calibrations()
            ->latest()
            ->paginate(20);

        return response()->json($calibrations);
    }

    /**
     * Verifica que el sensor pertenezca al dispositivo de la ruta.
     *
     * Sin esta verificación, un usuario podría hacer:
     *   PUT /api/v1/devices/1/sensors/99
     * donde el sensor 99 pertenece a otro dispositivo.
     * Laravel resolvería ambos por ID sin verificar la relación.
     */
    private function ensureSensorBelongsToDevice(DeviceSensor $sensor, Device $device): void
    {
        if ($sensor->device_id !== $device->id) {
            abort(404, 'El sensor no pertenece a este dispositivo.');
        }
    }
}
