<?php

namespace App\Services\Calendar;

use App\Models\CalendarConnection;
use App\Models\ConnectedCalendar;
use App\Models\EventsCache;
use App\Models\User;
use Carbon\Carbon;
use Google_Client;
use Google_Service_Calendar;
use Google_Service_Calendar_Events;
use Illuminate\Support\Facades\Log;

class GoogleCalendarService
{
    private Google_Client $client;

    public function __construct()
    {
        $this->client = new Google_Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect_uri'));
        $this->client->setScopes([
            Google_Service_Calendar::CALENDAR_READONLY,
        ]);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    /**
     * Get the OAuth authorization URL.
     */
    public function getAuthUrl(string $state = null): string
    {
        if ($state) {
            $this->client->setState($state);
        }

        return $this->client->createAuthUrl();
    }

    /**
     * Exchange authorization code for access token.
     */
    public function exchangeCodeForToken(string $code): array
    {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            throw new \Exception('Failed to exchange code for token: ' . $token['error_description']);
        }

        return $token;
    }

    /**
     * Create or update calendar connection for user.
     */
    public function connectUserCalendar(User $user, array $tokens): CalendarConnection
    {
        // Check if connection already exists
        $connection = $user->calendarConnections()
            ->where('provider', 'google')
            ->first();

        if ($connection) {
            // Update existing connection
            $connection->update([
                'tokens_encrypted' => encrypt(json_encode($tokens)),
                'status' => 'active',
            ]);
        } else {
            // Create new connection
            $connection = $user->calendarConnections()->create([
                'provider' => 'google',
                'tokens_encrypted' => encrypt(json_encode($tokens)),
                'status' => 'active',
            ]);
        }

        // Sync calendars list
        $this->syncUserCalendarsList($connection);

        return $connection;
    }

    /**
     * Sync the list of available calendars for a connection.
     */
    public function syncUserCalendarsList(CalendarConnection $connection): void
    {
        try {
            $this->setClientTokens($connection);
            $service = new Google_Service_Calendar($this->client);

            $calendarList = $service->calendarList->listCalendarList();

            foreach ($calendarList->getItems() as $calendarListEntry) {
                $calendarId = $calendarListEntry->getId();

                // Create or update connected calendar
                ConnectedCalendar::updateOrCreate(
                    [
                        'connection_id' => $connection->id,
                        'provider_calendar_id' => $calendarId,
                    ],
                    [
                        'included' => $calendarListEntry->getSelected() ?? true, // Include by default
                    ]
                );
            }

            Log::info('Synced calendar list for user', [
                'user_id' => $connection->user_id,
                'calendars_count' => count($calendarList->getItems())
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to sync calendar list', [
                'user_id' => $connection->user_id,
                'error' => $e->getMessage()
            ]);

            if ($this->isTokenExpired($e)) {
                $connection->markAsExpired();
            }
        }
    }

