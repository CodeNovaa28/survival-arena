import { useState, useEffect, useMemo } from "react";
import { useGameStore, PowerUpType } from "./store";
import { getGun } from "./gameGuns";
import { getMeleeWeapon } from "./gameMeleeWeapons";
import { LEVELS } from "./gameLevels";
import { CoinIcon, ClockIcon } from "./GameIcons";
import { getMap } from "./gameMaps";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

const PU_COLOR: Record<PowerUpType, string> = {
  speed: "#06b6d4", shield: "#3b82f6", rapidfire: "#facc15", heal: "#22c55e", drone: "#a855f7",
};
const PU_ICON: Record<PowerUpType, string> = {
  speed: "⚡", shield: "🛡", rapidfire: "🔥", heal: "💊", drone: "🛸",
};

export default function HUD() {
  const playerHp             = useGameStore((s) => s.playerHp);
  const maxPlayerHp          = useGameStore((s) => s.maxPlayerHp);
  const timeSurvived         = useGameStore((s) => s.timeSurvived);
  const highScore            = useGameStore((s) => s.highScore);
  const wave                 = useGameStore((s) => s.wave);
  const killCount            = useGameStore((s) => s.killCount);
  const sessionCoins         = useGameStore((s) => s.sessionCoins);
  const enemies              = useGameStore((s) => s.enemies);
  const activePowerUps       = useGameStore((s) => s.activePowerUps);
  const safeZoneRadius       = useGameStore((s) => s.safeZoneRadius);
  const playerPos            = useGameStore((s) => s.playerPosition);
  const paused               = useGameStore((s) => s.paused);
  const selectedGun          = useGameStore((s) => s.selectedGun);
  const selectedMelee        = useGameStore((s) => s.selectedMelee);
  const gameMode             = useGameStore((s) => s.gameMode);
  const currentLevel         = useGameStore((s) => s.currentLevel);
  const setPaused            = useGameStore((s) => s.setPaused);
  const highestCompletedLevel= useGameStore((s) => s.highestCompletedLevel);
  const reviveAvailable      = useGameStore((s) => s.reviveAvailable);
  const reviveUsed           = useGameStore((s) => s.reviveUsed);
  const droneActive          = useGameStore((s) => s.droneActive);
  const droneTimer           = useGameStore((s) => s.droneTimer);
  const droneCooldown        = useGameStore((s) => s.droneCooldown);
  const squadActive          = useGameStore((s) => s.squadActive);
  const squadTimer           = useGameStore((s) => s.squadTimer);
  const squadCooldown        = useGameStore((s) => s.squadCooldown);
  const guardianActive       = useGameStore((s) => s.guardianActive);
  const meleeCooldown        = useGameStore((s) => s.meleeCooldown);
  const killStreak           = useGameStore((s) => s.killStreak);
  const tempWeapon           = useGameStore((s) => s.tempWeapon);
  const selectedMap          = useGameStore((s) => s.selectedMap);
  const checkpointWave       = useGameStore((s) => s.checkpointWave);

  // Zone detection
  const mapDef = useMemo(() => getMap(selectedMap), [selectedMap]);
  const zoneDist = Math.sqrt(playerPos.x ** 2 + playerPos.z ** 2);
  const zoneName = useMemo(() => {
    if (zoneDist < 18) return mapDef.zones.center;
    if (playerPos.x > 0 && playerPos.z < 0) return mapDef.zones.ne;
    if (playerPos.x > 0 && playerPos.z >= 0) return mapDef.zones.se;
    if (playerPos.x <= 0 && playerPos.z >= 0) return mapDef.zones.sw;
    return mapDef.zones.nw;
  }, [zoneDist, playerPos.x, playerPos.z, mapDef]);

  // Checkpoint notification
  const [showCpNotif, setShowCpNotif] = useState(false);
  useEffect(() => {
    if (checkpointWave <= 0) return;
    setShowCpNotif(true);
    const t = setTimeout(() => setShowCpNotif(false), 3500);
    return () => clearTimeout(t);
  }, [checkpointWave]);

  const hpPct     = Math.max(0, (playerHp / maxPlayerHp) * 100);
  const hpColor   = hpPct > 50 ? "#22c55e" : hpPct > 25 ? "#f97316" : "#ef4444";
  const dist      = Math.sqrt(playerPos.x ** 2 + playerPos.z ** 2);
  const outside   = dist > safeZoneRadius;
  const hasShield = activePowerUps.some((p) => p.type === "shield");
  const isNewBest = gameMode === "endless" && timeSurvived > 0 && timeSurvived >= highScore;
  const gun       = getGun(selectedGun);
  const melee     = getMeleeWeapon(selectedMelee);
  const levelDef  = gameMode === "levels" ? LEVELS.find((l) => l.id === currentLevel) : null;

  const droneUnlocked = highestCompletedLevel >= 5;
  const squadUnlocked = highestCompletedLevel >= 8;

  const meleeReady = meleeCooldown <= 0;
  const meleeMaxCD = melee.cooldown;

  const streakMult  = killStreak >= 20 ? 3 : killStreak >= 10 ? 2 : killStreak >= 5 ? 1.5 : 1;
  const streakLabel = killStreak >= 20 ? "🔥🔥🔥" : killStreak >= 10 ? "🔥🔥" : "🔥";
  const streakColor = killStreak >= 20 ? "#facc15" : killStreak >= 10 ? "#f97316" : "#fb923c";

  if (paused) return null;

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      zIndex: 10, fontFamily: "'Courier New', monospace",
    }}>
      {/* ─ Checkpoint saved notification ─ */}
      {showCpNotif && (
        <div style={{
          position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)",
          background: "rgba(6,14,30,0.95)", border: "2px solid #1d4ed8",
          borderRadius: 14, padding: "18px 36px", textAlign: "center",
          boxShadow: "0 0 40px rgba(59,130,246,0.4)",
          animation: "fadeInOut 3.5s ease forwards",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🔖</div>
          <div style={{ fontSize: 15, fontWeight: "bold", color: "#60a5fa", letterSpacing: 3 }}>CHECKPOINT SAVED</div>
          <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 4 }}>
            Wave {checkpointWave} · Reach the next half to advance it
          </div>
        </div>
      )}

      {/* ─ Zone name indicator ─ */}
      <div style={{
        position: "absolute", bottom: 70, right: 14,
        background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8, padding: "5px 12px",
        fontSize: 10, letterSpacing: 2, color: "#556",
        backdropFilter: "blur(3px)",
      }}>
        📍 {zoneName}
      </div>

      {/* ─ Killstreak badge ─ */}
      {killStreak >= 5 && (
        <div style={{
          position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
          background: `rgba(0,0,0,0.82)`, border: `1px solid ${streakColor}55`,
          borderRadius: 10, padding: "6px 18px",
          display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(4px)", animation: "pulse .7s ease-in-out infinite",
        }}>
          <span style={{ fontSize: 16 }}>{streakLabel}</span>
          <span style={{ fontSize: 13, fontWeight: "bold", color: streakColor, letterSpacing: 1 }}>
            {killStreak} KILL STREAK · {streakMult}× COINS
          </span>
        </div>
      )}

      {/* ─ Top centre: time / level ─ */}
      <div style={{
        position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, padding: "10px 26px", textAlign: "center", backdropFilter: "blur(4px)",
      }}>
        {gameMode === "endless" ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 2 }}>
              <ClockIcon size={13} />
              <span style={{ fontSize: 11, color: "#555", letterSpacing: 3 }}>TIME SURVIVED</span>
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: 3, color: isNewBest ? "#facc15" : "#fff", textShadow: isNewBest ? "0 0 20px rgba(250,204,21,.5)" : "none" }}>{fmt(timeSurvived)}</div>
            {highScore > 0 && <div style={{ fontSize: 10, color: "#facc15", marginTop: 2, letterSpacing: 1 }}>★ BEST {fmt(highScore)}</div>}
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 3, marginBottom: 2 }}>LVL {currentLevel} · {levelDef?.name ?? ""}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>WAVE {wave}{levelDef ? ` / ${levelDef.waves}` : ""}</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{fmt(timeSurvived)}</div>
          </>
        )}
      </div>

      {/* ─ Top left: HP + coins + perks ─ */}
      <div style={{
        position: "absolute", top: 14, left: 14,
        background: "rgba(0,0,0,0.72)", border: `1px solid ${hasShield ? "#3b82f666" : "rgba(255,255,255,.1)"}`,
        borderRadius: 12, padding: "12px 16px", minWidth: 200, backdropFilter: "blur(4px)",
        boxShadow: hasShield ? "0 0 18px rgba(59,130,246,.3)" : "none",
      }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 6 }}>
          {hasShield ? "⚡ SHIELDED" : "HEALTH"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 12, background: "#111", borderRadius: 6, overflow: "hidden", border: "1px solid #222" }}>
            <div style={{ width: `${hpPct}%`, height: "100%", background: hasShield ? "#3b82f6" : hpColor, borderRadius: 6, transition: "width .12s" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: "bold", color: hasShield ? "#60a5fa" : hpColor, minWidth: 52 }}>
            {Math.ceil(playerHp)}/{maxPlayerHp}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <CoinIcon size={18} />
          <span style={{ fontSize: 16, fontWeight: "bold", color: "#f59e0b" }}>+{sessionCoins}</span>
          <span style={{ fontSize: 10, color: "#444" }}>this run</span>
        </div>
        {(reviveAvailable || reviveUsed) && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <span style={{ fontSize: 15, opacity: reviveAvailable ? 1 : 0.3 }}>💖</span>
            <span style={{ fontSize: 10, color: reviveAvailable ? "#f87171" : "#444", letterSpacing: 1 }}>
              {reviveAvailable ? "SECOND LIFE" : "USED"}
            </span>
          </div>
        )}
        {guardianActive && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14 }}>⚔️</span>
            <span style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 1 }}>GUARDIANS ACTIVE</span>
          </div>
        )}
      </div>

      {/* ─ Top right: wave / kills + pause ─ */}
      <div style={{ position: "absolute", top: 14, right: 14, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        <div style={{
          background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 12, padding: "12px 16px", textAlign: "right", backdropFilter: "blur(4px)", minWidth: 140,
        }}>
          {gameMode === "endless" && (
            <>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>WAVE</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#60a5fa" }}>{wave}</div>
            </>
          )}
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            <span style={{ color: "#aaa", fontSize: 14 }}>{Array.isArray(enemies) ? enemies.length : 0}</span>
            <span> left · </span>
            <span style={{ color: "#aaa", fontSize: 14 }}>{killCount}</span>
            <span> kills</span>
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.06)", fontSize: 11, color: "#666" }}>
            {tempWeapon ? (
              <span style={{ color: "#f59e0b" }}>
                {getGun(tempWeapon).badge} <span style={{ color: "#fbbf24" }}>{getGun(tempWeapon).name}</span>
                <span style={{ color: "#f59e0b", fontSize: 9, marginLeft: 4 }}>TEMP</span>
              </span>
            ) : (
              <span>{gun.badge} <span style={{ color: "#888" }}>{gun.name}</span></span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>
            {melee.badge} <span style={{ color: "#777" }}>{melee.name}</span>
          </div>
        </div>
        <button
          onClick={() => setPaused(true)}
          style={{
            pointerEvents: "all", background: "rgba(0,0,0,0.72)",
            border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
            color: "#666", fontSize: 20, width: 42, height: 42,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", backdropFilter: "blur(4px)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#666"; }}
        >⏸</button>
      </div>

      {/* ─ Abilities (bottom left) ─ */}
      <div style={{
        position: "absolute", bottom: 56, left: 14,
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        {/* Melee weapon — always shown */}
        <MeleeBar melee={melee} cooldown={meleeCooldown} maxCD={meleeMaxCD} ready={meleeReady} />

        {droneUnlocked && (
          <AbilityBar keyLabel="Q" icon="🛸" name="DRONE STRIKE"
            active={droneActive} timer={droneTimer} cooldown={droneCooldown}
            maxDuration={15} maxCooldown={60} />
        )}
        {squadUnlocked && (
          <AbilityBar keyLabel="E" icon="👥" name="SQUAD BACKUP"
            active={squadActive} timer={squadTimer} cooldown={squadCooldown}
            maxDuration={30} maxCooldown={90} />
        )}
      </div>

      {/* ─ Active power-ups (bottom right) ─ */}
      {Array.isArray(activePowerUps) && activePowerUps.filter((p) => p.maxTime < 9000).length > 0 && (
        <div style={{ position: "absolute", bottom: 56, right: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {activePowerUps.filter((p) => p.maxTime < 9000).map((pu) => (
            <div key={pu.type} style={{
              background: "rgba(0,0,0,0.8)", border: `1px solid ${PU_COLOR[pu.type]}44`,
              borderRadius: 8, padding: "7px 12px",
              display: "flex", alignItems: "center", gap: 8, minWidth: 150, backdropFilter: "blur(4px)",
            }}>
              <span style={{ fontSize: 16 }}>{PU_ICON[pu.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: PU_COLOR[pu.type], letterSpacing: 1, marginBottom: 3 }}>{pu.type.toUpperCase()}</div>
                <div style={{ height: 4, background: "#222", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(pu.timeLeft/pu.maxTime)*100}%`, height: "100%", background: PU_COLOR[pu.type], borderRadius: 2, transition: "width .1s linear" }} />
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#666", minWidth: 26 }}>{Math.ceil(pu.timeLeft)}s</span>
            </div>
          ))}
        </div>
      )}

      {/* ─ Outside zone warning ─ */}
      {outside && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          color: "#ef4444", fontSize: 20, fontWeight: 900, letterSpacing: 4, textAlign: "center",
          textShadow: "0 0 24px rgba(239,68,68,.9)", animation: "pulse .6s ease-in-out infinite",
        }}>
          ⚠ OUTSIDE SAFE ZONE ⚠<br />
          <span style={{ fontSize: 13, color: "#f87171", letterSpacing: 2 }}>TAKING DAMAGE</span>
        </div>
      )}

      {/* ─ Bottom status bar ─ */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 8, padding: "7px 18px",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 12, color: "#555", backdropFilter: "blur(4px)",
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: outside ? "#ef4444" : "#22c55e", boxShadow: `0 0 6px ${outside ? "#ef4444" : "#22c55e"}` }} />
        <span>ZONE {Math.round(safeZoneRadius)}m</span>
        <span style={{ color: "#333" }}>|</span>
        <span style={{ fontSize: 11, color: "#444" }}>WASD move · Click shoot · AUTO/F melee · Q drone · E squad</span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
    </div>
  );
}

// ─── Melee bar ────────────────────────────────────────────────────────────────
function MeleeBar({ melee, cooldown, maxCD, ready }: {
  melee: ReturnType<typeof getMeleeWeapon>;
  cooldown: number; maxCD: number; ready: boolean;
}) {
  const color  = ready ? "#fb923c" : "#555";
  const barPct = ready ? 100 : ((maxCD - cooldown) / maxCD) * 100;

  return (
    <div style={{
      background: "rgba(0,0,0,0.8)", border: `1px solid ${color}44`,
      borderRadius: 8, padding: "7px 10px",
      display: "flex", alignItems: "center", gap: 8, minWidth: 170, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: 22, height: 22, background: color + "33", border: `1px solid ${color}66`,
        borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: "bold", color, flexShrink: 0,
      }}>F</div>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{melee.badge}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, color, letterSpacing: 1, marginBottom: 3 }}>{melee.name.toUpperCase()}</div>
        <div style={{ height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${barPct}%`, height: "100%", background: ready ? color : "#334155", borderRadius: 2, transition: "width .1s linear" }} />
        </div>
      </div>
      <span style={{ fontSize: 11, color, minWidth: 30, textAlign: "right" }}>
        {ready ? "RDY" : `${cooldown.toFixed(1)}s`}
      </span>
    </div>
  );
}

// ─── Ability bar ───────────────────────────────────────────────────────────────
function AbilityBar({ keyLabel, icon, name, active, timer, cooldown, maxDuration, maxCooldown }: {
  keyLabel: string; icon: string; name: string;
  active: boolean; timer: number; cooldown: number;
  maxDuration: number; maxCooldown: number;
}) {
  const ready  = !active && cooldown <= 0;
  const color  = active ? "#22c55e" : ready ? "#60a5fa" : "#555";
  const barPct = active
    ? (timer / maxDuration) * 100
    : cooldown > 0 ? ((maxCooldown - cooldown) / maxCooldown) * 100 : 100;

  return (
    <div style={{
      background: "rgba(0,0,0,0.8)", border: `1px solid ${color}44`,
      borderRadius: 8, padding: "7px 10px",
      display: "flex", alignItems: "center", gap: 8, minWidth: 170, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: 22, height: 22, background: color + "33", border: `1px solid ${color}66`,
        borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: "bold", color, flexShrink: 0,
      }}>{keyLabel}</div>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, color, letterSpacing: 1, marginBottom: 3 }}>{name}</div>
        <div style={{ height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${barPct}%`, height: "100%", background: active ? color : ready ? color : "#334155", borderRadius: 2, transition: "width .2s linear" }} />
        </div>
      </div>
      <span style={{ fontSize: 11, color, minWidth: 30, textAlign: "right" }}>
        {active ? `${Math.ceil(timer)}s` : cooldown > 0 ? `${Math.ceil(cooldown)}s` : "RDY"}
      </span>
    </div>
  );
}
