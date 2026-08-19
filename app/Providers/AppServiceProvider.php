<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\EloquentUserProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            Vite::prefetch(concurrency: 3);
        }

        // Cache authenticated user model in session to avoid remote SQL roundtrip latency (1.05s -> 0ms)
        Auth::provider('eloquent', function ($app, array $config) {
            return new class($app['hash'], $config['model']) extends EloquentUserProvider {
                public function retrieveById($identifier)
                {
                    if (!$identifier) return null;
                    return Cache::remember("user_auth_{$identifier}", 300, function () use ($identifier) {
                        return parent::retrieveById($identifier);
                    });
                }
            };
        });
    }
}
