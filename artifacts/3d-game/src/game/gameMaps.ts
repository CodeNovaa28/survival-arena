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

export interface MapZones {
  ne: string; // x > 0, z < 0
  se: string; // x > 0, z > 0
  sw: string; // x < 0, z > 0
  nw: string; // x < 0, z < 0
  center: string;
}

export interface MapDef {
  id: string;
  name: string;
  description: string;
  unlockType: MapUnlockType;
  coinCost?: number;
  gemCost?: number;
  killRequirement?: { type: EnemyType; count: number };
  theme: MapTheme;
  obstacles: ObstacleDef[];
  badge: string;
  zones: MapZones;
}

// ── URBAN ─────────────────────────────────────────────────────────────────────
const URBAN_OBSTACLES: ObstacleDef[] = [
  // Center zone (existing)
  { id: 0,  x:  8,  z:  6,   w: 3,   h: 2.5, d: 1.5 },
  { id: 1,  x: -7,  z:  8,   w: 1.5, h: 3.5, d: 3   },
  { id: 2,  x:  5,  z: -9,   w: 2,   h: 2,   d: 2   },
  { id: 3,  x: -10, z: -5,   w: 4,   h: 2,   d: 1.5 },
  { id: 4,  x:  12, z:  0,   w: 1.5, h: 4,   d: 1.5 },
  { id: 5,  x: -12, z:  3,   w: 2,   h: 3,   d: 2   },
  { id: 6,  x:  0,  z:  12,  w: 3,   h: 2,   d: 1.5 },
  { id: 7,  x:  0,  z: -12,  w: 1.5, h: 3,   d: 3   },
  { id: 8,  x:  9,  z: -3,   w: 2,   h: 2.5, d: 2   },
  { id: 9,  x: -9,  z: -9,   w: 3,   h: 2,   d: 1.5 },
  { id: 10, x:  3,  z:  10,  w: 1.5, h: 3,   d: 1.5 },
  { id: 11, x: -4,  z: -13,  w: 2,   h: 2,   d: 2   },
  { id: 12, x:  17, z:  6,   w: 2,   h: 3,   d: 4   },
  { id: 13, x: -17, z: -6,   w: 2,   h: 3,   d: 4   },
  { id: 14, x:  15, z: -12,  w: 3,   h: 2,   d: 2   },
  { id: 15, x: -15, z:  12,  w: 3,   h: 2,   d: 2   },
  { id: 16, x:  6,  z:  17,  w: 4,   h: 2.5, d: 1.5 },
  { id: 17, x: -6,  z: -17,  w: 4,   h: 2.5, d: 1.5 },
  { id: 18, x:  20, z:  0,   w: 1.5, h: 5,   d: 1.5 },
  { id: 19, x: -20, z:  0,   w: 1.5, h: 5,   d: 1.5 },
  { id: 20, x:  0,  z:  20,  w: 5,   h: 2,   d: 1.5 },
  { id: 21, x:  0,  z: -20,  w: 5,   h: 2,   d: 1.5 },
  { id: 22, x:  12, z:  16,  w: 2,   h: 3.5, d: 2   },
  { id: 23, x: -12, z: -16,  w: 2,   h: 3.5, d: 2   },
  { id: 24, x:  18, z: -14,  w: 1.5, h: 4,   d: 3   },
  { id: 25, x: -18, z:  14,  w: 1.5, h: 4,   d: 3   },
  // NE Industrial District
  { id: 26, x:  28, z: -28,  w: 7,   h: 3.5, d: 5   },
  { id: 27, x:  36, z: -30,  w: 5,   h: 2.5, d: 8   },
  { id: 28, x:  25, z: -40,  w: 3,   h: 5,   d: 3   },
  { id: 29, x:  40, z: -25,  w: 6,   h: 2,   d: 4   },
  { id: 30, x:  33, z: -38,  w: 8,   h: 3,   d: 2   },
  { id: 31, x:  23, z: -35,  w: 2,   h: 6,   d: 3   },
  { id: 32, x:  38, z: -36,  w: 4,   h: 3,   d: 4   },
  { id: 33, x:  30, z: -22,  w: 3,   h: 4,   d: 3   },
  // SE Residential District
  { id: 34, x:  28, z:  28,  w: 5,   h: 3,   d: 5   },
  { id: 35, x:  36, z:  30,  w: 3,   h: 2.5, d: 6   },
  { id: 36, x:  25, z:  40,  w: 6,   h: 2,   d: 3   },
  { id: 37, x:  40, z:  28,  w: 4,   h: 3.5, d: 6   },
  { id: 38, x:  30, z:  22,  w: 4,   h: 2,   d: 2   },
  { id: 39, x:  23, z:  32,  w: 2,   h: 5,   d: 5   },
  { id: 40, x:  38, z:  38,  w: 3,   h: 2.5, d: 3   },
  { id: 41, x:  34, z:  24,  w: 3,   h: 4,   d: 2   },
  // SW Market District
  { id: 42, x: -28, z:  28,  w: 6,   h: 2.5, d: 5   },
  { id: 43, x: -36, z:  35,  w: 5,   h: 3,   d: 5   },
  { id: 44, x: -25, z:  40,  w: 3,   h: 5,   d: 4   },
  { id: 45, x: -40, z:  28,  w: 7,   h: 2,   d: 4   },
  { id: 46, x: -30, z:  22,  w: 3,   h: 3,   d: 6   },
  { id: 47, x: -23, z:  34,  w: 5,   h: 2.5, d: 3   },
  { id: 48, x: -38, z:  40,  w: 4,   h: 3.5, d: 4   },
  { id: 49, x: -33, z:  25,  w: 2,   h: 4,   d: 3   },
  // NW Military Zone
  { id: 50, x: -28, z: -28,  w: 7,   h: 3,   d: 7   },
  { id: 51, x: -36, z: -35,  w: 5,   h: 4,   d: 5   },
  { id: 52, x: -25, z: -40,  w: 3,   h: 6,   d: 3   },
  { id: 53, x: -40, z: -25,  w: 8,   h: 2,   d: 4   },
  { id: 54, x: -30, z: -22,  w: 3,   h: 3.5, d: 7   },
  { id: 55, x: -23, z: -33,  w: 6,   h: 2.5, d: 3   },
  { id: 56, x: -38, z: -38,  w: 4,   h: 4,   d: 4   },
  { id: 57, x: -33, z: -26,  w: 2,   h: 5,   d: 3   },
  // Corridor cover
  { id: 58, x:  8,  z: -30,  w: 2,   h: 3,   d: 4   },
  { id: 59, x: -8,  z: -30,  w: 2,   h: 3,   d: 4   },
  { id: 60, x:  8,  z:  30,  w: 3,   h: 2.5, d: 2   },
  { id: 61, x: -8,  z:  30,  w: 3,   h: 2.5, d: 2   },
  { id: 62, x:  30, z:  8,   w: 4,   h: 3,   d: 2   },
  { id: 63, x:  30, z: -8,   w: 4,   h: 3,   d: 2   },
  { id: 64, x: -30, z:  8,   w: 4,   h: 3,   d: 2   },
  { id: 65, x: -30, z: -8,   w: 4,   h: 3,   d: 2   },
];

