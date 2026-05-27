export default function PlayerCover({ currentSong, isLyricsMode }) {
    return (
        <div className={`relative z-10 flex flex-col items-center justify-center p-10 transition-all duration-700 ${isLyricsMode ? "w-0 opacity-0 p-0" : "w-full md:w-1/2 opacity-100"}`}>
            <div className="relative shadow-2xl rounded-xl overflow-hidden aspect-square max-w-[320px] w-full mb-8">
                <img
                    src={currentSong.album?.cover_xl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <h2 className="text-4xl font-black text-white text-center">
                {currentSong.title}
            </h2>
        </div>
    );
}