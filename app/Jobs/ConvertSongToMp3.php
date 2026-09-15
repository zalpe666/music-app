<?php

namespace App\Jobs;

use App\Models\Song;
use App\Services\GoogleDriveStorageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use RuntimeException;

class ConvertSongToMp3 implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $timeout = 600;

    public int $tries = 2;

    protected int $songId;

    public function __construct(int $songId)
    {
        $this->songId = $songId;
    }

    public function handle(
        GoogleDriveStorageService $drive
    ): void {
        $song = Song::find($this->songId);

        if (!$song) {
            return;
        }

        if (!$song->audio_path) {
            Log::warning(
                "Song {$song->id} tidak memiliki audio_path."
            );

            return;
        }

        $sourcePath = null;
        $mp3Path = null;

        try {

            /*
            |--------------------------------------------------------------------------
            | 1. Ambil informasi file Google Drive
            |--------------------------------------------------------------------------
            */

            $file = $drive->getFile(
                $song->audio_path
            );

            if (!$file) {
                throw new RuntimeException(
                    "File Google Drive tidak ditemukan: {$song->audio_path}"
                );
            }

            $mimeType = strtolower(
                $file->getMimeType() ?? ''
            );

            $originalName = $file->getName();

            /*
            |--------------------------------------------------------------------------
            | 2. Kalau sudah MP3 → tidak perlu convert
            |--------------------------------------------------------------------------
            */

            if (
                $mimeType === 'audio/mpeg' ||
                strtolower(pathinfo(
                    $originalName,
                    PATHINFO_EXTENSION
                )) === 'mp3'
            ) {
                Log::info(
                    "Song {$song->id} sudah MP3. Skip."
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | 3. Folder temporary
            |--------------------------------------------------------------------------
            */

            $tempDirectory = storage_path(
                'app/temp_songs'
            );

            if (!File::exists($tempDirectory)) {
                File::makeDirectory(
                    $tempDirectory,
                    0755,
                    true
                );
            }

            $safeId = $song->id . '_' . uniqid();

            $sourcePath =
                $tempDirectory .
                '/' .
                $safeId .
                '_source';

            $mp3Path =
                $tempDirectory .
                '/' .
                $safeId .
                '.mp3';

            /*
            |--------------------------------------------------------------------------
            | 4. Download Google Drive
            |--------------------------------------------------------------------------
            */

            $drive->download(
                $song->audio_path,
                $sourcePath
            );

            if (!file_exists($sourcePath)) {
                throw new RuntimeException(
                    'Download source gagal.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 5. Convert menggunakan FFmpeg
            |--------------------------------------------------------------------------
            */

            $mp3FileName =
                pathinfo(
                    $originalName,
                    PATHINFO_FILENAME
                ) . '.mp3';

            $command = sprintf(
                'ffmpeg -y -i %s -vn -c:a libmp3lame -b:a 192k %s 2>&1',
                escapeshellarg($sourcePath),
                escapeshellarg($mp3Path)
            );

            $output = [];

            $returnCode = 0;

            exec(
                $command,
                $output,
                $returnCode
            );

            if (
                $returnCode !== 0 ||
                !file_exists($mp3Path) ||
                filesize($mp3Path) === 0
            ) {
                throw new RuntimeException(
                    "FFmpeg gagal.\n" .
                        implode("\n", $output)
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 6. Upload MP3 ke Google Drive
            |--------------------------------------------------------------------------
            */

            $uploaded = $drive->uploadMp3(
                $mp3Path,
                $mp3FileName,
                env('GOOGLE_DRIVE_FOLDER_ID')
            );

            if (empty($uploaded['id'])) {
                throw new RuntimeException(
                    'Upload MP3 ke Google Drive gagal.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 7. Update database
            |--------------------------------------------------------------------------
            */

            $oldAudioPath = $song->audio_path;

            $song->update([
                'audio_path' => $uploaded['id'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | 8. Hapus file lama dari Google Drive
            |--------------------------------------------------------------------------
            |
            | Saya matikan dulu supaya file asli tetap aman.
            |
            */

            // $drive->delete($oldAudioPath);

            Log::info(
                "Song {$song->id} berhasil dikonversi ke MP3.",
                [
                    'old_drive_id' => $oldAudioPath,
                    'new_drive_id' => $uploaded['id'],
                ]
            );
        } catch (\Throwable $e) {

            Log::error(
                "Gagal convert Song {$song->id}: " .
                    $e->getMessage()
            );

            throw $e;
        } finally {

            /*
            |--------------------------------------------------------------------------
            | 9. Bersihkan temporary files
            |--------------------------------------------------------------------------
            */

            if (
                $sourcePath &&
                file_exists($sourcePath)
            ) {
                @unlink($sourcePath);
            }

            if (
                $mp3Path &&
                file_exists($mp3Path)
            ) {
                @unlink($mp3Path);
            }
        }
    }
}
