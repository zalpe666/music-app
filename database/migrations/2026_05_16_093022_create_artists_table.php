<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artists', function (Blueprint $table) {

            $table->id();

            $table->unsignedBigInteger('deezer_id')
                ->nullable()
                ->unique();

            $table->string('spotify_id')
                ->nullable()
                ->unique();
                
            $table->string('name');

            $table->text('picture_small')
                ->nullable();

            $table->text('picture_medium')
                ->nullable();

            $table->text('picture_big')
                ->nullable();

            $table->text('picture_xl')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artists');
    }
};
