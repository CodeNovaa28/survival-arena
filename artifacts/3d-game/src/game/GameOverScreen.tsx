import { useGameStore } from "./store";
import { initAudio } from "./sounds";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GameOverScreen() {
  const timeSurvived = useGameStore((s) => s.timeSurvived);
  const highScore    = useGameStore((s) => s.highScore);
  const wave         = useGameStore((s) => s.wave);
  const killCount    = useGameStore((s) => s.killCount);
  const restart      = useGameStore((s) => s.restart);
  const setPhase     = useGameStore((s) => s.setPhase);

  const isNewBest = timeSurvived >= highScore && timeSurvived > 0;

  const handleRestart = () => {
    initAudio();
    restart();
  };

  const handleMenu = () => {
    setPhase("start");
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.88)",
        zIndex: 100,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div
        style={{
          background: "#080e14",
          border: "2px solid #ef444455",
          borderRadius: 18,
          padding: "44px 60px",
          textAlign: "center",
          boxShadow: "0 0 80px rgba(239,68,68,0.2)",
          maxWidth: 440,
          width: "90%",
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: "bold",
            color: "#ef4444",
            letterSpacing: 5,
            textShadow: "0 0 30px rgba(239,68,68,0.7)",
            marginBottom: 6,
          }}
        >
          GAME OVER
        </div>
        <div style={{ color: "#444", fontSize: 11, letterSpacing: 3, marginBottom: 28 }}>
          YOU HAVE FALLEN
        </div>

        {/* New best badge */}
        {isNewBest && (
          <div
            style={{
              background: "rgba(250,204,21,0.1)",
              border: "1px solid rgba(250,204,21,0.4)",
              borderRadius: 8,
              padding: "6px 20px",
              marginBottom: 20,
              fontSize: 12,
              color: "#facc15",
              letterSpacing: 2,
            }}
          >
            ★ NEW BEST ★
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            background: "#0d1520",
            borderRadius: 10,
            padding: "18px 28px",
            marginBottom: 28,
            border: "1px solid #1a2a3a",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px 24px",
            textAlign: "left",
          }}
        >
          <Stat label="TIME" value={formatTime(timeSurvived)} color="#fff" large />
          <Stat label="BEST" value={formatTime(highScore)} color="#facc15" large />
          <Stat label="WAVE" value={String(wave)} color="#60a5fa" />
          <Stat label="KILLS" value={String(killCount)} color="#22c55e" />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={handleRestart}
            style={btnStyle("#ef4444", "#b91c1c")}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#f87171"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#ef4444"; }}
          >
            RESTART
          </button>
          <button
            onClick={handleMenu}
            style={btnStyle("#1e3a5f", "#0d1a2a")}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#2a4a6f"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#1e3a5f"; }}
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label, value, color, large,
}: {
  label: string; value: string; color: string; large?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>{label}</div>
      <div style={{ fontSize: large ? 22 : 18, fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

function btnStyle(bg: string, _hover: string): React.CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "13px 32px",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    letterSpacing: 3,
    cursor: "pointer",
    transition: "background 0.15s, transform 0.1s",
  };
}
