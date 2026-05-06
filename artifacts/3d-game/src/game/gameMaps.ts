import { EnemyType } from "./store";

export interface ObstacleDef {
  id: number;
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
}

export type MapUnlockType = "free" | "coins" | "kills";

export interface MapTheme {
  groundColor: string;
  obstacleColor: string;
  obstacleAccent: string;
  wallColor: string;
  cornerColor: string;
  fogColor: string;
  ambientColor: string;
  ambientIntensity: number;
  dirLightColor: string;
  pointLightColor: string;
}

export interface MapDef {
  id: string;
  name: string;
  description: string;
  unlockType: MapUnlockType;
  coinCost?: number;
  killRequirement?: { type: EnemyType; count: number };
  theme: MapTheme;
  obstacles: ObstacleDef[];
  badge: string;
}

const URBAN_OBSTACLES: ObstacleDef[] = [
  { id: 0,  x:  8, z:  6,  w: 3,   h: 2.5, d: 1.5 },
  { id: 1,  x: -7, z:  8,  w: 1.5, h: 3.5, d: 3   },
  { id: 2,  x:  5, z: -9,  w: 2,   h: 2,   d: 2   },
  { id: 3,  x: -10,z: -5,  w: 4,   h: 2,   d: 1.5 },
  { id: 4,  x:  12,z:  0,  w: 1.5, h: 4,   d: 1.5 },
  { id: 5,  x: -12,z:  3,  w: 2,   h: 3,   d: 2   },
  { id: 6,  x:  0, z:  12, w: 3,   h: 2,   d: 1.5 },
  { id: 7,  x:  0, z: -12, w: 1.5, h: 3,   d: 3   },
  { id: 8,  x:  9, z: -3,  w: 2,   h: 2.5, d: 2   },
  { id: 9,  x: -9, z: -9,  w: 3,   h: 2,   d: 1.5 },
  { id: 10, x:  3, z:  10, w: 1.5, h: 3,   d: 1.5 },
  { id: 11, x: -4, z: -13, w: 2,   h: 2,   d: 2   },
];

const ICE_OBSTACLES: ObstacleDef[] = [
  { id: 0,  x:  0, z:  0,  w: 3,   h: 3,   d: 3   },
  { id: 1,  x:  10,z:  10, w: 2,   h: 4,   d: 2   },
  { id: 2,  x: -10,z:  10, w: 2,   h: 4,   d: 2   },
  { id: 3,  x:  10,z: -10, w: 2,   h: 4,   d: 2   },
  { id: 4,  x: -10,z: -10, w: 2,   h: 4,   d: 2   },
  { id: 5,  x:  6, z:  0,  w: 1.5, h: 5,   d: 1.5 },
  { id: 6,  x: -6, z:  0,  w: 1.5, h: 5,   d: 1.5 },
  { id: 7,  x:  0, z:  6,  w: 1.5, h: 5,   d: 1.5 },
  { id: 8,  x:  0, z: -6,  w: 1.5, h: 5,   d: 1.5 },
  { id: 9,  x:  13,z:  0,  w: 2,   h: 2,   d: 5   },
  { id: 10, x: -13,z:  0,  w: 2,   h: 2,   d: 5   },
];

const DESERT_OBSTACLES: ObstacleDef[] = [
  { id: 0,  x:  7, z:  7,  w: 4,   h: 1.5, d: 4   },
  { id: 1,  x: -7, z:  7,  w: 4,   h: 1.5, d: 4   },
  { id: 2,  x:  7, z: -7,  w: 4,   h: 1.5, d: 4   },
  { id: 3,  x: -7, z: -7,  w: 4,   h: 1.5, d: 4   },
  { id: 4,  x:  14,z:  5,  w: 1.5, h: 6,   d: 1.5 },
  { id: 5,  x: -14,z: -5,  w: 1.5, h: 6,   d: 1.5 },
  { id: 6,  x:  3, z: -13, w: 5,   h: 2,   d: 2   },
  { id: 7,  x: -3, z:  13, w: 5,   h: 2,   d: 2   },
  { id: 8,  x:  11,z: -11, w: 2,   h: 3,   d: 2   },
  { id: 9,  x: -11,z:  11, w: 2,   h: 3,   d: 2   },
];

const VOLCANO_OBSTACLES: ObstacleDef[] = [
  { id: 0,  x:  0, z:  0,  w: 5,   h: 2,   d: 5   },
  { id: 1,  x:  9, z:  9,  w: 3,   h: 5,   d: 3   },
  { id: 2,  x: -9, z:  9,  w: 3,   h: 5,   d: 3   },
  { id: 3,  x:  9, z: -9,  w: 3,   h: 5,   d: 3   },
  { id: 4,  x: -9, z: -9,  w: 3,   h: 5,   d: 3   },
  { id: 5,  x:  13,z:  0,  w: 2,   h: 3,   d: 6   },
  { id: 6,  x: -13,z:  0,  w: 2,   h: 3,   d: 6   },
  { id: 7,  x:  0, z:  13, w: 6,   h: 3,   d: 2   },
  { id: 8,  x:  0, z: -13, w: 6,   h: 3,   d: 2   },
  { id: 9,  x:  5, z:  5,  w: 1.5, h: 8,   d: 1.5 },
  { id: 10, x: -5, z: -5,  w: 1.5, h: 8,   d: 1.5 },
  { id: 11, x:  5, z: -5,  w: 1.5, h: 8,   d: 1.5 },
  { id: 12, x: -5, z:  5,  w: 1.5, h: 8,   d: 1.5 },
];

