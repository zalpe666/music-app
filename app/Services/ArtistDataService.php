<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Artist;
use Illuminate\Support\Facades\Log;

class ArtistDataService
{
    public function updateArtistData(Artist $artist)
    {
        // 1. Panggil API TheAudioDB
        // Menggunakan urlencode supaya spasi di nama artis tidak bikin error
        $url = "https://www.theaudiodb.com/api/v1/json/2/search.php?s=" . urlencode($artist->name);

        $response = Http::get($url);

        // Cek jika request gagal atau artis tidak ditemukan
        if ($response->failed() || !isset($response->json()['artists'])) {
            Log::error("Gagal update data untuk artis: " . $artist->name);
            return false;
        }

        $data = $response->json()['artists'][0];

        // 2. Update model artis dengan data yang kamu mau
        $artist->update([
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
            'strMood'            => $data['strMood'] ?? null,
            'strStyle'           => $data['strStyle'] ?? null,
            'strGenre'           => $data['strGenre'] ?? null,
            'intCharted'         => $data['intCharted'] ?? 0,
        ]);

        return true;
    }
}
