import React from 'react';
import { Play, MoreVertical } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function VerticalSongCard({ song, onPlay, onOpenMenu, extraInfo }) {
    return (
        <div
            onClick={onPlay}
            className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-transparent hover:border-white/10"
        >
            {/* Bagian Atas: Gambar Cover & Hover Play Button */}
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                <img
                    src={song.album?.cover_xl || song.cover_small || '/default-cover.png'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={song.title}
                />

                {/* Overlay Transparan & Tombol Play Hijau ala Spotify */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-green-400 hover:scale-105">
                        <Play size={24} className="text-black fill-black ml-1" />
                    </div>
                </div>
            </div>

            {/* Bagian Bawah: Judul, Artis & Tombol Titik Tiga */}
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate text-base group-hover:text-green-400 transition-colors">
                        {song.title}
                    </h3>

                    <div className="text-sm text-zinc-400 truncate mt-1">
                        {song.artist ? (
                            <Link
                                href={`/artist/${song.artist.slug}`}
                                onClick={(e) => e.stopPropagation()} // Mencegah lagu terputar saat klik nama artis
                                className="hover:underline hover:text-white transition-colors"
                            >
                                {song.artist.name}
                            </Link>
                        ) : (
                            <span>Unknown Artist</span>
                        )}
                    </div>
                </div>

                {/* Tombol Titik Tiga (Action Menu) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenMenu) onOpenMenu(song, e);
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 -mt-1 -mr-2"
                    title="Options"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {extraInfo && (
                <div className="mt-3 text-[10px] text-zinc-500 font-mono tracking-wider">
                    {extraInfo}
                </div>
            )}
        </div>
    );
}