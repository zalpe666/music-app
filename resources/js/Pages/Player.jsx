import { useState, useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";

import PlayerBackground from "@/Components/Player/PlayerBackground";
import PlayerCover from "@/Components/Player/PlayerCover";
import PlayerLyrics from "@/Components/Player/PlayerLyrics";

const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&controls=0&disablekb=1&modestbranding=1`
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

    useEffect(() => {
        if (currentIndex > prevIndexRef.current) setDirection(1);
        else if (currentIndex < prevIndexRef.current) setDirection(-1);
        prevIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        if (showVideoPlayer && !hasVideo) {
            setShowVideoPlayer(false);
        }
    }, [currentSong, showVideoPlayer, setShowVideoPlayer, hasVideo]);

    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
            else videoRef.current.pause();
        }
    }, [isPlaying, showVideoPlayer, currentSong]);

    useEffect(() => {
        if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
            videoRef.current.currentTime = currentTime;
        }
    }, [currentTime]);

    if (!currentSong) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <svg className="w-16 h-16 text-zinc-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <p className="text-lg font-medium">Belum ada lagu yang diputar</p>
            </div>
        );
    }

    return (
        <>
            <Head title={`${currentSong.title} - Zaldien Music`} />

            <div className="relative h-full overflow-hidden flex flex-col md:flex-row bg-zinc-950 transition-colors duration-500">
                
                {/* Background: Terserah mau selalu muncul atau hanya saat lirik tidak full */}
                <PlayerBackground coverUrl={currentSong.album?.cover_xl} />

                {/* Tombol Close Video */}
                {showVideoPlayer && hasVideo && (
                    <button
                        onClick={() => setShowVideoPlayer(false)}
                        className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-black/40 hover:bg-black/70 backdrop-blur-xl text-white/90 hover:text-white px-4 py-2.5 rounded-full transition-all duration-300 shadow-lg border border-white/10 group"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm font-medium tracking-wide">Tutup Video</span>
                    </button>
                )}

                {/* AREA KIRI: Video ATAU Cover */}
                {showVideoPlayer && hasVideo ? (
                    <div className="absolute inset-0 z-40 bg-black flex items-center justify-center animate-in fade-in duration-500">
                        {currentSong.local_video_path ? (
                            <video
                                ref={videoRef}
                                src={`/video/${currentSong.local_video_path}`}
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center p-0 md:p-10">
                                <div className="w-full relative pt-[56.25%] overflow-hidden shadow-2xl bg-black md:rounded-2xl md:ring-1 md:ring-white/10">
                                    <iframe
                                        src={getYouTubeEmbedUrl(currentSong.youtube_url)}
                                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                        allow="autoplay; encrypted-media"
                                        title={`${currentSong.title} Video`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* PERUBAHAN LOGIKA COVER:
                       - Jika isLyricsMode AKTIF & punya lirik: Cover mengecil (w-0, opacity-0) dengan animasi.
                       - Jika DEFAULT & punya lirik: Cover mengambil 50% layar (md:w-1/2).
                       - Jika TIDAK PUNYA LIRIK sama sekali: Cover mengambil 100% (w-full).
                    */
                    <div className={`relative z-10 flex items-center justify-center transition-all duration-700 h-full shrink-0 origin-left overflow-hidden ${
                        isLyricsMode && hasLyrics
                            ? "w-0 opacity-0"
                            : (hasLyrics ? "w-full md:w-1/2 opacity-100" : "w-full opacity-100")
                    }`}>
                        <div className="w-full min-w-[300px] flex justify-center">
                            <PlayerCover
                                currentSong={currentSong}
                                isLyricsMode={isLyricsMode}
                                direction={direction}
                            />
                        </div>
                    </div>
                )}

                {hasLyrics && !(showVideoPlayer && hasVideo) && (
                    <PlayerLyrics
                        currentSong={currentSong}
                        currentTime={currentTime}
                    />
                )}
            </div>
        </>
    );
};

Player.layout = (page) => <AppLayout>{page}</AppLayout>;
export default Player;