import { create } from "zustand";
import * as THREE from "three";

export type GamePhase =
  | "start"
  | "customization"
  | "levelselect"
  | "playing"
  | "gameover";

export type EnemyType = "chaser" | "tank" | "ranged" | "speeder" | "bomber";
export type PowerUpType = "speed" | "shield" | "rapidfire" | "heal" | "drone";

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

// ─── Persistence helpers ───────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── State interfaces ──────────────────────────────────────────────────────
interface GameState {
  // ── Persistent (survives refresh) ─────────────────────────────────────
  coins: number;
  ownedSkins: string[];
  selectedSkin: string;
  ownedGuns: string[];
  selectedGun: string;
  ownedMaps: string[];
  selectedMap: string;
  highestUnlockedLevel: number;
  completedLevels: number[];
  totalKillsByType: Partial<Record<EnemyType, number>>;
  musicVolume: number;
  sfxVolume: number;
  highScore: number;

  // ── Session ────────────────────────────────────────────────────────────
  phase: GamePhase;
  gameKey: number;
  gameMode: "endless" | "levels";
  currentLevel: number;
  sessionCoins: number;
  paused: boolean;
  levelWon: boolean;

  // ── In-game ────────────────────────────────────────────────────────────
  playerHp: number;
  maxPlayerHp: number;
  timeSurvived: number;
  wave: number;
  killCount: number;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUpItems: PowerUpItem[];
  activePowerUps: ActivePowerUp[];
  safeZoneRadius: number;
  playerPosition: THREE.Vector3;
  playerVelocity: THREE.Vector3;

  // ── Actions ────────────────────────────────────────────────────────────
  setPhase: (phase: GamePhase) => void;
  setPlayerHp: (hp: number) => void;
  setTimeSurvived: (t: number) => void;
  setWave: (w: number) => void;
  setKillCount: (n: number) => void;
  setEnemies: (e: Enemy[]) => void;
  setBullets: (b: Bullet[]) => void;
  setPowerUpItems: (p: PowerUpItem[]) => void;
  setActivePowerUps: (p: ActivePowerUp[]) => void;
  setSafeZoneRadius: (r: number) => void;
  setPlayerPosition: (p: THREE.Vector3) => void;
  setPlayerVelocity: (v: THREE.Vector3) => void;
  setPaused: (p: boolean) => void;
  setGameMode: (m: "endless" | "levels") => void;
  setCurrentLevel: (l: number) => void;

  addSessionCoins: (n: number) => void;
  recordKill: (type: EnemyType) => void;

  purchaseSkin: (id: string, cost: number) => boolean;
  selectSkin: (id: string) => void;
  purchaseGun: (id: string, cost: number) => boolean;
  selectGun: (id: string) => void;
  purchaseMap: (id: string, cost: number) => boolean;
  selectMap: (id: string) => void;

  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;

  finishGame: () => void;
  completeLevel: (levelId: number, reward: number) => void;
  restart: () => void;
}

const INITIAL_SESSION = {
  phase:        "start" as GamePhase,
  gameKey:      0,
  gameMode:     "endless" as "endless" | "levels",
  currentLevel: 1,
  sessionCoins: 0,
  paused:       false,
  levelWon:     false,
  playerHp:     100,
  maxPlayerHp:  100,
  timeSurvived: 0,
  wave:         1,
  killCount:    0,
  enemies:      [] as Enemy[],
  bullets:      [] as Bullet[],
  powerUpItems: [] as PowerUpItem[],
  activePowerUps: [] as ActivePowerUp[],
  safeZoneRadius: 23,
  playerPosition: new THREE.Vector3(),
  playerVelocity: new THREE.Vector3(),
};

