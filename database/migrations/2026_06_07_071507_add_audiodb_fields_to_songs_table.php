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
        Schema::table('songs', function (Blueprint $table) {
            // Relasi ke tabel yang sudah ada (Genre, Mood, Style)
            $table->unsignedBigInteger('genre_id')->nullable()->after('album_id');
            $table->unsignedBigInteger('mood_id')->nullable()->after('genre_id');
            $table->unsignedBigInteger('style_id')->nullable()->after('mood_id');

            // Kolom teks/string
            $table->string('theme')->nullable()->after('style_id');
            $table->text('description')->nullable()->after('theme');
            $table->string('youtube_url')->nullable()->after('description');

            // Tambahkan Foreign Key jika mau database-nya lebih ketat (opsional tapi disarankan)
            $table->foreign('genre_id')->references('id')->on('genres')->nullOnDelete();
            $table->foreign('mood_id')->references('id')->on('moods')->nullOnDelete();
            $table->foreign('style_id')->references('id')->on('styles')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('songs', function (Blueprint $table) {
            //
        });
    }
};
