<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Calendar\MicrosoftCalendarService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MicrosoftAuthController extends Controller
{
    private MicrosoftCalendarService $microsoftCalendarService;

    public function __construct(MicrosoftCalendarService $microsoftCalendarService)
    {
        $this->microsoftCalendarService = $microsoftCalendarService;
    }

    /**
     * Redirect to Microsoft OAuth.
     */
    public function redirect(Request $request): JsonResponse
    {
        try {
            $state = $request->user()->id . '_' . time();
            $authUrl = $this->microsoftCalendarService->getAuthUrl($state);

            return response()->json([
                'auth_url' => $authUrl,
                'state' => $state
            ]);

        } catch (\Exception $e) {
            Log::error('Microsoft OAuth redirect failed: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to generate Microsoft authorization URL'
            ], 500);
        }
    }

    /**
     * Handle Microsoft OAuth callback.
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            $code = $request->get('code');
            $state = $request->get('state');
            $error = $request->get('error');

            if ($error) {
                Log::error('Microsoft OAuth error: ' . $error);
                return response()->json([
                    'error' => 'Microsoft authorization was denied or failed',
                    'details' => $error
                ], 400);
            }

            if (!$code) {
                return response()->json([
                    'error' => 'No authorization code received from Microsoft'
                ], 400);
            }

            // Extract user ID from state
            $stateParts = explode('_', $state);
            if (count($stateParts) !== 2) {
                return response()->json([
                    'error' => 'Invalid state parameter'
                ], 400);
            }

            $userId = (int) $stateParts[0];
            $user = \App\Models\User::find($userId);

            if (!$user) {
                return response()->json([
                    'error' => 'User not found'
                ], 404);
            }

            // Exchange code for tokens
            $tokens = $this->microsoftCalendarService->exchangeCodeForToken($code);

            // Connect the calendar
            $connection = $this->microsoftCalendarService->connectUserCalendar($user, $tokens);

            Log::info("Microsoft Calendar connected successfully for user {$user->id}");

            return response()->json([
                'message' => 'Microsoft Calendar connected successfully',
                'connection' => [
                    'id' => $connection->id,
                    'provider' => $connection->provider,
                    'status' => $connection->status,
                    'connected_at' => $connection->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Microsoft OAuth callback failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to connect Microsoft Calendar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disconnect Microsoft calendar.
     */
    public function disconnect(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Find and delete Microsoft connection
            $connection = $user->calendarConnections()
                ->where('provider', 'microsoft')
                ->first();

            if (!$connection) {
                return response()->json([
                    'error' => 'No Microsoft calendar connection found'
                ], 404);
            }

            // Delete connected calendars and cached events
            $connection->connectedCalendars()->delete();
            $user->eventsCache()->where('provider', 'microsoft')->delete();

            // Delete the connection
            $connection->delete();

            Log::info("Microsoft Calendar disconnected for user {$user->id}");

            return response()->json([
                'message' => 'Microsoft Calendar disconnected successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Microsoft disconnect failed: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to disconnect Microsoft Calendar'
            ], 500);
        }
    }
}
