import { useState, useRef, useEffect, useCallback } from "react";
import { useGameStore, MILESTONES } from "./store";

// ─── Spin Wheel ────────────────────────────────────────────────────────────────
const PRIZES = [
  { label: "50",  value: 50,  color: "#f59e0b", textColor: "#fff" },
  { label: "100", value: 100, color: "#3b82f6", textColor: "#fff" },
  { label: "MISS",value: 0,   color: "#1e293b", textColor: "#475569" },
  { label: "200", value: 200, color: "#22c55e", textColor: "#fff" },
  { label: "50",  value: 50,  color: "#f59e0b", textColor: "#fff" },
  { label: "500", value: 500, color: "#ef4444", textColor: "#fff" },
  { label: "100", value: 100, color: "#3b82f6", textColor: "#fff" },
  { label: "MISS",value: 0,   color: "#1e293b", textColor: "#475569" },
];
const SEG_ANGLE = (Math.PI * 2) / PRIZES.length;

function drawWheel(canvas: HTMLCanvasElement, rotation: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 4;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  PRIZES.forEach((p, i) => {
    const start = rotation + i * SEG_ANGLE - Math.PI / 2;
    const end   = start + SEG_ANGLE;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + SEG_ANGLE / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = p.textColor;
    ctx.font = `bold ${p.label === "MISS" ? 11 : 14}px 'Courier New', monospace`;
    ctx.fillText(p.label === "MISS" ? "MISS" : `${p.label}🪙`, r - 10, 5);
    ctx.restore();
  });

  // Center cap
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function SpinWheel({ canSpinFree, onSpin }: { canSpinFree: boolean; onSpin: (coins: number) => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rotRef     = useRef(0);
  const rafRef     = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [result,   setResult]   = useState<{ label: string; value: number } | null>(null);
  const coins      = useGameStore((s) => s.coins);

  const drawFrame = useCallback(() => {
    if (canvasRef.current) drawWheel(canvasRef.current, rotRef.current);
  }, []);

  useEffect(() => { drawFrame(); }, [drawFrame]);

  const doSpin = (cost: number) => {
    if (spinning) return;
    if (cost > 0 && coins < cost) return;
    setResult(null);
    setSpinning(true);

    const landIdx = Math.floor(Math.random() * PRIZES.length);
    const targetAngle = Math.PI * 2 * 5 + landIdx * SEG_ANGLE;
    const startRot    = rotRef.current;
    const endRot      = startRot + targetAngle;
    const duration    = 3200;
    const start       = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 4);
      rotRef.current = startRot + (endRot - startRot) * ease;
      drawFrame();
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(PRIZES[landIdx]);
        onSpin(PRIZES[landIdx].value);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative" }}>
        {/* Pointer */}
        <div style={{
          position: "absolute", top: -2, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0, zIndex: 2,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "22px solid #facc15",
          filter: "drop-shadow(0 2px 6px rgba(250,204,21,0.6))",
        }} />
        <canvas
          ref={canvasRef} width={220} height={220}
          style={{ borderRadius: "50%", boxShadow: "0 0 30px rgba(0,0,0,0.7)" }}
        />
      </div>

      {result && (
        <div style={{
          padding: "8px 20px", borderRadius: 8,
          background: result.value > 0 ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.15)",
          border: `1px solid ${result.value > 0 ? "#22c55e44" : "#33333344"}`,
          fontSize: 14, fontWeight: "bold",
          color: result.value > 0 ? "#4ade80" : "#64748b",
          textAlign: "center",
          animation: "fadeIn .3s ease",
        }}>
          {result.value > 0 ? `+${result.value} 🪙 won!` : "Better luck next time!"}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => doSpin(0)}
          disabled={!canSpinFree || spinning}
          style={{
            padding: "10px 22px", borderRadius: 8, fontSize: 12, fontWeight: "bold",
            background: canSpinFree && !spinning ? "#22c55e" : "#1e293b",
            color: canSpinFree && !spinning ? "#fff" : "#475569",
            border: "none", cursor: canSpinFree && !spinning ? "pointer" : "not-allowed",
            letterSpacing: 1, fontFamily: "inherit", transition: "all .15s",
          }}
        >{canSpinFree ? "🎰 FREE SPIN" : "✓ USED TODAY"}</button>

        <button
          onClick={() => doSpin(25)}
          disabled={spinning || coins < 25}
          style={{
            padding: "10px 22px", borderRadius: 8, fontSize: 12, fontWeight: "bold",
            background: !spinning && coins >= 25 ? "#f59e0b" : "#1e293b",
            color: !spinning && coins >= 25 ? "#fff" : "#475569",
            border: "none", cursor: !spinning && coins >= 25 ? "pointer" : "not-allowed",
            letterSpacing: 1, fontFamily: "inherit", transition: "all .15s",
          }}
        >🪙 25 EXTRA SPIN</button>
      </div>
    </div>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function DailyRewards() {
  const setPhase      = useGameStore((s) => s.setPhase);
  const coins         = useGameStore((s) => s.coins);
  const lastChest     = useGameStore((s) => s.lastDailyChest);
  const lastSpin      = useGameStore((s) => s.lastDailySpin);
  const dailyQuests   = useGameStore((s) => s.dailyQuests);
  const totalCoins    = useGameStore((s) => s.totalCoinsEarned);
  const permanentPerks= useGameStore((s) => s.permanentPerks);
  const claimChest    = useGameStore((s) => s.claimDailyChest);
  const claimSpin     = useGameStore((s) => s.claimDailySpin);
  const claimQuest    = useGameStore((s) => s.claimQuestReward);
  const refresh       = useGameStore((s) => s.refreshDailyQuestsIfNeeded);
  const addPerk       = useGameStore((s) => s.addPermanentPerk);

  const [tab,        setTab]        = useState<"daily" | "milestones">("daily");
  const [chestResult,setChestResult]= useState<number | null>(null);
  const [spinResult, setSpinResult] = useState<number | null>(null);

  useEffect(() => { refresh(); }, [refresh]);

  const today       = getTodayKey();
  const canChest    = lastChest !== today;
  const canSpinFree = lastSpin  !== today;

  const handleChest = () => {
    if (!canChest) return;
    const reward = claimChest();
    setChestResult(reward);
  };

  const handleSpin = (prize: number) => {
    claimSpin(prize);
    setSpinResult(prize);
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 20%, #0a1628 0%, #020508 100%)",
      fontFamily: "'Courier New', monospace",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px", display: "flex", alignItems: "center", gap: 20,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.4)", flexShrink: 0,
      }}>
        <button
          onClick={() => setPhase("start")}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: "#94a3b8", borderRadius: 8, padding: "8px 16px",
            cursor: "pointer", fontSize: 13, fontFamily: "inherit",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
        >← BACK</button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>DAILY REWARDS</div>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginTop: 2 }}>RESETS DAILY · FREE REWARDS EVERY 24H</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>🪙</span>
          <span style={{ fontSize: 18, fontWeight: "bold", color: "#f59e0b" }}>{coins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, padding: "12px 28px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.2)", flexShrink: 0,
      }}>
        {(["daily", "milestones"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent",
              color: tab === t ? "#93c5fd" : "#475569",
              padding: "8px 20px 12px", cursor: "pointer",
              fontSize: 11, letterSpacing: 2, fontFamily: "inherit",
              transition: "color 0.15s",
            }}
          >{t === "daily" ? "📅 DAILY" : "🌟 MILESTONES"}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {tab === "daily" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left: Chest + Quests */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Daily Chest */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${canChest ? "#f59e0b44" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 14, padding: "20px",
              }}>
                <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 3, marginBottom: 12 }}>📦 DAILY CHEST</div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 14, lineHeight: 1.6 }}>
                  Open once per day for 50–200 free coins. Resets at midnight.
                </div>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 52, marginBottom: 8, filter: canChest ? "none" : "grayscale(1) opacity(0.4)" }}>📦</div>
                  {chestResult !== null && (
                    <div style={{
                      fontSize: 18, fontWeight: "bold", color: "#4ade80",
                      marginBottom: 8, animation: "fadeIn .3s ease",
                    }}>+{chestResult} 🪙</div>
                  )}
                </div>
                <button
                  onClick={handleChest}
                  disabled={!canChest}
                  style={{
                    width: "100%", padding: "12px 0", borderRadius: 8,
                    background: canChest ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b",
                    color: canChest ? "#fff" : "#475569",
                    border: "none", cursor: canChest ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: "bold", letterSpacing: 2,
                    fontFamily: "inherit", transition: "all .15s",
                  }}
                >{canChest ? "OPEN CHEST" : "✓ CLAIMED TODAY"}</button>
              </div>

              {/* Daily Quests */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "20px",
              }}>
                <div style={{ fontSize: 11, color: "#a855f7", letterSpacing: 3, marginBottom: 14 }}>📋 DAILY QUESTS</div>
                {dailyQuests.length === 0 ? (
                  <div style={{ color: "#475569", fontSize: 11, textAlign: "center", padding: "20px 0" }}>Loading quests…</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {dailyQuests.map((q) => {
                      const pct    = Math.min(1, q.progress / q.goal) * 100;
                      const done   = q.progress >= q.goal;
                      const canClaim = done && !q.claimed;
                      return (
                        <div key={q.id} style={{
                          background: q.claimed ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${q.claimed ? "#22c55e33" : "rgba(255,255,255,0.07)"}`,
                          borderRadius: 10, padding: "12px 14px",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <div style={{ fontSize: 11, color: q.claimed ? "#4ade80" : "#94a3b8", lineHeight: 1.4, flex: 1 }}>
                              {q.claimed && "✓ "}{q.description}
                            </div>
                            <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: "bold", flexShrink: 0, marginLeft: 12 }}>
                              +{q.reward}🪙
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{
                                width: `${pct}%`, height: "100%", borderRadius: 2,
                                background: q.claimed ? "#22c55e" : done ? "#a855f7" : "#3b82f6",
                                transition: "width .3s",
                              }} />
                            </div>
                            <span style={{ fontSize: 10, color: "#475569", whiteSpace: "nowrap" }}>
                              {Math.min(q.progress, q.goal)}/{q.goal}
                            </span>
                            {canClaim && (
                              <button
                                onClick={() => claimQuest(q.id)}
                                style={{
                                  background: "#a855f7", color: "#fff",
                                  border: "none", borderRadius: 6,
                                  padding: "4px 10px", fontSize: 10,
                                  cursor: "pointer", fontFamily: "inherit",
                                  fontWeight: "bold", letterSpacing: 1,
                                }}
                              >CLAIM</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Spin Wheel */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "20px",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{ fontSize: 11, color: "#22d3ee", letterSpacing: 3, marginBottom: 6, alignSelf: "flex-start" }}>🎰 SPIN WHEEL</div>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 16, alignSelf: "flex-start", lineHeight: 1.5 }}>
                1 free spin per day. Extra spins cost 25🪙.{" "}
                {spinResult !== null && spinResult > 0 && <span style={{ color: "#4ade80" }}>You won {spinResult} coins!</span>}
              </div>
              <SpinWheel
                canSpinFree={canSpinFree}
                onSpin={handleSpin}
              />
            </div>
          </div>
        )}

        {tab === "milestones" && (
          <div>
            <div style={{
              fontSize: 11, color: "#475569", marginBottom: 20, lineHeight: 1.8,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "14px 18px",
            }}>
              Earn coins through gameplay, quests, chests, and the spin wheel.
              As your <strong style={{ color: "#f59e0b" }}>total lifetime coins</strong> grow,
              permanent perks unlock automatically — buffs that apply to every run you play from that point on.
              <br />
              <span style={{ color: "#f59e0b" }}>Total coins earned: {totalCoins}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MILESTONES.map((m, i) => {
                const unlocked  = totalCoins >= m.coins;
                const hasPerk   = permanentPerks.includes(m.perk);
                const canClaim  = unlocked && !hasPerk;
                const progress  = Math.min(1, totalCoins / m.coins);
                const isNext    = !unlocked && (i === 0 || totalCoins >= MILESTONES[i - 1].coins);
                return (
                  <div key={m.perk} style={{
                    background: hasPerk ? "rgba(34,197,94,0.07)" : isNext ? "rgba(59,130,246,0.07)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${hasPerk ? "#22c55e33" : isNext ? "#3b82f633" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 12, padding: "16px 18px",
                    display: "flex", alignItems: "center", gap: 16,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: hasPerk ? "rgba(34,197,94,0.2)" : isNext ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                      border: `2px solid ${hasPerk ? "#22c55e" : isNext ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>
                      {hasPerk ? "✓" : isNext ? "🔓" : "🔒"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: "bold", color: hasPerk ? "#4ade80" : "#fff" }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: "#f59e0b" }}>{m.coins}🪙 total</div>
                      </div>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 8 }}>{m.desc}</div>
                      <div style={{ height: 4, background: "#0f172a", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          width: `${progress * 100}%`, height: "100%",
                          background: hasPerk ? "#22c55e" : "#3b82f6",
                          borderRadius: 2, transition: "width .4s",
                        }} />
                      </div>
                    </div>
                    {canClaim && (
                      <button
                        onClick={() => addPerk(m.perk)}
                        style={{
                          background: "#22c55e", color: "#fff",
                          border: "none", borderRadius: 8,
                          padding: "8px 16px", fontSize: 11,
                          cursor: "pointer", fontFamily: "inherit",
                          fontWeight: "bold", letterSpacing: 1, flexShrink: 0,
                        }}
                      >UNLOCK!</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(.9); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}
