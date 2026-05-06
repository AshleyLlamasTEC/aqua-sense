<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\AquariumController;
use App\Http\Controllers\Admin\DeviceController;

Route::get('/', [HomeController::class, 'index'])->name('home');

//Aquariums
Route::resource('aquariums', AquariumController::class)->names('aquariums');

//Devices
Route::post('/devices/claim', [DeviceController::class, 'claim'])
    ->name('devices.claim');
Route::resource('devices', DeviceController::class)->names('devices');