// ── ICE ───────────────────────────────────────────────────────────────────────
const ICE_OBSTACLES: ObstacleDef[] = [
  // Center zone
  { id: 0,  x:  0,  z:  0,   w: 3,   h: 3,   d: 3   },
  { id: 1,  x:  10, z:  10,  w: 2,   h: 4,   d: 2   },
  { id: 2,  x: -10, z:  10,  w: 2,   h: 4,   d: 2   },
  { id: 3,  x:  10, z: -10,  w: 2,   h: 4,   d: 2   },
  { id: 4,  x: -10, z: -10,  w: 2,   h: 4,   d: 2   },
  { id: 5,  x:  6,  z:  0,   w: 1.5, h: 5,   d: 1.5 },
  { id: 6,  x: -6,  z:  0,   w: 1.5, h: 5,   d: 1.5 },
  { id: 7,  x:  0,  z:  6,   w: 1.5, h: 5,   d: 1.5 },
  { id: 8,  x:  0,  z: -6,   w: 1.5, h: 5,   d: 1.5 },
  { id: 9,  x:  13, z:  0,   w: 2,   h: 2,   d: 5   },
  { id: 10, x: -13, z:  0,   w: 2,   h: 2,   d: 5   },
  { id: 11, x:  17, z:  17,  w: 2.5, h: 5,   d: 2.5 },
  { id: 12, x: -17, z:  17,  w: 2.5, h: 5,   d: 2.5 },
  { id: 13, x:  17, z: -17,  w: 2.5, h: 5,   d: 2.5 },
  { id: 14, x: -17, z: -17,  w: 2.5, h: 5,   d: 2.5 },
  { id: 15, x:  20, z:  8,   w: 1.5, h: 3,   d: 6   },
  { id: 16, x: -20, z: -8,   w: 1.5, h: 3,   d: 6   },
  { id: 17, x:  8,  z:  20,  w: 6,   h: 3,   d: 1.5 },
  { id: 18, x: -8,  z: -20,  w: 6,   h: 3,   d: 1.5 },
  { id: 19, x:  14, z:  14,  w: 1.5, h: 6,   d: 1.5 },
  { id: 20, x: -14, z: -14,  w: 1.5, h: 6,   d: 1.5 },
  { id: 21, x:  0,  z:  18,  w: 3,   h: 3,   d: 1.5 },
  { id: 22, x:  0,  z: -18,  w: 3,   h: 3,   d: 1.5 },
  // NE Glacier
  { id: 23, x:  28, z: -28,  w: 3,   h: 7,   d: 3   },
  { id: 24, x:  35, z: -35,  w: 2,   h: 9,   d: 2   },
  { id: 25, x:  26, z: -38,  w: 2.5, h: 6,   d: 2.5 },
  { id: 26, x:  40, z: -26,  w: 4,   h: 4,   d: 4   },
  { id: 27, x:  32, z: -22,  w: 5,   h: 3,   d: 2   },
  { id: 28, x:  38, z: -32,  w: 2,   h: 8,   d: 2   },
  { id: 29, x:  22, z: -30,  w: 3,   h: 5,   d: 5   },
  { id: 30, x:  40, z: -40,  w: 3,   h: 6,   d: 3   },
  // SE Frozen Bay
  { id: 31, x:  26, z:  26,  w: 8,   h: 1.5, d: 8   },
  { id: 32, x:  36, z:  34,  w: 5,   h: 2,   d: 7   },
  { id: 33, x:  25, z:  40,  w: 6,   h: 1.5, d: 4   },
  { id: 34, x:  40, z:  26,  w: 4,   h: 2,   d: 6   },
  { id: 35, x:  30, z:  22,  w: 6,   h: 1.5, d: 3   },
  { id: 36, x:  22, z:  32,  w: 3,   h: 2,   d: 7   },
  { id: 37, x:  38, z:  40,  w: 4,   h: 1.5, d: 4   },
  // SW Ice Caverns
  { id: 38, x: -30, z:  28,  w: 2,   h: 8,   d: 2   },
  { id: 39, x: -38, z:  35,  w: 2,   h: 10,  d: 2   },
  { id: 40, x: -26, z:  40,  w: 3,   h: 6,   d: 3   },
  { id: 41, x: -40, z:  28,  w: 4,   h: 5,   d: 4   },
  { id: 42, x: -32, z:  22,  w: 5,   h: 4,   d: 2   },
  { id: 43, x: -22, z:  36,  w: 2,   h: 7,   d: 4   },
  { id: 44, x: -40, z:  40,  w: 3,   h: 8,   d: 3   },
  // NW Tundra
  { id: 45, x: -28, z: -28,  w: 5,   h: 2,   d: 5   },
  { id: 46, x: -36, z: -36,  w: 7,   h: 2,   d: 7   },
  { id: 47, x: -26, z: -40,  w: 5,   h: 2,   d: 3   },
  { id: 48, x: -40, z: -26,  w: 3,   h: 2,   d: 5   },
  { id: 49, x: -32, z: -22,  w: 6,   h: 2,   d: 3   },
  { id: 50, x: -22, z: -32,  w: 3,   h: 2,   d: 6   },
  { id: 51, x: -40, z: -40,  w: 5,   h: 2,   d: 5   },
  // Corridors
  { id: 52, x:  8,  z: -30,  w: 2,   h: 4,   d: 3   },
  { id: 53, x: -8,  z: -30,  w: 2,   h: 4,   d: 3   },
  { id: 54, x:  8,  z:  30,  w: 2,   h: 4,   d: 3   },
  { id: 55, x: -8,  z:  30,  w: 2,   h: 4,   d: 3   },
  { id: 56, x:  30, z:  8,   w: 3,   h: 4,   d: 2   },
  { id: 57, x:  30, z: -8,   w: 3,   h: 4,   d: 2   },
  { id: 58, x: -30, z:  8,   w: 3,   h: 4,   d: 2   },
  { id: 59, x: -30, z: -8,   w: 3,   h: 4,   d: 2   },
];

