import { useEffect, useRef } from "react";
import { useGameStore } from "./store";
import { initAudio } from "./sounds";
import { initMusic } from "./music";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function StartScreen() {
  const highScore              = useGameStore((s) => s.highScore);
  const coins                  = useGameStore((s) => s.coins);
  const highestUnlockedLevel   = useGameStore((s) => s.highestUnlockedLevel);
  const completedLevels        = useGameStore((s) => s.completedLevels);
  const musicVolume            = useGameStore((s) => s.musicVolume);
  const totalCoinsEarned       = useGameStore((s) => s.totalCoinsEarned);
  const permanentPerks         = useGameStore((s) => s.permanentPerks);
  const lastDailyChest         = useGameStore((s) => s.lastDailyChest);
  const setPhase               = useGameStore((s) => s.setPhase);
  const setGameMode            = useGameStore((s) => s.setGameMode);
  const restart                = useGameStore((s) => s.restart);
  const refreshQuests          = useGameStore((s) => s.refreshDailyQuestsIfNeeded);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { refreshQuests(); }, [refreshQuests]);

  // Animated star background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
    }));

    let raf = 0;
    const draw = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.opacity += s.speed * 0.03;
        const o = Math.abs(Math.sin(s.opacity));
        ctx2d.beginPath();
        ctx2d.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(148,197,255,${o * 0.7})`;
        ctx2d.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const startEndless = () => {
    initAudio();
    initMusic(musicVolume);
    setGameMode("endless");
    restart();
  };

  const goLevels = () => {
    initAudio();
    initMusic(musicVolume);
    setPhase("levelselect");
  };

  const chestAvailable = lastDailyChest !== `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
  const nextMilestone  = [100,300,700,1500,3000,6000,12000,25000].find((m) => totalCoinsEarned < m);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 30%, #0a1a2e 0%, #020508 100%)",
      fontFamily: "'Courier New', monospace", overflow: "hidden",
    }}>
      {/* Stars */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "20%", left: "15%", width: 300, height: 300,
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ position: "relative", textAlign: "center", maxWidth: 640, width: "92%", zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: "inline-block", background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)", borderRadius: 4,
          padding: "4px 16px", fontSize: 11, color: "#f87171",
          letterSpacing: 5, marginBottom: 16,
        }}>
          ◆ SURVIVAL SHOOTER ◆
        </div>

        {/* Title */}
        <div style={{
          fontSize: 72, fontWeight: 900, lineHeight: 0.9, marginBottom: 6,
          letterSpacing: 6,
          background: "linear-gradient(180deg, #ffffff 0%, #93c5fd 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 40px rgba(96,165,250,0.4))",
        }}>
          ZONE<br />
          <span style={{
            background: "linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>BREACH</span>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 14, margin: "20px 0 24px",
          flexWrap: "wrap",
        }}>
          {([
            { icon: "🪙", label: "COINS",  val: coins.toString(),                          accent: "#f59e0b" },
            { icon: "⏱",  label: "BEST",   val: highScore > 0 ? formatTime(highScore) : "—", accent: "#60a5fa" },
            { icon: "🎯", label: "LEVELS", val: `${completedLevels.length}/20`,              accent: "#a855f7" },
          ] as const).map((stat) => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${stat.accent}22`,
              borderRadius: 12, padding: "14px 22px", minWidth: 110,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{ fontSize: 24 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#fff", lineHeight: 1 }}>{stat.val}</div>
              <div style={{ fontSize: 9, color: stat.accent, letterSpacing: 3, opacity: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mode cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <ModeCard
            icon="♾️"
            title="ENDLESS"
            desc="Survive as long as you can."
            color="#3b82f6"
            onClick={startEndless}
          />
          <ModeCard
            icon="🎯"
            title="LEVELS"
            desc={`${completedLevels.length}/20 complete`}
            color="#a855f7"
            onClick={goLevels}
          />
          <ModeCard
            icon="⚙️"
            title="PRACTICE"
            desc="Train with dummies. No death."
            color="#22c55e"
            onClick={() => setPhase("practice")}
          />
        </div>

        {/* Bottom buttons row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          <button
            onClick={() => setPhase("customization")}
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#94a3b8", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, padding: "13px 0", fontSize: 13,
              fontFamily: "'Courier New', monospace", letterSpacing: 2,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.target as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.target as HTMLElement).style.color = "#94a3b8"; }}
          >🎨 CUSTOMIZE</button>

          <button
            onClick={() => setPhase("dailyrewards")}
            style={{
              background: chestAvailable ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
              color: chestAvailable ? "#fbbf24" : "#94a3b8",
              border: `1px solid ${chestAvailable ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.12)"}`,
              borderRadius: 10, padding: "13px 0", fontSize: 13,
              fontFamily: "'Courier New', monospace", letterSpacing: 2,
              cursor: "pointer", transition: "all 0.2s",
              position: "relative",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = chestAvailable ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = chestAvailable ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)"; }}
          >
            {chestAvailable && (
              <span style={{
                position: "absolute", top: -6, right: 12,
                background: "#ef4444", borderRadius: "50%",
                width: 12, height: 12, fontSize: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: "bold",
              }}>!</span>
            )}
            📅 DAILY REWARDS
          </button>
        </div>

        {/* Milestone perk notification */}
        {nextMilestone && permanentPerks.length < 8 && (
          <div style={{
            background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: 8, padding: "8px 14px", marginBottom: 14,
            fontSize: 10, color: "#c4b5fd", letterSpacing: 1,
          }}>
            🌟 MILESTONE PERK at {nextMilestone}🪙 total — you have {totalCoinsEarned}🪙 · {nextMilestone - totalCoinsEarned} more to go
          </div>
        )}
        {permanentPerks.length > 0 && (
          <div style={{
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 8, padding: "6px 14px", marginBottom: 14,
            fontSize: 10, color: "#4ade80", letterSpacing: 1,
          }}>
            ✓ {permanentPerks.length} PERMANENT PERK{permanentPerks.length > 1 ? "S" : ""} ACTIVE THIS RUN
          </div>
        )}

        {/* Controls */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 11,
        }}>
          {[
            ["WASD / ↑↓←→", "Move"],
            ["Click", "Shoot"],
            ["F", "Melee"],
            ["ESC", "Pause"],
          ].map(([k, v]) => (
            <div key={k} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6, padding: "8px 6px", textAlign: "center",
            }}>
              <div style={{ color: "#60a5fa", fontWeight: "bold", marginBottom: 3 }}>{k}</div>
              <div style={{ color: "#555" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Enemy legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          {([
            ["#ef4444","Chaser","3🪙"],
            ["#7c3aed","Tank","12🪙"],
            ["#f97316","Ranged","6🪙"],
            ["#06b6d4","Speeder","5🪙"],
            ["#84cc16","Bomber","10🪙"],
          ] as const).map(([c, n, coinLabel]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555" }}>
              <div style={{ width: 8, height: 8, background: c, borderRadius: 2 }} />
              <span style={{ color: "#666" }}>{n}</span>
              <span style={{ color: "#f59e0b", fontSize: 10 }}>{coinLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, color, onClick }: {
  icon: string; title: string; desc: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
        border: `1px solid ${color}44`,
        borderRadius: 12, padding: "18px 12px", cursor: "pointer",
        transition: "all 0.2s", textAlign: "left",
        fontFamily: "'Courier New', monospace",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${color}44 0%, ${color}22 100%)`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${color}33`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: "bold", color: "#fff", letterSpacing: 2, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 10, color: "#666", lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}
