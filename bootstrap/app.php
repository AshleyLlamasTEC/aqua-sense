<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(
    basePath: dirname(__DIR__)
)
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            /*
            |--------------------------------------------------------------------------
            | Admin (Inertia)
            |--------------------------------------------------------------------------
            */
            Route::middleware([
                'web',
                'auth',
            ])
                ->prefix('admin')
                ->name('admin.')
                ->group(
                    base_path('routes/admin.php')
                );
            /*
            |--------------------------------------------------------------------------
            | API V1
            |--------------------------------------------------------------------------
            */
            Route::middleware([
                'api',
                'auth:sanctum',
            ])
                ->prefix('api/v1')
                ->name('api.v1.')
                ->group(
                    base_path('routes/api.php')
                );

            /*
            |--------------------------------------------------------------------------
            | Device API V1
            |--------------------------------------------------------------------------
            */

            Route::middleware([
                'api',
            ])
                ->prefix('device/v1')
                ->name('device.v1.')
                ->group(
                    base_path('routes/device.php')
                );
        }
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'device.auth' => \App\Http\Middleware\DeviceApiKeyMiddleware::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {})

    ->create();
