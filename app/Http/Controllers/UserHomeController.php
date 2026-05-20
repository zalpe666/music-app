<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Song;
use Illuminate\Http\Request;
use App\Models\Artist;
use App\Models\Album;

class UserHomeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    public function dashboard()
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

        return Inertia::render('Dashboard', [
            'songs' => $songs
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    public function search()
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

    /*
    |--------------------------------------------------------------------------
    | LIBRARY
    |--------------------------------------------------------------------------
    */

    public function library()
    {
        return Inertia::render('Library');
    }

    /*
    |--------------------------------------------------------------------------
    | PLAYER
    |--------------------------------------------------------------------------
    */

    public function player()
    {
        return Inertia::render('Player');
    }
    public function artist(Artist $artist)
    {
        // Memuat relasi data yang dibutuhkan
        $artist->load(['songs.artist', 'songs.album']);
        // dd($artist->songs->pluck('explicit_lyrics', 'title')->toArray());
        return Inertia::render('Artist', [
            'artist' => $artist,
            'songs'  => $artist->songs
        ]);
    }
    public function album(Album $album)
    {
        // Load artist dan songs untuk album ini
        $album->load(['artist', 'songs.artist', 'songs.album']);

        return Inertia::render('Album', [
            'album' => $album,
            'songs' => $album->songs,
            'artist' => $album->artist
        ]);
    }
}
