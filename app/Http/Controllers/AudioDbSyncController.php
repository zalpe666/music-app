<?php

namespace App\Http\Controllers;

use App\Models\Song;
use App\Models\Genre; // Wajib import model Genre
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; // Wajib import Http
use App\Jobs\DownloadMusicVideo; // 👈 Tambahkan ini

class AudioDbSyncController extends Controller
{
    /**
     * TAMPILKAN HALAMAN FETCH & SEARCH (GET)
     */
    public function show(Request $request, Song $song)
    {
        // 1. Ambil nama artis (prioritas dari form input, kalau kosong ambil dari database)
        $defaultArtist = $song->artists()->exists() ? $song->artists()->first()->name : $song->artist;
        $artistName = $request->input('artist', $defaultArtist);

        // 2. Ambil judul lagu
        $title = $request->input('title', $song->title);

        // 3. Tembak API TheAudioDB
        $url = "https://www.theaudiodb.com/api/v1/json/123/searchtrack.php";

        $response = Http::get($url, [
            's' => $artistName,
            't' => $title
        ]);

        $jsonData = $response->json();

        // 4. Cek apakah ada data 'track' di dalam JSON
        $trackData = $jsonData['track'][0] ?? null;

        // 5. Lempar data ke file blade
        return view('admin.songs.audiodb_sync', compact('song', 'trackData', 'artistName', 'title'));
    }

    /**
     * SIMPAN DATA KE DATABASE & UBAH STATUS (POST)
     */
    public function store(Request $request, Song $song)
    {
        // 1. Validasi data yang dikirim dari form (Blade)
        $request->validate([
            'genre' => 'nullable|string',
            'description' => 'nullable|string',
            'youtube_url' => 'nullable|url',
        ]);

        $updateData = [];

        // 2. Jika ada genre dari AudioDB, cari ID-nya atau buat baru jika belum ada
        if ($request->filled('genre')) {
            $genre = Genre::firstOrCreate(['name' => $request->genre]);
            $updateData['genre_id'] = $genre->id;
        }

        // 3. Simpan deskripsi
        if ($request->filled('description')) {
            $updateData['description'] = $request->description;
        }

        // 4. Simpan URL YouTube
        if ($request->filled('youtube_url')) {
            $updateData['youtube_url'] = $request->youtube_url;
        }

        // 5. LANGSUNG SET STATUS KE VALIDATED
        $updateData['audiodb_status'] = 'validated';

        // 6. Update tabel songs
        $song->update($updateData);
        if ($song->youtube_url) {
            DownloadMusicVideo::dispatch($song);
        }
        // 7. Redirect kembali ke halaman utama dengan pesan sukses
        return redirect()->route('songs.index')->with('success', "Metadata for '{$song->title}' saved and validated!");
    }
}
