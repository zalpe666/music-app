import React from 'react';
import { Play, MoreVertical } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function VerticalSongCard({ song, onPlay, onOpenMenu, extraInfo }) {
    return (
        <div
            onClick={onPlay}
            className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-transparent hover:border-white/10 flex flex-col"
        >
            {/* 💡 CSS Injeksi untuk efek Marquee berjalan saat di-hover */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(-30%); } /* Bergeser ke kiri */
                    100% { transform: translateX(0); } /* Kembali ke awal */
                }
                .group\\/artist:hover .animate-marquee {
                    /* Animasi akan berjalan selama 6 detik bolak-balik terus menerus */
                    animation: marquee 6s ease-in-out infinite;
                }
            `}</style>

            {/* Bagian Atas: Gambar Cover & Hover Play Button */}
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg shrink-0">
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
            <div className="flex justify-between items-start gap-2 flex-1 relative">
                <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-bold text-white truncate text-base group-hover:text-green-400 transition-colors">
                        {song.title}
                    </h3>

                    {/* 👈 DIPERBAIKI: Looping Artis + Wrapper untuk Efek Marquee */}
                    <div className="text-sm text-zinc-400 mt-1 overflow-hidden group/artist w-full">
                        <div className="truncate group-hover/artist:text-clip inline-block whitespace-nowrap animate-marquee">
                            {song.artists && song.artists.length > 0 ? (
                                song.artists.map((artist, index) => (
                                    <span key={artist.id}>
                                        <Link
                                            href={`/artist/${artist.slug || artist.id}`}
                                            onClick={(e) => e.stopPropagation()} // Mencegah lagu terputar saat klik nama artis
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
                </div>

                {/* Tombol Titik Tiga (Action Menu) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenMenu) onOpenMenu(song, e);
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 -mt-1 -mr-2 shrink-0"
                    title="Options"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Extra Info */}
            {extraInfo && (
                <div className="mt-3 text-[10px] text-zinc-500 font-mono tracking-wider shrink-0">
                    {extraInfo}
                </div>
            )}
        </div>
    );
}