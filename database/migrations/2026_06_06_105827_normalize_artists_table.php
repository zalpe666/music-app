<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('moods', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('styles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // 2. Tambahkan kolom Foreign Key ke tabel artists
        Schema::table('artists', function (Blueprint $table) {
            $table->unsignedBigInteger('mood_id')->nullable()->after('strGender');
            $table->unsignedBigInteger('style_id')->nullable()->after('mood_id');
            $table->unsignedBigInteger('genre_id')->nullable()->after('style_id');
        });
        $moods = DB::table('artists')->whereNotNull('strMood')->where('strMood', '!=', '')->distinct()->pluck('strMood');
        foreach ($moods as $mood) {
            $id = DB::table('moods')->insertGetId(['name' => $mood, 'created_at' => now(), 'updated_at' => now()]);
            DB::table('artists')->where('strMood', $mood)->update(['mood_id' => $id]);
        }

        // --- Migrasi Styles ---
        $styles = DB::table('artists')->whereNotNull('strStyle')->where('strStyle', '!=', '')->distinct()->pluck('strStyle');
        foreach ($styles as $style) {
            $id = DB::table('styles')->insertGetId(['name' => $style, 'created_at' => now(), 'updated_at' => now()]);
            DB::table('artists')->where('strStyle', $style)->update(['style_id' => $id]);
        }

        // --- Migrasi Genres ---
        $genres = DB::table('artists')->whereNotNull('strGenre')->where('strGenre', '!=', '')->distinct()->pluck('strGenre');
        foreach ($genres as $genre) {
            $id = DB::table('genres')->insertGetId(['name' => $genre, 'created_at' => now(), 'updated_at' => now()]);
            DB::table('artists')->where('strGenre', $genre)->update(['genre_id' => $id]);
        }

        // 4. Hapus kolom lama dan tetapkan Foreign Key constraint
        Schema::table('artists', function (Blueprint $table) {
            // Hapus kolom string lama
            $table->dropColumn(['strMood', 'strStyle', 'strGenre']);

            // Tambahkan constraint FK (agar data tidak sembarangan dihapus)
            $table->foreign('mood_id')->references('id')->on('moods')->onDelete('set null');
            $table->foreign('style_id')->references('id')->on('styles')->onDelete('set null');
            $table->foreign('genre_id')->references('id')->on('genres')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan ke struktur awal jika migration di-rollback
        Schema::table('artists', function (Blueprint $table) {
            $table->dropForeign(['mood_id']);
            $table->dropForeign(['style_id']);
            $table->dropForeign(['genre_id']);

            $table->string('strMood')->nullable();
            $table->string('strStyle')->nullable();
            $table->string('strGenre')->nullable();
        });

        // Kembalikan data dari ID ke String (Opsional, tapi disarankan untuk rollback yang aman)
        $artists = DB::table('artists')->get();
        foreach ($artists as $artist) {
            $moodName = $artist->mood_id ? DB::table('moods')->where('id', $artist->mood_id)->value('name') : null;
            $styleName = $artist->style_id ? DB::table('styles')->where('id', $artist->style_id)->value('name') : null;
            $genreName = $artist->genre_id ? DB::table('genres')->where('id', $artist->genre_id)->value('name') : null;

            DB::table('artists')->where('id', $artist->id)->update([
                'strMood' => $moodName,
                'strStyle' => $styleName,
                'strGenre' => $genreName,
            ]);
        }

        Schema::table('artists', function (Blueprint $table) {
            $table->dropColumn(['mood_id', 'style_id', 'genre_id']);
        });

        Schema::dropIfExists('moods');
        Schema::dropIfExists('styles');
        Schema::dropIfExists('genres');
    }
};
