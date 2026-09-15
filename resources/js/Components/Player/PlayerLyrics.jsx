import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function PlayerLyrics({ currentSong, currentTime }) {
    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [loadingLyrics, setLoadingLyrics] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    const scrollTimeoutRef = useRef(null);
    const lyricsContainerRef = useRef(null);
    const lyricRefs = useRef([]);

    // Logic parse lirik
    const parseLRC = (text) => {
        return text.split("\n").map((line) => {
            const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
            if (!match) return null;
            return {
                time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
                text: match[3].trim(),
            };
        }).filter(Boolean);
    };

    // Auto Scroll saat lagu berjalan
    const activeIndex = parsedLyrics.findIndex((l, i) => {
        return currentTime >= l.time && (!parsedLyrics[i + 1] || currentTime < parsedLyrics[i + 1].time);
    });

    useEffect(() => {
        if (isAutoScrolling && activeIndex !== -1 && lyricRefs.current[activeIndex] && lyricsContainerRef.current) {
            const container = lyricsContainerRef.current;
            const el = lyricRefs.current[activeIndex];
            const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
            container.scrollTo({ top, behavior: "smooth" });
        }
    }, [activeIndex, isAutoScrolling]);

    const handleManualScroll = () => {
        setIsAutoScrolling(false);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setIsAutoScrolling(true), 4000); // Diperlama sedikit jadi 4 detik
    };

    useEffect(() => {
        if (currentSong?.lyrics_path) {
            setLoadingLyrics(true);
            axios.get(`/lyrics/${currentSong.lyrics_path}`)
                .then((res) => {
                    setParsedLyrics(parseLRC(res.data) || [{ time: 0, text: res.data }]);
                    setLoadingLyrics(false);
                })
                .catch(() => {
                    setParsedLyrics([{ time: 0, text: "Lirik tidak dapat dimuat." }]);
                    setLoadingLyrics(false);
                });
        }
    }, [currentSong]);

    const handleLyricClick = (time) => {
        const audio = document.querySelector("audio");
        if (audio) {
            audio.currentTime = time;
            setIsAutoScrolling(true);
        }
    };

    return (
        <div className="relative z-10 h-full flex flex-col items-center justify-center transition-all duration-700 flex-1 w-full overflow-hidden">

            {/* Sync Button (Muncul jika user scroll manual) */}
            <div
                className={`absolute bottom-12 z-50 transition-all duration-500 transform ${!isAutoScrolling ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                    }`}
            >
                <button
                    onClick={() => setIsAutoScrolling(true)}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full text-white/90 text-sm font-medium hover:bg-white/20 hover:scale-105 transition-all shadow-lg border border-white/20"
                >
                    <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Kembali ke Lirik
                </button>
            </div>

            {/* Container Lirik */}
            <div
                ref={lyricsContainerRef}
                onScroll={handleManualScroll}
                className="flex flex-col items-start h-[calc(100vh-200px)] overflow-y-auto py-[40vh] px-6 w-full max-w-4xl transition-all duration-700 custom-scrollbar"
                style={{
                    maskImage: "linear-gradient(to bottom, transparent 5%, black 25%, black 75%, transparent 95%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent 5%, black 25%, black 75%, transparent 95%)"
                }}
            >
                {loadingLyrics ? (
                    // Loading State
                    <div className="w-full flex flex-col gap-6 animate-pulse mt-10">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-10 bg-white/20 rounded-lg ${i % 2 === 0 ? 'w-2/3' : 'w-3/4'}`}></div>
                        ))}
                    </div>
                ) : (
                    // Render Lirik
                    parsedLyrics.map((line, index) => {
                        const isActive = index === activeIndex;
                        const isPast = index < activeIndex;

                        return (
                            <p
                                key={index}
                                ref={(el) => (lyricRefs.current[index] = el)}
                                onClick={() => handleLyricClick(line.time)}
                                className={`text-left w-full origin-left text-3xl md:text-4xl lg:text-5xl font-extrabold py-5 tracking-tight transition-all duration-500 ease-out cursor-pointer ${isActive
                                        ? "text-white scale-105 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] opacity-100"
                                        : isPast
                                            ? "text-white/40 scale-95 opacity-50 hover:text-white/70"
                                            : "text-white/30 scale-90 opacity-40 blur-[1px] hover:blur-none hover:text-white/60 hover:scale-95"
                                    }`}
                            >
                                {line.text || "♪"}
                            </p>
                        );
                    })
                )}
            </div>

            {/* Optional: CSS untuk menyembunyikan scrollbar agar lebih bersih */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .custom-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}