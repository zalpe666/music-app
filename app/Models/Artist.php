<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    protected $fillable = [
        'deezer_id',
        'name',
        'picture_small',
        'picture_medium',
        'picture_big',
        'picture_xl',
    ];

    public function songs()
    {
        return $this->hasMany(Song::class);
    }
}
