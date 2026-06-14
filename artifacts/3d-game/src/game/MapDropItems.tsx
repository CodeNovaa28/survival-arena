import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";
export default function MapDropItems() {
  const mapDrops = useGameStore((s) => s.mapDrops);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      child.position.y = 0.8 + Math.sin(t * 2 + i) * 0.18;
      child.rotation.y = t * 1.2 + i;
    });
  });

  if (mapDrops.length === 0) return null;

  return (
    <group ref={groupRef}>
      {mapDrops.map((drop) => (
        <group key={drop.id} position={[drop.position.x, 0.8, drop.position.z]}>
          {drop.type === "heart" ? <HeartDrop /> : <WeaponDrop weaponId={drop.weaponId ?? "pistol"} />}
        </group>
      ))}
    </group>
  );
}

function HeartDrop() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.35, 12, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
      </mesh>
      <pointLight color="#ef4444" intensity={2} distance={3} />
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 20]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} transparent opacity={0.35} />
      </mesh>
    </>
  );
}

function WeaponDrop({ weaponId }: { weaponId: string }) {
  return (
    <>
      <mesh>
        <boxGeometry args={[0.65, 0.22, 0.22]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>
      <pointLight color="#f59e0b" intensity={2.5} distance={3.5} />
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 20]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} transparent opacity={0.35} />
      </mesh>
    </>
  );
}

