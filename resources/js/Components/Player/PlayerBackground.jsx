export default function PlayerBackground({ coverUrl }) {
    if (!coverUrl) return null;

    return (
        <div
            className="absolute inset-0 opacity-40 blur-[90px] pointer-events-none transition-all duration-1000"
            style={{
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        />
    );
}