import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";

const Search = ({ songs = [] }) => {
    // Beri default array kosong jaga-jaga
    const {
        currentSong,
        playSong,
        setPlaylist, // <-- GANTI setSongs JADI setPlaylist
    } = usePlayerStore();

    const [search, setSearch] = useState("");

    useEffect(() => {
        if (songs.length > 0) {
            setPlaylist(songs); // <-- GANTI setSongs JADI setPlaylist
        }
    }, [songs]);

    const filteredSongs = songs.filter((song) => {
        return (
            song.title.toLowerCase().includes(search.toLowerCase()) ||
            song.artist?.name?.toLowerCase().includes(search.toLowerCase()) ||
            (song.album &&
                song.album?.title?.toLowerCase().includes(search.toLowerCase()))
        );
    });

    // PERHATIKAN: Kita TIDAK LAGI menggunakan <AppLayout> di sini
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white">Search</h1>
                <p className="text-zinc-400 mt-2">Browse your favorite music</p>
            </div>

            {/* SEARCH INPUT */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-full md:w-[500px] bg-zinc-800 border border-zinc-700 rounded-full px-6 py-4 text-white focus:outline-none focus:border-green-500"
            />

            {/* RESULT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
                {filteredSongs.length > 0 ? (
                    filteredSongs.map((song, index) => (
                        <div
                            key={song.id}
                            onClick={() => playSong(song, index)}
                            className="bg-zinc-900 hover:bg-zinc-800 transition rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                        >
                            <img
                                src={song.album?.cover_medium || song.cover_small}
                                alt={song.title}
                                className="w-20 h-20 rounded-xl object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-white font-bold text-lg truncate">
                                    {song.title}
                                </h2>
                                <p className="text-zinc-400 text-sm truncate">
                                    {song.artist?.name}
                                </p>
                                <p className="text-zinc-500 text-xs mt-1 truncate">
                                    {song.album?.title}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-zinc-500 col-span-full">
                        No songs found
                    </div>
                )}
            </div>
        </div>
    );
};

// INI KUNCI UTAMANYA: Menggunakan Persistent Layout dari Inertia
// Ini akan membuat AppLayout (dan tag audio di dalamnya) tidak pernah dihancurkan
Search.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Search;
