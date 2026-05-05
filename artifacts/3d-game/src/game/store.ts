import { create } from "zustand";
import * as THREE from "three";

export type EnemyType = "chaser" | "tank" | "ranged";

export interface Enemy {
  id: string;
  position: THREE.Vector3;
  hp: number;
  maxHp: number;
  type: EnemyType;
  speed: number;
  damage: number;
  lastShot: number;
  lastDamageTime: number;
  alertRadius: number;
}

export interface Bullet {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  fromPlayer: boolean;
  damage: number;
  lifetime: number;
}

export type GamePhase = "playing" | "gameover";

interface GameState {
  phase: GamePhase;
  playerHp: number;
  maxPlayerHp: number;
  score: number;
  wave: number;
  enemies: Enemy[];
  bullets: Bullet[];
  playerPosition: THREE.Vector3;

  setPhase: (phase: GamePhase) => void;
  setPlayerHp: (hp: number) => void;
  setScore: (score: number) => void;
  setWave: (wave: number) => void;
  setEnemies: (enemies: Enemy[]) => void;
  setBullets: (bullets: Bullet[]) => void;
  setPlayerPosition: (pos: THREE.Vector3) => void;
  restart: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "playing",
  playerHp: 100,
  maxPlayerHp: 100,
  score: 0,
  wave: 1,
  enemies: [],
  bullets: [],
  playerPosition: new THREE.Vector3(0, 0, 0),

  setPhase: (phase) => set({ phase }),
  setPlayerHp: (playerHp) => set({ playerHp }),
  setScore: (score) => set({ score }),
  setWave: (wave) => set({ wave }),
  setEnemies: (enemies) => set({ enemies }),
  setBullets: (bullets) => set({ bullets }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  restart: () =>
    set({
      phase: "playing",
      playerHp: 100,
      score: 0,
      wave: 1,
      enemies: [],
      bullets: [],
      playerPosition: new THREE.Vector3(0, 0, 0),
    }),
}));
