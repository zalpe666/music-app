<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
    protected $fillable = [

        'deezer_id',
        'artist_id',
        'album_id',
        'title',
        'title_short',
        'title_version',

        'isrc',

        'duration',

        'explicit_lyrics',

        'rank',

        'artist',

        'album',

        'cover_small',
        'cover_medium',
        'cover_big',
        'cover_xl',

        'provider',

        'audio_path',

        'lyrics_path',

        'preview_url',
    ];

    protected $casts = [
        'explicit_lyrics' => 'boolean',
    ];
    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    public function album()
    {
        return $this->belongsTo(Album::class);
    }
}
