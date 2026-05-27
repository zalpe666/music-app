import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import PlayerControls from "@/Components/Player/PlayerControls";
import { ChevronDown, MapPin, Globe, ListMusic, Mic2 } from "lucide-react";
import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";

// Fungsi untuk parsing LRC (jika belum ada di file terpisah)
const parseLRC = (lrcText) => {
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

const PlayerMini = () => {
    const {
        currentSong, isPlaying, togglePlay, nextSong, prevSong, queue, currentIndex,
        currentTime, duration, setCurrentTime, toggleShuffle, isShuffle, isLoading
    } = usePlayerStore();

    // STATE UNTUK LIRIK
    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [loadingLyrics, setLoadingLyrics] = useState(false);

    // FETCH LIRIK
    useEffect(() => {
        if (currentSong?.lyrics_path) {
            setLoadingLyrics(true);
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
                    setParsedLyrics([{ time: 0, text: "Lirik tidak dapat dimuat." }]);
                    setLoadingLyrics(false);
                });
        } else {
            setParsedLyrics([]); // Kosongkan jika tidak ada path lirik
        }
    }, [currentSong]);

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
    const nextSongInQueue = queue && queue.length > 0 && currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null;

    // MENCARI LIRIK AKTIF
    // MENCARI LIRIK AKTIF
    let activeLyricIndex = parsedLyrics.findIndex((lyric, index) => {
        const nextLyric = parsedLyrics[index + 1];
        return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });

    // Jika belum mencapai lirik pertama, default ke baris 0
    if (activeLyricIndex === -1) activeLyricIndex = 0;

    if (!currentSong) return null;

    return (
        <div className="relative min-h-screen w-full bg-zinc-950 text-white overflow-hidden flex flex-col">

            {/* 1. DYNAMIC BACKGROUND BLUR */}
            <div
                className="absolute inset-0 z-0 opacity-30 blur-[90px] pointer-events-none transition-all duration-1000"
                style={{ backgroundImage: `url(${currentSong.album?.cover_xl})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />

            {/* KONTEN UTAMA */}
            <div className="relative z-10 flex-1 w-full flex flex-col p-6 pb-28 overflow-y-auto scrollbar-hide">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition active:scale-90 cursor-pointer"> 
                        <ChevronDown size={28} />
                    </Link>
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Now Playing</span>
                <div className="w-10"></div>
            </div>

            {/* WRAPPER TENGAH (Cover, Info, Controls) */}
            <div className="flex flex-col items-center max-w-md mx-auto w-full space-y-8">
                {/* COVER ALBUM */}
                <div className="w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative group">
                    <img src={currentSong.album?.cover_xl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Album Cover" />
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* JUDUL & ARTIS */}
                <div className="text-center w-full px-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 justify-center w-full">
                        <h2 className="text-2xl md:text-3xl font-black text-white truncate drop-shadow-md">{currentSong.title}</h2>
                        {currentSong.explicit_lyrics == 1 && (
                            <span className="text-[10px] font-black bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-sm border border-zinc-600 flex-shrink-0">E</span>
                        )}
                    </div>
                    <Link href={`/artist/${currentSong.artist?.slug}`} className="text-zinc-400 text-sm md:text-base mt-1 font-medium truncate hover:text-white hover:underline transition">
                        {currentSong.artist?.name}
                    </Link>
                </div>

                {/* KONTROL PEMUTAR */}
                <div className="w-full pb-2">
                    <PlayerControls
                        prevSong={prevSong} togglePlay={togglePlay} nextSong={nextSong}
                        toggleShuffle={toggleShuffle} isShuffle={isShuffle} isPlaying={isPlaying}
                        isLoading={isLoading} currentTime={currentTime} duration={duration}
                        formatTime={formatTime} handleProgressChange={handleProgressChange} progressPercent={progressPercent}
                    />
                </div>
            </div>

            {/* --- DETAIL BAWAH --- */}
            <div className="max-w-md mx-auto w-full mt-6 space-y-6">

                {/* 1. LIRIK PREVIEW (RATA KIRI & STYLE SIMPLE) */}
                {currentSong.lyrics_path && (
                    <Link
                        href="/LyricsMini"
                        className="block bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg hover:bg-zinc-800/60 transition-all group relative cursor-pointer"
                    >
                        {/* Header Lirik */}
                        <div className="flex items-center justify-between mb-2 text-zinc-400 group-hover:text-white transition-colors">
                            <div className="flex items-center gap-2">
                                <Mic2 size={16} className="text-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Lyrics</span>
                            </div>
                            <div className="text-[10px] bg-white/10 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                Full Screen
                            </div>
                        </div>

                        {/* Kontainer Lirik dengan Style Simpel & Rata Kiri */}
                        <div
                            className="relative h-[140px] overflow-hidden w-full"
                            style={{
                                maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
                                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
                            }}
                        >
                            {loadingLyrics ? (
                                <p className="text-zinc-500 text-sm text-left mt-10">Memuat lirik...</p>
                            ) : parsedLyrics.length > 0 ? (
                                <div
                                    className="transition-transform duration-500 ease-out w-full"
                                    style={{
                                        // Menggeser baris ke atas agar baris aktif tetap di tengah kotak (50px dari atas kotak)
                                        transform: `translateY(calc(-${activeLyricIndex * 40}px + 50px))`
                                    }}
                                >
                                    {parsedLyrics.map((line, index) => (
                                        <p
                                            key={index}
                                            className={`text-left h-[40px] flex items-center justify-start transition-all duration-300 font-bold truncate ${index === activeLyricIndex
                                                ? "text-white scale-100 text-lg md:text-xl"
                                                : "text-white/40 scale-95"
                                                }`}
                                        >
                                            {line.text || "♪"}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm text-left mt-10">Lirik tidak tersedia.</p>
                            )}
                        </div>
                    </Link>
                )}

                {/* 2. UP NEXT */}
                {nextSongInQueue && (
                    <div className="bg-zinc-900/30 backdrop-blur-md rounded-2xl p-4 border border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-zinc-400 mb-3">
                            <ListMusic size={14} />
                            <span className="text-[10px] font-bold tracking-widest uppercase">Up Next</span>
                        </div>
                        <div className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition" onClick={nextSong}>
                            <img src={nextSongInQueue.album?.cover_xl || currentSong.album?.cover_xl} alt="Next Song Cover" className="w-12 h-12 rounded-md object-cover shadow-md opacity-80" />
                            <div className="flex flex-col truncate flex-1">
                                <h4 className="font-medium text-white text-sm truncate">{nextSongInQueue.title}</h4>
                                <p className="text-xs text-zinc-400 truncate mt-0.5">{nextSongInQueue.artist?.name || currentSong.artist?.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. ALBUM CARD */}
                <Link href={`/album/${currentSong.album?.slug}`} className="block bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/60 transition rounded-2xl p-4 border border-white/10 group shadow-lg">
                    <div className="flex items-center gap-4">
                        <img src={currentSong.album?.cover_xl} alt="Album" className="w-14 h-14 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform" />
                        <div className="flex flex-col truncate">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Album</p>
                            <h3 className="font-semibold text-white group-hover:text-accent transition truncate text-lg">{currentSong.album?.title}</h3>
                        </div>
                    </div>
                </Link>

                {/* 4. ABOUT ARTIST CARD */}
                {/* ... (Bagian About Artist tetap sama persis seperti sebelumnya) ... */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    {currentSong.artist?.strArtistFanart && (
                        <div className="relative h-28 w-full bg-zinc-800">
                            <img src={currentSong.artist.strArtistFanart} alt="Artist Fanart" className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b]/80 via-[#18181b]/40 to-transparent"></div>
                            {currentSong.artist?.strArtistLogo && (
                                <img src={currentSong.artist.strArtistLogo} alt="Artist Logo" className="absolute bottom-2 left-4 h-10 object-contain drop-shadow-lg" />
                            )}
                        </div>
                    )}
                    <div className={`p-5 ${currentSong.artist?.strArtistFanart ? 'pt-2' : ''}`}>
                        <div className="flex items-center justify-between mb-3 mt-2">
                            <h3 className="font-bold text-white text-base">About Artist</h3>
                            {currentSong.artist?.strCountry && (
                                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1"><MapPin size={12} />{currentSong.artist.strCountry}</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {currentSong.artist?.strGenre && <span className="px-2 py-1 bg-white/10 text-zinc-200 text-[10px] rounded-md font-medium border border-white/5">{currentSong.artist.strGenre}</span>}
                            {currentSong.artist?.strMood && <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded-md font-medium border border-green-500/20">{currentSong.artist.strMood}</span>}
                            {currentSong.artist?.strStyle && <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-md font-medium border border-blue-500/20">{currentSong.artist.strStyle}</span>}
                        </div>
                        {currentSong.artist?.strBiography ? (
                            <p className="text-xs text-zinc-300 line-clamp-4 hover:line-clamp-none transition-all duration-300 leading-relaxed cursor-pointer mb-4">{currentSong.artist.strBiography}</p>
                        ) : (
                            <p className="text-xs text-zinc-500 mb-4 italic">Biography not available.</p>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                                {currentSong.artist?.intFormedYear && <span>Est. {currentSong.artist.intFormedYear}</span>}
                                {currentSong.artist?.intMembers > 1 && <span>{currentSong.artist.intMembers} Members</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                {currentSong.artist?.strWebsite && (
                                    <a href={currentSong.artist.strWebsite} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full hover:bg-white/20"><Globe size={14} /></a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </div >
    );
};

PlayerMini.layout = (page) => <AppLayout>{page}</AppLayout>;
export default PlayerMini;