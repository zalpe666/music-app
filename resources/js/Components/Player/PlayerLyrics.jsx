import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function PlayerLyrics({ currentSong, currentTime, isLyricsMode }) {
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
        scrollTimeoutRef.current = setTimeout(() => setIsAutoScrolling(true), 3000);
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
        <div className={`relative z-10 h-full flex flex-col items-center justify-center transition-all duration-700 ${isLyricsMode ? "absolute inset-0 w-full" : "w-full md:w-1/2"}`}>
            
            {/* Tombol Sync Manual */}
            {!isAutoScrolling && (
                <button
                    onClick={() => setIsAutoScrolling(true)}
                    className="absolute bottom-10 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm hover:bg-white/20 transition border border-white/10"
                >
                    Sync Lyrics
                </button>
            )}

            <div
                ref={lyricsContainerRef}
                onScroll={handleManualScroll}
                className={`h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide py-[35vh] px-6 w-full transition-all ${isLyricsMode ? "max-w-6xl" : "max-w-4xl"}`}
                style={{ maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" }}
            >
                {parsedLyrics.map((line, index) => (
                    <p
                        key={index}
                        ref={(el) => (lyricRefs.current[index] = el)}
                        onClick={() => handleLyricClick(line.time)}
                        className={`text-3xl lg:text-5xl font-bold py-6 transition-all cursor-pointer ${index === activeIndex ? "text-white scale-100" : "text-white/40 scale-95 hover:text-white/60"}`}
                    >
                        {line.text || "♪"}
                    </p>
                ))}
            </div>
        </div>
    );
}