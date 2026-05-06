import { create } from "zustand";
import * as THREE from "three";

export type GamePhase = "start" | "playing" | "gameover";
export type EnemyType = "chaser" | "tank" | "ranged" | "speeder" | "bomber";
export type PowerUpType = "speed" | "shield" | "rapidfire" | "heal";

export interface Enemy {
  id: string;
  position: THREE.Vector3;
  hp: number;
  maxHp: number;
  type: EnemyType;
  speed: number;
  baseDamage: number;
  lastShot: number;
  lastDamageTime: number;
  alertRadius: number;
  zigzagPhase: number;
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

export interface PowerUpItem {
  id: string;
  position: THREE.Vector3;
  type: PowerUpType;
  lifetime: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeLeft: number;
  maxTime: number;
}

function loadHighScore(): number {
  try {
    return Number(localStorage.getItem("survival_highscore") ?? 0);
  } catch {
    return 0;
  }
}

function saveHighScore(score: number) {
  try {
    localStorage.setItem("survival_highscore", String(score));
  } catch {}
}

const INITIAL_SAFE_ZONE = 23;

interface GameState {
  phase: GamePhase;
  gameKey: number;

  playerHp: number;
  maxPlayerHp: number;
  timeSurvived: number;
  highScore: number;

  wave: number;
  killCount: number;
  enemies: Enemy[];
  bullets: Bullet[];

  powerUpItems: PowerUpItem[];
  activePowerUps: ActivePowerUp[];

  safeZoneRadius: number;
  playerPosition: THREE.Vector3;
  playerVelocity: THREE.Vector3;

  setPhase: (phase: GamePhase) => void;
  setPlayerHp: (hp: number) => void;
  setTimeSurvived: (t: number) => void;
  setHighScore: (s: number) => void;
  setWave: (wave: number) => void;
  setKillCount: (n: number) => void;
  setEnemies: (enemies: Enemy[]) => void;
  setBullets: (bullets: Bullet[]) => void;
  setPowerUpItems: (items: PowerUpItem[]) => void;
  setActivePowerUps: (pups: ActivePowerUp[]) => void;
  setSafeZoneRadius: (r: number) => void;
  setPlayerPosition: (pos: THREE.Vector3) => void;
  setPlayerVelocity: (vel: THREE.Vector3) => void;
  finishGame: () => void;
  restart: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "start",
  gameKey: 0,

  playerHp: 100,
  maxPlayerHp: 100,
  timeSurvived: 0,
  highScore: loadHighScore(),

  wave: 1,
  killCount: 0,
  enemies: [],
  bullets: [],

  powerUpItems: [],
  activePowerUps: [],

  safeZoneRadius: INITIAL_SAFE_ZONE,
  playerPosition: new THREE.Vector3(0, 0, 0),
  playerVelocity: new THREE.Vector3(0, 0, 0),

  setPhase: (phase) => set({ phase }),
  setPlayerHp: (playerHp) => set({ playerHp }),
  setTimeSurvived: (timeSurvived) => set({ timeSurvived }),
  setHighScore: (highScore) => {
    saveHighScore(highScore);
    set({ highScore });
  },
  setWave: (wave) => set({ wave }),
  setKillCount: (killCount) => set({ killCount }),
  setEnemies: (enemies) => set({ enemies }),
  setBullets: (bullets) => set({ bullets }),
  setPowerUpItems: (powerUpItems) => set({ powerUpItems }),
  setActivePowerUps: (activePowerUps) => set({ activePowerUps }),
  setSafeZoneRadius: (safeZoneRadius) => set({ safeZoneRadius }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  setPlayerVelocity: (playerVelocity) => set({ playerVelocity }),

  finishGame: () => {
    const { timeSurvived, highScore } = get();
    const newHigh = Math.max(timeSurvived, highScore);
    if (newHigh > highScore) saveHighScore(newHigh);
    set({ phase: "gameover", highScore: newHigh });
  },

  restart: () =>
    set((state) => ({
      phase: "playing",
      gameKey: state.gameKey + 1,
      playerHp: 100,
      timeSurvived: 0,
      wave: 1,
      killCount: 0,
      enemies: [],
      bullets: [],
      powerUpItems: [],
      activePowerUps: [],
      safeZoneRadius: INITIAL_SAFE_ZONE,
      playerPosition: new THREE.Vector3(0, 0, 0),
      playerVelocity: new THREE.Vector3(0, 0, 0),
    })),
}));
