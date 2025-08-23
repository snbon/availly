<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => response()->json(['status' => 'ok']));

// Authentication routes
Route::post('/auth/register', [\App\Http\Controllers\Auth\AuthController::class, 'register']);
Route::post('/auth/login', [\App\Http\Controllers\Auth\AuthController::class, 'login']);
Route::post('/auth/verify-email', [\App\Http\Controllers\Auth\AuthController::class, 'verifyEmail']);
Route::post('/auth/resend-verification', [\App\Http\Controllers\Auth\AuthController::class, 'resendVerification']);

Route::prefix('public')->group(function () {
    Route::get('{slug}/availability', [\App\Http\Controllers\PublicAvailabilityController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [\App\Http\Controllers\Auth\AuthController::class, 'me']);
    Route::post('/auth/logout', [\App\Http\Controllers\Auth\AuthController::class, 'logout']);

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
