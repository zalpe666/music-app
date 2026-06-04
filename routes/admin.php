<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SongController;

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
        Route::get('/artists', [SongController::class, 'indexArtists'])->name('admin.artists.index');
        Route::post('/artists/sync-all', [SongController::class, 'syncAll'])->name('admin.artists.syncAll');
        Route::get('/artists/{artist}', [SongController::class, 'showArtist'])->name('admin.artists.show');
        Route::post('/artists/{artist}/sync', [SongController::class, 'sync'])->name('admin.artists.sync');
        Route::post('/songs/sync-update', [SongController::class, 'updateFromSpotify'])->name('songs.sync.update');
    });
