<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Playlist;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PlaylistController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // 2. Simpan ke tabel playlists
        Playlist::create([
            'user_id' => Auth::id(), // Mengambil ID user yang sedang login
            'name' => $request->name,
        ]);

        // 3. Kembalikan (Inertia akan mendeteksi ini dan memperbarui data tanpa reload halaman)
        return redirect()->back()->with('message', 'Playlist berhasil dibuat!');
    }
    public function show(Playlist $playlist)
    {
        if ($playlist->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Gunakan 'withPivot' agar data created_at di tabel perantara terbawa
        $playlist->load([
            'songs' => function ($query) {
                $query->withPivot('created_at'); // Mengambil created_at dari table playlist_song
            },
            'songs.artist',
            'songs.album'
        ]);

        foreach ($playlist->songs as $song) {
            // Gunakan null coalescing agar tidak crash jika pivot null
            $song->added_at = $song->pivot
                ? \Carbon\Carbon::parse($song->pivot->created_at)->diffForHumans()
                : 'Unknown';
        }

        return Inertia::render('Playlists/Show', [
            'playlist' => $playlist
        ]);
    }
    public function addSong(Request $request)
    {
        $request->validate([
            'song_id' => 'required|exists:songs,id',
            'playlist_ids' => 'required|array',
            'playlist_ids.*' => 'exists:playlists,id' // Memastikan ID playlist valid
        ]);

        // Looping semua playlist yang dicentang oleh user
        foreach ($request->playlist_ids as $playlistId) {
            // Cari playlist milik user yang sedang login
            $playlist = \App\Models\Playlist::where('user_id', auth()->id())->findOrFail($playlistId);

            // Memasukkan lagu ke tabel pivot (syncWithoutDetaching agar tidak duplikat jika lagu sudah ada)
            $playlist->songs()->syncWithoutDetaching([$request->song_id]);
        }

        return redirect()->back()->with('message', 'Lagu berhasil ditambahkan ke playlist!');
    }
}
