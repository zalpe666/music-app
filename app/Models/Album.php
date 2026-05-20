<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    protected $fillable = [
        'deezer_id',
        'artist_id',
        'slug',
        'title',
        'cover_small',
        'cover_medium',
        'cover_big',
        'cover_xl',
    ];

    public function songs()
    {
        return $this->hasMany(Song::class);
    }
    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }
}
