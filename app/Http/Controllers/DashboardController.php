<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
        public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        try {
            // Use single query to get all user data with relationships
            $user->load(['profile', 'availabilityRules', 'eventsCache' => function($query) {
                $query->where('start_at_utc', '>=', Carbon::now()->startOfWeek())
                      ->where('start_at_utc', '<=', Carbon::now()->endOfWeek());
            }]);

            // Get profile info efficiently
            $profile = $user->profile;
            $userSlug = $profile?->username ?? 'username';

            // Get availability status
            $hasAvailability = $user->availabilityRules->count() > 0;
            
            \Log::info('Dashboard stats - Profile info', [
                'user_id' => $user->id,
                'profile_id' => $profile?->id,
                'profile_username' => $profile?->username,
                'user_slug' => $userSlug,
                'has_availability' => $hasAvailability
            ]);

            // Get real analytics data from database
            $totalViews = $this->getTotalViewsForUser($user->id);
            
            // Get this week's events count from loaded relationship
            $thisWeekEvents = $user->eventsCache->count();

            return response()->json([
                'stats' => [
                    'total_views' => $totalViews,
                    'views_this_week' => $this->getViewsThisWeekForUser($user->id),
                    'has_availability' => $hasAvailability,
                    'this_week_events' => $thisWeekEvents,
                    'user_slug' => $userSlug
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            
            return response()->json([
                'stats' => [
                    'total_views' => 0,
                    'views_this_week' => 0,
                    'has_availability' => false,
                    'this_week_events' => 0,
                    'user_slug' => 'username'
                ]
            ]);
        }
    }

    private function getTotalViewsForUser($userId): int
    {
        try {
            // Get real total views from link_views table
            $totalViews = DB::table('link_views')
                ->join('links', 'link_views.link_id', '=', 'links.id')
                ->where('links.user_id', $userId)
                ->count();
            
            return $totalViews;
        } catch (\Exception $e) {
            \Log::error('Failed to get total views: ' . $e->getMessage());
            return 0;
        }
    }

    private function getViewsThisWeekForUser($userId): int
    {
        try {
            // Get real views this week from link_views table
            $viewsThisWeek = DB::table('link_views')
                ->join('links', 'link_views.link_id', '=', 'links.id')
                ->where('links.user_id', $userId)
                ->where('link_views.created_at', '>=', Carbon::now()->startOfWeek())
                ->where('link_views.created_at', '<=', Carbon::now()->endOfWeek())
                ->count();
            
            return $viewsThisWeek;
        } catch (\Exception $e) {
            \Log::error('Failed to get views this week: ' . $e->getMessage());
            return 0;
        }
    }

    private function getThisWeekEventsCount($user, $startDate, $endDate): int
    {
        try {
            // Use the same logic as CalendarConnectionsController
            $events = $user->eventsCache()
                ->whereDate('start_at_utc', '>=', $startDate)
                ->whereDate('start_at_utc', '<=', $endDate)
                ->count();

            return $events;
        } catch (\Exception $e) {
            \Log::error('Events count error: ' . $e->getMessage());
            return 0;
        }
    }
}
