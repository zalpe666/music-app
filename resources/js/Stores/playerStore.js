import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const usePlayerStore = create(
    persist(
        (set, get) => ({
            songs: [],

            currentSong: null,

            currentIndex: 0,

            isPlaying: false,

            currentTime: 0,

            duration: 0,

            volume: 1,

            isLyricsMode: false,

            setIsLyricsMode: (val) =>
                set({
                    isLyricsMode: val,
                }),

            toggleLyricsMode: () =>
                set((state) => ({
                    isLyricsMode: !state.isLyricsMode,
                })),

            setPlaylist: (songs) =>
                set({
                    songs,
                }),

            setVolume: (volume) =>
                set({
                    volume,
                }),

            playSong: (song, index) => {
                const { currentSong } = get();

                // Hapus cache stream lama
                if (currentSong && currentSong.id !== song.id) {
                    axios
                        .delete(`/stream/${currentSong.audio_path}`)
                        .catch(console.error);
                }

                set({
                    currentSong: song,

                    currentIndex: index,

                    isPlaying: true,

                    currentTime: 0,
                });
            },

            togglePlay: () =>
                set((state) => ({
                    isPlaying: !state.isPlaying,
                })),

            setCurrentTime: (time) =>
                set({
                    currentTime: time,
                }),

            setDuration: (duration) =>
                set({
                    duration,
                }),

            nextSong: () => {
                const { songs, currentIndex, currentSong } = get();

                if (!songs.length) return;

                if (currentSong) {
                    axios
                        .delete(`/stream/${currentSong.audio_path}`)
                        .catch(console.error);
                }

                const nextIndex = (currentIndex + 1) % songs.length;

                set({
                    currentSong: songs[nextIndex],

                    currentIndex: nextIndex,

                    isPlaying: true,

                    currentTime: 0,
                });
            },

            prevSong: () => {
                const { songs, currentIndex, currentSong } = get();

                if (!songs.length) return;

                if (currentSong) {
                    axios
                        .delete(`/stream/${currentSong.audio_path}`)
                        .catch(console.error);
                }

                const prevIndex =
                    currentIndex - 1 < 0 ? songs.length - 1 : currentIndex - 1;

                set({
                    currentSong: songs[prevIndex],

                    currentIndex: prevIndex,

                    isPlaying: true,

                    currentTime: 0,
                });
            },
        }),

        {
            name: "zalpe-music-player",
        },
    ),
);

export default usePlayerStore;
