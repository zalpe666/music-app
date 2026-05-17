import { useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";

const Dashboard = ({ songs = [] }) => {
    const { playSong, setPlaylist } = usePlayerStore();

    useEffect(() => {
        if (songs.length > 0) {
            setPlaylist(songs);
        }
    }, [songs]);

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Jump Back In</h2>
            <div className="grid grid-cols-1 gap-4">
                {songs.map((song, index) => (
                    <div
                        key={song.id}
                        onClick={() => playSong(song, index)}
                        className="flex items-center gap-4 p-3 rounded-md hover:bg-white/10 cursor-pointer"
                    >
                        <img
                            src={song.album?.cover_medium || song.cover_small}
                            className="w-12 h-12 rounded object-cover"
                            alt={song.title}
                        />
                        <div>
                            <p className="text-white font-medium">
                                {song.title}
                            </p>
                            <p className="text-zinc-400 text-sm">
                                {song.artist?.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// PERSISTENT LAYOUT
Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Dashboard;
