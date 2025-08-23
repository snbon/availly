<?php

namespace App\Services\Calendar;

use App\Models\CalendarConnection;
use App\Models\ConnectedCalendar;
use App\Models\EventsCache;
use App\Models\User;
use Carbon\Carbon;
use Sabre\DAV\Client;
use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\Reader;
use Illuminate\Support\Facades\Log;
use Exception;

class AppleCalendarService
{
    private ?Client $davClient = null;
    private array $config;

    public function __construct()
    {
        $this->config = config('services.apple');
    }

    /**
     * Connect a user's Apple calendar using CalDAV.
     */
    public function connectUserCalendar(User $user, string $appleId, string $appSpecificPassword): CalendarConnection
    {
        // Test the connection first
        $client = $this->createCalDAVClient($appleId, $appSpecificPassword);

        // Verify connection by attempting to get principal
        $principalUrl = $this->getPrincipalUrl($appleId);

        try {
            $response = $client->propfind($principalUrl, [
                '{DAV:}displayname',
                '{urn:ietf:params:xml:ns:caldav}calendar-home-set'
            ]);

            if (!$response) {
                throw new Exception('Unable to connect to Apple Calendar. Please check your credentials.');
            }

        } catch (Exception $e) {
            Log::error('Apple CalDAV connection failed: ' . $e->getMessage());
            throw new Exception('Failed to connect to Apple Calendar: ' . $e->getMessage());
        }

        // Remove any existing Apple connections for this user
        $user->calendarConnections()
            ->where('provider', 'apple')
            ->delete();

        // Store credentials securely
        $credentials = [
            'apple_id' => $appleId,
            'app_specific_password' => $appSpecificPassword,
            'principal_url' => $principalUrl,
            'calendar_home_url' => $this->getCalendarHomeUrl($appleId),
        ];

        // Create new connection
        $connection = $user->calendarConnections()->create([
            'provider' => 'apple',
            'tokens_encrypted' => encrypt(json_encode($credentials)),
            'status' => 'active',
        ]);

        // Sync the user's calendar list
        $this->syncUserCalendarsList($connection);

        // Sync events immediately
        $this->syncUserEvents($user);

        return $connection;
    }

    /**
     * Create CalDAV client for Apple iCloud.
     */
    private function createCalDAVClient(string $appleId, string $appSpecificPassword): Client
    {
        $settings = [
            'baseUri' => $this->config['caldav_server'],
            'userName' => $appleId,
            'password' => $appSpecificPassword,
            'authType' => Client::AUTH_BASIC,
        ];

        return new Client($settings);
    }

    /**
     * Get CalDAV client from connection.
     */
    private function getCalDAVClient(CalendarConnection $connection): Client
    {
        if ($this->davClient) {
            return $this->davClient;
        }

        $credentials = json_decode(decrypt($connection->tokens_encrypted), true);

        $this->davClient = $this->createCalDAVClient(
            $credentials['apple_id'],
            $credentials['app_specific_password']
        );

        return $this->davClient;
    }

    /**
     * Get principal URL for Apple ID.
     */
    private function getPrincipalUrl(string $appleId): string
    {
        return str_replace('{apple_id}', $appleId, $this->config['principal_url_template']);
    }

    /**
     * Get calendar home URL for Apple ID.
     */
    private function getCalendarHomeUrl(string $appleId): string
    {
        return str_replace('{apple_id}', $appleId, $this->config['calendar_home_url_template']);
    }

