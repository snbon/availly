<?php

namespace App\Http\Controllers;

use App\Services\Calendar\GoogleCalendarService;
use App\Services\Calendar\MicrosoftCalendarService;
use App\Services\Calendar\AppleCalendarService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CalendarConnectionsController extends Controller
{
    private GoogleCalendarService $googleCalendarService;
    private MicrosoftCalendarService $microsoftCalendarService;
    private AppleCalendarService $appleCalendarService;

    public function __construct(
        GoogleCalendarService $googleCalendarService,
        MicrosoftCalendarService $microsoftCalendarService,
        AppleCalendarService $appleCalendarService
    ) {
        $this->googleCalendarService = $googleCalendarService;
        $this->microsoftCalendarService = $microsoftCalendarService;
        $this->appleCalendarService = $appleCalendarService;
    }

    /**
     * Get user's calendar connections.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $connections = $user->calendarConnections()
            ->with(['connectedCalendars'])
            ->get()
            ->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'provider' => $connection->provider,
                    'status' => $connection->status,
                    'connected_at' => $connection->created_at,
                    'calendars_count' => $connection->connectedCalendars->count(),
                    'included_calendars_count' => $connection->connectedCalendars->where('included', true)->count(),
                ];
            });

        return response()->json([
            'connections' => $connections
        ]);
    }

    /**
     * Get calendars for a specific connection.
     */
    public function getCalendars(Request $request, int $connectionId): JsonResponse
    {
        $user = Auth::user();

        $connection = $user->calendarConnections()
            ->where('id', $connectionId)
            ->first();

        if (!$connection) {
            return response()->json([
                'error' => 'Calendar connection not found'
            ], 404);
        }

        if (!$connection->isActive()) {
            return response()->json([
                'error' => 'Calendar connection is not active'
            ], 400);
        }

        // Get fresh calendar list from provider
        $calendars = [];
        if ($connection->provider === 'google') {
            $calendars = $this->googleCalendarService->getUserCalendars($connection);
        } elseif ($connection->provider === 'microsoft') {
            $calendars = $this->microsoftCalendarService->getUserCalendars($connection);
        } elseif ($connection->provider === 'apple') {
            $calendars = $this->appleCalendarService->getUserCalendars($connection);
        }

        // Merge with stored inclusion preferences
        $connectedCalendars = $connection->connectedCalendars()
            ->get()
            ->keyBy('provider_calendar_id');

        $result = collect($calendars)->map(function ($calendar) use ($connectedCalendars) {
            $connected = $connectedCalendars->get($calendar['id']);

            return [
                'id' => $calendar['id'],
                'name' => $calendar['name'],
                'primary' => $calendar['primary'],
                'color' => $calendar['color'],
                'access_role' => $calendar['access_role'],
                'included' => $connected ? $connected->included : true,
            ];
        });

        return response()->json([
            'calendars' => $result
        ]);
    }

    /**
     * Update calendar inclusion settings.
     */
    public function updateCalendarInclusion(Request $request, int $connectionId): JsonResponse
    {
        $request->validate([
            'calendar_id' => 'required|string',
            'included' => 'required|boolean',
        ]);

        $user = Auth::user();

        $connection = $user->calendarConnections()
            ->where('id', $connectionId)
            ->first();

        if (!$connection) {
            return response()->json([
                'error' => 'Calendar connection not found'
            ], 404);
        }

        $connectedCalendar = $connection->connectedCalendars()
            ->where('provider_calendar_id', $request->calendar_id)
            ->first();

        if (!$connectedCalendar) {
            // Create new connected calendar entry
            $connectedCalendar = $connection->connectedCalendars()->create([
                'provider_calendar_id' => $request->calendar_id,
                'included' => $request->included,
            ]);
        } else {
            // Update existing entry
            $connectedCalendar->update([
                'included' => $request->included,
            ]);
        }

        // Re-sync events if calendar was enabled
        if ($request->included) {
            $this->syncUserEvents($user, $connection->provider);
        } else {
            // Remove cached events for this calendar
            $user->eventsCache()
                ->where('provider', $connection->provider)
                ->delete(); // Note: We don't track calendar_id in events_cache, so we remove all and re-sync

            $this->syncUserEvents($user, $connection->provider);
        }

        return response()->json([
            'message' => 'Calendar inclusion updated successfully',
            'calendar' => [
                'id' => $connectedCalendar->provider_calendar_id,
                'included' => $connectedCalendar->included,
            ]
        ]);
    }

    /**
     * Trigger manual sync for user's calendars.
     */
    public function sync(Request $request): JsonResponse
    {
        $user = Auth::user();

        $activeConnections = $user->calendarConnections()
            ->where('status', 'active')
            ->get();

        if ($activeConnections->isEmpty()) {
            return response()->json([
                'error' => 'No active calendar connections found'
            ], 400);
        }

        try {
            // Sync all active providers
            foreach ($activeConnections as $connection) {
                $this->syncUserEvents($user, $connection->provider);
            }

            return response()->json([
                'message' => 'Calendar sync completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Calendar sync failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's calendar events for dashboard.
     */
    public function getEvents(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $user = Auth::user();

        // Generate cache key for this request
        $cacheKey = "calendar_events_{$user->id}_{$request->start_date}_{$request->end_date}";

        // Try to get cached response (5 minute cache)
        $cached = \Cache::remember($cacheKey, 300, function () use ($user, $request) {
            // Quick check: if user has no calendar connections, return empty array immediately
            if (!$user->calendarConnections()->where('status', 'active')->exists()) {
                return [];
            }

            // Optimize query with select and limit
            return $user->eventsCache()
                ->select(['id', 'title', 'start_at_utc', 'end_at_utc', 'all_day', 'provider'])
                ->inDateRange(
                    \Carbon\Carbon::parse($request->start_date)->startOfDay(),
                    \Carbon\Carbon::parse($request->end_date)->endOfDay()
                )
                ->orderBy('start_at_utc')
                ->limit(100) // Reasonable limit for dashboard view
                ->get()
                ->map(function ($event) {
                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'start' => $event->start_at_utc->toISOString(),
                        'end' => $event->end_at_utc->toISOString(),
                        'all_day' => $event->all_day,
                        'provider' => $event->provider,
                    ];
                })
                ->toArray();
        });

        return response()->json([
            'events' => $cached
        ]);
    }

    /**
     * Sync events for a specific provider.
     */
    private function syncUserEvents($user, string $provider): void
    {
        switch ($provider) {
            case 'google':
                $this->googleCalendarService->syncUserEvents($user);
                break;
            case 'microsoft':
                $this->microsoftCalendarService->syncUserEvents($user);
                break;
            case 'apple':
                $this->appleCalendarService->syncUserEvents($user);
                break;
            default:
                throw new \InvalidArgumentException("Unsupported calendar provider: {$provider}");
        }
    }
}
