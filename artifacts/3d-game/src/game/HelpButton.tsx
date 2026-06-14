import { useState } from "react";

const SECTIONS = [
  {
    title: "🎮 Movement & Controls",
    items: [
      ["WASD  or  ↑↓←→", "Move your character"],
      ["Mouse", "Aim (character always faces cursor)"],
      ["Left Click", "Shoot toward cursor"],
      ["F (hold)", "Melee attack in front arc"],
      ["Q", "Drone Strike ability (unlocks at Level 5)"],
      ["E", "Squad Backup ability (unlocks at Level 8)"],
      ["ESC", "Pause / Unpause"],
    ],
  },
  {
    title: "🏆 Game Modes",
    items: [
      ["Endless", "Survive as long as possible — waves never stop. Compete for best time."],
      ["Levels", "20 progressively harder challenges. Complete them to unlock perks & skins."],
      ["Practice", "No death, no zone, no timer. Train on dummies with all your gear."],
    ],
  },
  {
    title: "💥 Combat System",
    items: [
      ["Bullets", "Click to shoot — faster guns have shorter range"],
      ["Melee", "Press F near enemies for instant melee damage (arc in front)"],
      ["Critical Hits ✦", "15% chance for 2× damage, shown in gold"],
      ["Killstreak", "5+ kills in a row = 1.5× coins · 10+ = 2× · 20+ = 3×"],
      ["Killstreak Reset", "Taking any damage resets your streak"],
    ],
  },
  {
    title: "🗺️ Safe Zone",
    items: [
      ["Zone", "A glowing circle that shrinks over time — stay inside it"],
      ["Outside", "⚠ warning = 20 damage/sec until you return"],
      ["Shrink Rate", "Zone shrinks faster on later waves and harder levels"],
    ],
  },
  {
    title: "⚡ Power-Ups (ground drops)",
    items: [
      ["⚡ SPD", "Speed boost for 8 seconds"],
      ["🛡 SHD", "Shield: absorbs most damage for 5 seconds"],
      ["🔥 RFR", "Rapid Fire: 60% faster fire rate for 10 seconds"],
      ["💊 HLT", "Heal: instantly restore 35 HP"],
      ["🛸 DRN", "Drone: 2 attack drones orbit and shoot for 20 seconds"],
    ],
  },
  {
    title: "🛍️ Shop & Economy",
    items: [
      ["Coins", "Kill enemies to earn coins — harder enemies = more coins"],
      ["Shop", "Spend coins on skins, guns, maps, and melee weapons"],
      ["Daily Chest", "Free coins every day — claim in Daily Rewards"],
      ["Spin Wheel", "Spin daily for coins (free once a day)"],
      ["Daily Quests", "3 quests refresh each day — complete them for bonus coins"],
    ],
  },
  {
    title: "🌟 Milestone Perks (permanent!)",
    items: [
      ["100 coins", "+25 Max HP every run"],
      ["300 coins", "Start each run with Rapid Fire"],
      ["700 coins", "Start each run with Squad Backup"],
      ["1500 coins", "Start each run with Shield"],
      ["3000 coins", "Permanent Second Life (revive once per run)"],
      ["6000 coins", "Drone Strike Q unlocked from Wave 1"],
      ["12000 coins", "Start each run with Drone Strike"],
    ],
  },
  {
    title: "👥 Enemies",
    items: [
      ["🔴 Chaser", "Fast, rushes directly at you — 3 coins"],
      ["🟣 Tank", "Slow but massive HP — 12 coins"],
      ["🟠 Ranged", "Keeps distance and shoots bullets — 6 coins"],
      ["🔵 Speeder", "Extremely fast with zigzag movement — 5 coins"],
      ["🟢 Bomber", "Explodes on death near you — 10 coins"],
    ],
  },
];

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="How to Play"
        style={{
          position: "fixed", bottom: 18, right: 18, zIndex: 200,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(15,23,42,0.95)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          color: "#64748b", fontSize: 20, fontWeight: "bold",
          cursor: "pointer", fontFamily: "Georgia, serif",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(59,130,246,0.9)";
          el.style.color = "#fff";
          el.style.borderColor = "#3b82f6";
          el.style.boxShadow = "0 0 18px rgba(59,130,246,0.5)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(15,23,42,0.95)";
          el.style.color = "#64748b";
          el.style.borderColor = "rgba(255,255,255,0.15)";
          el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.6)";
        }}
      >?</button>

      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "12px",
          }}
        >
          <div style={{
            background: "#070a12", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, width: "100%", maxWidth: 700,
            maxHeight: "92vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
            fontFamily: "'Courier New', monospace",
            boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
          }}>
            {/* Header */}
            <div style={{
              padding: "18px 24px", display: "flex", alignItems: "center",
              justifyContent: "space-between", flexShrink: 0,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "linear-gradient(90deg, rgba(59,130,246,0.12) 0%, transparent 100%)",
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>HOW TO PLAY</div>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 3, marginTop: 2 }}>ZONE BREACH — COMPLETE GUIDE</div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#64748b", borderRadius: 8, padding: "6px 14px",
                cursor: "pointer", fontSize: 13, fontFamily: "inherit",
              }}>✕ CLOSE</button>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Sidebar nav */}
              <div style={{
                width: 160, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)",
                padding: "12px 0", overflowY: "auto",
                background: "rgba(0,0,0,0.3)",
              }}>
                {SECTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSection(i)}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 16px",
                      background: i === section ? "rgba(59,130,246,0.15)" : "none",
                      border: "none",
                      borderLeft: i === section ? "2px solid #3b82f6" : "2px solid transparent",
                      color: i === section ? "#93c5fd" : "#475569",
                      fontSize: 10, letterSpacing: 1,
                      cursor: "pointer", transition: "all 0.1s",
                      fontFamily: "inherit",
                    }}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Content panel */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                <div style={{
                  fontSize: 14, fontWeight: "bold", color: "#60a5fa",
                  letterSpacing: 2, marginBottom: 16,
                  paddingBottom: 10, borderBottom: "1px solid rgba(96,165,250,0.2)",
                }}>
                  {SECTIONS[section].title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {SECTIONS[section].items.map(([key, val], i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, alignItems: "flex-start",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 8,
                    }}>
                      <span style={{
                        background: "rgba(96,165,250,0.12)",
                        border: "1px solid rgba(96,165,250,0.3)",
                        borderRadius: 6, padding: "3px 10px",
                        fontSize: 11, color: "#60a5fa",
                        fontWeight: "bold", whiteSpace: "nowrap",
                        flexShrink: 0, minWidth: 80, textAlign: "center",
                      }}>{key}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div style={{
              padding: "10px 24px", borderTop: "1px solid rgba(255,255,255,0.05)",
              fontSize: 10, color: "#334155", letterSpacing: 2, textAlign: "center",
              flexShrink: 0,
            }}>
              CLICK OUTSIDE OR PRESS ✕ TO CLOSE · ? BUTTON ALWAYS AVAILABLE
            </div>
          </div>
        </div>
      )}
    </>
  );
}
