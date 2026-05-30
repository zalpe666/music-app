import { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { MoreVertical, ListPlus, Heart, X, Check } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";

// --- SUB-KOMPONEN ---

const SongCard = ({ song, index, onPlay, onToggleDropdown, isActive }) => (
    <div className="relative group">
        <div
            onClick={() => onPlay(song, index)}
            className="bg-zinc-900 hover:bg-zinc-800 transition rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
        >
            <img
                src={song.album?.cover_xl || song.cover_small || "/default-cover.png"}
                alt={song.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-base truncate">{song.title}</h2>
                <Link
                    href={`/artist/${song.artist?.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-zinc-400 text-sm hover:underline"
                >
                    {song.artist?.name}
                </Link>
            </div>
            <button
                onClick={(e) => onToggleDropdown(e, song.id)}
                className="p-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-700 opacity-0 group-hover:opacity-100"
            >
                <MoreVertical size={20} />
            </button>
        </div>
        {isActive && (
            <div className="absolute right-4 top-16 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-20 py-1 overflow-hidden">
                <button
                    onClick={(e) => onToggleDropdown(e, null, true)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                >
                    <ListPlus size={16} /> Add to Playlist
                </button>
            </div>
        )}
    </div>
);

const ArtistCard = ({ artist }) => (
    <Link
        href={`/artist/${artist.slug}`}
        className="bg-zinc-900 hover:bg-zinc-800 transition rounded-2xl p-4 flex flex-col items-center gap-4 cursor-pointer text-center group"
    >
        <img
            src={artist.picture_xl || "/default-avatar.png"}
            alt={artist.name}
            className="w-32 h-32 rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="w-full">
            <h2 className="text-white font-bold text-lg truncate">{artist.name}</h2>
            <span className="text-zinc-500 text-sm">Artist</span>
        </div>
    </Link>
);

const AlbumCard = ({ album }) => (
    <Link
        href={`/album/${album.slug}`}
        className="bg-zinc-900 hover:bg-zinc-800 transition rounded-2xl p-4 flex flex-col gap-3 cursor-pointer group"
    >
        <img
            src={album.cover_xl || "/default-cover.png"}
            alt={album.title}
            className="w-full aspect-square rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="w-full">
            <h2 className="text-white font-bold text-base truncate">{album.title}</h2>
            <p className="text-zinc-400 text-sm truncate">{album.artist?.name}</p>
        </div>
    </Link>
);

// --- KOMPONEN UTAMA ---

const Search = ({ songs = [], artists = [], albums = [], initialQuery = "" }) => {
    const { playSong, setPlaylist } = usePlayerStore();
    const { playlists } = usePage().props;

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, song: null });
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);

    useEffect(() => {
        if (songs.length > 0) setPlaylist(songs);
    }, [songs]);

    // Cek apakah ada query pencarian dari URL via props backend
    const hasSearchQuery = initialQuery.trim().length > 0;

    const handleAction = (e, songId, openModal = false) => {
        e.stopPropagation();
        if (openModal) {
            setModal({ isOpen: true, song: activeDropdown ? songs.find(s => s.id === activeDropdown) : null });
            setActiveDropdown(null);
        } else {
            setActiveDropdown(activeDropdown === songId ? null : songId);
        }
    };

    const handleSave = () => {
        if (selectedPlaylists.length === 0) return setModal({ isOpen: false, song: null });
        router.post(route('playlists.add-song'),
            { song_id: modal.song.id, playlist_ids: selectedPlaylists },
            { preserveScroll: true, onSuccess: () => setModal({ isOpen: false, song: null }) }
        );
    };

    return (
        <div className="p-2 sm:p-6 pb-24" onClick={() => setActiveDropdown(null)}>

            {/* JUDAL DINAMIS BERDASARKAN URL QUERY */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white">
                    {hasSearchQuery ? `Results for "${initialQuery}"` : "Search"}
                </h1>
                {!hasSearchQuery && <p className="text-zinc-400 mt-2">Browse your favorite music, artists, and albums</p>}
            </div>

            {hasSearchQuery ? (
                <>
                    {/* SEKSI ARTIS */}
                    {artists.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                {artists.map(artist => (
                                    <ArtistCard key={artist.id} artist={artist} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SEKSI ALBUM */}
                    {albums.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                {albums.map(album => (
                                    <AlbumCard key={album.id} album={album} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SEKSI LAGU */}
                    {songs.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {songs.map((song, i) => (
                                    <SongCard
                                        key={song.id} song={song} index={i}
                                        onPlay={playSong} onToggleDropdown={handleAction}
                                        isActive={activeDropdown === song.id}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* JIKA QUERY ADA TAPI DATA KOSONG SEMUA */}
                    {songs.length === 0 && artists.length === 0 && albums.length === 0 && (
                        <div className="text-zinc-500 text-center py-20">
                            No results found for "{initialQuery}"
                        </div>
                    )}
                </>
            ) : (
                /* TAMPILAN DEFAULT SAAT BELUM KETIK APAPUN */
                <div className="text-zinc-500 text-center py-32 border border-dashed border-zinc-800 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">Mulai Pencarian</h3>
                    <p>Ketik judul lagu, artis, atau album pada kolom pencarian di bagian atas.</p>
                </div>
            )}

            {/* MODAL PLAYLIST */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
                            <button onClick={() => setModal({ isOpen: false })} className="text-zinc-400 hover:text-white"><X /></button>
                        </div>

                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto scrollbar-hide">
                            {playlists?.map(p => (
                                <div key={p.id} onClick={() => setSelectedPlaylists(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                    className="flex justify-between p-3 rounded hover:bg-zinc-800 cursor-pointer">
                                    <span className="text-white">{p.name}</span>
                                    <div className={`w-5 h-5 flex items-center justify-center rounded border ${selectedPlaylists.includes(p.id) ? 'bg-green-500 border-green-500 text-black' : 'border-zinc-500'}`}>
                                        {selectedPlaylists.includes(p.id) && <Check size={14} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSave} className="w-full py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition">Done</button>
                    </div>
                </div>
            )}
        </div>
    );
};

Search.layout = (page) => <AppLayout>{page}</AppLayout>;
export default Search;