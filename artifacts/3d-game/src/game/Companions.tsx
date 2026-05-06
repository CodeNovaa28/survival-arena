import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";
import { CHARACTER_SKINS } from "./gameSkins";

// ─── Shared helpers ────────────────────────────────────────────────────────────
function FloatDrone({ offset, color, t: baseT }: { offset: THREE.Vector3; color: string; t: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = useGameStore.getState();
    const p = s.playerPosition;
    const elapsed = clock.getElapsedTime();
    ref.current.position.set(
      p.x + offset.x * Math.cos(elapsed * 1.5) - offset.z * Math.sin(elapsed * 1.5),
      1.4 + Math.sin(elapsed * 3 + baseT) * 0.2,
      p.z + offset.x * Math.sin(elapsed * 1.5) + offset.z * Math.cos(elapsed * 1.5),
    );
    ref.current.rotation.y = elapsed * 4 + baseT;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.28, 0.12, 0.28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.8} roughness={0.2} />
      </mesh>
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.24, 0, 0]}>
          <boxGeometry args={[0.18, 0.05, 0.05]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      {[1,-1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.24]}>
          <boxGeometry args={[0.05, 0.05, 0.18]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      <pointLight color={color} intensity={1.5} distance={3} />
    </group>
  );
}

function SquadFigure({ offsetX }: { offsetX: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = useGameStore.getState();
    const p = s.playerPosition;
    const elapsed = clock.getElapsedTime();
    const bob = Math.sin(elapsed * 4 + offsetX) * 0.05;
    ref.current.position.set(p.x + offsetX, bob, p.z - 1.2);
    // Face nearest enemy
    const enemies = s.enemies;
    if (enemies.length > 0) {
      const nearest = enemies.reduce((a, b) =>
        a.position.distanceTo(p) < b.position.distanceTo(p) ? a : b
      );
      const dx = nearest.position.x - (p.x + offsetX);
      const dz = nearest.position.z - (p.z - 1.2);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
  });
  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.38]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[0.36, 0.36, 0.36]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.47, -0.185]}>
        <boxGeometry args={[0.22, 0.09, 0.02]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>
      {/* Gun */}
      <mesh position={[0, 0.75, -0.55]}>
        <boxGeometry args={[0.08, 0.08, 0.35]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.14, 0.18, 0]}>
        <boxGeometry args={[0.18, 0.36, 0.26]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      <mesh position={[0.14, 0.18, 0]}>
        <boxGeometry args={[0.18, 0.36, 0.26]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      {/* Blue glow */}
      <pointLight color="#3b82f6" intensity={0.8} distance={2.5} />
    </group>
  );
}

function GuardianFigure({ offsetX }: { offsetX: number }) {
  const ref = useRef<THREE.Group>(null);
  const skinId = useGameStore.getState().selectedSkin;
  const skin   = CHARACTER_SKINS.find((s) => s.id === skinId) ?? CHARACTER_SKINS[0];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = useGameStore.getState();
    const p = s.playerPosition;
    const elapsed = clock.getElapsedTime();
    const bob = Math.sin(elapsed * 3 + offsetX) * 0.06;
    ref.current.position.set(p.x + offsetX, bob, p.z - 1.4);
    // Face nearest enemy
    const enemies = s.enemies;
    if (enemies.length > 0) {
      const nearest = enemies.reduce((a, b) =>
        a.position.distanceTo(p) < b.position.distanceTo(p) ? a : b
      );
      const dx = nearest.position.x - (p.x + offsetX);
      const dz = nearest.position.z - (p.z - 1.4);
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
  });

  return (
    <group ref={ref}>
      {/* Body (player's skin colors) */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.52, 0.92, 0.40]} />
        <meshStandardMaterial color={skin.bodyColor} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Chest stripe */}
      <mesh position={[0, 0.77, -0.21]}>
        <boxGeometry args={[0.28, 0.24, 0.02]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.46, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color={skin.headColor} />
      </mesh>
      {/* Gold visor */}
      <mesh position={[0, 1.48, -0.20]}>
        <boxGeometry args={[0.24, 0.10, 0.02]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      {/* Gun (same color as player's gun) */}
      <mesh position={[0, 0.75, -0.58]}>
        <boxGeometry args={[0.09, 0.09, 0.40]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, 0.18, 0]}>
        <boxGeometry args={[0.19, 0.37, 0.28]} />
        <meshStandardMaterial color={skin.legColor} />
      </mesh>
      <mesh position={[0.15, 0.18, 0]}>
        <boxGeometry args={[0.19, 0.37, 0.28]} />
        <meshStandardMaterial color={skin.legColor} />
      </mesh>
      {/* Gold aura glow */}
      <pointLight color="#f59e0b" intensity={1.2} distance={3.5} />
    </group>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function Companions() {
  const droneActive   = useGameStore((s) => s.droneActive);
  const squadActive   = useGameStore((s) => s.squadActive);
  const guardianActive= useGameStore((s) => s.guardianActive);

  return (
    <>
      {/* Drone Strike: 2 purple fast drones */}
      {droneActive && (
        <>
          <FloatDrone offset={new THREE.Vector3(-2.2, 0, 0)} color="#a855f7" t={0} />
          <FloatDrone offset={new THREE.Vector3( 2.2, 0, 0)} color="#a855f7" t={Math.PI} />
        </>
      )}

      {/* Squad Backup: 2 blue soldier figures */}
      {squadActive && (
        <>
          <SquadFigure offsetX={-2.6} />
          <SquadFigure offsetX={ 2.6} />
        </>
      )}

      {/* Guardian: 2 permanent golden companions */}
      {guardianActive && (
        <>
          <GuardianFigure offsetX={-2.4} />
          <GuardianFigure offsetX={ 2.4} />
        </>
      )}
    </>
  );
}
