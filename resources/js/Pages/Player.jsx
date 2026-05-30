import { Head } from "@inertiajs/react"; // Tambahkan ini
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";

// Import komponen yang sudah kita pisah
import PlayerBackground from "@/Components/Player/PlayerBackground";
import PlayerCover from "@/Components/Player/PlayerCover";
import PlayerLyrics from "@/Components/Player/PlayerLyrics";

const Player = () => {
    const { currentSong, currentTime, isLyricsMode } = usePlayerStore();

    if (!currentSong) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-500">
                No song playing
            </div>
        );
    }

    return (
        <>
            <Head title={currentSong ? `${currentSong.title} - Zaldien Music` : "Zaldien Music"} />

            <div className="relative h-full overflow-hidden flex flex-col md:flex-row">
                <PlayerBackground coverUrl={currentSong.album?.cover_xl} />

                <PlayerCover
                    currentSong={currentSong}
                    isLyricsMode={isLyricsMode}
                />

                <PlayerLyrics
                    currentSong={currentSong}
                    currentTime={currentTime}
                    isLyricsMode={isLyricsMode}
                />
            </div>
        </>
    );
};

// Menggunakan Persistent Layout
Player.layout = (page) => <AppLayout>{page}</AppLayout>;
export default Player;