<?php

namespace App\Providers;

use Laravel\Boost\BoostServiceProvider;
use Laravel\Roster\Roster;

class CustomBoostServiceProvider extends BoostServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../../vendor/laravel/boost/config/boost.php',
            'boost'
        );

        $this->app->singleton(Roster::class, function () {
            $lockFiles = [
                base_path('composer.lock'),
                base_path('../web/package-lock.json'),
                base_path('../web/bun.lockb'),
                base_path('../web/pnpm-lock.yaml'),
                base_path('../web/yarn.lock'),
            ];

            $cacheKey = 'boost.roster.scan';
            $lastModified = max(array_map(fn ($path) => file_exists($path) ? filemtime($path) : 0, $lockFiles));

            $cached = cache()->get($cacheKey);
            if ($cached && isset($cached['timestamp']) && $cached['timestamp'] >= $lastModified) {
                return $cached['roster'];
            }

            // Create a custom roster that scans both API and web directories
            $roster = new Roster();

            // Scan the API directory (current Laravel app)
            $apiRoster = Roster::scan(base_path());
            foreach ($apiRoster->packages() as $package) {
                $roster->add($package);
            }
            foreach ($apiRoster->approaches() as $approach) {
                $roster->add($approach);
            }

            // Scan the web directory for frontend packages
            $webPath = base_path('../web');
            if (is_dir($webPath)) {
                $webRoster = Roster::scan($webPath);
                foreach ($webRoster->packages() as $package) {
                    $roster->add($package);
                }
                foreach ($webRoster->approaches() as $approach) {
                    $roster->add($approach);
                }
            }

            cache()->put($cacheKey, [
                'roster' => $roster,
                'timestamp' => time(),
            ], now()->addHours(24));

            return $roster;
        });
    }
}