// ── DESERT ────────────────────────────────────────────────────────────────────
const DESERT_OBSTACLES: ObstacleDef[] = [
  // Center zone
  { id: 0,  x:  7,  z:  7,   w: 4,   h: 1.5, d: 4   },
  { id: 1,  x: -7,  z:  7,   w: 4,   h: 1.5, d: 4   },
  { id: 2,  x:  7,  z: -7,   w: 4,   h: 1.5, d: 4   },
  { id: 3,  x: -7,  z: -7,   w: 4,   h: 1.5, d: 4   },
  { id: 4,  x:  14, z:  5,   w: 1.5, h: 6,   d: 1.5 },
  { id: 5,  x: -14, z: -5,   w: 1.5, h: 6,   d: 1.5 },
  { id: 6,  x:  3,  z: -13,  w: 5,   h: 2,   d: 2   },
  { id: 7,  x: -3,  z:  13,  w: 5,   h: 2,   d: 2   },
  { id: 8,  x:  11, z: -11,  w: 2,   h: 3,   d: 2   },
  { id: 9,  x: -11, z:  11,  w: 2,   h: 3,   d: 2   },
  { id: 10, x:  18, z:  12,  w: 5,   h: 1.5, d: 5   },
  { id: 11, x: -18, z: -12,  w: 5,   h: 1.5, d: 5   },
  { id: 12, x:  18, z: -12,  w: 5,   h: 1.5, d: 5   },
  { id: 13, x: -18, z:  12,  w: 5,   h: 1.5, d: 5   },
  { id: 14, x:  0,  z:  19,  w: 6,   h: 2.5, d: 2   },
  { id: 15, x:  0,  z: -19,  w: 6,   h: 2.5, d: 2   },
  { id: 16, x:  19, z:  0,   w: 2,   h: 4,   d: 6   },
  { id: 17, x: -19, z:  0,   w: 2,   h: 4,   d: 6   },
  { id: 18, x:  14, z: -18,  w: 2,   h: 3,   d: 3   },
  { id: 19, x: -14, z:  18,  w: 2,   h: 3,   d: 3   },
  { id: 20, x:  20, z:  20,  w: 3,   h: 2,   d: 3   },
  { id: 21, x: -20, z: -20,  w: 3,   h: 2,   d: 3   },
  // NE Ancient Temple
  { id: 22, x:  28, z: -28,  w: 6,   h: 4,   d: 6   },
  { id: 23, x:  36, z: -36,  w: 4,   h: 6,   d: 4   },
  { id: 24, x:  26, z: -40,  w: 3,   h: 5,   d: 3   },
  { id: 25, x:  40, z: -26,  w: 3,   h: 5,   d: 3   },
  { id: 26, x:  32, z: -22,  w: 8,   h: 1.5, d: 3   },
  { id: 27, x:  22, z: -32,  w: 3,   h: 1.5, d: 8   },
  { id: 28, x:  38, z: -32,  w: 2,   h: 7,   d: 2   },
  { id: 29, x:  32, z: -38,  w: 2,   h: 7,   d: 2   },
  // SE Oasis Ruins
  { id: 30, x:  26, z:  26,  w: 5,   h: 1.5, d: 5   },
  { id: 31, x:  36, z:  34,  w: 3,   h: 2.5, d: 5   },
  { id: 32, x:  25, z:  40,  w: 7,   h: 1.5, d: 3   },
  { id: 33, x:  40, z:  26,  w: 3,   h: 2.5, d: 7   },
  { id: 34, x:  30, z:  22,  w: 5,   h: 1.5, d: 2   },
  { id: 35, x:  22, z:  32,  w: 2,   h: 2.5, d: 5   },
  { id: 36, x:  38, z:  38,  w: 4,   h: 1.5, d: 4   },
  // SW Sandstorm Valley
  { id: 37, x: -28, z:  28,  w: 4,   h: 3,   d: 8   },
  { id: 38, x: -36, z:  34,  w: 8,   h: 2,   d: 4   },
  { id: 39, x: -26, z:  40,  w: 4,   h: 3.5, d: 4   },
  { id: 40, x: -40, z:  28,  w: 8,   h: 1.5, d: 4   },
  { id: 41, x: -32, z:  22,  w: 4,   h: 3,   d: 8   },
  { id: 42, x: -22, z:  36,  w: 8,   h: 2,   d: 4   },
  // NW Buried City
  { id: 43, x: -28, z: -28,  w: 5,   h: 3,   d: 5   },
  { id: 44, x: -36, z: -36,  w: 3,   h: 5,   d: 3   },
  { id: 45, x: -26, z: -40,  w: 6,   h: 2.5, d: 3   },
  { id: 46, x: -40, z: -26,  w: 3,   h: 2.5, d: 6   },
  { id: 47, x: -32, z: -22,  w: 6,   h: 1.5, d: 3   },
  { id: 48, x: -22, z: -32,  w: 3,   h: 1.5, d: 6   },
  { id: 49, x: -38, z: -38,  w: 4,   h: 3,   d: 4   },
  // Corridors
  { id: 50, x:  8,  z: -30,  w: 3,   h: 2,   d: 3   },
  { id: 51, x: -8,  z: -30,  w: 3,   h: 2,   d: 3   },
  { id: 52, x:  8,  z:  30,  w: 3,   h: 2,   d: 3   },
  { id: 53, x: -8,  z:  30,  w: 3,   h: 2,   d: 3   },
  { id: 54, x:  30, z:  8,   w: 3,   h: 2,   d: 3   },
  { id: 55, x:  30, z: -8,   w: 3,   h: 2,   d: 3   },
  { id: 56, x: -30, z:  8,   w: 3,   h: 2,   d: 3   },
  { id: 57, x: -30, z: -8,   w: 3,   h: 2,   d: 3   },
];

