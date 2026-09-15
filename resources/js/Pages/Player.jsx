import { useState, useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";

import PlayerBackground from "@/Components/Player/PlayerBackground";
import PlayerCover from "@/Components/Player/PlayerCover";
import PlayerLyrics from "@/Components/Player/PlayerLyrics";

// Helper untuk YouTube Embed yang dioptimalkan untuk background player
const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
        // Tambahkan mute=1 agar tidak double audio, rel=0 agar tidak ada rekomendasi nyasar
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1`
        : null;
};

const Player = () => {
    const {
        currentSong,
        currentTime,
        isPlaying,
        isLyricsMode,
        currentIndex,
        showVideoPlayer,
        setShowVideoPlayer
    } = usePlayerStore();

    const [direction, setDirection] = useState(1);
    const prevIndexRef = useRef(currentIndex);
    const videoRef = useRef(null);

    const hasVideo = Boolean(currentSong?.local_video_path || currentSong?.youtube_url);
    const hasLyrics = Boolean(currentSong?.lyrics_path);

    // Deteksi arah ganti lagu (Next/Prev) untuk animasi cover
    useEffect(() => {
        if (currentIndex > prevIndexRef.current) setDirection(1);
        else if (currentIndex < prevIndexRef.current) setDirection(-1);
        prevIndexRef.current = currentIndex;
    }, [currentIndex]);

    // Matikan mode video jika lagu baru tidak punya video
    useEffect(() => {
        if (showVideoPlayer && !hasVideo) {
            setShowVideoPlayer(false);
        }
    }, [currentSong, showVideoPlayer, setShowVideoPlayer, hasVideo]);

    // Handle Play/Pause Video Sinkron dengan Audio
    useEffect(() => {
        if (videoRef.current && showVideoPlayer && hasVideo) {
            if (isPlaying) {
                videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, showVideoPlayer, hasVideo, currentSong]);

    // Sync waktu video dengan waktu audio utama
    useEffect(() => {
        if (videoRef.current && showVideoPlayer) {
            // Toleransi diturunkan ke 0.3 agar lipsync lebih akurat
            if (Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
                videoRef.current.currentTime = currentTime;
            }
        }
    }, [currentTime, showVideoPlayer]);

    // Cleanup video saat ganti lagu
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.removeAttribute("src");
                videoRef.current.load();
            }
        };
    }, [currentSong?.id]);

    // Fallback jika tidak ada lagu
    if (!currentSong) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-zinc-950">
                <svg className="w-16 h-16 text-zinc-800 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <p className="text-lg font-medium tracking-wide">Belum ada lagu yang diputar</p>
            </div>
        );
    }

    return (
        <>
            <Head title={`${currentSong.title} - Zaldien Music`} />

            <div className="relative h-full overflow-hidden flex flex-col md:flex-row bg-zinc-950 transition-colors duration-500">

                {/* Background Blur Dynamic */}
                <PlayerBackground coverUrl={currentSong.album?.cover_xl} />

                {/* --- OVERLAY VIDEO MODE --- */}
                {showVideoPlayer && hasVideo && (
                    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-500">
                        {/* Tombol Close Video */}
                        <button
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.pause();
                                    videoRef.current.removeAttribute("src");
                                    videoRef.current.load();
                                }
                                setShowVideoPlayer(false);
                            }}
                            className="absolute top-6 left-6 md:top-10 md:left-10 z-[60] flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-xl border border-white/10 group"
                        >
                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm font-semibold tracking-wide">Tutup Video</span>
                        </button>

                        {/* Player Video Lokal atau YouTube */}
                        {currentSong.local_video_path ? (
                            <video
                                ref={videoRef}
                                src={`/video/${currentSong.local_video_path}`}
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain md:p-10 drop-shadow-2xl"
                            />
                        ) : (
                            <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center p-0 md:p-12">
                                <div className="w-full relative pt-[56.25%] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-black md:rounded-2xl md:ring-1 md:ring-white/10">
                                    <iframe
                                        src={getYouTubeEmbedUrl(currentSong.youtube_url)}
                                        className="absolute top-0 left-0 w-full h-full pointer-events-none scale-105" // scale-105 untuk memotong blackbar tipis YouTube
                                        allow="autoplay; encrypted-media"
                                        title={`${currentSong.title} Video`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- AREA UTAMA: COVER & LIRIK --- */}
                <div className={`relative z-10 flex h-full w-full transition-all duration-700 ease-out`}>

                    {/* BAGIAN COVER */}
                    <div
                        className={`flex items-center justify-center h-full shrink-0 transition-all duration-700 ease-in-out overflow-hidden ${isLyricsMode && hasLyrics
                                ? "w-0 opacity-0 pointer-events-none" // Menghilang mulus jika mode Lirik Full
                                : (hasLyrics ? "w-full md:w-1/2 opacity-100" : "w-full opacity-100") // 50% jika ada lirik, 100% jika tidak ada lirik
                            }`}
                    >
                        <div className="w-full min-w-[300px] flex justify-center">
                            <PlayerCover
                                currentSong={currentSong}
                                isLyricsMode={isLyricsMode}
                                direction={direction}
                            />
                        </div>
                    </div>

                    {/* BAGIAN LIRIK */}
                    {hasLyrics && (
                        <div
                            className={`flex h-full transition-all duration-700 ease-in-out ${isLyricsMode ? "w-full opacity-100" : "w-full md:w-1/2 opacity-100"
                                }`}
                        >
                            <PlayerLyrics
                                currentSong={currentSong}
                                currentTime={currentTime}
                            />
                        </div>
                    )}
                </div>

            </div>
        </>
    );
};

Player.layout = (page) => <AppLayout>{page}</AppLayout>;
export default Player;