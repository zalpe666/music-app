import { Play, Pause, SkipForward } from "lucide-react";
import usePlayerStore from "@/Stores/playerStore";
import { router } from "@inertiajs/react";

export default function MobileMiniPlayer() {
    const { currentSong, isPlaying, togglePlay, nextSong, currentTime, duration } = usePlayerStore();

    if (!currentSong) return null;

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    // Fungsi untuk navigasi ke halaman Player
    const openPlayer = () => {
        router.visit('/PlayerMini'); // Mengarah ke halaman baru
    };

    return (
        <div
            onClick={openPlayer}
            className="bg-zinc-900 border-t border-white/5 mx-2 mb-2 rounded-md overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform"
        >
            <div className="flex items-center justify-between p-2">
                {/* INFO LAGU */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden">
                        <img
                            src={currentSong.album?.cover_xl || currentSong.cover_small}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col truncate">
                        <p className="text-white text-sm font-semibold truncate">
                            {currentSong.title}
                        </p>
                        <p className="text-zinc-400 text-xs truncate">
                            {currentSong.artist?.name}
                        </p>
                    </div>
                </div>

                {/* KONTROL */}
                <div className="flex items-center gap-2 px-2 shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Mencegah card ikut terklik
                            togglePlay();
                        }}
                        className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Mencegah card ikut terklik
                            nextSong();
                        }}
                        className="text-zinc-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <SkipForward size={22} className="fill-current" />
                    </button>
                </div>
            </div>

            {/* PROGRESS BAR TIPIS */}
            <div className="h-[2px] bg-zinc-800 w-full">
                <div
                    className="h-full bg-white transition-all duration-300 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}