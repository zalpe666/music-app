<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Song;
use App\Models\UserSongHistory;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Genre; // 👈 JANGAN LUPA IMPORT MODEL GENRE
use App\Services\SpotifyMetadataService;
use App\Jobs\DownloadMusicVideo;
use Illuminate\Support\Facades\Cache;

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

    public function lyrics($lyrics_path)
    {
        try {
            $this->ensureDirectoryExists(storage_path('app/temp_lyrics'));

            $fileName = $lyrics_path . '.txt';
            $fullPath = storage_path('app/temp_lyrics/' . $fileName);

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

            return response(file_get_contents($fullPath), 200)
                ->header('Content-Type', 'text/plain');
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function ensureDirectoryExists($path)
    {
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }
    }

    public function recordPlay($id)
    {
        $song = Song::findOrFail($id);

        \Log::info("🎵 Memutar lagu: " . $song->title);

        if ($song->youtube_url && empty($song->local_video_path)) {
            $cacheKey = "downloading_video_song_{$song->id}";

            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, true, 600);
                DownloadMusicVideo::dispatch($song);
            }
        }

        $song->increment('play_count');

        if (auth()->check()) {
            $userId = auth()->id();

            $history = UserSongHistory::where('user_id', $userId)
                ->where('song_id', $id)
                ->first();

            if ($history) {
                $history->increment('play_count');
                $history->touch();
            } else {
                UserSongHistory::create([
                    'user_id' => $userId,
                    'song_id' => $id,
                    'play_count' => 1
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'song' => $song->fresh(['artists.genre', 'artists.mood', 'artists.style', 'album'])
        ]);
    }

    private function syncSpotifyData(Song $song, SpotifyMetadataService $spotify)
    {
        if (empty($song->spotify_id) || is_null($song->tempo)) {

            $mainArtist = $song->artists()->first();
            $artistName = $mainArtist ? $mainArtist->name : '';

            $album = Album::find($song->album_id);

            \Log::info("Mencari Spotify untuk lagu: {$song->title} - {$artistName}");

            try {
                $metadata = $spotify->getFullMetadata($song->title, $artistName);

                if ($metadata) {
                    \Log::info("Metadata DITEMUKAN untuk: {$song->title}");

                    // 1. Update Album
                    if ($album && !empty($metadata['album']['spotify_id'])) {
                        $album->update([
                            'spotify_id' => $metadata['album']['spotify_id'],
                            'cover_xl'   => $metadata['album']['cover_xl'],
                        ]);
                    }

                    // 2. Update Data Teknis Lagu
                    if (!empty($metadata['track']['spotify_id'])) {
                        $song->update([
                            'spotify_id'   => $metadata['track']['spotify_id'],
                            'duration'     => $metadata['track']['duration'] ?? $song->duration,
                            'preview_url'  => $metadata['track']['preview_url'] ?? $song->preview_url,
                            'isrc'         => $metadata['track']['isrc'] ?? $song->isrc,
                            'popularity'   => $metadata['track']['popularity'] ?? $song->popularity,
                            'track_number' => $metadata['track']['track_number'] ?? $song->track_number,
                            'disc_number'  => $metadata['track']['disc_number'] ?? $song->disc_number,
                            'tempo'        => $metadata['track']['tempo'],
                            'valence'      => $metadata['track']['valence'],
                            'energy'       => $metadata['track']['energy'],
                            'danceability' => $metadata['track']['danceability'],
                        ]);
                    }

                    // 3. LOGIKA BARU: MULTIPLE ARTISTS (FEAT)
                    $artistIds = [];

                    foreach ($metadata['artists_raw'] as $index => $spotifyArtist) {

                        $dbArtist = Artist::where('spotify_id', $spotifyArtist['id'])->first();

                        if (!$dbArtist) {
                            $dbArtist = Artist::where('name', $spotifyArtist['name'])->first();

                            if ($dbArtist) {
                                if (empty($dbArtist->spotify_id)) {
                                    try {
                                        $dbArtist->update([
                                            'spotify_id' => $spotifyArtist['id']
                                        ]);
                                    } catch (\Exception $e) {
                                        \Log::warning("Spotify ID Bentrok saat update artis: " . $spotifyArtist['name']);
                                    }
                                }
                            } else {
                                $dbArtist = Artist::create([
                                    'spotify_id' => $spotifyArtist['id'],
                                    'name'       => $spotifyArtist['name']
                                ]);
                            }
                        }

                        // ✅ PERBAIKAN: Menangani konversi String Genre dari API menjadi ID Relasi
                        if ($index === 0) {
                            $artistUpdateData = [];

                            if (!empty($metadata['artist']['picture_xl'])) {
                                $artistUpdateData['picture_xl'] = $metadata['artist']['picture_xl'];
                            }

                            // Cek apakah Spotify Service mengembalikan string genre
                            if (!empty($metadata['artist']['strGenre'])) {
                                $genreName = $metadata['artist']['strGenre'];

                                // Cari genre berdasarkan nama, kalau tidak ada, buat baru di tabel genres
                                $genre = Genre::firstOrCreate(['name' => $genreName]);

                                // Simpan ID-nya untuk di-update ke tabel artists
                                $artistUpdateData['genre_id'] = $genre->id;
                            }

                            // Eksekusi update jika ada data yang perlu diubah (foto atau genre)
                            if (!empty($artistUpdateData)) {
                                $dbArtist->update($artistUpdateData);
                            }
                        }

                        $artistIds[] = $dbArtist->id;
                    }

                    // 4. Hubungkan Lagu dengan Semua ID Artis
                    $song->artists()->sync($artistIds);
                } else {
                    \Log::warning("Metadata KOSONG dari Spotify untuk: {$song->title}");
                }
            } catch (\Exception $e) {
                \Log::error("Error Fatal Spotify API: " . $e->getMessage());
            }
        }
    }
    public function streamVideo($path)
    {
        $fullPath = storage_path('app/' . $path);

        if (!file_exists($fullPath)) {
            abort(404, 'Video tidak ditemukan');
        }

        return response()->file($fullPath, [
            'Content-Type' => 'video/mp4',
            'Accept-Ranges' => 'bytes',
        ]);
    }
}
