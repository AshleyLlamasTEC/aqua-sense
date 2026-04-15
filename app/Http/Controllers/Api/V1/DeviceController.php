<?php
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  app/Http/Controllers/Api/V1/DeviceController.php                       ║
// ╚══════════════════════════════════════════════════════════════════════════╝
/**
 * CONTROLLER: DeviceController
 * ─────────────────────────────────────────────────────────────────────────
 * Gestiona el CRUD de dispositivos ESP32 y la generación de API keys.
 *
 * Rutas:
 *   GET    /api/v1/devices                        → index
 *   POST   /api/v1/devices                        → store
 *   GET    /api/v1/devices/{device}               → show
 *   PUT    /api/v1/devices/{device}               → update
 *   DELETE /api/v1/devices/{device}               → destroy
 *   POST   /api/v1/devices/{device}/regenerate-key → regenerateKey
 */

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Device\StoreDeviceRequest;
use App\Http\Requests\Device\UpdateDeviceRequest;
use App\Models\Aquarium;
use App\Models\Device;
use App\Models\UserDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceController extends Controller
{
    /**
     * GET /api/v1/devices
     *
     * Lista dispositivos accesibles por el usuario (propios + compartidos).
     * Opcionalmente filtra por aquarium_id con ?aquarium_id=1
     */
    public function index(Request $request): JsonResponse
    {
        // Dispositivos de los acuarios del usuario + dispositivos compartidos
        $userAquariumIds = $request->user()->aquariums()->pluck('id');

        $query = Device::query()
            ->where(function ($q) use ($request, $userAquariumIds) {
                // Dispositivos en los acuarios del usuario
                $q->whereIn('aquarium_id', $userAquariumIds)
                  // O dispositivos compartidos explícitamente con el usuario
                  ->orWhereHas('users', fn ($uq) =>
                      $uq->where('users.id', $request->user()->id)
                  );
            })
            ->with(['aquarium:id,name', 'sensors' => fn ($q) => $q->active()->with('sensorType:id,name,slug,unit')])
            ->withCount(['sensors', 'sensors as active_sensors_count' => fn ($q) => $q->where('is_active', true)]);

        // Filtro opcional por acuario
        if ($request->filled('aquarium_id')) {
            $query->where('aquarium_id', $request->integer('aquarium_id'));
        }

        // Filtro por estado
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $devices = $query->latest()->get();

        return response()->json([
            'data'  => $devices,
            'total' => $devices->count(),
        ]);
    }

    /**
     * POST /api/v1/devices
     *
     * Registra un nuevo ESP32. Genera la API key automáticamente
     * y la devuelve en texto plano UNA SOLA VEZ. Después no puede
     * recuperarse (solo el hash está en BD).
     *
     * Request:
     * {
     *   "aquarium_id": 1,
     *   "name": "Nodo Principal",
     *   "mac_address": "AA:BB:CC:DD:EE:FF"
     * }
     *
     * Response incluye api_key en texto plano — solo esta vez.
     */
    public function store(StoreDeviceRequest $request): JsonResponse
    {
        // Verificar que el acuario le pertenezca al usuario
        $aquarium = Aquarium::findOrFail($request->validated('aquarium_id'));
        $this->authorize('update', $aquarium); // Puede gestionar este acuario

        // Generar la API key antes de crear el dispositivo
        $plainKey = bin2hex(random_bytes(32)); // 64 chars hex, criptográficamente seguro

        $device = DB::transaction(function () use ($request, $plainKey) {
            $device = Device::create(array_merge($request->validated(), [
                'api_key' => hash('sha256', $plainKey), // Solo el hash en BD
                'status'  => 'offline',
            ]));

            // Registrar al usuario creador como 'owner' en la tabla pivot
            UserDevice::create([
                'user_id'   => $request->user()->id,
                'device_id' => $device->id,
                'role'      => 'owner',
            ]);

            return $device;
        });

        return response()->json([
            'message'  => 'Dispositivo registrado. Guarda la API key — no podrás verla de nuevo.',
            'data'     => $device->load('aquarium:id,name'),
            // api_key está en $hidden en el modelo — lo exponemos explícitamente SOLO aquí
            'api_key'  => $plainKey,
        ], 201);
    }

    /**
     * GET /api/v1/devices/{device}
     *
     * Detalle completo del dispositivo con todos sus sensores y última lectura.
     */
    public function show(Device $device): JsonResponse
    {
        $this->authorize('view', $device);

        $device->load([
            'aquarium:id,name,species',
            'sensors' => fn ($q) => $q->with([
                'sensorType',
                'latestReading',
                'alertRules' => fn ($rq) => $rq->active(),
            ]),
        ]);

        // Agregar el rol del usuario sobre este dispositivo
        $role = $device->users()
                       ->where('users.id', auth()->id())
                       ->value('role') ?? 'owner'; // owner si es dueño del acuario

        return response()->json([
            'data' => array_merge($device->toArray(), [
                'current_user_role' => $role,
                'last_seen_human'   => $device->last_seen_human,
            ]),
        ]);
    }

    /**
     * PUT /api/v1/devices/{device}
     *
     * Actualiza datos del dispositivo (nombre, acuario, firmware, estado).
     */
    public function update(UpdateDeviceRequest $request, Device $device): JsonResponse
    {
        $this->authorize('update', $device);

        // Si cambia de acuario, verificar que el nuevo acuario sea del usuario
        if ($request->has('aquarium_id')) {
            $aquarium = Aquarium::findOrFail($request->validated('aquarium_id'));
            $this->authorize('update', $aquarium);
        }

        $device->update($request->validated());

        return response()->json([
            'message' => 'Dispositivo actualizado correctamente.',
            'data'    => $device->fresh()->load('aquarium:id,name'),
        ]);
    }

    /**
     * DELETE /api/v1/devices/{device}
     *
     * Elimina el dispositivo y todos sus datos (cascade en BD).
     */
    public function destroy(Device $device): JsonResponse
    {
        $this->authorize('delete', $device);

        $name = $device->name;
        $device->delete();

        return response()->json([
            'message' => "Dispositivo \"{$name}\" eliminado. Todos sus datos han sido borrados.",
        ]);
    }

    /**
     * POST /api/v1/devices/{device}/regenerate-key
     *
     * Genera una nueva API key para el dispositivo.
     * Invalida inmediatamente la key anterior.
     * Úsalo si la key fue comprometida.
     *
     * IMPORTANTE: después de esto el ESP32 dejará de funcionar hasta
     * que se flashee con la nueva key.
     */
    public function regenerateKey(Device $device): JsonResponse
    {
        $this->authorize('update', $device);

        $plainKey = $device->regenerateApiKey(); // Método del modelo

        return response()->json([
            'message' => 'API key regenerada. La key anterior ha sido invalidada inmediatamente.',
            'api_key' => $plainKey, // Única vez que se muestra en texto plano
        ]);
    }

    /**
     * POST /api/v1/devices/{device}/share
     *
     * Comparte acceso al dispositivo con otro usuario (rol 'viewer').
     *
     * Request: { "email": "colega@empresa.com", "role": "viewer" }
     */
    public function share(Request $request, Device $device): JsonResponse
    {
        $this->authorize('update', $device);

        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role'  => ['required', 'in:viewer,owner'],
        ]);

        $targetUser = \App\Models\User::where('email', $request->email)->firstOrFail();

        // Evitar que el dueño se comparta a sí mismo
        if ($targetUser->id === $request->user()->id) {
            return response()->json(['error' => 'No puedes compartir el dispositivo contigo mismo.'], 422);
        }

        // updateOrCreate: si ya tiene acceso, actualiza el rol
        UserDevice::updateOrCreate(
            ['user_id' => $targetUser->id, 'device_id' => $device->id],
            ['role'    => $request->role]
        );

        return response()->json([
            'message' => "Acceso compartido con {$targetUser->name} como {$request->role}.",
        ]);
    }

    /**
     * DELETE /api/v1/devices/{device}/share/{user}
     *
     * Revoca el acceso compartido de un usuario al dispositivo.
     */
    public function revokeShare(Device $device, \App\Models\User $user): JsonResponse
    {
        $this->authorize('update', $device);

        UserDevice::where('device_id', $device->id)
                  ->where('user_id', $user->id)
                  ->where('role', '!=', 'owner') // No se puede revocar al owner original
                  ->delete();

        return response()->json([
            'message' => "Acceso de {$user->name} revocado.",
        ]);
    }
}
