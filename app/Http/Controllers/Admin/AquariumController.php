<?php
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  app/Http/Controllers/Api/V1/AquariumController.php                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝
/**
 * CONTROLLER: AquariumController
 * ─────────────────────────────────────────────────────────────────────────
 * Gestiona el CRUD completo de acuarios para el usuario autenticado.
 *
 * Principio de thin controller:
 *   - Autorizar con $this->authorize() → Policy
 *   - Validar con FormRequest (se inyecta automáticamente)
 *   - Delegar lógica compleja a Services
 *   - Devolver respuesta JSON estructurada
 *
 * Rutas que responde este controller (ver routes/api.php):
 *   GET    /api/v1/aquariums          → index
 *   POST   /api/v1/aquariums          → store
 *   GET    /api/v1/aquariums/{id}     → show
 *   PUT    /api/v1/aquariums/{id}     → update
 *   DELETE /api/v1/aquariums/{id}     → destroy
 */

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Aquarium\StoreAquariumRequest;
use App\Http\Requests\Aquarium\UpdateAquariumRequest;
use App\Models\Aquarium;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AquariumController extends Controller
{
    /**
     * GET /api/v1/aquariums
     *
     * Lista todos los acuarios del usuario autenticado.
     * Incluye el conteo de dispositivos para el dashboard (withCount).
     * Permite filtrar por is_active con ?active=1
     *
     * Ejemplo response:
     * {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Acuario Principal",
     *       "species": "Tilapia",
     *       "is_active": true,
     *       "devices_count": 2,
     *       "created_at": "2026-01-15T10:00:00Z"
     *     }
     *   ],
     *   "total": 1
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Aquarium::class);

        $query = $request->user()
            ->aquariums()
            ->withCount('devices')              // Agrega devices_count sin N+1
            ->with(['devices' => fn ($q) =>     // Carga solo dispositivos activos
                $q->where('status', 'online')
                  ->select('id', 'aquarium_id', 'name', 'status', 'last_seen_at')
            ]);

        // Filtro opcional por estado
        if ($request->boolean('active')) {
            $query->active();
        }

        $aquariums = $query->latest()->get();

        return response()->json([
            'data'  => $aquariums,
            'total' => $aquariums->count(),
        ]);
    }

    /**
     * POST /api/v1/aquariums
     *
     * Crea un nuevo acuario para el usuario autenticado.
     * El FormRequest ya validó los datos — aquí solo creamos.
     *
     * Request body:
     * {
     *   "name": "Estanque Norte",
     *   "description": "Estanque exterior de producción",
     *   "volume_liters": 2500,
     *   "species": "Trucha"
     * }
     */
    public function store(StoreAquariumRequest $request): JsonResponse
    {
        $this->authorize('create', Aquarium::class);

        // merge() agrega user_id al validated() para que no sea enviable desde fuera
        // El usuario no puede asignarse a otro usuario — lo forzamos aquí
        $aquarium = Aquarium::create(
            array_merge($request->validated(), [
                'user_id' => $request->user()->id,
            ])
        );

        return response()->json([
            'message' => 'Acuario creado correctamente.',
            'data'    => $aquarium,
        ], 201);
    }

    /**
     * GET /api/v1/aquariums/{aquarium}
     *
     * Muestra el detalle de un acuario con sus dispositivos y sensores.
     * Route Model Binding: Laravel resuelve {aquarium} automáticamente.
     *
     * Response incluye:
     *   - Datos del acuario
     *   - Dispositivos con sus sensores activos
     *   - Última lectura de cada sensor (desde cache via latestReading)
     */
    public function show(Aquarium $aquarium): JsonResponse
    {
        $this->authorize('view', $aquarium);

        $aquarium->load([
            'devices' => function ($q) {
                $q->with([
                    'sensors' => function ($sq) {
                        $sq->active()
                           ->with(['sensorType', 'latestReading']);
                    },
                ]);
            },
        ]);

        return response()->json(['data' => $aquarium]);
    }

    /**
     * PUT /api/v1/aquariums/{aquarium}
     *
     * Actualiza un acuario. Solo los campos enviados son actualizados
     * gracias al 'sometimes' en UpdateAquariumRequest.
     */
    public function update(UpdateAquariumRequest $request, Aquarium $aquarium): JsonResponse
    {
        $this->authorize('update', $aquarium);

        $aquarium->update($request->validated());

        return response()->json([
            'message' => 'Acuario actualizado correctamente.',
            'data'    => $aquarium->fresh(), // fresh() recarga desde BD
        ]);
    }

    /**
     * DELETE /api/v1/aquariums/{aquarium}
     *
     * Elimina el acuario. La migración define cascadeOnDelete() en devices,
     * por lo que todos los datos relacionados se eliminan en cascada en BD.
     *
     * ADVERTENCIA: operación irreversible. El frontend debe pedir confirmación.
     */
    public function destroy(Aquarium $aquarium): JsonResponse
    {
        $this->authorize('delete', $aquarium);

        $name = $aquarium->name;
        $aquarium->delete();

        return response()->json([
            'message' => "Acuario \"{$name}\" eliminado correctamente.",
        ]);
    }
}
