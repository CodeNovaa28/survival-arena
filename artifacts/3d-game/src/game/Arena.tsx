import { useMemo } from "react";
import { getMap } from "./gameMaps";

export const ARENA_SIZE = 50;
export const ARENA_HALF = ARENA_SIZE / 2 - 1;

// Re-export obstacles so GameLogic / Player can import them
export function getObstacles(mapId: string) {
  return getMap(mapId).obstacles;
}

// Backward-compat default (urban obstacles used for collision when no mapId given)
export const obstacles = getMap("urban").obstacles;

export default function Arena({ mapId = "urban" }: { mapId?: string }) {
  const map  = useMemo(() => getMap(mapId), [mapId]);
  const t    = map.theme;
  const obs  = map.obstacles;
  const half = ARENA_SIZE / 2;

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ARENA_SIZE, ARENA_SIZE]} />
        <meshLambertMaterial color={t.groundColor} />
      </mesh>

      {/* Grid overlay */}
      <gridHelper args={[ARENA_SIZE, 25, "#1e2235", "#131726"]} position={[0, 0.01, 0]} />

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
          {/* Top accent strip */}
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
    </group>
  );
}
