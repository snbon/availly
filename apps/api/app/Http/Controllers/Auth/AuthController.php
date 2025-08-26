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

        // Send verification email
        try {
            Mail::to($user->email)->send(new VerifyEmail($user, $verificationCode));
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
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
        try {
            \Log::info('Login attempt', ['email' => $request->email]);

            // Test database connection
            try {
                $pdo = \DB::connection()->getPdo();
                \Log::info('Database connection successful', [
                    'driver' => \DB::connection()->getDriverName(),
                    'database' => \DB::connection()->getDatabaseName(),
                    'host' => \DB::connection()->getConfig('host'),
                    'port' => \DB::connection()->getConfig('port')
                ]);
            } catch (\Exception $dbError) {
                \Log::error('Database connection failed: ' . $dbError->getMessage(), [
                    'connection_config' => [
                        'driver' => config('database.default'),
                        'host' => config('database.connections.pgsql.host'),
                        'port' => config('database.connections.pgsql.port'),
                        'database' => config('database.connections.pgsql.database'),
                        'username' => config('database.connections.pgsql.username'),
                        'sslmode' => config('database.connections.pgsql.sslmode')
                    ],
                    'trace' => $dbError->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Database connection error',
                    'error' => 'Unable to connect to database: ' . $dbError->getMessage()
                ], 500);
            }

            $validator = Validator::make($request->all(), [
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                \Log::warning('Login validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!Auth::attempt($request->only('email', 'password'))) {
                \Log::warning('Login failed - invalid credentials', ['email' => $request->email]);
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $user = User::where('email', $request->email)->first();
            \Log::info('User found for login', ['user_id' => $user->id, 'email' => $user->email]);

            if (!$user->email_verified_at) {
                \Log::info('Login blocked - email not verified', ['user_id' => $user->id]);
                return response()->json([
                    'message' => 'Please verify your email before logging in.',
                    'requires_verification' => true
                ], 403);
            }

            try {
                $token = $user->createToken('auth-token')->plainTextToken;
                \Log::info('Token created successfully', ['user_id' => $user->id, 'token_length' => strlen($token)]);
            } catch (\Exception $tokenError) {
                \Log::error('Token creation failed: ' . $tokenError->getMessage(), [
                    'user_id' => $user->id,
                    'trace' => $tokenError->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Authentication failed - unable to create token',
                    'error' => 'Token creation error'
                ], 500);
            }

            // Load profile data
            try {
                $user->load('profile');
                $userData = $user->toArray();
                $userData['username'] = $user->profile?->username ?? null;
                \Log::info('Profile loaded successfully', ['user_id' => $user->id, 'has_profile' => !!$user->profile]);
            } catch (\Exception $profileError) {
                \Log::warning('Profile loading failed, continuing without profile: ' . $profileError->getMessage());
                $userData = $user->toArray();
                $userData['username'] = null;
            }

            \Log::info('Login successful', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Login successful',
                'user' => $userData,
                'token' => $token,
                'requires_verification' => false
            ]);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage(), [
                'email' => $request->email,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
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

        // Resend verification email
        try {
            Mail::to($user->email)->send(new VerifyEmail($user, $verificationCode));
        } catch (\Exception $e) {
            \Log::error('Failed to resend verification email: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send verification email'
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
