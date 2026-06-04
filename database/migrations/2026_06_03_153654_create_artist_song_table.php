<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('artist_song', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artist_id')->constrained('artists')->onDelete('cascade');
            $table->foreignId('song_id')->constrained('songs')->onDelete('cascade');
            $table->timestamps();
        });

        // Hapus kolom artist_id dari tabel songs jika sebelumnya ada
        if (Schema::hasColumn('songs', 'artist_id')) {
            Schema::table('songs', function (Blueprint $table) {
                $table->dropForeign(['artist_id']); // Hapus foreign key dulu (jika ada)
                $table->dropColumn('artist_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artist_song');
    }
};