// ── VOLCANO ───────────────────────────────────────────────────────────────────
const VOLCANO_OBSTACLES: ObstacleDef[] = [
  // Center
  { id: 0,  x:  0,  z:  0,   w: 5,   h: 2,   d: 5   },
  { id: 1,  x:  9,  z:  9,   w: 3,   h: 5,   d: 3   },
  { id: 2,  x: -9,  z:  9,   w: 3,   h: 5,   d: 3   },
  { id: 3,  x:  9,  z: -9,   w: 3,   h: 5,   d: 3   },
  { id: 4,  x: -9,  z: -9,   w: 3,   h: 5,   d: 3   },
  { id: 5,  x:  13, z:  0,   w: 2,   h: 3,   d: 6   },
  { id: 6,  x: -13, z:  0,   w: 2,   h: 3,   d: 6   },
  { id: 7,  x:  0,  z:  13,  w: 6,   h: 3,   d: 2   },
  { id: 8,  x:  0,  z: -13,  w: 6,   h: 3,   d: 2   },
  { id: 9,  x:  5,  z:  5,   w: 1.5, h: 8,   d: 1.5 },
  { id: 10, x: -5,  z: -5,   w: 1.5, h: 8,   d: 1.5 },
  { id: 11, x:  5,  z: -5,   w: 1.5, h: 8,   d: 1.5 },
  { id: 12, x: -5,  z:  5,   w: 1.5, h: 8,   d: 1.5 },
  { id: 13, x:  17, z:  17,  w: 3,   h: 6,   d: 3   },
  { id: 14, x: -17, z:  17,  w: 3,   h: 6,   d: 3   },
  { id: 15, x:  17, z: -17,  w: 3,   h: 6,   d: 3   },
  { id: 16, x: -17, z: -17,  w: 3,   h: 6,   d: 3   },
  { id: 17, x:  20, z:  5,   w: 2,   h: 4,   d: 2   },
  { id: 18, x: -20, z: -5,   w: 2,   h: 4,   d: 2   },
  { id: 19, x:  5,  z:  20,  w: 2,   h: 4,   d: 2   },
  { id: 20, x: -5,  z: -20,  w: 2,   h: 4,   d: 2   },
  { id: 21, x:  0,  z:  0,   w: 7,   h: 1.5, d: 7   },
  { id: 22, x:  14, z: -14,  w: 2,   h: 5,   d: 2   },
  { id: 23, x: -14, z:  14,  w: 2,   h: 5,   d: 2   },
  // NE Lava Fields
  { id: 24, x:  28, z: -28,  w: 4,   h: 6,   d: 4   },
  { id: 25, x:  36, z: -32,  w: 3,   h: 8,   d: 3   },
  { id: 26, x:  26, z: -40,  w: 2,   h: 10,  d: 2   },
  { id: 27, x:  40, z: -26,  w: 2,   h: 10,  d: 2   },
  { id: 28, x:  32, z: -22,  w: 5,   h: 4,   d: 2   },
  { id: 29, x:  38, z: -38,  w: 3,   h: 7,   d: 3   },
  { id: 30, x:  22, z: -36,  w: 3,   h: 5,   d: 5   },
  // SE Magma Lake
  { id: 31, x:  28, z:  28,  w: 6,   h: 1.5, d: 6   },
  { id: 32, x:  36, z:  34,  w: 8,   h: 1.2, d: 4   },
  { id: 33, x:  26, z:  40,  w: 4,   h: 1.5, d: 8   },
  { id: 34, x:  40, z:  28,  w: 4,   h: 1.5, d: 6   },
  { id: 35, x:  30, z:  22,  w: 7,   h: 1.5, d: 2   },
  { id: 36, x:  22, z:  34,  w: 2,   h: 1.5, d: 7   },
  { id: 37, x:  38, z:  40,  w: 5,   h: 1.5, d: 3   },
  // SW Ash Plains
  { id: 38, x: -28, z:  28,  w: 4,   h: 2.5, d: 8   },
  { id: 39, x: -36, z:  34,  w: 8,   h: 2,   d: 4   },
  { id: 40, x: -26, z:  40,  w: 4,   h: 3,   d: 4   },
  { id: 41, x: -40, z:  26,  w: 4,   h: 3,   d: 8   },
  { id: 42, x: -32, z:  22,  w: 8,   h: 2,   d: 3   },
  { id: 43, x: -22, z:  36,  w: 3,   h: 2.5, d: 8   },
  // NW Crater Rim
  { id: 44, x: -28, z: -28,  w: 5,   h: 7,   d: 5   },
  { id: 45, x: -36, z: -36,  w: 4,   h: 9,   d: 4   },
  { id: 46, x: -26, z: -40,  w: 3,   h: 8,   d: 3   },
  { id: 47, x: -40, z: -26,  w: 3,   h: 8,   d: 3   },
  { id: 48, x: -32, z: -22,  w: 6,   h: 5,   d: 2   },
  { id: 49, x: -22, z: -32,  w: 2,   h: 5,   d: 6   },
  { id: 50, x: -38, z: -38,  w: 4,   h: 8,   d: 4   },
  // Corridors
  { id: 51, x:  8,  z: -30,  w: 2,   h: 5,   d: 2   },
  { id: 52, x: -8,  z: -30,  w: 2,   h: 5,   d: 2   },
  { id: 53, x:  8,  z:  30,  w: 2,   h: 5,   d: 2   },
  { id: 54, x: -8,  z:  30,  w: 2,   h: 5,   d: 2   },
  { id: 55, x:  30, z:  8,   w: 2,   h: 5,   d: 2   },
  { id: 56, x:  30, z: -8,   w: 2,   h: 5,   d: 2   },
  { id: 57, x: -30, z:  8,   w: 2,   h: 5,   d: 2   },
  { id: 58, x: -30, z: -8,   w: 2,   h: 5,   d: 2   },
];

