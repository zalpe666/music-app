import { Mic2, PanelRightClose, PanelRightOpen, Volume2, VolumeX } from "lucide-react";

export default function PlayerExtras({
    isLyricsMode, handleMicClick, showRightSidebar, setShowRightSidebar,
    volume, setVolume, handleVolumeChange
}) {
    return (
        <div className="flex items-center justify-end gap-4 w-1/3 text-zinc-400">
            {/* Tombol Lirik */}
            <button 
                onClick={handleMicClick} 
                className={`transition hover:text-white ${isLyricsMode ? "text-green-500" : ""}`}
            >
                <Mic2 size={18} />
            </button>
            
            {/* Tombol Sidebar Kanan */}
            <button 
                onClick={() => setShowRightSidebar(!showRightSidebar)} 
                className="hover:text-white transition"
            >
                {showRightSidebar ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>

            {/* SLIDER VOLUME */}
            <div className="flex items-center gap-2 relative w-24 group">
                <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="hover:text-white transition">
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
                    {/* Track Background */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                        <div
                            className="h-full bg-white group-hover:bg-green-500 transition-colors"
                            style={{ width: `${volume * 100}%` }}
                        />
                    </div>
                    {/* Thumb (Bulatan) */}
                    <div
                        className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 -ml-1.5"
                        style={{ left: `${volume * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}