<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('albums', function (Blueprint $table) {

            $table->id();

            $table->unsignedBigInteger('deezer_id')
                ->nullable()
                ->unique();

            $table->string('spotify_id')
                ->nullable()
                ->unique();

            $table->string('title');

            $table->text('cover_small')
                ->nullable();

            $table->text('cover_medium')
                ->nullable();

            $table->text('cover_big')
                ->nullable();

            $table->text('cover_xl')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('albums');
    }
};
