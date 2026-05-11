<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/stream-music/{filename}', function ($filename) {
        $path = public_path('music/' . $filename);

        if (!file_exists($path)) {
            abort(404);
        }

        // response()->file() secara otomatis menangani request "Range" dari browser
        return response()->file($path, [
            'Content-Type' => 'audio/mpeg',
            'Cache-Control' => 'no-cache, must-revalidate'
        ]);
    });
});

require __DIR__ . '/auth.php';
