<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY'),
        'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect_uri' => env('GOOGLE_REDIRECT_URI', 'https://availly.me/api/auth/google/callback'),
    ],

    'microsoft' => [
        'client_id' => env('MICROSOFT_CLIENT_ID'),
        'client_secret' => env('MICROSOFT_CLIENT_SECRET'),
        'redirect_uri' => env('MICROSOFT_REDIRECT_URI', 'https://availly.me/api/auth/microsoft/callback'),
        'tenant' => env('MICROSOFT_TENANT_ID', 'common'), // 'common' for multi-tenant, or specific tenant ID
    ],

    'apple' => [
        'caldav_server' => env('APPLE_CALDAV_SERVER', 'https://caldav.icloud.com'),
        'carddav_server' => env('APPLE_CARDDAV_SERVER', 'https://contacts.icloud.com'),
        'principal_url_template' => env('APPLE_PRINCIPAL_URL', 'https://caldav.icloud.com/{apple_id}/principal/'),
        'calendar_home_url_template' => env('APPLE_CALENDAR_HOME_URL', 'https://caldav.icloud.com/{apple_id}/calendars/'),
    ],

];
