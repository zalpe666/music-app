import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import PlayerControls from "@/Components/Player/PlayerControls"; // Import PlayerControls
import { ChevronDown, Mic2 } from "lucide-react";
import axios from "axios";

const parseLRC = (lrcText) => {
    // ... (Fungsi parseLRC tetap sama persis)
    const lines = lrcText.split("\n");
    const parsed = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach((line) => {
        const match = timeRegex.exec(line);
        if (match) {
            const min = parseInt(match[1]);
            const sec = parseInt(match[2]);
            const mil = parseInt(match[3]);
            const timeInSeconds = min * 60 + sec + mil / (match[3].length === 3 ? 1000 : 100);
            const text = line.replace(timeRegex, "").trim();
            if (text) parsed.push({ time: timeInSeconds, text });
        }
    });
    return parsed;
};

const LyricsMini = () => {
    // AMBIL SEMUA LOGIC PEMUTAR
    const {
        currentSong, isPlaying, togglePlay, nextSong, prevSong,
        currentTime, duration, setCurrentTime, toggleShuffle, isShuffle, isLoading
    } = usePlayerStore();

    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [loadingLyrics, setLoadingLyrics] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    const lyricsContainerRef = useRef(null);
    const lyricRefs = useRef([]);
    let scrollTimeout = useRef(null);

    // FETCH LIRIK
    useEffect(() => {
        if (currentSong?.lyrics_path) {
            setLoadingLyrics(true);
            axios
                .get(`/lyrics/${currentSong.lyrics_path}`)
                .then((res) => {
                    const lrcData = parseLRC(res.data);
                    lrcData.length > 0 ? setParsedLyrics(lrcData) : setParsedLyrics([{ time: 0, text: res.data }]);
                    setLoadingLyrics(false);
                })
                .catch(() => {
                    setParsedLyrics([{ time: 0, text: "Lirik tidak dapat dimuat." }]);
                    setLoadingLyrics(false);
                });
        }
    }, [currentSong]);

    let activeIndex = parsedLyrics.findIndex((lyric, index) => {
        const nextLyric = parsedLyrics[index + 1];
        return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });
    if (activeIndex === -1) activeIndex = 0;

    // AUTO SCROLL
    useEffect(() => {
        if (isAutoScrolling && lyricRefs.current[activeIndex] && lyricsContainerRef.current) {
            lyricRefs.current[activeIndex].scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [activeIndex, isAutoScrolling]);

    const handleManualScroll = () => {
        setIsAutoScrolling(false);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            setIsAutoScrolling(true);
        }, 3000);
    };

    const handleLyricClick = (time) => {
        setCurrentTime(time);
        const audio = document.querySelector("audio");
        if (audio) audio.currentTime = time;
        setIsAutoScrolling(true);
    };

    // FORMAT & PROGRESS BAR LOGIC
    const formatTime = (time) => {
        if (isNaN(time) || time === Infinity || !time) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        const audio = document.querySelector("audio");
        if (audio) audio.currentTime = newTime;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    if (!currentSong) return null;

    return (
        <div className="relative h-screen w-full bg-zinc-950 text-white overflow-hidden flex flex-col">

            {/* 1. DYNAMIC BACKGROUND BLUR */}
            <div
                className="absolute inset-0 z-0 opacity-40 blur-[100px] pointer-events-none transition-all duration-1000"
                style={{ backgroundImage: `url(${currentSong.album?.cover_xl})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />

            {/* KONTEN UTAMA */}
            <div className="relative z-10 flex-1 w-full flex flex-col h-full">

                {/* HEADER (TETAP DI ATAS) */}
                <div className="flex items-center justify-between p-6 shrink-0 z-20">
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition active:scale-90 cursor-pointer">
                        <ChevronDown size={28} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                            <Mic2 size={12} className="text-green-500 animate-pulse" />
                            Lyrics
                        </span>
                        <h2 className="text-sm font-bold text-white truncate max-w-[200px] text-center mt-1">
                            {currentSong.title}
                        </h2>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* KONTEN LIRIK (BISA DI-SCROLL, flex-1 agar mengisi sisa ruang) */}
                <div className="flex-1 relative overflow-hidden">
                    {loadingLyrics ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-zinc-500 animate-pulse text-lg">Memuat lirik lagu...</p>
                        </div>
                    ) : parsedLyrics.length > 0 ? (
                        <div
                            ref={lyricsContainerRef}
                            onScroll={handleManualScroll}
                            className="h-full overflow-y-auto scrollbar-hide py-[30vh] px-6 md:px-12 w-full transition-all text-left md:text-center"
                            style={{
                                maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
                                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
                            }}
                        >
                            {parsedLyrics.map((line, index) => (
                                <p
                                    key={index}
                                    ref={(el) => (lyricRefs.current[index] = el)}
                                    onClick={() => handleLyricClick(line.time)}
                                    className={`text-3xl md:text-4xl lg:text-5xl font-bold py-5 md:py-6 transition-all duration-500 cursor-pointer origin-left md:origin-center 
                                        ${index === activeIndex
                                            ? "text-white scale-100 drop-shadow-lg"
                                            : "text-white/30 scale-[0.90] hover:text-white/60"
                                        }`
                                    }
                                >
                                    {line.text || "♪"}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-zinc-500 text-lg">Lirik tidak tersedia untuk lagu ini.</p>
                        </div>
                    )}
                </div>

                {/* KONTROL PEMUTAR (STUCK DI BAWAH) */}
                <div className="w-full shrink-0 pt-8 pb-24 md:pb-10 px-6 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-20">
                    <PlayerControls
                        prevSong={prevSong}
                        togglePlay={togglePlay}
                        nextSong={nextSong}
                        toggleShuffle={toggleShuffle}
                        isShuffle={isShuffle}
                        isPlaying={isPlaying}
                        isLoading={isLoading}
                        currentTime={currentTime}
                        duration={duration}
                        formatTime={formatTime}
                        handleProgressChange={handleProgressChange}
                        progressPercent={progressPercent}
                    />
                </div>

            </div>
        </div>
    );
};

LyricsMini.layout = (page) => <AppLayout>{page}</AppLayout>;
export default LyricsMini;