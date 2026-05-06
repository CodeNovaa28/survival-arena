import { EnemyType } from "./store";

export interface LevelDef {
  id: number;
  name: string;
  description: string;
  waves: number;
  baseEnemyCount: number;
  enemyCountPerWave: number;
  speedMult: number;
  hpMult: number;
  safeZoneShrinkMult: number;
  allowedTypes: EnemyType[];
  mapId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  reward: number;
  milestoneLabel?: string; // shown on level card for special unlocks
}

export const LEVELS: LevelDef[] = [
  {
    id: 1, name: "First Contact",
    description: "Welcome to Zone Breach. Learn to fight or die.",
    waves: 3, baseEnemyCount: 4, enemyCountPerWave: 1,
    speedMult: 0.8, hpMult: 0.8, safeZoneShrinkMult: 0.6,
    allowedTypes: ["chaser"], mapId: "urban", difficulty: 1, reward: 30,
  },
  {
    id: 2, name: "Incoming Fire",
    description: "Ranged enemies have arrived. Keep moving.",
    waves: 4, baseEnemyCount: 5, enemyCountPerWave: 1,
    speedMult: 0.9, hpMult: 0.85, safeZoneShrinkMult: 0.7,
    allowedTypes: ["chaser","ranged"], mapId: "urban", difficulty: 1, reward: 40,
  },
  {
    id: 3, name: "Heavy Metal",
    description: "Tanks have joined the fight. Aim for weak spots.",
    waves: 4, baseEnemyCount: 5, enemyCountPerWave: 2,
    speedMult: 0.95, hpMult: 0.9, safeZoneShrinkMult: 0.8,
    allowedTypes: ["chaser","ranged","tank"], mapId: "urban", difficulty: 2, reward: 55,
  },
  {
    id: 4, name: "Speed Demons",
    description: "Speeder units deployed. Tracking them is the challenge.",
    waves: 5, baseEnemyCount: 6, enemyCountPerWave: 2,
    speedMult: 1.0, hpMult: 0.95, safeZoneShrinkMult: 0.9,
    allowedTypes: ["chaser","ranged","speeder"], mapId: "urban", difficulty: 2, reward: 65,
  },
  {
    id: 5, name: "Zone Collapse",
    description: "Safe zone shrinks fast. Fight in the ice fortress.",
    waves: 5, baseEnemyCount: 7, enemyCountPerWave: 2,
    speedMult: 1.1, hpMult: 1.0, safeZoneShrinkMult: 1.5,
    allowedTypes: ["chaser","ranged","tank","speeder"], mapId: "ice", difficulty: 2, reward: 80,
    milestoneLabel: "🛸 Unlocks Drone Strike",
  },
  {
    id: 6, name: "Full Breach",
    description: "All enemy types. No mercy in the desert ruins.",
    waves: 6, baseEnemyCount: 7, enemyCountPerWave: 2,
    speedMult: 1.15, hpMult: 1.1, safeZoneShrinkMult: 1.2,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "desert", difficulty: 3, reward: 100,
  },
  {
    id: 7, name: "Bomber's Wrath",
    description: "Heavy bomber deployment. Watch your flanks.",
    waves: 6, baseEnemyCount: 8, enemyCountPerWave: 3,
    speedMult: 1.2, hpMult: 1.2, safeZoneShrinkMult: 1.3,
    allowedTypes: ["bomber","tank","chaser","ranged"], mapId: "desert", difficulty: 3, reward: 120,
  },
  {
    id: 8, name: "Volcanic Assault",
    description: "Fight in the volcano crater. One mistake and you burn.",
    waves: 7, baseEnemyCount: 8, enemyCountPerWave: 3,
    speedMult: 1.25, hpMult: 1.3, safeZoneShrinkMult: 1.4,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "volcano", difficulty: 4, reward: 150,
    milestoneLabel: "👥 Unlocks Squad Backup",
  },
  {
    id: 9, name: "Shadow Protocol",
    description: "Darkness favors the enemy. Survive the shadow realm.",
    waves: 7, baseEnemyCount: 9, enemyCountPerWave: 3,
    speedMult: 1.3, hpMult: 1.4, safeZoneShrinkMult: 1.5,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "shadow", difficulty: 4, reward: 180,
  },
  {
    id: 10, name: "The Purge",
    description: "Maximum threat. All types, full speed, tight zone.",
    waves: 8, baseEnemyCount: 10, enemyCountPerWave: 4,
    speedMult: 1.4, hpMult: 1.5, safeZoneShrinkMult: 1.8,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "volcano", difficulty: 5, reward: 250,
  },
  {
    id: 11, name: "Nightmare Protocol",
    description: "Beyond survival. Only legends reach this far.",
    waves: 9, baseEnemyCount: 12, enemyCountPerWave: 4,
    speedMult: 1.6, hpMult: 1.7, safeZoneShrinkMult: 2.0,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "shadow", difficulty: 5, reward: 350,
  },
  {
    id: 12, name: "Zone Breach Ultimate",
    description: "The final trial. Win this and your name is legend.",
    waves: 10, baseEnemyCount: 14, enemyCountPerWave: 5,
    speedMult: 2.0, hpMult: 2.0, safeZoneShrinkMult: 2.5,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "shadow", difficulty: 5, reward: 600,
  },
  {
    id: 13, name: "Relentless",
    description: "Enemies move 30% faster. Keep your distance.",
    waves: 9, baseEnemyCount: 12, enemyCountPerWave: 4,
    speedMult: 2.2, hpMult: 1.8, safeZoneShrinkMult: 2.0,
    allowedTypes: ["speeder","chaser","ranged","bomber"], mapId: "volcano", difficulty: 5, reward: 400,
  },
  {
    id: 14, name: "The Swarm",
    description: "Dozens per wave. You will be surrounded.",
    waves: 10, baseEnemyCount: 16, enemyCountPerWave: 6,
    speedMult: 1.9, hpMult: 1.6, safeZoneShrinkMult: 1.5,
    allowedTypes: ["chaser","speeder","ranged"], mapId: "desert", difficulty: 5, reward: 450,
  },
  {
    id: 15, name: "Guardian Protocol",
    description: "Elite enemies. The gate to true mastery.",
    waves: 10, baseEnemyCount: 12, enemyCountPerWave: 5,
    speedMult: 2.0, hpMult: 2.2, safeZoneShrinkMult: 2.2,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "shadow", difficulty: 5, reward: 500,
    milestoneLabel: "⚔️ Unlocks Ghost Squad Skin",
  },
  {
    id: 16, name: "Titan's March",
    description: "Tank-heavy assault. You need firepower.",
    waves: 11, baseEnemyCount: 10, enemyCountPerWave: 4,
    speedMult: 2.0, hpMult: 2.5, safeZoneShrinkMult: 1.8,
    allowedTypes: ["tank","bomber","tank","chaser"], mapId: "volcano", difficulty: 5, reward: 550,
  },
  {
    id: 17, name: "Speeder Hell",
    description: "They're everywhere. Nowhere to hide.",
    waves: 11, baseEnemyCount: 15, enemyCountPerWave: 6,
    speedMult: 2.5, hpMult: 1.5, safeZoneShrinkMult: 2.5,
    allowedTypes: ["speeder","ranged","speeder","chaser"], mapId: "ice", difficulty: 5, reward: 600,
  },
  {
    id: 18, name: "Omega Protocol",
    description: "Everything at max. This is a war of attrition.",
    waves: 12, baseEnemyCount: 14, enemyCountPerWave: 6,
    speedMult: 2.4, hpMult: 2.6, safeZoneShrinkMult: 2.8,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "shadow", difficulty: 5, reward: 700,
  },
  {
    id: 19, name: "The Abyss",
    description: "Darkness. Speed. Pain. No end in sight.",
    waves: 14, baseEnemyCount: 15, enemyCountPerWave: 7,
    speedMult: 2.6, hpMult: 2.8, safeZoneShrinkMult: 3.0,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "shadow", difficulty: 5, reward: 800,
  },
  {
    id: 20, name: "ABSOLUTE ZERO",
    description: "The impossible. Zone shrinks in seconds. Survive if you can.",
    waves: 15, baseEnemyCount: 18, enemyCountPerWave: 8,
    speedMult: 3.0, hpMult: 3.0, safeZoneShrinkMult: 4.0,
    allowedTypes: ["chaser","ranged","tank","speeder","bomber"], mapId: "shadow", difficulty: 5, reward: 1200,
  },
];

export const DIFFICULTY_COLORS = ["","#22c55e","#84cc16","#f59e0b","#f97316","#ef4444"];
export const DIFFICULTY_LABELS = ["","Rookie","Easy","Normal","Hard","EXTREME"];

export function getLevel(id: number): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