    /**
     * Get user's calendars from Apple via CalDAV.
     */
    public function getUserCalendars(CalendarConnection $connection): array
    {
        try {
            $client = $this->getCalDAVClient($connection);
            $credentials = json_decode(decrypt($connection->tokens_encrypted), true);

            $calendarHomeUrl = $credentials['calendar_home_url'];

            // Get calendar collection
            $response = $client->propfind($calendarHomeUrl, [
                '{DAV:}displayname',
                '{DAV:}resourcetype',
                '{urn:ietf:params:xml:ns:caldav}calendar-description',
                '{http://apple.com/ns/ical/}calendar-color',
                '{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set'
            ], 1); // Depth 1 to get child calendars

            $calendars = [];

            foreach ($response as $url => $properties) {
                // Check if this is a calendar collection
                if (!$this->isCalendarCollection($properties)) {
                    continue;
                }

                // Skip if it doesn't support VEVENT components
                if (!$this->supportsEvents($properties)) {
                    continue;
                }

                $displayName = $properties['{DAV:}displayname'] ?? basename($url);
                $description = $properties['{urn:ietf:params:xml:ns:caldav}calendar-description'] ?? '';
                $color = $properties['{http://apple.com/ns/ical/}calendar-color'] ?? null;

                $calendars[] = [
                    'id' => $url,
                    'name' => $displayName,
                    'description' => $description,
                    'color' => $color,
                    'primary' => $this->isPrimaryCalendar($url, $displayName),
                    'access_role' => 'owner', // CalDAV doesn't expose detailed permissions
                ];
            }

            Log::info('Found ' . count($calendars) . ' Apple calendars');
            return $calendars;

        } catch (Exception $e) {
            Log::error('Failed to fetch Apple calendars: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'Unauthorized') || str_contains($e->getMessage(), '401')) {
                $connection->markAsExpired();
            }

            return [];
        }
    }

    /**
     * Check if resource is a calendar collection.
     */
    private function isCalendarCollection(array $properties): bool
    {
        $resourceType = $properties['{DAV:}resourcetype'] ?? null;

        if (!$resourceType) {
            return false;
        }

        return str_contains($resourceType, 'calendar');
    }

    /**
     * Check if calendar supports VEVENT components.
     */
    private function supportsEvents(array $properties): bool
    {
        $supportedComponents = $properties['{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set'] ?? '';

        // If no supported components specified, assume it supports events
        if (empty($supportedComponents)) {
            return true;
        }

        return str_contains($supportedComponents, 'VEVENT');
    }

