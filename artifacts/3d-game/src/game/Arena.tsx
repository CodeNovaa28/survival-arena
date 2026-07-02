import { useMemo } from "react";
import { getMap } from "./gameMaps";

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
    </group>
  );
}
