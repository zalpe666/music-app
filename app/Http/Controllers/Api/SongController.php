<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Song;

class SongController extends Controller
{
    // GET /api/songs
    public function index()
    {
        $songs = Song::with(['artist', 'album'])
            ->latest()
            ->paginate(20);

        $songs->getCollection()->transform(function ($song) {

            $song->stream_url = url(
                '/api/songs/' . $song->id . '/stream'
            );

            return $song;
        });

        return response()->json([
            'success' => true,
            'data' => $songs
        ]);
    }

    // GET /api/songs/{id}
    public function show($id)
    {
        $song = Song::with(['artist', 'album'])
            ->find($id);

        if (!$song) {
            return response()->json([
                'success' => false,
                'message' => 'Song not found'
            ], 404);
        }

        $song->stream_url = url(
            '/api/songs/' . $song->id . '/stream'
        );

        return response()->json([
            'success' => true,
            'data' => $song
        ]);
    }

    // GET /api/songs/search?q=
    public function search(Request $request)
    {
        $q = $request->q;

        $songs = Song::with(['artist', 'album'])
            ->where(function ($query) use ($q) {

                $query->where(
                    'title',
                    'like',
                    "%{$q}%"
                )->orWhereHas('artist', function ($artist) use ($q) {

                    $artist->where(
                        'name',
                        'like',
                        "%{$q}%"
                    );
                });
            })
            ->latest()
            ->paginate(20);

        $songs->getCollection()->transform(function ($song) {

            $song->stream_url = url(
                '/api/songs/' . $song->id . '/stream'
            );

            return $song;
        });

        return response()->json([
            'success' => true,
            'data' => $songs
        ]);
    }

    // GET /api/songs/popular
    public function popular()
    {
        $songs = Song::with(['artist', 'album'])
            ->orderByDesc('rank')
            ->take(20)
            ->get();

        $songs->transform(function ($song) {

            $song->stream_url = url(
                '/api/songs/' . $song->id . '/stream'
            );

            return $song;
        });

        return response()->json([
            'success' => true,
            'data' => $songs
        ]);
    }

    // GET /api/songs/{song}/stream
    public function stream(Song $song)
    {
        try {

            $this->ensureDirectoryExists(
                storage_path('app/temp_songs')
            );

            $fileName = $song->audio_path . '.mp3';

            $fullPath = storage_path(
                'app/temp_songs/' . $fileName
            );

            // download dari google drive
            if (!file_exists($fullPath)) {

                $url =
                    "https://drive.google.com/uc?export=download&id="
                    . $song->audio_path;

                $response = Http::withOptions([
                    'verify' => false,
                    'timeout' => 120,
                ])->get($url);

                if (!$response->successful()) {

                    throw new \Exception(
                        'Download gagal'
                    );
                }

                file_put_contents(
                    $fullPath,
                    $response->body()
                );
            }

            // STREAM MANUAL
            return response()->stream(
                function () use ($fullPath) {

                    $stream = fopen($fullPath, 'rb');

                    while (!feof($stream)) {

                        echo fread($stream, 8192);

                        flush();
                    }

                    fclose($stream);
                },

                200,

                [
                    'Content-Type' => 'audio/mpeg',
                    'Content-Length' => filesize($fullPath),
                    'Accept-Ranges' => 'bytes',
                    'Cache-Control' => 'public, max-age=86400',
                ]
            );
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function ensureDirectoryExists($path)
    {
        if (!file_exists($path)) {

            mkdir($path, 0777, true);
        }
    }
}
