<?php

use Illuminate\Support\Facades\Route;

// Serve React app for all routes except API routes
// This handles:
// - / (landing page)
// - /login, /register (auth pages)
// - /app/* (protected app routes)
// - /{slug} (public calendar links)
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api).*$');
