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
    public function allArtists()
    {
        $artists = Artist::with('songs')->get();

        return Inertia::render('AllArtist', [
            'artists' => $artists
        ]);
    }
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

        $recentSongs = [];
        
        if (auth()->check()) {
            // Ambil relasi lagu beserta artis dan albumnya
            $recentHistories = \App\Models\UserSongHistory::with(['song.artist', 'song.album'])
                ->where('user_id', auth()->id())
                ->orderBy('updated_at', 'desc') // Urutkan dari yang paling baru diputar
                ->limit(8)
                ->get();

            // Ekstrak model 'song'-nya saja agar formatnya sama dengan array songs lainnya
            $recentSongs = $recentHistories->pluck('song');
        }
        $hiddenGems = Song::with(['artist', 'album'])
            ->orderBy('play_count', 'asc') // Urutkan dari yang terkecil
            ->limit(5)
            ->get();
            $genres = Artist::whereNotNull('strGenre')
        ->where('strGenre', '!=', '')
        ->select('strGenre')
        ->distinct()
        ->limit(8) // Ambil 8 genre saja agar rapi (grid 4x2)
        ->pluck('strGenre');
        return Inertia::render('Dashboard', [
            'songs' => $songs,
            'hiddenGems' => $hiddenGems ,// Kirim data baru ini
            'recentSongs' => $recentSongs, // <-- DATA UNTUK TAMPILAN
            'genres' => $genres, // <-- KIRIM DATA GENRE INI
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
