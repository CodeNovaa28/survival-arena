import { useGameStore, PowerUpType } from "./store";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const POWERUP_COLORS: Record<PowerUpType, string> = {
  speed:     "#06b6d4",
  shield:    "#3b82f6",
  rapidfire: "#facc15",
  heal:      "#22c55e",
};

const POWERUP_ICONS: Record<PowerUpType, string> = {
  speed:     "⚡",
  shield:    "🛡",
  rapidfire: "🔥",
  heal:      "💊",
};

const POWERUP_LABELS: Record<PowerUpType, string> = {
  speed:     "SPEED",
  shield:    "SHIELD",
  rapidfire: "RAPID",
  heal:      "HEAL",
};

export default function HUD() {
  const playerHp       = useGameStore((s) => s.playerHp);
  const maxPlayerHp    = useGameStore((s) => s.maxPlayerHp);
  const timeSurvived   = useGameStore((s) => s.timeSurvived);
  const highScore      = useGameStore((s) => s.highScore);
  const wave           = useGameStore((s) => s.wave);
  const killCount      = useGameStore((s) => s.killCount);
  const enemies        = useGameStore((s) => s.enemies);
  const activePowerUps = useGameStore((s) => s.activePowerUps);
  const safeZoneRadius = useGameStore((s) => s.safeZoneRadius);
  const playerPos      = useGameStore((s) => s.playerPosition);

  const hpPct = Math.max(0, (playerHp / maxPlayerHp) * 100);
  const hpColor = hpPct > 50 ? "#22c55e" : hpPct > 25 ? "#f97316" : "#ef4444";

  const playerDist = Math.sqrt(playerPos.x ** 2 + playerPos.z ** 2);
  const outsideZone = playerDist > safeZoneRadius;
  const isNewBest = timeSurvived > 0 && timeSurvived >= highScore;

  const hasShield = activePowerUps.some((p) => p.type === "shield");

  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* ── Top center: TIME ── */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10,
          padding: "8px 24px",
        }}
      >
        <div style={{ fontSize: 11, color: "#666", letterSpacing: 3, marginBottom: 2 }}>TIME SURVIVED</div>
        <div
          style={{
            fontSize: 34,
            fontWeight: "bold",
            color: isNewBest ? "#facc15" : "#fff",
            letterSpacing: 2,
            textShadow: isNewBest ? "0 0 20px rgba(250,204,21,0.6)" : "none",
          }}
        >
          {formatTime(timeSurvived)}
        </div>
        {highScore > 0 && (
          <div style={{ fontSize: 10, color: "#facc15", marginTop: 2, letterSpacing: 1 }}>
            BEST {formatTime(highScore)}
          </div>
        )}
      </div>

      {/* ── Top left: HP ── */}
      <div
        style={{
          position: "absolute",
          top: 16, left: 16,
          background: "rgba(0,0,0,0.7)",
          border: `1px solid ${hasShield ? "#3b82f6" : "rgba(255,255,255,0.12)"}`,
          borderRadius: 10,
          padding: "10px 16px",
          minWidth: 180,
          boxShadow: hasShield ? "0 0 16px rgba(59,130,246,0.4)" : "none",
        }}
      >
        <div style={{ fontSize: 10, color: "#666", letterSpacing: 2, marginBottom: 5 }}>
          {hasShield ? "⚡ SHIELDED" : "HEALTH"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1, height: 10,
              background: "#111",
              borderRadius: 5,
              overflow: "hidden",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                width: `${hpPct}%`,
                height: "100%",
                background: hasShield ? "#3b82f6" : hpColor,
                borderRadius: 5,
                transition: "width 0.15s ease-out, background 0.3s",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: hasShield ? "#60a5fa" : hpColor, minWidth: 52, textAlign: "right", fontWeight: "bold" }}>
            {Math.ceil(playerHp)}/{maxPlayerHp}
          </span>
        </div>
      </div>

      {/* ── Top right: Wave + Kills + Enemies ── */}
      <div
        style={{
          position: "absolute",
          top: 16, right: 16,
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10,
          padding: "10px 16px",
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: 10, color: "#666", letterSpacing: 2 }}>WAVE</div>
        <div style={{ fontSize: 26, fontWeight: "bold", color: "#60a5fa", letterSpacing: 2 }}>{wave}</div>
        <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>
          <span style={{ color: "#aaa" }}>{Array.isArray(enemies) ? enemies.length : 0}</span> enemies ·{" "}
          <span style={{ color: "#aaa" }}>{killCount}</span> kills
        </div>
      </div>

      {/* ── Safe zone warning ── */}
      {outsideZone && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#ef4444",
            fontSize: 18,
            fontWeight: "bold",
            letterSpacing: 4,
            textShadow: "0 0 20px rgba(239,68,68,0.8)",
            animation: "pulse 0.6s ease-in-out infinite",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          ⚠ OUTSIDE SAFE ZONE ⚠<br />
          <span style={{ fontSize: 12, letterSpacing: 2, color: "#f87171" }}>TAKE DAMAGE</span>
        </div>
      )}

      {/* ── Bottom right: Active power-ups ── */}
      {Array.isArray(activePowerUps) && activePowerUps.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 16,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {activePowerUps.map((pu) => {
            const pct = pu.timeLeft / pu.maxTime;
            const color = POWERUP_COLORS[pu.type];
            return (
              <div
                key={pu.type}
                style={{
                  background: "rgba(0,0,0,0.75)",
                  border: `1px solid ${color}55`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 140,
                }}
              >
                <span style={{ fontSize: 14 }}>{POWERUP_ICONS[pu.type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color, letterSpacing: 1, marginBottom: 3 }}>
                    {POWERUP_LABELS[pu.type]}
                  </div>
                  <div style={{ height: 4, background: "#222", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct * 100}%`,
                        height: "100%",
                        background: color,
                        borderRadius: 2,
                        transition: "width 0.1s linear",
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#888", minWidth: 28, textAlign: "right" }}>
                  {Math.ceil(pu.timeLeft)}s
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom: controls ── */}
      <div
        style={{
          position: "absolute",
          bottom: 16, left: 16,
          color: "#444",
          fontSize: 10,
          lineHeight: 1.9,
          letterSpacing: 1,
        }}
      >
        <div>WASD — Move</div>
        <div>Click — Shoot</div>
      </div>

      {/* ── Safe zone indicator (bottom center) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          color: "#666",
        }}
      >
        <div
          style={{
            width: 8, height: 8,
            borderRadius: "50%",
            background: outsideZone ? "#ef4444" : "#22c55e",
            boxShadow: `0 0 6px ${outsideZone ? "#ef4444" : "#22c55e"}`,
          }}
        />
        <span>ZONE {Math.round(safeZoneRadius)}m</span>
        <span style={{ color: "#333" }}>|</span>
        <span style={{ color: "#555" }}>
          {POWERUP_ICONS.speed} {POWERUP_ICONS.shield} {POWERUP_ICONS.rapidfire} {POWERUP_ICONS.heal}
        </span>
        <span style={{ color: "#333" }}>collect power-ups</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
