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
        if (!$this->testConnection($appleId, $appSpecificPassword)) {
            throw new Exception('Unable to connect to Apple Calendar. Please verify your Apple ID and app-specific password.');
        }

        // Remove any existing Apple connections for this user
        $user->calendarConnections()
            ->where('provider', 'apple')
            ->delete();

        // Discover the actual calendar home URL
        $calendarHomeUrl = $this->discoverCalendarHomeUrl($appleId, $appSpecificPassword);

        if (!$calendarHomeUrl) {
            throw new Exception('Unable to discover calendar home URL. Please verify your credentials.');
        }

        // Store credentials securely
        $credentials = [
            'apple_id' => $appleId,
            'app_specific_password' => $appSpecificPassword,
            'principal_url' => $this->getPrincipalUrl($appleId),
            'calendar_home_url' => $calendarHomeUrl,
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
        // Apple CalDAV uses a different URL structure
        // We need to discover the principal URL through the root URL
        return 'https://caldav.icloud.com/';
    }

    /**
     * Get calendar home URL for Apple ID.
     */
    private function getCalendarHomeUrl(string $appleId): string
    {
        return str_replace('{apple_id}', $appleId, $this->config['calendar_home_url_template']);
    }

    /**
     * Discover the actual calendar home URL via CalDAV discovery.
     */
    private function discoverCalendarHomeUrl(string $appleId, string $appSpecificPassword): ?string
    {
        try {
            Log::info('Starting CalDAV calendar home discovery', [
                'apple_id' => $appleId
            ]);

            $client = $this->createCalDAVClient($appleId, $appSpecificPassword);

                        // Step 1: Find the current user principal
            $wellKnownUrl = 'https://caldav.icloud.com/.well-known/caldav';

            $response = $client->propfind($wellKnownUrl, [
                '{DAV:}current-user-principal'
            ]);

                        Log::info('Principal discovery response', [
                'response_count' => count($response),
                'response_keys' => array_keys($response),
                'full_response' => json_encode($response, JSON_PRETTY_PRINT)
            ]);

                        $principalUrl = null;
            foreach ($response as $url => $properties) {
                Log::info('Checking response item', [
                    'url' => $url,
                    'properties' => is_array($properties) ? array_keys($properties) : gettype($properties),
                    'properties_content' => json_encode($properties, JSON_PRETTY_PRINT)
                ]);

                // The response structure might be different - properties might be the array directly
                if ($url === '{DAV:}current-user-principal' && is_array($properties)) {
                    $principal = $properties;

                    Log::info('Principal data structure', [
                        'principal_type' => gettype($principal),
                        'principal_data' => json_encode($principal, JSON_PRETTY_PRINT)
                    ]);

                    // Handle different response types
                    if (is_object($principal) && method_exists($principal, 'getHref')) {
                        $principalUrl = $principal->getHref();
                    } elseif (is_string($principal)) {
                        $principalUrl = $principal;
                    } elseif (is_array($principal)) {
                        // Handle Apple's specific response format: array of objects with name/value
                        if (isset($principal[0]) && is_array($principal[0])) {
                            foreach ($principal as $item) {
                                if (isset($item['name']) && $item['name'] === '{DAV:}href' && isset($item['value'])) {
                                    $principalUrl = $item['value'];
                                    break;
                                }
                            }
                        } elseif (isset($principal['href'])) {
                            $principalUrl = $principal['href'];
                        }
                    }

                    Log::info('Found principal URL candidate', [
                        'principal_type' => gettype($principal),
                        'principal_url' => $principalUrl
                    ]);

                    if ($principalUrl) {
                        break;
                    }
                }
            }

            if (!$principalUrl) {
                Log::error('Could not find current user principal', [
                    'response_structure' => json_encode($response, JSON_PRETTY_PRINT)
                ]);
                return null;
            }

            // Make sure the principal URL is absolute
            if (strpos($principalUrl, 'http') !== 0) {
                $principalUrl = 'https://caldav.icloud.com' . $principalUrl;
            }

            Log::info('Found principal URL', ['principal_url' => $principalUrl]);

            // Step 2: Find the calendar home set from the principal
            $response = $client->propfind($principalUrl, [
                '{urn:ietf:params:xml:ns:caldav}calendar-home-set'
            ]);

            Log::info('Calendar home discovery response', [
                'principal_url' => $principalUrl,
                'response_count' => count($response),
                'response_keys' => array_keys($response)
            ]);

                                    $calendarHomeUrl = null;
            foreach ($response as $url => $properties) {
                Log::info('Checking calendar home response item', [
                    'url' => $url,
                    'properties' => is_array($properties) ? array_keys($properties) : gettype($properties),
                    'properties_content' => json_encode($properties, JSON_PRETTY_PRINT)
                ]);

                // The response structure might be different - properties might be the array directly
                if ($url === '{urn:ietf:params:xml:ns:caldav}calendar-home-set' && is_array($properties)) {
                    $calendarHome = $properties;

                    Log::info('Calendar home data structure', [
                        'calendar_home_type' => gettype($calendarHome),
                        'calendar_home_data' => json_encode($calendarHome, JSON_PRETTY_PRINT)
                    ]);

                    // Handle different response types
                    if (is_object($calendarHome) && method_exists($calendarHome, 'getHref')) {
                        $calendarHomeUrl = $calendarHome->getHref();
                    } elseif (is_string($calendarHome)) {
                        $calendarHomeUrl = $calendarHome;
                    } elseif (is_array($calendarHome)) {
                        // Handle Apple's specific response format: array of objects with name/value
                        if (isset($calendarHome[0]) && is_array($calendarHome[0])) {
                            foreach ($calendarHome as $item) {
                                if (isset($item['name']) && $item['name'] === '{DAV:}href' && isset($item['value'])) {
                                    $calendarHomeUrl = $item['value'];
                                    break;
                                }
                            }
                        } elseif (isset($calendarHome['href'])) {
                            $calendarHomeUrl = $calendarHome['href'];
                        }
                    }

                    Log::info('Found calendar home URL candidate', [
                        'calendar_home_type' => gettype($calendarHome),
                        'calendar_home_url' => $calendarHomeUrl
                    ]);

                    if ($calendarHomeUrl) {
                        break;
                    }
                }
            }

            if (!$calendarHomeUrl) {
                Log::error('Could not find calendar home set', [
                    'response_structure' => json_encode($response, JSON_PRETTY_PRINT)
                ]);
                return null;
            }

            // Make sure the calendar home URL is absolute
            if (strpos($calendarHomeUrl, 'http') !== 0) {
                $calendarHomeUrl = 'https://caldav.icloud.com' . $calendarHomeUrl;
            }

            Log::info('Discovered calendar home URL', ['calendar_home_url' => $calendarHomeUrl]);

            return $calendarHomeUrl;

        } catch (Exception $e) {
            Log::error('Failed to discover calendar home URL', [
                'error' => $e->getMessage(),
                'apple_id' => $appleId,
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
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

        // Handle Sabre DAV ResourceType object
        if (is_object($resourceType)) {
            // Check if it has the calendar resource type
            $isCalendar = $resourceType->is('{urn:ietf:params:xml:ns:caldav}calendar');
            Log::info('Checking resource type', [
                'resource_type_class' => get_class($resourceType),
                'is_calendar' => $isCalendar
            ]);
            return $isCalendar;
        }

        // Fallback for string comparison
        if (is_string($resourceType)) {
            return str_contains($resourceType, 'calendar');
        }

        return false;
    }

    /**
     * Check if calendar supports VEVENT components.
     */
    private function supportsEvents(array $properties): bool
    {
        $supportedComponents = $properties['{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set'] ?? null;

        // If no supported components specified, assume it supports events
        if (!$supportedComponents) {
            return true;
        }

        // Handle Sabre DAV object
        if (is_object($supportedComponents)) {
            // Convert to string representation or check if it contains VEVENT
            $componentsString = (string) $supportedComponents;
            return str_contains($componentsString, 'VEVENT');
        }

        // Handle string
        if (is_string($supportedComponents)) {
            return str_contains($supportedComponents, 'VEVENT');
        }

        // Default to true if we can't determine
        return true;
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
            Log::info('Testing Apple CalDAV connection', [
                'apple_id' => $appleId,
                'password_length' => strlen($appSpecificPassword),
                'caldav_server' => $this->config['caldav_server']
            ]);

            $client = $this->createCalDAVClient($appleId, $appSpecificPassword);

            // First, try to discover the principal URL using the well-known CalDAV endpoint
            $wellKnownUrl = 'https://caldav.icloud.com/.well-known/caldav';

            Log::info('Attempting CalDAV well-known discovery', [
                'well_known_url' => $wellKnownUrl
            ]);

            try {
                // Try the well-known endpoint first
                $response = $client->propfind($wellKnownUrl, [
                    '{DAV:}current-user-principal',
                    '{DAV:}displayname'
                ]);

                if (!empty($response)) {
                    Log::info('Well-known CalDAV discovery successful');
                    return true;
                }
            } catch (Exception $e) {
                Log::info('Well-known endpoint failed, trying root', ['error' => $e->getMessage()]);
            }

            // If well-known fails, try the root CalDAV URL
            $rootUrl = 'https://caldav.icloud.com/';

            Log::info('Attempting CalDAV root discovery', [
                'root_url' => $rootUrl
            ]);

            $response = $client->propfind($rootUrl, [
                '{DAV:}current-user-principal',
                '{DAV:}displayname'
            ]);

            Log::info('CalDAV root response', [
                'response_empty' => empty($response),
                'response_type' => gettype($response)
            ]);

            return !empty($response);

        } catch (Exception $e) {
            Log::error('Apple CalDAV test connection failed', [
                'error' => $e->getMessage(),
                'apple_id' => $appleId,
                'error_code' => $e->getCode(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
}
