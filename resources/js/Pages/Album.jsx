import { useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Play, Clock3 } from "lucide-react";

export default function Album({ album, songs, artist }) {
    const { setPlaylist, playSong, currentSong } = usePlayerStore();

    useEffect(() => {
        setPlaylist(songs);
    }, [songs]);

    const formatTime = (time) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <div className="relative p-8 pb-12 bg-gradient-to-b from-zinc-800 to-zinc-950 flex flex-col md:flex-row items-end gap-6">
                <img
                    src={album.cover_xl || album.cover_medium}
                    className="w-48 h-48 md:w-56 md:h-56 shadow-2xl object-cover rounded-md"
                />
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Album</p>
                    <h1 className="text-4xl md:text-6xl font-black text-white">{album.title}</h1>
                    <div className="flex items-center gap-2 text-zinc-300">
                        <img src={artist.picture_small} className="w-6 h-6 rounded-full" />
                        <span className="font-semibold text-white">{artist.name}</span>
                        <span>• {songs.length} songs</span>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="px-8 py-6">
                <button
                    onClick={() => playSong(songs[0], 0)}
                    className="w-14 h-14 bg-accent rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                    <Play className="text-black fill-black ml-1" size={24} />
                </button>
            </div>

            {/* SONG LIST */}
            <div className="px-8 pb-12">
                <div className="grid grid-cols-[16px_1fr_auto] gap-4 text-zinc-400 text-sm px-4 mb-3">
                    <span>#</span>
                    <span>Title</span>
                    <span className="flex justify-end"><Clock3 size={16} /></span>
                </div>

                <div className="space-y-1">
                    {songs.map((song, index) => (
                        <div
                            key={song.id}
                            onClick={() => playSong(song, index)}
                            className="grid grid-cols-[16px_1fr_auto] gap-4 items-center p-3 rounded hover:bg-white/10 cursor-pointer group"
                        >
                            <span className="text-zinc-500 group-hover:text-white">{index + 1}</span>
                            <span className={`font-medium ${currentSong?.id === song.id ? 'text-accent' : 'text-white'}`}>
                                {song.title}
                            </span>
                            <span className="text-zinc-400 tabular-nums">
                                {formatTime(song.duration)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

Album.layout = (page) => <AppLayout>{page}</AppLayout>;