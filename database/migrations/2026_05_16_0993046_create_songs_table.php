<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {

            $table->id();

            // Deezer
            $table->bigInteger('deezer_id')
                ->nullable()
                ->unique();

            // Relations
            $table->foreignId('artist_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('album_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Metadata
            $table->string('title');

            $table->string('title_short')
                ->nullable();

            $table->string('title_version')
                ->nullable();

            $table->string('isrc')
                ->nullable();

            $table->integer('duration')
                ->default(0);

            $table->boolean('explicit_lyrics')
                ->default(false);

            $table->bigInteger('rank')
                ->nullable();

            // Storage
            $table->string('provider')
                ->default('google');

            $table->text('audio_path')
                ->nullable();

            $table->text('lyrics_path')
                ->nullable();

            // Preview
            $table->text('preview_url')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};
