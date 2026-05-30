import { useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Head, Link, usePage } from "@inertiajs/react";
import { Play, Clock, MoreHorizontal, ListMusic } from "lucide-react";

const Show = ({ playlist }) => {
    const { auth } = usePage().props;
    // Ambil daftar lagu, beri default array kosong jika tidak ada
    const songs = playlist.songs || [];

    const {
        currentSong,
        playSong,
        setPlaylist,
    } = usePlayerStore();

    // Memasukkan daftar lagu ke global store agar bisa di-play
    useEffect(() => {
        if (songs.length > 0) {
            setPlaylist(songs);
        }
    }, [songs, setPlaylist]);

    return (
        <div className="pb-12 text-zinc-100">
            <Head title={`${playlist.name} - Zaldien Music`} />

            {/* HEADER PLAYLIST */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-zinc-700/80 to-transparent p-8 pt-20">

                {/* COVER DINAMIS */}
                <div className="w-48 h-48 bg-zinc-800 shadow-2xl flex items-center justify-center rounded-xl shrink-0 overflow-hidden">
                    {songs.length >= 4 ? (
                        /* Grid 2x2 untuk 4 lagu atau lebih */
                        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                            {songs.slice(0, 4).map((song, i) => (
                                <img
                                    key={i}
                                    src={song.album?.cover_xl || song.cover_small || "/default-cover.png"}
                                    alt="Playlist Cover Component"
                                    className="w-full h-full object-cover"
                                />
                            ))}
                        </div>
                    ) : songs.length > 0 ? (
                        /* Full cover dari lagu pertama jika 1-3 lagu */
                        <img
                            src={songs[0].album?.cover_xl || songs[0].cover_small || "/default-cover.png"}
                            alt={playlist.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        /* Ikon ListMusic jika playlist kosong */
                        <ListMusic size={64} className="text-zinc-500" />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                        Playlist
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-2 truncate">
                        {playlist.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <span className="font-bold text-white">By : {auth.user ? auth.user.name : 'Guest'}</span>
                        <span>•</span>
                        <span>{songs.length} {songs.length === 1 ? 'lagu' : 'lagu'}</span>
                    </div>
                </div>
            </div>

            {/* ACTION BAR (Tombol Play) */}
            <div className="px-8 py-6 flex items-center gap-6">
                <button
                    onClick={() => songs.length > 0 && playSong(songs[0], 0)}
                    disabled={songs.length === 0}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-green-400 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play fill="currentColor" size={28} className="ml-1" />
                </button>
                <button className="text-zinc-400 hover:text-white transition-colors">
                    <MoreHorizontal size={32} />
                </button>
            </div>

            {/* DAFTAR LAGU */}
            <div className="px-8">
                {/* Header Tabel */}
                <div className="grid grid-cols-[50px_minmax(200px,_1fr)_minmax(150px,_200px)_minmax(120px,_1fr)_50px] gap-4 px-4 py-2 text-sm font-medium text-zinc-400 border-b border-white/10 mb-4 sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10">
                    <div>#</div>
                    <div>Title</div>
                    <div>Album</div>
                    <div>Date Added</div>
                    <div className="flex justify-end"><Clock size={16} /></div>
                </div>

                {/* Isi Lagu */}
                {songs.length > 0 ? (
                    <div className="space-y-1">
                        {songs.map((song, index) => {
                            const isCurrentPlaying = currentSong?.id === song.id;

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => playSong(song, index)}
                                    className={`grid grid-cols-[50px_minmax(200px,_1fr)_minmax(150px,_200px)_minmax(120px,_1fr)_50px] gap-4 px-4 py-3 text-sm rounded-md group items-center transition-colors cursor-pointer ${isCurrentPlaying ? "bg-white/10" : "hover:bg-white/5 text-zinc-400"
                                        }`}
                                >
                                    <div className="w-5 relative flex items-center">
                                        <span className={`group-hover:hidden ${isCurrentPlaying ? "text-green-500 font-bold" : ""}`}>
                                            {index + 1}
                                        </span>
                                        <Play
                                            size={16}
                                            fill="currentColor"
                                            className={`hidden group-hover:block absolute left-0 ${isCurrentPlaying ? "text-green-500" : "text-white"}`}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 truncate">
                                        <img
                                            src={song.album?.cover_xl || song.cover_small}
                                            alt={song.title}
                                            className="w-10 h-10 rounded shadow object-cover shrink-0"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className={`truncate text-base ${isCurrentPlaying ? "text-green-500 font-medium" : "text-white font-medium"}`}>
                                                {song.title}
                                            </span>
                                            <Link
                                                href={`/artist/${song.artist?.slug}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="truncate hover:underline text-zinc-400 text-sm"
                                            >
                                                {song.artist?.name}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="truncate group-hover:text-white transition-colors">
                                        {song.album?.title || '-'}
                                    </div>
                                    <div className="truncate">{song.added_at}</div>
                                    <div className="text-right group-hover:text-white transition-colors">3:45</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
                        <ListMusic size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-white mb-2">Playlist ini masih kosong</h3>
                        <p className="text-sm">Ayo tambahkan lagu favoritmu ke playlist ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// WAJIB ADA DI BAWAH AGAR MASUK KE {main} AppLayout
Show.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Show;