<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    public function test_it_returns_service_unavailable_on_exception(): void
    {
        Auth::shouldReceive('attempt')->once()->andThrow(new \Exception('db error'));

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(500)
            ->assertJson([
                'message' => 'Authentication service unavailable',
            ]);
    }
}
