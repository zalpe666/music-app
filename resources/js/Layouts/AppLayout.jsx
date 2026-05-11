import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2, Home, Search, Library } from "lucide-react";
import { useState, useEffect } from "react";

// 1. TANGKAP isLyricsMode dan setIsLyricsMode
export default function AppLayout({ children, audioRef, currentTime, setCurrentTime, setIsDragging, song, isLyricsMode, setIsLyricsMode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.readyState >= 1) setDuration(audio.duration);

        const setAudioData = () => setDuration(audio.duration);
        const setAudioPlay = () => setIsPlaying(true);
        const setAudioPause = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('play', setAudioPlay);
        audio.addEventListener('pause', setAudioPause);
        audio.volume = volume;

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('play', setAudioPlay);
            audio.removeEventListener('pause', setAudioPause);
        };
    }, [audioRef]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play().catch(e => console.log("Play error:", e));
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
    };

    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        if (setCurrentTime) setCurrentTime(newTime);
    };

    const handleProgressRelease = (e) => {
        const newTime = parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = newTime;
        if (setIsDragging) setIsDragging(false);
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
                {/* 2. SIDEBAR ANIMATION: Jika isLyricsMode true, geser ke kiri (-ml-64) */}
                <aside className={`w-64 bg-black border-r border-white/5 flex-col hidden md:flex z-20 shrink-0 transition-all duration-700 ease-in-out ${isLyricsMode ? '-ml-64 opacity-0 border-transparent' : 'ml-0 opacity-100'}`}>
                    <div className="p-8 w-64">
                        <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-10 tracking-tight">
                            ZalpeMusic
                        </h1>
                        <nav className="space-y-6">
                            <NavItem icon={<Home size={22} />} label="Home" active />
                            <NavItem icon={<Search size={22} />} label="Search" />
                            <NavItem icon={<Library size={22} />} label="Library" />
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 relative overflow-y-auto scrollbar-hide bg-zinc-950">
                    {children}
                </main>
            </div>

            <footer className="h-[90px] w-full shrink-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 px-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-4 w-1/3">
                    {song && (
                        <>
                            <div className="relative overflow-hidden rounded-md h-14 w-14 group cursor-pointer shrink-0">
                                <img src={song.cover} className="w-full h-full object-cover group-hover:opacity-80 transition" alt="Cover" />
                            </div>
                            <div className="truncate flex flex-col justify-center">
                                <p className="font-bold text-sm text-white hover:underline cursor-pointer truncate">{song.title}</p>
                                <p className="text-[11px] text-zinc-400 hover:text-white cursor-pointer transition truncate mt-0.5">{song.artist}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col items-center w-1/3 max-w-xl">
                    <div className="flex items-center gap-6 mb-2">
                        <button className="text-zinc-400 hover:text-white transition cursor-pointer">
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                        >
                            {isPlaying ? <Pause size={18} className="text-black fill-current" /> : <Play size={18} className="text-black fill-current ml-1" />}
                        </button>
                        <button className="text-zinc-400 hover:text-white transition cursor-pointer">
                            <SkipForward className="w-5 h-5 fill-current" />
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
                                onMouseDown={() => setIsDragging && setIsDragging(true)}
                                onTouchStart={() => setIsDragging && setIsDragging(true)}
                                onChange={handleProgressChange}
                                onMouseUp={handleProgressRelease}
                                onTouchEnd={handleProgressRelease}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute inset-0 w-full h-1 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                                <div className="h-full bg-white group-hover:bg-green-500 transition-colors" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <div className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 -ml-1.5" style={{ left: `${progressPercent}%` }} />
                        </div>

                        <span className="text-[11px] text-zinc-400 tabular-nums min-w-[35px]">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 w-1/3 text-zinc-400">
                    {/* 3. TOMBOL MIC: Event toggle untuk mengaktifkan/mematikan isLyricsMode */}
                    <button 
                        onClick={() => song?.lyrics_url && setIsLyricsMode(!isLyricsMode)}
                        className={`transition hover:text-white ${song?.lyrics_url ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    >
                        <Mic2 size={18} className={isLyricsMode ? "text-green-500" : ""} />
                    </button>
                    <div className="flex items-center gap-2 relative w-24 group">
                        <button onClick={() => handleVolumeChange({ target: { value: volume === 0 ? 1 : 0 } })} className="hover:text-white transition">
                            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <div className="relative flex-1 h-1 flex items-center">
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={volume} onChange={handleVolumeChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                                <div className="h-full bg-white group-hover:bg-green-500 transition-colors" style={{ width: `${volume * 100}%` }} />
                            </div>
                            <div className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 -ml-1.5" style={{ left: `${volume * 100}%` }} />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavItem({ icon, label, active = false }) {
    return (
        <div className={`flex items-center gap-4 cursor-pointer transition-colors duration-200 ${active ? "text-white" : "text-zinc-400 hover:text-white"}`}>
            {icon}
            <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </div>
    );
}