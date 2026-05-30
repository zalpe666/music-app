<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Artist;
use App\Models\Song;
class UserGenreController extends Controller
{
    public function show($genre)
    {
        // 1. Ambil semua artis dengan genre tersebut
        $artists = Artist::where('strGenre', 'LIKE', $genre)->limit(10)->get();

        // 2. Ambil semua lagu milik artis yang genrenya sesuai
        $songs = Song::with(['artist', 'album'])
            ->whereHas('artist', function ($query) use ($genre) {
                $query->where('strGenre', 'LIKE', $genre);
            })
            ->get();

        // Jika tidak ada lagu sama sekali, bisa redirect atau lempar error (opsional)
        if ($songs->isEmpty() && $artists->isEmpty()) {
            abort(404, 'Genre not found');
        }

        // 3. Render ke halaman Inertia
        return Inertia::render('Genre/Show', [
            'genreName' => $genre,
            'songs' => $songs,
            'artists' => $artists
        ]);
    }
}
