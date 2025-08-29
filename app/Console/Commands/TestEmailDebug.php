<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;
use App\Models\User;

class TestEmailDebug extends Command
{
    protected $signature = 'test:email-debug';
    protected $description = 'Debug email sending issues';

    public function handle()
    {
        $this->info('=== Email Debug Test ===');
        
        // Test cache configuration
        $this->info('Cache Driver: ' . config('cache.default'));
        $this->info('Cache Store Config: ' . json_encode(config('cache.stores.' . config('cache.default'))));
        
        // Test cache functionality
        try {
            Cache::put('test-key', 'test-value', 60);
            $value = Cache::get('test-key');
            $this->info('Cache Test: ' . ($value === 'test-value' ? 'PASSED' : 'FAILED'));
        } catch (\Exception $e) {
            $this->error('Cache Test FAILED: ' . $e->getMessage());
        }
        
        // Test mail configuration
        $this->info('Mail Driver: ' . config('mail.default'));
        $this->info('Mail From: ' . config('mail.from.address'));
        
        // Test storage paths
        $paths = [
            'cache' => storage_path('framework/cache/data'),
            'views' => storage_path('framework/views'),
            'sessions' => storage_path('framework/sessions'),
            'logs' => storage_path('logs'),
        ];
        
        foreach ($paths as $name => $path) {
            $exists = is_dir($path);
            $writable = $exists && is_writable($path);
            $this->info("Storage {$name}: {$path} - Exists: " . ($exists ? 'YES' : 'NO') . " - Writable: " . ($writable ? 'YES' : 'NO'));
        }
        
        // Test email sending
        $this->info('Testing email sending...');
        try {
            $user = User::first();
            if ($user) {
                Mail::to('test@example.com')->send(new VerifyEmail($user, 'TEST123'));
                $this->info('Email Test: PASSED');
            } else {
                $this->warn('No user found for email test');
            }
        } catch (\Exception $e) {
            $this->error('Email Test FAILED: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
        }
        
        return 0;
    }
}
