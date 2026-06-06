<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SongController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GoogleDriveController;
use Google\Client;
use App\Http\Controllers\UserStreamingController;
use App\Http\Controllers\UserHomeController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\UserGenreController;
use App\Http\Controllers\UserSearchController;
use App\Http\Controllers\UserAIController;  
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
|-------------------------------------------------------------------------
| User App (Inertia)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [UserHomeController::class, 'dashboard'])->name('dashboard');
    Route::get('/search', [UserSearchController::class, 'index'])->name('search');
    Route::get('/library', [UserHomeController::class, 'library'])->name('library');
    Route::get('/player', [UserHomeController::class, 'player'])->name('player');
    Route::get('/artist/{artist:slug}', [UserHomeController::class, 'artist']);
    Route::get('/stream/{audio_path}', [UserStreamingController::class, 'stream']);
    Route::get('/artists', [UserHomeController::class, 'allArtists'])->name('artists');
    Route::get('/lyrics/{lyrics_path}', [UserStreamingController::class, 'lyrics']);
    Route::delete('/stream/{id}', [UserStreamingController::class, 'delete']);
    Route::get('/genre/{genre}', [UserGenreController::class, 'show'])->name('genre.show');

    Route::post('/player/ai-next-song', [UserAIController::class, 'index'])->name('player.ai.next');

    Route::post('/songs/{id}/play', [UserStreamingController::class, 'recordPlay'])->name('songs.play');

    Route::get('/album/{album:slug}', [UserHomeController::class, 'album']);
    Route::inertia('/PlayerMini', 'PlayerMini')->name('player.mini');
    Route::inertia('/LyricsMini', 'LyricsMini')->name('lyric.mini');

    Route::post('/playlists', [PlaylistController::class, 'store'])->name('playlists.store');
    Route::get('/playlists/{playlist}', [PlaylistController::class, 'show'])->name('playlists.show');
    Route::post('/playlists/add-song', [App\Http\Controllers\PlaylistController::class, 'addSong'])->name('playlists.add-song');

    Route::get('/profile', [ProfileController::class, 'edit',])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update',])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy',])->name('profile.destroy');
});

/*| Google Drive OAuth |*/

Route::get('/google-token', [GoogleDriveController::class, 'token']);
Route::get('/google-callback', [GoogleDriveController::class, 'callback']);
