import { useGameStore } from "./store";
import { initAudio } from "./sounds";
import { initMusic } from "./music";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function GameOverScreen() {
  const timeSurvived   = useGameStore((s) => s.timeSurvived);
  const highScore      = useGameStore((s) => s.highScore);
  const wave           = useGameStore((s) => s.wave);
  const killCount      = useGameStore((s) => s.killCount);
  const sessionCoins   = useGameStore((s) => s.sessionCoins);
  const levelWon       = useGameStore((s) => s.levelWon);
  const currentLevel   = useGameStore((s) => s.currentLevel);
  const gameMode       = useGameStore((s) => s.gameMode);
  const musicVolume    = useGameStore((s) => s.musicVolume);
  const restart        = useGameStore((s) => s.restart);
  const setPhase       = useGameStore((s) => s.setPhase);

  const isNewBest = timeSurvived > 0 && timeSurvived >= highScore && gameMode === "endless";

  const handleRestart = () => {
    initAudio();
    initMusic(musicVolume);
    restart();
  };

  const handleMenu = () => {
    setPhase("start");
  };

  const handleNextLevel = () => {
    initAudio();
    initMusic(musicVolume);
    useGameStore.getState().setCurrentLevel(currentLevel + 1);
    restart();
  };

  const accent = levelWon ? "#22c55e" : "#ef4444";
  const accentDim = levelWon ? "#166534" : "#7f1d1d";

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.90)",
      zIndex: 100, fontFamily: "'Courier New', monospace",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, ${accent}10 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", background: "#07090f",
        border: `2px solid ${accent}40`,
        borderRadius: 20, padding: "44px 56px", textAlign: "center",
        boxShadow: `0 0 80px ${accent}20, inset 0 0 60px rgba(0,0,0,0.5)`,
        maxWidth: 480, width: "92%",
      }}>
        {/* Status icon */}
        <div style={{ fontSize: 52, marginBottom: 8 }}>
          {levelWon ? "🏆" : "💀"}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 42, fontWeight: 900, letterSpacing: 5,
          color: accent, marginBottom: 4,
          textShadow: `0 0 30px ${accent}80`,
        }}>
          {levelWon ? "VICTORY" : "GAME OVER"}
        </div>

        {levelWon && gameMode === "levels" && (
          <div style={{ color: "#888", fontSize: 12, letterSpacing: 3, marginBottom: 6 }}>
            LEVEL {currentLevel} COMPLETE
          </div>
        )}

        {/* New best badge */}
        {isNewBest && (
          <div style={{
            display: "inline-block",
            background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.4)",
            borderRadius: 6, padding: "5px 18px", marginBottom: 16,
            fontSize: 13, color: "#facc15", letterSpacing: 2,
          }}>
            ★ NEW BEST ★
          </div>
        )}

        {/* Stats grid */}
        <div style={{
          background: "#0a0e18", borderRadius: 12,
          padding: "20px 24px", marginBottom: 24,
          border: "1px solid rgba(255,255,255,0.06)",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "16px 28px", textAlign: "left",
        }}>
          {gameMode === "endless" && (
            <>
              <Stat icon="⏱" label="TIME" value={formatTime(timeSurvived)} color="#fff" large />
              <Stat icon="⏱" label="BEST"  value={formatTime(highScore)}    color="#facc15" large />
            </>
          )}
          <Stat icon="🌊" label="WAVE"     value={String(wave)}       color="#60a5fa" />
          <Stat icon="💀" label="KILLS"    value={String(killCount)}  color="#f87171" />
          <Stat icon="🪙" label="COINS +"  value={`+${sessionCoins}`} color="#f59e0b" />
          {gameMode === "levels" && levelWon && (
            <Stat icon="🎁" label="BONUS"   value="+REWARD"           color="#22c55e" />
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <ActionBtn
            label={levelWon && gameMode === "levels" && currentLevel < 12 ? "NEXT LEVEL" : "PLAY AGAIN"}
            color={accent}
            onClick={levelWon && gameMode === "levels" && currentLevel < 12 ? handleNextLevel : handleRestart}
          />
          <ActionBtn label="MENU" color="#334155" onClick={handleMenu} />
          {gameMode === "levels" && (
            <ActionBtn label="LEVELS" color="#1e3a5f" onClick={() => setPhase("levelselect")} />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color, large }: {
  icon: string; label: string; value: string; color: string; large?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 3 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: large ? 26 : 20, fontWeight: "bold", color }}>
        {value}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick }: {
  label: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color, color: "#fff", border: "none",
        borderRadius: 9, padding: "14px 28px", fontSize: 14,
        fontWeight: "bold", fontFamily: "'Courier New', monospace",
        letterSpacing: 2, cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.25)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
    >
      {label}
    </button>
  );
}
