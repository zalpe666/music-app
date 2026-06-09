<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Mood;
use App\Models\Style;

class ArtistDataService
{
    public function updateArtistData(Artist $artist)
    {
        $url = "https://www.theaudiodb.com/api/v1/json/2/search.php?s=" . urlencode($artist->name);
        $response = Http::get($url);

        if ($response->failed() || !isset($response->json()['artists'])) {
            Log::error("Gagal update data untuk artis: " . $artist->name);
            return false;
        }

        $data = $response->json()['artists'][0];
        Log::info("Data TheAudioDB untuk {$artist->name}: ", [
            'genre' => $data['strGenre'] ?? 'KOSONG',
            'mood'  => $data['strMood'] ?? 'KOSONG',
            'style' => $data['strStyle'] ?? 'KOSONG'
        ]);
        // Siapkan array data dasar yang akan di-update
        $updateData = [
            'picture_xl'         => $data['strArtistThumb'] ?? null,
            'strBiography'       => $data['strBiographyEN'] ?? $data['strBiography'] ?? null,
            'strArtistFanart'    => $data['strArtistFanart'] ?? null,
            'strArtistFanart2'   => $data['strArtistFanart2'] ?? null,
            'strArtistFanart3'   => $data['strArtistFanart3'] ?? null,
            'strArtistBanner'    => $data['strArtistBanner'] ?? null,
            'strArtistClearart'  => $data['strArtistClearart'] ?? null,
            'strArtistLogo'      => $data['strArtistLogo'] ?? null,
            'strArtistWideThumb' => $data['strArtistWideThumb'] ?? null,
            'intFormedYear'      => $data['intFormedYear'] ?? null,
            'strGender'          => $data['strGender'] ?? null,
            'strCountry'         => $data['strCountry'] ?? null,
            'intMembers'         => $data['intMembers'] ?? null,
            'strWebsite'         => $data['strWebsite'] ?? null,
            'strFacebook'        => $data['strFacebook'] ?? null,
            'strTwitter'         => $data['strTwitter'] ?? null,
            'intCharted'         => $data['intCharted'] ?? 0,

            'is_validated'       => true, // 👈 Tandai sebagai sudah disinkronisasi
        ];

        // Tangani Relasi Genre
        if (!empty($data['strGenre'])) {
            $genre = Genre::firstOrCreate(['name' => $data['strGenre']]);
            $updateData['genre_id'] = $genre->id;
        }

        // Tangani Relasi Mood
        if (!empty($data['strMood'])) {
            $mood = Mood::firstOrCreate(['name' => $data['strMood']]);
            $updateData['mood_id'] = $mood->id;
        }

        // Tangani Relasi Style
        if (!empty($data['strStyle'])) {
            $style = Style::firstOrCreate(['name' => $data['strStyle']]);
            $updateData['style_id'] = $style->id;
        }

        // Lakukan update ke database
        $artist->update($updateData);

        return true;
    }
}
