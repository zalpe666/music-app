import { useEffect, useState, useMemo } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Link } from "@inertiajs/react";
import { Play, Mic2, ListMusic, Disc, Sparkles, Clock, History, Compass, MoreVertical, X, Check } from "lucide-react";
import HorizontalSongCard from "@/Components/HorizontalSongCard";
import SongOptionsModal from "@/Components/SongOptionsModal";
import VerticalSongCard from "@/Components/VerticalSongCard"; // 👈 TAMBAHKAN INI
const Dashboard = ({ songs = [], hiddenGems = [], recentSongs = [], genres = [], playlists = [] }) => {
    const {
        playSong,
        setPlaylist,
        setAllSongs,
        getRecommendations,
        currentSong
    } = usePlayerStore();

    const recommendations = getRecommendations(5);
    const [modal, setModal] = useState({ isOpen: false, song: null });
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
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


    const uniqueArtists = Array.from(new Map(songs.map(song => [song.artist?.id, song.artist])).values()).filter(Boolean).slice(0, 6);
    const uniqueAlbums = Array.from(new Map(songs.map(song => [song.album?.id, song.album])).values()).filter(Boolean).slice(0, 6);

    // Fungsi untuk menangani klik tombol titik tiga (Action Menu)
    const handleOpenMenu = (song, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const isTooLow = rect.bottom + 300 > window.innerHeight;
        console.log("Buka menu opsi untuk lagu:", song?.title);
        setModal({ isOpen: true, song: song }); // 👈 INI YANG BIKIN MODAL KEBUKA
        setSelectedPlaylists([]);
        setModal({
            isOpen: true,
            song: song,
            position: {
                x: rect.left, // Geser 180px ke kiri agar rata dengan tombol
                y: isTooLow ? rect.top - 240 : rect.bottom + 10 // Muncul di atas atau di bawah
            }
        });
    };
    const handleSave = async () => {
        if (!modal.song || selectedPlaylists.length === 0) {
            setModal({ isOpen: false, song: null });
            return;
        }

        try {
            // Tembak API ke Laravel untuk menyimpan relasi lagu & playlist
            await axios.post('/playlists/add-song', {
                song_id: modal.song.id,
                playlist_ids: selectedPlaylists
            });

            // Tutup modal
            setModal({ isOpen: false, song: null });
            console.log("Berhasil ditambahkan ke playlist!");
            // (Opsional) Tambahkan SweetAlert atau Toast Notifikasi di sini

        } catch (error) {
            console.error("Gagal menambahkan ke playlist:", error);
        }
    };
    return (
        <div className="p-4 md:p-8 space-y-12 pb-32">

            {/* HEADER & GREETING */}
            <div className="pt-4">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    {greeting}
                </h1>
            </div>

            {/* 1. RECENTLY PLAYED */}
            {recentSongs && recentSongs.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <History size={24} className="text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Played Recently</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {recentSongs.map((song, index) => (
                            <HorizontalSongCard
                                key={song.id}
                                song={song}
                                onPlay={() => {
                                    setPlaylist(recentSongs); // Antrean pakai history
                                    playSong(song, index);
                                }}
                                onOpenMenu={handleOpenMenu}
                            />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {randomSongs.map((song, index) => (
                        <HorizontalSongCard
                            key={song.id}
                            song={song}
                            onPlay={() => {
                                setPlaylist(randomSongs); // Antrean pakai quick access
                                playSong(song, index);
                            }}
                            onOpenMenu={handleOpenMenu}
                        />
                    ))}
                </div>
            </section>

            {/* 3. HERO / REKOMENDASI UTAMA BERDASARKAN LAGU SAAT INI */}
            {/* 3. HERO / REKOMENDASI UTAMA BERDASARKAN LAGU SAAT INI */}
            {currentSong && recommendations.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles size={24} className="text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Based On {currentSong.title}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {recommendations.map((song, index) => (
                            <VerticalSongCard
                                key={song.id}
                                song={song}
                                onPlay={() => {
                                    setPlaylist(recommendations);
                                    setAllSongs(recommendations); // 👈 Memastikan queue AI aman
                                    playSong(song, index);
                                }}
                                onOpenMenu={handleOpenMenu}
                            />
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
                        {hiddenGems.map((song, index) => (
                            <VerticalSongCard
                                key={song.id}
                                song={song}
                                onPlay={() => {
                                    setPlaylist(hiddenGems);
                                    setAllSongs(hiddenGems); // 👈 Memastikan queue AI aman
                                    playSong(song, index);
                                }}
                                onOpenMenu={handleOpenMenu}
                                extraInfo={`DIPUTAR ${song.play_count} KALI`} // 👈 Melempar text tambahan ke komponen
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* 5. EXPLORE GENRES */}
            {genres && genres.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Compass size={24} className="text-zinc-500" />
                        <h2 className="text-2xl font-bold text-white">Explore Genres</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {genres.map((genre, i) => {
                            const colors = [
                                "bg-pink-600", "bg-purple-600", "bg-blue-600",
                                "bg-emerald-600", "bg-orange-600", "bg-red-600",
                                "bg-teal-600", "bg-indigo-600"
                            ];
                            const colorClass = colors[i % colors.length];

                            return (
                                <Link
                                    key={genre}
                                    href={`/genre/${genre}`}
                                    className={`${colorClass} rounded-xl p-4 h-32 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-md block`}
                                >
                                    <h3 className="text-xl font-bold text-white relative z-10 capitalize">
                                        {genre}
                                    </h3>
                                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-black/20 rounded-full rotate-12 group-hover:scale-110 transition-transform duration-300 shadow-lg backdrop-blur-sm"></div>
                                    <div className="absolute top-1/2 -right-6 w-12 h-12 bg-white/10 rounded-md rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 6. FEATURED ARTISTS */}
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

            {/* 7. FEATURED ALBUMS */}
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
            <SongOptionsModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, song: null, position: { x: 0, y: 0 } })}
                song={modal.song}
                playlists={playlists}
                position={modal.position} // 👈 TAMBAHKAN INI
            />
        </div>
    );
};

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;
export default Dashboard;