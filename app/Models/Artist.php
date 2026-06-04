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
        'strMood',
        'strStyle',
        'strGenre',
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
}
