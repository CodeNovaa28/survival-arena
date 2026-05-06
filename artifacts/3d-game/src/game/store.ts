import { create } from "zustand";
import * as THREE from "three";

export type GamePhase =
  | "start" | "customization" | "levelselect" | "playing" | "gameover";

export type EnemyType = "chaser" | "tank" | "ranged" | "speeder" | "bomber";
export type PowerUpType = "speed" | "shield" | "rapidfire" | "heal" | "drone";

export interface Enemy {
  id: string; position: THREE.Vector3; hp: number; maxHp: number;
  type: EnemyType; speed: number; baseDamage: number;
  lastShot: number; lastDamageTime: number; alertRadius: number; zigzagPhase: number;
}
export interface Bullet {
  id: string; position: THREE.Vector3; direction: THREE.Vector3;
  speed: number; fromPlayer: boolean; damage: number; lifetime: number;
}
export interface PowerUpItem {
  id: string; position: THREE.Vector3; type: PowerUpType; lifetime: number;
}
export interface ActivePowerUp { type: PowerUpType; timeLeft: number; maxTime: number; }

// ─── Persistence ─────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v !== null ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── State ────────────────────────────────────────────────────────────────────
interface GameState {
  // Persistent
  coins: number;
  ownedSkins: string[]; selectedSkin: string;
  ownedGuns: string[];  selectedGun: string;
  ownedMaps: string[];  selectedMap: string;
  highestUnlockedLevel: number;
  highestCompletedLevel: number;
  completedLevels: number[];
  totalKillsByType: Partial<Record<EnemyType, number>>;
  musicVolume: number; sfxVolume: number; highScore: number;

  // Session – general
  phase: GamePhase; gameKey: number;
  gameMode: "endless" | "levels"; currentLevel: number;
  sessionCoins: number; paused: boolean; levelWon: boolean;

  // Session – in-game
  playerHp: number; maxPlayerHp: number; timeSurvived: number; wave: number;
  killCount: number; enemies: Enemy[]; bullets: Bullet[];
  powerUpItems: PowerUpItem[]; activePowerUps: ActivePowerUp[];
  safeZoneRadius: number; playerPosition: THREE.Vector3; playerVelocity: THREE.Vector3;

  // Session – abilities & perks
  droneActive: boolean; droneTimer: number; droneCooldown: number;
  squadActive: boolean; squadTimer: number; squadCooldown: number;
  reviveAvailable: boolean; reviveUsed: boolean; guardianActive: boolean;

  // Actions – setters
  setPhase: (p: GamePhase) => void;
  setPlayerHp: (hp: number) => void; setTimeSurvived: (t: number) => void;
  setWave: (w: number) => void; setKillCount: (n: number) => void;
  setEnemies: (e: Enemy[]) => void; setBullets: (b: Bullet[]) => void;
  setPowerUpItems: (p: PowerUpItem[]) => void; setActivePowerUps: (p: ActivePowerUp[]) => void;
  setSafeZoneRadius: (r: number) => void; setPlayerPosition: (p: THREE.Vector3) => void;
  setPlayerVelocity: (v: THREE.Vector3) => void;
  setPaused: (p: boolean) => void; setGameMode: (m: "endless" | "levels") => void;
  setCurrentLevel: (l: number) => void;
  setDroneAbility: (active: boolean, timer: number, cd: number) => void;
  setSquadAbility: (active: boolean, timer: number, cd: number) => void;
  setReviveAvailable: (b: boolean) => void; setGuardianActive: (b: boolean) => void;

  // Actions – progression
  addSessionCoins: (n: number) => void;
  recordKill: (type: EnemyType) => void;
  revive: () => void;
  purchaseSkin: (id: string, cost: number) => boolean; selectSkin: (id: string) => void;
  purchaseGun: (id: string, cost: number) => boolean;  selectGun: (id: string) => void;
  purchaseMap: (id: string, cost: number) => boolean;  selectMap: (id: string) => void;
  setMusicVolume: (v: number) => void; setSfxVolume: (v: number) => void;
  finishGame: () => void;
  completeLevel: (levelId: number, reward: number) => void;
  restart: () => void;
}

