import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMap } from "./gameMaps";
import { useGameStore } from "./store";

export const ARENA_SIZE = 90;
export const ARENA_HALF = ARENA_SIZE / 2 - 1;

export function getObstacles(mapId: string) {
  return getMap(mapId).obstacles;
}

export const obstacles = getMap("urban").obstacles;

export default function Arena({ mapId = "urban" }: { mapId?: string }) {
  const map  = useMemo(() => getMap(mapId), [mapId]);
  const t    = map.theme;
  const obs  = map.obstacles;
  const half = ARENA_SIZE / 2;

  const qc = ARENA_SIZE / 4;    // 22.5 — center of each quadrant
  const qs = ARENA_SIZE / 2 - 4; // 41  — size of each zone panel

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ARENA_SIZE, ARENA_SIZE]} />
        <meshLambertMaterial color={t.groundColor} />
      </mesh>

      {/* Zone floor panels — 4 quadrants with subtle tint */}
      {([
        [ qc, -qc, t.obstacleAccent],
        [ qc,  qc, t.cornerColor],
        [-qc,  qc, t.obstacleColor],
        [-qc, -qc, t.pointLightColor],
      ] as [number, number, string][]).map(([zx, zz, color], i) => (
        <mesh key={`zone_floor_${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[zx, 0.003, zz]}>
          <planeGeometry args={[qs, qs]} />
          <meshBasicMaterial color={color} transparent opacity={0.055} />
        </mesh>
      ))}

      {/* Zone divider lines — cross-hair pattern on the floor */}
      {/* Horizontal divider (E-W axis, z=0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[ARENA_SIZE - 2, 0.4]} />
        <meshBasicMaterial color={t.obstacleAccent} transparent opacity={0.18} />
      </mesh>
      {/* Vertical divider (N-S axis, x=0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[0.4, ARENA_SIZE - 2]} />
        <meshBasicMaterial color={t.obstacleAccent} transparent opacity={0.18} />
      </mesh>

      {/* Grid overlay */}
      <gridHelper args={[ARENA_SIZE, 45, "#1e2235", "#131726"]} position={[0, 0.01, 0]} />

      {/* Boundary walls */}
      {([
        [0, 1, -half, ARENA_SIZE, 2, 0.5],
        [0, 1,  half, ARENA_SIZE, 2, 0.5],
        [-half, 1, 0, 0.5, 2, ARENA_SIZE],
        [ half, 1, 0, 0.5, 2, ARENA_SIZE],
      ] as [number,number,number,number,number,number][]).map((a, i) => (
        <mesh key={i} position={[a[0], a[1], a[2]]} castShadow receiveShadow>
          <boxGeometry args={[a[3], a[4], a[5]]} />
          <meshLambertMaterial color={t.wallColor} />
        </mesh>
      ))}

      {/* Obstacles */}
      {obs.map((o) => (
        <group key={o.id}>
          <mesh position={[o.x, o.h / 2, o.z]} castShadow receiveShadow>
            <boxGeometry args={[o.w, o.h, o.d]} />
            <meshLambertMaterial color={t.obstacleColor} />
          </mesh>
          <mesh position={[o.x, o.h + 0.06, o.z]}>
            <boxGeometry args={[o.w, 0.08, o.d]} />
            <meshBasicMaterial color={t.obstacleAccent} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Corner pillars */}
      {([-1, 1] as const).flatMap((sx) =>
        ([-1, 1] as const).map((sz) => (
          <mesh
            key={`${sx}_${sz}`}
            position={[sx * (half - 1), 2, sz * (half - 1)]}
            castShadow
          >
            <boxGeometry args={[1.6, 4, 1.6]} />
            <meshLambertMaterial color={t.cornerColor} />
          </mesh>
        ))
      )}

      {/* Zone corner markers — accent beacons at zone boundaries */}
      {([-1, 1] as const).flatMap((sx) =>
        ([-1, 1] as const).map((sz) => (
          <group key={`zone_marker_${sx}_${sz}`}>
            <mesh position={[sx * qc * 0.98, 0.6, sz * qc * 0.98]}>
              <boxGeometry args={[0.5, 1.2, 0.5]} />
              <meshBasicMaterial color={t.obstacleAccent} transparent opacity={0.6} />
            </mesh>
            <mesh position={[sx * qc * 0.98, 1.4, sz * qc * 0.98]}>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshBasicMaterial color={t.pointLightColor} transparent opacity={0.9} />
            </mesh>
          </group>
        ))
      )}

      {/* Secret portal — always visible in corner, activates after wave 3 */}
      <SecretPortal />
    </group>
  );
}

export const SECRET_PORTAL_POS = new THREE.Vector3(33, 0, -33);

function SecretPortal() {
  const open    = useGameStore((s) => s.secretPortalOpen);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const frameRef= useRef<THREE.Group>(null);
  const t       = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (glowRef.current) {
      const pulse = Math.sin(t.current * (open ? 3.5 : 1.2)) * 0.5 + 0.5;
      glowRef.current.opacity = open ? 0.55 + pulse * 0.35 : 0.12 + pulse * 0.08;
      glowRef.current.color.setStyle(open ? "#a855f7" : "#334155");
    }
    if (frameRef.current) {
      frameRef.current.rotation.y = open ? t.current * 0.6 : 0;
    }
  });

  const px = SECRET_PORTAL_POS.x;
  const pz = SECRET_PORTAL_POS.z;

  return (
    <group position={[px, 0, pz]}>
      {/* Ground disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[2.4, 32]} />
        <meshBasicMaterial color={open ? "#7c3aed" : "#1e1b4b"} transparent opacity={open ? 0.35 : 0.12} />
      </mesh>

      {/* Portal arch — left pillar */}
      <mesh position={[-0.9, 1.8, 0]} castShadow>
        <boxGeometry args={[0.35, 3.6, 0.35]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Portal arch — right pillar */}
      <mesh position={[0.9, 1.8, 0]} castShadow>
        <boxGeometry args={[0.35, 3.6, 0.35]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Portal arch — top bar */}
      <mesh position={[0, 3.7, 0]} castShadow>
        <boxGeometry args={[2.15, 0.38, 0.38]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Portal inner glow (face -Z = toward arena center from corner) */}
      <mesh position={[0, 1.85, 0.01]}>
        <planeGeometry args={[1.5, 3.4]} />
        <meshBasicMaterial ref={glowRef} color="#334155" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Spinning inner ring (when open) */}
      <group ref={frameRef} position={[0, 1.85, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.65, 0.06, 8, 32]} />
          <meshBasicMaterial color={open ? "#c084fc" : "#334155"} transparent opacity={open ? 0.8 : 0.2} />
        </mesh>
      </group>

      {/* Label when open */}
      {open && (
        <mesh position={[0, 4.35, 0]}>
          <boxGeometry args={[2.0, 0.38, 0.06]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}
