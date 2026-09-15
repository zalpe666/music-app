import { useState } from "react";
import { Globe, MapPin, Sparkles, Play, Mic2, Video, X } from "lucide-react";
import usePlayerStore from "@/Stores/playerStore";
import { Link, router } from "@inertiajs/react";

export default function SidebarRight({
    showRightSidebar,
    currentSong,
    rightTab,
    setRightTab,
    isShuffle,
    songs,
    currentIndex,
    playSong
}) {
    const { showVideoModal, toggleVideoModal, setShowVideoPlayer } = usePlayerStore();
    const mainArtist = currentSong?.artists?.[0];

    // FUNGSI UNTUK MENGUBAH URL YOUTUBE MENJADI URL EMBED (Fallback)
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
            : null;
    };

    const embedUrl = getYouTubeEmbedUrl(currentSong?.youtube_url);

    return (
        <aside className={`
            hidden lg:flex flex-col shrink-0 bg-zinc-950/90 backdrop-blur-2xl border-l border-white/10
            transition-all duration-500 ease-in-out overflow-hidden z-20
            ${showRightSidebar ? "w-[340px] opacity-100" : "w-0 opacity-0 border-l-0"}
        `}>
            {currentSong ? (
                <>
                    {/* TAB BUTTON */}
                    <div className="p-6 pb-2 shrink-0">
                        <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-white/5 shadow-inner">
                            <button
                                onClick={() => setRightTab("details")}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${rightTab === "details" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setRightTab("queue")}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${rightTab === "queue" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Queue
                            </button>
                        </div>
                    </div>

                    {/* DETAILS TAB */}
                    {rightTab === "details" && (
                        <div className="flex-1 overflow-y-auto scrollbar-hide pb-6">
                            {/* COVER & INFO */}
                            <div className="px-6 pt-4 pb-6 flex flex-col items-center text-center">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-6 w-full max-w-[240px] group">
                                    <img
                                        src={mainArtist?.picture_xl || currentSong.album?.cover_xl || currentSong.album?.cover_medium}
                                        alt={currentSong.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-white line-clamp-2 leading-tight mb-1 flex items-center justify-center gap-2">
                                    {currentSong.title}
                                    {currentSong.explicit_lyrics == 1 && (
                                        <span className="text-[9px] font-black bg-zinc-200 text-zinc-900 px-1.5 py-0.5 rounded-sm shrink-0">E</span>
                                    )}
                                </h2>
                                
                                {currentSong?.description && (
                                    <p className="text-sm font-medium text-zinc-400 leading-tight mb-2">
                                        {currentSong.description}
                                    </p>
                                )}

                                <div className="text-sm text-zinc-400 font-medium mt-1">
                                    {currentSong.artists && currentSong.artists.map((artist, index) => (
                                        <span key={artist.id}>
                                            <Link href={`/artist/${artist.slug || artist.id}`} className="hover:text-white transition-colors">
                                                {artist.name}
                                            </Link>
                                            {index < currentSong.artists.length - 1 && <span>, </span>}
                                        </span>
                                    ))}
                                </div>

                                {(currentSong.local_video_path || embedUrl) && (
                                    <button
                                        onClick={() => {
                                            setShowVideoPlayer(true);
                                            router.visit("/player");
                                        }}
                                        className="mt-6 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 border border-white/5 hover:border-white/20 hover:shadow-lg"
                                    >
                                        <Video size={18} />
                                        Watch Music Video
                                    </button>
                                )}
                            </div>

                            {/* ALBUM CARD */}
                            <div className="px-6 mb-6">
                                <Link href={`/album/${currentSong.album?.slug || currentSong.album?.id}`} className="block bg-zinc-900/40 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl p-3 border border-white/5 hover:border-white/10 group">
                                    <div className="flex items-center gap-4">
                                        <img src={currentSong.album?.cover_xl} alt="Album Cover" referrerPolicy="no-referrer" className="w-14 h-14 rounded-lg object-cover shadow-md" />
                                        <div className="flex flex-col truncate flex-1">
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">From the Album</p>
                                            <h3 className="font-bold text-zinc-200 group-hover:text-white transition-colors truncate">{currentSong.album?.title}</h3>
                                            <p className="text-xs text-zinc-500 mt-0.5 truncate">{currentSong.album?.release_date?.substring(0, 4) || 'Album'}</p>
                                        </div>
                                        <Play size={16} className="text-zinc-600 group-hover:text-white mr-2 transition-colors" />
                                    </div>
                                </Link>
                            </div>

                            {/* ARTIST INFO / LYRICS SECTION */}
                            <div className="px-6">
                                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                                    {mainArtist?.strArtistFanart && (
                                        <div className="relative h-28 w-full bg-zinc-950 overflow-hidden">
                                            <img src={mainArtist.strArtistFanart} alt="Artist Fanart" className="w-full h-full object-cover opacity-50 mix-blend-screen hover:scale-105 hover:opacity-70 transition-all duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
                                            {mainArtist?.strArtistLogo && (
                                                <img src={mainArtist.strArtistLogo} alt="Artist Logo" className="absolute bottom-3 left-4 h-8 object-contain drop-shadow-2xl brightness-110" />
                                            )}
                                        </div>
                                    )}

                                    <div className={`p-5 ${mainArtist?.strArtistFanart ? 'pt-3' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-white text-sm">About {mainArtist?.name || 'Artist'}</h3>
                                            {mainArtist?.strCountry && (
                                                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                                    <MapPin size={10} /> {mainArtist.strCountry}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {mainArtist?.genre?.name && (
                                                <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-[10px] rounded-md font-semibold border border-white/5">
                                                    {mainArtist.genre.name}
                                                </span>
                                            )}

                                            {mainArtist?.mood?.name && (
                                                <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] rounded-md font-semibold border border-green-500/20">
                                                    {mainArtist.mood.name}
                                                </span>
                                            )}

                                            {mainArtist?.style?.name && (
                                                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-md font-semibold border border-blue-500/20">
                                                    {mainArtist.style.name}
                                                </span>
                                            )}
                                        </div>

                                        {currentSong?.description ? (
                                            <p className="text-xs text-zinc-400 line-clamp-4 leading-relaxed mb-5 hover:line-clamp-none transition-all duration-300 cursor-pointer">
                                                <span className="font-bold text-zinc-200 block mb-1">Track Info: </span>
                                                {currentSong.description}
                                            </p>
                                        ) : mainArtist?.strBiography ? (
                                            <p className="text-xs text-zinc-400 line-clamp-4 leading-relaxed mb-5 hover:line-clamp-none transition-all duration-300 cursor-pointer">
                                                {mainArtist.strBiography}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-zinc-600 mb-5 italic">Biography not available.</p>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                                {mainArtist?.intFormedYear && <span>Est. {mainArtist.intFormedYear}</span>}
                                                {mainArtist?.intMembers > 1 && <span>• {mainArtist.intMembers} Members</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {mainArtist?.strWebsite && (
                                                    <a href={mainArtist.strWebsite} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-all">
                                                        <Globe size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QUEUE TAB */}
                    {rightTab === "queue" && (
                        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                            {/* NOW PLAYING */}
                            <div className="mb-8">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                    Now Playing
                                </p>
                                <div className="flex items-center gap-4 bg-zinc-800/40 rounded-2xl p-3.5 border border-white/5 shadow-lg">
                                    <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden shadow-md">
                                        <img src={currentSong.album?.cover_xl || currentSong.cover_small} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                                        <div className="absolute inset-0 flex items-center justify-center gap-0.5 z-10 bg-black/20">
                                            <div className="w-1 h-3.5 bg-blue-400 rounded-full animate-[bounce_1s_infinite]" />
                                            <div className="w-1 h-5 bg-blue-400 rounded-full animate-[bounce_1.2s_infinite]" />
                                            <div className="w-1 h-2.5 bg-blue-400 rounded-full animate-[bounce_0.8s_infinite]" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white font-bold truncate text-sm flex items-center gap-2 mb-0.5">
                                            {currentSong.title}
                                            {currentSong.explicit_lyrics === 1 && <span className="text-[8px] font-black bg-zinc-200 text-black px-1 rounded-sm shrink-0">E</span>}
                                        </p>
                                        <p className="text-zinc-400 text-xs truncate font-medium">{currentSong.artists?.map(a => a.name).join(', ')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* NEXT QUEUE */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        {isShuffle ? "Up Next (AI)" : "Up Next"}
                                    </p>
                                    {isShuffle && (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                                            <Sparkles size={12} className="animate-pulse" />
                                            Auto-Pilot
                                        </span>
                                    )}
                                </div>

                                {isShuffle ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-5 text-center rounded-2xl bg-gradient-to-b from-zinc-800/50 to-transparent border border-white/5 shadow-inner">
                                        <div className="relative mb-5">
                                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                                            <Sparkles className="relative text-green-400 animate-pulse" size={32} />
                                        </div>
                                        <h4 className="text-white text-sm font-bold mb-2">AI Vibe Matching</h4>
                                        <p className="text-zinc-400 text-xs leading-relaxed max-w-[200px]">
                                            Curating the perfect next track based on the current mood, genre, and style.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {songs.slice(currentIndex + 1).map((song, index) => (
                                            <div key={song.id} onClick={() => playSong(song, currentIndex + 1 + index)} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 hover:pr-4">
                                                <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden shadow-sm">
                                                    <img src={song.album?.cover_xl || song.cover_small} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40" alt="Cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <Play size={18} className="text-white fill-white shadow-lg" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-zinc-300 text-sm font-semibold truncate group-hover:text-white transition-colors">{song.title}</p>
                                                    <p className="text-zinc-500 text-xs truncate group-hover:text-zinc-400 transition-colors mt-0.5">{song.artists?.map(a => a.name).join(', ')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4 opacity-70">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shadow-inner">
                        <Mic2 size={28} className="text-zinc-600" />
                    </div>
                    <p className="text-sm font-semibold tracking-wide">No tracks playing</p>
                </div>
            )}
        </aside>
    );
}