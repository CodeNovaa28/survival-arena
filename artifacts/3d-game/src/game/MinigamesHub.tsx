import { useState, useRef, useEffect, useCallback } from "react";
import { useGameStore } from "./store";
import { CoinIcon } from "./GameIcons";

const TODAY = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

function loadDailyMg(key: string) {
  try {
    const d = localStorage.getItem(`zb_mg_${key}_date`);
    if (d !== TODAY()) return 0;
    return parseInt(localStorage.getItem(`zb_mg_${key}_earned`) ?? "0");
  } catch { return 0; }
}

function saveDailyMg(key: string, earned: number) {
  try {
    localStorage.setItem(`zb_mg_${key}_date`, TODAY());
    localStorage.setItem(`zb_mg_${key}_earned`, String(earned));
  } catch {}
}

const MAX_DAILY = 150;

// ─── Target Blast ─────────────────────────────────────────────────────────────
interface Target { id: number; x: number; y: number; r: number; born: number; life: number; }
let tgtId = 0;

function TargetBlast({ onDone }: { onDone: (coins: number) => void }) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const stateRef      = useRef<{ targets: Target[]; score: number; time: number; running: boolean }>({
    targets: [], score: 0, time: 30, running: false,
  });
  const rafRef        = useRef(0);
  const lastRef       = useRef(0);
  const spawnRef      = useRef(0);
  const [display, setDisplay] = useState({ score: 0, time: 30 });
  const [done, setDone] = useState(false);

  const W = 560, H = 320;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#070d1a";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(59,130,246,0.1)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    const now = performance.now();
    s.targets.forEach((t) => {
      const age = (now - t.born) / (t.life * 1000);
      const rNow = t.r * (1 - age * 0.7);
      const alpha = 1 - age * 0.5;

      const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, rNow);
      g.addColorStop(0, `rgba(239,68,68,${alpha})`);
      g.addColorStop(0.6, `rgba(220,38,38,${alpha * 0.8})`);
      g.addColorStop(1, `rgba(127,29,29,0)`);
      ctx.beginPath(); ctx.arc(t.x, t.y, rNow, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();

      ctx.beginPath(); ctx.arc(t.x, t.y, rNow, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(252,165,165,${alpha * 0.8})`; ctx.lineWidth = 1.5; ctx.stroke();

      ctx.beginPath(); ctx.arc(t.x, t.y, rNow * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`; ctx.fill();
    });

    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px 'Courier New'";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${s.score}`, 14, 28);
    ctx.textAlign = "right";
    ctx.fillStyle = s.time <= 5 ? "#ef4444" : "#60a5fa";
    ctx.fillText(`${Math.ceil(s.time)}s`, W - 14, 28);
  }, []);

  const loop = useCallback((ts: number) => {
    const dt = lastRef.current ? (ts - lastRef.current) / 1000 : 0;
    lastRef.current = ts;
    const s = stateRef.current;
    if (!s.running) return;

    s.time = Math.max(0, s.time - dt);
    spawnRef.current -= dt;

    if (spawnRef.current <= 0 && s.targets.length < 6) {
      const margin = 60;
      s.targets.push({
        id: ++tgtId,
        x: margin + Math.random() * (W - margin * 2),
        y: margin + Math.random() * (H - margin * 2),
        r: 28 + Math.random() * 18,
        born: performance.now(),
        life: 1.6 + Math.random() * 0.8,
      });
      spawnRef.current = 0.4 + Math.random() * 0.5;
    }

    const now = performance.now();
    s.targets = s.targets.filter((t) => (now - t.born) < t.life * 1000);

    setDisplay({ score: s.score, time: s.time });
    draw();

    if (s.time <= 0) {
      s.running = false;
      setDone(true);
      const coins = s.score >= 25 ? 150 : s.score >= 20 ? 100 : s.score >= 15 ? 60 : s.score >= 10 ? 30 : 10;
      onDone(coins);
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, onDone]);

  const start = () => {
    stateRef.current = { targets: [], score: 0, time: 30, running: true };
    lastRef.current = 0; spawnRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s.running) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const now = performance.now();
    for (let i = s.targets.length - 1; i >= 0; i--) {
      const t = s.targets[i];
      const age = (now - t.born) / (t.life * 1000);
      const rNow = t.r * (1 - age * 0.7);
      if (Math.hypot(mx - t.x, my - t.y) < rNow) {
        s.targets.splice(i, 1);
        s.score++;
        setDisplay((d) => ({ ...d, score: s.score }));
        break;
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, alignSelf: "flex-start" }}>
        Click targets before they vanish · 30 seconds
      </div>
      <canvas
        ref={canvasRef} width={W} height={H}
        style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", cursor: stateRef.current.running ? "crosshair" : "default" }}
        onClick={handleClick}
      />
      {!stateRef.current.running && !done && (
        <button
          onClick={start}
          style={{
            background: "#ef4444", color: "#fff", border: "none",
            borderRadius: 8, padding: "12px 40px", fontSize: 14,
            fontWeight: "bold", fontFamily: "inherit", letterSpacing: 2, cursor: "pointer",
          }}
        >▶ START GAME</button>
      )}
    </div>
  );
}

