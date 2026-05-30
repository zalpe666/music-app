import { useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Head, Link } from "@inertiajs/react";
import { Play, ListMusic, Compass } from "lucide-react";

const Show = ({ genreName, songs = [], artists = [] }) => {
    const { playSong, setPlaylist, currentSong } = usePlayerStore();

    // Masukkan lagu ke global state saat halaman dimuat
    useEffect(() => {
        if (songs.length > 0) {
            setPlaylist(songs);
        }
    }, [songs]);

    return (
        <div className="pb-32 text-white">
            <Head title={`${genreName} Music - Zaldien Music`} />

            {/* HEADER GENRE */}
            <div className="bg-gradient-to-b from-indigo-900/80 to-zinc-900 p-8 pt-24 pb-12 flex flex-col items-start gap-4">
                <Compass size={48} className="text-indigo-400 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                    Genre Explore
                </span>
                <h1 className="text-6xl md:text-8xl font-black tracking-tight capitalize">
                    {genreName}
                </h1>
                <p className="text-zinc-300 mt-2">
                    {songs.length} Tracks • {artists.length} Artists
                </p>

                {/* Tombol Play All */}
                <button
                    onClick={() => songs.length > 0 && playSong(songs[0], 0)}
                    disabled={songs.length === 0}
                    className="mt-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-green-400 transition-all shadow-xl disabled:opacity-50"
                >
                    <Play fill="currentColor" size={32} className="ml-1" />
                </button>
            </div>

            <div className="px-4 md:px-8 space-y-12 mt-8">
                {/* DAFTAR LAGU */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <ListMusic size={24} className="text-zinc-500" />
                        Top {genreName} Tracks
                    </h2>

                    {songs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {songs.map((song, index) => {
                                const isPlaying = currentSong?.id === song.id;

                                return (
                                    <div
                                        key={song.id}
                                        onClick={() => playSong(song, index)}
                                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${isPlaying ? "bg-white/10" : "bg-zinc-800/30 hover:bg-zinc-700/50"
                                            }`}
                                    >
                                        <div className="relative w-14 h-14 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                                            <img src={song.album?.cover_xl || song.cover_small} className="w-full h-full object-cover" alt={song.title} />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Play size={20} className="text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold truncate text-base ${isPlaying ? "text-green-500" : "text-white"}`}>
                                                {song.title}
                                            </p>
                                            <p className="text-sm text-zinc-400 truncate mt-0.5">
                                                {song.artist?.name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-500">Belum ada lagu untuk genre ini.</p>
                    )}
                </section>

                {/* ARTIS TERKAIT (Opsional) */}
                {artists.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Popular {genreName} Artists</h2>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {artists.map((artist) => (
                                <Link href={`/artist/${artist.slug}`} key={artist.id} className="flex flex-col items-center gap-3 min-w-[120px] group">
                                    <img
                                        src={artist.picture_xl || '/default-artist.jpg'}
                                        className="w-32 h-32 rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform"
                                        alt={artist.name}
                                    />
                                    <p className="text-white font-medium group-hover:text-green-400 transition-colors text-center w-full truncate">
                                        {artist.name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

Show.layout = (page) => <AppLayout>{page}</AppLayout>;
export default Show;