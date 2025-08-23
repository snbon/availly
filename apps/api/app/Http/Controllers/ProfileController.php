<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use App\Models\Profile;
use App\Models\User;
use App\Services\EmailTextGenerator;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile) {
            // Create profile if it doesn't exist
            $profile = Profile::create([
                'user_id' => $user->id,
                'slug' => substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 8),
                'is_active' => true
            ]);
        }

        return response()->json([
            'profile' => $profile,
            'can_change_username' => $profile->canChangeUsername(),
            'days_until_change' => $profile->daysUntilUsernameChange()
        ]);
    }

    public function updateUsername(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile) {
            return response()->json(['error' => 'Profile not found'], 404);
        }

        if (!$profile->canChangeUsername()) {
            return response()->json([
                'error' => 'Username can only be changed once per month',
                'days_until_change' => $profile->daysUntilUsernameChange()
            ], 422);
        }

        $request->validate([
            'username' => [
                'required',
                'string',
                'min:4',
                'max:15',
                'regex:/^[a-zA-Z0-9-]+$/',
                Rule::unique('profiles', 'username')->ignore($profile->id)
            ]
        ], [
            'username.regex' => 'Username can only contain letters, numbers, and hyphens'
        ]);

        $profile->update([
            'username' => $request->username,
            'username_last_changed' => now(),
            'slug' => $request->username
        ]);

        return response()->json([
            'profile' => $profile,
            'can_change_username' => $profile->canChangeUsername(),
            'days_until_change' => $profile->daysUntilUsernameChange(),
            'message' => 'Username updated successfully'
        ]);
    }

    public function checkUsername(Request $request): JsonResponse
    {
        $request->validate([
            'username' => [
                'required',
                'string',
                'min:4',
                'max:15',
                'regex:/^[a-zA-Z0-9-]+$/'
            ]
        ]);

        $exists = Profile::where('username', $request->username)->exists();

        return response()->json([
            'available' => !$exists
        ]);
    }

    public function generateEmailText(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile || !$profile->username) {
            return response()->json(['error' => 'Username must be set first'], 422);
        }

        $request->validate([
            'context' => 'nullable|string|max:200'
        ]);

        $generator = new EmailTextGenerator();
        $result = $generator->generateEmailText(
            $profile->username,
            $request->get('context', '')
        );

        return response()->json($result);
    }
}
