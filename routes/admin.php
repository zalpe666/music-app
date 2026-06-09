<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SongController;
use App\Http\Controllers\AdminArtistController;
use App\Http\Controllers\AudioDbSyncController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
/*
|--------------------------------------------------------------------------
| Admin Panel Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')
    ->middleware(['auth'])
    ->group(function () {

        // ==========================================
        // DASHBOARD
        // ==========================================
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        // ==========================================
        // SONGS
        // ==========================================
        // Custom routes wajib di atas resource!
        Route::get('/songs/search', [SongController::class, 'search'])->name('songs.search');
        Route::get('/songs/fetch', [SongController::class, 'fetchSpotify'])->name('songs.fetch');
        Route::get('/songs/search-spotify', [SongController::class, 'searchSpotify'])->name('songs.search-spotify');
        Route::post('/songs/sync-update', [SongController::class, 'updateFromSpotify'])->name('songs.sync.update');

        // Resource route (index, create, store, show, edit, update, destroy)
        Route::resource('songs', SongController::class);

        // ==========================================
        // ARTISTS
        // ==========================================
        Route::get('/artists', [AdminArtistController::class, 'index'])->name('admin.artists.index');
        Route::put('/artists-data/{artist}', [AdminArtistController::class, 'update'])->name('admin.artists.update');
        Route::post('/artists/sync-all', [AdminArtistController::class, 'syncAll'])->name('admin.artists.syncAll');

        // Route::get('/artists/{artist}', [AdminArtistController::class, 'showArtist'])->name('admin.artists.show');

        Route::get('/artists-summary', [AdminArtistController::class, 'summary'])->name('admin.artists.summary');

        Route::get('/songs/{song}/audiodb', [AudioDbSyncController::class, 'show'])->name('songs.audiodb.show');
        Route::post('/songs/{song}/audiodb', [AudioDbSyncController::class, 'store'])->name('songs.audiodb.store');
        Route::get('/video/{path}', function ($path) {
            $fullPath = 'temp_video/' . $path;

            if (!Storage::exists($fullPath)) {
                abort(404);
            }

            $file = Storage::path($fullPath);
            return response()->file($file, [
                'Content-Type' => 'video/mp4',
                'Accept-Ranges' => 'bytes',
            ]);
        })->name('video.stream');
    });
