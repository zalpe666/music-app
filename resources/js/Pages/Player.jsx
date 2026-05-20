import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Player = () => {
    const { currentSong, currentTime, isLyricsMode } = usePlayerStore(); // Ambil isLyricsMode dari Store
    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [loadingLyrics, setLoadingLyrics] = useState(false);

    const lyricsContainerRef = useRef(null);
    const lyricRefs = useRef([]);

    const parseLRC = (text) => {
        return text
            .split("\n")
            .map((line) => {
                const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
                if (!match) return null;
                return {
                    time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
                    text: match[3].trim(),
                };
            })
            .filter(Boolean);
    };

    useEffect(() => {
        if (currentSong?.lyrics_path) {
            setLoadingLyrics(true);
            setParsedLyrics([]);
            axios
                .get(`/lyrics/${currentSong.lyrics_path}`)
                .then((res) => {
                    const lrcData = parseLRC(res.data);
                    lrcData.length > 0
                        ? setParsedLyrics(lrcData)
                        : setParsedLyrics([{ time: 0, text: res.data }]);
                    setLoadingLyrics(false);
                })
                .catch(() => {
                    setParsedLyrics([
                        { time: 0, text: "Lirik tidak dapat dimuat." },
                    ]);
                    setLoadingLyrics(false);
                });
        }
    }, [currentSong]);

    const handleLyricClick = (time) => {
        const audioElement = document.querySelector("audio");
        if (audioElement) {
            audioElement.currentTime = time;
            audioElement.play().catch(() => { });
        }
    };

    const activeIndex = parsedLyrics.findIndex((l, i) => {
        return (
            currentTime >= l.time &&
            (!parsedLyrics[i + 1] || currentTime < parsedLyrics[i + 1].time)
        );
    });

    useEffect(() => {
        if (
            activeIndex !== -1 &&
            lyricRefs.current[activeIndex] &&
            lyricsContainerRef.current
        ) {
            const container = lyricsContainerRef.current;
            const el = lyricRefs.current[activeIndex];
            const top =
                el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
            container.scrollTo({ top, behavior: "smooth" });
        }
    }, [activeIndex]);

    if (!currentSong)
        return (
            <div className="h-full flex items-center justify-center text-zinc-500">
                No song playing
            </div>
        );

    return (
        <div className="relative h-full overflow-hidden flex flex-col md:flex-row">
            {/* BACKGROUND BLUR */}
            <div
                className=" absolute inset-0
                            opacity-40
                            blur-[90px]
                            scale-125
                            pointer-events-none"
                style={{
                    backgroundImage: `url(${currentSong.album?.cover_xl ||
                        currentSong.album?.cover_medium
                        })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            {/* KIRI: COVER & INFO (HILANG SAAT LYRICS MODE) */}
            <div
                className={`
                relative z-10 flex flex-col items-center justify-center p-10 
                transition-all duration-700 ease-in-out overflow-hidden
                ${isLyricsMode ? "w-0 opacity-0 p-0 m-0" : "w-full md:w-1/2 opacity-100"}
            `}
            >
                <div className="relative shadow-2xl rounded-xl overflow-hidden aspect-square max-w-[320px] w-full shrink-0 mb-8">
                    <img
                        src={
                            currentSong.album?.cover_xl ||
                            currentSong.album?.cover_medium
                        }
                        alt={currentSong.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="text-left w-full max-w-[420px]">
                    <h2 className="text-xl md:text-4xl font-black text-white mb-2">
                        {currentSong.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-300 font-medium">
                        {currentSong.artist?.name}
                    </p>
                </div>
            </div>

            {/* KANAN: LIRIK (JADI TENGAH SAAT MODE AKTIF) */}
            <div
                className={`
                        relative z-10 h-full flex flex-col items-center justify-center
                        pt-0 pb-0 transition-all duration-700 ease-in-out
                        ${isLyricsMode ? "absolute inset-0 w-full" : "w-full md:w-1/2"}
                `}
            >
                <div
                    className={`
                            relative z-10 h-full flex flex-col items-center justify-center
                            pt-0 pb-0 transition-all duration-700 ease-in-out
                            ${isLyricsMode
                            ? "absolute inset-0 w-full"
                            : "flex-1"
                        }
                        `}
                >
                    <div
                        ref={lyricsContainerRef}
                        className={`
                                h-[calc(100vh-250px)]
                                overflow-y-auto
                                scrollbar-hide
                                py-[35vh]
                                px-6 lg:px-16
                                w-full
                                transition-all duration-700

                                ${isLyricsMode
                                ? "max-w-6xl text-left"
                                : "max-w-4xl text-left md:text-center"
                            }
        `}
                        style={{
                            maskImage:
                                "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
                        }}
                    >
                        {loadingLyrics ? (
                            <p className="text-white/50 text-2xl font-bold">
                                Memuat lirik...
                            </p>
                        ) : (
                            parsedLyrics.map((line, index) => {
                                const isActive = index === activeIndex;
                                const isPast = index < activeIndex;

                                return (
                                    <p
                                        key={index}
                                        ref={(el) =>
                                            (lyricRefs.current[index] = el)
                                        }
                                        onClick={() =>
                                            handleLyricClick(line.time)
                                        }
                                        className={`
                            text-3xl md:text-4xl lg:text-5xl font-bold
                            ${isLyricsMode
                                                ? "py-6"
                                                : "py-4"
                                            }
                            transition-all duration-500 tracking-tight
                            cursor-pointer select-none

                            ${isLyricsMode
                                                ? "origin-center"
                                                : "origin-left md:origin-center"
                                            }

                            ${isActive
                                                ? "text-white scale-100 opacity-100 drop-shadow-xl"
                                                : isPast
                                                    ? "text-white/20 scale-95 hover:text-white/60"
                                                    : "text-white/40 scale-95 hover:text-white/70"
                                            }
                        `}
                                    >
                                        {line.text || "♪"}
                                    </p>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

Player.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Player;
