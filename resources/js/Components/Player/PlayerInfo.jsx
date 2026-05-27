import { Link } from "@inertiajs/react";

export default function PlayerInfo({ currentSong }) {
    if (!currentSong) return <div className="w-1/3" />;

    return (
        <div className="flex items-center gap-4 w-1/3">
            <Link href={route("player")}>
                <div className="relative overflow-hidden rounded-md h-14 w-14 group cursor-pointer shrink-0">
                    <img src={currentSong.album?.cover_xl} className="w-full h-full object-cover group-hover:opacity-80 transition" alt="Cover" />
                </div>
            </Link>
            <div className="truncate flex flex-col justify-center">
                <Link href={route("player")} className="font-bold text-sm text-white hover:underline truncate">{currentSong.title}</Link>
                <Link href={`/artist/${currentSong.artist?.slug}`} className="text-[11px] text-zinc-400 hover:underline">{currentSong.artist?.name}</Link>
            </div>
        </div>
    );
}