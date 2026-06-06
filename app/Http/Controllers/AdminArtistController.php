<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Artist;
use App\Models\Genre; // 👈 Wajib di-import
use App\Models\Mood;  // 👈 Wajib di-import
use App\Models\Style; // 👈 Wajib di-import
use App\Services\ArtistDataService;
use App\Jobs\SyncArtistsJob; // 👈 Import Job baru
class AdminArtistController extends Controller
{
    public function index()
    {
        // 1. Ambil data artis beserta relasinya untuk tabel
        // Diurutkan berdasarkan artis yang genre_id atau mood_id nya masih KOSONG (NULL)
        $artists = Artist::with(['genre', 'mood', 'style'])
            ->orderByRaw('genre_id IS NULL DESC')
            ->orderByRaw('mood_id IS NULL DESC')
            ->paginate(50);

        // 2. Ambil master data dari masing-masing tabel untuk Dropdown Admin
        $genres = Genre::orderBy('name', 'asc')->get();
        $moods  = Mood::orderBy('name', 'asc')->get();
        $styles = Style::orderBy('name', 'asc')->get();

        // 3. Lempar ke view
        return view('admin.artist.index', compact('artists', 'genres', 'moods', 'styles'));
    }

    public function update(Request $request, Artist $artist)
    {
        // 4. Validasi sekarang menggunakan ID relasi, bukan string teks lagi
        $validated = $request->validate([
            'genre_id' => 'nullable|exists:genres,id',
            'mood_id'  => 'nullable|exists:moods,id',
            'style_id' => 'nullable|exists:styles,id',
        ]);

        $artist->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data artis berhasil diperbarui!'
        ]);
    }

    public function syncAll()
    {
        // 👈 Masukkan proses ke dalam antrean (Queue)
        SyncArtistsJob::dispatch();

        // Langsung kembalikan respons instan ke admin tanpa menunggu proses selesai
        return back()->with('success', "Proses sinkronisasi artis telah dimulai di latar belakang (Queue). Anda bisa bebas meninggalkan atau me-refresh halaman ini.");
    }
}