// ── SHADOW ────────────────────────────────────────────────────────────────────
const SHADOW_OBSTACLES: ObstacleDef[] = [
  // Center
  { id: 0,  x: -12, z: -12,  w: 2,   h: 6,   d: 2   },
  { id: 1,  x:  12, z: -12,  w: 2,   h: 6,   d: 2   },
  { id: 2,  x: -12, z:  12,  w: 2,   h: 6,   d: 2   },
  { id: 3,  x:  12, z:  12,  w: 2,   h: 6,   d: 2   },
  { id: 4,  x:  0,  z:  0,   w: 2,   h: 8,   d: 2   },
  { id: 5,  x:  8,  z:  0,   w: 6,   h: 1.5, d: 1.5 },
  { id: 6,  x: -8,  z:  0,   w: 6,   h: 1.5, d: 1.5 },
  { id: 7,  x:  0,  z:  8,   w: 1.5, h: 1.5, d: 6   },
  { id: 8,  x:  0,  z: -8,   w: 1.5, h: 1.5, d: 6   },
  { id: 9,  x:  14, z:  7,   w: 1.5, h: 4,   d: 3   },
  { id: 10, x: -14, z: -7,   w: 1.5, h: 4,   d: 3   },
  { id: 11, x:  7,  z:  14,  w: 3,   h: 4,   d: 1.5 },
  { id: 12, x: -7,  z: -14,  w: 3,   h: 4,   d: 1.5 },
  { id: 13, x:  19, z:  0,   w: 1.5, h: 9,   d: 1.5 },
  { id: 14, x: -19, z:  0,   w: 1.5, h: 9,   d: 1.5 },
  { id: 15, x:  0,  z:  19,  w: 1.5, h: 9,   d: 1.5 },
  { id: 16, x:  0,  z: -19,  w: 1.5, h: 9,   d: 1.5 },
  { id: 17, x:  16, z:  16,  w: 2,   h: 7,   d: 2   },
  { id: 18, x: -16, z: -16,  w: 2,   h: 7,   d: 2   },
  { id: 19, x:  16, z: -16,  w: 2,   h: 7,   d: 2   },
  { id: 20, x: -16, z:  16,  w: 2,   h: 7,   d: 2   },
  { id: 21, x:  10, z: -18,  w: 4,   h: 2,   d: 1.5 },
  { id: 22, x: -10, z:  18,  w: 4,   h: 2,   d: 1.5 },
  { id: 23, x:  18, z:  10,  w: 1.5, h: 2,   d: 4   },
  { id: 24, x: -18, z: -10,  w: 1.5, h: 2,   d: 4   },
  // NE Void Spires
  { id: 25, x:  28, z: -28,  w: 2,   h: 12,  d: 2   },
  { id: 26, x:  36, z: -36,  w: 1.5, h: 15,  d: 1.5 },
  { id: 27, x:  26, z: -40,  w: 2,   h: 10,  d: 2   },
  { id: 28, x:  40, z: -26,  w: 2,   h: 10,  d: 2   },
  { id: 29, x:  32, z: -22,  w: 2,   h: 9,   d: 2   },
  { id: 30, x:  22, z: -34,  w: 2,   h: 11,  d: 2   },
  { id: 31, x:  38, z: -32,  w: 1.5, h: 13,  d: 1.5 },
  { id: 32, x:  32, z: -38,  w: 1.5, h: 13,  d: 1.5 },
  // SE Dark Chasm
  { id: 33, x:  28, z:  28,  w: 4,   h: 5,   d: 4   },
  { id: 34, x:  36, z:  34,  w: 3,   h: 7,   d: 3   },
  { id: 35, x:  26, z:  40,  w: 2,   h: 9,   d: 2   },
  { id: 36, x:  40, z:  26,  w: 2,   h: 9,   d: 2   },
  { id: 37, x:  32, z:  22,  w: 3,   h: 6,   d: 3   },
  { id: 38, x:  22, z:  34,  w: 3,   h: 6,   d: 3   },
  { id: 39, x:  38, z:  38,  w: 2,   h: 8,   d: 2   },
  // SW Shadow Rift
  { id: 40, x: -28, z:  28,  w: 3,   h: 8,   d: 6   },
  { id: 41, x: -36, z:  34,  w: 6,   h: 5,   d: 3   },
  { id: 42, x: -26, z:  40,  w: 2,   h: 10,  d: 2   },
  { id: 43, x: -40, z:  26,  w: 2,   h: 10,  d: 2   },
  { id: 44, x: -32, z:  22,  w: 3,   h: 7,   d: 6   },
  { id: 45, x: -22, z:  36,  w: 6,   h: 5,   d: 3   },
  { id: 46, x: -38, z:  38,  w: 2,   h: 9,   d: 2   },
  // NW Abyssal Gate
  { id: 47, x: -28, z: -28,  w: 6,   h: 8,   d: 6   },
  { id: 48, x: -36, z: -36,  w: 4,   h: 12,  d: 4   },
  { id: 49, x: -26, z: -40,  w: 2,   h: 14,  d: 2   },
  { id: 50, x: -40, z: -26,  w: 2,   h: 14,  d: 2   },
  { id: 51, x: -32, z: -22,  w: 3,   h: 9,   d: 6   },
  { id: 52, x: -22, z: -32,  w: 6,   h: 7,   d: 3   },
  { id: 53, x: -38, z: -38,  w: 4,   h: 11,  d: 4   },
  // Corridors
  { id: 54, x:  8,  z: -30,  w: 1.5, h: 8,   d: 1.5 },
  { id: 55, x: -8,  z: -30,  w: 1.5, h: 8,   d: 1.5 },
  { id: 56, x:  8,  z:  30,  w: 1.5, h: 8,   d: 1.5 },
  { id: 57, x: -8,  z:  30,  w: 1.5, h: 8,   d: 1.5 },
  { id: 58, x:  30, z:  8,   w: 1.5, h: 8,   d: 1.5 },
  { id: 59, x:  30, z: -8,   w: 1.5, h: 8,   d: 1.5 },
  { id: 60, x: -30, z:  8,   w: 1.5, h: 8,   d: 1.5 },
  { id: 61, x: -30, z: -8,   w: 1.5, h: 8,   d: 1.5 },
];

