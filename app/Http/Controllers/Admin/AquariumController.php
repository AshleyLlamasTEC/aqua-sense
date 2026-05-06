<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Aquarium\StoreAquariumRequest;
use App\Models\Aquarium;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * Controller para la gestión administrativa de Acuarios vía Inertia.js.
 * Maneja la visualización, creación y monitoreo de alto nivel.
 */
class AquariumController extends Controller
{
    use AuthorizesRequests;

    /**
     * Lista los acuarios del usuario autenticado.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Validación de permisos mediante Policy (viewAny)
        $this->authorize('viewAny', Aquarium::class);

        $query = $request->user()
            ->aquariums()
            // Optimizamos la consulta obteniendo el conteo de hardware en una sola query
            ->withCount('devices')
            ->with([
                // Eager loading de dispositivos: Solo cargamos nodos 'online' para el dashboard principal
                'devices' => fn($q) =>
                $q->where('status', 'online')
                    ->select('id', 'aquarium_id', 'name', 'status', 'last_seen_at')
            ]);

        // Filtro condicional: permite segmentar acuarios en producción vs mantenimiento
        if ($request->boolean('active')) {
            $query->active();
        }

        $aquariums = $query->latest()->get();

        return Inertia::admin('Aquariums/Index', [
            'aquariums' => $aquariums,
        ]);
    }

    /**
     * Registra un nuevo ecosistema en la plataforma.
     *
     * @param StoreAquariumRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreAquariumRequest $request)
    {
        $this->authorize('create', Aquarium::class);

        // Forzamos la vinculación del acuario al usuario autenticado por seguridad (Mass Assignment Protection)
        $aquarium = Aquarium::create(
            array_merge($request->validated(), [
                'user_id' => $request->user()->id,
            ])
        );

        return redirect()
            ->route('admin.aquariums.index')
            ->with('success', 'Acuario creado correctamente.');
    }

    /**
     * Muestra el Dashboard detallado de telemetría de un acuario.
     *
     * @param Aquarium $aquarium
     * @return \Inertia\Response
     */
    public function show(Aquarium $aquarium)
    {
        // Verificación de propiedad/acceso al acuario específico
        $this->authorize('view', $aquarium);

        // Carga de metadatos de hardware
        $aquarium->loadCount('devices');

        // Carga profunda (Deep Eager Loading):
        // Obtenemos Dispositivos -> Sensores Activos -> Tipo de Sensor -> Última Lectura (IoT Hub)
        $aquarium->load([
            'devices' => function ($deviceQuery) {
                $deviceQuery->select(
                    'id',
                    'aquarium_id',
                    'name',
                    'mac_address',
                    'ip_address',
                    'firmware_version',
                    'status',
                    'last_seen_at'
                )->with([
                    'sensors' => function ($sensorQuery) {
                        // Solo sensores operativos para evitar ruido en el gráfico de telemetría
                        $sensorQuery->active()
                            ->with([
                                'sensorType',      // Metadata: unidades, rangos seguros, slugs
                                'latestReading',   // Estado actual del sensor (último valor registrado)
                                'readings' => function ($query) {
                                    $query
                                        ->valid()
                                        ->recent(100);
                                },
                            ]);
                    },
                ]);
            },
        ]);

        return Inertia::admin('Aquariums/Show', [
            'aquarium' => $aquarium
        ]);
    }
}