// ─── Coin Rush ────────────────────────────────────────────────────────────────
interface Falling { id: number; x: number; y: number; speed: number; type: "coin" | "bomb"; }
let fallId = 0;

function CoinRush({ onDone }: { onDone: (coins: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{ items: Falling[]; score: number; time: number; running: boolean; px: number }>({
    items: [], score: 0, time: 20, running: false, px: 210,
  });
  const rafRef    = useRef(0);
  const lastRef   = useRef(0);
  const spawnRef  = useRef(0);
  const [display, setDisplay] = useState({ score: 0, time: 20 });
  const [done, setDone] = useState(false);

  const W = 420, H = 380, PW = 52, PH = 16;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#070d1a";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(59,130,246,0.07)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 35) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }

    s.items.forEach((item) => {
      if (item.type === "coin") {
        const g = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, 14);
        g.addColorStop(0, "#fde68a"); g.addColorStop(1, "#f59e0b");
        ctx.beginPath(); ctx.arc(item.x, item.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.fillStyle = "#92400e"; ctx.font = "bold 11px serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("$", item.x, item.y);
      } else {
        ctx.beginPath(); ctx.arc(item.x, item.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b"; ctx.fill();
        ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(item.x - 9, item.y - 9); ctx.lineTo(item.x + 9, item.y + 9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(item.x + 9, item.y - 9); ctx.lineTo(item.x - 9, item.y + 9); ctx.stroke();
      }
    });

    const px = s.px - PW / 2;
    const g2 = ctx.createLinearGradient(px, H - 36, px, H - 20);
    g2.addColorStop(0, "#3b82f6"); g2.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.roundRect(px, H - 36, PW, PH, 4); ctx.fill();

    ctx.fillStyle = "#fff"; ctx.font = "bold 15px 'Courier New'";
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`${s.score >= 0 ? "+" : ""}${s.score}`, 14, 30);
    ctx.textAlign = "right";
    ctx.fillStyle = s.time <= 5 ? "#ef4444" : "#22d3ee";
    ctx.fillText(`${Math.ceil(s.time)}s`, W - 14, 30);
  }, []);

  const loop = useCallback((ts: number) => {
    const dt = lastRef.current ? (ts - lastRef.current) / 1000 : 0;
    lastRef.current = ts;
    const s = stateRef.current;
    if (!s.running) return;

    s.time = Math.max(0, s.time - dt);
    spawnRef.current -= dt;
    if (spawnRef.current <= 0) {
      s.items.push({
        id: ++fallId,
        x: 20 + Math.random() * (W - 40),
        y: -14,
        speed: 90 + Math.random() * 70,
        type: Math.random() < 0.28 ? "bomb" : "coin",
      });
      spawnRef.current = 0.35 + Math.random() * 0.45;
    }

    const PY = H - 36;
    const px = s.px;
    const remaining: Falling[] = [];
    for (const item of s.items) {
      item.y += item.speed * dt;
      const hit = item.y + 14 >= PY && item.y - 14 <= PY + PH && Math.abs(item.x - px) < PW / 2 + 14;
      if (hit) {
        if (item.type === "coin") s.score += 2;
        else s.score = Math.max(-5, s.score - 3);
        setDisplay((d) => ({ ...d, score: s.score }));
      } else if (item.y < H + 20) {
        remaining.push(item);
      }
    }
    s.items = remaining;
    setDisplay({ score: s.score, time: s.time });
    draw();

    if (s.time <= 0) {
      s.running = false;
      setDone(true);
      const coins = Math.max(0, Math.min(120, s.score * 5));
      onDone(coins);
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, onDone]);

  const start = () => {
    stateRef.current = { items: [], score: 0, time: 20, running: true, px: W / 2 };
    lastRef.current = 0; spawnRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    stateRef.current.px = Math.max(PW / 2, Math.min(W - PW / 2, (e.clientX - rect.left) * (W / rect.width)));
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, alignSelf: "flex-start" }}>
        Move mouse to catch coins · Avoid bombs · 20 seconds
      </div>
      <canvas
        ref={canvasRef} width={W} height={H}
        style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", cursor: "none" }}
        onMouseMove={handleMouseMove}
      />
      {!stateRef.current.running && !done && (
        <button
          onClick={start}
          style={{
            background: "#f59e0b", color: "#fff", border: "none",
            borderRadius: 8, padding: "12px 40px", fontSize: 14,
            fontWeight: "bold", fontFamily: "inherit", letterSpacing: 2, cursor: "pointer",
          }}
        >▶ START GAME</button>
      )}
    </div>
  );
}

// ─── Hub ─────────────────────────────────────────────────────────────────────
type GameId = "target" | "rush";
type View = "hub" | GameId;

