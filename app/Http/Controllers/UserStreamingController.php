<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class UserStreamingController extends Controller
{
    public function stream($audio_path)
    {
        try {
            /*
            |--------------------------------------------------------------------------
            | CREATE DIRECTORY
            |--------------------------------------------------------------------------
            */
            $this->ensureDirectoryExists(storage_path('app/temp_songs'));

            /*
            |--------------------------------------------------------------------------
            | FILE PATH
            |--------------------------------------------------------------------------
            */
            $fileName = $audio_path . '.mp3';
            $fullPath = storage_path('app/temp_songs/' . $fileName);

            /*
            |--------------------------------------------------------------------------
            | DOWNLOAD HANYA JIKA BELUM ADA
            |--------------------------------------------------------------------------
            */
            if (!file_exists($fullPath)) {
                $url = "https://drive.google.com/uc?export=download&id=" . $audio_path;

                $response = Http::withOptions([
                    'verify' => false,
                    'timeout' => 120,
                ])->get($url);

                if (!$response->successful()) {
                    throw new \Exception('Google Drive menolak. Status: ' . $response->status());
                }

                $bytes = file_put_contents($fullPath, $response->body());

                if ($bytes === false) {
                    throw new \Exception('Gagal menulis audio.');
                }
            }

            /*
            |--------------------------------------------------------------------------
            | STREAM AUDIO DARI PENYIMPANAN LOKAL
            |--------------------------------------------------------------------------
            */
            return response()->file($fullPath, [
                "Content-Type"  => "audio/mpeg",
                "Accept-Ranges" => "bytes",
                "Cache-Control" => "public, max-age=86400",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | STREAM LYRICS
    |--------------------------------------------------------------------------
    */
    public function lyrics($lyrics_path)
    {
        try {
            $this->ensureDirectoryExists(storage_path('app/temp_lyrics'));

            $fileName = $lyrics_path . '.txt';
            $fullPath = storage_path('app/temp_lyrics/' . $fileName);

            /*
            |--------------------------------------------------------------------------
            | DOWNLOAD HANYA JIKA BELUM ADA
            |--------------------------------------------------------------------------
            */
            if (!file_exists($fullPath)) {
                $url = "https://drive.google.com/uc?export=download&id=" . $lyrics_path;

                $response = Http::withOptions([
                    'verify' => false,
                    'timeout' => 120,
                ])->get($url);

                if (!$response->successful()) {
                    throw new \Exception('Google Drive menolak lirik.');
                }

                $bytes = file_put_contents($fullPath, $response->body());

                if ($bytes === false) {
                    throw new \Exception('Gagal menyimpan lirik.');
                }
            }

            /*
            |--------------------------------------------------------------------------
            | RETURN TEXT DARI PENYIMPANAN LOKAL
            |--------------------------------------------------------------------------
            */
            return response(file_get_contents($fullPath), 200)
                ->header('Content-Type', 'text/plain');
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER - CREATE DIRECTORY
    |--------------------------------------------------------------------------
    */
    private function ensureDirectoryExists($path)
    {
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }
    }
}
