import { useEffect, useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { Link } from "@inertiajs/react";
import {
    Play, Clock3, MapPin, Calendar,
    Users, Globe,
    Music, Sparkles, Heart,
    ChevronLeft, ChevronRight, MoreHorizontal
} from "lucide-react";

export default function Artist({ artist, songs }) {
    const { setPlaylist, playSong, currentSong, isPlaying } = usePlayerStore();
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    useEffect(() => {
        setPlaylist(songs);
    }, [songs]);

    const formatTime = (time) => {
        if (!time) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    const albums = Array.from(new Set(songs.map((s) => s.album?.id)))
        .map((id) => songs.find((s) => s.album?.id === id)?.album)
        .filter(Boolean);

    // Kumpulan gambar Hero
    const heroImages = [
        artist.strArtistFanart,
        artist.strArtistFanart2,
        artist.strArtistFanart3,
        artist.strArtistBanner,
        artist.strArtistWideThumb,
        artist.picture_xl,
    ].filter(Boolean);

    if (heroImages.length === 0) {
        heroImages.push("/default-artist-bg.jpg");
    }

    const [currentIndex, setCurrentIndex] = useState(0);

    // Efek Autoplay untuk Carousel
    useEffect(() => {
        if (heroImages.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % heroImages.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [heroImages.length]);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

    return (
        <div className="w-full min-h-screen bg-zinc-950 text-zinc-50 pb-20 font-sans selection:bg-green-500 selection:text-black">
            {/* 1. HERO SECTION */}
            <div className="relative w-full h-[55vh] min-h-[450px] flex items-end p-8 md:p-12 group overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 transition-transform duration-1000 ease-in-out transform scale-105 group-hover:scale-100"
                    style={{
                        backgroundImage: `url(${heroImages[currentIndex]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center 20%",
                    }}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/20 z-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/10 z-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent z-0" />

                {/* Navigasi Carousel */}
                {heroImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Konten Hero */}
                <div className="relative z-10 flex flex-col gap-5 w-full max-w-7xl mx-auto">
                    {artist.strArtistLogo ? (
                        <img
                            src={artist.strArtistLogo}
                            alt={artist.name}
                            className="h-24 md:h-36 object-contain object-left drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                        />
                    ) : (
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {artist.name}
                        </h1>
                    )}

                    <p className="text-zinc-300 font-medium flex items-center gap-3 text-sm md:text-base">
                        <span>{songs.length} Tracks</span>
                        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
                        <span>{albums.length} Albums</span>
                    </p>

                    {/* Indikator Titik */}
                    {heroImages.length > 1 && (
                        <div className="flex gap-1.5 mt-2">
                            {heroImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === idx
                                            ? "w-8 bg-white"
                                            : "w-2 bg-white/30 hover:bg-white/60"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. ACTION BAR */}
            <div className="px-8 py-5 flex items-center gap-5 sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-xl border-b border-white/5">
                <div className="w-full max-w-7xl mx-auto flex items-center gap-6">
                    <button
                        onClick={() => playSong(songs[0], 0)}
                        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] group"
                    >
                        <Play className="text-black fill-black ml-1 group-hover:scale-110 transition-transform" size={26} />
                    </button>
                    <button className="w-10 h-10 rounded-full border-2 border-zinc-500 flex items-center justify-center text-zinc-300 hover:text-white hover:border-white transition-all duration-300 hover:scale-105">
                        <Heart size={20} />
                    </button>
                    <button className="text-zinc-400 hover:text-white transition-colors p-2">
                        <MoreHorizontal size={28} />
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT LAYOUT (FULL WIDTH CONTAINER) */}
            <div className="pt-10 flex flex-col gap-14 w-full max-w-7xl mx-auto">

                {/* POPULAR TRACKS */}
                <div>
                    <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Popular</h2>

                    <div className="grid grid-cols-[30px_1fr_auto_auto] md:grid-cols-[40px_1fr_2fr_auto] gap-4 text-zinc-400 text-sm px-4 mb-3 uppercase tracking-wider text-xs font-semibold border-b border-white/5 pb-3">
                        <span className="text-center">#</span>
                        <span>Title</span>
                        <span className="hidden md:block">Album</span>
                        <span className="flex justify-end pr-2"><Clock3 size={16} /></span>
                    </div>

                    <div className="space-y-1 mt-2">
                        {songs.map((song, index) => {
                            const isCurrentlyPlaying = currentSong?.id === song.id;

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => playSong(song, index)}
                                    className="grid grid-cols-[30px_1fr_auto_auto] md:grid-cols-[40px_1fr_2fr_auto] gap-4 items-center p-2.5 rounded-lg hover:bg-white/10 cursor-pointer group transition-all duration-200"
                                >
                                    <div className="flex justify-center items-center w-full">
                                        {isCurrentlyPlaying && isPlaying ? (
                                            <div className="w-4 h-4 flex items-end justify-between gap-[2px]">
                                                <div className="w-1 bg-green-500 animate-[bounce_1s_infinite] h-full" />
                                                <div className="w-1 bg-green-500 animate-[bounce_0.8s_infinite] h-2/3" />
                                                <div className="w-1 bg-green-500 animate-[bounce_1.2s_infinite] h-4/5" />
                                            </div>
                                        ) : (
                                            <>
                                                <span className={`text-zinc-500 group-hover:hidden text-base ${isCurrentlyPlaying ? 'text-green-500' : ''}`}>
                                                    {index + 1}
                                                </span>
                                                <Play size={16} className="hidden group-hover:block text-white" fill="white" />
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <img src={song.album?.cover_small || song.album?.cover_xl} className="w-11 h-11 rounded shadow-md" />
                                        <div className="flex flex-col justify-center">
                                            <span className={`font-medium truncate text-base leading-tight mb-0.5 ${isCurrentlyPlaying ? 'text-green-500' : 'text-zinc-100 group-hover:text-white'}`}>
                                                {song.title}
                                            </span>
                                            {song.explicit_lyrics == 1 && (
                                                <span className="text-[9px] font-bold bg-zinc-300 text-zinc-900 px-1.5 py-[1px] rounded-sm w-fit uppercase tracking-widest">
                                                    E
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <span className="hidden md:block text-zinc-400 group-hover:text-zinc-200 truncate transition-colors text-sm">
                                        {song.album?.title}
                                    </span>

                                    <span className="text-zinc-400 tabular-nums pr-2 group-hover:text-zinc-200">
                                        {formatTime(song.duration)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* DISCOGRAPHY / ALBUMS */}
                <div>
                    <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Discography</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {albums.map((album) => (
                            <Link
                                key={album.id}
                                href={`/album/${album.slug}`}
                                className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="relative mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden rounded-md">
                                    <img
                                        src={album.cover_xl}
                                        className="w-full aspect-square object-cover"
                                        alt={album.title}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            <Play size={24} className="text-black ml-1" fill="black" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-zinc-100 truncate group-hover:text-white text-base">{album.title}</h3>
                                <p className="text-zinc-400 text-sm mt-0.5 font-medium">Album</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ABOUT SECTION (Lebar Full / Konten Bawah) */}
                <div className="pb-10">
                    <h2 className="text-2xl font-black text-white mb-6 tracking-tight">About {artist.name}</h2>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl backdrop-blur-sm relative overflow-hidden">

                        {/* Background dekoratif artist fanart di dalam kotak About */}
                        <div
                            className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                            style={{
                                backgroundImage: `url(${artist.strArtistFanart || artist.strArtistBanner})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "blur(20px)"
                            }}
                        />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">

                            {/* KOLOM KIRI: Clearart & Teks Biografi */}
                            <div>
                                {artist.strArtistClearart && (
                                    <div className="mb-8 w-48 md:w-64">
                                        <img src={artist.strArtistClearart} alt="Clearart" className="w-full object-contain drop-shadow-2xl" />
                                    </div>
                                )}

                                {artist.strBiography && (
                                    <div className="relative">
                                        <p className={`text-zinc-300 text-base leading-relaxed ${!isBioExpanded && "line-clamp-6"}`}>
                                            {artist.strBiography}
                                        </p>
                                        {/* Efek fade out gradasi jika teks dipotong */}
                                        {!isBioExpanded && (
                                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#18181b]/90 to-transparent pointer-events-none" />
                                        )}
                                        <button
                                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                                            className="text-white text-sm font-bold mt-4 hover:text-green-400 transition-colors"
                                        >
                                            {isBioExpanded ? "Show less" : "Read more"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* KOLOM KANAN: Informasi, Badges, & Social */}
                            <div className="flex flex-col gap-8 lg:border-l lg:border-white/10 lg:pl-12">

                                {/* Labels: Genre, Mood, Style */}
                                <div>
                                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Tags & Styles</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {artist.strGenre && (
                                            <span className="bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 cursor-default">
                                                <Music size={14} /> {artist.strGenre}
                                            </span>
                                        )}
                                        {artist.strMood && (
                                            <span className="bg-white/5 text-zinc-300 text-sm font-medium px-4 py-2 rounded-full border border-white/5 cursor-default">
                                                {artist.strMood}
                                            </span>
                                        )}
                                        {artist.strStyle && (
                                            <span className="bg-white/5 text-zinc-300 text-sm font-medium px-4 py-2 rounded-full border border-white/5 cursor-default">
                                                {artist.strStyle}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Facts / Stats */}
                                <div>
                                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4">Artist Info</h4>
                                    <div className="space-y-5 text-sm text-zinc-200 font-medium">
                                        {artist.strCountry && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                    <MapPin size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-zinc-500 text-xs mb-0.5">Origin</p>
                                                    <span className="text-base">{artist.strCountry}</span>
                                                </div>
                                            </div>
                                        )}
                                        {artist.intFormedYear && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                    <Calendar size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-zinc-500 text-xs mb-0.5">Formed</p>
                                                    <span className="text-base">{artist.intFormedYear}</span>
                                                </div>
                                            </div>
                                        )}
                                        {artist.intMembers > 0 && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                    <Users size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-zinc-500 text-xs mb-0.5">Members ({artist.strGender})</p>
                                                    <span className="text-base">{artist.intMembers} Active</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Social Media Links */}
                                <div className="pt-2">
                                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4">Social Media</h4>
                                    <div className="flex items-center gap-4">
                                        {artist.strWebsite && (
                                            <a href={artist.strWebsite} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-white hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg">
                                                <Globe size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

Artist.layout = (page) => <AppLayout>{page}</AppLayout>;