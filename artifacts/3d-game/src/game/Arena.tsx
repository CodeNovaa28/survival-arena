export const ARENA_SIZE = 50;
export const ARENA_HALF = ARENA_SIZE / 2 - 1;

// Deterministic obstacles (no Math.random in render)
export const obstacles = [
  { id: 0,  x:  8,  z:  6,  w: 3,   h: 2.5, d: 1.5 },
  { id: 1,  x: -7,  z:  8,  w: 1.5, h: 3.5, d: 3   },
  { id: 2,  x:  5,  z: -9,  w: 2,   h: 2,   d: 2   },
  { id: 3,  x: -10, z: -5,  w: 4,   h: 2,   d: 1.5 },
  { id: 4,  x:  12, z:  0,  w: 1.5, h: 4,   d: 1.5 },
  { id: 5,  x: -12, z:  3,  w: 2,   h: 3,   d: 2   },
  { id: 6,  x:  0,  z:  12, w: 3,   h: 2,   d: 1.5 },
  { id: 7,  x:  0,  z: -12, w: 1.5, h: 3,   d: 3   },
  { id: 8,  x:  9,  z: -3,  w: 2,   h: 2.5, d: 2   },
  { id: 9,  x: -9,  z: -9,  w: 3,   h: 2,   d: 1.5 },
  { id: 10, x:  3,  z:  10, w: 1.5, h: 3,   d: 1.5 },
  { id: 11, x: -4,  z: -13, w: 2,   h: 2,   d: 2   },
];

export default function Arena() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[ARENA_SIZE, ARENA_SIZE]} />
        <meshLambertMaterial color="#111820" />
      </mesh>

      {/* Subtle grid */}
      <gridHelper
        args={[ARENA_SIZE, 25, "#1a2a3a", "#1a2a3a"]}
        position={[0, 0.01, 0]}
      />

      {/* Boundary walls */}
      {([
        [0, 1, -ARENA_SIZE / 2, ARENA_SIZE, 2, 0.4],
        [0, 1,  ARENA_SIZE / 2, ARENA_SIZE, 2, 0.4],
        [-ARENA_SIZE / 2, 1, 0, 0.4, 2, ARENA_SIZE],
        [ ARENA_SIZE / 2, 1, 0, 0.4, 2, ARENA_SIZE],
      ] as [number, number, number, number, number, number][]).map((args, i) => (
        <mesh key={i} position={[args[0], args[1], args[2]]} castShadow receiveShadow>
          <boxGeometry args={[args[3], args[4], args[5]]} />
          <meshLambertMaterial color="#0d1520" />
        </mesh>
      ))}

      {/* Obstacles */}
      {obstacles.map((obs) => (
        <group key={obs.id}>
          {/* Main block */}
          <mesh position={[obs.x, obs.h / 2, obs.z]} castShadow receiveShadow>
            <boxGeometry args={[obs.w, obs.h, obs.d]} />
            <meshLambertMaterial color="#2a3a4a" />
          </mesh>
          {/* Top accent */}
          <mesh position={[obs.x, obs.h + 0.05, obs.z]}>
            <boxGeometry args={[obs.w, 0.1, obs.d]} />
            <meshBasicMaterial color="#3a5a7a" />
          </mesh>
        </group>
      ))}

      {/* Corner pillars */}
      {([-1, 1] as const).flatMap((sx) =>
        ([-1, 1] as const).map((sz, j) => (
          <mesh
            key={`corner_${sx}_${sz}`}
            position={[sx * (ARENA_SIZE / 2 - 1), 1.5, sz * (ARENA_SIZE / 2 - 1)]}
            castShadow
          >
            <boxGeometry args={[1.5, 3, 1.5]} />
            <meshLambertMaterial color="#8b1a1a" />
          </mesh>
        ))
      )}
    </group>
  );
}
