import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";

const DRONE_RADIUS = 2.2;
const DRONE_SPEED  = 3.0; // rad/s

function DroneVisual({ angle, playerPos }: { angle: number; playerPos: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const x = playerPos.x + Math.cos(angle + t * DRONE_SPEED) * DRONE_RADIUS;
    const z = playerPos.z + Math.sin(angle + t * DRONE_SPEED) * DRONE_RADIUS;
    const y = 1.4 + Math.sin(t * 2.5 + angle) * 0.2;
    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.y = angle + t * DRONE_SPEED * 2;
  });

  return (
    <group ref={groupRef}>
      {/* Core */}
      <mesh>
        <boxGeometry args={[0.28, 0.12, 0.28]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Arms */}
      <mesh position={[0.24, 0, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.05]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      <mesh position={[-0.24, 0, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.05]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      <mesh position={[0, 0, 0.24]}>
        <boxGeometry args={[0.05, 0.05, 0.18]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      <mesh position={[0, 0, -0.24]}>
        <boxGeometry args={[0.05, 0.05, 0.18]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      {/* Glow */}
      <pointLight color="#a855f7" intensity={1.2} distance={3} />
    </group>
  );
}

export default function Companions() {
  const activePowerUps = useGameStore((s) => s.activePowerUps);
  const playerPos      = useGameStore((s) => s.playerPosition);

  const droneCount = activePowerUps.filter((p) => p.type === "drone").length > 0 ? 2 : 0;

  if (droneCount === 0) return null;

  return (
    <>
      <DroneVisual angle={0}           playerPos={playerPos} />
      <DroneVisual angle={Math.PI}     playerPos={playerPos} />
    </>
  );
}
