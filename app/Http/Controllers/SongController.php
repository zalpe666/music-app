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

class SongController extends Controller
{
    public function index()
    {
        $songs = Song::latest()->paginate(20);

        return view('admin.songs.index', compact('songs'));
    }

    public function create()
    {
        return view('admin.songs.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'song_title'   => 'required',
            'artist_name'  => 'required',
            'audio_file' => 'required|file',
            'lyrics'       => 'nullable|string',

        ]);

        try {
            $googleDrive = new GoogleDriveStorageService();

            // Root folder Google Drive
            $rootFolderId = env('GOOGLE_DRIVE_FOLDER_ID');

            // Folder berdasarkan Deezer ID
            $songFolderName = $request->deezer_track_id;

            // Cari folder
            $songFolder = $googleDrive->findFolder(
                $songFolderName,
                $rootFolderId
            );

            // Buat folder jika belum ada
            if (!$songFolder) {
                $songFolder = $googleDrive->createFolder(
                    $songFolderName,
                    $rootFolderId
                );
            }

            // Upload audio
            $audioUpload = $googleDrive->upload(
                $request->file('audio_file'),
                $songFolder['id']
            );

            $audioPath = $audioUpload['id'];

            // Upload lyrics jika ada
            $lyricsPath = null;

            if ($request->filled('lyrics')) {

                // Nama file
                $fileName = time() . '.lrc';

                // Path sementara
                $tempDir = storage_path('app/temp');

                // Buat folder jika belum ada
                if (!file_exists($tempDir)) {
                    mkdir($tempDir, 0777, true);
                }

                $tempPath = $tempDir . '/' . $fileName;

                // Simpan isi lirik
                file_put_contents($tempPath, $request->lyrics);

                // Convert jadi UploadedFile
                $lyricsFile = new UploadedFile(
                    $tempPath,
                    $fileName,
                    'text/plain',
                    null,
                    true
                );

                // Upload ke Google Drive
                $lyricsUpload = $googleDrive->upload(
                    $lyricsFile,
                    $songFolder['id']
                );

                $lyricsPath = $lyricsUpload['id'];

                // Hapus file sementara
                unlink($tempPath);
            }
            // Artist
            $artist = Artist::updateOrCreate(
                [
                    'deezer_id' => $request->artist_deezer_id
                ],
                [
                    'name' => $request->artist_name,

                    'picture_small' => $request->artist_picture_small,

                    'picture_medium' => $request->artist_picture_medium,

                    'picture_big' => $request->artist_picture_big,

                    'picture_xl' => $request->artist_picture_xl,
                ]
            );

            // Album
            $album = Album::updateOrCreate(
                [
                    'deezer_id' => $request->album_deezer_id
                ],
                [
                    'artist_id' => $artist->id,

                    'title' => $request->album_name,

                    'cover_small' => $request->cover_small,

                    'cover_medium' => $request->cover_medium,

                    'cover_big' => $request->cover_big,

                    'cover_xl' => $request->cover_xl,
                ]
            );
            Song::create([
                'title'             => $request->song_title,

                'artist_id'         => $artist->id,
                'album_id'          => $album->id,

                'deezer_id'         => $request->deezer_track_id,

                'title_short'       => $request->title_short,

                'title_version'     => $request->title_version,

                'isrc'              => $request->isrc,

                'duration'          => (int) ($request->duration ?? 0),

                'explicit_lyrics'   => filter_var(
                    $request->explicit_lyrics,
                    FILTER_VALIDATE_BOOLEAN
                ),

                'rank'              => (int) ($request->rank ?? 0),

                'preview_url'       => $request->preview_url,

                'audio_path'        => $audioPath,

                'lyrics_path'       => $lyricsPath,
            ]);

            return redirect()
                ->route('songs.index')
                ->with('success', 'Song added');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => $e->getMessage(),
            ]);
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
}
