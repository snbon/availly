<?php

namespace App\Console\Commands;

use App\Mail\VerifyEmail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'test:email {email}';
    protected $description = 'Test email sending functionality';

    public function handle()
    {
        $email = $this->argument('email');

        $this->info("Testing email sending to: {$email}");

        try {
            // Create a dummy user for testing
            $testUser = new User([
                'name' => 'Test User',
                'email' => $email,
            ]);

            $verificationCode = 'TEST123';

            Mail::to($email)->send(new VerifyEmail($testUser, $verificationCode));

            $this->info("✅ Test email sent successfully!");
            $this->info("Check your inbox or email service dashboard.");

        } catch (\Exception $e) {
            $this->error("❌ Failed to send email: " . $e->getMessage());
        }
    }
}
