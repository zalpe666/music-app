import { useState, useEffect, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";

import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Mic2,
    Home,
    Search,
    Library,
    PlusSquare,
    Heart,
    Shuffle,
    PanelRightClose, PanelRightOpen
} from "lucide-react";
import usePlayerStore from "@/Stores/playerStore";

export default function AppLayout({ children }) {
    const audioRef = useRef(null);
    const { url } = usePage(); // Untuk mengetahui halaman mana yang sedang aktif

    // AMBIL DATA DARI ZUSTAND STORE
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        isLyricsMode, // Ambil state global
        setIsLyricsMode, // Ambil setter global
        setCurrentTime,
        setDuration,
        nextSong,
        prevSong,
        togglePlay,
        songs,
        currentIndex,
        playSong,
        isShuffle,
        toggleShuffle,
    } = usePlayerStore();

    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const [rightTab, setRightTab] = useState("details");
    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [loadingLyrics, setLoadingLyrics] = useState(false);
    const parseLRC = (text) => {
        return text
            .split("\n")
            .map((line) => {
                const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);

                if (!match) return null;

                return {
                    time:
                        parseInt(match[1], 10) * 60 +
                        parseFloat(match[2]),
                    text: match[3].trim(),
                };
            })
            .filter(Boolean);
    };
    const handleMicClick = () => {
        if (!currentSong?.lyrics_path) return; // Jika tidak ada lirik, jangan lakukan apa-apa

        const newMode = !isLyricsMode;
        setIsLyricsMode(newMode);

        // JIKA sedang tidak di halaman player, PAKSA pindah ke /player
        if (newMode && url !== "/player") {
            router.visit(route("player"));
        }
    };
    useEffect(() => {
        if (currentSong?.lyrics_path) {
            setLoadingLyrics(true);

            axios
                .get(`/lyrics/${currentSong.lyrics_path}`)
                .then((res) => {
                    const lrcData = parseLRC(res.data);

                    lrcData.length > 0
                        ? setParsedLyrics(lrcData)
                        : setParsedLyrics([
                            {
                                time: 0,
                                text: res.data,
                            },
                        ]);

                    setLoadingLyrics(false);
                })
                .catch(() => {
                    setParsedLyrics([
                        {
                            time: 0,
                            text: "Lirik tidak dapat dimuat.",
                        },
                    ]);

                    setLoadingLyrics(false);
                });
        }
    }, [currentSong]);
    // LOGIC AUDIO & GOOGLE DRIVE STREAMING
    useEffect(() => {
        if (!audioRef.current || !currentSong) return;

        // Path stream diarahkan ke controller Laravel Google Drive Anda
        const streamUrl = `/stream/${currentSong.audio_path}`;

        if (audioRef.current.src !== window.location.origin + streamUrl) {
            audioRef.current.src = streamUrl;
            audioRef.current.load();
        }

        if (isPlaying) {
            audioRef.current.play().catch((e) => console.log("Play error:", e));
        } else {
            audioRef.current.pause();
        }
    }, [currentSong, isPlaying]);

    // UPDATE VOLUME
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    };

    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);

        // Baris ini WAJIB ada agar audio ikut bergeser saat ditarik
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const handleProgressRelease = (e) => {
        const newTime = parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = newTime;
        setIsDragging(false);
    };

    const formatTime = (time) => {
        if (isNaN(time) || time === Infinity || !time) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex flex-col h-screen bg-black text-zinc-100 font-sans overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <aside className="w-64 bg-black flex-col hidden md:flex z-20 shrink-0 transition-all duration-300">
                    <div className="flex flex-col h-full w-64 pt-6 pb-4">
                        <div className="px-6 mb-8 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
                                <Play
                                    size={14}
                                    className="text-black fill-black ml-0.5"
                                />
                            </div>
                            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                Zaldien Music
                            </h1>
                        </div>

                        <div className="px-3">
                            <nav className="space-y-1">
                                <Link href={route("dashboard")}>
                                    <NavItem
                                        icon={<Home size={22} />}
                                        label="Home"
                                        active={url.startsWith("/dashboard")}
                                    />
                                </Link>
                                <Link href={route("search")}>
                                    <NavItem
                                        icon={<Search size={22} />}
                                        label="Search"
                                        active={url.startsWith("/search")}
                                    />
                                </Link>
                                <Link href={route("library")}>
                                    <NavItem
                                        icon={<Library size={22} />}
                                        label="Your Library"
                                        active={url.startsWith("/library")}
                                    />
                                </Link>
                            </nav>
                        </div>

                        <div className="px-3 mt-8">
                            <nav className="space-y-1">
                                <NavItem
                                    icon={<PlusSquare size={22} />}
                                    label="Create Playlist"
                                />
                                <NavItem
                                    icon={<Heart size={22} />}
                                    label="Liked Songs"
                                    customIconColor="text-green-500"
                                />
                            </nav>
                        </div>

                        <div className="px-6 mt-4 mb-4">
                            <div className="h-px bg-white/10 w-full" />
                        </div>

                        <div className="px-6 flex-1 overflow-y-auto scrollbar-hide">
                            <p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">
                                Playlists
                            </p>
                            <ul className="space-y-3 text-sm text-zinc-400">
                                <li className="hover:text-white cursor-pointer transition-colors line-clamp-1">
                                    Coding Vibes 💻
                                </li>
                                <li className="hover:text-white cursor-pointer transition-colors line-clamp-1">
                                    Late Night Drive 🌙
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT (Children render disini) */}
                <main className="flex-1 relative overflow-y-auto scrollbar-hide bg-zinc-950">
                    {children}
                </main>
                <aside
                    className={`
        hidden lg:flex flex-col shrink-0
        bg-zinc-950 border-l border-white/10
        transition-all duration-500 ease-in-out overflow-hidden
        ${showRightSidebar
                            ? "w-[320px] opacity-100"
                            : "w-0 opacity-0 border-l-0"
                        }
    `}
                >
                    {currentSong ? (
                        <>
                            {/* TAB BUTTON */}
                            <div className="p-5 pb-0">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setRightTab("details")}
                                        className={`
                            flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                            ${rightTab === "details"
                                                ? "bg-white text-black"
                                                : "bg-white/5 text-zinc-400 hover:text-white"
                                            }
                        `}
                                    >
                                        Details
                                    </button>

                                    <button
                                        onClick={() => setRightTab("queue")}
                                        className={`
                            flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                            ${rightTab === "queue"
                                                ? "bg-white text-black"
                                                : "bg-white/5 text-zinc-400 hover:text-white"
                                            }
                        `}
                                    >
                                        Queue
                                    </button>
                                </div>
                            </div>

                            {/* DETAILS */}
                            {rightTab === "details" && (
                                <div className="flex-1 overflow-y-auto scrollbar-hide">
                                    {/* COVER */}
                                    <div className="p-5">
                                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                            <img
                                                src={currentSong.album?.cover_xl}
                                                alt={currentSong.title}
                                                className="w-full aspect-square object-cover"
                                            />

                                            {/* OVERLAY */}
                                            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-4">
                                                <h2 className="text-xl font-bold text-white line-clamp-2">
                                                    {currentSong.title}
                                                </h2>

                                                <p className="text-sm text-zinc-300 mt-1">
                                                    {currentSong.artist?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ALBUM */}
                                    <div className="px-5 mt-2">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                                                Album
                                            </p>

                                            <h3 className="font-semibold text-white">
                                                {currentSong.album?.title}
                                            </h3>

                                            <p className="text-sm text-zinc-400 mt-1">
                                                {currentSong.artist?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* LYRICS */}
                                    <div className="px-5 mt-6 pb-6">
                                        <div className="bg-gradient-to-b from-green-500/20 to-transparent border border-green-500/10 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-white">
                                                    Lyrics
                                                </h3>

                                                <button
                                                    onClick={handleMicClick}
                                                    className="text-green-400 hover:text-green-300 transition"
                                                >
                                                    <Mic2 size={18} />
                                                </button>
                                            </div>

                                            <p className="text-sm text-zinc-300 whitespace-pre-line leading-7">
                                                {loadingLyrics
                                                    ? "Memuat lirik..."
                                                    : parsedLyrics
                                                        .map((line) => line.text)
                                                        .join("\n")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* QUEUE */}
                            {rightTab === "queue" && (
                                <div className="flex-1 overflow-y-auto scrollbar-hide p-5">

                                    <div className="bg-white/5 rounded-2xl border border-white/5 p-5">

                                        <h2 className="text-xl font-bold text-white mb-6">
                                            Queue
                                        </h2>

                                        {/* NOW PLAYING */}

                                        {currentSong && (
                                            <div className="mb-8">

                                                <p className="text-zinc-400 text-sm mb-3">
                                                    Now Playing
                                                </p>

                                                <div className="flex items-center gap-4 bg-white/5 rounded-xl p-3">

                                                    <img
                                                        src={
                                                            currentSong.album?.cover_medium ||
                                                            currentSong.cover_small
                                                        }
                                                        className="w-14 h-14 rounded-lg object-cover"
                                                    />

                                                    <div className="min-w-0">
                                                        <p className="text-white font-semibold truncate">
                                                            {currentSong.title}
                                                        </p>

                                                        <p className="text-zinc-400 text-sm truncate">
                                                            {currentSong.artist?.name}
                                                        </p>
                                                    </div>

                                                </div>

                                            </div>
                                        )}

                                        {/* NEXT QUEUE */}

                                        <div>

                                            <p className="text-zinc-400 text-sm mb-3">
                                                Next in Queue
                                            </p>

                                            <div className="space-y-2">

                                                {songs
                                                    .slice(currentIndex + 1)
                                                    .map((song, index) => (

                                                        <div
                                                            key={song.id}
                                                            onClick={() =>
                                                                playSong(
                                                                    song,
                                                                    currentIndex + 1 + index
                                                                )
                                                            }
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                                                        >

                                                            <img
                                                                src={
                                                                    song.album?.cover_medium ||
                                                                    song.cover_small
                                                                }
                                                                className="w-12 h-12 rounded-md object-cover"
                                                            />

                                                            <div className="min-w-0 flex-1">

                                                                <p className="text-white text-sm truncate">
                                                                    {song.title}
                                                                </p>

                                                                <p className="text-zinc-400 text-xs truncate">
                                                                    {song.artist?.name}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    ))}

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-500">
                            Tidak ada lagu diputar
                        </div>
                    )}
                </aside>
            </div>

            {/* PLAYER BAR DI BAWAH */}
            <footer className="h-[90px] w-full shrink-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 px-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-4 w-1/3">
                    {currentSong && (
                        <>
                            <Link href={route("player")}>
                                <div className="relative overflow-hidden rounded-md h-14 w-14 group cursor-pointer shrink-0">
                                    {/* Gunakan cover dari database */}
                                    <img
                                        src={currentSong.album?.cover_medium}
                                        className="w-full h-full object-cover group-hover:opacity-80 transition"
                                        alt="Cover"
                                    />
                                </div>
                            </Link>
                            <div className="truncate flex flex-col justify-center">
                                <Link
                                    href={route("player")}
                                    className="font-bold text-sm text-white hover:underline cursor-pointer truncate"
                                >
                                    {currentSong.title}
                                </Link>
                                <p className="text-[11px] text-zinc-400 hover:text-white cursor-pointer transition truncate mt-0.5">
                                    {currentSong.artist?.name}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col items-center w-1/3 max-w-xl">
                    <div className="flex items-center gap-6 mb-2">
                        <button
                            onClick={prevSong}
                            className="text-zinc-400 hover:text-white transition cursor-pointer"
                        >
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                        >
                            {isPlaying ? (
                                <Pause
                                    size={18}
                                    className="text-black fill-current"
                                />
                            ) : (
                                <Play
                                    size={18}
                                    className="text-black fill-current"
                                />
                            )}
                        </button>

                        <button
                            onClick={nextSong}
                            className="text-zinc-400 hover:text-white transition cursor-pointer"
                        >
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                        <button
                            onClick={toggleShuffle}
                            className={`
                                        transition
                                        ${isShuffle
                                                                    ? "text-green-500"
                                                                    : "text-zinc-400 hover:text-white"
                                                                }
                                    `}
                        >
                            <Shuffle size={18} />
                        </button>
                    </div>

                    <div className="w-full flex items-center gap-2 group">
                        <span className="text-[11px] text-zinc-400 tabular-nums min-w-[35px] text-right">
                            {formatTime(currentTime)}
                        </span>
                        <div className="relative flex-1 h-1 flex items-center cursor-pointer">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                step="0.01"
                                value={currentTime || 0}
                                onMouseDown={() => setIsDragging(true)}
                                onTouchStart={() => setIsDragging(true)}
                                onChange={handleProgressChange}
                                onMouseUp={handleProgressRelease}
                                onTouchEnd={handleProgressRelease}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute inset-0 w-full h-1 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                                <div
                                    className="h-full bg-white group-hover:bg-green-500 transition-colors"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div
                                className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 -ml-1.5"
                                style={{ left: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-[11px] text-zinc-400 tabular-nums min-w-[35px]">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 w-1/3 text-zinc-400">
                    <button
                        onClick={handleMicClick}
                        className={`transition hover:text-white ${currentSong?.lyrics_path
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-50"
                            }`}
                    >
                        <Mic2
                            size={18}
                            className={isLyricsMode ? "text-green-500" : ""}
                        />
                    </button>
                    <button
                        onClick={() => setShowRightSidebar(!showRightSidebar)}
                        className="text-zinc-400 hover:text-white transition"
                    >
                        {showRightSidebar ? (
                            <PanelRightClose size={18} />
                        ) : (
                            <PanelRightOpen size={18} />
                        )}
                    </button>
                    <div className="flex items-center gap-2 relative w-24 group">
                        <button
                            onClick={() => setVolume(volume === 0 ? 1 : 0)}
                            className="hover:text-white transition"
                        >
                            {volume === 0 ? (
                                <VolumeX size={18} />
                            ) : (
                                <Volume2 size={18} />
                            )}
                        </button>
                        <div className="relative flex-1 h-1 flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                                <div
                                    className="h-full bg-white group-hover:bg-green-500 transition-colors"
                                    style={{ width: `${volume * 100}%` }}
                                />
                            </div>
                            <div
                                className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 -ml-1.5"
                                style={{ left: `${volume * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </footer>

            {/* TAG AUDIO TERSEMBUNYI */}
            <audio
                ref={audioRef}
                onTimeUpdate={(e) => {
                    if (!isDragging) setCurrentTime(e.target.currentTime);
                }}
                onLoadedMetadata={(e) => {
                    setDuration(e.target.duration);

                    if (currentTime) {
                        e.target.currentTime = currentTime;
                    }
                }}
                onEnded={nextSong}
            />
        </div>
    );
}

function NavItem({ icon, label, active = false, customIconColor = "" }) {
    return (
        <div
            className={`
            flex items-center gap-4 cursor-pointer transition-all duration-300 px-3 py-2.5 rounded-md group
            ${active ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}
        `}
        >
            <div
                className={`transition-colors duration-300 ${active ? "text-white" : customIconColor ? customIconColor : "text-zinc-400 group-hover:text-white"}`}
            >
                {icon}
            </div>
            <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
                {label}
            </span>
        </div>
    );
}
