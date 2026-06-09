<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SpotifyMetadataService
{
    private function getToken()
    {
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

    public function getFullMetadata($title, $artistName = null)
    {
        // 1. Siapkan Query Pencarian (Artis sekarang opsional)
        $query = "track:{$title}";
        if (!empty($artistName)) {
            $query .= " artist:{$artistName}";
        }

        // 2. Panggilan Pertama: Cari Lagu
        $response = Http::withToken($this->getToken())
            ->get("https://api.spotify.com/v1/search", [
                'q' => $query,
                'type' => 'track',
                'limit' => 10 // 👈 Batasi 10 hasil agar halaman tidak berat
            ]);

        // 👇 Ambil ARRAY dari items, BUKAN index ke-0
        $tracks = $response->json('tracks.items');

        if (!$tracks || count($tracks) === 0) return null;

        $results = [];

        // 3. Looping semua lagu hasil pencarian
        foreach ($tracks as $track) {

            // Ambil Semua Artis (Termasuk Feat)
            $allArtistNames = [];
            $rawArtistsData = data_get($track, 'artists', []);

            foreach ($rawArtistsData as $artistData) {
                $allArtistNames[] = $artistData['name'];
            }

            $formattedArtistNames = implode(', ', $allArtistNames);

            // 4. Mapping Data (Hanya menggunakan data dari endpoint Search)
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

                    // Fitur audio kita kosongkan sementara untuk tampilan list.
                    // Jika butuh data ini, tarik ulang API-nya saat fungsi "Simpan/Create" dijalankan.
                    'tempo'        => 0,
                    'valence'      => 0,
                    'energy'       => 0,
                    'danceability' => 0,
                ],
                'album' => [
                    'spotify_id'   => data_get($track, 'album.id'),
                    'name'         => data_get($track, 'album.name'),
                    'cover_xl'     => data_get($track, 'album.images.0.url'),
                    'release_date' => data_get($track, 'album.release_date'),
                    'total_tracks' => data_get($track, 'album.total_tracks'),
                    'label'        => null, // Tidak tersedia di API Search dasar
                ],
                'artist' => [
                    'spotify_id'   => data_get($track, 'artists.0.id'),
                    'name'         => $formattedArtistNames,
                    'picture_xl'   => null, // Tidak tersedia di API Search dasar
                    'strGenre'     => null, // Tidak tersedia di API Search dasar
                    'followers'    => 0,
                    'popularity'   => 0,
                ],
                'artists_raw' => data_get($track, 'artists', [])
            ];
        }

        return $results;
    }
}
