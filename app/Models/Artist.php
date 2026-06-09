<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str; // Pastikan import ini ada

class Artist extends Model
{
    protected $fillable = [
        'deezer_id',
        'spotify_id',
        'name',
        'is_validated',
        'slug',
        'picture_xl',
        'strBiography',
        'strArtistFanart',
        'strArtistFanart2',
        'strArtistFanart3',
        'strArtistBanner',
        'strArtistClearart',
        'strArtistLogo',
        'strArtistWideThumb',
        'intFormedYear',
        'strGender',
        'strCountry',
        'intMembers',
        'strWebsite',
        'strFacebook',
        'strTwitter',
        'mood_id',
        'style_id',
        'genre_id',
        'intCharted'
    ];

    /**
     * Boot the model.
     */
    protected static function booted()
    {
        static::creating(function ($artist) {
            // Jika slug kosong, buat otomatis dari nama
            if (empty($artist->slug)) {
                $slug = Str::slug($artist->name);

                // Pastikan slug unik dengan menambahkan angka jika sudah ada
                $originalSlug = $slug;
                $count = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }

                $artist->slug = $slug;
            }
        });
    }

    /**
     * Gunakan slug untuk route model binding (URL)
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function songs()
    {
        return $this->belongsToMany(Song::class, 'artist_song', 'artist_id', 'song_id');
    }
    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }

    // Relasi ke tabel moods
    public function mood()
    {
        return $this->belongsTo(Mood::class);
    }

    // Relasi ke tabel styles
    public function style()
    {
        return $this->belongsTo(Style::class);
    }
    public function albums()
    {
        // Satu artis bisa memiliki banyak album
        return $this->hasMany(Album::class);
    }
}
