import { useGameStore } from "./store";

export default function GameOverScreen() {
  const score = useGameStore((s) => s.score);
  const wave = useGameStore((s) => s.wave);
  const restart = useGameStore((s) => s.restart);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        zIndex: 100,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div
        style={{
          background: "#0d0d0d",
          border: "2px solid #ef4444",
          borderRadius: 16,
          padding: "48px 64px",
          textAlign: "center",
          boxShadow: "0 0 60px rgba(239,68,68,0.3)",
          maxWidth: 420,
          width: "90%",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#ef4444",
            letterSpacing: 4,
            marginBottom: 8,
            textShadow: "0 0 20px rgba(239,68,68,0.8)",
          }}
        >
          GAME OVER
        </div>

        <div style={{ color: "#666", fontSize: 12, letterSpacing: 3, marginBottom: 32 }}>
          YOU HAVE FALLEN
        </div>

        <div
          style={{
            background: "#1a1a1a",
            borderRadius: 10,
            padding: "20px 32px",
            marginBottom: 32,
            border: "1px solid #333",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#888", fontSize: 13 }}>FINAL SCORE</span>
            <span style={{ color: "#facc15", fontSize: 20, fontWeight: "bold" }}>
              {score.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#888", fontSize: 13 }}>WAVES SURVIVED</span>
            <span style={{ color: "#60a5fa", fontSize: 20, fontWeight: "bold" }}>{wave - 1}</span>
          </div>
        </div>

        <button
          onClick={restart}
          style={{
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 48px",
            fontSize: 16,
            fontWeight: "bold",
            fontFamily: "'Courier New', monospace",
            letterSpacing: 3,
            cursor: "pointer",
            transition: "background 0.2s, transform 0.1s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "#dc2626";
            (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "#ef4444";
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
          }}
          onMouseDown={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
          }}
        >
          RESTART
        </button>

        <div style={{ marginTop: 20, color: "#444", fontSize: 11, letterSpacing: 1 }}>
          WASD TO MOVE · CLICK TO SHOOT
        </div>
      </div>
    </div>
  );
}
