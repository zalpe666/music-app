import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";

// IMPORT KOMPONEN REUSABLE KITA
import HorizontalSongCard from "@/Components/HorizontalSongCard";
import SongOptionsModal from "@/Components/SongOptionsModal";

// --- SUB-KOMPONEN KHUSUS PENCARIAN (Artis & Album) ---

const ArtistCard = ({ artist }) => (
    <Link
        href={`/artist/${artist.slug}`}
        className="bg-zinc-900/40 border border-transparent hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-300 rounded-2xl p-4 flex flex-col items-center gap-4 cursor-pointer text-center group"
    >
        <img
            src={artist.picture_xl || "/default-avatar.png"}
            alt={artist.name}
            className="w-32 h-32 rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="w-full">
            <h2 className="text-white font-bold text-lg truncate group-hover:text-green-400 transition-colors">{artist.name}</h2>
            <span className="text-zinc-500 text-sm font-medium">Artist</span>
        </div>
    </Link>
);

const AlbumCard = ({ album }) => (
    <Link
        href={`/album/${album.slug}`}
        className="bg-zinc-900/40 border border-transparent hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-300 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer group"
    >
        <div className="relative overflow-hidden rounded-xl shadow-lg aspect-square">
            <img
                src={album.cover_xl || "/default-cover.png"}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <div className="w-full">
            <h2 className="text-white font-bold text-base truncate group-hover:text-green-400 transition-colors">{album.title}</h2>
            <p className="text-zinc-400 text-sm truncate">{album.artist?.name}</p>
        </div>
    </Link>
);

// --- KOMPONEN UTAMA ---

const Search = ({ songs = [], artists = [], albums = [], initialQuery = "" }) => {
    const { playSong, setPlaylist, setAllSongs } = usePlayerStore();
    const { playlists } = usePage().props;

    // STATE UNTUK MODAL MENU TITIK TIGA
    const [modal, setModal] = useState({ isOpen: false, song: null, position: { x: 0, y: 0 } });

    // Fungsi membuka menu titik tiga
    const handleOpenMenu = (song, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const isTooLow = rect.bottom + 300 > window.innerHeight;

        setModal({
            isOpen: true,
            song: song,
            position: {
                x: rect.left - 180, // Menggeser pop-up ke kiri agar tidak keluar layar
                y: isTooLow ? rect.top - 240 : rect.bottom + 10
            }
        });
    };

    // Cek apakah ada query pencarian
    const hasSearchQuery = initialQuery.trim().length > 0;

    return (
        <div className="p-4 md:p-8 pb-32">

            {/* JUDUL DINAMIS BERDASARKAN URL QUERY */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    {hasSearchQuery ? `Results for "${initialQuery}"` : "Search"}
                </h1>
                {!hasSearchQuery && <p className="text-zinc-400 mt-2">Browse your favorite music, artists, and albums</p>}
            </div>

            {hasSearchQuery ? (
                <div className="space-y-12">
                    {/* SEKSI ARTIS */}
                    {artists.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Artists</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                                {artists.map(artist => (
                                    <ArtistCard key={artist.id} artist={artist} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SEKSI ALBUM */}
                    {albums.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                                {albums.map(album => (
                                    <AlbumCard key={album.id} album={album} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SEKSI LAGU (Menggunakan HorizontalSongCard) */}
                    {songs.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Songs</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {songs.map((song, index) => (
                                    <HorizontalSongCard
                                        key={song.id}
                                        song={song}
                                        onPlay={() => {
                                            setPlaylist(songs); // 1. Set antrean dengan lagu hasil pencarian
                                            setAllSongs(songs); // 2. Update allSongs untuk AI auto-pilot
                                            playSong(song, index); // 3. Putar lagu
                                        }}
                                        onOpenMenu={handleOpenMenu}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* JIKA QUERY ADA TAPI DATA KOSONG SEMUA */}
                    {songs.length === 0 && artists.length === 0 && albums.length === 0 && (
                        <div className="text-zinc-500 text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800">
                            <p className="text-lg">No results found for <span className="text-white font-bold">"{initialQuery}"</span></p>
                            <p className="text-sm mt-2">Make sure your spelling is correct or try different keywords.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* TAMPILAN DEFAULT SAAT BELUM KETIK APAPUN */
                <div className="text-zinc-500 text-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-2">Mulai Pencarian</h3>
                    <p>Ketik judul lagu, artis, atau album pada kolom pencarian di atas.</p>
                </div>
            )}

            {/* MODAL SONG OPTIONS KITA YANG CANGGIH & REUSABLE */}
            <SongOptionsModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, song: null, position: { x: 0, y: 0 } })}
                song={modal.song}
                playlists={playlists}
                position={modal.position}
            />
        </div>
    );
};

Search.layout = (page) => <AppLayout>{page}</AppLayout>;
export default Search;