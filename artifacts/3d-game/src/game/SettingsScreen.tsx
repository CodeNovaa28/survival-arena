import { useGameStore } from "./store";
import { setMusicVolume } from "./music";
import { setSfxVolume } from "./sounds";

export default function SettingsScreen() {
  const musicVolume   = useGameStore((s) => s.musicVolume);
  const sfxVolume     = useGameStore((s) => s.sfxVolume);
  const storyEnabled  = useGameStore((s) => s.storyEnabled);
  const setMVol       = useGameStore((s) => s.setMusicVolume);
  const setSVol       = useGameStore((s) => s.setSfxVolume);
  const setStory      = useGameStore((s) => s.setStoryEnabled);
  const setPhase      = useGameStore((s) => s.setPhase);

  const handleMusic = (v: number) => { setMVol(v); setMusicVolume(v); };
  const handleSfx   = (v: number) => { setSVol(v); setSfxVolume(v); };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 20%, #0a1628 0%, #020508 100%)",
      fontFamily: "'Courier New', monospace",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 520, padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
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
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 5 }}>⚙ SETTINGS</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2 }}>AUDIO · GAMEPLAY · CONTROLS</div>
          </div>
        </div>

        {/* Audio */}
        <Section label="🎵 AUDIO">
          <VolumeSlider label="Music" value={musicVolume} onChange={handleMusic} color="#3b82f6" />
          <VolumeSlider label="Sound Effects" value={sfxVolume} onChange={handleSfx} color="#22c55e" />
        </Section>

        {/* Story Mode */}
        <Section label="📖 STORY MODE">
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: "bold", marginBottom: 4 }}>
                  Story Mode
                </div>
                <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.6, maxWidth: 340 }}>
                  Before each mission, a cinematic briefing sets the scene with narrative and atmosphere.
                  Can be skipped at any time.
                </div>
              </div>
              <ToggleSwitch value={storyEnabled} onChange={setStory} />
            </div>
            {storyEnabled && (
              <div style={{
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 8, padding: "10px 14px", fontSize: 10, color: "#93c5fd",
                lineHeight: 1.6,
              }}>
                ✓ Story cutscenes are <strong>ON</strong>. You'll see mission briefings before each level.
                Press <strong>SKIP</strong> to jump straight into combat.
              </div>
            )}
          </div>
        </Section>

        {/* Controls */}
        <Section label="🎮 CONTROLS">
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
          }}>
            {[
              ["WASD / ↑↓←→", "Move"],
              ["Mouse Click", "Shoot"],
              ["Auto", "Melee (near enemies)"],
              ["F", "Force melee swing"],
              ["Q", "Drone Strike (Lv 5+)"],
              ["E", "Squad Backup (Lv 8+)"],
              ["ESC", "Pause / Resume"],
              ["Tab", "—"],
            ].map(([k, v]) => (
              <div key={k} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, padding: "10px 14px", display: "flex", gap: 10,
                alignItems: "center",
              }}>
                <span style={{ color: "#60a5fa", fontWeight: "bold", minWidth: 80, fontSize: 12 }}>{k}</span>
                <span style={{ color: "#475569", fontSize: 11 }}>{v}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <style>{`
        input[type="range"] { appearance: none; -webkit-appearance: none; height: 5px; border-radius: 5px; outline: none; cursor: pointer; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; }
      `}</style>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 3, marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}

function VolumeSlider({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: string;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "14px 18px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 13, color: color, fontWeight: "bold" }}>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range" min={0} max={1} step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          background: `linear-gradient(to right, ${color} ${value * 100}%, #1e293b ${value * 100}%)`,
          accentColor: color,
        }}
      />
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 52, height: 28, borderRadius: 14, border: "none",
        background: value ? "#3b82f6" : "#1e293b",
        cursor: "pointer", position: "relative", transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: value ? 27 : 3,
        width: 22, height: 22,
        borderRadius: "50%",
        background: value ? "#fff" : "#475569",
        transition: "left 0.2s, background 0.2s",
      }} />
    </button>
  );
}

import React from "react";
