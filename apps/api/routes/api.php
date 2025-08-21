<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => response()->json(['status' => 'ok']));

Route::prefix('public')->group(function () {
    Route::get('{slug}/availability', [\App\Http\Controllers\PublicAvailabilityController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me/availability-rules', [\App\Http\Controllers\AvailabilityRulesController::class, 'index']);
    Route::post('/me/availability-rules', [\App\Http\Controllers\AvailabilityRulesController::class, 'store']);

    Route::get('/me/exceptions', [\App\Http\Controllers\ExceptionsController::class, 'index']);
    Route::post('/me/exceptions', [\App\Http\Controllers\ExceptionsController::class, 'store']);

    Route::get('/me/links', [\App\Http\Controllers\LinksController::class, 'index']);
    Route::post('/me/links', [\App\Http\Controllers\LinksController::class, 'store']);

    Route::get('/me/analytics/links', [\App\Http\Controllers\AnalyticsController::class, 'index']);
});

// Webhooks
Route::post('/webhooks/google', [\App\Http\Controllers\Webhooks\GoogleController::class, 'handle']);
Route::post('/webhooks/microsoft', [\App\Http\Controllers\Webhooks\MicrosoftController::class, 'handle']);
