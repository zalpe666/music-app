<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SongController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/login', [AuthController::class, 'login']);

Route::get('/songs', [SongController::class, 'index']);
Route::get('/songs/popular', [SongController::class, 'popular']);
Route::get('/songs/search', [SongController::class, 'search']);
Route::get('/songs/{id}', [SongController::class, 'show']);
Route::get('/songs/{song}/stream', [SongController::class, 'stream']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
