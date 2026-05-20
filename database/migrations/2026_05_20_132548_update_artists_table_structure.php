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
        Schema::table('artists', function (Blueprint $table) {
            // --- 1. Bio & Info ---
            $table->text('strBiography')->nullable();
            
            // --- 2. Visual Assets ---
            $table->string('strArtistFanart')->nullable();
            $table->string('strArtistFanart2')->nullable();
            $table->string('strArtistFanart3')->nullable();
            $table->string('strArtistBanner')->nullable();
            $table->string('strArtistClearart')->nullable();
            $table->string('strArtistLogo')->nullable();        // Tambahan baru
            $table->string('strArtistWideThumb')->nullable();   // Tambahan baru
            
            // --- 3. Facts ---
            $table->integer('intFormedYear')->nullable();
            $table->string('strGender')->nullable();
            $table->string('strCountry')->nullable();
            $table->integer('intMembers')->nullable();
            
            // --- 4. Social Media ---
            $table->string('strWebsite')->nullable();
            $table->string('strFacebook')->nullable();
            $table->string('strTwitter')->nullable();
            
            // --- 5. AI Scoring Fields ---
            $table->string('strMood')->nullable();
            $table->string('strStyle')->nullable();
            $table->string('strGenre')->nullable();
            $table->integer('intCharted')->default(0);          // Tambahan baru
            
            // --- 6. Cleanup (Hapus kolom gambar lama) ---
            $table->dropColumn(['picture_small', 'picture_medium', 'picture_big']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
