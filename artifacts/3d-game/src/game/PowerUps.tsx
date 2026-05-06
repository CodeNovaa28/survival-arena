import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, PowerUpItem, PowerUpType } from "./store";

const COLORS: Record<PowerUpType, string> = {
  speed:     "#06b6d4",
  shield:    "#3b82f6",
  rapidfire: "#facc15",
  heal:      "#22c55e",
};

const LABELS: Record<PowerUpType, string> = {
  speed:     "SPD",
  shield:    "SHD",
  rapidfire: "RFR",
  heal:      "HLT",
};

function PowerUpMesh({ item }: { item: PowerUpItem }) {
  const groupRef = useRef<THREE.Group>(null);
  const color = COLORS[item.type];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = 0.8 + Math.sin(t * 2 + item.id.charCodeAt(4)) * 0.25;
    groupRef.current.rotation.y = t * 1.5;
  });

  return (
    <group ref={groupRef} position={[item.position.x, 0.8, item.position.z]}>
      {/* Outer ring glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.75, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Core cube */}
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      {/* Inner spinning diamond */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      {/* Point light */}
      <pointLight color={color} intensity={1.5} distance={4} />
    </group>
  );
}

export default function PowerUps() {
  const items = useGameStore((s) => s.powerUpItems);
  if (!Array.isArray(items)) return null;
  return (
    <>
      {items.map((item) => (
        <PowerUpMesh key={item.id} item={item} />
      ))}
    </>
  );
}
