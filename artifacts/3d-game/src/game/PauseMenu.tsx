import { useGameStore } from "./store";
import { setMusicVolume, stopMusic, startMusic } from "./music";
import { setSfxVolume } from "./sounds";

export default function PauseMenu() {
  const musicVolume  = useGameStore((s) => s.musicVolume);
  const sfxVolume    = useGameStore((s) => s.sfxVolume);
  const setPaused    = useGameStore((s) => s.setPaused);
  const setMVol      = useGameStore((s) => s.setMusicVolume);
  const setSVol      = useGameStore((s) => s.setSfxVolume);
  const setPhase     = useGameStore((s) => s.setPhase);

  const resume = () => setPaused(false);

  const quit = () => {
    stopMusic();
    setPhase("start");
    setPaused(false);
  };

  const handleMusicVol = (v: number) => {
    setMVol(v);
    setMusicVolume(v);
  };

  const handleSfxVol = (v: number) => {
    setSVol(v);
    setSfxVolume(v);
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      zIndex: 200, fontFamily: "'Courier New', monospace",
    }}>
      <div style={{
        background: "#080c14", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 18, padding: "40px 48px", minWidth: 340,
        boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>⏸ PAUSED</div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, marginTop: 4 }}>GAME PAUSED</div>
        </div>

        {/* Settings */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>⚙️ SETTINGS</SectionLabel>

          <VolumeSlider
            label="🎵 Music"
            value={musicVolume}
            onChange={handleMusicVol}
          />
          <VolumeSlider
            label="🔊 SFX"
            value={sfxVolume}
            onChange={handleSfxVol}
          />
        </div>

        {/* Info */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 11,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px",
        }}>
          {[["WASD", "Move"], ["Click", "Shoot"], ["ESC", "Pause/Resume"], ["Survive", "Stay in zone"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#60a5fa", minWidth: 60 }}>{k}</span>
              <span style={{ color: "#555" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PauseBtn label="▶  RESUME" color="#22c55e" onClick={resume} />
          <PauseBtn label="🏠 MAIN MENU" color="#1e3a5f" onClick={quit} />
        </div>
      </div>

      <style>{`
        input[type="range"] { appearance: none; -webkit-appearance: none; height: 4px; border-radius: 4px; outline: none; cursor: pointer; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #60a5fa; cursor: pointer; }
      `}</style>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function VolumeSlider({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#aaa" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#60a5fa" }}>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range" min={0} max={1} step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          background: `linear-gradient(to right, #3b82f6 ${value * 100}%, #1e293b ${value * 100}%)`,
        }}
      />
    </div>
  );
}

function PauseBtn({ label, color, onClick }: {
  label: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color, color: "#fff", border: "none",
        borderRadius: 9, padding: "14px 0", fontSize: 15,
        fontWeight: "bold", fontFamily: "'Courier New', monospace",
        letterSpacing: 2, cursor: "pointer", transition: "all 0.15s",
        width: "100%",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
    >
      {label}
    </button>
  );
}
