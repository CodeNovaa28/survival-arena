import { Html } from "@react-three/drei";
import { useGameStore } from "./store";

export default function DamageNumbers() {
  const events = useGameStore((s) => s.damageEvents);

  return (
    <>
      <style>{`
        @keyframes dmg-float {
          0%   { opacity: 1; transform: translate(-50%, 0px);    }
          100% { opacity: 0; transform: translate(-50%, -62px); }
        }
        .dmg-num   { animation: dmg-float 1.15s ease-out forwards; pointer-events: none; user-select: none; white-space: nowrap; font-family: 'Courier New', monospace; font-weight: 900; text-shadow: 0 2px 6px rgba(0,0,0,0.95); }
        .dmg-crit  { color: #facc15; font-size: 22px; }
        .dmg-norm  { color: #f87171; font-size: 16px; }
        .dmg-melee { color: #fb923c; font-size: 18px; }
        .dmg-heal  { color: #4ade80; font-size: 16px; }
      `}</style>
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
