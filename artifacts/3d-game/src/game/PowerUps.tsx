import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, PowerUpItem, PowerUpType } from "./store";

const COLORS: Record<PowerUpType, string> = {
  speed:     "#06b6d4",
  rapidfire: "#fb923c",
  shield:    "#3b82f6",
  regeneration: "#22c55e",
  powershot: "#ef4444",
  magnet: "#ec4899",
  precision: "#818cf8",
  phase: "#c084fc",
  frost: "#67e8f9",
  nova: "#f97316",
  hunter: "#facc15",
  fortune: "#84cc16",
};

const LABELS: Record<PowerUpType, string> = {
  speed: "OVR",
  rapidfire: "FURY",
  shield: "SHD",
  regeneration: "REG",
  powershot: "DMG",
  magnet: "MAG",
  precision: "ACC",
  phase: "PHS",
  frost: "ICE",
  nova: "NOVA",
  hunter: "HNT",
  fortune: "LCK",
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

const AURA_COLORS: Partial<Record<PowerUpType, string>> = {
  speed: "#06b6d4",
  rapidfire: "#fb923c",
  regeneration: "#22c55e",
  powershot: "#ef4444",
  magnet: "#ec4899",
  precision: "#818cf8",
  phase: "#c084fc",
  frost: "#67e8f9",
  hunter: "#facc15",
  fortune: "#84cc16",
};

function ActivePowerUpAuras() {
  const activePowerUps = useGameStore((s) => s.activePowerUps);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const groupRef = useRef<THREE.Group>(null);
  const novaRef = useRef<THREE.Mesh>(null);
  const novaMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const timed = activePowerUps.filter((powerUp) => powerUp.maxTime < 9000);
  const visibleRings = timed
    .filter((powerUp) => AURA_COLORS[powerUp.type])
    .slice(0, 4);
  const hasMagnet = timed.some((powerUp) => powerUp.type === "magnet");
  const hasFrost = timed.some((powerUp) => powerUp.type === "frost");
  const hasPhase = timed.some((powerUp) => powerUp.type === "phase");
  const nova = timed.find((powerUp) => powerUp.type === "nova");

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.set(playerPosition.x, 0.035, playerPosition.z);
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.35;
    }
    if (nova && novaRef.current && novaMaterialRef.current) {
      const progress = Math.max(0, Math.min(1, 1 - nova.timeLeft / nova.maxTime));
      novaRef.current.scale.setScalar(Math.max(0.04, progress));
      novaMaterialRef.current.opacity = 0.8 * (1 - progress);
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {visibleRings.map((powerUp, index) => (
          <mesh key={powerUp.type} position={[0, index * 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.72 + index * 0.16, 0.76 + index * 0.16, 32]} />
            <meshBasicMaterial color={AURA_COLORS[powerUp.type]} transparent opacity={0.72} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {hasMagnet && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[7.6, 7.8, 64]} />
            <meshBasicMaterial color="#ec4899" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        )}
        {hasFrost && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[6.8, 7.05, 64]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.24} side={THREE.DoubleSide} />
          </mesh>
        )}
        {hasPhase && (
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[1.35, 16, 12]} />
            <meshBasicMaterial color="#c084fc" transparent opacity={0.1} wireframe side={THREE.DoubleSide} />
          </mesh>
        )}
        {nova && (
          <mesh ref={novaRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[7.7, 8, 64]} />
            <meshBasicMaterial ref={novaMaterialRef} color="#f97316" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </>
  );
}

export default function PowerUps() {
  const items = useGameStore((s) => s.powerUpItems);
  return (
    <>
      <ActivePowerUpAuras />
      {(Array.isArray(items) ? items : []).map((item) => (
        <PowerUpMesh key={item.id} item={item} />
      ))}
    </>
  );
}
