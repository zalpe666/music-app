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
            // 'artist_name' dihapus dari validasi single, kita pakai artists_raw
            'audio_file'  => 'required|file',
            'lyrics'      => 'nullable|string',
        ]);

        try {
            $googleDrive = new GoogleDriveStorageService();
            $rootFolderId = env('GOOGLE_DRIVE_FOLDER_ID');

            // Folder berdasarkan Deezer ID / Spotify ID (bebas pakai yang mana)
            $songFolderName = $request->deezer_track_id ?? $request->spotify_id ?? time();

            $songFolder = $googleDrive->findFolder($songFolderName, $rootFolderId);
            if (!$songFolder) {
                $songFolder = $googleDrive->createFolder($songFolderName, $rootFolderId);
            }

            // Upload audio
            $audioUpload = $googleDrive->upload($request->file('audio_file'), $songFolder['id']);
            $audioPath = $audioUpload['id'];

            // Upload lyrics
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
            $mainArtistId = null; // Menyimpan ID artis pertama untuk relasi Album

            // Decode JSON artists_raw dari form
            $artistsData = json_decode($request->artists_raw, true) ?? [];

            // Fallback jika tidak ada data dari Spotify (misal input manual)
            if (empty($artistsData) && $request->filled('artist_name')) {
                $artistsData[] = [
                    'id' => $request->artist_deezer_id ?? Str::random(10), // Fallback ID
                    'name' => $request->artist_name,
                ];
            }

            foreach ($artistsData as $index => $artistItem) {
                // Update atau Create masing-masing artis
                $artist = Artist::updateOrCreate(
                    ['spotify_id' => data_get($artistItem, 'id')], // Atau deezer_id tergantung prioritasmu
                    ['name' => data_get($artistItem, 'name')]
                );

                // Simpan ID untuk pivot table
                $artistIds[] = $artist->id;

                // Simpan artis pertama sebagai artis utama untuk Album
                if ($index === 0) {
                    $mainArtistId = $artist->id;
                }

                // Sync ke AudioDB (Hanya dilakukan jika belum lengkap untuk hemat API)
                if (empty($artist->strBiography)) {
                    $url = "https://www.theaudiodb.com/api/v1/json/2/search.php?s=" . urlencode($artist->name);
                    $response = Http::get($url);

                    if ($response->successful() && isset($response->json()['artists'])) {
                        $data = $response->json()['artists'][0];
                        $artist->update([
                            'strBiography'       => $data['strBiographyEN'] ?? $data['strBiography'] ?? null,
                            'strArtistFanart'    => $data['strArtistFanart'] ?? null,
                            'strArtistFanart2'   => $data['strArtistFanart2'] ?? null,
                            'strArtistBanner'    => $data['strArtistBanner'] ?? null,
                            'strArtistClearart'  => $data['strArtistClearart'] ?? null,
                            'strArtistLogo'      => $data['strArtistLogo'] ?? null,
                            'strArtistWideThumb' => $data['strArtistWideThumb'] ?? null,
                            'intFormedYear'      => $data['intFormedYear'] ?? null,
                            'strGender'          => $data['strGender'] ?? null,
                            'strCountry'         => $data['strCountry'] ?? null,
                            'intMembers'         => $data['intMembers'] ?? null,
                            'strWebsite'         => $data['strWebsite'] ?? null,
                            'strFacebook'        => $data['strFacebook'] ?? null,
                            'strTwitter'         => $data['strTwitter'] ?? null,
                            'strMood'            => $data['strMood'] ?? null,
                            'strStyle'           => $data['strStyle'] ?? null,
                            'strGenre'           => $data['strGenre'] ?? null,
                            'intCharted'         => $data['intCharted'] ?? 0,
                        ]);
                    } else {
                        Log::error("Gagal update AudioDB data untuk artis: " . $artist->name);
                    }
                }
            }

            // --- 2. PROSES ALBUM ---
            // Album biasanya dikaitkan dengan artis utama (index 0)
            $album = Album::updateOrCreate(
                ['deezer_id' => $request->album_deezer_id], // Boleh diganti pakai spotify_id
                [
                    'artist_id' => $mainArtistId,
                    'slug'      => Str::slug($request->album_name),
                    'title'     => $request->album_name,
                    'cover_xl'  => $request->cover_xl,
                ]
            );

            // --- 3. PROSES LAGU ---
            $song = Song::create([
                'title'             => $request->song_title,
                'album_id'          => $album->id,
                'deezer_id'         => $request->deezer_track_id,
                'title_short'       => $request->title_short,
                'title_version'     => $request->title_version,
                'isrc'              => $request->isrc,
                'duration'          => (int) ($request->duration ?? 0),
                'explicit_lyrics'   => filter_var($request->explicit_lyrics, FILTER_VALIDATE_BOOLEAN),
                'rank'              => (int) ($request->rank ?? 0),
                'preview_url'       => $request->preview_url,
                'audio_path'        => $audioPath,
                'lyrics_path'       => $lyricsPath,
                // 'artist_id' sudah dihapus karena kita pakai relasi pivot
            ]);

            // --- 4. ATTACH ARTISTS KE SONG (Pivot Table) ---
            $song->artists()->sync($artistIds);

            return redirect()->route('songs.index')->with('success', 'Song added successfully with multiple artists');
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
}
