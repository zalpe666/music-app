<?php

namespace App\Jobs;

use App\Models\Song;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class DownloadMusicVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $song;
    public $timeout = 600;

    public function __construct(Song $song)
    {
        $this->song = $song;
    }

    public function handle()
    {
        if (!$this->song->youtube_url) return;

        // Tentukan folder dan pastikan foldernya ada
        $outputDir = storage_path('app/temp_video');
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // Format nama file output (contoh: 2.mp4)
        $fileName = $this->song->id . '.%(ext)s';
        $outputPath = $outputDir . '/' . $fileName;

        Log::info("🚀 Mulai download video ID: {$this->song->id} via yt-dlp CLI");

        try {
            // Memanggil yt-dlp langsung lewat Command Line Interface (CLI)
            $result = Process::timeout(600)->run([
                'yt-dlp',
                '-f',
                'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]',
                '--merge-output-format',
                'mp4',
                '-o',
                $outputPath,
                $this->song->youtube_url
            ]);

            // Tangkap output terminal untuk debugging
            $output = $result->output() . $result->errorOutput();
            Log::info($output);

            if ($result->successful()) {
                $this->song->update([
                    'local_video_path' => 'temp_video/' . $this->song->id . '.mp4'
                ]);
                Log::info("✅ Berhasil download MP4 untuk ID: {$this->song->id}");
            } else {
                Log::error("❌ Gagal download video ID {$this->song->id}: " . $output);
            }
        } catch (\Exception $e) {
            Log::error("❌ Exception Fatal di Job Download: " . $e->getMessage());
        } finally {
            // Wajib membuka gembok cache
            Cache::forget("downloading_video_song_{$this->song->id}");
            Log::info("🔓 Gembok cache dilepas untuk lagu ID: {$this->song->id}");
        }
    }
}
