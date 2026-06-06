<?php

use App\Http\Controllers\AdminArtistController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SongController;
use App\Http\Controllers\AdminDashboardController;
/*
|--------------------------------------------------------------------------
| Admin Panel
|--------------------------------------------------------------------------
*/

Route::prefix('admin')
    ->middleware([
        'auth',
    ])
    ->group(function () {
        Route::get(
            '/songs/search',
            [SongController::class, 'search']
        )->name('songs.search');
        Route::get('/songs/fetch', [SongController::class, 'fetchSpotify'])->name('songs.fetch');

        Route::resource(
            'songs',
            SongController::class
        );
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/artists', [AdminArtistController::class, 'index'])->name('admin.artists.index');
        Route::put('/artists-data/{artist}', [AdminArtistController::class, 'update'])->name('admin.artists.update');
        Route::post('/artists/sync-all', [AdminArtistController::class, 'syncAll'])->name('admin.artists.syncAll');
        // Route::get('/artists/{artist}', [SongController::class, 'showArtist'])->name('admin.artists.show');
        Route::post('/songs/sync-update', [SongController::class, 'updateFromSpotify'])->name('songs.sync.update');
    });
