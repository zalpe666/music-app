import { useState, useEffect, useRef } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import usePlayerStore from "@/Stores/playerStore";

// Komponen Mobile (Sudah ada)
import MobileBottomNav from "@/Components/MobileBottomNav";
import MobileMiniPlayer from "@/Components/MobileMiniPlayer";

// Komponen Layout Baru Hasil Refactor
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import DesktopFooter from "./DesktopFooter";

export default function AppLayout({ children }) {
    const { url } = usePage();
    const scrollContainerRef = useRef(null);
    const audioRef = useRef(null);

    // STATE LOKAL
    const [isLoading, setIsLoading] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const [rightTab, setRightTab] = useState("details");
    const [parsedLyrics, setParsedLyrics] = useState([]);
    const [loadingLyrics, setLoadingLyrics] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // ZUSTAND STORE
    const {
        currentSong, isPlaying, currentTime, duration, isLyricsMode,
        setIsLyricsMode, setCurrentTime, setDuration, nextSong, prevSong,
        togglePlay, songs, currentIndex, playSong, isShuffle, toggleShuffle
    } = usePlayerStore();

    // 1. Reset scroll saat URL berubah
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [url]);

    // 2. Format & Parse Lirik
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

    // 3. Effect Fetch Lyrics
    useEffect(() => {
        if (currentSong?.lyrics_path) {
            setLoadingLyrics(true);
            axios.get(`/lyrics/${currentSong.lyrics_path}`)
                .then((res) => {
                    const lrcData = parseLRC(res.data);
                    setParsedLyrics(lrcData.length > 0 ? lrcData : [{ time: 0, text: res.data }]);
                    setLoadingLyrics(false);
                })
                .catch(() => {
                    setParsedLyrics([{ time: 0, text: "Lirik tidak dapat dimuat." }]);
                    setLoadingLyrics(false);
                });
        }
    }, [currentSong]);

    // 4. Logic Audio & Streaming
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => { if (!isPlaying) togglePlay(); };
        const handlePause = () => { if (isPlaying) togglePlay(); };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [isPlaying]);

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
                if (isPlaying) await audioRef.current.play();
                else audioRef.current.pause();
            } catch (e) {
                console.log("Autoplay dicegat browser, tombol Pause akan muncul.");
                if (isPlaying) togglePlay();
            }
        };
        playAudio();
    }, [currentSong, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onCanPlay = () => {
            setIsLoading(false);
            if (isPlaying && audio.paused) {
                audio.play().catch(() => { if (isPlaying) togglePlay(); });
            }
        };
        audio.addEventListener('canplay', onCanPlay);
        return () => audio.removeEventListener('canplay', onCanPlay);
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    // 5. Handlers (Progress, Volume, Mic)
    const handleMicClick = () => {
        if (url !== "/player") {
            setIsLyricsMode(true);
            router.visit(route("player"));
            return;
        }
        setIsLyricsMode(!isLyricsMode);
    };

    useEffect(() => {
        if (url !== "/player" && isLyricsMode) setIsLyricsMode(false);
    }, [url]);

    const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));

    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (audioRef.current) audioRef.current.currentTime = newTime;
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

                {/* KIRI: SIDEBAR NAV */}
                <SidebarLeft
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    url={url}
                />

                {/* TENGAH: MAIN CONTENT */}
                <main
                    ref={scrollContainerRef}
                    className="flex-1 relative overflow-y-auto scrollbar-hide bg-zinc-950"
                >
                    {children}
                </main>

                {/* KANAN: DETAILS & QUEUE */}
                <SidebarRight
                    showRightSidebar={showRightSidebar}
                    currentSong={currentSong}
                    rightTab={rightTab}
                    setRightTab={setRightTab}
                    isShuffle={isShuffle}
                    songs={songs}
                    currentIndex={currentIndex}
                    playSong={playSong}
                />
            </div>

            {/* BAWAH: DESKTOP FOOTER PLAYER */}
            <DesktopFooter
                currentSong={currentSong} prevSong={prevSong} togglePlay={togglePlay}
                nextSong={nextSong} toggleShuffle={toggleShuffle} isShuffle={isShuffle}
                isPlaying={isPlaying} isLoading={isLoading} currentTime={currentTime}
                duration={duration} formatTime={formatTime}
                handleProgressChange={handleProgressChange} handleProgressRelease={handleProgressRelease}
                progressPercent={progressPercent} setIsDragging={setIsDragging}
                isLyricsMode={isLyricsMode} handleMicClick={handleMicClick}
                showRightSidebar={showRightSidebar} setShowRightSidebar={setShowRightSidebar}
                volume={volume} setVolume={setVolume} handleVolumeChange={handleVolumeChange}
            />

            {/* KOMPONEN MOBILE */}
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
                    if (currentTime) e.target.currentTime = currentTime;
                }}
                onEnded={nextSong}
            />
        </div>
    );
}