// ── NEON ──────────────────────────────────────────────────────────────────────
const NEON_OBSTACLES: ObstacleDef[] = [
  // Center
  { id: 0,  x:  0,  z:  0,   w: 4,   h: 4,   d: 4   },
  { id: 1,  x:  8,  z:  0,   w: 1.5, h: 6,   d: 5   },
  { id: 2,  x: -8,  z:  0,   w: 1.5, h: 6,   d: 5   },
  { id: 3,  x:  0,  z:  8,   w: 5,   h: 6,   d: 1.5 },
  { id: 4,  x:  0,  z: -8,   w: 5,   h: 6,   d: 1.5 },
  { id: 5,  x:  12, z:  12,  w: 2,   h: 5,   d: 2   },
  { id: 6,  x: -12, z:  12,  w: 2,   h: 5,   d: 2   },
  { id: 7,  x:  12, z: -12,  w: 2,   h: 5,   d: 2   },
  { id: 8,  x: -12, z: -12,  w: 2,   h: 5,   d: 2   },
  { id: 9,  x:  6,  z:  6,   w: 3,   h: 2,   d: 3   },
  { id: 10, x: -6,  z: -6,   w: 3,   h: 2,   d: 3   },
  { id: 11, x:  6,  z: -6,   w: 3,   h: 2,   d: 3   },
  { id: 12, x: -6,  z:  6,   w: 3,   h: 2,   d: 3   },
  { id: 13, x:  18, z:  0,   w: 1.5, h: 7,   d: 4   },
  { id: 14, x: -18, z:  0,   w: 1.5, h: 7,   d: 4   },
  { id: 15, x:  0,  z:  18,  w: 4,   h: 7,   d: 1.5 },
  { id: 16, x:  0,  z: -18,  w: 4,   h: 7,   d: 1.5 },
  { id: 17, x:  16, z:  8,   w: 2,   h: 4,   d: 2   },
  { id: 18, x: -16, z: -8,   w: 2,   h: 4,   d: 2   },
  { id: 19, x:  8,  z:  16,  w: 2,   h: 4,   d: 2   },
  { id: 20, x: -8,  z: -16,  w: 2,   h: 4,   d: 2   },
  { id: 21, x:  20, z:  14,  w: 1.5, h: 5,   d: 1.5 },
  { id: 22, x: -20, z: -14,  w: 1.5, h: 5,   d: 1.5 },
  // NE Cyber District
  { id: 23, x:  28, z: -28,  w: 3,   h: 10,  d: 3   },
  { id: 24, x:  36, z: -36,  w: 2,   h: 14,  d: 2   },
  { id: 25, x:  26, z: -40,  w: 4,   h: 8,   d: 4   },
  { id: 26, x:  40, z: -26,  w: 4,   h: 8,   d: 4   },
  { id: 27, x:  32, z: -22,  w: 2,   h: 12,  d: 5   },
  { id: 28, x:  22, z: -32,  w: 5,   h: 9,   d: 2   },
  { id: 29, x:  38, z: -32,  w: 2,   h: 11,  d: 2   },
  { id: 30, x:  32, z: -38,  w: 2,   h: 11,  d: 2   },
  // SE Neon Alley
  { id: 31, x:  28, z:  28,  w: 2,   h: 9,   d: 5   },
  { id: 32, x:  36, z:  34,  w: 5,   h: 7,   d: 2   },
  { id: 33, x:  26, z:  40,  w: 2,   h: 11,  d: 3   },
  { id: 34, x:  40, z:  26,  w: 3,   h: 11,  d: 2   },
  { id: 35, x:  30, z:  22,  w: 5,   h: 8,   d: 2   },
  { id: 36, x:  22, z:  34,  w: 2,   h: 8,   d: 5   },
  { id: 37, x:  38, z:  38,  w: 2,   h: 10,  d: 2   },
  // SW Data Center
  { id: 38, x: -28, z:  28,  w: 8,   h: 4,   d: 5   },
  { id: 39, x: -36, z:  34,  w: 5,   h: 4,   d: 8   },
  { id: 40, x: -26, z:  40,  w: 8,   h: 3,   d: 4   },
  { id: 41, x: -40, z:  26,  w: 4,   h: 3,   d: 8   },
  { id: 42, x: -32, z:  22,  w: 8,   h: 4,   d: 3   },
  { id: 43, x: -22, z:  34,  w: 3,   h: 4,   d: 8   },
  { id: 44, x: -38, z:  38,  w: 5,   h: 3,   d: 5   },
  // NW Grid Core
  { id: 45, x: -28, z: -28,  w: 5,   h: 6,   d: 5   },
  { id: 46, x: -36, z: -36,  w: 3,   h: 10,  d: 3   },
  { id: 47, x: -26, z: -40,  w: 4,   h: 8,   d: 4   },
  { id: 48, x: -40, z: -26,  w: 4,   h: 8,   d: 4   },
  { id: 49, x: -32, z: -22,  w: 5,   h: 7,   d: 3   },
  { id: 50, x: -22, z: -32,  w: 3,   h: 7,   d: 5   },
  { id: 51, x: -38, z: -38,  w: 3,   h: 9,   d: 3   },
  // Corridors
  { id: 52, x:  8,  z: -30,  w: 1.5, h: 7,   d: 1.5 },
  { id: 53, x: -8,  z: -30,  w: 1.5, h: 7,   d: 1.5 },
  { id: 54, x:  8,  z:  30,  w: 1.5, h: 7,   d: 1.5 },
  { id: 55, x: -8,  z:  30,  w: 1.5, h: 7,   d: 1.5 },
  { id: 56, x:  30, z:  8,   w: 1.5, h: 7,   d: 1.5 },
  { id: 57, x:  30, z: -8,   w: 1.5, h: 7,   d: 1.5 },
  { id: 58, x: -30, z:  8,   w: 1.5, h: 7,   d: 1.5 },
  { id: 59, x: -30, z: -8,   w: 1.5, h: 7,   d: 1.5 },
];