export default function MinigamesHub() {
  const setPhase  = useGameStore((s) => s.setPhase);
  const addCoins  = useGameStore((s) => s.addCoins);
  const addGems   = useGameStore((s) => s.addGems);

  const [view,   setView]   = useState<View>("hub");
  const [earned, setEarned] = useState<number | null>(null);
  const [earnedGems, setEarnedGems] = useState(0);

  const targetEarned = loadDailyMg("target");
  const rushEarned   = loadDailyMg("rush");

  const GAMES = [
    {
      id: "target" as GameId,
      title: "🎯 Target Blast",
      desc: "Click shrinking targets before they vanish. Faster clicks = higher score.",
      color: "#ef4444",
      dailyLimit: MAX_DAILY,
      earned: targetEarned,
      locked: targetEarned >= MAX_DAILY,
    },
    {
      id: "rush" as GameId,
      title: "🪙 Coin Rush",
      desc: "Move your paddle to catch falling coins. Bombs cost you points — watch out.",
      color: "#f59e0b",
      dailyLimit: MAX_DAILY,
      earned: rushEarned,
      locked: rushEarned >= MAX_DAILY,
    },
  ];

  const handleDone = (gameId: GameId, coins: number) => {
    const prev   = loadDailyMg(gameId);
    const canAdd = Math.max(0, MAX_DAILY - prev);
    const actual = Math.min(coins, canAdd);
    saveDailyMg(gameId, prev + actual);

    const bonusGem = actual >= 100 ? 1 : 0;
    if (actual > 0) addCoins(actual);
    if (bonusGem) addGems(bonusGem);

    setEarned(actual);
    setEarnedGems(bonusGem);
  };

  if (view !== "hub") {
    return (
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 20%, #0a1628 0%, #020508 100%)",
        fontFamily: "'Courier New', monospace",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "16px 24px", display: "flex", alignItems: "center", gap: 16,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.4)", flexShrink: 0,
        }}>
          <button
            onClick={() => { setView("hub"); setEarned(null); setEarnedGems(0); }}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.15)",
              color: "#94a3b8", borderRadius: 8, padding: "7px 14px",
              cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            }}
          >← BACK</button>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: 3 }}>
            {view === "target" ? "🎯 TARGET BLAST" : "🪙 COIN RUSH"}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          {earned !== null ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{earned > 0 ? "🏆" : "💀"}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>GAME OVER</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 22, color: "#f59e0b", fontWeight: "bold", marginBottom: 8 }}>
                <CoinIcon size={24} /> +{earned} COINS
              </div>
              {earnedGems > 0 && (
                <div style={{ fontSize: 16, color: "#06b6d4", fontWeight: "bold", marginBottom: 8 }}>
                  💎 +{earnedGems} GEM BONUS!
                </div>
              )}
              {earned === 0 && <div style={{ fontSize: 12, color: "#475569" }}>Daily limit reached for this game.</div>}
              <button
                onClick={() => { setView("hub"); setEarned(null); setEarnedGems(0); }}
                style={{
                  marginTop: 24, background: "#1e3a5f", color: "#93c5fd",
                  border: "1px solid #3b82f633", borderRadius: 8,
                  padding: "12px 32px", fontSize: 13, fontWeight: "bold",
                  fontFamily: "inherit", letterSpacing: 2, cursor: "pointer",
                }}
              >BACK TO HUB</button>
            </div>
          ) : (
            view === "target"
              ? <TargetBlast onDone={(c) => handleDone("target", c)} />
              : <CoinRush onDone={(c) => handleDone("rush", c)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 20%, #0a1628 0%, #020508 100%)",
      fontFamily: "'Courier New', monospace",
      display: "flex", flexDirection: "column",
    }}>
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
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>MINIGAMES</div>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2 }}>
            EARN COINS · UP TO {MAX_DAILY} PER GAME DAILY · 💎 BONUS GEMS AT 100+ COINS
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, gap: 24 }}>
        {GAMES.map((g) => (
          <div
            key={g.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${g.color}33`,
              borderRadius: 16, padding: "32px 28px", width: 260,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 12 }}>{g.title.split(" ")[0]}</div>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#fff", letterSpacing: 2, marginBottom: 8 }}>
              {g.title.slice(3)}
            </div>
            <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.7, marginBottom: 20, minHeight: 48 }}>
              {g.desc}
            </div>

            {/* Daily progress */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginBottom: 5 }}>
                <span>TODAY'S COINS</span>
                <span style={{ color: g.earned >= MAX_DAILY ? "#22c55e" : "#94a3b8" }}>
                  {g.earned}/{MAX_DAILY}
                </span>
              </div>
              <div style={{ height: 4, background: "#0f172a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  width: `${(g.earned / MAX_DAILY) * 100}%`, height: "100%",
                  background: g.earned >= MAX_DAILY ? "#22c55e" : g.color, borderRadius: 2,
                }} />
              </div>
            </div>

            <button
              onClick={() => { if (!g.locked) setView(g.id); }}
              disabled={g.locked}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 10,
                background: g.locked ? "#1e293b" : `linear-gradient(135deg, ${g.color}dd, ${g.color})`,
                color: g.locked ? "#475569" : "#fff",
                border: "none", cursor: g.locked ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: "bold", fontFamily: "inherit",
                letterSpacing: 2, transition: "all .15s",
              }}
            >{g.locked ? "✓ LIMIT REACHED" : "▶ PLAY"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