export const useGameStore = create<GameState>((set, get) => ({
  // Persistent
  coins:                   load("zb_coins",    0),
  ownedSkins:              load("zb_skins",    ["soldier"]),
  selectedSkin:            load("zb_skin",     "soldier"),
  ownedGuns:               load("zb_guns",     ["pistol"]),
  selectedGun:             load("zb_gun",      "pistol"),
  ownedMaps:               load("zb_maps",     ["urban"]),
  selectedMap:             load("zb_map",      "urban"),
  highestUnlockedLevel:    load("zb_lvl",      1),
  completedLevels:         load("zb_done",     []) as number[],
  totalKillsByType:        load("zb_kills",    {}) as Partial<Record<EnemyType, number>>,
  musicVolume:             load("zb_mvol",     0.35),
  sfxVolume:               load("zb_svol",     0.7),
  highScore:               load("zb_hs",       0),

  // Session
  ...INITIAL_SESSION,

  // ── Setters ──────────────────────────────────────────────────────────────
  setPhase:          (phase)    => set({ phase }),
  setPlayerHp:       (playerHp) => set({ playerHp }),
  setTimeSurvived:   (timeSurvived) => set({ timeSurvived }),
  setWave:           (wave)     => set({ wave }),
  setKillCount:      (killCount) => set({ killCount }),
  setEnemies:        (enemies)  => set({ enemies }),
  setBullets:        (bullets)  => set({ bullets }),
  setPowerUpItems:   (powerUpItems) => set({ powerUpItems }),
  setActivePowerUps: (activePowerUps) => set({ activePowerUps }),
  setSafeZoneRadius: (safeZoneRadius) => set({ safeZoneRadius }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  setPlayerVelocity: (playerVelocity) => set({ playerVelocity }),
  setPaused:         (paused)   => set({ paused }),
  setGameMode:       (gameMode) => set({ gameMode }),
  setCurrentLevel:   (currentLevel) => set({ currentLevel }),

  addSessionCoins: (n) => set((s) => ({ sessionCoins: s.sessionCoins + n })),

  recordKill: (type) =>
    set((s) => {
      const prev = s.totalKillsByType[type] ?? 0;
      const next = { ...s.totalKillsByType, [type]: prev + 1 };
      save("zb_kills", next);
      return { totalKillsByType: next };
    }),

  // ── Shop ─────────────────────────────────────────────────────────────────
  purchaseSkin: (id, cost) => {
    const s = get();
    if (s.ownedSkins.includes(id)) return true;
    if (s.coins < cost) return false;
    const newCoins = s.coins - cost;
    const newOwned = [...s.ownedSkins, id];
    save("zb_coins", newCoins);
    save("zb_skins", newOwned);
    set({ coins: newCoins, ownedSkins: newOwned });
    return true;
  },
  selectSkin: (id) => {
    save("zb_skin", id);
    set({ selectedSkin: id });
  },

  purchaseGun: (id, cost) => {
    const s = get();
    if (s.ownedGuns.includes(id)) return true;
    if (s.coins < cost) return false;
    const newCoins = s.coins - cost;
    const newOwned = [...s.ownedGuns, id];
    save("zb_coins", newCoins);
    save("zb_guns", newOwned);
    set({ coins: newCoins, ownedGuns: newOwned });
    return true;
  },
  selectGun: (id) => {
    save("zb_gun", id);
    set({ selectedGun: id });
  },

  purchaseMap: (id, cost) => {
    const s = get();
    if (s.ownedMaps.includes(id)) return true;
    if (s.coins < cost) return false;
    const newCoins = s.coins - cost;
    const newOwned = [...s.ownedMaps, id];
    save("zb_coins", newCoins);
    save("zb_maps", newOwned);
    set({ coins: newCoins, ownedMaps: newOwned });
    return true;
  },
  selectMap: (id) => {
    save("zb_map", id);
    set({ selectedMap: id });
  },

  setMusicVolume: (v) => { save("zb_mvol", v); set({ musicVolume: v }); },
  setSfxVolume:   (v) => { save("zb_svol", v); set({ sfxVolume: v }); },

  // ── Game events ───────────────────────────────────────────────────────────
  finishGame: () => {
    const s = get();
    const totalCoins  = s.coins + s.sessionCoins;
    const newHighScore = Math.max(s.timeSurvived, s.highScore);
    save("zb_coins", totalCoins);
    save("zb_hs",    newHighScore);
    set({ phase: "gameover", levelWon: false, coins: totalCoins, highScore: newHighScore });
  },

  completeLevel: (levelId, reward) => {
    const s = get();
    const totalCoins = s.coins + s.sessionCoins + reward;
    const completedLevels = s.completedLevels.includes(levelId)
      ? s.completedLevels
      : [...s.completedLevels, levelId];
    const highestUnlockedLevel = Math.max(s.highestUnlockedLevel, levelId + 1);
    const newHighScore = Math.max(s.timeSurvived, s.highScore);
    save("zb_coins", totalCoins);
    save("zb_done",  completedLevels);
    save("zb_lvl",   highestUnlockedLevel);
    save("zb_hs",    newHighScore);
    set({
      phase: "gameover", levelWon: true, coins: totalCoins,
      completedLevels, highestUnlockedLevel, highScore: newHighScore,
    });
  },

  restart: () =>
    set((s) => ({
      ...INITIAL_SESSION,
      phase:   "playing",
      gameKey: s.gameKey + 1,
    })),
}));
