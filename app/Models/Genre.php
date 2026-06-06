<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    // Kolom yang boleh diisi (Mass Assignment)
    protected $fillable = ['name'];

    // Relasi: Satu genre bisa dimiliki banyak artis
    public function artists()
    {
        return $this->hasMany(Artist::class);
    }
}