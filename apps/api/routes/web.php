<?php

use Illuminate\Support\Facades\Route;

// Public calendar routes - these need to be handled at the root domain
Route::get('/u/{slug}', [\App\Http\Controllers\PublicAvailabilityController::class, 'show']);
Route::get('/u/{slug}/availability', [\App\Http\Controllers\PublicAvailabilityController::class, 'show']);

Route::get('/', function () {
    return view('welcome');
});
