import { useEffect, useRef, useState } from "react";
import AppLayout from "@/Layouts/AppLayout";

export default function Dashboard() {
    const audioRef = useRef(null);
    const lyricsContainerRef = useRef(null);
    const lyricRefs = useRef([]);

    const [lyrics, setLyrics] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    // 1. TAMBAHKAN STATE UNTUK FULLSCREEN LIRIK
    const [isLyricsMode, setIsLyricsMode] = useState(false); 

    const song = {
        title: "Type Shit",
        artist: "Future, Metro Boomin, Travis Scott & Playboi Carti",
        audio_url: "/stream-music/typeshit.mp3",
        lyrics_url: "/music/typeshit.lrc",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop"
    };

    useEffect(() => {
        fetch(song.lyrics_url)
            .then(res => res.text())
            .then(text => setLyrics(parseLRC(text)))
            .catch(() => console.error("Gagal memuat lirik"));
    }, []);

    const parseLRC = (text) => {
        return text.split("\n").map(line => {
            const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
            if (!match) return null;
            return {
                time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
                text: match[3].trim()
            };
        }).filter(Boolean);
    };

    const activeIndex = lyrics.findIndex((l, i) => currentTime >= l.time && (!lyrics[i + 1] || currentTime < lyrics[i + 1].time));

    useEffect(() => {
        const el = lyricRefs.current[activeIndex];
        if (el && lyricsContainerRef.current) {
            const container = lyricsContainerRef.current;
            const top = el.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);
            container.scrollTo({ top, behavior: "smooth" });
        }
    }, [activeIndex]);

    const handleLyricClick = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
            audioRef.current.play().catch(e => console.log("User belum berinteraksi:", e));
        }
    };

    return (
        <AppLayout
            audioRef={audioRef}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            setIsDragging={setIsDragging}
            song={song}
            // 2. KIRIM STATE KE LAYOUT
            isLyricsMode={isLyricsMode}
            setIsLyricsMode={setIsLyricsMode}
        >
            <div
                className="absolute inset-0 z-0 opacity-30 blur-[100px] pointer-events-none scale-150 transform-gpu transition-all duration-1000"
                style={{ backgroundImage: `url(${song.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row h-full transition-all duration-700">
                {/* 3. COVER ALBUM: Sembunyikan saat isLyricsMode aktif */}
                <div className={`flex flex-col items-center justify-center p-12 lg:sticky lg:top-0 transition-all duration-700 ease-in-out overflow-hidden ${isLyricsMode ? 'w-0 opacity-0 p-0 m-0' : 'w-full lg:w-1/2'}`}>
                    <div className="relative group shadow-2xl rounded-xl overflow-hidden aspect-square max-w-[420px] w-full ring-1 ring-white/10 shrink-0">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-500 z-10" />
                        <img src={song.cover} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out" />
                    </div>
                    <div className="mt-10 text-center lg:text-left w-full max-w-[420px] shrink-0">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">{song.title}</h2>
                        <p className="text-xl md:text-2xl text-zinc-300 font-medium mt-2 drop-shadow-md">{song.artist}</p>
                    </div>
                </div>

                {/* 4. LIRIK: Perlebar dan buat rata tengah saat isLyricsMode aktif */}
                <div className={`h-full flex flex-col justify-center transition-all duration-700 ease-in-out ${isLyricsMode ? 'w-full items-center' : 'w-full lg:w-1/2'}`}>
                    <div
                        ref={lyricsContainerRef}
                        className={`h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide py-[35vh] px-8 lg:px-12 w-full transition-all duration-700 ${isLyricsMode ? 'max-w-4xl text-center' : ''}`}
                        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
                    >
                        {lyrics.map((l, i) => {
                            const isActive = i === activeIndex;
                            const isPast = i < activeIndex;

                            return (
                                <p
                                    key={i}
                                    ref={el => lyricRefs.current[i] = el}
                                    onClick={() => handleLyricClick(l.time)}
                                    // origin-center untuk fullscreen, origin-left untuk normal
                                    className={`
                                        text-3xl md:text-4xl lg:text-5xl font-bold py-3 transition-all duration-500 cursor-pointer tracking-tight
                                        ${isLyricsMode ? 'origin-center' : 'origin-left'}
                                        ${isActive ? "text-white scale-100 opacity-100 drop-shadow-xl" : isPast ? "text-white/20 scale-95 hover:text-white/50" : "text-white/40 scale-95 hover:text-white/70"}
                                    `}
                                >
                                    {l.text || "♪"}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={song.audio_url}
                preload="auto"
                onTimeUpdate={(e) => {
                    if (!isDragging) setCurrentTime(e.target.currentTime);
                }}
            />
        </AppLayout>
    );
}