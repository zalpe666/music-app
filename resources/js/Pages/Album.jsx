import { useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Play, Clock3, Heart, MoreHorizontal, Pause } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Album({ album, songs, artist }) {
    // Tambahkan `isPlaying` untuk mengecek status audio
    const { setPlaylist, playSong, currentSong, isPlaying } = usePlayerStore();

    useEffect(() => {
        setPlaylist(songs);
    }, [songs]);

    const formatTime = (time) => {
        if (!time) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    // Total durasi album (opsional, jika ingin ditampilkan)
    const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const formatTotalDuration = (time) => {
        const hrs = Math.floor(time / 3600);
        const min = Math.floor((time % 3600) / 60);
        return hrs > 0 ? `${hrs} hr ${min} min` : `${min} min`;
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 text-white pb-20 selection:bg-green-500 selection:text-black">
            
            {/* 1. HERO SECTION */}
            <div className="relative pt-24 pb-8 px-8 md:px-12 flex flex-col md:flex-row items-end gap-6 md:gap-8 overflow-hidden group">
                
                {/* Background Blur Dynamic (Mengambil dari cover album) */}
                <div 
                    className="absolute inset-0 opacity-40 blur-[80px] pointer-events-none transform scale-110 transition-all duration-1000"
                    style={{
                        backgroundImage: `url(${album.cover_xl || album.cover_medium})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                {/* Gradient Penutup agar menyatu dengan background bawah */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />

                {/* Album Cover */}
                <div className="relative z-10 shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden w-52 h-52 md:w-64 md:h-64 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-shadow duration-500">
                    <img
                        src={album.cover_xl || album.cover_medium}
                        alt={album.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Album Info */}
                <div className="relative z-10 flex flex-col gap-2 md:gap-3 w-full">
                    <p className="text-xs md:text-sm font-bold text-white/90 uppercase tracking-[0.2em]">
                        Album
                    </p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-xl line-clamp-2 leading-tight py-1">
                        {album.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-zinc-300 font-medium">
                        {/* Cek properti artist picture, gunakan fallback jika kosong */}
                        {artist.picture_small || artist.strArtistLogo ? (
                            <img 
                                src={artist.picture_small || artist.strArtistLogo} 
                                className="w-6 h-6 rounded-full object-cover shadow-sm bg-zinc-800" 
                                alt={artist.name}
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                                {artist.name.charAt(0)}
                            </div>
                        )}
                        
                        <Link href={`/artist/${artist.slug || artist.id}`} className="font-bold text-white hover:underline transition-all">
                            {artist.name}
                        </Link>
                        <span className="text-zinc-500 hidden sm:inline">•</span>
                        <span>{album.release_date ? new Date(album.release_date).getFullYear() : 'Release Year'}</span>
                        <span className="text-zinc-500 hidden sm:inline">•</span>
                        <span>{songs.length} songs, <span className="text-zinc-400 font-normal">{formatTotalDuration(totalDuration)}</span></span>
                    </div>
                </div>
            </div>

            {/* 2. ACTION BUTTONS (Sticky) */}
            <div className="px-8 md:px-12 py-6 flex items-center gap-6 sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
                <button
                    onClick={() => playSong(songs[0], 0)}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.2)] group"
                >
                    <Play className="text-black fill-black ml-1 group-hover:scale-110 transition-transform" size={26} />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110">
                    <Heart size={28} />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110">
                    <MoreHorizontal size={28} />
                </button>
            </div>

            {/* 3. SONG LIST */}
            <div className="md:px-10 pb-20 w-full max-w-6xl">
                {/* Table Header */}
                <div className="grid grid-cols-[40px_1fr_auto] gap-4 text-zinc-400 text-sm px-4 mb-3 uppercase tracking-wider font-semibold border-b border-white/5 pb-3">
                    <span className="text-center">#</span>
                    <span>Title</span>
                    <span className="flex justify-end pr-4"><Clock3 size={16} /></span>
                </div>

                {/* List Lagu */}
                <div className="space-y-1 mt-2">
                    {songs.map((song, index) => {
                        const isCurrentlyPlaying = currentSong?.id === song.id;

                        return (
                            <div
                                key={song.id}
                                onClick={() => playSong(song, index)}
                                className="grid grid-cols-[40px_1fr_auto] gap-4 items-center p-2.5 rounded-lg hover:bg-white/10 cursor-pointer group transition-all duration-200"
                            >
                                {/* Nomor Urut / Hover Play Icon / Animasi Playing */}
                                <div className="flex justify-center items-center w-full relative">
                                    {isCurrentlyPlaying && isPlaying ? (
                                        <div className="w-4 h-4 flex items-end justify-between gap-[2px]">
                                            <div className="w-1 bg-green-500 animate-[bounce_1s_infinite] h-full" />
                                            <div className="w-1 bg-green-500 animate-[bounce_0.8s_infinite] h-2/3" />
                                            <div className="w-1 bg-green-500 animate-[bounce_1.2s_infinite] h-4/5" />
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`text-base font-medium transition-colors ${isCurrentlyPlaying ? 'text-green-500' : 'text-zinc-500 group-hover:hidden'}`}>
                                                {index + 1}
                                            </span>
                                            <Play 
                                                size={16} 
                                                className="hidden group-hover:block text-white" 
                                                fill="white" 
                                            />
                                        </>
                                    )}
                                </div>

                                {/* Judul Lagu */}
                                <div className="flex flex-col justify-center pr-4">
                                    <span className={`font-medium text-base truncate transition-colors ${isCurrentlyPlaying ? 'text-green-500' : 'text-zinc-100 group-hover:text-white'}`}>
                                        {song.title}
                                    </span>
                                    {/* Jika artist.name di-render di dalam list (Opsional) */}
                                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
                                        {artist.name}
                                    </span>
                                </div>

                                {/* Durasi */}
                                <span className="text-zinc-400 tabular-nums pr-4 font-medium group-hover:text-zinc-200 transition-colors">
                                    {formatTime(song.duration)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Copyright Album (Opsional) */}
                <div className="mt-12 px-4">
                    <p className="text-sm text-zinc-400">{album.release_date ? new Date(album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">
                        © {new Date().getFullYear()} {artist.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

Album.layout = (page) => <AppLayout>{page}</AppLayout>;