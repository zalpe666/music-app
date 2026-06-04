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
        // (Ini sangat menghemat memori server)
        if ($query) {
            // 👇 1. DIPERBAIKI: 'artists' (plural) dan 'album' (singular)
            $songs = Song::with(['artists', 'album'])
                ->where('title', 'LIKE', "%{$query}%")
                ->orWhereHas('artists', function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                        ->orWhere('strGenre', 'LIKE', "%{$query}%");
                })
                ->limit(20)->get();

            $artists = Artist::where('name', 'LIKE', "%{$query}%")->limit(10)->get();

            $albums = Album::with('artist')
                ->where('title', 'LIKE', "%{$query}%")
                ->limit(10)->get();
        } else {
            // Jika kosong, kirimkan sedikit data default saja untuk dirender cepat
            // 👇 2. DIPERBAIKI JUGA DI SINI: 'artists' (plural)
            $songs = Song::with(['artists', 'album'])->limit(50)->get();
            $artists = Artist::limit(50)->get();
            $albums = Album::with('artist')->limit(50)->get();
        }

        return Inertia::render('Search', [
            'songs' => $songs,
            'artists' => $artists,
            'albums' => $albums,
            'initialQuery' => $query ?? "" // Lempar ke frontend agar input otomatis terisi
        ]);
    }
}
