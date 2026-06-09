import { motion, AnimatePresence } from "framer-motion";

export default function PlayerCover({ currentSong, isLyricsMode, direction }) {
    // Konfigurasi variasi animasi framer-motion
    const variants = {
        enter: (dir) => ({
            x: dir > 0 ? 100 : -100, // Jika next, masuk dari kanan. Jika prev, masuk dari kiri
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? -100 : 100, // Jika next, keluar ke kiri. Jika prev, keluar ke kanan
            opacity: 0,
        }),
    };

    return (
        <div className={`relative z-10 flex flex-col items-center justify-center p-10 transition-all duration-700 ${isLyricsMode ? "w-0 opacity-0 p-0" : "w-full md:w-1/2 opacity-100"}`}>
            
            {/* mode="wait" memastikan elemen lama keluar dulu baru elemen baru masuk */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    // Gunakan ID lagu sebagai key agar React tahu ini elemen yang berbeda
                    key={currentSong?.id || currentSong?.title} 
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "easeInOut" }} // Durasi dan transisi yang smooth
                    className="flex flex-col items-center justify-center w-full"
                >
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
                </motion.div>
            </AnimatePresence>

        </div>
    );
}