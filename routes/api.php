<?php

use App\Http\Controllers\Api\V1\AquariumController;
use App\Http\Controllers\Api\V1\DeviceController;
use Illuminate\Support\Facades\Route;

//Aquariums
Route::resource('aquariums', AquariumController::class)->except(['create', 'edit'])->names('aquariums');

//Devices
Route::resource('devices', DeviceController::class)->except(['create', 'edit'])->names('devices');