    /**
     * Determine if this is the primary calendar.
     */
    private function isPrimaryCalendar(string $url, string $displayName): bool
    {
        // Apple's default calendar is usually named "Calendar" or contains "calendar" in the URL
        return str_contains(strtolower($displayName), 'calendar') ||
               str_contains(strtolower($url), 'calendar');
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
     * Sync events from Apple calendars via CalDAV.
     */
    public function syncUserEvents(User $user, ?Carbon $startDate = null, ?Carbon $endDate = null): void
    {
        $connection = $user->calendarConnections()
            ->where('provider', 'apple')
            ->where('status', 'active')
            ->first();

        if (!$connection) {
            return;
        }

        // Default to sync events from 1 month ago to 3 months in the future
        $startDate = $startDate ?: Carbon::now()->subMonth();
        $endDate = $endDate ?: Carbon::now()->addMonths(3);

        try {
            $client = $this->getCalDAVClient($connection);

            // Get included calendars
            $includedCalendars = $connection->connectedCalendars()
                ->where('included', true)
                ->pluck('provider_calendar_id')
                ->toArray();

            if (empty($includedCalendars)) {
                // If no calendars are specifically included, include all calendars
                $calendars = $this->getUserCalendars($connection);
                $includedCalendars = array_column($calendars, 'id');
            }

            // Clear existing events for this user and provider in the date range
            $user->eventsCache()
                ->where('provider', 'apple')
                ->whereBetween('start_at_utc', [$startDate, $endDate])
                ->delete();

            $totalEvents = 0;

            foreach ($includedCalendars as $calendarUrl) {
                $events = $this->fetchCalendarEvents($client, $calendarUrl, $startDate, $endDate);

                foreach ($events as $event) {
                    $this->storeEvent($user, $event, $calendarUrl);
                    $totalEvents++;
                }
            }

            Log::info("Synced {$totalEvents} Apple events for user {$user->id}");

        } catch (Exception $e) {
            Log::error('Failed to sync Apple events: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'Unauthorized') || str_contains($e->getMessage(), '401')) {
                $connection->markAsExpired();
            }
        }
    }

    /**
     * Fetch events from a specific calendar via CalDAV REPORT.
     */
    private function fetchCalendarEvents(Client $client, string $calendarUrl, Carbon $startDate, Carbon $endDate): array
    {
        // CalDAV REPORT query for events in date range
        $reportBody = '<?xml version="1.0" encoding="utf-8" ?>
        <C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
            <D:prop>
                <D:getetag />
                <C:calendar-data />
            </D:prop>
            <C:filter>
                <C:comp-filter name="VCALENDAR">
                    <C:comp-filter name="VEVENT">
                        <C:time-range start="' . $startDate->format('Ymd\THis\Z') . '"
                                     end="' . $endDate->format('Ymd\THis\Z') . '"/>
                    </C:comp-filter>
                </C:comp-filter>
            </C:filter>
        </C:calendar-query>';

        $response = $client->request('REPORT', $calendarUrl, $reportBody, [
            'Content-Type' => 'application/xml',
            'Depth' => '1'
        ]);

        return $this->parseCalendarResponse($response['body']);
    }

    /**
     * Parse CalDAV response and extract events.
     */
    private function parseCalendarResponse(string $responseBody): array
    {
        $events = [];

        try {
            // Parse XML response
            $xml = simplexml_load_string($responseBody);
            $xml->registerXPathNamespace('d', 'DAV:');
            $xml->registerXPathNamespace('c', 'urn:ietf:params:xml:ns:caldav');

            $responses = $xml->xpath('//d:response');

            foreach ($responses as $response) {
                $calendarData = $response->xpath('.//c:calendar-data');

                if (!empty($calendarData)) {
                    $icalData = (string) $calendarData[0];
                    $vCalendar = Reader::read($icalData);

                    // Extract VEVENT components
                    foreach ($vCalendar->VEVENT as $vevent) {
                        $events[] = $vevent;
                    }
                }
            }

        } catch (Exception $e) {
            Log::error('Failed to parse Apple calendar response: ' . $e->getMessage());
        }

        return $events;
    }

    /**
     * Store an Apple calendar event in the cache.
     */
    private function storeEvent(User $user, $vevent, string $calendarUrl): void
    {
        try {
            $uid = (string) $vevent->UID;
            $summary = (string) ($vevent->SUMMARY ?? 'Untitled');
            $dtstart = $vevent->DTSTART;
            $dtend = $vevent->DTEND ?? null;

            // Handle date/time parsing
            $startAt = Carbon::parse($dtstart->getDateTime())->utc();

            // Calculate end time
            if ($dtend) {
                $endAt = Carbon::parse($dtend->getDateTime())->utc();
            } else {
                // If no end time, assume 1 hour duration
                $endAt = $startAt->copy()->addHour();
            }

            // Check if it's an all-day event
            $isAllDay = !$dtstart->hasTime();

            if ($isAllDay) {
                // For all-day events, adjust the end time to be inclusive
                $endAt = $endAt->subSecond();
            }

            EventsCache::updateOrCreate([
                'user_id' => $user->id,
                'provider' => 'apple',
                'ext_event_id' => $uid,
            ], [
                'title' => $summary,
                'start_at_utc' => $startAt,
                'end_at_utc' => $endAt,
                'all_day' => $isAllDay,
                'visibility' => $this->mapAppleVisibility($vevent),
            ]);

        } catch (Exception $e) {
            Log::error('Failed to store Apple event: ' . $e->getMessage());
        }
    }

    /**
     * Map Apple event visibility to our system.
     */
    private function mapAppleVisibility($vevent): string
    {
        // Check for transparency/busy status
        $transp = (string) ($vevent->TRANSP ?? '');

        return match(strtoupper($transp)) {
            'TRANSPARENT' => 'transparent',
            'OPAQUE', '' => 'private',
            default => 'private'
        };
    }

    /**
     * Test CalDAV connection with provided credentials.
     */
    public function testConnection(string $appleId, string $appSpecificPassword): bool
    {
        try {
            $client = $this->createCalDAVClient($appleId, $appSpecificPassword);
            $principalUrl = $this->getPrincipalUrl($appleId);

            $response = $client->propfind($principalUrl, ['{DAV:}displayname']);

            return !empty($response);

        } catch (Exception $e) {
            Log::error('Apple CalDAV test connection failed: ' . $e->getMessage());
            return false;
        }
    }
}
