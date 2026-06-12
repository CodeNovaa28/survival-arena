import { useEffect } from "react";
import { Html } from "@react-three/drei";
import { useGameStore } from "./store";

// Inject CSS once into document head (avoids putting <style> inside R3F canvas)
const DMG_CSS = `
  @keyframes dmg-float {
    0%   { opacity: 1;   transform: translate(-50%, 0px);   }
    70%  { opacity: 1;   transform: translate(-50%, -38px); }
    100% { opacity: 0;   transform: translate(-50%, -62px); }
  }
  .dmg-num   {
    animation: dmg-float 1.15s ease-out forwards;
    pointer-events: none; user-select: none; white-space: nowrap;
    font-family: 'Courier New', monospace; font-weight: 900;
    text-shadow: 0 0 8px currentColor, 0 2px 6px rgba(0,0,0,0.95);
    letter-spacing: 0.5px;
  }
  .dmg-crit  { color: #facc15; font-size: 23px; }
  .dmg-norm  { color: #f87171; font-size: 16px; }
  .dmg-melee { color: #fb923c; font-size: 18px; }
`;

export default function DamageNumbers() {
  const events = useGameStore((s) => s.damageEvents);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "dmg-numbers-css";
    el.textContent = DMG_CSS;
    if (!document.getElementById("dmg-numbers-css")) {
      document.head.appendChild(el);
    }
    return () => { document.getElementById("dmg-numbers-css")?.remove(); };
  }, []);

  return (
    <>
      {events.map((e) => (
        <Html key={e.id} position={[e.x, 2.1, e.z]}>
          <div className={`dmg-num ${e.crit ? "dmg-crit" : e.melee ? "dmg-melee" : "dmg-norm"}`}>
            {e.crit ? `✦${e.value}` : e.melee ? `⚔${e.value}` : `-${e.value}`}
          </div>
        </Html>
      ))}
    </>
  );
}
