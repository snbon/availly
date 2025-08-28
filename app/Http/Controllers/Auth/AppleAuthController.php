<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Calendar\AppleCalendarService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AppleAuthController extends Controller
{
    private AppleCalendarService $appleCalendarService;

    public function __construct(AppleCalendarService $appleCalendarService)
    {
        $this->appleCalendarService = $appleCalendarService;
    }

    /**
     * Connect Apple Calendar using CalDAV credentials.
     */
    public function connect(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'apple_id' => 'required|email',
                'app_specific_password' => 'required|string|min:4',
            ]);

            Log::info('Apple Calendar connection attempt', [
                'user_id' => Auth::id(),
                'apple_id' => $request->input('apple_id'),
                'password_length' => strlen($request->input('app_specific_password'))
            ]);

            $user = Auth::user();
            $appleId = $request->input('apple_id');
            $appSpecificPassword = $request->input('app_specific_password');

            // Test the connection first
            $isValid = $this->appleCalendarService->testConnection($appleId, $appSpecificPassword);

            if (!$isValid) {
                return response()->json([
                    'error' => 'Unable to connect to Apple Calendar. Please verify your Apple ID and app-specific password.',
                    'help' => 'Make sure you have generated an app-specific password in your Apple ID settings.',
                    'details' => 'CalDAV authentication failed. Check that your app-specific password is correct and that two-factor authentication is enabled on your Apple ID.'
                ], 400);
            }

            // Connect the calendar
            $connection = $this->appleCalendarService->connectUserCalendar($user, $appleId, $appSpecificPassword);

            Log::info("Apple Calendar connected successfully for user {$user->id}");

            return response()->json([
                'message' => 'Apple Calendar connected successfully',
                'connection' => [
                    'id' => $connection->id,
                    'provider' => $connection->provider,
                    'status' => $connection->status,
                    'connected_at' => $connection->created_at,
                ]
            ]);

        } catch (ValidationException $e) {
            Log::warning('Apple Calendar validation failed', [
                'errors' => $e->errors(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Apple Calendar connection failed: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'apple_id' => $request->input('apple_id'),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to connect Apple Calendar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test Apple CalDAV connection without saving.
     */
    public function testConnection(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'apple_id' => 'required|email',
                'app_specific_password' => 'required|string|min:16',
            ]);

            $appleId = $request->input('apple_id');
            $appSpecificPassword = $request->input('app_specific_password');

            $isValid = $this->appleCalendarService->testConnection($appleId, $appSpecificPassword);

            if ($isValid) {
                return response()->json([
                    'success' => true,
                    'message' => 'Connection test successful! You can now connect your Apple Calendar.'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Connection test failed. Please check your credentials.',
                    'help' => 'Verify your Apple ID and ensure the app-specific password is correct.',
                    'details' => 'CalDAV authentication failed. Make sure two-factor authentication is enabled on your Apple ID and you are using a valid app-specific password.'
                ], 400);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Apple Calendar test connection failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Connection test failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disconnect Apple calendar.
     */
    public function disconnect(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Find and delete Apple connection
            $connection = $user->calendarConnections()
                ->where('provider', 'apple')
                ->first();

            if (!$connection) {
                return response()->json([
                    'error' => 'No Apple calendar connection found'
                ], 404);
            }

            // Delete connected calendars and cached events
            $connection->connectedCalendars()->delete();
            $user->eventsCache()->where('provider', 'apple')->delete();

            // Delete the connection
            $connection->delete();

            Log::info("Apple Calendar disconnected for user {$user->id}");

            return response()->json([
                'message' => 'Apple Calendar disconnected successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Apple disconnect failed: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to disconnect Apple Calendar'
            ], 500);
        }
    }

    /**
     * Get connection status for Apple Calendar.
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $connection = $user->calendarConnections()
                ->where('provider', 'apple')
                ->first();

            if (!$connection) {
                return response()->json([
                    'connected' => false,
                    'status' => null
                ]);
            }

            // Get calendar count
            $calendarsCount = $connection->connectedCalendars()->count();
            $includedCalendarsCount = $connection->connectedCalendars()->where('included', true)->count();

            return response()->json([
                'connected' => true,
                'status' => $connection->status,
                'connected_at' => $connection->created_at,
                'calendars_count' => $calendarsCount,
                'included_calendars_count' => $includedCalendarsCount,
                'apple_id' => $this->getMaskedAppleId($connection)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get Apple Calendar status: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to get connection status'
            ], 500);
        }
    }

    /**
     * Get masked Apple ID for display purposes.
     */
    private function getMaskedAppleId(CalendarConnection $connection): string
    {
        try {
            $credentials = json_decode(decrypt($connection->tokens_encrypted), true);
            $appleId = $credentials['apple_id'] ?? '';

            if (empty($appleId)) {
                return 'Hidden';
            }

            // Mask the Apple ID email for security
            $parts = explode('@', $appleId);
            if (count($parts) === 2) {
                $username = $parts[0];
                $domain = $parts[1];

                // Show first 2 characters and last 1 character of username
                $maskedUsername = substr($username, 0, 2) . str_repeat('*', max(1, strlen($username) - 3)) . substr($username, -1);

                return $maskedUsername . '@' . $domain;
            }

            return 'Hidden';

        } catch (\Exception $e) {
            return 'Hidden';
        }
    }
}
