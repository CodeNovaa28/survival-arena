import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy, EnemyType } from "./store";
import { obstacles } from "./Arena";

const ENEMY_CONFIGS: Record<EnemyType, { color: string; size: [number, number, number]; headColor: string }> = {
  chaser: { color: "#ef4444", size: [0.6, 1.0, 0.6], headColor: "#fca5a5" },
  tank: { color: "#7c3aed", size: [1.0, 1.4, 1.0], headColor: "#a78bfa" },
  ranged: { color: "#f97316", size: [0.5, 0.9, 0.5], headColor: "#fdba74" },
};

const _sep = new THREE.Vector3();
const _toPlayer = new THREE.Vector3();

function EnemyMesh({ enemy }: { enemy: Enemy }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const config = ENEMY_CONFIGS[enemy.type];

  return (
    <group ref={meshRef} position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={config.size} />
        <meshLambertMaterial color={config.color} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, config.size[1] / 2 + 0.15, 0]}>
        <boxGeometry args={[config.size[0] * 0.7, config.size[0] * 0.7, config.size[0] * 0.7]} />
        <meshLambertMaterial color={config.headColor} />
      </mesh>
      {/* Health bar background */}
      <mesh position={[0, config.size[1] / 2 + 0.65, 0]}>
        <boxGeometry args={[0.8, 0.08, 0.02]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      {/* Health bar fill */}
      <mesh
        position={[
          -0.4 * (1 - enemy.hp / enemy.maxHp),
          config.size[1] / 2 + 0.65,
          0.01,
        ]}
      >
        <boxGeometry args={[0.8 * (enemy.hp / enemy.maxHp), 0.08, 0.02]} />
        <meshBasicMaterial
          color={
            enemy.hp / enemy.maxHp > 0.5
              ? "#22c55e"
              : enemy.hp / enemy.maxHp > 0.25
              ? "#f97316"
              : "#ef4444"
          }
        />
      </mesh>
    </group>
  );
}

export default function Enemies() {
  const enemies = useGameStore((s) => s.enemies);
  if (!Array.isArray(enemies)) return null;
  return (
    <>
      {enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
    </>
  );
}
