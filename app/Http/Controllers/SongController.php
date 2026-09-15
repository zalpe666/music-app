<?php

namespace App\Http\Controllers;

use App\Services\GoogleDriveStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use App\Models\Song;
use App\Models\Artist;
use App\Models\Album;
use App\Services\ArtistDataService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Services\SpotifyMetadataService;
use App\Models\Genre;
use App\Models\Mood;
use App\Models\Style;

use App\Jobs\ConvertSongToMp3;

class SongController extends Controller
{

    // public function showArtist(Artist $artist)
    // {
    //     // Kamu bisa melempar data artis ke view detail
    //     return view('admin.artist.show', compact('artist'));
    // }
    public function index()
    {
        // Mengambil semua lagu untuk tabel utama
        $songs = Song::with(['album'])->latest()->paginate(20);

        // Mengambil lagu-lagu yang BUKAN dari Spotify untuk Sidebar (dibatasi 15 agar rapi)
        $needsSyncSongs = Song::whereNull('provider')
            ->orWhere('provider', '!=', 'spotify')
            ->latest()
            ->take(15)
            ->get();

        return view('admin.songs.index', compact('songs', 'needsSyncSongs'));
    }

    public function create()
    {
        return view('admin.songs.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'song_title'  => 'required',
            'audio_file'  => 'required|file',
            'lyrics'      => 'nullable|string',
        ]);

