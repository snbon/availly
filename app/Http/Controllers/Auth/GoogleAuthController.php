<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Calendar\GoogleCalendarService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    private GoogleCalendarService $googleCalendarService;

    public function __construct(GoogleCalendarService $googleCalendarService)
    {
        $this->googleCalendarService = $googleCalendarService;
    }

    /**
     * Redirect to Google OAuth.
     */
    public function redirect(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Generate state parameter with user ID for security
        $state = base64_encode(json_encode([
            'user_id' => $user->id,
            'timestamp' => now()->timestamp,
        ]));

        $authUrl = $this->googleCalendarService->getAuthUrl($state);

        return response()->json([
            'auth_url' => $authUrl
        ]);
    }

    /**
     * Handle Google OAuth callback.
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            // Validate state parameter
            $state = $request->get('state');
            if (!$state) {
                return response()->json([
                    'error' => 'Missing state parameter'
                ], 400);
            }

            $stateData = json_decode(base64_decode($state), true);
            if (!$stateData || !isset($stateData['user_id'])) {
                return response()->json([
                    'error' => 'Invalid state parameter'
                ], 400);
            }

            // Check if state is not too old (5 minutes max)
            if (now()->timestamp - $stateData['timestamp'] > 300) {
                return response()->json([
                    'error' => 'State parameter expired'
                ], 400);
            }

            $user = \App\Models\User::find($stateData['user_id']);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid user'
                ], 400);
            }

            // Handle OAuth error
            if ($request->has('error')) {
                Log::warning('Google OAuth error', [
                    'error' => $request->get('error'),
                    'user_id' => $user->id
                ]);

                return response()->json([
                    'error' => 'OAuth authorization failed: ' . $request->get('error')
                ], 400);
            }

            // Exchange code for token
            $code = $request->get('code');
            if (!$code) {
                return response()->json([
                    'error' => 'Missing authorization code'
                ], 400);
            }

            $tokens = $this->googleCalendarService->exchangeCodeForToken($code);

            // Connect user calendar
            $connection = $this->googleCalendarService->connectUserCalendar($user, $tokens);

            // Trigger initial sync
            $this->googleCalendarService->syncUserEvents($user);

            Log::info('Google Calendar connected successfully', [
                'user_id' => $user->id,
                'connection_id' => $connection->id
            ]);

            return response()->json([
                'message' => 'Google Calendar connected successfully',
                'connection' => [
                    'id' => $connection->id,
                    'provider' => $connection->provider,
                    'status' => $connection->status,
                    'connected_at' => $connection->created_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Google OAuth callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to connect Google Calendar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disconnect Google Calendar.
     */
    public function disconnect(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $connection = $user->googleCalendarConnection();

            if (!$connection) {
                return response()->json([
                    'error' => 'No Google Calendar connection found'
                ], 404);
            }

            // Delete connected calendars and cached events
            $connection->connectedCalendars()->delete();
            $user->eventsCache()->where('provider', 'google')->delete();

            // Delete the connection
            $connection->delete();

            Log::info('Google Calendar disconnected', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Google Calendar disconnected successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Google Calendar disconnect error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to disconnect Google Calendar'
            ], 500);
        }
    }
}
