<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Song;
use Inertia\Inertia;
use App\Models\Artist;
use App\Models\Album;

class UserSearchController extends Controller
{
    public function index(Request $request)
    {
        // Tangkap parameter query dari URL (misal: /search?query=coldplay)
        $query = $request->query('query');

        $songs = [];
        $artists = [];
        $albums = [];

        // Hanya cari di database JIKA ada query dari URL
        if ($query) {
            // 👇 1. Tambahkan relasi genre, mood, dan style
            $songs = Song::with(['artists.genre', 'artists.mood', 'artists.style', 'album'])
                ->where('title', 'LIKE', "%{$query}%")
                ->orWhereHas('artists', function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                        // 👇 2. Perbaikan logika pencarian genre (menggunakan relasi)
                        ->orWhereHas('genre', function ($genreQuery) use ($query) {
                            $genreQuery->where('name', 'LIKE', "%{$query}%");
                        });
                })
                ->limit(20)->get();

            // 👇 3. Tambahkan relasi untuk Artist juga agar data di frontend lengkap
            $artists = Artist::with(['genre', 'mood', 'style'])
                ->where('name', 'LIKE', "%{$query}%")
                ->limit(10)->get();

            $albums = Album::with('artist') // (Atau 'artists' jika Album juga pakai relasi jamak)
                ->where('title', 'LIKE', "%{$query}%")
                ->limit(10)->get();
        } else {
            // 👇 4. Jangan lupa tambahkan relasi di blok default (kosong) ini juga
            $songs = Song::with(['artists.genre', 'artists.mood', 'artists.style', 'album'])->limit(50)->get();
            $artists = Artist::with(['genre', 'mood', 'style'])->limit(50)->get();
            $albums = Album::with('artist')->limit(50)->get();
        }

        return Inertia::render('Search', [
            'songs' => $songs,
            'artists' => $artists,
            'albums' => $albums,
            'initialQuery' => $query ?? ""
        ]);
    }
}