const SHADOW_OBSTACLES: ObstacleDef[] = [
  { id: 0,  x: -12,z: -12, w: 2,   h: 6,   d: 2   },
  { id: 1,  x:  12,z: -12, w: 2,   h: 6,   d: 2   },
  { id: 2,  x: -12,z:  12, w: 2,   h: 6,   d: 2   },
  { id: 3,  x:  12,z:  12, w: 2,   h: 6,   d: 2   },
  { id: 4,  x:  0, z:  0,  w: 2,   h: 8,   d: 2   },
  { id: 5,  x:  8, z:  0,  w: 6,   h: 1.5, d: 1.5 },
  { id: 6,  x: -8, z:  0,  w: 6,   h: 1.5, d: 1.5 },
  { id: 7,  x:  0, z:  8,  w: 1.5, h: 1.5, d: 6   },
  { id: 8,  x:  0, z: -8,  w: 1.5, h: 1.5, d: 6   },
  { id: 9,  x:  14,z:  7,  w: 1.5, h: 4,   d: 3   },
  { id: 10, x: -14,z: -7,  w: 1.5, h: 4,   d: 3   },
  { id: 11, x:  7, z:  14, w: 3,   h: 4,   d: 1.5 },
  { id: 12, x: -7, z: -14, w: 3,   h: 4,   d: 1.5 },
];

export const MAPS: MapDef[] = [
  {
    id: "urban",
    name: "Urban Arena",
    description: "A ruined city district. Scattered cover, open sightlines.",
    unlockType: "free",
    badge: "🏙️",
    theme: {
      groundColor:      "#111820",
      obstacleColor:    "#2a3a4a",
      obstacleAccent:   "#3a5a7a",
      wallColor:        "#0d1520",
      cornerColor:      "#8b1a1a",
      fogColor:         "#050a10",
      ambientColor:     "#b0c8e8",
      ambientIntensity: 0.35,
      dirLightColor:    "#fff5e8",
      pointLightColor:  "#4466aa",
    },
    obstacles: URBAN_OBSTACLES,
  },
  {
    id: "ice",
    name: "Ice Fortress",
    description: "Frozen military outpost. Symmetrical pillars, treacherous terrain.",
    unlockType: "coins",
    coinCost: 200,
    badge: "❄️",
    theme: {
      groundColor:      "#0c1a2e",
      obstacleColor:    "#1e3a5f",
      obstacleAccent:   "#60a5fa",
      wallColor:        "#0a1525",
      cornerColor:      "#1e4d8c",
      fogColor:         "#050d1a",
      ambientColor:     "#b0d4ff",
      ambientIntensity: 0.5,
      dirLightColor:    "#e0f0ff",
      pointLightColor:  "#3b82f6",
    },
    obstacles: ICE_OBSTACLES,
  },
  {
    id: "desert",
    name: "Desert Ruins",
    description: "Ancient ruins baking under a scorching sun.",
    unlockType: "coins",
    coinCost: 300,
    badge: "🏜️",
    theme: {
      groundColor:      "#2a1a0a",
      obstacleColor:    "#7c4a1e",
      obstacleAccent:   "#f97316",
      wallColor:        "#1a0e05",
      cornerColor:      "#c2410c",
      fogColor:         "#150a02",
      ambientColor:     "#fde68a",
      ambientIntensity: 0.55,
      dirLightColor:    "#fef3c7",
      pointLightColor:  "#f59e0b",
    },
    obstacles: DESERT_OBSTACLES,
  },
  {
    id: "volcano",
    name: "Volcano Crater",
    description: "Active volcanic battlefield. Extreme heat, extreme danger.",
    unlockType: "kills",
    killRequirement: { type: "bomber", count: 40 },
    badge: "🌋",
    theme: {
      groundColor:      "#1a0a00",
      obstacleColor:    "#7c2d12",
      obstacleAccent:   "#ef4444",
      wallColor:        "#0f0600",
      cornerColor:      "#991b1b",
      fogColor:         "#100300",
      ambientColor:     "#fca5a5",
      ambientIntensity: 0.4,
      dirLightColor:    "#fed7aa",
      pointLightColor:  "#f97316",
    },
    obstacles: VOLCANO_OBSTACLES,
  },
  {
    id: "shadow",
    name: "Shadow Realm",
    description: "A dimension of darkness. Few lights, many horrors.",
    unlockType: "kills",
    killRequirement: { type: "tank", count: 75 },
    badge: "🌑",
    theme: {
      groundColor:      "#05020a",
      obstacleColor:    "#1e0a3a",
      obstacleAccent:   "#7c3aed",
      wallColor:        "#030007",
      cornerColor:      "#4c1d95",
      fogColor:         "#020006",
      ambientColor:     "#c4b5fd",
      ambientIntensity: 0.2,
      dirLightColor:    "#e9d5ff",
      pointLightColor:  "#7c3aed",
    },
    obstacles: SHADOW_OBSTACLES,
  },
];

export function getMap(id: string): MapDef {
  return MAPS.find((m) => m.id === id) ?? MAPS[0];
}