    /**
     * Sync events for a user's connected calendars.
     */
    public function syncUserEvents(User $user, Carbon $startDate = null, Carbon $endDate = null): void
    {
        $connection = $user->googleCalendarConnection();

        if (!$connection || !$connection->isActive()) {
            return;
        }

        // Default to sync next 30 days
        $startDate = $startDate ?? Carbon::now();
        $endDate = $endDate ?? Carbon::now()->addDays(30);

        try {
            $this->setClientTokens($connection);
            $service = new Google_Service_Calendar($this->client);

            // Get included calendars
            $includedCalendars = $connection->connectedCalendars()
                ->where('included', true)
                ->get();

            foreach ($includedCalendars as $connectedCalendar) {
                $this->syncCalendarEvents(
                    $service,
                    $user,
                    $connectedCalendar->provider_calendar_id,
                    $startDate,
                    $endDate
                );
            }

            Log::info('Synced events for user', [
                'user_id' => $user->id,
                'calendars_count' => $includedCalendars->count(),
                'date_range' => $startDate->toDateString() . ' to ' . $endDate->toDateString()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to sync user events', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            if ($this->isTokenExpired($e)) {
                $connection->markAsExpired();
            }
        }
    }

    /**
     * Sync events for a specific calendar.
     */
    private function syncCalendarEvents(
        Google_Service_Calendar $service,
        User $user,
        string $calendarId,
        Carbon $startDate,
        Carbon $endDate
    ): void {
        $optParams = [
            'timeMin' => $startDate->toISOString(),
            'timeMax' => $endDate->toISOString(),
            'singleEvents' => true,
            'orderBy' => 'startTime',
            'maxResults' => 2500,
        ];

        $events = $service->events->listEvents($calendarId, $optParams);

        foreach ($events->getItems() as $event) {
            $this->cacheEvent($user, $event, $calendarId);
        }
    }

    /**
     * Cache a Google Calendar event.
     */
    private function cacheEvent(User $user, $event, string $calendarId): void
    {
        $start = $event->getStart();
        $end = $event->getEnd();

        // Handle all-day events
        $allDay = false;
        if ($start->getDate()) {
            $startDateTime = Carbon::parse($start->getDate())->startOfDay();
            $endDateTime = Carbon::parse($end->getDate())->startOfDay();
            $allDay = true;
        } else {
            $startDateTime = Carbon::parse($start->getDateTime());
            $endDateTime = Carbon::parse($end->getDateTime());
        }

        // Convert to UTC
        $startUtc = $startDateTime->utc();
        $endUtc = $endDateTime->utc();

        // Skip events that are too short (less than 1 minute) or invalid
        if ($endUtc <= $startUtc) {
            return;
        }

        EventsCache::updateOrCreate(
            [
                'user_id' => $user->id,
                'provider' => 'google',
                'ext_event_id' => $event->getId(),
            ],
            [
                'title' => $event->getSummary() ?? 'Untitled Event',
                'start_at_utc' => $startUtc,
                'end_at_utc' => $endUtc,
                'all_day' => $allDay,
                'visibility' => $event->getVisibility() === 'public' ? 'public' : 'private',
            ]
        );
    }

    /**
     * Set client tokens from connection.
     */
    private function setClientTokens(CalendarConnection $connection): void
    {
        $tokens = json_decode(decrypt($connection->tokens_encrypted), true);

        $this->client->setAccessToken($tokens);

        // Refresh token if needed
        if ($this->client->isAccessTokenExpired() && isset($tokens['refresh_token'])) {
            $newTokens = $this->client->fetchAccessTokenWithRefreshToken($tokens['refresh_token']);

            if (isset($newTokens['error'])) {
                throw new \Exception('Failed to refresh token: ' . $newTokens['error_description']);
            }

            // Update stored tokens
            $connection->update([
                'tokens_encrypted' => encrypt(json_encode($newTokens)),
            ]);
        }
    }

    /**
     * Check if the exception indicates an expired token.
     */
    private function isTokenExpired(\Exception $e): bool
    {
        return strpos($e->getMessage(), 'invalid_grant') !== false ||
               strpos($e->getMessage(), 'Token has been expired') !== false ||
               strpos($e->getMessage(), '401') !== false;
    }

    /**
     * Get user's calendar list with metadata.
     */
    public function getUserCalendars(CalendarConnection $connection): array
    {
        try {
            $this->setClientTokens($connection);
            $service = new Google_Service_Calendar($this->client);

            $calendarList = $service->calendarList->listCalendarList();
            $calendars = [];

            foreach ($calendarList->getItems() as $calendarListEntry) {
                $calendars[] = [
                    'id' => $calendarListEntry->getId(),
                    'name' => $calendarListEntry->getSummary(),
                    'primary' => $calendarListEntry->getPrimary() ?? false,
                    'color' => $calendarListEntry->getColorId(),
                    'access_role' => $calendarListEntry->getAccessRole(),
                ];
            }

            return $calendars;

        } catch (\Exception $e) {
            Log::error('Failed to get user calendars', [
                'user_id' => $connection->user_id,
                'error' => $e->getMessage()
            ]);

            if ($this->isTokenExpired($e)) {
                $connection->markAsExpired();
            }

            return [];
        }
    }
}
