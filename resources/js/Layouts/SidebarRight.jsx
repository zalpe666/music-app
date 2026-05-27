import { Link } from "@inertiajs/react";
import { Globe, MapPin, Sparkles, Play, Mic2 } from "lucide-react";

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
    return (
        <aside className={`
            hidden lg:flex flex-col shrink-0 bg-zinc-950 border-l border-white/10
            transition-all duration-500 ease-in-out overflow-hidden
            ${showRightSidebar ? "w-[320px] opacity-100" : "w-0 opacity-0 border-l-0"}
        `}>
            {currentSong ? (
                <>
                    {/* TAB BUTTON */}
                    <div className="p-5 pb-3">
                        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setRightTab("details")}
                                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${rightTab === "details" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setRightTab("queue")}
                                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${rightTab === "queue" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                            >
                                Queue
                            </button>
                        </div>
                    </div>

                    {/* DETAILS TAB */}
                    {rightTab === "details" && (
                        <div className="flex-1 overflow-y-auto scrollbar-hide pb-6">
                            {/* COVER & INFO */}
                            <div className="px-5 pt-2 pb-4">
                                <div className="relative rounded-xl overflow-hidden shadow-2xl mb-5">
                                    <img
                                        src={currentSong.artist?.picture_xl || currentSong.album?.cover_medium}
                                        alt={currentSong.title}
                                        className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-white line-clamp-2 leading-tight">
                                    {currentSong.title}
                                </h2>
                                {currentSong.explicit_lyrics == 1 && (
                                    <span className="text-[8px] font-black bg-zinc-700 text-zinc-300 px-1 rounded-sm border border-zinc-600">E</span>
                                )}
                                <Link href={`/artist/${currentSong.artist?.slug}`} className="text-zinc-400 hover:text-white hover:underline transition mt-1 inline-block">
                                    {currentSong.artist?.name}
                                </Link>
                            </div>

                            {/* ALBUM CARD */}
                            <div className="px-5 mb-6">
                                <Link href={`/album/${currentSong.album?.slug}`} className="block bg-zinc-900/50 hover:bg-zinc-800 transition rounded-xl p-4 border border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <img src={currentSong.album?.cover_xl} alt="Album Cover" className="w-12 h-12 rounded object-cover shadow-lg" />
                                        <div className="flex flex-col truncate">
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Album</p>
                                            <h3 className="font-semibold text-white group-hover:text-accent transition truncate">{currentSong.album?.title}</h3>
                                            <p className="text-xs text-zinc-400 mt-0.5 truncate">{currentSong.artist?.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* ARTIST INFO / LYRICS SECTION */}
                            <div className="px-5">
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
                                    {currentSong.artist?.strArtistFanart && (
                                        <div className="relative h-24 w-full bg-zinc-800">
                                            <img src={currentSong.artist.strArtistFanart} alt="Artist Fanart" className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
                                            {currentSong.artist?.strArtistLogo && (
                                                <img src={currentSong.artist.strArtistLogo} alt="Artist Logo" className="absolute bottom-2 left-4 h-8 object-contain drop-shadow-lg" />
                                            )}
                                        </div>
                                    )}

                                    <div className={`p-5 ${currentSong.artist?.strArtistFanart ? 'pt-2' : ''}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-white">About Artist</h3>
                                            {currentSong.artist?.strCountry && (
                                                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                                                    <MapPin size={10} /> {currentSong.artist.strCountry}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {currentSong.artist?.strGenre && <span className="px-2 py-1 bg-white/10 text-zinc-300 text-[10px] rounded-md font-medium border border-white/5">{currentSong.artist.strGenre}</span>}
                                            {currentSong.artist?.strMood && <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded-md font-medium border border-green-500/20">{currentSong.artist.strMood}</span>}
                                            {currentSong.artist?.strStyle && <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-md font-medium border border-blue-500/20">{currentSong.artist.strStyle}</span>}
                                        </div>

                                        {currentSong.artist?.strBiography ? (
                                            <p className="text-xs text-zinc-400 line-clamp-4 leading-relaxed mb-4 hover:line-clamp-none transition-all duration-300 cursor-pointer">
                                                {currentSong.artist.strBiography}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-zinc-600 mb-4 italic">Biography not available.</p>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                                {currentSong.artist?.intFormedYear && <span>Est. {currentSong.artist.intFormedYear}</span>}
                                                {currentSong.artist?.intMembers > 1 && <span>{currentSong.artist.intMembers} Members</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {currentSong.artist?.strWebsite && (
                                                    <a href={currentSong.artist.strWebsite} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
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
                        <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
                            <h2 className="text-xl font-bold text-white mb-6">Queue</h2>

                            {/* NOW PLAYING */}
                            <div className="mb-8">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Now Playing</p>
                                <div className="flex items-center gap-4 bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                                    <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden">
                                        <img src={currentSong.album?.cover_xl || currentSong.cover_small} className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center gap-0.5 z-10">
                                            <div className="w-1 h-3 bg-blue-500 rounded-full animate-[bounce_1s_infinite]" />
                                            <div className="w-1 h-5 bg-blue-500 rounded-full animate-[bounce_1.2s_infinite]" />
                                            <div className="w-1 h-2 bg-blue-500 rounded-full animate-[bounce_0.8s_infinite]" />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-accent font-semibold truncate flex items-center gap-2">
                                            {currentSong.title}
                                            {currentSong.explicit_lyrics === 1 && <span className="text-[8px] font-black bg-zinc-700 text-zinc-300 px-1 rounded-sm border border-zinc-600">E</span>}
                                        </p>
                                        <p className="text-zinc-400 text-sm truncate">{currentSong.artist?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* NEXT QUEUE */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        {isShuffle ? "AI Auto-Pilot" : "Next Up"}
                                    </p>
                                    {isShuffle && <Sparkles size={14} className="text-green-500 animate-pulse" />}
                                </div>

                                {isShuffle ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 mt-2">
                                        <div className="relative mb-4">
                                            <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full"></div>
                                            <Sparkles className="relative text-green-500 animate-pulse" size={36} />
                                        </div>
                                        <h4 className="text-zinc-200 text-sm font-medium mb-1.5">AI Vibe Matching</h4>
                                        <p className="text-zinc-500 text-xs leading-relaxed px-2">
                                            Our intelligent DJ is analyzing your current track to curate the perfect next song based on mood, genre, and style.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {songs.slice(currentIndex + 1).map((song, index) => (
                                            <div key={song.id} onClick={() => playSong(song, currentIndex + 1 + index)} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                                <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden">
                                                    <img src={song.album?.cover_xl || song.cover_small} className="w-full h-full object-cover transition-opacity group-hover:opacity-40" alt="Cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play size={16} className="text-white fill-white" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-zinc-200 text-sm font-medium truncate group-hover:text-white">{song.title}</p>
                                                    <p className="text-zinc-500 text-xs truncate group-hover:text-zinc-400">{song.artist?.name}</p>
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
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <Mic2 size={24} className="text-zinc-600" />
                    </div>
                    <p className="text-sm font-medium">Tidak ada lagu diputar</p>
                </div>
            )}
        </aside>
    );
}