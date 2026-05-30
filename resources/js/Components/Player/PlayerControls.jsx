import { Play, Pause, SkipBack, SkipForward, Sparkles, Repeat } from "lucide-react";

export default function PlayerControls({
    prevSong, togglePlay, nextSong, toggleShuffle, isShuffle, isPlaying, isLoading,
    currentTime, duration, formatTime, handleProgressChange, handleProgressRelease,
    progressPercent, setIsDragging
}) {
    return (
        <div className="flex flex-col items-center w-full md:w-1/3 max-w-xl mx-auto">

            {/* Tombol Playback */}
            <div className="flex items-center gap-8 md:gap-6 mb-4 md:mb-2">

                {/* DUMMY: Tombol Repeat (Penyeimbang Shuffle) */}
                <button className="text-zinc-300 hover:text-white transition cursor-pointer">
                    <Repeat className="w-6 h-6 md:w-[18px] md:h-[18px]" />
                </button>

                <button onClick={prevSong} className="text-zinc-300 hover:text-white transition cursor-pointer">
                    <SkipBack className="w-8 h-8 md:w-5 md:h-5 fill-current" />
                </button>

                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-16 h-16 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 md:w-4 md:h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-8 h-8 md:w-[18px] md:h-[18px] text-black fill-current" />
                    ) : (
                        <Play className="w-8 h-8 md:w-[18px] md:h-[18px] text-black fill-current" />
                    )}
                </button>

                <button onClick={nextSong} className="text-zinc-300 hover:text-white transition cursor-pointer">
                    <SkipForward className="w-8 h-8 md:w-5 md:h-5 fill-current" />
                </button>

                <button onClick={toggleShuffle} className={`transition ${isShuffle ? "text-green-500" : "text-zinc-300 hover:text-white"} cursor-pointer`}>
                    <Sparkles className="w-6 h-6 md:w-[18px] md:h-[18px]" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-3 md:gap-2 group">
                <span className="text-xs md:text-[11px] text-zinc-400 tabular-nums min-w-[40px] text-right">
                    {formatTime(currentTime)}
                </span>

                <div className="relative flex-1 h-2 md:h-1 flex items-center cursor-pointer">
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        step="0.01"
                        value={currentTime || 0}
                        onMouseDown={() => setIsDragging?.(true)}
                        onTouchStart={() => setIsDragging?.(true)}
                        onChange={handleProgressChange}
                        onMouseUp={handleProgressRelease}
                        onTouchEnd={handleProgressRelease}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    {/* Track Background */}
                    <div className="absolute inset-0 w-full h-2 md:h-1 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                        <div className="h-full bg-white transition-colors" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div
                        className="absolute h-4 w-4 md:h-3 md:w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 -ml-2 md:-ml-1.5"
                        style={{ left: `${progressPercent}%` }}
                    />
                </div>

                <span className="text-xs md:text-[11px] text-zinc-400 tabular-nums min-w-[40px]">
                    {formatTime(duration)}
                </span>
            </div>

        </div>
    );
}