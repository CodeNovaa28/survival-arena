import { useGameStore, PowerUpType } from "./store";
import { GUNS, getGun } from "./gameGuns";
import { LEVELS } from "./gameLevels";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

const PU_COLOR: Record<PowerUpType, string> = {
  speed:     "#06b6d4", shield: "#3b82f6", rapidfire: "#facc15",
  heal:      "#22c55e", drone:  "#a855f7",
};
const PU_ICON: Record<PowerUpType, string> = {
  speed: "⚡", shield: "🛡", rapidfire: "🔥", heal: "💊", drone: "🛸",
};

export default function HUD() {
  const playerHp       = useGameStore((s) => s.playerHp);
  const maxPlayerHp    = useGameStore((s) => s.maxPlayerHp);
  const timeSurvived   = useGameStore((s) => s.timeSurvived);
  const highScore      = useGameStore((s) => s.highScore);
  const wave           = useGameStore((s) => s.wave);
  const killCount      = useGameStore((s) => s.killCount);
  const sessionCoins   = useGameStore((s) => s.sessionCoins);
  const enemies        = useGameStore((s) => s.enemies);
  const activePowerUps = useGameStore((s) => s.activePowerUps);
  const safeZoneRadius = useGameStore((s) => s.safeZoneRadius);
  const playerPos      = useGameStore((s) => s.playerPosition);
  const paused         = useGameStore((s) => s.paused);
  const selectedGun    = useGameStore((s) => s.selectedGun);
  const gameMode       = useGameStore((s) => s.gameMode);
  const currentLevel   = useGameStore((s) => s.currentLevel);
  const setPaused      = useGameStore((s) => s.setPaused);

  const hpPct    = Math.max(0, (playerHp / maxPlayerHp) * 100);
  const hpColor  = hpPct > 50 ? "#22c55e" : hpPct > 25 ? "#f97316" : "#ef4444";
  const dist     = Math.sqrt(playerPos.x ** 2 + playerPos.z ** 2);
  const outside  = dist > safeZoneRadius;
  const hasShield = activePowerUps.some((p) => p.type === "shield");
  const isNewBest = gameMode === "endless" && timeSurvived > 0 && timeSurvived >= highScore;
  const gun      = getGun(selectedGun);

  const levelDef = gameMode === "levels" ? LEVELS.find((l) => l.id === currentLevel) : null;

  if (paused) return null;

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      zIndex: 10, fontFamily: "'Courier New', monospace",
    }}>
      {/* ─ Top center: TIME / LEVEL info ─ */}
      <div style={{
        position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, padding: "10px 26px", textAlign: "center",
        backdropFilter: "blur(4px)",
      }}>
        {gameMode === "endless" ? (
          <>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 3, marginBottom: 2 }}>TIME SURVIVED</div>
            <div style={{
              fontSize: 38, fontWeight: 900, letterSpacing: 3,
              color: isNewBest ? "#facc15" : "#fff",
              textShadow: isNewBest ? "0 0 20px rgba(250,204,21,0.5)" : "none",
            }}>{fmt(timeSurvived)}</div>
            {highScore > 0 && (
              <div style={{ fontSize: 10, color: "#facc15", marginTop: 2, letterSpacing: 1 }}>
                ★ BEST {fmt(highScore)}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 3, marginBottom: 2 }}>
              LEVEL {currentLevel} — {levelDef?.name ?? ""}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
              WAVE {wave}{levelDef ? ` / ${levelDef.waves}` : ""}
            </div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{fmt(timeSurvived)}</div>
          </>
        )}
      </div>

      {/* ─ Top left: HP + Coin ─ */}
      <div style={{
        position: "absolute", top: 14, left: 14,
        background: "rgba(0,0,0,0.72)", border: `1px solid ${hasShield ? "#3b82f666" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12, padding: "12px 16px", minWidth: 190,
        backdropFilter: "blur(4px)",
        boxShadow: hasShield ? "0 0 18px rgba(59,130,246,0.3)" : "none",
      }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 6 }}>
          {hasShield ? "⚡ SHIELDED" : "HEALTH"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 12, background: "#111", borderRadius: 6, overflow: "hidden", border: "1px solid #222" }}>
            <div style={{
              width: `${hpPct}%`, height: "100%",
              background: hasShield ? "#3b82f6" : hpColor,
              borderRadius: 6, transition: "width 0.12s ease-out",
            }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: "bold", color: hasShield ? "#60a5fa" : hpColor, minWidth: 52 }}>
            {Math.ceil(playerHp)}/{maxPlayerHp}
          </span>
        </div>

        {/* Session coins */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>🪙</span>
          <span style={{ fontSize: 16, fontWeight: "bold", color: "#f59e0b" }}>+{sessionCoins}</span>
          <span style={{ fontSize: 10, color: "#444" }}>earned</span>
        </div>
      </div>

      {/* ─ Top right: Wave / Kill info + Pause ─ */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end",
      }}>
        <div style={{
          background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "12px 16px", textAlign: "right",
          backdropFilter: "blur(4px)", minWidth: 130,
        }}>
          {gameMode === "endless" && (
            <>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>WAVE</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#60a5fa" }}>{wave}</div>
            </>
          )}
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            <span style={{ color: "#aaa", fontSize: 14 }}>{Array.isArray(enemies) ? enemies.length : 0}</span>
            <span> enemies · </span>
            <span style={{ color: "#aaa", fontSize: 14 }}>{killCount}</span>
            <span> kills</span>
          </div>

          {/* Gun */}
          <div style={{
            marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11, color: "#666",
          }}>
            {gun.badge} <span style={{ color: "#888" }}>{gun.name}</span>
          </div>
        </div>

        {/* Pause button */}
        <button
          onClick={() => setPaused(true)}
          style={{
            pointerEvents: "all", background: "rgba(0,0,0,0.72)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            color: "#666", fontSize: 20, width: 42, height: 42,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", transition: "all 0.15s",
            backdropFilter: "blur(4px)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#666"; }}
        >⏸</button>
      </div>

      {/* ─ Outside zone warning ─ */}
      {outside && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#ef4444", fontSize: 20, fontWeight: 900,
          letterSpacing: 4, textAlign: "center",
          textShadow: "0 0 24px rgba(239,68,68,0.9)",
          animation: "pulse 0.6s ease-in-out infinite",
          pointerEvents: "none",
        }}>
          ⚠ OUTSIDE SAFE ZONE ⚠<br />
          <span style={{ fontSize: 13, color: "#f87171", letterSpacing: 2 }}>TAKING DAMAGE</span>
        </div>
      )}

      {/* ─ Active power-ups ─ */}
      {Array.isArray(activePowerUps) && activePowerUps.length > 0 && (
        <div style={{
          position: "absolute", bottom: 60, right: 14,
          display: "flex", flexDirection: "column", gap: 6,
          pointerEvents: "none",
        }}>
          {activePowerUps.map((pu) => {
            const pct   = pu.timeLeft / pu.maxTime;
            const color = PU_COLOR[pu.type];
            return (
              <div key={pu.type} style={{
                background: "rgba(0,0,0,0.8)", border: `1px solid ${color}44`,
                borderRadius: 8, padding: "7px 12px",
                display: "flex", alignItems: "center", gap: 8, minWidth: 150,
                backdropFilter: "blur(4px)",
              }}>
                <span style={{ fontSize: 16 }}>{PU_ICON[pu.type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color, letterSpacing: 1, marginBottom: 3 }}>
                    {pu.type.toUpperCase()}
                  </div>
                  <div style={{ height: 4, background: "#222", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct * 100}%`, height: "100%",
                      background: color, borderRadius: 2, transition: "width 0.1s linear",
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#666", minWidth: 26 }}>
                  {Math.ceil(pu.timeLeft)}s
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ─ Zone indicator ─ */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8, padding: "7px 18px",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 12, color: "#555", backdropFilter: "blur(4px)",
        pointerEvents: "none",
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: outside ? "#ef4444" : "#22c55e",
          boxShadow: `0 0 6px ${outside ? "#ef4444" : "#22c55e"}`,
        }} />
        <span>ZONE {Math.round(safeZoneRadius)}m</span>
        <span style={{ color: "#333" }}>|</span>
        <span style={{ fontSize: 11, color: "#444" }}>ESC to pause</span>
      </div>

      {/* Controls note */}
      <div style={{
        position: "absolute", bottom: 14, left: 14,
        color: "#333", fontSize: 11, lineHeight: 2, letterSpacing: 1,
        pointerEvents: "none",
      }}>
        <div>WASD — Move</div>
        <div>Click — Shoot</div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
