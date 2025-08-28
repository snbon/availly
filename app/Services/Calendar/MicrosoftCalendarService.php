<?php

namespace App\Services\Calendar;

use App\Models\CalendarConnection;
use App\Models\ConnectedCalendar;
use App\Models\EventsCache;
use App\Models\User;
use Carbon\Carbon;
use Microsoft\Graph\GraphServiceClient;
use Microsoft\Graph\Generated\Models\Calendar;
use Microsoft\Graph\Generated\Models\Event;
use Microsoft\Kiota\Authentication\Oauth\ClientCredentialContext;
use Microsoft\Kiota\Authentication\PhpLeagueAuthenticationProvider;
use League\OAuth2\Client\Provider\GenericProvider;
use League\OAuth2\Client\Token\AccessToken;
use Illuminate\Support\Facades\Log;

class MicrosoftCalendarService
{
    private GenericProvider $oauthProvider;
    private ?GraphServiceClient $graphClient = null;

    public function __construct()
    {
        $this->oauthProvider = new GenericProvider([
            'clientId' => config('services.microsoft.client_id'),
            'clientSecret' => config('services.microsoft.client_secret'),
            'redirectUri' => config('services.microsoft.redirect_uri'),
            'urlAuthorize' => 'https://login.microsoftonline.com/' . config('services.microsoft.tenant') . '/oauth2/v2.0/authorize',
            'urlAccessToken' => 'https://login.microsoftonline.com/' . config('services.microsoft.tenant') . '/oauth2/v2.0/token',
            'urlResourceOwnerDetails' => '',
            'scopes' => 'https://graph.microsoft.com/Calendars.Read offline_access'
        ]);
    }

    /**
     * Get the OAuth authorization URL.
     */
    public function getAuthUrl(?string $state = null): string
    {
        $options = [
            'scope' => 'https://graph.microsoft.com/Calendars.Read offline_access'
        ];

        if ($state) {
            $options['state'] = $state;
        }

        return $this->oauthProvider->getAuthorizationUrl($options);
    }

    /**
     * Exchange authorization code for access token.
     */
    public function exchangeCodeForToken(string $code): array
    {
        $accessToken = $this->oauthProvider->getAccessToken('authorization_code', [
            'code' => $code
        ]);

        return [
            'access_token' => $accessToken->getToken(),
            'refresh_token' => $accessToken->getRefreshToken(),
            'expires_in' => $accessToken->getExpires() ? $accessToken->getExpires()->getTimestamp() - time() : 3600,
            'token_type' => 'Bearer',
            'scope' => 'https://graph.microsoft.com/Calendars.Read offline_access'
        ];
    }

    /**
     * Connect a user's Microsoft calendar.
     */
    public function connectUserCalendar(User $user, array $tokens): CalendarConnection
    {
        // Remove any existing Microsoft connections for this user
        $user->calendarConnections()
            ->where('provider', 'microsoft')
            ->delete();

        // Create new connection
        $connection = $user->calendarConnections()->create([
            'provider' => 'microsoft',
            'tokens_encrypted' => encrypt(json_encode($tokens)),
            'status' => 'active',
        ]);

        // Sync the user's calendar list
        $this->syncUserCalendarsList($connection);

        // Sync events immediately
        $this->syncUserEvents($user);

        return $connection;
    }

    /**
     * Get Microsoft Graph client with authentication.
     */
    private function getMicrosoftGraphClient(CalendarConnection $connection): GraphServiceClient
    {
        $tokens = json_decode(decrypt($connection->tokens_encrypted), true);

        // Create access token object
        $accessToken = new AccessToken([
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'] ?? null,
            'expires' => isset($tokens['expires_in']) ? time() + $tokens['expires_in'] : null
        ]);

        // Check if token needs refresh
        if ($accessToken->hasExpired() && $accessToken->getRefreshToken()) {
            $accessToken = $this->refreshAccessToken($connection);
        }

        // Create authentication provider
        $authProvider = new PhpLeagueAuthenticationProvider(
            $this->oauthProvider,
            $accessToken->getToken()
        );

        return new GraphServiceClient($authProvider);
    }

    /**
     * Refresh the access token.
     */
    public function refreshAccessToken(CalendarConnection $connection): AccessToken
    {
        $tokens = json_decode(decrypt($connection->tokens_encrypted), true);

        if (!isset($tokens['refresh_token'])) {
            $connection->markAsExpired();
            throw new \Exception('No refresh token available');
        }

        try {
            $newAccessToken = $this->oauthProvider->getAccessToken('refresh_token', [
                'refresh_token' => $tokens['refresh_token']
            ]);

            // Update stored tokens
            $updatedTokens = [
                'access_token' => $newAccessToken->getToken(),
                'refresh_token' => $newAccessToken->getRefreshToken() ?: $tokens['refresh_token'],
                'expires_in' => $newAccessToken->getExpires() ? $newAccessToken->getExpires()->getTimestamp() - time() : 3600,
                'token_type' => 'Bearer',
                'scope' => $tokens['scope'] ?? 'https://graph.microsoft.com/Calendars.Read offline_access'
            ];

            $connection->update([
                'tokens_encrypted' => encrypt(json_encode($updatedTokens)),
                'status' => 'active'
            ]);

            return $newAccessToken;

        } catch (\Exception $e) {
            Log::error('Failed to refresh Microsoft access token: ' . $e->getMessage());
            $connection->markAsExpired();
            throw $e;
        }
    }

