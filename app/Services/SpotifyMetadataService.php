<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SpotifyMetadataService
{
    private function getToken()
    {
        // Kita cek manual tanpa Cache::remember agar bisa handling error
        $token = Cache::get('spotify_access_token');

        if (!$token) {
            try {
                $response = Http::asForm()->withBasicAuth(
                    config('services.spotify.client_id'),
                    config('services.spotify.client_secret')
                )->post('https://accounts.spotify.com/api/token', [
                    'grant_type' => 'client_credentials',
                ]);

                if ($response->successful() && $response->json('access_token')) {
                    $token = $response->json('access_token');
                    // Simpan 55 menit (3300 detik) untuk jaga-jaga sebelum expired
                    Cache::put('spotify_access_token', $token, 3300);
                } else {
                    Log::error('Spotify Token Error: ' . $response->body());
                    return null;
                }
            } catch (\Exception $e) {
                Log::error('Spotify Token Exception: ' . $e->getMessage());
                return null;
            }
        }

        return $token;
    }

    public function getFullMetadata($title, $artistName = null)
    {
        $token = $this->getToken();

        // Jika token gagal didapat, langsung kembalikan kosong (jangan crash)
        if (!$token) {
            return [];
        }

        $query = "track:{$title}";
        if (!empty($artistName)) {
            $query .= " artist:{$artistName}";
        }

        try {
            $response = Http::withToken($token)
                ->get("https://api.spotify.com/v1/search", [
                    'q' => $query,
                    'type' => 'track',
                    'limit' => 10
                ]);

            if (!$response->successful()) {
                Log::error('Spotify Search Error: ' . $response->body());
                return [];
            }

            $tracks = $response->json('tracks.items');

            // Cek agar tidak error count() di PHP 8 jika tracks null
            if (!is_array($tracks) || count($tracks) === 0) {
                return [];
            }

            $results = [];

            foreach ($tracks as $track) {
                $allArtistNames = [];
                $rawArtistsData = data_get($track, 'artists', []);

                foreach ($rawArtistsData as $artistData) {
                    $allArtistNames[] = $artistData['name'];
                }

                $formattedArtistNames = implode(', ', $allArtistNames);

                $results[] = [
                    'track' => [
                        'name'         => data_get($track, 'name'),
                        'spotify_id'   => data_get($track, 'id'),
                        'duration'     => data_get($track, 'duration_ms', 0) / 1000,
                        'preview_url'  => data_get($track, 'preview_url'),
                        'explicit'     => data_get($track, 'explicit') ? 1 : 0,
                        'isrc'         => data_get($track, 'external_ids.isrc'),
                        'popularity'   => data_get($track, 'popularity'),
                        'track_number' => data_get($track, 'track_number'),
                        'disc_number'  => data_get($track, 'disc_number'),
                    ],
                    'album' => [
                        'spotify_id'   => data_get($track, 'album.id'),
                        'name'         => data_get($track, 'album.name'),
                        'cover_xl'     => data_get($track, 'album.images.0.url'),
                        'release_date' => data_get($track, 'album.release_date'),
                        'total_tracks' => data_get($track, 'album.total_tracks'),
                        'label'        => null,
                    ],
                    'artist' => [
                        'spotify_id'   => data_get($track, 'artists.0.id'),
                        'name'         => $formattedArtistNames,
                        'picture_xl'   => null,
                        'strGenre'     => null,
                        'followers'    => 0,
                        'popularity'   => 0,
                    ],
                    'artists_raw' => data_get($track, 'artists', [])
                ];
            }

            return $results;
        } catch (\Exception $e) {
            Log::error('Spotify Fetch Exception: ' . $e->getMessage());
            return [];
        }
    }
}
