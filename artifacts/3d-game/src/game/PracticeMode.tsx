import { useState } from "react";
import { useGameStore } from "./store";
import { MAPS } from "./gameMaps";
import { initAudio } from "./sounds";
import { initMusic } from "./music";

export default function PracticeMode() {
  const setPhase       = useGameStore((s) => s.setPhase);
  const setGameMode    = useGameStore((s) => s.setGameMode);
  const setSelectedMap = useGameStore((s) => s.selectMap);
  const ownedMaps      = useGameStore((s) => s.ownedMaps);
  const selectedMap    = useGameStore((s) => s.selectedMap);
  const musicVolume    = useGameStore((s) => s.musicVolume);
  const restart        = useGameStore((s) => s.restart);

  const [hoveredMap, setHoveredMap] = useState<string | null>(null);

  const ownedMapDefs = MAPS.filter((m) => ownedMaps.includes(m.id));

  const startPractice = () => {
    initAudio();
    initMusic(musicVolume);
    setGameMode("practice");
    restart();
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
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>⚙️ PRACTICE MODE</div>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginTop: 2 }}>NO DEATH · NO ZONE · NO TIMER · DUMMIES RESPAWN</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { icon: "🎯", title: "Target Dummies", desc: "12 stationary dummies placed around the map — kill them to test your damage output." },
            { icon: "💊", title: "Can't Die", desc: "Your HP will never drop below 1 HP. Focus on learning weapon ranges and angles." },
            { icon: "⚡", title: "Power-ups Active", desc: "Power-ups still spawn and can be collected, just like in a real match." },
            { icon: "🗺️", title: "All Your Maps", desc: "Choose from any map you own. Dummies will be placed across the full arena." },
          ].map((c) => (
            <div key={c.title} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "16px 14px", textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 12, fontWeight: "bold", color: "#fff", marginBottom: 6, letterSpacing: 1 }}>{c.title}</div>
              <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Map picker */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 3, marginBottom: 16 }}>SELECT MAP</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {MAPS.map((map) => {
              const owned = ownedMaps.includes(map.id);
              const selected = selectedMap === map.id;
              const hovered = hoveredMap === map.id;
              return (
                <button
                  key={map.id}
                  disabled={!owned}
                  onClick={() => { if (owned) setSelectedMap(map.id); }}
                  onMouseEnter={() => setHoveredMap(map.id)}
                  onMouseLeave={() => setHoveredMap(null)}
                  style={{
                    background: selected
                      ? "rgba(59,130,246,0.2)"
                      : hovered && owned
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.03)",
                    border: selected
                      ? "2px solid #3b82f6"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, padding: "16px 12px",
                    cursor: owned ? "pointer" : "not-allowed",
                    opacity: owned ? 1 : 0.4,
                    transition: "all 0.15s", textAlign: "center",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{map.badge}</div>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: selected ? "#93c5fd" : "#fff", letterSpacing: 1 }}>
                    {map.name}
                  </div>
                  <div style={{ fontSize: 9, color: "#475569", marginTop: 4 }}>
                    {owned ? "OWNED" : "LOCKED"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weapon reminder */}
        <div style={{
          background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 28,
          fontSize: 11, color: "#60a5fa", lineHeight: 1.8,
        }}>
          <span style={{ fontWeight: "bold", letterSpacing: 1 }}>💡 TIP —</span>{" "}
          Your currently selected gun and melee weapon will be used in Practice mode.
          Head to <strong>Customize</strong> to change them first.
        </div>

        {/* Start button */}
        <button
          onClick={startPractice}
          style={{
            width: "100%", padding: "18px 0", fontSize: 16,
            fontWeight: 900, letterSpacing: 4,
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#fff", border: "none", borderRadius: 12,
            cursor: "pointer", transition: "all 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.filter = "none";
            (e.currentTarget as HTMLElement).style.transform = "none";
          }}
        >
          ⚙️ START PRACTICE
        </button>
      </div>
    </div>
  );
}
