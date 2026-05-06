import { useGameStore } from "./store";
import { initAudio } from "./sounds";

export default function StartScreen() {
  const highScore = useGameStore((s) => s.highScore);
  const restart = useGameStore((s) => s.restart);

  const handleStart = () => {
    initAudio();
    restart();
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at center, #0d1a2a 0%, #050a10 100%)",
        zIndex: 100,
        fontFamily: "'Courier New', monospace",
        overflow: "hidden",
      }}
    >
      {/* Animated background dots */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: "#60a5fa",
              left: `${(i * 47) % 100}%`,
              top: `${(i * 31) % 100}%`,
              animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.3) % 2}s`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "48px 64px",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(96,165,250,0.3)",
          borderRadius: 20,
          backdropFilter: "blur(8px)",
          maxWidth: 500,
          width: "90%",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 14,
            color: "#ef4444",
            letterSpacing: 6,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          — survival —
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: "bold",
            color: "#fff",
            letterSpacing: 4,
            lineHeight: 1,
            marginBottom: 4,
            textShadow: "0 0 40px rgba(96,165,250,0.6)",
          }}
        >
          ZONE
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: "bold",
            color: "#60a5fa",
            letterSpacing: 4,
            lineHeight: 1,
            marginBottom: 32,
            textShadow: "0 0 40px rgba(96,165,250,0.8)",
          }}
        >
          BREACH
        </div>

        {/* High score */}
        {highScore > 0 && (
          <div
            style={{
              background: "rgba(250,204,21,0.1)",
              border: "1px solid rgba(250,204,21,0.3)",
              borderRadius: 8,
              padding: "10px 20px",
              marginBottom: 28,
              display: "inline-block",
            }}
          >
            <span style={{ color: "#888", fontSize: 12, letterSpacing: 2 }}>BEST </span>
            <span style={{ color: "#facc15", fontSize: 18, fontWeight: "bold" }}>
              {formatTime(highScore)}
            </span>
          </div>
        )}

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 20px",
            marginBottom: 32,
            fontSize: 12,
            color: "#666",
            textAlign: "left",
            padding: "12px 16px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ color: "#aaa" }}>WASD</span><span>Move</span>
          <span style={{ color: "#aaa" }}>Click</span><span>Shoot toward cursor</span>
          <span style={{ color: "#aaa" }}>Survive</span><span>Avoid the zone edge</span>
          <span style={{ color: "#aaa" }}>Collect</span><span>Power-ups for boosts</span>
        </div>

        {/* Enemy legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 32 }}>
          {([
            { color: "#ef4444", label: "Chaser" },
            { color: "#7c3aed", label: "Tank" },
            { color: "#f97316", label: "Ranged" },
            { color: "#06b6d4", label: "Speeder" },
            { color: "#84cc16", label: "Bomber" },
          ] as const).map((e) => (
            <div key={e.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 12, background: e.color, borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>{e.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "#fff",
            border: "1px solid rgba(96,165,250,0.5)",
            borderRadius: 10,
            padding: "16px 56px",
            fontSize: 18,
            fontWeight: "bold",
            fontFamily: "'Courier New', monospace",
            letterSpacing: 4,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 0 30px rgba(59,130,246,0.4)",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "linear-gradient(135deg, #60a5fa, #3b82f6)";
            (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "linear-gradient(135deg, #3b82f6, #1d4ed8)";
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          PLAY
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