        try {
            $googleDrive = new GoogleDriveStorageService();
            $rootFolderId = env('GOOGLE_DRIVE_FOLDER_ID');

            // Ganti fallback folder name pure menggunakan spotify_id
            $songFolderName = $request->spotify_id ?? time();

            $songFolder = $googleDrive->findFolder($songFolderName, $rootFolderId);
            if (!$songFolder) {
                $songFolder = $googleDrive->createFolder($songFolderName, $rootFolderId);
            }

            // Upload audio (Tetap)
            $audioUpload = $googleDrive->upload($request->file('audio_file'), $songFolder['id']);
            $audioPath = $audioUpload['id'];

            // Upload lyrics (Tetap)
            $lyricsPath = null;
            if ($request->filled('lyrics')) {
                $fileName = time() . '.lrc';
                $tempDir = storage_path('app/temp');
                if (!file_exists($tempDir)) mkdir($tempDir, 0777, true);
                $tempPath = $tempDir . '/' . $fileName;
                file_put_contents($tempPath, $request->lyrics);
                $lyricsFile = new UploadedFile($tempPath, $fileName, 'text/plain', null, true);
                $lyricsUpload = $googleDrive->upload($lyricsFile, $songFolder['id']);
                $lyricsPath = $lyricsUpload['id'];
                unlink($tempPath);
            }

            // --- 1. PROSES BANYAK ARTIS ---
            $artistIds = [];
            $mainArtistId = null;

            $artistsData = json_decode($request->artists_raw, true) ?? [];

            // Fallback jika input manual
            if (empty($artistsData) && $request->filled('artist_name')) {
                $artistsData[] = [
                    'id' => $request->spotify_id ?? Str::random(10), // Ganti ke spotify_id
                    'name' => $request->artist_name,
                ];
            }

            foreach ($artistsData as $index => $artistItem) {
                $artist = Artist::updateOrCreate(
                    ['spotify_id' => data_get($artistItem, 'id')],
                    ['name' => data_get($artistItem, 'name')]
                );

                $artistIds[] = $artist->id;
                if ($index === 0) $mainArtistId = $artist->id;

                // Sync TheAudioDB (Tetap, tidak perlu diubah)
                // if (empty($artist->strBiography)) { ... }
            }
            // --- 2. PROSES ALBUM ---
            $album = Album::updateOrCreate(
                [
                    // KONDISI PENCARIAN: Cari album berdasarkan Artis DAN Judul Album
                    'artist_id' => $mainArtistId,
                    'title'     => $request->album_name,
                ],
                [
                    // DATA YANG DI-UPDATE/INSERT: Jika ketemu, update data ini. Jika tidak, buat baru.
                    'spotify_id' => $request->album_spotify_id,
                    'slug'       => Str::slug($request->album_name),
                    'cover_xl'   => $request->cover_xl,
                ]
            );

            // --- 2.5 TARIK DATA METADATA DARI THEAUDIODB ---
            $audioDbData = [
                'genre_id'    => null,
                'mood_id'     => null,
                'style_id'    => null,
                'theme'       => null,
                'description' => null,
                'youtube_url' => null,
            ];

            // Ambil nama artis utama (dari input form atau data spotify)
            $artistName = $request->artist_name ?? data_get($artistsData, '0.name');

            if ($artistName && $request->song_title) {
                try {
                    $url = "https://www.theaudiodb.com/api/v1/json/2/searchtrack.php";
                    // Gunakan timeout(5) agar jika API down, upload lagu tidak error
                    $response = Http::timeout(5)->get($url, [
                        's' => $artistName,
                        't' => $request->song_title
                    ]);
                    Log::info(
                        'TheAudioDB URL: ' .
                            $url .
                            '?' .
                            http_build_query([
                                's' => $artistName,
                                't' => $request->song_title
                            ])
                    );

                    // TheAudioDB mengembalikan {"track": null} jika lagu tidak ketemu
                    if ($response->successful() && isset($response->json()['track']) && $response->json()['track'] !== null) {
                        $trackInfo = $response->json()['track'][0];

                        if (!empty($trackInfo['strGenre']) && $trackInfo['strGenre'] !== '...') {
                            $genre = Genre::firstOrCreate(['name' => $trackInfo['strGenre']]);
                            $audioDbData['genre_id'] = $genre->id;
                        }

                        if (!empty($trackInfo['strMood']) && $trackInfo['strMood'] !== '...') {
                            $mood = Mood::firstOrCreate(['name' => $trackInfo['strMood']]);
                            $audioDbData['mood_id'] = $mood->id;
                        }

                        if (!empty($trackInfo['strStyle']) && $trackInfo['strStyle'] !== '...') {
                            $style = Style::firstOrCreate(['name' => $trackInfo['strStyle']]);
                            $audioDbData['style_id'] = $style->id;
                        }

                        $audioDbData['theme'] = (!empty($trackInfo['strTheme']) && $trackInfo['strTheme'] !== '...') ? $trackInfo['strTheme'] : null;
                        $audioDbData['description'] = !empty($trackInfo['strDescriptionEN']) ? $trackInfo['strDescriptionEN'] : null;
                        $audioDbData['youtube_url'] = !empty($trackInfo['strMusicVid']) ? $trackInfo['strMusicVid'] : null;
                    }
                } catch (\Exception $apiException) {
                    // Catat error API, tapi biarkan proses simpan lagu berlanjut
                    Log::warning('Gagal fetch data TheAudioDB saat insert lagu: ' . $apiException->getMessage());
                }
            }

            // --- 3. PROSES LAGU ---
            $song = Song::create([
                'title'             => $request->song_title,
                'album_id'          => $album->id,
                'spotify_id'        => $request->spotify_id,
                'isrc'              => $request->isrc,
                'duration'          => (int) ($request->duration ?? 0),
                'explicit_lyrics'   => filter_var($request->explicit_lyrics, FILTER_VALIDATE_BOOLEAN),
                'preview_url'       => $request->preview_url,
                'audio_path'        => $audioPath,
                'lyrics_path'       => $lyricsPath,
                'provider'          => 'Spotify',

                // Masukkan data dari TheAudioDB (Akan bernilai null jika API gagal/kosong)
                'genre_id'          => $audioDbData['genre_id'],
                'mood_id'           => $audioDbData['mood_id'],
                'style_id'          => $audioDbData['style_id'],
                'theme'             => $audioDbData['theme'],
                'description'       => $audioDbData['description'],
                'youtube_url'       => $audioDbData['youtube_url'],
            ]);

            // --- 4. ATTACH ARTISTS (Tetap) ---
            $song->artists()->sync($artistIds);

            return redirect()->route('songs.index')->with('success', 'Song added successfully with metadata!');
        } catch (\Exception $e) {
            Log::error('Error store song: ' . $e->getMessage());
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function search(Request $request)
    {
        $response = Http::get(
            'https://api.deezer.com/search',
            [
                'q' => $request->q,
            ]
        );

        return response()->json($response->json());
    }
    public function searchSpotify(Request $request, SpotifyMetadataService $spotifyService)
    {
        $keyword = $request->query('q');
        if (!$keyword) {
            return response()->json(['data' => []]);
        }

        $results = $spotifyService->getFullMetadata($keyword);

        return response()->json(['data' => $results]);
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function stream(Song $song)
    {
        return redirect(
            "https://drive.google.com/uc?id={$song->audio_path}"
        );
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }
    public function fetchSpotify(Request $request, SpotifyMetadataService $spotify)
    {
        $searchTitle = $request->input('title');
        $searchArtist = $request->input('artist');
        $syncId = $request->input('sync_id'); // Menangkap ID lagu yang akan disinkronisasi

        $results = null;

        if ($searchTitle) {
            $results = $spotify->getFullMetadata($searchTitle, $searchArtist);

            if (!$results) {
                $message = 'Lagu tidak ditemukan di Spotify.';
                if ($searchArtist) {
                    $message .= ' Coba hapus nama artis atau ganti ejaan.';
                } else {
                    $message .= ' Coba tambahkan nama artis untuk pencarian lebih spesifik.';
                }

                return back()->with('error', $message)->withInput();
            }
        }

        // Kirimkan syncId ke view
        return view('admin.songs.fetch-spotify', compact('results', 'searchTitle', 'searchArtist', 'syncId'));
    }

    public function updateFromSpotify(Request $request)
    {
        $request->validate([
            'sync_id'    => 'required|exists:songs,id',
            'track_data' => 'required|json',
        ]);

        try {
            $song = Song::findOrFail($request->sync_id);
            $trackData = json_decode($request->track_data, true);

            // 1. PROSES ARTIS (Multiple Artists)
            $artistIds = [];
            $mainArtistId = null;
            $artistsRaw = $trackData['artists_raw'] ?? [];

            foreach ($artistsRaw as $index => $artistItem) {
                $artist = Artist::updateOrCreate(
                    ['spotify_id' => data_get($artistItem, 'id')],
                    ['name' => data_get($artistItem, 'name')]
                );

                $artistIds[] = $artist->id;

                if ($index === 0) {
                    $mainArtistId = $artist->id;
                }
            }

            // 2. PROSES ALBUM
            $albumData = $trackData['album'] ?? [];
            $spotifyAlbumId = data_get($albumData, 'spotify_id');
            $albumName = data_get($albumData, 'name');

            // Cari album berdasarkan spotify_id ATAU (judul + artist) jika sebelumnya diinput manual
            $album = Album::where('spotify_id', $spotifyAlbumId)
                ->orWhere(function ($query) use ($albumName, $mainArtistId) {
                    $query->where('title', $albumName)
                        ->where('artist_id', $mainArtistId);
                })
                ->first();

            if ($album) {
                // Jika album sudah ada, kita update datanya (termasuk isi spotify_id jika sebelumnya manual/kosong)
                $album->update([
                    'spotify_id'   => $spotifyAlbumId,
                    'cover_xl'     => data_get($albumData, 'cover_xl'),
                    'release_date' => data_get($albumData, 'release_date'),
                ]);
            } else {
                // Jika album belum ada, buat baru dan pastikan slug-nya UNIK
                $baseSlug = Str::slug($albumName);
                $slug = $baseSlug;
                $counter = 1;

                // Looping untuk menambahkan angka jika slug sudah terpakai
                while (Album::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }

                $album = Album::create([
                    'spotify_id'   => $spotifyAlbumId,
                    'artist_id'    => $mainArtistId,
                    'title'        => $albumName,
                    'slug'         => $slug,
                    'cover_xl'     => data_get($albumData, 'cover_xl'),
                    'release_date' => data_get($albumData, 'release_date'),
                ]);
            }

            // 3. UPDATE LAGU (Tidak menimpa audio_path dan lyrics_path)
            $trackInfo = $trackData['track'] ?? [];
            $song->update([
                'title'           => data_get($trackInfo, 'name'),
                'album_id'        => $album->id,
                'spotify_id'      => data_get($trackInfo, 'spotify_id'),
                'duration'        => data_get($trackInfo, 'duration'),
                'preview_url'     => data_get($trackInfo, 'preview_url'),
                'provider'        => 'Spotify',
                'explicit_lyrics' => data_get($trackInfo, 'explicit'),
                'isrc'            => data_get($trackInfo, 'isrc'),
            ]);

            // 4. SINKRONISASI RELASI ARTIS (Pivot)
            $song->artists()->sync($artistIds);

            return redirect()->route('songs.index')->with('success', 'Metadata lagu berhasil disinkronisasi dengan Spotify!');
        } catch (\Exception $e) {
            Log::error('Error sync spotify: ' . $e->getMessage());
            return redirect()->route('songs.index')->withErrors(['error' => 'Gagal sinkronisasi: ' . $e->getMessage()]);
        }
    }
    public function bulkConvertToMp3()
    {
        $songs = Song::query()
            ->whereNotNull('audio_path')
            ->where('audio_path', '!=', '')
            ->get(['id']);

        $total = $songs->count();

        foreach ($songs as $song) {
            ConvertSongToMp3::dispatch(
                $song->id
            );
        }

        return back()->with(
            'success',
            "{$total} lagu dimasukkan ke antrean untuk dikonversi ke MP3."
        );
    }
}
