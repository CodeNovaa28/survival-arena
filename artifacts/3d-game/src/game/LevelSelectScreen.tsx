import { useGameStore } from "./store";
import { LEVELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "./gameLevels";
import { MAPS } from "./gameMaps";
import { initAudio } from "./sounds";
import { initMusic } from "./music";

export default function LevelSelectScreen() {
  const highestUnlockedLevel = useGameStore((s) => s.highestUnlockedLevel);
  const completedLevels      = useGameStore((s) => s.completedLevels);
  const musicVolume          = useGameStore((s) => s.musicVolume);
  const setPhase             = useGameStore((s) => s.setPhase);
  const setGameMode          = useGameStore((s) => s.setGameMode);
  const setCurrentLevel      = useGameStore((s) => s.setCurrentLevel);
  const restart              = useGameStore((s) => s.restart);

  const playLevel = (levelId: number) => {
    if (levelId > highestUnlockedLevel) return;
    initAudio();
    initMusic(musicVolume);
    setGameMode("levels");
    setCurrentLevel(levelId);
    restart();
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 20%, #0a1628 0%, #020508 100%)",
      fontFamily: "'Courier New', monospace",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 32px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.4)", flexShrink: 0,
      }}>
        <button
          onClick={() => setPhase("start")}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: "#94a3b8", borderRadius: 8, padding: "8px 18px",
            cursor: "pointer", fontSize: 13, fontFamily: "'Courier New', monospace",
            letterSpacing: 1,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
        >
          ← BACK
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: 5 }}>MISSIONS</div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>
            {completedLevels.length} / {LEVELS.length} COMPLETE
          </div>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Level grid */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "24px 32px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
        gap: 14, alignContent: "start",
      }}>
        {LEVELS.map((level) => {
          const unlocked   = level.id <= highestUnlockedLevel;
          const completed  = completedLevels.includes(level.id);
          const map        = MAPS.find((m) => m.id === level.mapId);
          const diffColor  = DIFFICULTY_COLORS[level.difficulty];
          const diffLabel  = DIFFICULTY_LABELS[level.difficulty];

          return (
            <div
              key={level.id}
              onClick={() => unlocked && playLevel(level.id)}
              style={{
                background: unlocked
                  ? completed
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.4)",
                border: completed
                  ? "1px solid rgba(34,197,94,0.35)"
                  : unlocked
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(255,255,255,0.04)",
                borderRadius: 12, padding: "18px 16px",
                cursor: unlocked ? "pointer" : "default",
                opacity: unlocked ? 1 : 0.4,
                transition: "all 0.18s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!unlocked) return;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Map color stripe */}
              {map && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: map.theme.obstacleAccent,
                  opacity: 0.7,
                }} />
              )}

              {/* Level number + status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{
                  fontSize: 11, fontWeight: "bold", color: "#444", letterSpacing: 2,
                }}>
                  LVL {level.id.toString().padStart(2, "0")}
                </div>
                <div style={{ fontSize: 16 }}>
                  {!unlocked ? "🔒" : completed ? "✅" : "▶"}
                </div>
              </div>

              {/* Name */}
              <div style={{ fontSize: 14, fontWeight: "bold", color: unlocked ? "#fff" : "#555", marginBottom: 4, letterSpacing: 1 }}>
                {level.name}
              </div>

              {/* Map badge */}
              {map && (
                <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>
                  {map.badge} {map.name}
                </div>
              )}

              {/* Difficulty */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: i < level.difficulty ? diffColor : "rgba(255,255,255,0.08)",
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 10, color: diffColor }}>{diffLabel}</span>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555" }}>
                <span>⚔️ {level.waves} waves</span>
                <span style={{ color: "#f59e0b" }}>🪙 +{level.reward}</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