    /**
     * Get user's calendars from Microsoft.
     */
    public function getUserCalendars(CalendarConnection $connection): array
    {
        try {
            $graphClient = $this->getMicrosoftGraphClient($connection);

            $calendars = $graphClient->me()->calendars()->get()->wait();

            $result = [];
            if ($calendars->getValue()) {
                foreach ($calendars->getValue() as $calendar) {
                    $result[] = [
                        'id' => $calendar->getId(),
                        'name' => $calendar->getName(),
                        'primary' => $calendar->getIsDefaultCalendar() ?? false,
                        'color' => $calendar->getColor() ?? null,
                        'access_role' => 'owner', // Microsoft Graph doesn't expose access roles like Google
                    ];
                }
            }

            Log::info('Found ' . count($result) . ' Microsoft calendars');
            return $result;

        } catch (\Exception $e) {
            Log::error('Failed to fetch Microsoft calendars: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'Unauthorized') || str_contains($e->getMessage(), '401')) {
                $connection->markAsExpired();
            }

            return [];
        }
    }

    /**
     * Sync user's calendar list with database.
     */
    public function syncUserCalendarsList(CalendarConnection $connection): void
    {
        $calendars = $this->getUserCalendars($connection);

        foreach ($calendars as $calendar) {
            $connection->connectedCalendars()->updateOrCreate(
                [
                    'provider_calendar_id' => $calendar['id']
                ],
                [
                    'included' => true // Default to including all calendars
                ]
            );
        }
    }

    /**
     * Sync events from Microsoft calendars.
     */
    public function syncUserEvents(User $user, ?Carbon $startDate = null, ?Carbon $endDate = null): void
    {
        $connection = $user->calendarConnections()
            ->where('provider', 'microsoft')
            ->where('status', 'active')
            ->first();

        if (!$connection) {
            return;
        }

        // Default to sync events from 1 month ago to 3 months in the future
        $startDate = $startDate ?: Carbon::now()->subMonth();
        $endDate = $endDate ?: Carbon::now()->addMonths(3);

        try {
            $graphClient = $this->getMicrosoftGraphClient($connection);

            // Get included calendars
            $includedCalendars = $connection->connectedCalendars()
                ->where('included', true)
                ->pluck('provider_calendar_id')
                ->toArray();

            if (empty($includedCalendars)) {
                // If no calendars are specifically included, include the primary calendar
                $calendars = $this->getUserCalendars($connection);
                $primaryCalendar = collect($calendars)->firstWhere('primary', true);
                if ($primaryCalendar) {
                    $includedCalendars = [$primaryCalendar['id']];
                }
            }

            // Clear existing events for this user and provider in the date range
            $user->eventsCache()
                ->where('provider', 'microsoft')
                ->whereBetween('start_at_utc', [$startDate, $endDate])
                ->delete();

            $totalEvents = 0;

            foreach ($includedCalendars as $calendarId) {
                // Get events from this calendar
                $events = $graphClient->me()
                    ->calendars()
                    ->byCalendarId($calendarId)
                    ->events()
                    ->get([
                        'filter' => "start/dateTime ge '{$startDate->toISOString()}' and end/dateTime le '{$endDate->toISOString()}'",
                        'select' => 'id,subject,start,end,isAllDay,showAs',
                        'orderby' => 'start/dateTime'
                    ])
                    ->wait();

                if ($events->getValue()) {
                    foreach ($events->getValue() as $event) {
                        $this->storeEvent($user, $event);
                        $totalEvents++;
                    }
                }
            }

            Log::info("Synced {$totalEvents} Microsoft events for user {$user->id}");

        } catch (\Exception $e) {
            Log::error('Failed to sync Microsoft events: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'Unauthorized') || str_contains($e->getMessage(), '401')) {
                $connection->markAsExpired();
            }
        }
    }

    /**
     * Store a Microsoft event in the cache.
     */
    private function storeEvent(User $user, Event $event): void
    {
        $startDateTime = $event->getStart();
        $endDateTime = $event->getEnd();

        // Convert Microsoft Graph DateTime to Carbon
        $startAt = Carbon::parse($startDateTime->getDateTime())->utc();
        $endAt = Carbon::parse($endDateTime->getDateTime())->utc();

        // Handle all-day events
        $isAllDay = $event->getIsAllDay() ?? false;
        if ($isAllDay) {
            // For all-day events, adjust the end time to be inclusive
            $endAt = $endAt->subSecond();
        }

        EventsCache::updateOrCreate([
            'user_id' => $user->id,
            'provider' => 'microsoft',
            'ext_event_id' => $event->getId(),
        ], [
            'title' => $event->getSubject() ?? 'Untitled',
            'start_at_utc' => $startAt,
            'end_at_utc' => $endAt,
            'all_day' => $isAllDay,
            'visibility' => $this->mapMicrosoftVisibility($event->getShowAs()),
        ]);
    }

    /**
     * Map Microsoft event visibility to our system.
     */
    private function mapMicrosoftVisibility(?string $showAs): string
    {
        return match($showAs) {
            'free' => 'transparent',
            'busy', 'tentative', 'oof' => 'private',
            default => 'private'
        };
    }
}
