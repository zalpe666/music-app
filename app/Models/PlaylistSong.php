<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

// Gunakan 'Pivot' class bawaan Laravel untuk tabel penghubung (jika dibutuhkan)
class PlaylistSong extends Pivot
{
    protected $table = 'playlist_songs';

    protected $fillable = [
        'playlist_id',
        'song_id',
        'order',
    ];
}
