import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy, EnemyType } from "./store";

interface EnemyConfig {
  bodyColor: string;
  headColor: string;
  accentColor: string;
  bodySize: [number, number, number];
  headScale: number;
}

const CONFIGS: Record<EnemyType, EnemyConfig> = {
  chaser:  { bodyColor: "#dc2626", headColor: "#f87171", accentColor: "#fee2e2", bodySize: [0.65, 1.0, 0.55], headScale: 0.65 },
  tank:    { bodyColor: "#6d28d9", headColor: "#a78bfa", accentColor: "#ede9fe", bodySize: [1.1,  1.5, 1.0],  headScale: 0.8  },
  ranged:  { bodyColor: "#ea580c", headColor: "#fb923c", accentColor: "#ffedd5", bodySize: [0.55, 0.9, 0.5],  headScale: 0.6  },
  speeder: { bodyColor: "#0891b2", headColor: "#22d3ee", accentColor: "#cffafe", bodySize: [0.45, 0.8, 0.45], headScale: 0.5  },
  bomber:  { bodyColor: "#65a30d", headColor: "#a3e635", accentColor: "#ecfccb", bodySize: [0.9,  1.1, 0.8],  headScale: 0.75 },
};

function HealthBar({ hp, maxHp, height }: { hp: number; maxHp: number; height: number }) {
  const pct = Math.max(0, hp / maxHp);
  const barColor = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#f97316" : "#ef4444";
  return (
    <group position={[0, height + 0.55, 0]}>
      {/* Background */}
      <mesh>
        <boxGeometry args={[0.85, 0.08, 0.02]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Fill — offset so it grows from left */}
      <mesh position={[-0.425 * (1 - pct), 0, 0.01]}>
        <boxGeometry args={[0.85 * pct, 0.07, 0.02]} />
        <meshBasicMaterial color={barColor} />
      </mesh>
    </group>
  );
}

function EnemyMesh({ enemy }: { enemy: Enemy }) {
  const groupRef = useRef<THREE.Group>(null);
  const cfg = CONFIGS[enemy.type];
  const [bw, bh, bd] = cfg.bodySize;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Slight bob animation
    const t = clock.getElapsedTime();
    groupRef.current.position.set(
      enemy.position.x,
      bh / 2 + Math.sin(t * 3 + enemy.zigzagPhase) * 0.05,
      enemy.position.z
    );
  });

  return (
    <group ref={groupRef} position={[enemy.position.x, bh / 2, enemy.position.z]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[bw, bh, bd]} />
        <meshStandardMaterial color={cfg.bodyColor} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, bh / 2 + (bw * cfg.headScale) / 2 + 0.05, 0]}>
        <boxGeometry args={[bw * cfg.headScale, bw * cfg.headScale, bw * cfg.headScale]} />
        <meshStandardMaterial color={cfg.headColor} metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Eyes (accent dots) */}
      <mesh position={[bw * 0.18, bh / 2 + (bw * cfg.headScale) * 0.08, -(bw * cfg.headScale) / 2 - 0.01]}>
        <boxGeometry args={[0.07, 0.07, 0.02]} />
        <meshBasicMaterial color={cfg.accentColor} />
      </mesh>
      <mesh position={[-bw * 0.18, bh / 2 + (bw * cfg.headScale) * 0.08, -(bw * cfg.headScale) / 2 - 0.01]}>
        <boxGeometry args={[0.07, 0.07, 0.02]} />
        <meshBasicMaterial color={cfg.accentColor} />
      </mesh>
      {/* Bomber: belly glow */}
      {enemy.type === "bomber" && (
        <mesh position={[0, -bh * 0.2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.7} />
        </mesh>
      )}
      {/* Ranged: antenna */}
      {enemy.type === "ranged" && (
        <mesh position={[0, bh / 2 + bw * cfg.headScale + 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
          <meshBasicMaterial color={cfg.accentColor} />
        </mesh>
      )}
      {/* Health bar */}
      <HealthBar hp={enemy.hp} maxHp={enemy.maxHp} height={bh / 2} />
    </group>
  );
}

export default function Enemies() {
  const enemies = useGameStore((s) => s.enemies);
  if (!Array.isArray(enemies)) return null;
  return (
    <>
      {enemies.map((e) => (
        <EnemyMesh key={e.id} enemy={e} />
      ))}
    </>
  );
}
