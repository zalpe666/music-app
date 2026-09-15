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

            // Ekstrak metadata artis (Fallback ke metadata Song jika ada)
            $genreId = $currentPrimaryArtist ? $currentPrimaryArtist->genre_id : $currentSong->genre_id;
            $moodId  = $currentPrimaryArtist ? $currentPrimaryArtist->mood_id : $currentSong->mood_id;
            $styleId = $currentPrimaryArtist ? $currentPrimaryArtist->style_id : $currentSong->style_id;

            // =========================================================
            // 2. QUERY KANDIDAT (Memperluas Pencarian)
            // =========================================================
            // Kita ambil 300 lagu acak yang belum diputar.
            // Tidak di-filter kaku di database agar AI punya banyak opsi menghitung jarak.
            $candidates = Song::with(['album', 'artists.genre', 'artists.mood', 'artists.style'])
                ->where('id', '!=', $currentSongId)
                ->whereNotIn('id', $playedHistory)
                ->inRandomOrder()
                ->limit(300)
                ->get();

            if ($candidates->isEmpty()) {
                return response()->json(['message' => 'Lagu habis'], 404);
            }

            // =========================================================
            // 3. AI SCORING LOGIC (Penggabungan Audio Features & Vibe)
            // =========================================================
            $scoredCandidates = [];

            foreach ($candidates as $song) {
                $score = 20; // Base score
                $matchedCriteria = [];
                $candidateArtistIds = $song->artists->pluck('id')->toArray();

                // --- A. LOGIC ANTI-MONOPOLI (UX) ---
                $isSameArtist = !empty(array_intersect($currentArtistIds, $candidateArtistIds));

                if ($isSameArtist) {
                    if ($excludeArtistId && in_array($excludeArtistId, $candidateArtistIds)) {
                        $score -= 40; // Penalti berat jika baru saja diputar
                        $matchedCriteria[] = "Penalti: Artis Baru Saja Diputar";
                    } else {
                        $score += 5;
                        $matchedCriteria[] = "Sama Artis";
                    }
                } else {
                    $score += 25; // Bonus eksplorasi agar playlist tidak bosan
                    $matchedCriteria[] = "Artis Berbeda (Eksplorasi)";
                }

                if ($song->album_id && $song->album_id === $currentSong->album_id) {
                    $score += 5;
                }

                // --- B. VIBE MATCHING (Kecocokan Genre/Mood) ---
                $candidatePrimaryArtist = $song->artists->first();
                $cGenre = $candidatePrimaryArtist ? $candidatePrimaryArtist->genre_id : $song->genre_id;
                $cMood  = $candidatePrimaryArtist ? $candidatePrimaryArtist->mood_id : $song->mood_id;

                if ($genreId && $cGenre === $genreId) {
                    $score += 40;
                    $matchedCriteria[] = "Satu Genre";
                }
                if ($moodId && $cMood === $moodId) {
                    $score += 20;
                    $matchedCriteria[] = "Satu Mood";
                }

                // --- C. SPOTIFY AUDIO FEATURES MATCHING (THE REAL AI) ---
                // Menghitung "Sonic Similarity" (Kedekatan Suara)

                // 1. Tempo (BPM)
                if ($currentSong->tempo && $song->tempo) {
                    $bpmDiff = abs($currentSong->tempo - $song->tempo);
                    if ($bpmDiff <= 15) { // Sangat sinkron (DJ mix friendly)
                        $score += 30;
                        $matchedCriteria[] = "Tempo Sangat Sinkron (±15 BPM)";
                    } elseif ($bpmDiff <= 30) {
                        $score += 15;
                        $matchedCriteria[] = "Tempo Mirip";
                    }
                }

                // 2. Energy (0.0 to 1.0)
                if ($currentSong->energy && $song->energy) {
                    $energyDiff = abs($currentSong->energy - $song->energy);
                    if ($energyDiff <= 0.15) {
                        $score += 25;
                        $matchedCriteria[] = "Energi Serupa";
                    }
                }

                // 3. Valence / Kebahagiaan (0.0 to 1.0)
                if ($currentSong->valence && $song->valence) {
                    $valenceDiff = abs($currentSong->valence - $song->valence);
                    if ($valenceDiff <= 0.15) {
                        $score += 25;
                        $matchedCriteria[] = "Vibe/Emosi Identik";
                    }
                }

                // 4. Danceability (0.0 to 1.0)
                if ($currentSong->danceability && $song->danceability) {
                    $danceDiff = abs($currentSong->danceability - $song->danceability);
                    if ($danceDiff <= 0.15) {
                        $score += 15;
                        $matchedCriteria[] = "Ritme Tari Cocok";
                    }
                }

                // --- D. USER PREFERENCE & METADATA ---
                if (in_array($song->id, $userTopSongIds)) {
                    $score += 20;
                    $matchedCriteria[] = "Favorit User";
                }

                // Jangan campur aduk eksplisit jika user dengar lagu bersih
                if ($song->explicit_lyrics === $currentSong->explicit_lyrics) {
                    $score += 10;
                }

                // Popularitas memberi sedikit dorongan (maks 15 poin)
                if ($song->popularity) {
                    $score += min(($song->popularity / 100) * 15, 15);
                }

                // Validasi agar skor tidak minus sebelum dipangkatkan
                $score = max(1, $score);

                // Gunakan pangkat 1.5 agar lagu dengan skor tinggi probabilitasnya lebih masuk akal
                $weight = pow($score, 1.5);

                $scoredCandidates[] = [
                    'song' => $song,
                    'score' => $score,
                    'weight' => $weight,
                    'matchedCriteria' => $matchedCriteria
                ];
            }

            // =========================================================
            // 4. SORTING & SELEKSI ROULETTE WHEEL
            // =========================================================
            // Urutkan berdasarkan skor tertinggi
            usort($scoredCandidates, function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });

            // Ambil Top 20 Kandidat Terbaik untuk diundi
            $topCandidates = array_slice($scoredCandidates, 0, 20);

            $totalWeight = 0;
            foreach ($topCandidates as $item) {
                $totalWeight += $item['weight'];
            }

            // Pengundian pintar berdasarkan bobot (Roulette Wheel)
            $random = mt_rand() / mt_getrandmax() * $totalWeight;
            $nextMatchDetails = null;

            foreach ($topCandidates as $item) {
                $random -= $item['weight'];
                if ($random <= 0) {
                    $nextMatchDetails = $item;
                    break;
                }
            }

            // Fallback jika terjadi bug pembulatan float
            if (!$nextMatchDetails) {
                $nextMatchDetails = $topCandidates[0];
            }

            $nextMatch = $nextMatchDetails['song'];
            $nextMatch->setAttribute('ai_score', round($nextMatchDetails['score'], 2));
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
