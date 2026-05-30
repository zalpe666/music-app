import React, { useState } from 'react';
import { Link, router, usePage } from "@inertiajs/react";
import {
    Home, Search, Library, PlusSquare, Heart,
    PanelRightClose, PanelRightOpen, UserSearch, X, ListMusic,
} from "lucide-react";

// NavItem sekarang murni sebagai komponen UI (Presentational Component)
function NavItem({ icon, label, active = false, customIconColor = "" }) {
    return (
        <div className={`
            flex items-center gap-4 cursor-pointer transition-all duration-300 px-3 py-2.5 rounded-md group
            ${active ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}
        `}>
            <div className={`transition-colors duration-300 ${active ? "text-white" : customIconColor ? customIconColor : "text-zinc-400 group-hover:text-white"}`}>
                {icon}
            </div>
            {/* Teks hanya dirender jika label ada isinya */}
            {label && (
                <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
                    {label}
                </span>
            )}
        </div>
    );
}

export default function SidebarLeft({ isSidebarOpen, setIsSidebarOpen, url }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    
    // Ambil data playlists dari props global Inertia
    const { playlists } = usePage().props;
    
    const handleCreatePlaylist = () => {
        if (!playlistName.trim()) return;

        // Kirim data ke route 'playlists.store' menggunakan Inertia
        router.post(route('playlists.store'), {
            name: playlistName
        }, {
            onSuccess: () => {
                setPlaylistName('');
                setIsModalOpen(false);
            },
            onError: (errors) => {
                console.error(errors);
            },
            preserveScroll: true
        });
    };

    return (
        <aside className={`bg-black flex-col hidden md:flex z-20 shrink-0 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
            <div className="flex flex-col h-full pt-6 pb-4">
                {/* Tombol Toggle */}
                <div className="px-6 mb-8 flex items-center justify-between">
                    {isSidebarOpen && (
                        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                            Zaldien Music
                        </h1>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-zinc-400 hover:text-white transition"
                    >
                        {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="px-3">
                    <nav className="space-y-1">
                        <Link href={route("dashboard")}>
                            <NavItem icon={<Home size={22} />} label={isSidebarOpen ? "Home" : ""} active={url.startsWith("/dashboard")} />
                        </Link>
                        <Link href={route("search")}>
                            <NavItem icon={<Search size={22} />} label={isSidebarOpen ? "Search" : ""} active={url.startsWith("/search")} />
                        </Link>
                        <Link href={route("library")}>
                            <NavItem icon={<Library size={22} />} label={isSidebarOpen ? "Your Library" : ""} active={url.startsWith("/library")} />
                        </Link>
                        <Link href={route("artists")}>
                            <NavItem icon={<UserSearch size={22} />} label={isSidebarOpen ? "All Artists" : ""} active={url.startsWith("/artists")} />
                        </Link>
                    </nav>
                </div>

                {/* Create Playlist & Liked Songs - Dikeluarkan dari isSidebarOpen */}
                <div className="px-3 mt-8">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-left bg-transparent border-none p-0 cursor-pointer"
                            title={!isSidebarOpen ? "Create Playlist" : ""}
                        >
                            <NavItem icon={<PlusSquare size={22} />} label={isSidebarOpen ? "Create Playlist" : ""} />
                        </button>
                        <Link href="#" title={!isSidebarOpen ? "Liked Songs" : ""}>
                            <NavItem icon={<Heart size={22} />} label={isSidebarOpen ? "Liked Songs" : ""} customIconColor="text-green-500" />
                        </Link>
                    </nav>
                </div>

                <div className="px-6 mt-4 mb-4"><div className="h-px bg-white/10 w-full" /></div>
                
                {/* User Playlists List - Dikeluarkan dari isSidebarOpen */}
                <div className="px-3 flex-1 overflow-y-auto scrollbar-hide">
                    {/* Teks 'PLAYLISTS' hanya muncul saat sidebar open */}
                    {isSidebarOpen && (
                        <p className="px-3 text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">Playlists</p>
                    )}
                    
                    <div className="space-y-1 pb-4">
                        {playlists && playlists.length > 0 ? (
                            playlists.map((playlist) => (
                                <Link
                                    key={playlist.id}
                                    href={`/playlists/${playlist.id}`}
                                    title={!isSidebarOpen ? playlist.name : ""} // Memunculkan nama playlist saat kursor diletakkan di icon
                                    className={`
                                        flex items-center transition-all duration-300 px-3 py-2.5 rounded-md group text-zinc-400 hover:text-white hover:bg-white/5
                                        ${isSidebarOpen ? "gap-4" : "justify-center"} 
                                    `}
                                >
                                    <ListMusic size={22} className="group-hover:text-white transition-colors shrink-0" />
                                    {/* Nama playlist hanya dirender jika sidebar open */}
                                    {isSidebarOpen && (
                                        <span className="text-sm font-medium truncate">{playlist.name}</span>
                                    )}
                                </Link>
                            ))
                        ) : (
                            isSidebarOpen && <p className="text-xs text-zinc-600 px-3">Belum ada playlist.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* POPUP MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-lg w-96 max-w-[90%] shadow-xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white font-bold text-xl">Buat Playlist Baru</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            placeholder="Nama playlist kamu..."
                            className="w-full bg-zinc-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/20 mb-6"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-white font-semibold hover:scale-105 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCreatePlaylist}
                                disabled={!playlistName.trim()}
                                className="px-4 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}