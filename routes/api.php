<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/health', fn() => response()->json(['status' => 'ok']));

// Debug route to check Google OAuth config (remove in production)
Route::get('/debug/google-config', function() {
    return response()->json([
        'client_id' => config('services.google.client_id'),
        'redirect_uri' => config('services.google.redirect_uri'),
        'app_url' => config('app.url'),
    ]);
});

// Authentication routes
Route::post('/auth/register', [\App\Http\Controllers\Auth\AuthController::class, 'register']);
Route::post('/auth/login', [\App\Http\Controllers\Auth\AuthController::class, 'login']);
Route::post('/auth/verify-email', [\App\Http\Controllers\Auth\AuthController::class, 'verifyEmail']);
Route::post('/auth/resend-verification', [\App\Http\Controllers\Auth\AuthController::class, 'resendVerification']);

Route::prefix('public')->group(function () {
    Route::get('{slug}/availability', [\App\Http\Controllers\PublicAvailabilityController::class, 'show']);
});

// OAuth callbacks (no auth required)
Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'callback']);
Route::get('/auth/microsoft/callback', [\App\Http\Controllers\Auth\MicrosoftAuthController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [\App\Http\Controllers\Auth\AuthController::class, 'me']);
    Route::post('/auth/logout', [\App\Http\Controllers\Auth\AuthController::class, 'logout']);

    // Profile routes
    Route::get('/me/profile', [\App\Http\Controllers\ProfileController::class, 'show']);
    Route::put('/me/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::put('/me/profile/username', [\App\Http\Controllers\ProfileController::class, 'updateUsername']);
    Route::post('/me/profile/check-username', [\App\Http\Controllers\ProfileController::class, 'checkUsername']);
    Route::post('/me/profile/generate-email-text', [\App\Http\Controllers\ProfileController::class, 'generateEmailText']);

    // Test route to check current user timezone
    Route::get('/me/test-timezone', function(Request $request) {
        $user = $request->user();
        return response()->json([
            'user_id' => $user->id,
            'current_timezone' => $user->timezone,
            'database_value' => \DB::table('users')->where('id', $user->id)->value('timezone')
        ]);
    });

    Route::get('/me/availability-rules', [\App\Http\Controllers\AvailabilityRulesController::class, 'index']);
    Route::post('/me/availability-rules', [\App\Http\Controllers\AvailabilityRulesController::class, 'store']);
    Route::delete('/me/availability-rules/{id}', [\App\Http\Controllers\AvailabilityRulesController::class, 'destroy']);

    Route::get('/me/exceptions', [\App\Http\Controllers\ExceptionsController::class, 'index']);
    Route::post('/me/exceptions', [\App\Http\Controllers\ExceptionsController::class, 'store']);

    Route::get('/me/links', [\App\Http\Controllers\LinksController::class, 'index']);
    Route::post('/me/links', [\App\Http\Controllers\LinksController::class, 'store']);

    Route::get('/me/analytics/links', [\App\Http\Controllers\AnalyticsController::class, 'index']);
    Route::get('/me/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

    // Calendar connections
    Route::prefix('me/calendar')->group(function () {
        Route::get('/connections', [\App\Http\Controllers\CalendarConnectionsController::class, 'index']);
        Route::get('/connections/{connectionId}/calendars', [\App\Http\Controllers\CalendarConnectionsController::class, 'getCalendars']);
        Route::put('/connections/{connectionId}/calendars', [\App\Http\Controllers\CalendarConnectionsController::class, 'updateCalendarInclusion']);
        Route::post('/sync', [\App\Http\Controllers\CalendarConnectionsController::class, 'sync']);
        Route::get('/events', [\App\Http\Controllers\CalendarConnectionsController::class, 'getEvents']);

                        // Google Calendar OAuth
                Route::post('/google/connect', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'redirect']);
                Route::delete('/google/disconnect', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'disconnect']);

                // Microsoft Calendar OAuth
                Route::post('/microsoft/connect', [\App\Http\Controllers\Auth\MicrosoftAuthController::class, 'redirect']);
                Route::delete('/microsoft/disconnect', [\App\Http\Controllers\Auth\MicrosoftAuthController::class, 'disconnect']);

                // Apple Calendar CalDAV
                Route::post('/apple/connect', [\App\Http\Controllers\Auth\AppleAuthController::class, 'connect']);
                Route::post('/apple/test', [\App\Http\Controllers\Auth\AppleAuthController::class, 'testConnection']);
                Route::get('/apple/status', [\App\Http\Controllers\Auth\AppleAuthController::class, 'status']);
                Route::delete('/apple/disconnect', [\App\Http\Controllers\Auth\AppleAuthController::class, 'disconnect']);
    });
});

// Webhooks
Route::post('/webhooks/google', [\App\Http\Controllers\Webhooks\GoogleController::class, 'handle']);
Route::post('/webhooks/microsoft', [\App\Http\Controllers\Webhooks\MicrosoftController::class, 'handle']);


