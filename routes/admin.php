<?php
 use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Api\V1\AquariumController;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::resource('aquariums', AquariumController::class)->names('aquariums');
