import PlayerInfo from "@/Components/Player/PlayerInfo";
import PlayerControls from "@/Components/Player/PlayerControls";
import PlayerExtras from "@/Components/Player/PlayerExtras";

export default function DesktopFooter({
    currentSong, prevSong, togglePlay, nextSong, toggleShuffle, isShuffle,
    isPlaying, isLoading, currentTime, duration, formatTime,
    handleProgressChange, handleProgressRelease, progressPercent, setIsDragging,
    isLyricsMode, handleMicClick, showRightSidebar, setShowRightSidebar,
    volume, setVolume, handleVolumeChange
}) {
    return (
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
    );
}