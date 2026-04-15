<?php
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  app/Http/Middleware/DeviceApiKeyMiddleware.php                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
/**
 * ¿Qué es un Middleware?
 * ─────────────────────────────────────────────────────────────────────────
 * Un middleware es un filtro que se ejecuta ANTES (y/o después) del
 * controller. Inspecciona, modifica o rechaza el request antes de que
 * llegue a la lógica de negocio.
 *
 * Este middleware autentica a los dispositivos ESP32.
 * Los dispositivos NO usan Sanctum ni sesiones web — usan una API key
 * estática almacenada en su flash memory.
 *
 * Flujo de autenticación del dispositivo:
 *   1. ESP32 envía el request con header:
 *      X-Device-Key: <64-char-hex-key>
 *      X-Device-Mac: AA:BB:CC:DD:EE:FF
 *
 *   2. El middleware busca el dispositivo por MAC address
 *   3. Hashea la key recibida con SHA-256
 *   4. Compara el hash con el almacenado en BD (hash_equals = tiempo constante)
 *   5. Si coincide: adjunta el dispositivo al request y continúa
 *   6. Si no: devuelve 401 Unauthorized
 *
 * IMPORTANTE: Registrar en bootstrap/app.php (Laravel 11+):
 *   ->withMiddleware(function (Middleware $middleware) {
 *       $middleware->alias([
 *           'device.auth' => \App\Http\Middleware\DeviceApiKeyMiddleware::class,
 *       ]);
 *   })
 *
 * Uso en rutas:
 *   Route::middleware('device.auth')->group(...)
 */

namespace App\Http\Middleware;

use App\Models\Device;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeviceApiKeyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey    = $request->header('X-Device-Key');
        $macAddress = $request->header('X-Device-Mac');

        // Ambos headers son obligatorios
        if (! $apiKey || ! $macAddress) {
            return response()->json([
                'error'   => 'Autenticación requerida.',
                'message' => 'Headers X-Device-Key y X-Device-Mac son obligatorios.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Buscar el dispositivo por MAC (índice único → O(log n))
        $device = Device::where('mac_address', strtoupper($macAddress))->first();

        if (! $device) {
            return response()->json([
                'error' => 'Dispositivo no registrado.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Verificar la API key (tiempo constante para prevenir timing attacks)
        if (! $device->verifyApiKey($apiKey)) {
            return response()->json([
                'error' => 'API key inválida.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Marcar el dispositivo como online (actualiza last_seen_at)
        // withoutTimestamps() evita actualizar updated_at del modelo Device
        // solo por este ping — updated_at debe reflejar cambios reales
        $device->withoutTimestamps()->update([
            'last_seen_at' => now(),
            'status'       => 'online',
            'ip_address'   => $request->ip(),
        ]);

        // Adjuntar el dispositivo al request para que el controller lo use
        // sin hacer otra consulta a BD
        $request->merge(['_authenticated_device' => $device]);
        $request->attributes->set('device', $device);

        return $next($request);
    }
}
