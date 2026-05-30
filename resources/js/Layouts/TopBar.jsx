import React, { useState } from 'react';
import { Link, usePage, router } from "@inertiajs/react";
import { Home, Search, ChevronLeft, ChevronRight, User, LogOut } from "lucide-react"; // Tambahkan icon User & LogOut

export default function TopBar() {
    const { url, auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState("");

    // STATE UNTUK DROPDOWN PROFILE
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Dummy user jika belum ada data auth dari Laravel
    const currentUser = auth?.user || { name: 'Zaldien User', email: 'zaldien@example.com' };

    // Ambil inisial huruf pertama dari nama user
    const userInitial = currentUser.name.charAt(0).toUpperCase();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { query: searchQuery });
        }
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md gap-4">

            {/* 1. BAGIAN KIRI: Navigasi Back & Next */}
            <div className="flex items-center gap-2 min-w-[120px]">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 rounded-full bg-black/40 text-zinc-400 hover:text-white hover:bg-black/60 transition"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => window.history.forward()}
                    className="p-2 rounded-full bg-black/40 text-zinc-400 hover:text-white hover:bg-black/60 transition"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* 2. BAGIAN TENGAH: Home & Search Bar */}
            <div className="flex items-center gap-2 flex-1 max-w-2xl justify-center">
                <Link
                    href={route("dashboard")}
                    className={`p-3 rounded-full bg-zinc-800 transition-all hover:scale-105 shrink-0 ${url === '/dashboard' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Home size={22} />
                </Link>

                <form onSubmit={handleSearch} className="flex-1 w-full">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="What do you want to listen to?"
                            className="w-full bg-zinc-800 border border-transparent rounded-full py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:bg-zinc-800 focus:border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-700 transition-all"
                        />
                    </div>
                </form>
            </div>

            {/* 3. BAGIAN KANAN: Profile Dropdown */}
            <div className="flex items-center justify-end min-w-[120px] relative">

                {/* Tombol Avatar */}
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white hover:scale-105 transition shadow-md border-2 border-transparent hover:border-zinc-600"
                    title={currentUser.name}
                >
                    {userInitial}
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <>
                        {/* Overlay transparan untuk menutup dropdown saat klik di luar */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsProfileOpen(false)}
                        ></div>

                        <div className="absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-50 py-1 overflow-hidden">
                            {/* Dummy href untuk profile */}
                            <Link
                                href="#"
                                className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <User size={16} />
                                Profile
                            </Link>

                            <div className="h-px bg-zinc-800 my-1 w-full" />

                            {/* Jika kamu pakai Laravel Breeze, method="post" as="button" digunakan untuk logout */}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <LogOut size={16} />
                                Log Out
                            </Link>
                        </div>
                    </>
                )}
            </div>

        </header>
    );
}