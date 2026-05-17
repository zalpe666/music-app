import AppLayout from "@/Layouts/AppLayout";

const Library = () => {
    const playlists = [
        {
            title: "Coding Vibes 💻",
            songs: 32,
        },
        {
            title: "Late Night Drive 🌙",
            songs: 18,
        },
        {
            title: "Gaming RGB ⚡",
            songs: 45,
        },
        {
            title: "Sad Songs 🥀",
            songs: 27,
        },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white">
                    Your Library
                </h1>
                <p className="text-zinc-400 mt-2">
                    Your playlists and liked songs
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {playlists.map((playlist, index) => (
                    <div
                        key={index}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl p-6 transition cursor-pointer"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 mb-5" />
                        <h2 className="text-xl font-bold text-white">
                            {playlist.title}
                        </h2>
                        <p className="text-zinc-400 mt-2">
                            {playlist.songs} songs
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// PERSISTENT LAYOUT
Library.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Library;