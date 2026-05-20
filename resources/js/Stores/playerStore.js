import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const usePlayerStore = create(
    persist(
        (set, get) => ({
            /*
            |--------------------------------------------------------------------------
            | PLAYER STATE
            |--------------------------------------------------------------------------
            */

            songs: [],

            originalSongs: [],

            allSongs: [],

            currentSong: null,

            currentIndex: 0,

            isPlaying: false,

            currentTime: 0,

            duration: 0,

            volume: 1,
            // Tambahkan di dalam (set, get) => ({ ... })
            getRecommendations: (limit = 5) => {
                const { songs, currentSong } = get();
                if (!currentSong || songs.length <= 1) return [];

                const others = songs.filter((s) => s.id !== currentSong.id);
                const currentArtist = currentSong.artist || {};

                // Gunakan logika scoring yang sudah kamu miliki
                return others
                    .map((s) => {
                        let score = 10;
                        const candidateArtist = s.artist || {};

                        if (s.artist_id === currentSong.artist_id) score += 40;
                        if (s.album_id === currentSong.album_id) score += 30;
                        if (
                            candidateArtist.strGenre &&
                            candidateArtist.strGenre === currentArtist.strGenre
                        )
                            score += 35;
                        if (
                            candidateArtist.strMood &&
                            candidateArtist.strMood === currentArtist.strMood
                        )
                            score += 25;

                        return { song: s, score };
                    })
                    .sort((a, b) => b.score - a.score) // Urutkan dari skor tertinggi
                    .slice(0, limit) // Ambil X teratas
                    .map((item) => item.song);
            },

            /*
            |--------------------------------------------------------------------------
            | MODES
            |--------------------------------------------------------------------------
            */

            isLyricsMode: false,

            isArtistMode: false,

            isShuffle: false,
            explicit_lyrics: false,
            isAlbumMode: false, // 👈 Tambahkan ini

            /*
            |--------------------------------------------------------------------------
            | LYRICS
            |--------------------------------------------------------------------------
            */

            setIsLyricsMode: (val) =>
                set({
                    isLyricsMode: val,
                }),

            toggleLyricsMode: () =>
                set((state) => ({
                    isLyricsMode: !state.isLyricsMode,
                })),

            /*
            |--------------------------------------------------------------------------
            | PLAYLIST
            |--------------------------------------------------------------------------
            */

            setAllSongs: (songs) =>
                set({
                    allSongs: songs,
                }),

            setPlaylist: (songs, isArtistMode = false, isAlbumMode = false) =>
                set({
                    songs,
                    originalSongs: songs,
                    isArtistMode, // ini mengambil dari parameter
                    isAlbumMode, // ini mengambil dari parameter
                }),

            /*
            |--------------------------------------------------------------------------
            | AUDIO
            |--------------------------------------------------------------------------
            */

            setVolume: (volume) =>
                set({
                    volume,
                }),

            setCurrentTime: (time) =>
                set({
                    currentTime: time,
                }),

            setDuration: (duration) =>
                set({
                    duration,
                }),

            /*
            |--------------------------------------------------------------------------
            | PLAY SONG
            |--------------------------------------------------------------------------
            */

            playSong: (song, index = null) => {
                const { currentSong, songs } = get();

                /*
                |--------------------------------------------------------------------------
                | AUTO FIND INDEX
                |--------------------------------------------------------------------------
                */

                const realIndex =
                    index !== null
                        ? index
                        : songs.findIndex((s) => s.id === song.id);

                set({
                    currentSong: song,

                    currentIndex: realIndex,

                    isPlaying: true,

                    currentTime: 0,
                });
            },

            /*
            |--------------------------------------------------------------------------
            | PLAY / PAUSE
            |--------------------------------------------------------------------------
            */

            togglePlay: () =>
                set((state) => ({
                    isPlaying: !state.isPlaying,
                })),

            /*
            |--------------------------------------------------------------------------
            | NEXT SONG
            |--------------------------------------------------------------------------
            */

            nextSong: () => {
                const {
                    songs,
                    currentIndex,
                    currentSong,
                    isShuffle, // Ini sekarang jadi tombol "AI Mode"
                    isArtistMode,
                    isAlbumMode,
                } = get();

                if (!songs.length) return;

                console.log("--- NEXT SONG TRIGGERED ---");

                // 1. CEK KONTEKS: Jika Shuffle MATI -> Mode Statis (Sequential)
                if (!isShuffle) {
                    console.log(
                        "Mode Terdeteksi: Statis (Mengikuti Album/Artist/Normal)",
                    );
                    const nextIndex = (currentIndex + 1) % songs.length;
                    get().playSong(songs[nextIndex], nextIndex);
                    return;
                }

                // 2. JIKA SHUFFLE NYALA -> AI AUTO-PILOT AKTIF 🤖
                console.log(
                    "Mode Terdeteksi: AI Auto-Pilot Aktif 🎧 (Shuffle ON)",
                );

                const others = songs.filter((s) => s.id !== currentSong.id);

                if (others.length === 0) {
                    console.log("AI: Hanya 1 lagu di playlist, mengulang.");
                    get().playSong(songs[0], 0);
                    return;
                }

                const currentArtist = currentSong.artist || {};

                // --- AI SCORING LOGIC (100% Tidak Diubah, Tetap Bagus) ---
                const scoredCandidates = others.map((s) => {
                    let score = 10; // Base score
                    let matchedCriteria = []; // Untuk debugging di console

                    const candidateArtist = s.artist || {};

                    // A. Relasi Langsung (Kuat)
                    if (s.artist_id === currentSong.artist_id) {
                        score += 40;
                        matchedCriteria.push("Sama Artis");
                    }
                    if (s.album_id === currentSong.album_id) {
                        score += 30;
                        matchedCriteria.push("Sama Album");
                    }

                    // B. Analisis Vibe & Genetik (Data Baru dari AudioDB!)
                    if (
                        candidateArtist.strGenre &&
                        candidateArtist.strGenre === currentArtist.strGenre
                    ) {
                        score += 35; // Transisi genre sangat mulus
                        matchedCriteria.push("Genre");
                    }
                    if (
                        candidateArtist.strMood &&
                        candidateArtist.strMood === currentArtist.strMood
                    ) {
                        score += 25; // Menjaga suasana hati pendengar
                        matchedCriteria.push("Mood");
                    }
                    if (
                        candidateArtist.strStyle &&
                        candidateArtist.strStyle === currentArtist.strStyle
                    ) {
                        score += 15; // Sub-genre cocok
                        matchedCriteria.push("Style");
                    }
                    if (
                        candidateArtist.intCharted &&
                        candidateArtist.intCharted > 0
                    ) {
                        score += 10; // Bonus artis hits/populer
                        matchedCriteria.push("Charted");
                    }

                    // C. Karakteristik Trek (Teknis)
                    if (s.explicit_lyrics === currentSong.explicit_lyrics) {
                        score += 10;
                        matchedCriteria.push("Explicit Match");
                    }
                    if (s.duration && currentSong.duration) {
                        const diffSeconds = Math.abs(
                            s.duration - currentSong.duration,
                        );
                        if (diffSeconds < 60) {
                            // Toleransi 1 menit
                            score += 5;
                            matchedCriteria.push("Durasi Mirip");
                        }
                    }
                    if (s.rank) {
                        const rankBonus = Math.min((s.rank / 100000) * 5, 15);
                        score += rankBonus;
                    }

                    return { song: s, score, matchedCriteria };
                });

                // --- SELEKSI ROULETTE WHEEL ---
                const totalScore = scoredCandidates.reduce(
                    (sum, item) => sum + item.score,
                    0,
                );

                console.log(
                    `AI: Memproses ${scoredCandidates.length} kandidat | Total Bobot: ${Math.round(totalScore)}`,
                );

                let random = Math.random() * totalScore;
                let nextMatch = null;
                let nextMatchDetails = null;

                for (const item of scoredCandidates) {
                    random -= item.score;
                    if (random <= 0) {
                        nextMatch = item.song;
                        nextMatchDetails = item;
                        break;
                    }
                }

                // --- EKSEKUSI ---
                if (nextMatch) {
                    const index = songs.findIndex((s) => s.id === nextMatch.id);

                    // Log Keren untuk Debugging!
                    console.log(
                        `%c🎵 AI MEMILIH: ${nextMatch.title}`,
                        "color: #1DB954; font-weight: bold; font-size: 14px;",
                    );
                    console.log(`Skor Kecocokan: ${nextMatchDetails.score}`);
                    console.log(
                        `Alasan Dipilih: ${nextMatchDetails.matchedCriteria.join(" + ")}`,
                    );

                    get().playSong(nextMatch, index);
                } else {
                    console.log(
                        "AI: Gagal menentukan bobot, kembali ke urutan normal.",
                    );
                    const nextIndex = (currentIndex + 1) % songs.length;
                    get().playSong(songs[nextIndex], nextIndex);
                }
            },

            /*
            |--------------------------------------------------------------------------
            | PREVIOUS SONG
            |--------------------------------------------------------------------------
            */

            prevSong: () => {
                const { songs, currentIndex, currentSong } = get();

                if (!songs.length) return;

                /*
                |--------------------------------------------------------------------------
                | PREVIOUS INDEX
                |--------------------------------------------------------------------------
                */

                const prevIndex =
                    currentIndex - 1 < 0 ? songs.length - 1 : currentIndex - 1;

                set({
                    currentSong: songs[prevIndex],

                    currentIndex: prevIndex,

                    isPlaying: true,

                    currentTime: 0,
                });
            },

            /*
            |--------------------------------------------------------------------------
            | SHUFFLE
            |--------------------------------------------------------------------------
            */

            toggleShuffle: () => {
                set((state) => ({
                    isShuffle: !state.isShuffle,
                }));
            },
        }),

        {
            name: "zalpe-music-player",
        },
    ),
);

export default usePlayerStore;
