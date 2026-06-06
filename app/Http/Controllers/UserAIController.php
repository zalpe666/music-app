<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Song;

class UserAIController extends Controller
{
    public function index(Request $request)
    {
        try {
            $currentSongId = $request->input('current_song_id');
            $playedHistory = $request->input('played_history', []);
            $userTopSongIds = $request->input('user_top_song_ids', []);

            if (!is_array($playedHistory)) $playedHistory = [];
            if (!is_array($userTopSongIds)) $userTopSongIds = [];

            // 1. Cari data lengkap lagu patokan (Seed)
            $currentSong = Song::with(['artists.genre', 'artists.mood', 'artists.style'])->find($currentSongId);
            if (!$currentSong) {
                return response()->json(['message' => 'Lagu patokan tidak ditemukan'], 404);
            }

            $currentArtistIds = $currentSong->artists->pluck('id')->toArray();
            $currentPrimaryArtist = $currentSong->artists->first();

            // Ekstrak ID Vibe dari lagu saat ini
            $genreId = $currentPrimaryArtist ? $currentPrimaryArtist->genre_id : null;
            $moodId  = $currentPrimaryArtist ? $currentPrimaryArtist->mood_id : null;
            $styleId = $currentPrimaryArtist ? $currentPrimaryArtist->style_id : null;

            // =========================================================
            // 2. FILTER KAKU (STRICT VIBE FILTERING)
            // =========================================================
            $query = Song::with(['album', 'artists.genre', 'artists.mood', 'artists.style'])
                ->where('id', '!=', $currentSongId)
                ->whereNotIn('id', $playedHistory);

            // Jika artis memiliki setidaknya satu data Vibe, paksa query untuk HANYA
            // mengambil lagu-lagu yang memiliki kesamaan di salah satu parameter tersebut.
            if ($genreId || $moodId || $styleId) {
                $query->whereHas('artists', function ($q) use ($genreId, $moodId, $styleId) {
                    $q->where(function ($subQ) use ($genreId, $moodId, $styleId) {
                        if ($genreId) $subQ->orWhere('genre_id', $genreId);
                        if ($moodId)  $subQ->orWhere('mood_id', $moodId);
                        if ($styleId) $subQ->orWhere('style_id', $styleId);
                    });
                });
            }

            $candidates = $query->inRandomOrder()->limit(200)->get();

            // FALLBACK AMAN: Jika di database kehabisan lagu dengan genre/mood yang sama,
            // barulah kita buka gemboknya dan ambil lagu acak biasa agar musik tidak mati.
            if ($candidates->isEmpty()) {
                $candidates = Song::with(['album', 'artists.genre', 'artists.mood', 'artists.style'])
                    ->where('id', '!=', $currentSongId)
                    ->whereNotIn('id', $playedHistory)
                    ->inRandomOrder()
                    ->limit(200)
                    ->get();
            }

            if ($candidates->isEmpty()) {
                return response()->json(['message' => 'Lagu habis'], 404);
            }

            // =========================================================
            // 3. AI SCORING LOGIC (Penjurian pada Kandidat yang Sudah Disaring)
            // =========================================================
            $scoredCandidates = [];

            foreach ($candidates as $song) {
                $score = 10;
                $matchedCriteria = [];

                if ($song->album_id === $currentSong->album_id) {
                    $score += 30;
                    $matchedCriteria[] = "Sama Album";
                }

                $candidateArtistIds = $song->artists->pluck('id')->toArray();
                if (!empty(array_intersect($currentArtistIds, $candidateArtistIds))) {
                    $score += 40;
                    $matchedCriteria[] = "Sama Artis";
                }

                if (in_array($song->id, $userTopSongIds)) {
                    $score += 25;
                    $matchedCriteria[] = "Favorit User";
                }

                if ($song->explicit_lyrics === $currentSong->explicit_lyrics) {
                    $score += 10;
                    $matchedCriteria[] = "Explicit Match";
                }

                if ($song->duration && $currentSong->duration) {
                    if (abs($song->duration - $currentSong->duration) < 60) {
                        $score += 5;
                        $matchedCriteria[] = "Durasi Mirip";
                    }
                }

                if ($song->rank) {
                    $rankBonus = min(($song->rank / 100000) * 5, 15);
                    $score += $rankBonus;
                    if ($rankBonus > 5) $matchedCriteria[] = "Lagu Rank Tinggi";
                }

                $candidatePrimaryArtist = $song->artists->first();

                if ($currentPrimaryArtist && $candidatePrimaryArtist) {
                    if ($candidatePrimaryArtist->genre_id && $candidatePrimaryArtist->genre_id === $currentPrimaryArtist->genre_id) {
                        $score += 45;
                        $matchedCriteria[] = "Satu Genre";
                    }
                    if ($candidatePrimaryArtist->mood_id && $candidatePrimaryArtist->mood_id === $currentPrimaryArtist->mood_id) {
                        $score += 25;
                        $matchedCriteria[] = "Mood Mirip";
                    }
                    if ($candidatePrimaryArtist->style_id && $candidatePrimaryArtist->style_id === $currentPrimaryArtist->style_id) {
                        $score += 15;
                        $matchedCriteria[] = "Style Cocok";
                    }
                    if ($candidatePrimaryArtist->intCharted && $candidatePrimaryArtist->intCharted > 0) {
                        $score += 10;
                        $matchedCriteria[] = "Artis Populer (Charted)";
                    }
                }

                if ($song->popularity) {
                    $popularityBonus = min(($song->popularity / 100) * 15, 15);
                    $score += $popularityBonus;
                    if ($popularityBonus > 5) $matchedCriteria[] = "Lagu Populer (Hits)";
                }

                $weight = pow($score, 2);

                $scoredCandidates[] = [
                    'song' => $song,
                    'score' => $score,
                    'weight' => $weight,
                    'matchedCriteria' => $matchedCriteria
                ];
            }

            // =========================================================
            // 4. HYBRID: SORTING & POTONG KE TOP 20 KANDIDAT ELIT
            // =========================================================
            usort($scoredCandidates, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });

            $topCandidates = array_slice($scoredCandidates, 0, 20);

            $totalWeight = 0;
            foreach ($topCandidates as $item) {
                $totalWeight += $item['weight'];
            }

            // =========================================================
            // 5. SELEKSI ROULETTE WHEEL 
            // =========================================================
            $random = mt_rand(1, (int) ceil($totalWeight));
            $nextMatchDetails = null;

            foreach ($topCandidates as $item) {
                $random -= $item['weight'];
                if ($random <= 0) {
                    $nextMatchDetails = $item;
                    break;
                }
            }

            if (!$nextMatchDetails) {
                $nextMatchDetails = $topCandidates[0];
            }

            $nextMatch = $nextMatchDetails['song'];

            $nextMatch->setAttribute('ai_score', $nextMatchDetails['score']);
            $nextMatch->setAttribute('ai_reasons', $nextMatchDetails['matchedCriteria']);

            return response()->json($nextMatch, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