const INITIAL_SESSION = {
  phase:        "start" as GamePhase, gameKey: 0,
  gameMode:     "endless" as "endless" | "levels", currentLevel: 1,
  sessionCoins: 0, paused: false, levelWon: false,
  playerHp: 100, maxPlayerHp: 100, timeSurvived: 0, wave: 1, killCount: 0,
  enemies: [] as Enemy[], bullets: [] as Bullet[],
  powerUpItems: [] as PowerUpItem[], activePowerUps: [] as ActivePowerUp[],
  safeZoneRadius: 23, playerPosition: new THREE.Vector3(), playerVelocity: new THREE.Vector3(),
  droneActive: false, droneTimer: 0, droneCooldown: 0,
  squadActive: false, squadTimer: 0, squadCooldown: 0,
  reviveAvailable: false, reviveUsed: false, guardianActive: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  // Persistent
  coins:                load("zb_coins", 0),
  ownedSkins:           load("zb_skins", ["soldier"]),
  selectedSkin:         load("zb_skin",  "soldier"),
  ownedGuns:            load("zb_guns",  ["pistol"]),
  selectedGun:          load("zb_gun",   "pistol"),
  ownedMaps:            load("zb_maps",  ["urban"]),
  selectedMap:          load("zb_map",   "urban"),
  highestUnlockedLevel: load("zb_lvl",   1),
  highestCompletedLevel:load("zb_hcl",   0),
  completedLevels:      load("zb_done",  []) as number[],
  totalKillsByType:     load("zb_kills", {}) as Partial<Record<EnemyType, number>>,
  musicVolume:          load("zb_mvol",  0.35),
  sfxVolume:            load("zb_svol",  0.7),
  highScore:            load("zb_hs",    0),

  // Session
  ...INITIAL_SESSION,

  // Setters
  setPhase:          (phase)    => set({ phase }),
  setPlayerHp:       (playerHp) => set({ playerHp }),
  setTimeSurvived:   (timeSurvived) => set({ timeSurvived }),
  setWave:           (wave)     => set({ wave }),
  setKillCount:      (killCount)=> set({ killCount }),
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
  setDroneAbility:   (droneActive, droneTimer, droneCooldown) =>
    set({ droneActive, droneTimer, droneCooldown }),
  setSquadAbility:   (squadActive, squadTimer, squadCooldown) =>
    set({ squadActive, squadTimer, squadCooldown }),
  setReviveAvailable:(reviveAvailable) => set({ reviveAvailable }),
  setGuardianActive: (guardianActive)  => set({ guardianActive }),

  addSessionCoins: (n) => set((s) => ({ sessionCoins: s.sessionCoins + n })),

  recordKill: (type) => set((s) => {
    const next = { ...s.totalKillsByType, [type]: (s.totalKillsByType[type] ?? 0) + 1 };
    save("zb_kills", next);
    return { totalKillsByType: next };
  }),

  revive: () => set((s) => ({
    playerHp: s.maxPlayerHp * 0.5, reviveAvailable: false, reviveUsed: true,
  })),

  purchaseSkin: (id, cost) => {
    const s = get();
    if (s.ownedSkins.includes(id)) return true;
    if (s.coins < cost) return false;
    const coins = s.coins - cost;
    const ownedSkins = [...s.ownedSkins, id];
    save("zb_coins", coins); save("zb_skins", ownedSkins);
    set({ coins, ownedSkins });
    return true;
  },
  selectSkin: (id) => { save("zb_skin", id); set({ selectedSkin: id }); },

  purchaseGun: (id, cost) => {
    const s = get();
    if (s.ownedGuns.includes(id)) return true;
    if (s.coins < cost) return false;
    const coins = s.coins - cost;
    const ownedGuns = [...s.ownedGuns, id];
    save("zb_coins", coins); save("zb_guns", ownedGuns);
    set({ coins, ownedGuns });
    return true;
  },
  selectGun: (id) => { save("zb_gun", id); set({ selectedGun: id }); },

  purchaseMap: (id, cost) => {
    const s = get();
    if (s.ownedMaps.includes(id)) return true;
    if (s.coins < cost) return false;
    const coins = s.coins - cost;
    const ownedMaps = [...s.ownedMaps, id];
    save("zb_coins", coins); save("zb_maps", ownedMaps);
    set({ coins, ownedMaps });
    return true;
  },
  selectMap: (id) => { save("zb_map", id); set({ selectedMap: id }); },

  setMusicVolume: (v) => { save("zb_mvol", v); set({ musicVolume: v }); },
  setSfxVolume:   (v) => { save("zb_svol", v); set({ sfxVolume: v }); },

  finishGame: () => {
    const s = get();
    const coins       = s.coins + s.sessionCoins;
    const highScore   = Math.max(s.timeSurvived, s.highScore);
    save("zb_coins", coins); save("zb_hs", highScore);
    set({ phase: "gameover", levelWon: false, coins, highScore });
  },

  completeLevel: (levelId, reward) => {
    const s = get();
    const coins                = s.coins + s.sessionCoins + reward;
    const completedLevels      = s.completedLevels.includes(levelId)
      ? s.completedLevels : [...s.completedLevels, levelId];
    const highestUnlockedLevel = Math.max(s.highestUnlockedLevel, levelId + 1);
    const highestCompletedLevel= Math.max(s.highestCompletedLevel, levelId);
    const highScore            = Math.max(s.timeSurvived, s.highScore);

    // Unlock ghost_squad skin if level 15 completed
    let ownedSkins = s.ownedSkins;
    if (levelId >= 15 && !ownedSkins.includes("ghost_squad")) {
      ownedSkins = [...ownedSkins, "ghost_squad"];
      save("zb_skins", ownedSkins);
    }

    save("zb_coins", coins); save("zb_done", completedLevels);
    save("zb_lvl",   highestUnlockedLevel);
    save("zb_hcl",   highestCompletedLevel);
    save("zb_hs",    highScore);

    set({
      phase: "gameover", levelWon: true, coins, completedLevels,
      highestUnlockedLevel, highestCompletedLevel, highScore, ownedSkins,
    });
  },

  restart: () => set((s) => ({
    ...INITIAL_SESSION, phase: "playing", gameKey: s.gameKey + 1,
  })),
}));
