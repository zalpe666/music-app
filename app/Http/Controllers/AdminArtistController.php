<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Artist;
use App\Services\ArtistDataService;

class AdminArtistController extends Controller
{
    public function index()
    {
        $artists = Artist::latest()->paginate(25);
        return view('admin.artist.index', compact('artists'));
    }
    public function syncAll(ArtistDataService $service)
    {
        set_time_limit(0);

        $artists = Artist::all();
        $count = 0;

        foreach ($artists as $artist) {
            $service->updateArtistData($artist);

            // Jeda 1 detik agar tidak kena blokir API TheAudioDB
            sleep(1);
            $count++;
        }

        return back()->with('success', "Berhasil sinkronisasi $count artis.");
    }
}
