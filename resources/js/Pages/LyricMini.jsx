import AppLayout from "@/Layouts/AppLayout";
import usePlayerStore from "@/Stores/playerStore";
import { ChevronDown } from "lucide-react";

const LyricMini = () => {
    const { currentSong } = usePlayerStore();
    
    // Kamu bisa pakai logic parsing lirik yang sama seperti di PlayerMini
    // Untuk mempersingkat, saya tampilkan konten dasarnya dulu
    return (
        <div className="h-screen bg-zinc-950 text-white p-6 overflow-y-auto">
            <button onClick={() => window.history.back()} className="mb-6">
                <ChevronDown size={28} />
            </button>
            <h1 className="text-2xl font-bold mb-4">{currentSong?.title}</h1>
            <p className="text-zinc-400 whitespace-pre-line">
                {/* Tampilkan lirik penuh hasil fetch disini */}
                Lirik penuh akan tampil di sini...
            </p>
        </div>
    );
};
LyricMini.layout = (page) => <AppLayout>{page}</AppLayout>;
export default LyricMini;