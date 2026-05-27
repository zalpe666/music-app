import { Link } from "@inertiajs/react";
import {
    Home, Search, Library, PlusSquare, Heart,
    PanelRightClose, PanelRightOpen, UserSearch
} from "lucide-react";

function NavItem({ icon, label, active = false, customIconColor = "" }) {
    return (
        <div className={`
            flex items-center gap-4 cursor-pointer transition-all duration-300 px-3 py-2.5 rounded-md group
            ${active ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}
        `}>
            <div className={`transition-colors duration-300 ${active ? "text-white" : customIconColor ? customIconColor : "text-zinc-400 group-hover:text-white"}`}>
                {icon}
            </div>
            <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
                {label}
            </span>
        </div>
    );
}

export default function SidebarLeft({ isSidebarOpen, setIsSidebarOpen, url }) {
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

                {isSidebarOpen && (
                    <>
                        <div className="px-3 mt-8">
                            <nav className="space-y-1">
                                <NavItem icon={<PlusSquare size={22} />} label="Create Playlist" />
                                <NavItem icon={<Heart size={22} />} label="Liked Songs" customIconColor="text-green-500" />
                            </nav>
                        </div>
                        <div className="px-6 mt-4 mb-4"><div className="h-px bg-white/10 w-full" /></div>
                        <div className="px-6 flex-1 overflow-y-auto scrollbar-hide">
                            <p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">Playlists</p>
                            {/* List playlist kamu */}
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}