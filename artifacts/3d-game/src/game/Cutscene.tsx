import { useEffect, useRef } from "react";
import { useGameStore } from "./store";
import { getStory } from "./StoryData";
import { initAudio } from "./sounds";
import { initMusic } from "./music";

export default function Cutscene() {
  const currentLevel = useGameStore((s) => s.currentLevel);
  const musicVolume  = useGameStore((s) => s.musicVolume);
  const restart      = useGameStore((s) => s.restart);
  const setGameMode  = useGameStore((s) => s.setGameMode);
  const story        = getStory(currentLevel);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.2 + 0.05,
      opacity: Math.random(),
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.opacity += p.speed * 0.02;
        const o = Math.abs(Math.sin(p.opacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,197,255,${o * 0.5})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const play = () => {
    initAudio();
    initMusic(musicVolume);
    setGameMode("levels");
    restart();
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 30%, #06101e 0%, #010306 100%)",
      fontFamily: "'Courier New', monospace",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* Scanlines overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
      }} />

      <div style={{
        position: "relative", maxWidth: 680, width: "92%", zIndex: 1,
        animation: "fadeSlideIn 0.8s ease forwards",
      }}>
        {/* Arc label */}
        <div style={{
          fontSize: 10, letterSpacing: 5, color: "#ef4444",
          marginBottom: 8, display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 30, height: 1, background: "#ef4444" }} />
          {story.arc}
          <div style={{ width: 30, height: 1, background: "#ef4444" }} />
        </div>

        {/* Level badge */}
        <div style={{
          display: "inline-block", background: "rgba(59,130,246,0.12)",
          border: "1px solid rgba(59,130,246,0.3)", borderRadius: 4,
          padding: "3px 12px", fontSize: 10, color: "#60a5fa",
          letterSpacing: 4, marginBottom: 14,
        }}>
          LEVEL {currentLevel} BRIEFING
        </div>

        {/* Title */}
        <div style={{
          fontSize: 42, fontWeight: 900, color: "#fff", letterSpacing: 2,
          marginBottom: 24, lineHeight: 1.1,
          textShadow: "0 0 30px rgba(96,165,250,0.3)",
        }}>
          {story.title}
        </div>

        {/* Story text */}
        <div style={{
          fontSize: 16, color: "#94a3b8", lineHeight: 1.9,
          marginBottom: 32, padding: "24px 28px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderLeft: "3px solid #3b82f6",
          borderRadius: "0 10px 10px 0",
        }}>
          {story.text}
        </div>

        {/* Narrator */}
        <div style={{
          fontSize: 10, color: "#475569", letterSpacing: 3, marginBottom: 28,
        }}>
          — {story.narrator}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 14 }}>
          <button
            onClick={play}
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "16px 48px", fontSize: 16, fontWeight: "bold",
              fontFamily: "inherit", letterSpacing: 3, cursor: "pointer",
              boxShadow: "0 0 24px rgba(59,130,246,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            ▶ DEPLOY
          </button>
          <button
            onClick={play}
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "#475569", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "16px 32px", fontSize: 14,
              fontFamily: "inherit", letterSpacing: 2, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#475569"; }}
          >
            SKIP ⟩⟩
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
