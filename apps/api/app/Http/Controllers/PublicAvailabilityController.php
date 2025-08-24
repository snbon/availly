<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Profile;
use App\Models\User;
use Carbon\Carbon;

class PublicAvailabilityController extends Controller
{
    public function show(string $slug, Request $request): JsonResponse
    {
        // Validate slug format
        if (!preg_match('/^[a-z0-9-]{4,10}$/', $slug)) {
            return response()->json(['error' => 'Invalid slug format'], 404);
        }

        // Find user by slug
        $profile = Profile::where('slug', $slug)
            ->where('is_active', true)
            ->with(['user.availabilityRules', 'user.eventsCache'])
            ->first();

        if (!$profile || !$profile->user) {
            return response()->json(['error' => 'Profile not found'], 404);
        }

        $user = $profile->user;

        // Parse date range from request (default to current week)
        $rangeParam = $request->get('range');
        if ($rangeParam && preg_match('/^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/', $rangeParam, $matches)) {
            $startDate = Carbon::parse($matches[1])->startOfDay();
            $endDate = Carbon::parse($matches[2])->endOfDay();
        } else {
            // Default to current week
            $startDate = Carbon::now()->startOfWeek();
            $endDate = Carbon::now()->endOfWeek();
        }

        // Calculate actual available time windows
        $availableWindows = $this->calculateAvailableWindows($user, $startDate, $endDate);

        return response()->json([
            'slug' => $slug,
            'user_name' => $user->name,
            'user_timezone' => $user->timezone ?? 'Europe/Brussels',
            'range' => $startDate->format('Y-m-d') . '..' . $endDate->format('Y-m-d'),
            'availability' => [
                'windows' => $availableWindows
            ]
        ]);
    }

    /**
     * Calculate available time windows by subtracting busy events from availability rules
     */
    private function calculateAvailableWindows(User $user, Carbon $startDate, Carbon $endDate): array
    {
        $availableWindows = [];
        $userTimezone = $user->timezone ?? 'Europe/Brussels';

        // Get user's availability rules
        $availabilityRules = $user->availabilityRules;

        // Get busy events in the date range
        $busyEvents = $user->eventsCache()
            ->inDateRange($startDate, $endDate)
            ->orderBy('start_at_utc')
            ->get();

        // Generate availability windows for each day in the range
        $currentDate = $startDate->copy()->setTimezone($userTimezone);
        $endDateInUserTz = $endDate->copy()->setTimezone($userTimezone);

        while ($currentDate <= $endDateInUserTz) {
            $weekday = $currentDate->dayOfWeek; // 0 = Sunday, 1 = Monday, etc.

            // Find availability rules for this weekday
            $dayRules = $availabilityRules->where('weekday', $weekday);

            foreach ($dayRules as $rule) {
                // Create availability window in user's timezone first
                $ruleStartLocal = $currentDate->copy()
                    ->setTimeFromTimeString($rule->start_time_local);
                $ruleEndLocal = $currentDate->copy()
                    ->setTimeFromTimeString($rule->end_time_local);

                // Convert to UTC for calculations
                $ruleStart = $ruleStartLocal->copy()->utc();
                $ruleEnd = $ruleEndLocal->copy()->utc();

                // Find busy events that overlap with this availability window
                $overlappingEvents = $busyEvents->filter(function ($event) use ($ruleStart, $ruleEnd) {
                    return $event->conflictsWith($ruleStart, $ruleEnd);
                });

                // Split the availability window around busy events
                $freeWindows = $this->subtractBusyEvents($ruleStart, $ruleEnd, $overlappingEvents);

                // Add free windows to the result
                foreach ($freeWindows as $window) {
                    $availableWindows[] = [
                        'start' => $window['start']->toISOString(),
                        'end' => $window['end']->toISOString(),
                        'type' => 'available'
                    ];
                }
            }

            $currentDate->addDay();
        }

        return $availableWindows;
    }

    /**
     * Subtract busy events from an availability window
     */
    private function subtractBusyEvents(Carbon $windowStart, Carbon $windowEnd, $busyEvents): array
    {
        $freeWindows = [];
        $currentStart = $windowStart->copy();

        // Sort busy events by start time
        $sortedEvents = $busyEvents->sortBy('start_at_utc');

        foreach ($sortedEvents as $event) {
            $eventStart = $event->start_at_utc;
            $eventEnd = $event->end_at_utc;

            // If there's free time before this busy event
            if ($currentStart < $eventStart && $currentStart < $windowEnd) {
                $freeEnd = min($eventStart, $windowEnd);
                if ($freeEnd > $currentStart) {
                    $freeWindows[] = [
                        'start' => $currentStart->copy(),
                        'end' => $freeEnd->copy()
                    ];
                }
            }

            // Move current start to after this busy event
            $currentStart = max($currentStart, $eventEnd);

            // If we've passed the window end, break
            if ($currentStart >= $windowEnd) {
                break;
            }
        }

        // Add remaining free time after all busy events
        if ($currentStart < $windowEnd) {
            $freeWindows[] = [
                'start' => $currentStart->copy(),
                'end' => $windowEnd->copy()
            ];
        }

        return $freeWindows;
    }


}
