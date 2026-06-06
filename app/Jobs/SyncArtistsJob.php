<?php

namespace App\Jobs;

use App\Models\Artist;
use App\Services\ArtistDataService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncArtistsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Tentukan batas waktu eksekusi job (dalam detik).
     * Set ke 0 agar tidak terkena timeout karena proses sleep() yang lama.
     */
    public $timeout = 0;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(ArtistDataService $service): void
    {
        Log::info("🤖 Queue: Memulai proses sinkronisasi data artis di latar belakang...");

        $artists = Artist::where('is_validated', false)->get();
        $count = 0;

        foreach ($artists as $artist) {
            // Jalankan sinkronisasi data lewat service yang sudah disesuaikan sebelumnya
            $success = $service->updateArtistData($artist);

            if ($success) {
                $count++;
            }

            // Tetap beri jeda 1 detik di background agar aman dari limit API TheAudioDB
            sleep(1);
        }

        Log::info("✅ Queue: Selesai menyinkronkan data baru untuk $count artis.");
    }
}
