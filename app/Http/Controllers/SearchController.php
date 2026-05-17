<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Song;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index()
    {
        $songs = Song::with([
            'artist',
            'album'
        ])
            ->latest()
            ->select(
                'id',
                'title',
                'artist_id',
                'album_id',
                'duration',
                'audio_path',
                'lyrics_path',
            )
            ->get();

        return Inertia::render('Search', [
            'songs' => $songs
        ]);
    }
}
