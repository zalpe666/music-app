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

            userTopSongIds: [],
            setUserTopSongIds: (ids) => set({ userTopSongIds: ids }),

            playedHistory: [],
            clearPlayedHistory: () => set({ playedHistory: [] }),

            // 👇 DIPERBAIKI: Menggunakan ID relasi baru (genre_id, mood_id, artists)
            getRecommendations: (limit = 5) => {
                const { songs, currentSong } = get();
                if (!currentSong || songs.length <= 1) return [];

                const others = songs.filter((s) => s.id !== currentSong.id);
                const currentArtist = currentSong.artists?.[0] || {}; // Pakai artists array

                return others
                    .map((s) => {
                        let score = 10;
                        const candidateArtist = s.artists?.[0] || {}; // Pakai artists array

                        // Cek kecocokan menggunakan ID Relasi
                        if (
                            candidateArtist.id &&
                            candidateArtist.id === currentArtist.id
                        )
                            score += 40;
                        if (s.album_id === currentSong.album_id) score += 30;

                        if (
                            candidateArtist.genre_id &&
                            candidateArtist.genre_id === currentArtist.genre_id
                        )
                            score += 35;

                        if (
                            candidateArtist.mood_id &&
                            candidateArtist.mood_id === currentArtist.mood_id
                        )
                            score += 25;

                        return { song: s, score };
                    })
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit)
                    .map((item) => item.song);
            },

            /*
            |--------------------------------------------------------------------------
            | FETCH AI SONG FROM DB
            |--------------------------------------------------------------------------
            */
            fetchAiSongFromDB: async () => {
                const { currentSong, playedHistory, userTopSongIds } = get();
                if (!currentSong) return null;

                console.log("🤖 AI: Mencari lagu baru dari database...");

                try {
                    const response = await axios.post("/player/ai-next-song", {
                        current_song_id: currentSong.id,
                        played_history: playedHistory || [],
                        user_top_song_ids: userTopSongIds || [],
                    });

                    const newSong = response.data;

                    console.log(
                        `%c🎵 AI MEMILIH: ${newSong.title}`,
                        "color: #1DB954; font-weight: bold; font-size: 14px;",
                    );

                    if (newSong.ai_score) {
                        console.log(`Skor Kecocokan: ${newSong.ai_score}`);
                        const alasanStr =
                            newSong.ai_reasons && newSong.ai_reasons.length > 0
                                ? newSong.ai_reasons.join(" + ")
                                : "Base Score (Random Pilihan)";
                        console.log(`Alasan Dipilih: ${alasanStr}`);
                    }

                    return newSong;
                } catch (error) {
                    console.error("AI Fetch Error:", error);
                    return null;
                }
            },

            /*
            |--------------------------------------------------------------------------
            | MODES & LYRICS & PLAYLIST & AUDIO
            |--------------------------------------------------------------------------
            */
            isLyricsMode: false,
            isArtistMode: false,
            isShuffle: false,
            explicit_lyrics: false,
            isAlbumMode: false,

            setIsLyricsMode: (val) => set({ isLyricsMode: val }),
            toggleLyricsMode: () =>
                set((state) => ({ isLyricsMode: !state.isLyricsMode })),

            setAllSongs: (songs) => set({ allSongs: songs }),
            setPlaylist: (songs, isArtistMode = false, isAlbumMode = false) =>
                set({
                    songs,
                    originalSongs: songs,
                    isArtistMode,
                    isAlbumMode,
                }),

            setVolume: (volume) => set({ volume }),
            setCurrentTime: (time) => set({ currentTime: time }),
            setDuration: (duration) => set({ duration }),

            togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

            /*
            |--------------------------------------------------------------------------
            | PLAY SONG (DIPERBAIKI)
            |--------------------------------------------------------------------------
            */

            playSong: async (song, index = null) => {
                const { songs } = get();

                const realIndex =
                    index !== null
                        ? index
                        : songs.findIndex((s) => s.id === song.id);

                // 1. Optimistic Update (UI langsung merespon dengan data awal)
                set({
                    currentSong: song,
                    currentIndex: realIndex,
                    isPlaying: true,
                    currentTime: 0,
                });

                try {
                    // 2. Tembak API Backend
                    const response = await axios.post(`/songs/${song.id}/play`);
                    console.log(`📈 Play count ditambah untuk: ${song.title}`);

                    // 3. 👇 INI KUNCINYA: Timpa currentSong dengan data FRESH dari Backend
                    // yang sudah berisi relasi genre, mood, dan style!
                    if (response.data && response.data.song) {
                        const freshSong = response.data.song;

                        set({ currentSong: freshSong });

                        // (Opsional) Update juga data lagu tersebut di array 'songs'
                        // agar antrean queue (SidebarRight) juga ikut terupdate datanya
                        const updatedSongs = [...get().songs];
                        if (updatedSongs[realIndex]) {
                            updatedSongs[realIndex] = freshSong;
                            set({ songs: updatedSongs });
                        }
                    }
                } catch (error) {
                    console.error("Gagal menambah play count:", error);
                }
            },

            /*
            |--------------------------------------------------------------------------
            | NEXT SONG (AI FETCH LOGIC)
            |--------------------------------------------------------------------------
            */

            nextSong: async () => {
                const {
                    songs,
                    currentIndex,
                    currentSong,
                    isShuffle,
                    playedHistory = [],
                } = get();

                if (!songs.length) return;

                console.log("--- NEXT SONG TRIGGERED ---");

                if (!isShuffle) {
                    if (currentIndex + 1 >= songs.length) {
                        console.log(
                            "💿 Playlist habis! Otomatis mencari lagu baru dari DB...",
                        );
                    } else {
                        console.log(
                            "Mode Terdeteksi: Statis (Lanjut ke urutan berikutnya)",
                        );
                        const nextIndex = currentIndex + 1;
                        get().playSong(songs[nextIndex], nextIndex);
                        return;
                    }
                } else {
                    console.log(
                        "Mode Terdeteksi: AI Auto-Pilot Aktif 🎧 (Fetch DB)",
                    );
                }

                const newAiSong = await get().fetchAiSongFromDB();

                if (newAiSong && newAiSong.id) {
                    const updatedHistory = [
                        ...playedHistory,
                        currentSong.id,
                    ].slice(-50);
                    set({ playedHistory: updatedHistory });

                    const songExists = songs.some((s) => s.id === newAiSong.id);
                    let newIndex = currentIndex;

                    if (!songExists) {
                        const updatedSongs = [...songs, newAiSong];
                        set({
                            songs: updatedSongs,
                            originalSongs: updatedSongs,
                        });
                        newIndex = updatedSongs.length - 1;
                    } else {
                        newIndex = songs.findIndex(
                            (s) => s.id === newAiSong.id,
                        );
                    }

                    get().playSong(newAiSong, newIndex);
                } else {
                    console.log(
                        "AI: Gagal mendapat lagu dari DB (atau habis), mengulang history/fallback.",
                    );
                    get().clearPlayedHistory();

                    const nextIndex = (currentIndex + 1) % songs.length;
                    get().playSong(songs[nextIndex], nextIndex);
                }
            },

            /*
            |--------------------------------------------------------------------------
            | PREVIOUS SONG & SHUFFLE
            |--------------------------------------------------------------------------
            */

            prevSong: () => {
                const { songs, currentIndex } = get();
                if (!songs.length) return;

                const prevIndex =
                    currentIndex - 1 < 0 ? songs.length - 1 : currentIndex - 1;

                get().playSong(songs[prevIndex], prevIndex); // 👇 Ubah jadi panggil playSong agar selalu ter-update data fresh-nya
            },

            toggleShuffle: () => {
                set((state) => ({ isShuffle: !state.isShuffle }));
            },
        }),

        {
            name: "zalpe-music-player",
        },
    ),
);

export default usePlayerStore;
