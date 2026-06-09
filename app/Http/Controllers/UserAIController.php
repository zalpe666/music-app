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
            // Tangkap exclude_artist_id yang kita kirim dari React sebelumnya
            $excludeArtistId = $request->input('exclude_artist_id'); 

            if (!is_array($playedHistory)) $playedHistory = [];
            if (!is_array($userTopSongIds)) $userTopSongIds = [];

            // 1. Cari data lengkap lagu patokan (Seed)
            $currentSong = Song::with(['artists.genre', 'artists.mood', 'artists.style'])->find($currentSongId);
            if (!$currentSong) {
                return response()->json(['message' => 'Lagu patokan tidak ditemukan'], 404);
            }

            $currentArtistIds = $currentSong->artists->pluck('id')->toArray();
            $currentPrimaryArtist = $currentSong->artists->first();

            $genreId = $currentPrimaryArtist ? $currentPrimaryArtist->genre_id : null;
            $moodId  = $currentPrimaryArtist ? $currentPrimaryArtist->mood_id : null;
            $styleId = $currentPrimaryArtist ? $currentPrimaryArtist->style_id : null;

            // =========================================================
            // 2. FILTER KAKU (STRICT VIBE FILTERING)
            // =========================================================
            $query = Song::with(['album', 'artists.genre', 'artists.mood', 'artists.style'])
                ->where('id', '!=', $currentSongId)
                ->whereNotIn('id', $playedHistory);

            if ($genreId || $moodId || $styleId) {
                $query->whereHas('artists', function ($q) use ($genreId, $moodId, $styleId) {
                    $q->where(function ($subQ) use ($genreId, $moodId, $styleId) {
                        if ($genreId) $subQ->orWhere('genre_id', $genreId);
                        if ($moodId)  $subQ->orWhere('mood_id', $moodId);
                        if ($styleId) $subQ->orWhere('style_id', $styleId);
                    });
                });
            }

            // Ambil lebih banyak kandidat untuk variasi (misal: 300)
            $candidates = $query->inRandomOrder()->limit(300)->get();

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
            // 3. AI SCORING LOGIC (Penjurian Pintar)
            // =========================================================
            $scoredCandidates = [];

            foreach ($candidates as $song) {
                // Base score dinaikkan sedikit agar perhitungan lebih stabil
                $score = 20; 
                $matchedCriteria = [];
                $candidateArtistIds = $song->artists->pluck('id')->toArray();

                // --- LOGIC ANTI-MONOPOLI ARTIS ---
                $isSameArtist = !empty(array_intersect($currentArtistIds, $candidateArtistIds));
                
                if ($isSameArtist) {
                    // Jika artis ini sama dengan artis yang baru saja di-play, beri PENALTI BERAT
                    if ($excludeArtistId && in_array($excludeArtistId, $candidateArtistIds)) {
                        $score -= 50; 
                        $matchedCriteria[] = "Penalti: Artis Baru Saja Diputar";
                    } else {
                        // Jika sama artis tapi bukan yang terakhir diputar, beri bonus KECIL saja
                        $score += 5;
                        $matchedCriteria[] = "Sama Artis";
                    }
                } else {
                    // Beri bonus untuk artis yang BERBEDA agar playlist lebih variatif
                    $score += 20;
                    $matchedCriteria[] = "Artis Berbeda (Eksplorasi)";
                }

                // --- LOGIC ANTI-MONOPOLI ALBUM ---
                if ($song->album_id === $currentSong->album_id) {
                    // Jangan beri bonus besar, cukup kecil saja agar tidak stuck di 1 album
                    $score += 5; 
                    $matchedCriteria[] = "Sama Album";
                }

                // --- VIBE MATCHING (Fokus Utama AI) ---
                $candidatePrimaryArtist = $song->artists->first();
                if ($currentPrimaryArtist && $candidatePrimaryArtist) {
                    if ($candidatePrimaryArtist->genre_id && $candidatePrimaryArtist->genre_id === $currentPrimaryArtist->genre_id) {
                        $score += 50; // Genre adalah nyawa utama shuffle
                        $matchedCriteria[] = "Satu Genre";
                    }
                    if ($candidatePrimaryArtist->mood_id && $candidatePrimaryArtist->mood_id === $currentPrimaryArtist->mood_id) {
                        $score += 20;
                        $matchedCriteria[] = "Mood Mirip";
                    }
                    if ($candidatePrimaryArtist->style_id && $candidatePrimaryArtist->style_id === $currentPrimaryArtist->style_id) {
                        $score += 15;
                        $matchedCriteria[] = "Style Cocok";
                    }
                }

                // --- USER PREFERENCE & DATA MUSIK ---
                if (in_array($song->id, $userTopSongIds)) {
                    $score += 20;
                    $matchedCriteria[] = "Favorit User";
                }

                if ($song->explicit_lyrics === $currentSong->explicit_lyrics) {
                    $score += 5;
                }

                if ($song->popularity) {
                    $popularityBonus = min(($song->popularity / 100) * 15, 15);
                    $score += $popularityBonus;
                }

                // PENTING: Cegah skor minus sebelum dipangkatkan agar tidak jadi positif besar (contoh: -20^2 = 400)
                $score = max(1, $score);
                
                // Gunakan pangkat 1.5 alih-alih 2 untuk mengurangi ketimpangan skor secara ekstrem
                $weight = pow($score, 1.5); 

                $scoredCandidates[] = [
                    'song' => $song,
                    'score' => $score,
                    'weight' => $weight,
                    'matchedCriteria' => $matchedCriteria
                ];
            }

            // =========================================================
            // 4. HYBRID: SORTING & POTONG KE TOP 30 KANDIDAT
            // =========================================================
            usort($scoredCandidates, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });

            // Perbesar kolam undian menjadi top 30 agar lebih random tapi tetap relevan
            $topCandidates = array_slice($scoredCandidates, 0, 30); 

            $totalWeight = 0;
            foreach ($topCandidates as $item) {
                $totalWeight += $item['weight'];
            }

            // =========================================================
            // 5. SELEKSI ROULETTE WHEEL 
            // =========================================================
            // Gunakan mt_rand dengan perkalian float agar probabilitas lebih presisi
            $random = mt_rand() / mt_getrandmax() * $totalWeight;
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