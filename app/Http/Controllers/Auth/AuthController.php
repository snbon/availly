<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Resend\Laravel\Facades\Resend;
use Throwable;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate verification code
        $verificationCode = strtoupper(Str::random(6));

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => null,
            'verification_code' => $verificationCode,
            'verification_code_expires_at' => now()->addHours(24),
        ]);

        // Send verification email using Resend Facade
        try {
            Resend::emails()->send([
                'from' => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
                'to' => [$user->email],
                'subject' => 'Verify Your Email Address - Availly',
                'html' => view('emails.verify-email', [
                    'user' => $user,
                    'verificationCode' => $verificationCode
                ])->render(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email via Resend: ' . $e->getMessage());
            \Log::error('Exception details: ' . $e->getTraceAsString());
            // Don't fail registration if email fails
        }

        // Don't create token yet - user needs to verify email first
        return response()->json([
            'message' => 'User registered successfully. Please check your email for verification.',
            'requires_verification' => true,
            'email' => $user->email
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (!Auth::attempt($request->only('email', 'password'))) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $user = User::where('email', $request->email)->first();
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            \Log::error('Login failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Authentication service unavailable'
            ], 500);
        }

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'requires_verification' => true
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Load profile data
        $user->load('profile');
        $userData = $user->toArray();
        $userData['username'] = $user->profile?->username ?? null;

        return response()->json([
            'message' => 'Login successful',
            'user' => $userData,
            'token' => $token,
            'requires_verification' => false
        ]);
    }

    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'verification_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified'
            ], 400);
        }

        // Check if verification code matches and hasn't expired
        if ($user->verification_code !== $request->verification_code) {
            return response()->json([
                'message' => 'Invalid verification code'
            ], 400);
        }

        if ($user->verification_code_expires_at && $user->verification_code_expires_at < now()) {
            return response()->json([
                'message' => 'Verification code has expired'
            ], 400);
        }

        // Mark as verified and clear verification code
        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ]);

        // Generate token for the verified user
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified'
            ], 400);
        }

        // Generate new verification code
        $verificationCode = strtoupper(Str::random(6));

        $user->update([
            'verification_code' => $verificationCode,
            'verification_code_expires_at' => now()->addHours(24),
        ]);

        // Resend verification email using Resend Facade
        try {
            Resend::emails()->send([
                'from' => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
                'to' => [$user->email],
                'subject' => 'Verify Your Email Address - Availly',
                'html' => view('emails.verify-email', [
                    'user' => $user,
                    'verificationCode' => $verificationCode
                ])->render(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to resend verification email via Resend: ' . $e->getMessage());
            \Log::error('Exception details: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to send verification email',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Verification email sent successfully'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('profile');

        // Add username from profile to user object for easier access
        $userData = $user->toArray();
        $userData['username'] = $user->profile?->username ?? null;

        return response()->json([
            'user' => $userData
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
