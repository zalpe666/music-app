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

        Route::resource(
            'songs',
            SongController::class
        );
        Route::get('/artists', [SongController::class, 'indexArtists'])->name('admin.artists.index');
        Route::post('/artists/sync-all', [SongController::class, 'syncAll'])->name('admin.artists.syncAll');
        Route::get('/artists/{artist}', [SongController::class, 'showArtist'])->name('admin.artists.show');
        Route::post('/artists/{artist}/sync', [SongController::class, 'sync'])->name('admin.artists.sync');
    });
