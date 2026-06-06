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

            // 1. Cari data lengkap lagu patokan dengan Eager Loading Relasi Baru
            $currentSong = Song::with(['artists.genre', 'artists.mood', 'artists.style'])->find($currentSongId);
            if (!$currentSong) {
                return response()->json(['message' => 'Lagu patokan tidak ditemukan'], 404);
            }
            $currentArtistIds = $currentSong->artists->pluck('id')->toArray();

            // 2. Ambil 50 kandidat acak
            $candidates = Song::with(['album', 'artists.genre', 'artists.mood', 'artists.style'])
                ->where('id', '!=', $currentSongId)
                ->whereNotIn('id', $playedHistory)
                ->inRandomOrder()
                ->limit(200)
                ->get();

            if ($candidates->isEmpty()) {
                return response()->json(['message' => 'Lagu habis'], 404);
            }

            // =========================================================
            // 3. AI SCORING LOGIC
            // =========================================================
            $scoredCandidates = [];
            $totalWeight = 0; // Menggunakan akumulasi bobot kuadrat

            foreach ($candidates as $song) {
                $score = 10; // Base score
                $matchedCriteria = [];

                // A. Relasi Langsung
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

                // B. Karakteristik Trek
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

                $currentPrimaryArtist = $currentSong->artists->first();
                $candidatePrimaryArtist = $song->artists->first();

                if ($currentPrimaryArtist && $candidatePrimaryArtist) {

                    // 1. Pencocokan Genre (MENGGUNAKAN ID RELASI BARU)
                    if ($candidatePrimaryArtist->genre_id && $candidatePrimaryArtist->genre_id === $currentPrimaryArtist->genre_id) {
                        $score += 45; // Dinaikkan menjadi 45 agar pengaruh genre lebih kuat
                        $matchedCriteria[] = "Satu Genre";
                    }

                    // 2. Pencocokan Mood (MENGGUNAKAN ID RELASI BARU)
                    if ($candidatePrimaryArtist->mood_id && $candidatePrimaryArtist->mood_id === $currentPrimaryArtist->mood_id) {
                        $score += 25;
                        $matchedCriteria[] = "Mood Mirip";
                    }

                    // 3. Pencocokan Style (MENGGUNAKAN ID RELASI BARU)
                    if ($candidatePrimaryArtist->style_id && $candidatePrimaryArtist->style_id === $currentPrimaryArtist->style_id) {
                        $score += 15;
                        $matchedCriteria[] = "Style Cocok";
                    }

                    // 4. Bonus Artis Populer
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

                // 👇 EXPONENTIAL SCALING: Menguadratkan skor untuk memperlebar jarak peluang
                // Contoh: Skor 100 menjadi 10.000 poin kuadrat. Skor 30 menjadi 900 poin kuadrat.
                $weight = pow($score, 2);

                $scoredCandidates[] = [
                    'song' => $song,
                    'score' => $score,
                    'weight' => $weight,
                    'matchedCriteria' => $matchedCriteria
                ];
                $totalWeight += $weight;
            }

            // =========================================================
            // 4. SELEKSI ROULETTE WHEEL BERBASIS BOBOT KUADRAT
            // =========================================================
            $random = mt_rand(1, (int) ceil($totalWeight));
            $nextMatchDetails = null;

            foreach ($scoredCandidates as $item) {
                $random -= $item['weight'];
                if ($random <= 0) {
                    $nextMatchDetails = $item;
                    break;
                }
            }

            if (!$nextMatchDetails) {
                $nextMatchDetails = $scoredCandidates[0];
            }

            $nextMatch = $nextMatchDetails['song'];

            // Sisipkan skor asli dan alasan ke dalam objek lagu sebelum dikirim
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
