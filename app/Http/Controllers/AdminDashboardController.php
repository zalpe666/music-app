<?php

namespace App\Http\Controllers;

use App\Models\Song;
use App\Models\Artist;
use App\Models\Album;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // 1. Ambil data statistik (angka untuk kartu di atas)
        $stats = [
            'total_songs'   => Song::count(),
            'total_artists' => Artist::count(),
            'total_albums'  => Album::count(),
            'needs_sync'    => Song::whereNull('provider')->orWhere('provider', '!=', 'spotify')->count(),
        ];

        // 2. Ambil 5 lagu terbaru yang masuk ke database
        $recentSongs = Song::with(['album'])->latest()->take(5)->get();

        // 3. Ambil 5 lagu yang butuh sinkronisasi Spotify
        $needsSyncSongs = Song::whereNull('provider')
            ->orWhere('provider', '!=', 'spotify')
            ->latest()
            ->take(6)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentSongs', 'needsSyncSongs'));
    }
}