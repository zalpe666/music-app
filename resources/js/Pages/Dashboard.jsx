import { useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Link } from "@inertiajs/react";
import { Play, Database, Activity, Mic2, ListMusic, Zap, Disc } from "lucide-react"; // Tambahkan ikon Disc

const Dashboard = ({ songs = [] }) => {
    const {
        playSong,
        setPlaylist,
        setAllSongs,
        isAlbumMode, // pastikan state ini sudah ada di dalam object store
        getRecommendations, currentSong
    } = usePlayerStore();
    const recommendations = getRecommendations(5); // Ambil 5 lagu rekomendasi
    useEffect(() => {
        if (songs.length > 0) {
            setPlaylist(songs);
            setAllSongs(songs);
        }
    }, [songs]);

    // Ekstrak artis unik dari daftar lagu
    const uniqueArtists = Array.from(
        new Map(songs.map(song => [song.artist?.id || song.artist?.name, song.artist])).values()
    ).filter(Boolean).slice(0, 6);

    // Ekstrak album unik dari daftar lagu
    const uniqueAlbums = Array.from(
        new Map(songs.map(song => [song.album?.id || song.album?.title, song.album])).values()
    ).filter(Boolean).slice(0, 6);

    // Mockup Playlist
    const curatedPlaylists = [
        { id: 1, title: "Deep Focus", desc: "No vocals, pure flow.", color: "from-blue-900 to-black" },
        { id: 2, title: "Late Night Code", desc: "Lo-Fi and chill beats.", color: "from-purple-900 to-black" },
        { id: 3, title: "System Overload", desc: "High energy tracks.", color: "from-emerald-900 to-black" }
    ];

    return (
        <div className="p-6 md:p-8 space-y-12">
            {/* HERO SECTION */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mb-2 tracking-tight">
                        System Ready.
                    </h1>
                    <p className="text-zinc-400 flex items-center gap-2 text-sm font-medium">
                        <Activity size={16} className="text-green-500 animate-pulse" />
                        Audio engine active. {songs.length} tracks indexed.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition flex items-center gap-2">
                        <Play size={16} className="fill-black" /> Play All
                    </button>
                    <button className="bg-zinc-800 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-zinc-700 transition flex items-center gap-2">
                        <Zap size={16} className="text-accent" /> Shuffle
                    </button>
                </div>
            </section>
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">
                    {currentSong ? `Rekomendasi berdasarkan ${currentSong.title}` : "Lagu Populer"}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recommendations.map((song) => (
                        <div
                            key={song.id}
                            onClick={() => playSong(song)}
                            className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800 transition cursor-pointer group"
                        >
                            <img src={song.album?.cover_medium} className="rounded-lg mb-4 shadow-lg" />
                            <h3 className="font-semibold truncate">{song.title}</h3>
                            <p className="text-sm text-zinc-400">{song.artist?.name}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* CURATED PLAYLISTS (GRADIENT CARDS) */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ListMusic size={20} className="text-zinc-500" />
                        Developer Vibes
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {curatedPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className={`bg-gradient-to-br ${playlist.color} p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <ListMusic size={100} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-1 relative z-10">{playlist.title}</h3>
                            <p className="text-zinc-400 text-sm relative z-10">{playlist.desc}</p>
                            <div className="mt-6 flex justify-end relative z-10">
                                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <Play size={18} className="text-black fill-black ml-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* QUICK ACCESS / JUMP BACK IN */}
            <section>
                <h2 className="text-xl font-bold text-white mb-6">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {songs.slice(0, 8).map((song, index) => (
                        <div
                            key={song.id}
                            onClick={() => playSong(song, index)}
                            className="group flex items-center gap-4 bg-zinc-900/40 hover:bg-zinc-800/80 transition-all duration-300 rounded-md overflow-hidden cursor-pointer border border-white/5 hover:border-white/10"
                        >
                            <div className="relative w-16 h-16 shrink-0 bg-zinc-800">
                                <img
                                    src={song.album?.cover_medium || song.cover_small}
                                    className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300"
                                    alt={song.title}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Play size={20} className="text-white fill-white shadow-lg" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 pr-4 py-2">
                                <p className="text-white font-bold truncate group-hover:text-accent transition-colors flex items-center gap-2">
                                    {song.title}
                                    {song.explicit_lyrics === 1 && (
                                        <span className="text-[8px] font-black bg-zinc-700 text-zinc-300 px-1 rounded-sm border border-zinc-600 shrink-0">
                                            E
                                        </span>
                                    )}
                                </p>
                                <Link
                                    href={`/artist/${song.artist?.slug}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-zinc-400 text-xs hover:text-white hover:underline truncate block mt-0.5"
                                >
                                    {song.artist?.name}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TOP ARTISTS (CIRCULAR UI) */}
            {uniqueArtists.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Mic2 size={20} className="text-zinc-500" />
                            Featured Artists
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                        {uniqueArtists.map((artist) => (
                            <Link
                                href={`/artist/${artist?.slug}`}
                                key={artist?.id || artist?.name}
                                className="flex flex-col items-center gap-3 group cursor-pointer"
                            >
                                <div className="w-full aspect-square rounded-full overflow-hidden bg-zinc-800 shadow-lg border border-transparent group-hover:border-white/20 transition-all duration-300">
                                    <img
                                        src={artist?.picture_xl || '/default-artist.jpg'}
                                        alt={artist?.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <span className="text-sm font-semibold text-white truncate w-full text-center group-hover:text-accent transition-colors">
                                    {artist?.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* FEATURED ALBUMS - KARTU VERTIKAL BARU */}
            {uniqueAlbums.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Disc size={20} className="text-zinc-500" />
                            Featured Albums
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {uniqueAlbums.map((album) => (
                            <Link
                                href={`/album/${album?.slug || album?.id}`}
                                key={album?.id || album?.title}
                                className="group bg-zinc-900/30 hover:bg-zinc-800/60 p-4 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-white/5 block"
                            >
                                <div className="relative aspect-square mb-4 rounded-md overflow-hidden shadow-lg bg-zinc-800">
                                    <img
                                        src={album?.cover_medium || '/default-album.jpg'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={album?.title}
                                    />
                                    {/* Efek gelap tipis saat hover agar lebih elegan */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <h3 className="font-semibold text-white text-sm truncate mb-1">
                                    {album?.title}
                                </h3>
                                <p className="text-zinc-500 text-xs truncate">
                                    Album
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Dashboard;