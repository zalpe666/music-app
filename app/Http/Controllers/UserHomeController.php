<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Song;
use Illuminate\Http\Request;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Genre;
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
            'artists', // 👈 Diubah jadi plural
            'album'    // 👈 DIPERBAIKI: kembali jadi singular (album, bukan albums)
        ])
            ->latest()
            ->select(
                'id',
                'title',
                'album_id',
                'duration',
                'audio_path',
                'lyrics_path',
            )
            ->get();

        $recentSongs = [];

        if (auth()->check()) {
            // 👈 DIPERBAIKI: 'song.artist' menjadi 'song.artists'
            $recentHistories = \App\Models\UserSongHistory::with(['song.artists', 'song.album'])
                ->where('user_id', auth()->id())
                ->orderBy('updated_at', 'desc')
                ->limit(8)
                ->get();

            $recentSongs = $recentHistories->pluck('song');
        }

        // 👈 DIPERBAIKI: 'artist' menjadi 'artists'
        $hiddenGems = Song::with(['artists', 'album'])
            ->orderBy('play_count', 'asc')
            ->limit(5)
            ->get();

        $genres = Genre::limit(24)->pluck('name');

        return Inertia::render('Dashboard', [
            'songs' => $songs,
            'hiddenGems' => $hiddenGems,
            'recentSongs' => $recentSongs,
            'genres' => $genres,
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
            'artists', // 👈 DIPERBAIKI: 'artist' menjadi 'artists'
            'album'
        ])
            ->latest()
            ->select(
                'id',
                'title',
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
        // 👈 DIPERBAIKI: 'songs.artist' menjadi 'songs.artists'
        $artist->load(['songs.artists', 'songs.album']);

        return Inertia::render('Artist', [
            'artist' => $artist,
            'songs'  => $artist->songs
        ]);
    }

    public function album(Album $album)
    {
        // 👈 DIPERBAIKI: 'songs.artist' menjadi 'songs.artists'
        $album->load(['artist', 'songs.artists', 'songs.album']);

        return Inertia::render('Album', [
            'album' => $album,
            'songs' => $album->songs,
            'artist' => $album->artist
        ]);
    }
}
