import { useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Play, Shuffle, Clock3 } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Artist({ artist, songs }) {
    const { setPlaylist, playSong, isPlaying, currentSong, togglePlay } = usePlayerStore();

    useEffect(() => {
        setPlaylist(songs);
    }, [songs]);

    // Format durasi
    const formatTime = (time) => {
        if (!time) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    // Mengambil album unik dari daftar lagu
    const albums = Array.from(new Set(songs.map((s) => s.album?.id)))
        .map((id) => songs.find((s) => s.album?.id === id)?.album)
        .filter(Boolean);

    return (
        <div className="w-full">
            {/* HERO SECTION ARTIST */}
            <div
                className="relative w-full h-[40vh] min-h-[350px] flex items-end p-8 md:p-12"
                style={{
                    backgroundImage: `url(${artist.picture_xl || artist.picture_medium})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center 30%", // Fokus ke wajah artis (agak ke atas)
                }}
            >
                {/* Gradasi Gelap agar teks terbaca dan menyatu dengan background bawah */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/20" />

                {/* Teks Content (Z-10 agar berada di atas gradasi) */}
                <div className="relative z-10 flex flex-col gap-2 w-full">

                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                        {artist.name}
                    </h1>

                    <p className="text-lg text-zinc-300 font-medium drop-shadow-md mt-2">
                        {songs.length} tracks available
                    </p>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="px-8 py-6 flex items-center gap-6">
                <button
                    onClick={() => playSong(songs[0], 0)}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-zinc-100 transition-all shadow-lg shadow-white/10"
                >
                    <Play className="text-black fill-black ml-1" size={24} />
                </button>
            </div>

            {/* SONG LIST */}
            <div className="px-8 pb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Popular Tracks</h2>

                <div className="grid grid-cols-[16px_1fr_auto_auto] md:grid-cols-[16px_1fr_2fr_auto] gap-4 text-zinc-400 text-sm px-4 mb-3">
                    <span>#</span>
                    <span>Title</span>
                    <span className="hidden md:block">Album</span>
                    <span className="flex justify-end"><Clock3 size={16} /></span>
                </div>

                <div className="space-y-1">
                    {songs.map((song, index) => (
                        <div
                            key={song.id}
                            onClick={() => playSong(song, index)}
                            className="grid grid-cols-[16px_1fr_auto_auto] md:grid-cols-[16px_1fr_2fr_auto] gap-4 items-center p-3 rounded hover:bg-white/10 cursor-pointer group"
                        >
                            <span className="text-zinc-500 group-hover:text-white">{index + 1}</span>
                            <div className="flex items-center gap-4">
                                <img src={song.album?.cover_small} className="w-10 h-10 rounded" />
                                <span className={`font-medium ${currentSong?.id === song.id ? 'text-accent' : 'text-white'}`}>
                                    {song.title}
                                </span>
                                {song.explicit_lyrics == 1 && (
                                    <span className="text-[8px] font-black bg-zinc-700 text-zinc-300 px-1 rounded-sm border border-zinc-600">
                                        E
                                    </span>
                                )}
                            </div>
                            <span className="hidden md:block text-zinc-400 hover:text-white truncate">
                                {song.album?.title}
                            </span>
                            <span className="text-zinc-400 tabular-nums">
                                {formatTime(song.duration)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ALBUMS SECTION */}
            <div className="px-8 pb-20">
                <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {albums.map((album) => (
                        <Link
                            key={album.id}
                            href={`/album/${album.slug}`}
                            className="block bg-zinc-900/50 p-4 rounded-lg hover:bg-zinc-800 transition cursor-pointer group"
                        >
                            <img
                                src={album.cover_medium}
                                className="w-full aspect-square object-cover rounded-md mb-4 shadow-lg"
                                alt={album.title}
                            />
                            <h3 className="font-semibold text-white truncate">{album.title}</h3>
                            <p className="text-zinc-400 text-sm">{artist.name}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

Artist.layout = (page) => <AppLayout>{page}</AppLayout>;