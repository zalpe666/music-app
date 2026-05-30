<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSongHistory extends Model
{
    protected $fillable = ['user_id', 'song_id', 'play_count'];

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
