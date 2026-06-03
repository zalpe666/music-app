<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Services\MusicProviderInterface;
use App\Services\SpotifyService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(MusicProviderInterface::class, function ($app) {
            if (env('MUSIC_API_PROVIDER') === 'spotify') {
                return new SpotifyService();
            }
            // Jika sedang tidak pakai spotify, fallback ke service deezer lama
            // return new DeezerService(); 
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
