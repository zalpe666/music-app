import { X, Video } from "lucide-react";

export default function VideoModal({
    isOpen,
    onClose,
    currentSong,
}) {
    if (!isOpen || !currentSong) return null;

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;

        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

        const match = url.match(regExp);

        return match && match[2].length === 11
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
            : null;
    };

    const embedUrl = getYouTubeEmbedUrl(
        currentSong?.youtube_url
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-6xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Video
                            size={18}
                            className="text-green-500"
                        />

                        <div>
                            <h3 className="text-white font-semibold">
                                {currentSong.title}
                            </h3>

                            <p className="text-xs text-zinc-400">
                                {currentSong.artists
                                    ?.map((a) => a.name)
                                    .join(", ")}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* VIDEO */}
                <div className="aspect-video bg-black">
                    {currentSong?.local_video_path ? (
                        <video
                            src={`/video/${currentSong.local_video_path}`}
                            controls
                            autoPlay
                            className="w-full h-full"
                        />
                    ) : embedUrl ? (
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title={currentSong.title}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-500">
                            No video available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}