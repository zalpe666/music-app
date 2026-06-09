<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
    protected $fillable = [
        // --- ID EKSTERNAL ---
        'deezer_id',
        'spotify_id', // 👈 Di-uncomment karena sekarang dipakai

        'artist_id',
        'album_id',

        // --- METADATA LAGU ---
        'title',
        'title_short',
        'title_version',
        'isrc',
        'duration',
        'explicit_lyrics',
        'rank',

        // --- DATA JSON/STRING BAWAAN LAMA ---
        'artist',
        'album',

        // --- ASSET & MEDIA ---
        'cover_small',
        'cover_medium',
        'cover_big',
        'cover_xl',
        'provider',
        'audio_path',
        'lyrics_path',
        'preview_url',

        // --- KOLOM BARU SPOTIFY (AI & PENGURUTAN) ---
        'track_number',
        'disc_number',
        'popularity',
        'tempo',
        'valence',
        'energy',
        'danceability',

        'genre_id',
        'mood_id',
        'style_id',
        'theme',
        'genre_id',
        'description',      // Pastikan ini ada
        'youtube_url',      // Sesuaikan dengan nama tabelmu
        'audiodb_status', // 👈 Tambahkan ini
        'local_video_path', // 👈 WAJIB ADA DI SINI
    ];

    protected $casts = [
        'explicit_lyrics' => 'boolean',
        'duration'        => 'integer',
        'rank'            => 'integer',

        // Casts untuk data Spotify yang baru
        'track_number'    => 'integer',
        'disc_number'     => 'integer',
        'popularity'      => 'integer',
        'tempo'           => 'float',
        'valence'         => 'float',
        'energy'          => 'float',
        'danceability'    => 'float',
    ];

    public function artists()
    {
        return $this->belongsToMany(Artist::class, 'artist_song', 'song_id', 'artist_id');
    }

    public function album()
    {
        return $this->belongsTo(Album::class);
    }
}
