import { useRef } from "react";
import * as THREE from "three";

const ARENA_SIZE = 50;
const NUM_OBSTACLES = 12;

const obstacles = Array.from({ length: NUM_OBSTACLES }, (_, i) => {
  const angle = (i / NUM_OBSTACLES) * Math.PI * 2;
  const radius = 10 + Math.sin(i * 7.3) * 8;
  return {
    id: i,
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    w: 1.5 + Math.abs(Math.sin(i * 3.1)) * 2,
    h: 1.5 + Math.abs(Math.cos(i * 2.7)) * 3,
    d: 1.5 + Math.abs(Math.sin(i * 4.9)) * 2,
  };
});

export { obstacles, ARENA_SIZE };

export default function Arena() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[ARENA_SIZE, ARENA_SIZE]} />
        <meshLambertMaterial color="#1a3a1a" />
      </mesh>

      {/* Grid lines for visual reference */}
      <gridHelper args={[ARENA_SIZE, 20, "#2a5a2a", "#2a5a2a"]} position={[0, 0.01, 0]} />

      {/* Boundary walls */}
      <BoundaryWall position={[0, 1, -ARENA_SIZE / 2]} size={[ARENA_SIZE, 2, 0.5]} />
      <BoundaryWall position={[0, 1, ARENA_SIZE / 2]} size={[ARENA_SIZE, 2, 0.5]} />
      <BoundaryWall position={[-ARENA_SIZE / 2, 1, 0]} size={[0.5, 2, ARENA_SIZE]} />
      <BoundaryWall position={[ARENA_SIZE / 2, 1, 0]} size={[0.5, 2, ARENA_SIZE]} />

      {/* Obstacles */}
      {obstacles.map((obs) => (
        <mesh key={obs.id} position={[obs.x, obs.h / 2, obs.z]} castShadow receiveShadow>
          <boxGeometry args={[obs.w, obs.h, obs.d]} />
          <meshLambertMaterial color="#4a3a2a" />
        </mesh>
      ))}

      {/* Corner markers */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (ARENA_SIZE / 2 - 1), 0.5, sz * (ARENA_SIZE / 2 - 1)]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshLambertMaterial color="#8b0000" />
        </mesh>
      ))}
    </group>
  );
}

function BoundaryWall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshLambertMaterial color="#2d1a0a" />
    </mesh>
  );
}
