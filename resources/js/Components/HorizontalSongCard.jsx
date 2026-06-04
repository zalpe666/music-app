import React from 'react';
import { Play, MoreVertical } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function HorizontalSongCard({ song, onPlay, onOpenMenu }) {
    return (
        <div
            onClick={onPlay}
            className="group flex items-center gap-3 bg-zinc-800/30 hover:bg-zinc-700/50 transition-all duration-300 rounded-md p-2 overflow-hidden cursor-pointer border border-transparent hover:border-white/10 shadow-sm hover:shadow-md"
        >
            {/* Bagian Kiri: Gambar & Overlay Play */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 bg-zinc-800 rounded-md overflow-hidden shadow-md">
                <img
                    src={song.album?.cover_xl || song.cover_small || '/default-cover.png'}
                    className="w-full h-full object-cover"
                    alt={song.title}
                />
                {/* Overlay hitam transparan & Icon Play saat di-hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <Play size={20} className="text-white fill-white ml-1" />
                </div>
            </div>

            {/* Bagian Tengah: Judul & Artis */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-white font-bold text-sm md:text-base truncate group-hover:text-green-400 transition-colors">
                    {song.title}
                </p>

                {/* 👈 DIPERBAIKI: Looping untuk banyak artis (Feat) */}
                <div className="text-xs text-zinc-400 truncate mt-0.5">
                    {song.artists && song.artists.length > 0 ? (
                        song.artists.map((artist, index) => (
                            <span key={artist.id}>
                                <Link
                                    // Fallback ke id jika slug belum di-generate oleh backend
                                    href={`/artist/${artist.slug || artist.id}`} 
                                    onClick={(e) => e.stopPropagation()}
                                    className="hover:underline hover:text-white transition-colors"
                                >
                                    {artist.name}
                                </Link>
                                {/* Tambahkan koma jika bukan artis terakhir di list */}
                                {index < song.artists.length - 1 && ", "}
                            </span>
                        ))
                    ) : (
                        <span>Unknown Artist</span>
                    )}
                </div>
            </div>

            {/* Bagian Kanan: Tombol Titik Tiga (Action Menu) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenMenu) onOpenMenu(song, e);
                }}
                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
                title="Options"
            >
                <MoreVertical size={20} />
            </button>
        </div>
    );
}