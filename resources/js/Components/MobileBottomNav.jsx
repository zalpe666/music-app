// resources/js/Components/MobileBottomNav.jsx
import { Link, usePage } from "@inertiajs/react";
import { Home, Search, Library, UserSearch } from "lucide-react";

export default function MobileBottomNav() {
    const { url } = usePage();

    return (
        <nav className="flex items-center justify-between bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 px-6 py-5 pb-safe">
            <Link href={route("dashboard")} preserveScroll={false} className="flex flex-col items-center gap-1">
                <Home size={22} className={url.startsWith("/dashboard") ? "text-white" : "text-zinc-500"} />
                <span className={`text-[10px] ${url.startsWith("/dashboard") ? "text-white font-semibold" : "text-zinc-500"}`}>Home</span>
            </Link>

            <Link href={route("search")} preserveScroll={false} className="flex flex-col items-center gap-1">
                <Search size={22} className={url.startsWith("/search") ? "text-white" : "text-zinc-500"} />
                <span className={`text-[10px] ${url.startsWith("/search") ? "text-white font-semibold" : "text-zinc-500"}`}>Search</span>
            </Link>

            <Link href={route("library")} preserveScroll={false} className="flex flex-col items-center gap-1">
                <Library size={22} className={url.startsWith("/library") ? "text-white" : "text-zinc-500"} />
                <span className={`text-[10px] ${url.startsWith("/library") ? "text-white font-semibold" : "text-zinc-500"}`}>Library</span>
            </Link>

            <Link href={route("artists")} preserveScroll={false} className="flex flex-col items-center gap-1">
                <UserSearch size={22} className={url.startsWith("/artists") ? "text-white" : "text-zinc-500"} />
                <span className={`text-[10px] ${url.startsWith("/artists") ? "text-white font-semibold" : "text-zinc-500"}`}>Artists</span>
            </Link>
        </nav>
    );
}