export const MAPS: MapDef[] = [
  {
    id: "urban",
    name: "Urban Arena",
    description: "A ruined city district. Scattered cover, open sightlines.",
    unlockType: "free",
    badge: "🏙️",
    zones: { ne: "Industrial District", se: "Residential Block", sw: "Market Square", nw: "Military Base", center: "Urban Core" },
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
    zones: { ne: "Glacier Peaks", se: "Frozen Bay", sw: "Ice Caverns", nw: "Tundra Wastes", center: "Ice Citadel" },
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
    zones: { ne: "Ancient Temple", se: "Oasis Ruins", sw: "Sandstorm Valley", nw: "Buried City", center: "Desert Nexus" },
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
    zones: { ne: "Lava Fields", se: "Magma Lake", sw: "Ash Plains", nw: "Crater Rim", center: "Volcanic Core" },
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
    zones: { ne: "Void Spires", se: "Dark Chasm", sw: "Shadow Rift", nw: "Abyssal Gate", center: "Darkness Core" },
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
  {
    id: "neon",
    name: "Neon City",
    description: "A blazing cyberpunk grid. Tall towers, tight alleys, and danger everywhere.",
    unlockType: "coins",
    coinCost: 500,
    gemCost: 8,
    badge: "🌆",
    zones: { ne: "Cyber District", se: "Neon Alley", sw: "Data Center", nw: "Grid Core", center: "Neon Plaza" },
    theme: {
      groundColor:      "#050510",
      obstacleColor:    "#0f0a2e",
      obstacleAccent:   "#a855f7",
      wallColor:        "#030308",
      cornerColor:      "#6d28d9",
      fogColor:         "#020208",
      ambientColor:     "#c4b5fd",
      ambientIntensity: 0.4,
      dirLightColor:    "#e9d5ff",
      pointLightColor:  "#a855f7",
    },
    obstacles: NEON_OBSTACLES,
  },
];

export function getMap(id: string): MapDef {
  return MAPS.find((m) => m.id === id) ?? MAPS[0];
}
