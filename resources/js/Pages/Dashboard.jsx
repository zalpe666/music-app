import { useEffect, useState, useMemo } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Link } from "@inertiajs/react";
import { Play, Mic2, ListMusic, Disc, Sparkles, Clock, History } from "lucide-react"; // Tambahkan icon History

const Dashboard = ({ songs = [], hiddenGems = [], recentSongs = [] }) => {
    const {
        playSong,
        setPlaylist,
        setAllSongs,
        getRecommendations,
        currentSong
    } = usePlayerStore();

    const recommendations = getRecommendations(5);

    // Sapaan Dinamis berdasarkan waktu
    const [greeting, setGreeting] = useState("Selamat Datang");
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    // Randomizer untuk Quick Access
    const randomSongs = useMemo(() => {
        return [...songs]
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);
    }, [songs]);

    useEffect(() => {
        if (songs.length > 0) {
            setPlaylist(songs);
            setAllSongs(songs);
        }
    }, [songs]);

    const uniqueArtists = Array.from(new Map(songs.map(song => [song.artist?.id, song.artist])).values()).filter(Boolean).slice(0, 6);
    const uniqueAlbums = Array.from(new Map(songs.map(song => [song.album?.id, song.album])).values()).filter(Boolean).slice(0, 6);

    return (
        <div className="p-4 md:p-8 space-y-12 pb-32">

            {/* HEADER & GREETING */}
            <div className="pt-4">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    {greeting}
                </h1>
            </div>

            {/* 1. RECENTLY PLAYED (Pindah ke Paling Atas untuk UX Terbaik) */}
            {recentSongs && recentSongs.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <History size={24} className="text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Baru Saja Diputar</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {recentSongs.map((song) => (
                            <div
                                key={song.id}
                                onClick={() => playSong(song)}
                                className="group flex items-center bg-zinc-800/40 hover:bg-zinc-700/60 transition-all duration-300 rounded-md overflow-hidden cursor-pointer"
                            >
                                <div className="relative w-14 h-14 md:w-20 md:h-20 shrink-0 bg-zinc-800 shadow-md">
                                    <img src={song.album?.cover_xl || song.cover_small} className="w-full h-full object-cover" alt={song.title} />
                                </div>
                                <div className="flex-1 min-w-0 px-4 py-2">
                                    <p className="text-white font-bold text-sm md:text-base truncate group-hover:text-green-400">
                                        {song.title}
                                    </p>
                                    <p className="text-xs text-zinc-400 truncate">{song.artist?.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 2. QUICK ACCESS (Random Songs) */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <ListMusic size={24} className="text-zinc-500" />
                    <h2 className="text-2xl font-bold text-white">Quick Access</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {randomSongs.map((song, index) => (
                        <div
                            key={song.id}
                            onClick={() => playSong(song, index)}
                            className="group flex items-center bg-zinc-800/30 hover:bg-zinc-700/50 transition-all duration-300 rounded-md overflow-hidden cursor-pointer border border-transparent hover:border-white/10 shadow-sm hover:shadow-md"
                        >
                            <div className="relative w-14 h-14 md:w-20 md:h-20 shrink-0 bg-zinc-800 shadow-md">
                                <img src={song.album?.cover_xl || song.cover_small} className="w-full h-full object-cover" alt={song.title} />
                            </div>
                            <div className="flex-1 min-w-0 px-4 py-2 flex justify-between items-center">
                                <p className="text-white font-bold text-sm md:text-base truncate group-hover:text-green-400 transition-colors">
                                    {song.title}
                                </p>
                                <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-105 hover:bg-green-400 shrink-0">
                                    <Play size={18} className="text-black fill-black ml-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. HERO / REKOMENDASI UTAMA BERDASARKAN LAGU SAAT INI */}
            {currentSong && recommendations.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles size={24} className="text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Based On {currentSong.title}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {recommendations.map((song) => (
                            <div
                                key={song.id}
                                onClick={() => playSong(song)}
                                className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-transparent hover:border-white/10"
                            >
                                <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                                    <img src={song.album?.cover_xl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play size={32} className="text-white fill-white shadow-2xl" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-white truncate text-base">{song.title}</h3>
                                <p className="text-sm text-zinc-400 truncate mt-1">{song.artist?.name}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 4. DISCOVERY: HIDDEN GEMS */}
            {hiddenGems.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock size={24} className="text-zinc-500" />
                        <h2 className="text-2xl font-bold text-white">Discovery: Hidden Gems</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {hiddenGems.map((song) => (
                            <div
                                key={song.id}
                                onClick={() => playSong(song)}
                                className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer group border border-transparent hover:border-green-500/30"
                            >
                                <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                                    <img src={song.album?.cover_xl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <h3 className="font-bold text-white truncate text-base">{song.title}</h3>
                                <p className="text-sm text-zinc-400 truncate mt-1">{song.artist?.name}</p>
                                <div className="mt-2 text-[10px] text-zinc-600 font-mono">
                                    DIPUTAR {song.play_count} KALI
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 5. FEATURED ARTISTS */}
            {uniqueArtists.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">Featured Artists</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                        {uniqueArtists.map((artist) => (
                            <Link href={`/artist/${artist?.slug}`} key={artist?.id} className="flex flex-col items-center gap-4 group cursor-pointer">
                                <div className="w-full aspect-square rounded-full overflow-hidden bg-zinc-800 shadow-xl border-4 border-transparent group-hover:border-zinc-700 transition-all duration-300">
                                    <img src={artist?.picture_xl || '/default-artist.jpg'} alt={artist?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <span className="text-sm font-bold text-white truncate w-full text-center group-hover:text-green-400 transition-colors">
                                    {artist?.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 6. FEATURED ALBUMS */}
            {uniqueAlbums.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">Featured Albums</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {uniqueAlbums.map((album) => (
                            <Link href={`/album/${album?.slug || album?.id}`} key={album?.id} className="group bg-zinc-900/40 hover:bg-zinc-800/80 p-4 rounded-xl transition-all duration-300 cursor-pointer block hover:-translate-y-1">
                                <div className="relative aspect-square mb-4 rounded-md overflow-hidden shadow-lg bg-zinc-800">
                                    <img src={album?.cover_xl || '/default-album.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={album?.title} />
                                </div>
                                <h3 className="font-bold text-white text-sm truncate mb-1">{album?.title}</h3>
                                <p className="text-zinc-400 text-xs truncate font-medium">{album?.artist?.name || 'Album'}</p>
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