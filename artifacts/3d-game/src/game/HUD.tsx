import { useGameStore } from "./store";

const ENEMY_KILL_SCORES: Record<string, number> = {
  chaser: 10,
  tank: 30,
  ranged: 20,
};

export default function HUD() {
  const playerHp = useGameStore((s) => s.playerHp);
  const maxPlayerHp = useGameStore((s) => s.maxPlayerHp);
  const score = useGameStore((s) => s.score);
  const wave = useGameStore((s) => s.wave);
  const enemies = useGameStore((s) => s.enemies);

  const hpPercent = Math.max(0, (playerHp / maxPlayerHp) * 100);
  const hpColor = hpPercent > 50 ? "#22c55e" : hpPercent > 25 ? "#f97316" : "#ef4444";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Top-left: Health */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.75)",
          border: "1px solid #444",
          borderRadius: 8,
          padding: "10px 16px",
          color: "#fff",
          minWidth: 200,
        }}
      >
        <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2, marginBottom: 4 }}>HEALTH</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              flex: 1,
              height: 12,
              background: "#222",
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid #555",
            }}
          >
            <div
              style={{
                width: `${hpPercent}%`,
                height: "100%",
                background: hpColor,
                borderRadius: 6,
                transition: "width 0.1s, background 0.3s",
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: "bold", color: hpColor, minWidth: 50, textAlign: "right" }}>
            {Math.ceil(playerHp)}/{maxPlayerHp}
          </span>
        </div>
      </div>

      {/* Top-right: Score + Wave */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(0,0,0,0.75)",
          border: "1px solid #444",
          borderRadius: 8,
          padding: "10px 16px",
          color: "#fff",
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2 }}>SCORE</div>
        <div style={{ fontSize: 26, fontWeight: "bold", color: "#facc15" }}>{score.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: "#60a5fa", letterSpacing: 1, marginTop: 4 }}>WAVE {wave}</div>
      </div>

      {/* Bottom: Enemy count + legend */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.75)",
          border: "1px solid #444",
          borderRadius: 8,
          padding: "8px 20px",
          color: "#fff",
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 12, color: "#aaa" }}>
          ENEMIES: <span style={{ color: "#fff", fontWeight: "bold" }}>{enemies.length}</span>
        </div>
        <div style={{ width: 1, height: 20, background: "#444" }} />
        <EnemyBadge color="#ef4444" label="Chaser" desc="+10" />
        <EnemyBadge color="#7c3aed" label="Tank" desc="+30" />
        <EnemyBadge color="#f97316" label="Ranged" desc="+20" />
      </div>

      {/* Controls reminder */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          background: "rgba(0,0,0,0.6)",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#888",
          fontSize: 11,
          lineHeight: 1.8,
        }}
      >
        <div>WASD — Move</div>
        <div>Click — Shoot</div>
      </div>
    </div>
  );
}

function EnemyBadge({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
      <span style={{ fontSize: 12, color: "#ccc" }}>{label}</span>
      <span style={{ fontSize: 11, color: "#facc15" }}>{desc}</span>
    </div>
  );
}
