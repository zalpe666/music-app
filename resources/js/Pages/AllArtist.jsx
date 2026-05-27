import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";

const AllArtist = ({ artists = [] }) => {
    return (
        <>
            <Head title="Artists" />

            <div className="p-8">
                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white">
                        All Artists
                    </h1>

                    <p className="text-zinc-400 mt-2">
                        Browse all your favorite artists
                    </p>
                </div>

                {/* ARTIST GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {artists.length > 0 ? (
                        artists.map((artist) => (
                            <Link
                                key={artist.id}
                                href={`/artist/${artist.slug}`}
                                className="bg-zinc-900 hover:bg-zinc-800 transition rounded-2xl p-4 group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <img
                                        src={
                                            artist.image ||
                                            artist.picture_xl ||
                                            "/default-artist.png"
                                        }
                                        alt={artist.name}
                                        className="w-32 h-32 rounded-full object-cover shadow-lg"
                                    />

                                    <h2 className="text-white font-bold mt-4 text-lg line-clamp-1">
                                        {artist.name}
                                    </h2>

                                    <p className="text-zinc-400 text-sm mt-1">
                                        Artist
                                    </p>

                                    <p className="text-zinc-500 text-xs mt-2">
                                        {artist.songs?.length || 0} Songs
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-zinc-500 col-span-full">
                            No artists found
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

AllArtist.layout = (page) => <AppLayout>{page}</AppLayout>;

export default AllArtist;