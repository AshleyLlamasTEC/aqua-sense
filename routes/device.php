<?php

use App\Http\Controllers\Api\V1\TelemetryController;
use Illuminate\Support\Facades\Route;

Route::middleware([
    'device.auth',
])->group(function () {

    Route::post(
        '/telemetry',
        [TelemetryController::class, 'store']
    )->name('telemetry.store');

});
