<?php
namespace App\Services;

interface MusicProviderInterface {
    public function getTrack($id);
    public function searchTrack($title, $artist);
}