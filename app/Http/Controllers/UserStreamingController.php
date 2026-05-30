<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Song;
use App\Models\UserSongHistory; // 👈 PASTIKAN INI ADA
class UserStreamingController extends Controller
{
    public function stream($audio_path)
    {
        try {
            $this->ensureDirectoryExists(storage_path('app/temp_songs'));
            $fileName = $audio_path . '.mp3';
            $fullPath = storage_path('app/temp_songs/' . $fileName);
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

    public function recordPlay($id)
    {
        $song = Song::findOrFail($id);

        // 1. Tambah +1 ke play_count GLOBAL (untuk semua orang)
        $song->increment('play_count');

        // 2. Jika ada User yang Login, simpan riwayat personalnya
        if (auth()->check()) {
            $userId = auth()->id();

            // Cari apakah user ini sudah pernah muter lagu ini
            $history = UserSongHistory::where('user_id', $userId)
                ->where('song_id', $id)
                ->first();

            if ($history) {
                // Jika sudah ada, tambah play_count +1 dan perbarui updated_at
                $history->increment('play_count');
                $history->touch(); // Memaksa updated_at berubah ke waktu sekarang
            } else {
                // Jika belum pernah, buat data baru
                UserSongHistory::create([
                    'user_id' => $userId,
                    'song_id' => $id,
                    'play_count' => 1
                ]);
            }
        }

        return response()->json(['success' => true]);
    }
}
