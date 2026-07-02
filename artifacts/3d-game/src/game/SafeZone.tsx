import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";

const SEGMENTS = 64;

export default function SafeZone() {
  const ringRef   = useRef<THREE.Mesh>(null);
  const dangerRef = useRef<THREE.Mesh>(null);
  const glowRef   = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const r = useGameStore.getState().safeZoneRadius;
    const t = clock.getElapsedTime();
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);

    if (ringRef.current) {
      (ringRef.current.material as THREE.MeshBasicMaterial).color.setHSL(
        0.15, 1, 0.5 + pulse * 0.2
      );
      ringRef.current.scale.setScalar(r);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(r);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + pulse * 0.04;
    }
    if (dangerRef.current) {
      (dangerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + pulse * 0.05;
    }
  });

  return (
    <group position={[0, 0.05, 0]}>
      {/* Danger zone overlay — large disc covering expanded arena */}
      <mesh ref={dangerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 50, SEGMENTS]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.1} side={THREE.FrontSide} />
      </mesh>

      {/* Safe zone fill (inner) */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, SEGMENTS]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.06} />
      </mesh>

      {/* Ring border */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.985, 1, SEGMENTS]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
