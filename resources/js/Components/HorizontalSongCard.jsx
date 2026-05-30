import React from 'react';
import { Play, MoreVertical } from "lucide-react";
import { Link } from "@inertiajs/react"; // 👈 1. TAMBAHKAN IMPORT INI

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

                {/* 👈 2. UBAH BAGIAN ARTIS MENJADI LINK */}
                <div className="text-xs text-zinc-400 truncate mt-0.5">
                    {song.artist ? (
                        <Link
                            href={`/artist/${song.artist.slug}`}
                            onClick={(e) => e.stopPropagation()} // PENTING: Mencegah lagu terputar saat klik nama artis
                            className="hover:underline hover:text-white transition-colors"
                        >
                            {song.artist.name}
                        </Link>
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