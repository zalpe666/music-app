<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SpotifyService implements MusicProviderInterface {
    
    private function getToken() {
        // Cache token 1 jam (3500 detik) biar aplikasi tidak kena blokir rate limit Spotify
        return Cache::remember('spotify_access_token', 3500, function () {
            $response = Http::asForm()->withBasicAuth(
                config('services.spotify.client_id'),
                config('services.spotify.client_secret')
            )->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'client_credentials',
            ]);
            return $response->json('access_token');
        });
    }

    public function getTrack($id) {
        return Http::withToken($this->getToken())
            ->get("https://api.spotify.com/v1/tracks/{$id}")
            ->json();
    }

    public function searchTrack($title, $artist) {
        $response = Http::withToken($this->getToken())
            ->get("https://api.spotify.com/v1/search", [
                'q' => "track:{$title} artist:{$artist}",
                'type' => 'track',
                'limit' => 1
            ]);
        return $response->json('tracks.items.0'); // Ambil hasil pencarian pertama
    }
}