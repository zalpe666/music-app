import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Heart, ListPlus, Mic2, Disc, ChevronLeft } from "lucide-react";
import { Link } from "@inertiajs/react";
import usePlayerStore from "@/Stores/playerStore";
import axios from "axios";

export default function SongOptionsModal({ isOpen, onClose, song, playlists, position }) {
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [showPlaylists, setShowPlaylists] = useState(false);

    const { songs: currentQueue, setPlaylist } = usePlayerStore();

    useEffect(() => {
        if (isOpen) {
            setSelectedPlaylists([]);
            setShowPlaylists(false);
        }
    }, [isOpen, song]);

    const handleSavePlaylists = async () => {
        if (!song || selectedPlaylists.length === 0) return;
        try {
            await axios.post('/playlists/add-song', { song_id: song.id, playlist_ids: selectedPlaylists });
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddToQueue = () => {
        const newQueue = [...currentQueue, song];
        setPlaylist(newQueue);
        onClose();
    };

    if (!isOpen || !song) return null;

    return createPortal(
        <>
            {/* Overlay transparan: Kalau klik di luar menu, menu akan tertutup */}
            <div className="fixed inset-0 z-[99998]" onClick={onClose}></div>

            {/* Container Menu Dropdown (posisinya fixed dan diatur oleh properti 'position') */}
            <div
                className="fixed z-[99999] w-56 bg-[#282828] border border-zinc-700/50 rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100"
                style={{ top: position?.y || 0, left: position?.x || 0 }}
            >
                {!showPlaylists ? (
                    <div className="flex flex-col text-sm font-medium text-white/90">
                        
                        {/* Header Mini (Judul Lagu) */}
                        <div className="px-4 py-3 border-b border-white/10 mb-1 flex items-center gap-3">
                            <img src={song.album?.cover_xl || song.cover_small || '/default-cover.png'} className="w-8 h-8 rounded" alt="" />
                            <div className="min-w-0">
                                <p className="truncate font-bold text-white text-xs">{song.title}</p>
                                <p className="truncate text-zinc-400 text-[10px]">{song.artist?.name}</p>
                            </div>
                        </div>

                        {/* Opsi Menu */}
                        <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left transition-colors">
                            <Heart size={18} className="text-zinc-400" />
                            <span>Save to Liked Songs</span>
                        </button>
                        
                        <button onClick={handleAddToQueue} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left transition-colors">
                            <ListPlus size={18} className="text-zinc-400" />
                            <span>Add to Queue</span>
                        </button>
                        
                        <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left transition-colors">
                            <Disc size={18} className="text-zinc-400" />
                            <span>Add to Playlist</span>
                        </button>

                        {song.artist && (
                            <Link href={`/artist/${song.artist.slug}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left transition-colors">
                                <Mic2 size={18} className="text-zinc-400" />
                                <span>Go to Artist</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    /* Tampilan Daftar Playlist */
                    <div className="flex flex-col text-sm text-white/90 w-full animate-in fade-in slide-in-from-right-2">
                        <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
                            <button onClick={() => setShowPlaylists(false)} className="p-1 hover:bg-white/10 rounded-full">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="font-bold">Add to Playlist</span>
                        </div>

                        <div className="max-h-48 overflow-y-auto scrollbar-hide py-1">
                            {playlists?.length > 0 ? playlists.map(p => {
                                const isSelected = selectedPlaylists.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPlaylists(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                        className="flex justify-between items-center px-4 py-2.5 hover:bg-white/10 cursor-pointer"
                                    >
                                        <span className="truncate pr-2">{p.name}</span>
                                        <div className={`shrink-0 w-4 h-4 flex items-center justify-center rounded border ${isSelected ? 'bg-green-500 border-green-500' : 'border-zinc-500'}`}>
                                            {isSelected && <Check size={12} className="text-black" strokeWidth={3} />}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="px-4 py-3 text-zinc-500 text-xs text-center">No playlists found.</p>
                            )}
                        </div>

                        <div className="px-2 pb-2 pt-1">
                            <button
                                onClick={handleSavePlaylists}
                                disabled={selectedPlaylists.length === 0}
                                className="w-full py-2 bg-white text-black font-bold rounded-full text-xs hover:scale-105 disabled:opacity-50 transition-transform"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>,
        document.body
    );
}