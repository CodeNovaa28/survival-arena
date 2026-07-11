import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, KillEffectType, DyingEnemy } from "./store";

const EFFECT_PALETTE: Record<KillEffectType, string[]> = {
  explosion:   ["#ff4500", "#ff8c00", "#ffd700", "#fff"],
  dissolve:    ["#22c55e", "#4ade80", "#86efac", "#d1fae5"],
  shatter:     ["#93c5fd", "#bfdbfe", "#dbeafe", "#ffffff"],
  vaporize:    ["#c026d3", "#e879f9", "#f0abfc", "#fae8ff"],
  vortex:      ["#06b6d4", "#22d3ee", "#67e8f9", "#cffafe"],
  freeze:      ["#bfdbfe", "#e0f2fe", "#ffffff", "#93c5fd"],
  electrocute: ["#facc15", "#fef08a", "#ffffff", "#fde047"],
  disintegrate:["#1e1b4b", "#4c1d95", "#7c3aed", "#a855f7"],
};

const EFFECT_MOTION: Record<KillEffectType, "outward" | "up" | "spin" | "implosion"> = {
  explosion:    "outward",
  dissolve:     "up",
  shatter:      "outward",
  vaporize:     "up",
  vortex:       "spin",
  freeze:       "outward",
  electrocute:  "up",
  disintegrate: "implosion",
};

interface FXParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

function buildFX(pos: THREE.Vector3, effect: KillEffectType): FXParticle[] {
  const palette = EFFECT_PALETTE[effect];
  const motion  = EFFECT_MOTION[effect];
  const count   = 16;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 2 + Math.random() * 5;
    const ml    = 0.6 + Math.random() * 0.5;
    let vel: THREE.Vector3;
    if (motion === "up") {
      vel = new THREE.Vector3((Math.random() - 0.5) * 2, 3 + Math.random() * 6, (Math.random() - 0.5) * 2);
    } else if (motion === "spin") {
      const r = speed * 0.7;
      vel = new THREE.Vector3(Math.cos(angle) * r, 1 + Math.random() * 3, Math.sin(angle) * r);
    } else if (motion === "implosion") {
      const dx = pos.x - (pos.x + (Math.random() - 0.5) * 4);
      const dz = pos.z - (pos.z + (Math.random() - 0.5) * 4);
      vel = new THREE.Vector3(dx, -1 - Math.random() * 2, dz);
    } else {
      vel = new THREE.Vector3(Math.cos(angle) * speed, Math.random() * 3 + 0.5, Math.sin(angle) * speed);
    }
    const startPos = pos.clone().add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.5, 0.3 + Math.random() * 0.8, (Math.random() - 0.5) * 0.5,
    ));
    return {
      pos:    startPos,
      vel,
      color:  palette[Math.floor(Math.random() * palette.length)],
      life:   ml,
      maxLife: ml,
      size:   0.06 + Math.random() * 0.14,
    };
  });
}

function EffectInstance({ dying }: { dying: DyingEnemy }) {
  const particles = useRef<FXParticle[]>(buildFX(dying.pos, dying.effect));
  const meshRefs  = useRef<(THREE.Mesh | null)[]>([]);
  const alive     = useRef(true);
  const setDyingEnemies = useGameStore((s) => s.setDyingEnemies);

  useFrame((_, delta) => {
    let anyAlive = false;
    for (let i = 0; i < particles.current.length; i++) {
      const p    = particles.current[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      if (p.life <= 0) { mesh.visible = false; continue; }
      anyAlive = true;
      p.life -= delta;
      p.vel.y -= 5 * delta;
      p.pos.addScaledVector(p.vel, delta);
      mesh.position.copy(p.pos);
      const alpha = Math.max(0, p.life / p.maxLife);
      mesh.scale.setScalar(alpha * p.size * 12);
      (mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
    }
    if (!anyAlive && alive.current) {
      alive.current = false;
      const cur = useGameStore.getState().dyingEnemies;
      setDyingEnemies(cur.filter((d) => d.id !== dying.id));
    }
  });

  const geo = useMemo(() => new THREE.SphereGeometry(0.08, 5, 5), []);

  return (
    <>
      {particles.current.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={p.pos.toArray()}
          geometry={geo}
        >
          <meshBasicMaterial color={p.color} transparent opacity={1} />
        </mesh>
      ))}
    </>
  );
}

export default function KillEffects() {
  const dyingEnemies = useGameStore((s) => s.dyingEnemies);
  if (!dyingEnemies.length) return null;
  return (
    <>
      {dyingEnemies.map((d) => (
        <EffectInstance key={d.id} dying={d} />
      ))}
    </>
  );
}
