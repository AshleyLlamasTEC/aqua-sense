<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TelemetryReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    /**
     * Recibe telemetría desde un ESP32 autenticado.
     *
     * Headers:
     * X-Device-Key
     * X-Device-Mac
     *
     * Payload:
     *
     * {
     *   "readings": [
     *      {
     *          "sensor_slug": "temperature",
     *          "value": 26.4
     *      }
     *   ]
     * }
     */
    public function store(
        Request $request
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | 1. Dispositivo autenticado
        |--------------------------------------------------------------------------
        */

        $device = $request
            ->attributes
            ->get('device');

        /*
        |--------------------------------------------------------------------------
        | 2. Validar payload
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'readings' => [
                'required',
                'array',
                'min:1',
            ],
            'readings.*.sensor_slug' => [
                'required',
                'string',
            ],
            'readings.*.value' => [
                'required',
                'numeric',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 3. Precargar sensores del nodo
        |--------------------------------------------------------------------------
        */

        $device->load([
            'sensors.sensorType',
        ]);

        $processed = 0;

        /*
        |--------------------------------------------------------------------------
        | 4. Procesar lecturas
        |--------------------------------------------------------------------------
        */

        foreach (
            $validated['readings']
            as $reading
        ) {

            $sensor = $device
                ->sensors
                ->first(
                    fn ($sensor) =>
                    $sensor
                        ->sensorType?->slug
                    ===
                    $reading['sensor_slug']
                );

            /*
            |--------------------------------------------------------------------------
            | Sensor desconocido
            |--------------------------------------------------------------------------
            */

            if (! $sensor) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Valor bruto
            |--------------------------------------------------------------------------
            */

            $rawValue = $reading['value'];

            /*
            |--------------------------------------------------------------------------
            | Aplicar calibración
            |--------------------------------------------------------------------------
            */

            $calibratedValue =
                (
                    $rawValue
                    + $sensor->calibration_offset
                )
                *
                $sensor->calibration_factor;

            /*
            |--------------------------------------------------------------------------
            | Evaluar calidad
            |--------------------------------------------------------------------------
            */

            $qualityFlag = 0;

            $sensorType =
                $sensor->sensorType;

            if (
                $calibratedValue < $sensorType->op_min
                ||
                $calibratedValue > $sensorType->op_max
            ) {
                $qualityFlag = 2;
            }

            /*
            |--------------------------------------------------------------------------
            | Persistir
            |--------------------------------------------------------------------------
            */

            TelemetryReading::create([
                'device_sensor_id' =>
                    $sensor->id,
                'raw_value' =>
                    $rawValue,
                'value' => round(
                    $calibratedValue,
                    4
                ),
                'quality_flag' =>
                    $qualityFlag,
                'recorded_at' =>
                    now(),

            ]);

            $processed++;
        }

        /*
        |--------------------------------------------------------------------------
        | Respuesta
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
                'Telemetry received.',
            'device' =>
                $device->name,
            'processed' =>
                $processed,
        ]);
    }
}
