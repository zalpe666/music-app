import { useEffect, useRef, useState } from "react";
import { Play, Heart } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";

export default function Dashboard() {
    const audioRef = useRef(null);
    const lyricsContainerRef = useRef(null);
    const lyricRefs = useRef([]);

    const [activeView, setActiveView] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");

    const playlist = [
        { id: 1, title: "Type Shit", artist: "Future, Metro Boomin, Travis Scott & Playboi Carti", audio_url: "/stream-music/typeshit.mp3", lyrics_url: "/music/typeshit.lrc", cover: "https://cdn-images.dzcdn.net/images/artist/c8c8fea7e2b8613b3ba7328d22d3016c/1000x1000-000000-80-0-0.jpg" },
        { id: 2, title: "BIRDS OF A FEATHER", artist: "Billie Eilish", audio_url: "/stream-music/feather.mp3", lyrics_url: "/music/feather.lrc", cover: "https://cdn-images.dzcdn.net/images/artist/8eab1a9a644889aabaca1e193e05f984/1000x1000-000000-80-0-0.jpg" },
        { id: 3, title: "Red(Taylor's Version)", artist: "Taylor Swift", audio_url: "/stream-music/red.mp3", lyrics_url: "/music/red.lrc", cover: "https://cdn-images.dzcdn.net/images/artist/e528e270424103b527f8a27ac625563b/1000x1000-000000-80-0-0.jpg" }
    ];

    const [currentSong, setCurrentSong] = useState(playlist[0]);
    const [lyrics, setLyrics] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isLyricsMode, setIsLyricsMode] = useState(false);

    useEffect(() => {
        setLyrics([]);
        fetch(currentSong.lyrics_url)
            .then(res => res.text())
            .then(text => setLyrics(parseLRC(text)))
            .catch(() => console.error("Gagal memuat lirik"));
    }, [currentSong]);

    const parseLRC = (text) => {
        return text.split("\n").map(line => {
            const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
            if (!match) return null;
            return { time: parseInt(match[1], 10) * 60 + parseFloat(match[2]), text: match[3].trim() };
        }).filter(Boolean);
    };

    const activeIndex = lyrics.findIndex((l, i) => currentTime >= l.time && (!lyrics[i + 1] || currentTime < lyrics[i + 1].time));

    useEffect(() => {
        if (activeView === "player") {
            const el = lyricRefs.current[activeIndex];
            if (el && lyricsContainerRef.current) {
                const container = lyricsContainerRef.current;
                const top = el.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);
                container.scrollTo({ top, behavior: "smooth" });
            }
        }
    }, [activeIndex, activeView]);

    const handleLyricClick = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
            audioRef.current.play().catch(e => console.log("User belum berinteraksi:", e));
        }
    };

    const playSong = (song) => {
        setCurrentSong(song);
        setCurrentTime(0);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(() => console.log("Menunggu interaksi user"));
            }
        }, 100);
    };

    // --- FUNGSI NEXT DAN PREVIOUS ---
    const handleNextSong = () => {
        const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
        // Jika lagu terakhir, kembali ke lagu pertama (loop playlist)
        const nextIndex = (currentIndex + 1) % playlist.length;
        playSong(playlist[nextIndex]);
    };

    const handlePrevSong = () => {
        const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
        // Jika lagu pertama, mundur ke lagu paling akhir
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        playSong(playlist[prevIndex]);
    };

    const SongList = ({ songs }) => (
        <div className="grid grid-cols-1 gap-4 mt-6">
            {songs.map((song, index) => (
                <div key={song.id} onClick={() => playSong(song)} className="flex items-center gap-4 p-3 rounded-md hover:bg-white/10 cursor-pointer transition group">
                    <div className="w-10 text-center text-zinc-400 group-hover:hidden">{index + 1}</div>
                    <div className="w-10 text-center text-white hidden group-hover:block"><Play size={16} className="mx-auto fill-current"/></div>
                    <img src={song.cover} alt={song.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                        <p className={`font-medium ${currentSong.id === song.id ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                        <p className="text-sm text-zinc-400">{song.artist}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        switch (activeView) {
            case "search":
                const filtered = playlist.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.artist.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                    <div className="p-8">
                        <div className="max-w-md mb-8">
                            <input type="text" placeholder="What do you want to listen to?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-800 text-white rounded-full px-6 py-3 border-2 border-transparent focus:border-white focus:outline-none transition-all" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Browse All</h2>
                        <SongList songs={filtered} />
                    </div>
                );
            case "library":
                return (<div className="p-8"><h2 className="text-3xl font-bold text-white mb-6">Your Library</h2><SongList songs={playlist} /></div>);
            case "home":
                return (
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-white mb-6">Good Evening</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-zinc-800/50 hover:bg-zinc-700/50 transition cursor-pointer rounded-md flex items-center overflow-hidden h-16 group" onClick={() => setActiveView('library')}>
                                <div className="w-16 h-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center"><Heart size={24} className="text-white fill-white"/></div>
                                <span className="font-bold text-white px-4">Liked Songs</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Jump Back In</h2>
                        <SongList songs={playlist} />
                    </div>
                );
            case "player":
            default:
                return (
                    <div className="relative w-full h-full">
                        <div className="absolute inset-0 z-0 opacity-30 blur-[100px] pointer-events-none scale-150 transform-gpu transition-all duration-1000" style={{ backgroundImage: `url(${currentSong.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div className="relative z-10 flex flex-col lg:flex-row h-full transition-all duration-700">
                            <div className={`flex flex-col items-center justify-center p-12 lg:sticky lg:top-0 transition-all duration-700 ease-in-out overflow-hidden ${isLyricsMode ? 'w-0 opacity-0 p-0 m-0' : 'w-full lg:w-1/2'}`}>
                                <div className="relative group shadow-2xl rounded-xl overflow-hidden aspect-square max-w-[420px] w-full ring-1 ring-white/10 shrink-0">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-500 z-10" />
                                    <img src={currentSong.cover} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out" />
                                </div>
                                <div className="mt-10 text-center lg:text-left w-full max-w-[420px] shrink-0">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">{currentSong.title}</h2>
                                    <p className="text-xl md:text-2xl text-zinc-300 font-medium mt-2 drop-shadow-md">{currentSong.artist}</p>
                                </div>
                            </div>
                            <div className={`h-full flex flex-col justify-center transition-all duration-700 ease-in-out ${isLyricsMode ? 'w-full items-center' : 'w-full lg:w-1/2'}`}>
                                <div ref={lyricsContainerRef} className={`h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide py-[35vh] px-8 lg:px-12 w-full transition-all duration-700 ${isLyricsMode ? 'max-w-4xl text-center' : ''}`} style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
                                    {lyrics.length > 0 ? lyrics.map((l, i) => {
                                        const isActive = i === activeIndex;
                                        const isPast = i < activeIndex;
                                        return (
                                            <p key={i} ref={el => lyricRefs.current[i] = el} onClick={() => handleLyricClick(l.time)} className={`text-3xl md:text-4xl lg:text-5xl font-bold py-3 transition-all duration-500 cursor-pointer tracking-tight ${isLyricsMode ? 'origin-center' : 'origin-left'} ${isActive ? "text-white scale-100 opacity-100 drop-shadow-xl" : isPast ? "text-white/20 scale-95 hover:text-white/50" : "text-white/40 scale-95 hover:text-white/70"}`}>
                                                {l.text || "♪"}
                                            </p>
                                        );
                                    }) : <p className="text-white/50 text-2xl font-bold">Memuat lirik...</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <AppLayout
            audioRef={audioRef}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            setIsDragging={setIsDragging}
            song={currentSong} 
            isLyricsMode={isLyricsMode}
            setIsLyricsMode={setIsLyricsMode}
            activeView={activeView}
            setActiveView={setActiveView}
            onNext={handleNextSong} // <-- KIRIM PROP NEXT
            onPrev={handlePrevSong} // <-- KIRIM PROP PREV
        >
            {renderContent()}

            <audio
                ref={audioRef}
                src={currentSong.audio_url}
                preload="auto"
                onTimeUpdate={(e) => {
                    if (!isDragging) setCurrentTime(e.target.currentTime);
                }}
                onEnded={handleNextSong} // <-- AUTOPLAY NEXT SAAT LAGU HABIS
            />
        </AppLayout>
    );
}