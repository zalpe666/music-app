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
    Sparkles,
    PanelRightClose,
    PanelRightOpen,
    Globe,      // Pastikan ini ada
    MapPin,
    UserSearch,
    // Gunakan ikon sosial media alternatif ini jika Facebook/Twitter error:
    Disc,       // Pengganti ikon sosial
    Send        // Pengganti ikon pesan/Twitter
} from "lucide-react";
import usePlayerStore from "@/Stores/playerStore";
import MobileBottomNav from "@/Components/MobileBottomNav";
import MobileMiniPlayer from "@/Components/MobileMiniPlayer";
// Tambahkan ini di bagian atas file AppLayout.jsx
import PlayerInfo from "@/Components/Player/PlayerInfo";
import PlayerControls from "@/Components/Player/PlayerControls";
import PlayerExtras from "@/Components/Player/PlayerExtras";
export default function AppLayout({ children }) {
    const { url } = usePage();

    // 2. Buat Ref untuk container utama yang memiliki scroll
    const scrollContainerRef = useRef(null);

    // 3. Gunakan useEffect untuk reset scroll saat URL berubah
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'instant' // 'instant' agar langsung pindah tanpa animasi scroll
            });
        }
    }, [url]);
    const audioRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
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
        explicit_lyrics,
    } = usePlayerStore();

    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const [rightTab, setRightTab] = useState("details");
    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [loadingLyrics, setLoadingLyrics] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        // 1. Jika kita belum di halaman player, pindah ke player dan aktifkan lirik
        if (url !== "/player") {
            setIsLyricsMode(true); // Aktifkan mode lirik
            router.visit(route("player"));
            return;
        }

        // 2. Jika kita SUDAH di halaman player, baru kita lakukan toggle (buka/tutup)
        setIsLyricsMode(!isLyricsMode);
    };
    useEffect(() => {
        // Jika url bukan /player, matikan mode lirik
        if (url !== "/player" && isLyricsMode) {
            setIsLyricsMode(false);
        }
    }, [url]); // Efek ini jalan setiap kali navigasi berubah
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
    // Di dalam AppLayout.jsx
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            // Hanya update store jika tidak sinkron
            if (!isPlaying) togglePlay();
        };

        const handlePause = () => {
            if (isPlaying) togglePlay();
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [isPlaying]);
    // LOGIC AUDIO & GOOGLE DRIVE STREAMING
    useEffect(() => {
        if (!audioRef.current || !currentSong) return;

        const streamUrl = `/stream/${currentSong.audio_path}`;

        if (audioRef.current.src !== window.location.origin + streamUrl) {
            setIsLoading(true);
            audioRef.current.src = streamUrl;
            audioRef.current.load();
        }

        const playAudio = async () => {
            try {
                if (isPlaying) {
                    await audioRef.current.play();
                } else {
                    audioRef.current.pause();
                }
            } catch (e) {
                console.log("Autoplay dicegat browser, tombol Pause akan muncul.");
                // KUNCI: Jika error (dicegat), kita set isPlaying di store ke false 
                // agar UI kembali ke ikon Play
                if (isPlaying) {
                    togglePlay(); // Ini akan membalikkan isPlaying menjadi false
                }
            }
        };

        playAudio();
    }, [currentSong, isPlaying]);
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onCanPlay = () => {
            setIsLoading(false);
            // Setelah file siap, jika state isPlaying benar-benar true, coba play lagi
            if (isPlaying && audio.paused) {
                audio.play().catch(() => {
                    // Jika tetap gagal, update UI ke pause
                    if (isPlaying) togglePlay();
                });
            }
        };

        audio.addEventListener('canplay', onCanPlay);
        return () => audio.removeEventListener('canplay', onCanPlay);
    }, [isPlaying]); // Tambahkan isPlaying sebagai dependency
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
                <aside className={`bg-black flex-col hidden md:flex z-20 shrink-0 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
                    <div className="flex flex-col h-full pt-6 pb-4">
                        {/* Tombol Toggle */}
                        <div className="px-6 mb-8 flex items-center justify-between">
                            {isSidebarOpen && (
                                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                    Zaldien Music
                                </h1>
                            )}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-zinc-400 hover:text-white transition"
                            >
                                {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                            </button>
                        </div>

                        <div className="px-3">
                            <nav className="space-y-1">
                                <Link href={route("dashboard")}>
                                    <NavItem
                                        icon={<Home size={22} />}
                                        label={isSidebarOpen ? "Home" : ""}
                                        active={url.startsWith("/dashboard")}
                                    />
                                </Link>

                                <Link href={route("search")}>
                                    <NavItem
                                        icon={<Search size={22} />}
                                        label={isSidebarOpen ? "Search" : ""}
                                        active={url.startsWith("/search")}
                                    />
                                </Link>

                                <Link href={route("library")}>
                                    <NavItem
                                        icon={<Library size={22} />}
                                        label={isSidebarOpen ? "Your Library" : ""}
                                        active={url.startsWith("/library")}
                                    />
                                </Link>

                                <Link href={route("artists")}>
                                    <NavItem
                                        icon={<UserSearch size={22} />}
                                        label={isSidebarOpen ? "All Artists" : ""}
                                        active={url.startsWith("/artists")}
                                    />
                                </Link>
                            </nav>
                        </div>

                        {/* Sembunyikan bagian bawah jika sidebar tertutup agar rapi */}
                        {isSidebarOpen && (
                            <>
                                <div className="px-3 mt-8">
                                    <nav className="space-y-1">
                                        <NavItem icon={<PlusSquare size={22} />} label="Create Playlist" />
                                        <NavItem icon={<Heart size={22} />} label="Liked Songs" customIconColor="text-green-500" />
                                    </nav>
                                </div>
                                <div className="px-6 mt-4 mb-4"><div className="h-px bg-white/10 w-full" /></div>
                                <div className="px-6 flex-1 overflow-y-auto scrollbar-hide">
                                    <p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">Playlists</p>
                                    {/* List playlist kamu */}
                                </div>
                            </>
                        )}
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
                                ${showRightSidebar ? "w-[320px] opacity-100" : "w-0 opacity-0 border-l-0"}
                            `}
                >
                    {currentSong ? (
                        <>
                            {/* TAB BUTTON */}
                            <div className="p-5 pb-3">
                                <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => setRightTab("details")}
                                        className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${rightTab === "details"
                                            ? "bg-zinc-800 text-white shadow-sm"
                                            : "text-zinc-400 hover:text-white"
                                            }`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setRightTab("queue")}
                                        className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${rightTab === "queue"
                                            ? "bg-zinc-800 text-white shadow-sm"
                                            : "text-zinc-400 hover:text-white"
                                            }`}
                                    >
                                        Queue
                                    </button>
                                </div>
                            </div>

                            {/* DETAILS TAB */}
                            {rightTab === "details" && (
                                <div className="flex-1 overflow-y-auto scrollbar-hide pb-6">
                                    {/* COVER & INFO */}
                                    <div className="px-5 pt-2 pb-4">
                                        <div className="relative rounded-xl overflow-hidden shadow-2xl mb-5">
                                            <img
                                                src={currentSong.artist?.picture_xl || currentSong.album?.cover_medium}
                                                alt={currentSong.title}
                                                className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white line-clamp-2 leading-tight">
                                            {currentSong.title}
                                        </h2>
                                        {currentSong.explicit_lyrics == 1 && (
                                            <span className="text-[8px] font-black bg-zinc-700 text-zinc-300 px-1 rounded-sm border border-zinc-600">
                                                E
                                            </span>
                                        )}
                                        <Link
                                            href={`/artist/${currentSong.artist?.slug}`}
                                            className="text-zinc-400 hover:text-white hover:underline transition mt-1 inline-block"
                                        >
                                            {currentSong.artist?.name}
                                        </Link>
                                    </div>

                                    {/* ALBUM CARD (CLICKABLE) */}
                                    <div className="px-5 mb-6">
                                        <Link
                                            href={`/album/${currentSong.album?.slug}`}
                                            className="block bg-zinc-900/50 hover:bg-zinc-800 transition rounded-xl p-4 border border-white/5 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Kiri: Gambar */}
                                                <img
                                                    src={currentSong.album?.cover_xl}
                                                    alt="Album Cover"
                                                    className="w-12 h-12 rounded object-cover shadow-lg"
                                                />

                                                {/* Kanan: Title dan Name */}
                                                <div className="flex flex-col truncate">
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                                        Album
                                                    </p>
                                                    <h3 className="font-semibold text-white group-hover:text-accent transition truncate">
                                                        {currentSong.album?.title}
                                                    </h3>
                                                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                                        {currentSong.artist?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* LYRICS */}
                                    <div className="px-5">
                                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
                                            {/* 1. FANART BANNER (Visual Assets) */}
                                            {currentSong.artist?.strArtistFanart && (
                                                <div className="relative h-24 w-full bg-zinc-800">
                                                    <img
                                                        src={currentSong.artist.strArtistFanart}
                                                        alt="Artist Fanart"
                                                        className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
                                                    {/* Logo jika ada */}
                                                    {currentSong.artist?.strArtistLogo && (
                                                        <img
                                                            src={currentSong.artist.strArtistLogo}
                                                            alt="Artist Logo"
                                                            className="absolute bottom-2 left-4 h-8 object-contain drop-shadow-lg"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <div className={`p-5 ${currentSong.artist?.strArtistFanart ? 'pt-2' : ''}`}>
                                                {/* 2. HEADER & FACTS */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold text-white">About Artist</h3>
                                                    {currentSong.artist?.strCountry && (
                                                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                                                            <MapPin size={10} />
                                                            {currentSong.artist.strCountry}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 3. AI SCORING BADGES (Vibe, Genre, Style) */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {currentSong.artist?.strGenre && (
                                                        <span className="px-2 py-1 bg-white/10 text-zinc-300 text-[10px] rounded-md font-medium border border-white/5">
                                                            {currentSong.artist.strGenre}
                                                        </span>
                                                    )}
                                                    {currentSong.artist?.strMood && (
                                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded-md font-medium border border-green-500/20">
                                                            {currentSong.artist.strMood}
                                                        </span>
                                                    )}
                                                    {currentSong.artist?.strStyle && (
                                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-md font-medium border border-blue-500/20">
                                                            {currentSong.artist.strStyle}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 4. BIOGRAPHY */}
                                                {currentSong.artist?.strBiography ? (
                                                    <p className="text-xs text-zinc-400 line-clamp-4 leading-relaxed mb-4 hover:line-clamp-none transition-all duration-300 cursor-pointer">
                                                        {currentSong.artist.strBiography}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-zinc-600 mb-4 italic">Biography not available.</p>
                                                )}

                                                {/* 5. FOOTER: FACTS & SOCIAL MEDIA */}
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                                        {currentSong.artist?.intFormedYear && (
                                                            <span>Est. {currentSong.artist.intFormedYear}</span>
                                                        )}
                                                        {currentSong.artist?.intMembers > 1 && (
                                                            <span>{currentSong.artist.intMembers} Members</span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {currentSong.artist?.strWebsite && (
                                                            <a href={currentSong.artist.strWebsite} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="Website">
                                                                <Globe size={14} />
                                                            </a>
                                                        )}
                                                        {/* {currentSong.artist?.strFacebook && (
                                                            <a href={currentSong.artist.strFacebook} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-500 transition-colors" title="Facebook">
                                                                <Facebook size={14} />
                                                            </a>
                                                        )}
                                                        {currentSong.artist?.strTwitter && (
                                                            <a href={currentSong.artist.strTwitter} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-sky-400 transition-colors" title="Twitter">
                                                                <Twitter size={14} />
                                                            </a>
                                                        )} */}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* QUEUE TAB */}
                            {rightTab === "queue" && (
                                <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
                                    <h2 className="text-xl font-bold text-white mb-6">Queue</h2>

                                    {/* NOW PLAYING */}
                                    <div className="mb-8">
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                            Now Playing
                                        </p>
                                        <div className="flex items-center gap-4 bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                                            <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden">
                                                {/* Image with opacity applied to it only */}
                                                <img
                                                    src={currentSong.album?.cover_xl || currentSong.cover_small}
                                                    className="w-full h-full object-cover opacity-50"
                                                />

                                                {/* Equalizer bars, now separate from the image */}
                                                <div className="absolute inset-0 flex items-center justify-center gap-0.5 z-10">
                                                    <div className="w-1 h-3 bg-blue-500 rounded-full animate-[bounce_1s_infinite]" />
                                                    <div className="w-1 h-5 bg-blue-500 rounded-full animate-[bounce_1.2s_infinite]" />
                                                    <div className="w-1 h-2 bg-blue-500 rounded-full animate-[bounce_0.8s_infinite]" />
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-accent font-semibold truncate flex items-center gap-2">
                                                    {currentSong.title}
                                                    {currentSong.explicit_lyrics === 1 && (
                                                        <span className="text-[8px] font-black bg-zinc-700 text-zinc-300 px-1 rounded-sm border border-zinc-600">E</span>
                                                    )}
                                                </p>
                                                <p className="text-zinc-400 text-sm truncate">
                                                    {currentSong.artist?.name}
                                                </p>

                                            </div>
                                        </div>
                                    </div>

                                    {/* NEXT QUEUE */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                {isShuffle ? "AI Auto-Pilot" : "Next Up"}
                                            </p>
                                            {isShuffle && <Sparkles size={14} className="text-green-500 animate-pulse" />}
                                        </div>

                                        {isShuffle ? (
                                            /* TAMPILAN KETIKA AI AKTIF */
                                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 mt-2">
                                                <div className="relative mb-4">
                                                    {/* Efek glow di belakang ikon */}
                                                    <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full"></div>
                                                    <Sparkles className="relative text-green-500 animate-pulse" size={36} />
                                                </div>
                                                <h4 className="text-zinc-200 text-sm font-medium mb-1.5">
                                                    AI Vibe Matching
                                                </h4>
                                                <p className="text-zinc-500 text-xs leading-relaxed px-2">
                                                    Our intelligent DJ is analyzing your current track to curate the perfect next song based on mood, genre, and style.
                                                </p>
                                            </div>
                                        ) : (
                                            /* TAMPILAN NORMAL (STATIS) */
                                            <div className="space-y-1">
                                                {songs.slice(currentIndex + 1).map((song, index) => (
                                                    <div
                                                        key={song.id}
                                                        onClick={() => playSong(song, currentIndex + 1 + index)}
                                                        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                                    >
                                                        <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden">
                                                            <img
                                                                src={song.album?.cover_xl || song.cover_small}
                                                                className="w-full h-full object-cover transition-opacity group-hover:opacity-40"
                                                                alt="Cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Play size={16} className="text-white fill-white" />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-zinc-200 text-sm font-medium truncate group-hover:text-white">
                                                                {song.title}
                                                            </p>
                                                            <p className="text-zinc-500 text-xs truncate group-hover:text-zinc-400">
                                                                {song.artist?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Mic2 size={24} className="text-zinc-600" />
                            </div>
                            <p className="text-sm font-medium">Tidak ada lagu diputar</p>
                        </div>
                    )}
                </aside>
            </div>

            <footer className="hidden md:flex h-[90px] w-full shrink-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 px-6 items-center justify-between z-30">
                <PlayerInfo currentSong={currentSong} />

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
                    handleProgressRelease={handleProgressRelease}
                    progressPercent={progressPercent}
                    setIsDragging={setIsDragging}
                />

                <PlayerExtras
                    isLyricsMode={isLyricsMode}
                    handleMicClick={handleMicClick}
                    showRightSidebar={showRightSidebar}
                    setShowRightSidebar={setShowRightSidebar}
                    volume={volume}
                    setVolume={setVolume}
                    handleVolumeChange={handleVolumeChange}
                />
            </footer>
            {/* KOMPONEN MOBILE (Sudah benar seperti yang kita bahas tadi) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col">
                {url !== '/PlayerMini' && url !== '/LyricsMini' && <MobileMiniPlayer />}
                <MobileBottomNav />
            </div>
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
