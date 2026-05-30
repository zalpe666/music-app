<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi langsung ke daftar lagu menggunakan pivot table
    public function songs()
    {
        // Parameter: (Model Tujuan, Nama Tabel Pivot, Foreign Key di Pivot, Foreign Key Model Tujuan di Pivot)
        return $this->belongsToMany(Song::class, 'playlist_songs', 'playlist_id', 'song_id')
            ->withPivot('order')
            ->withTimestamps()
            ->orderBy('pivot_order');
    }
}
