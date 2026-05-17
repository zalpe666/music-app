<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SongController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GoogleDriveController;
use Google\Client;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use App\Models\Song;
use App\Models\Artist;
use App\Models\Album;
/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

Route::get('/', function () {

    return Inertia::render('Welcome', [

        'canLogin' => Route::has('login'),

        'canRegister' => Route::has('register'),

        'laravelVersion' => Application::VERSION,

        'phpVersion' => PHP_VERSION,

    ]);
});

/*
|--------------------------------------------------------------------------
| User App (Inertia)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'songs' => Song::with([
                'artist',
                'album'
            ])->latest()->get()
        ]);
    })->name('dashboard');

    Route::get('/search', [SearchController::class, 'index'])
        ->name('search');

    Route::get('/library', function () {
        return Inertia::render('Library');
    })->name('library');

    Route::get('/player', function () {
        return Inertia::render('Player');
    })->name('player');
    // Ini Route Streaming FIXED (Belom Download)
    // Route::get('/stream/{id}', function ($id) {

    //     $url = "https://drive.google.com/uc?export=download&id=" . $id;

    //     $response = Http::withOptions([
    //         'stream' => true,
    //     ])->get($url);

    //     return response()->stream(
    //         function () use ($response) {
    //             echo $response->body();
    //         },
    //         200,
    //         [
    //             "Content-Type" => "audio/mpeg",
    //             "Accept-Ranges" => "bytes",
    //             "Cache-Control" => "no-cache",
    //         ]
    //     );
    // });

    Route::get('/stream/{audio_path}', function ($audio_path) {
        try {
            $fileName = $audio_path . '.mp3';
            // Path langsung tembak ke folder Anda
            $dirPath = storage_path('app/temp_songs');
            $fullPath = $dirPath . '/' . $fileName;

            // 1. Buat folder secara paksa pakai PHP Native dengan izin penuh (0777)
            if (!is_dir($dirPath)) {
                if (!mkdir($dirPath, 0777, true)) {
                    throw new \Exception("Gagal membuat folder di: " . $dirPath . ". Cek permission folder Mac Anda!");
                }
            }

            // 2. Download dan Tulis secara langsung
            if (!file_exists($fullPath)) {
                $url = "https://drive.google.com/uc?export=download&id=" . $audio_path;

                // Download dari GDrive
                $response = \Illuminate\Support\Facades\Http::withOptions([
                    'verify' => false
                ])->get($url);

                if ($response->successful()) {
                    // Paksa tulis ke hardisk pakai PHP Native
                    $bytes = file_put_contents($fullPath, $response->body());

                    if ($bytes === false) {
                        throw new \Exception("Gagal menulis file ke hardisk (Permission Denied).");
                    }
                } else {
                    throw new \Exception("Google Drive menolak. Status: " . $response->status());
                }
            }

            // 3. Pastikan ulang filenya benar-benar nyata
            if (!file_exists($fullPath)) {
                throw new \Exception("File anehnya tetap ga ada walau udah di-download: " . $fullPath);
            }

            // 4. Return file! (Slider aktif)
            return response()->file($fullPath, [
                "Content-Type" => "audio/mpeg",
                "Accept-Ranges" => "bytes",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal Stream Bosku',
                'pesan_asli' => $e->getMessage()
            ], 500);
        }
    });

    // Update Route Delete untuk pakai PHP Native juga
    Route::delete('/stream/{audio_path}', function ($audio_path) {
        $fullPath = storage_path('app/temp_songs/' . $audio_path . '.mp3');

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        return response()->json(['message' => 'Lagu dihapus']);
    });
    Route::get('/lyrics/{lyrics_path}', function ($lyrics_path) {
        try {
            $url = "https://drive.google.com/uc?export=download&id=" . $lyrics_path;

            $response = \Illuminate\Support\Facades\Http::withOptions([
                'verify' => false
            ])->get($url);

            if ($response->successful()) {
                // Tembakkan teks liriknya langsung ke React
                return response($response->body(), 200)
                    ->header('Content-Type', 'text/plain');
            } else {
                return response('Gagal mengambil lirik dari Google Drive', 404);
            }
        } catch (\Exception $e) {
            return response('Error memuat lirik', 500);
        }
    });
    // ROUTE LIRIK DENGAN CACHING (Sama seperti sistem lagu)
    Route::get('/lyrics/{lyrics_path}', function ($lyrics_path) {
        try {
            $fileName = $lyrics_path . '.txt';
            $dirPath = storage_path('app/temp_lyrics');
            $fullPath = $dirPath . '/' . $fileName;

            // 1. Pastikan folder temp_lyrics ada
            if (!is_dir($dirPath)) {
                mkdir($dirPath, 0777, true);
            }

            // 2. Jika lirik belum ada di server, download dulu
            if (!file_exists($fullPath)) {
                $url = "https://drive.google.com/uc?export=download&id=" . $lyrics_path;

                $response = \Illuminate\Support\Facades\Http::withOptions([
                    'verify' => false
                ])->get($url);

                if ($response->successful()) {
                    // Simpan ke hardisk server
                    file_put_contents($fullPath, $response->body());
                } else {
                    return response('Gagal download lirik dari GDrive', 404);
                }
            }

            // 3. Baca file lirik yang sudah ada di server (Local Storage Server)
            $lyricsText = file_get_contents($fullPath);

            return response($lyricsText, 200)
                ->header('Content-Type', 'text/plain');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Lyrics Cache Error: " . $e->getMessage());
            return response('Error memuat lirik lokal', 500);
        }
    });

    // Tambahkan juga fungsi hapus lirik di route delete jika ingin dikosongkan bareng lagu
    Route::delete('/stream/{audio_path}', function ($audio_path) {
        // Hapus lagu
        $songPath = storage_path('app/temp_songs/' . $audio_path . '.mp3');
        if (file_exists($songPath)) unlink($songPath);

        // Hapus lirik (Opsional: Cari lirik berdasarkan relasi atau kirim lyrics_path dari depan)
        // Jika lirik ingin tetap di-cache lebih lama, bagian ini bisa dilewati.

        return response()->json(['message' => 'Cache dibersihkan']);
    });

    // 3. ROUTE CLEANUP (Menghapus file cache pakai GDrive ID)
    Route::delete('/stream/{audio_path}', function ($audio_path) {
        $fileName = 'temp_songs/' . $audio_path . '.mp3';

        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($fileName)) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($fileName);
        }

        return response()->json(['message' => 'Lagu berhasil dihapus']);
    });
    /*
    |--------------------------------------------------------------------------
    | Music
    |--------------------------------------------------------------------------
    */
    /*
    | Profile
    */

    Route::get('/profile', [ProfileController::class, 'edit',])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update',])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy',])->name('profile.destroy');
});

/*| Google Drive OAuth |*/

Route::get('/google-token', [GoogleDriveController::class, 'token']);
Route::get('/google-callback', [GoogleDriveController::class, 'callback']);
