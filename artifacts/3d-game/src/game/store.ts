import { create } from "zustand";
import * as THREE from "three";

export type GamePhase =
  | "start" | "customization" | "levelselect" | "playing" | "gameover"
  | "dailyrewards" | "practice" | "settings" | "minigames" | "cutscene";

export type EnemyType = "chaser" | "tank" | "ranged" | "speeder" | "bomber" | "boss";
export type PowerUpType = "speed" | "shield" | "rapidfire" | "heal" | "drone";
export type KillEffectType =
  | "explosion" | "dissolve" | "shatter" | "vaporize"
  | "vortex"    | "freeze"   | "electrocute" | "disintegrate";

export interface DyingEnemy {
  id: string; pos: THREE.Vector3; color: string; createdAt: number; effect: KillEffectType;
}

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

export interface DamageEvent {
  id: string; x: number; z: number; value: number; crit: boolean; melee: boolean;
}

export interface DailyQuest {
  id: string;
  type: "kills" | "survive" | "coins" | "waves";
  description: string;
  goal: number;
  progress: number;
  reward: number;
  claimed: boolean;
}

export interface MapDrop {
  id: string;
  position: THREE.Vector3;
  type: "heart" | "weapon";
  weaponId?: string;
  lifetime: number;
}

// ─── Persistence ─────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v !== null ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Milestone definitions ────────────────────────────────────────────────────
export const MILESTONES = [
  { coins: 100,   perk: "extra_hp",     label: "+25 Max HP",              desc: "Every run starts with 125 HP" },
  { coins: 300,   perk: "start_rapid",  label: "Rapid Fire Start",        desc: "Begin each run with 8s Rapid Fire" },
  { coins: 700,   perk: "companion_5s", label: "Squad Backup Start",      desc: "Begin each run with 5s Squad Backup" },
  { coins: 1500,  perk: "start_shield", label: "Shield Start",            desc: "Begin each run with 8s Shield" },
  { coins: 3000,  perk: "second_life",  label: "Permanent Second Life",   desc: "Revive once every run at 50% HP" },
  { coins: 6000,  perk: "q_always",     label: "Drone Unlocked Always",   desc: "Q ability available regardless of level" },
  { coins: 12000, perk: "start_drone",  label: "Drone Strike Start",      desc: "Begin each run with 10s Drone Strike" },
  { coins: 25000, perk: "lightning",    label: "Lightning Perk",          desc: "Periodic lightning strikes near player" },
];

// ─── Daily quest pool ─────────────────────────────────────────────────────────
const QUEST_POOL: Omit<DailyQuest, "progress" | "claimed">[] = [
  { id: "q_kills_25",   type: "kills",   description: "Eliminate 25 enemies",          goal: 25,  reward: 60  },
  { id: "q_kills_50",   type: "kills",   description: "Eliminate 50 enemies",          goal: 50,  reward: 120 },
  { id: "q_kills_100",  type: "kills",   description: "Eliminate 100 enemies",         goal: 100, reward: 220 },
  { id: "q_survive_90", type: "survive", description: "Survive 1 min 30s in Endless",  goal: 90,  reward: 75  },
  { id: "q_survive_3m", type: "survive", description: "Survive 3 minutes in Endless",  goal: 180, reward: 150 },
  { id: "q_survive_5m", type: "survive", description: "Survive 5 minutes in Endless",  goal: 300, reward: 250 },
  { id: "q_coins_80",   type: "coins",   description: "Collect 80 coins in one run",   goal: 80,  reward: 70  },
  { id: "q_coins_200",  type: "coins",   description: "Collect 200 coins in one run",  goal: 200, reward: 160 },
  { id: "q_waves_5",    type: "waves",   description: "Reach Wave 5 in Endless",       goal: 5,   reward: 65  },
  { id: "q_waves_10",   type: "waves",   description: "Reach Wave 10 in Endless",      goal: 10,  reward: 170 },
];

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function generateDailyQuests(dateKey: string): DailyQuest[] {
  const seed = dateKey.split("-").reduce((a, b) => a + parseInt(b), 0);
  const pool = [...QUEST_POOL];
  const picked: typeof QUEST_POOL = [];
  let s = seed;
  while (picked.length < 3 && pool.length > 0) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const idx = Math.abs(s) % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.map((q) => ({ ...q, progress: 0, claimed: false }));
}

// ─── State ────────────────────────────────────────────────────────────────────
interface GameState {
  // Persistent
  coins: number;
  gems: number;
  storyEnabled: boolean;
  ownedSkins: string[];  selectedSkin: string;
  ownedGuns: string[];   selectedGun: string;
  ownedMaps: string[];   selectedMap: string;
  ownedMelees: string[]; selectedMelee: string;
  highestUnlockedLevel: number;
  highestCompletedLevel: number;
  completedLevels: number[];
  totalKillsByType: Partial<Record<EnemyType, number>>;
  musicVolume: number; sfxVolume: number; highScore: number;
  totalCoinsEarned: number;
  permanentPerks: string[];
  lastDailyChest: string;
  lastDailySpin: string;
  dailyQuests: DailyQuest[];
  dailyQuestsDate: string;

  // Session – general
  phase: GamePhase; gameKey: number;
  gameMode: "endless" | "levels" | "practice"; currentLevel: number;
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

  // Session – melee & combat feel
  meleeCooldown: number; meleeSwinging: boolean;
  killStreak: number;
  damageEvents: DamageEvent[];

  // Session – map drops & temp items
  tempWeapon: string | null;
  mapDrops: MapDrop[];

  // Session – checkpoints
  checkpointWave: number;
  checkpointHp: number;
  startCheckpointWave: number;

  // Session – death & transitions
  playerDead: boolean;
  deathPos: THREE.Vector3;
  levelCompleting: boolean;
  secretPortalOpen: boolean;
  inSecretLevel: boolean;
  secretWave: number;
  dyingEnemies: DyingEnemy[];

  // Persistent – kill effect
  killEffect: KillEffectType;

  // Setters
  setPhase: (p: GamePhase) => void;
  setPlayerHp: (hp: number) => void; setMaxPlayerHp: (hp: number) => void;
  setTimeSurvived: (t: number) => void;
  setWave: (w: number) => void; setKillCount: (n: number) => void;
  setEnemies: (e: Enemy[]) => void; setBullets: (b: Bullet[]) => void;
  setPowerUpItems: (p: PowerUpItem[]) => void; setActivePowerUps: (p: ActivePowerUp[]) => void;
  setSafeZoneRadius: (r: number) => void; setPlayerPosition: (p: THREE.Vector3) => void;
  setPlayerVelocity: (v: THREE.Vector3) => void;
  setPaused: (p: boolean) => void; setGameMode: (m: "endless" | "levels" | "practice") => void;
  setCurrentLevel: (l: number) => void;
  setDroneAbility: (active: boolean, timer: number, cd: number) => void;
  setSquadAbility: (active: boolean, timer: number, cd: number) => void;
  setReviveAvailable: (b: boolean) => void; setGuardianActive: (b: boolean) => void;
  setMeleeCooldown: (n: number) => void; setMeleeSwinging: (b: boolean) => void;
  setKillStreak: (n: number) => void;
  addDamageEvent: (e: DamageEvent) => void;
  setTempWeapon: (id: string | null) => void;
  setMapDrops: (drops: MapDrop[]) => void;
  setCheckpoint: (wave: number, hp: number) => void;
  clearCheckpoint: () => void;
  restartFromCheckpoint: () => void;

  // New setters – death & transitions
  setPlayerDead: (dead: boolean) => void;
  setDeathPos: (pos: THREE.Vector3) => void;
  setLevelCompleting: (b: boolean) => void;
  setSecretPortalOpen: (b: boolean) => void;
  setInSecretLevel: (b: boolean) => void;
  setSecretWave: (w: number) => void;
  setDyingEnemies: (e: DyingEnemy[]) => void;
  addDyingEnemy: (e: DyingEnemy) => void;
  setKillEffect: (e: KillEffectType) => void;
  triggerPlayerDeath: () => void;
  triggerLevelComplete: (levelId: number, reward: number) => void;

  // Progression
  addSessionCoins: (n: number) => void;
  recordKill: (type: EnemyType) => void;
  revive: () => void;
  purchaseSkin: (id: string, cost: number) => boolean;  selectSkin: (id: string) => void;
  purchaseGun: (id: string, cost: number) => boolean;   selectGun: (id: string) => void;
  purchaseMap: (id: string, cost: number) => boolean;   selectMap: (id: string) => void;
  purchaseMelee: (id: string, cost: number) => boolean; selectMelee: (id: string) => void;
  purchaseSkinWithGems: (id: string, gemCost: number) => boolean;
  purchaseGunWithGems: (id: string, gemCost: number) => boolean;
  purchaseMapWithGems: (id: string, gemCost: number) => boolean;
  purchaseMeleeWithGems: (id: string, gemCost: number) => boolean;
  setMusicVolume: (v: number) => void; setSfxVolume: (v: number) => void;
  setStoryEnabled: (b: boolean) => void;
  addCoins: (n: number) => void;
  addGems: (n: number) => void;
  spendGems: (n: number) => boolean;
  finishGame: () => void;
  completeLevel: (levelId: number, reward: number) => void;
  restart: () => void;

  // Daily system
  claimDailyChest: () => { coins: number; gems: number };
  claimDailySpin: (coins: number) => void;
  claimDailySpinGems: (gems: number) => void;
  updateQuestProgress: (type: DailyQuest["type"], value: number) => void;
  claimQuestReward: (questId: string) => void;
  refreshDailyQuestsIfNeeded: () => void;

  // Milestones
  addPermanentPerk: (perk: string) => void;
}

const INITIAL_SESSION = {
  phase:        "start" as GamePhase, gameKey: 0,
  gameMode:     "endless" as "endless" | "levels" | "practice", currentLevel: 1,
  sessionCoins: 0, paused: false, levelWon: false,
  playerHp: 100, maxPlayerHp: 100, timeSurvived: 0, wave: 1, killCount: 0,
  enemies: [] as Enemy[], bullets: [] as Bullet[],
  powerUpItems: [] as PowerUpItem[], activePowerUps: [] as ActivePowerUp[],
  safeZoneRadius: 40, playerPosition: new THREE.Vector3(), playerVelocity: new THREE.Vector3(),
  droneActive: false, droneTimer: 0, droneCooldown: 0,
  squadActive: false, squadTimer: 0, squadCooldown: 0,
  reviveAvailable: false, reviveUsed: false, guardianActive: false,
  meleeCooldown: 0, meleeSwinging: false,
  killStreak: 0, damageEvents: [] as DamageEvent[],
  tempWeapon: null as string | null,
  mapDrops: [] as MapDrop[],
  checkpointWave: 0, checkpointHp: 100, startCheckpointWave: 0,
  playerDead: false, deathPos: new THREE.Vector3(),
  levelCompleting: false, secretPortalOpen: false,
  inSecretLevel: false, secretWave: 0, dyingEnemies: [] as DyingEnemy[],
};

export const useGameStore = create<GameState>((set, get) => ({
  // Persistent
  coins:                 load("zb_coins",  0),
  gems:                  load("zb_gems",   0),
  storyEnabled:          load("zb_story",  false),
  ownedSkins:            load("zb_skins",   ["soldier"]),
  selectedSkin:          load("zb_skin",    "soldier"),
  ownedGuns:             load("zb_guns",    ["pistol"]),
  selectedGun:           load("zb_gun",     "pistol"),
  ownedMaps:             load("zb_maps",    ["urban"]),
  selectedMap:           load("zb_map",     "urban"),
  ownedMelees:           load("zb_melees",  ["fists"]),
  selectedMelee:         load("zb_melee",   "fists"),
  highestUnlockedLevel:  load("zb_lvl",     1),
  highestCompletedLevel: load("zb_hcl",     0),
  completedLevels:       load("zb_done",    []) as number[],
  totalKillsByType:      load("zb_kills",   {}) as Partial<Record<EnemyType, number>>,
  musicVolume:           load("zb_mvol",    0.35),
  sfxVolume:             load("zb_svol",    0.7),
  highScore:             load("zb_hs",      0),
  totalCoinsEarned:      load("zb_tce",     0),
  permanentPerks:        load("zb_perks",   []) as string[],
  lastDailyChest:        load("zb_chest",   ""),
  lastDailySpin:         load("zb_spin",    ""),
  dailyQuests:           load("zb_quests",  []) as DailyQuest[],
  dailyQuestsDate:       load("zb_qdate",   ""),
  killEffect:            load("zb_kfx",     "explosion") as KillEffectType,

  // Session
  ...INITIAL_SESSION,

  // Setters
  setPhase:          (phase)    => set({ phase }),
  setPlayerHp:       (playerHp) => set({ playerHp }),
  setMaxPlayerHp:    (maxPlayerHp) => set({ maxPlayerHp }),
  setTimeSurvived:   (t)        => set({ timeSurvived: t }),
  setWave:           (wave)     => set({ wave }),
  setKillCount:      (killCount)=> set({ killCount }),
  setEnemies:        (enemies)  => set({ enemies }),
  setBullets:        (bullets)  => set({ bullets }),
  setPowerUpItems:   (p)        => set({ powerUpItems: p }),
  setActivePowerUps: (p)        => set({ activePowerUps: p }),
  setSafeZoneRadius: (r)        => set({ safeZoneRadius: r }),
  setPlayerPosition: (p)        => set({ playerPosition: p }),
  setPlayerVelocity: (v)        => set({ playerVelocity: v }),
  setPaused:         (paused)   => set({ paused }),
  setGameMode:       (m)        => set({ gameMode: m }),
  setCurrentLevel:   (l)        => set({ currentLevel: l }),
  setDroneAbility:   (a, t, c)  => set({ droneActive: a, droneTimer: t, droneCooldown: c }),
  setSquadAbility:   (a, t, c)  => set({ squadActive: a, squadTimer: t, squadCooldown: c }),
  setReviveAvailable:(b)        => set({ reviveAvailable: b }),
  setGuardianActive: (b)        => set({ guardianActive: b }),
  setMeleeCooldown:  (n)        => set({ meleeCooldown: n }),
  setMeleeSwinging:  (b)        => set({ meleeSwinging: b }),
  setKillStreak:     (n)        => set({ killStreak: n }),
  setTempWeapon:     (id)       => set({ tempWeapon: id }),
  setMapDrops:       (drops)    => set({ mapDrops: drops }),
  setCheckpoint: (wave, hp) => set({ checkpointWave: wave, checkpointHp: hp }),
  clearCheckpoint: () => set({ checkpointWave: 0, checkpointHp: 100, startCheckpointWave: 0 }),
  restartFromCheckpoint: () => set((s) => ({
    ...INITIAL_SESSION,
    gameKey: s.gameKey + 1,
    startCheckpointWave: s.checkpointWave,
    checkpointWave: s.checkpointWave,
    checkpointHp: s.checkpointHp,
  })),

  // New setters
  setPlayerDead:      (dead) => set({ playerDead: dead }),
  setDeathPos:        (pos)  => set({ deathPos: pos }),
  setLevelCompleting: (b)    => set({ levelCompleting: b }),
  setSecretPortalOpen:(b)    => set({ secretPortalOpen: b }),
  setInSecretLevel:   (b)    => set({ inSecretLevel: b }),
  setSecretWave:      (w)    => set({ secretWave: w }),
  setDyingEnemies:    (e)    => set({ dyingEnemies: e }),
  addDyingEnemy:      (e)    => set((s) => ({ dyingEnemies: [...s.dyingEnemies, e] })),
  setKillEffect:      (e)    => { save("zb_kfx", e); set({ killEffect: e }); },

  triggerPlayerDeath: () => {
    const s = get();
    set({ playerDead: true, deathPos: s.playerPosition.clone() });
    setTimeout(() => { get().finishGame(); }, 2500);
  },

  triggerLevelComplete: (levelId, reward) => {
    set({ levelCompleting: true });
    setTimeout(() => {
      const s = get();
      const coins                 = s.coins + s.sessionCoins + reward;
      const completedLevels       = s.completedLevels.includes(levelId)
        ? s.completedLevels : [...s.completedLevels, levelId];
      const highestUnlockedLevel  = Math.max(s.highestUnlockedLevel, levelId + 1);
      const highestCompletedLevel = Math.max(s.highestCompletedLevel, levelId);
      const highScore             = Math.max(s.timeSurvived, s.highScore);
      const totalCoinsEarned      = s.totalCoinsEarned + s.sessionCoins + reward;
      let ownedSkins = s.ownedSkins;
      if (levelId >= 15 && !ownedSkins.includes("ghost_squad")) {
        ownedSkins = [...ownedSkins, "ghost_squad"];
        save("zb_skins", ownedSkins);
      }
      const quests = s.dailyQuests.map((q) => {
        const upd = { ...q };
        if (q.type === "kills")  upd.progress = Math.max(q.progress, Math.min(q.goal, s.killCount));
        if (q.type === "coins")  upd.progress = Math.max(q.progress, Math.min(q.goal, s.sessionCoins + reward));
        if (q.type === "waves")  upd.progress = Math.max(q.progress, Math.min(q.goal, s.wave));
        return upd;
      });
      save("zb_quests", quests); save("zb_coins", coins);
      save("zb_done", completedLevels); save("zb_lvl", highestUnlockedLevel);
      save("zb_hcl",  highestCompletedLevel); save("zb_hs", highScore);
      save("zb_tce",  totalCoinsEarned);
      set({
        phase: "start", levelCompleting: false, levelWon: true,
        coins, completedLevels, highestUnlockedLevel, highestCompletedLevel,
        highScore, ownedSkins, totalCoinsEarned, dailyQuests: quests,
        tempWeapon: null, mapDrops: [],
        secretPortalOpen: false, inSecretLevel: false, secretWave: 0,
        playerDead: false, dyingEnemies: [],
      });
    }, 3000);
  },

  addDamageEvent: (e) => {
    set((s) => ({ damageEvents: [...s.damageEvents.slice(-18), e] }));
    setTimeout(() => {
      set((s) => ({ damageEvents: s.damageEvents.filter((x) => x.id !== e.id) }));
    }, 1200);
  },

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
    const coins = s.coins - cost; const ownedSkins = [...s.ownedSkins, id];
    save("zb_coins", coins); save("zb_skins", ownedSkins);
    set({ coins, ownedSkins }); return true;
  },
  selectSkin: (id) => { save("zb_skin", id); set({ selectedSkin: id }); },

  purchaseSkinWithGems: (id, gemCost) => {
    const s = get();
    if (s.ownedSkins.includes(id)) return true;
    if (s.gems < gemCost) return false;
    const gems = s.gems - gemCost; const ownedSkins = [...s.ownedSkins, id];
    save("zb_gems", gems); save("zb_skins", ownedSkins);
    set({ gems, ownedSkins }); return true;
  },

  purchaseGun: (id, cost) => {
    const s = get();
    if (s.ownedGuns.includes(id)) return true;
    if (s.coins < cost) return false;
    const coins = s.coins - cost; const ownedGuns = [...s.ownedGuns, id];
    save("zb_coins", coins); save("zb_guns", ownedGuns);
    set({ coins, ownedGuns }); return true;
  },
  selectGun: (id) => { save("zb_gun", id); set({ selectedGun: id }); },

  purchaseGunWithGems: (id, gemCost) => {
    const s = get();
    if (s.ownedGuns.includes(id)) return true;
    if (s.gems < gemCost) return false;
    const gems = s.gems - gemCost; const ownedGuns = [...s.ownedGuns, id];
    save("zb_gems", gems); save("zb_guns", ownedGuns);
    set({ gems, ownedGuns }); return true;
  },

  purchaseMap: (id, cost) => {
    const s = get();
    if (s.ownedMaps.includes(id)) return true;
    if (s.coins < cost) return false;
    const coins = s.coins - cost; const ownedMaps = [...s.ownedMaps, id];
    save("zb_coins", coins); save("zb_maps", ownedMaps);
    set({ coins, ownedMaps }); return true;
  },
  selectMap: (id) => { save("zb_map", id); set({ selectedMap: id }); },

  purchaseMapWithGems: (id, gemCost) => {
    const s = get();
    if (s.ownedMaps.includes(id)) return true;
    if (s.gems < gemCost) return false;
    const gems = s.gems - gemCost; const ownedMaps = [...s.ownedMaps, id];
    save("zb_gems", gems); save("zb_maps", ownedMaps);
    set({ gems, ownedMaps }); return true;
  },

  purchaseMelee: (id, cost) => {
    const s = get();
    if (s.ownedMelees.includes(id)) return true;
    if (s.coins < cost) return false;
    const coins = s.coins - cost; const ownedMelees = [...s.ownedMelees, id];
    save("zb_coins", coins); save("zb_melees", ownedMelees);
    set({ coins, ownedMelees }); return true;
  },
  selectMelee: (id) => { save("zb_melee", id); set({ selectedMelee: id }); },

  purchaseMeleeWithGems: (id, gemCost) => {
    const s = get();
    if (s.ownedMelees.includes(id)) return true;
    if (s.gems < gemCost) return false;
    const gems = s.gems - gemCost; const ownedMelees = [...s.ownedMelees, id];
    save("zb_gems", gems); save("zb_melees", ownedMelees);
    set({ gems, ownedMelees }); return true;
  },

  setMusicVolume:  (v) => { save("zb_mvol", v); set({ musicVolume: v }); },
  setSfxVolume:    (v) => { save("zb_svol", v); set({ sfxVolume: v }); },
  setStoryEnabled: (b) => { save("zb_story", b); set({ storyEnabled: b }); },

  addCoins: (n) => {
    const s = get(); const coins = s.coins + n;
    save("zb_coins", coins); set({ coins });
  },
  addGems: (n) => {
    const s = get(); const gems = s.gems + n;
    save("zb_gems", gems); set({ gems });
  },
  spendGems: (n) => {
    const s = get();
    if (s.gems < n) return false;
    const gems = s.gems - n;
    save("zb_gems", gems); set({ gems }); return true;
  },

  finishGame: () => {
    const s = get();
    const coins             = s.coins + s.sessionCoins;
    const highScore         = Math.max(s.timeSurvived, s.highScore);
    const totalCoinsEarned  = s.totalCoinsEarned + s.sessionCoins;
    save("zb_coins", coins); save("zb_hs", highScore); save("zb_tce", totalCoinsEarned);
    const quests = s.dailyQuests.map((q) => {
      const upd = { ...q };
      if (q.type === "kills")   upd.progress = Math.max(q.progress, Math.min(q.goal, s.killCount));
      if (q.type === "survive" && s.gameMode === "endless") upd.progress = Math.max(q.progress, Math.min(q.goal, s.timeSurvived));
      if (q.type === "coins")   upd.progress = Math.max(q.progress, Math.min(q.goal, s.sessionCoins));
      if (q.type === "waves")   upd.progress = Math.max(q.progress, Math.min(q.goal, s.wave));
      return upd;
    });
    save("zb_quests", quests);
    set({ phase: "gameover", levelWon: false, coins, highScore, totalCoinsEarned,
      dailyQuests: quests, tempWeapon: null, mapDrops: [],
      secretPortalOpen: false, inSecretLevel: false, secretWave: 0,
    });
  },

  completeLevel: (levelId, reward) => {
    const s = get();
    const coins                 = s.coins + s.sessionCoins + reward;
    const completedLevels       = s.completedLevels.includes(levelId)
      ? s.completedLevels : [...s.completedLevels, levelId];
    const highestUnlockedLevel  = Math.max(s.highestUnlockedLevel, levelId + 1);
    const highestCompletedLevel = Math.max(s.highestCompletedLevel, levelId);
    const highScore             = Math.max(s.timeSurvived, s.highScore);
    const totalCoinsEarned      = s.totalCoinsEarned + s.sessionCoins + reward;

    let ownedSkins = s.ownedSkins;
    if (levelId >= 15 && !ownedSkins.includes("ghost_squad")) {
      ownedSkins = [...ownedSkins, "ghost_squad"];
      save("zb_skins", ownedSkins);
    }
    const quests = s.dailyQuests.map((q) => {
      const upd = { ...q };
      if (q.type === "kills")  upd.progress = Math.max(q.progress, Math.min(q.goal, s.killCount));
      if (q.type === "coins")  upd.progress = Math.max(q.progress, Math.min(q.goal, s.sessionCoins + reward));
      if (q.type === "waves")  upd.progress = Math.max(q.progress, Math.min(q.goal, s.wave));
      return upd;
    });
    save("zb_quests", quests);
    save("zb_coins", coins); save("zb_done", completedLevels);
    save("zb_lvl",   highestUnlockedLevel);
    save("zb_hcl",   highestCompletedLevel);
    save("zb_hs",    highScore);
    save("zb_tce",   totalCoinsEarned);

    set({ phase: "gameover", levelWon: true, coins, completedLevels,
      highestUnlockedLevel, highestCompletedLevel, highScore, ownedSkins,
      totalCoinsEarned, dailyQuests: quests, tempWeapon: null, mapDrops: [] });
  },

  restart: () => set((s) => ({
    ...INITIAL_SESSION, phase: "playing", gameKey: s.gameKey + 1,
    playerDead: false, levelCompleting: false,
    secretPortalOpen: false, inSecretLevel: false, secretWave: 0,
    dyingEnemies: [],
  })),

  // Daily chest — 8% chance of 1–3 bonus gems
  claimDailyChest: () => {
    const s = get();
    const coins    = 50 + Math.floor(Math.random() * 151);
    const gemBonus = Math.random() < 0.08 ? 1 + Math.floor(Math.random() * 3) : 0;
    const newCoins = s.coins + coins;
    const newGems  = s.gems + gemBonus;
    const lastDailyChest = getTodayKey();
    save("zb_coins", newCoins); save("zb_chest", lastDailyChest);
    if (gemBonus > 0) save("zb_gems", newGems);
    set({ coins: newCoins, gems: newGems, lastDailyChest });
    return { coins, gems: gemBonus };
  },

  // Spin reward (coins already calculated by SpinWheel)
  claimDailySpin: (coins) => {
    const lastDailySpin = getTodayKey();
    save("zb_spin", lastDailySpin);
    const newCoins = get().coins + coins;
    save("zb_coins", newCoins);
    set({ lastDailySpin, coins: newCoins });
  },

  // Spin gem reward
  claimDailySpinGems: (gems) => {
    const newGems = get().gems + gems;
    save("zb_gems", newGems);
    set({ gems: newGems });
  },

  updateQuestProgress: (type, value) => {
    const quests = get().dailyQuests.map((q) => {
      if (q.type !== type) return q;
      return { ...q, progress: Math.max(q.progress, Math.min(q.goal, value)) };
    });
    save("zb_quests", quests);
    set({ dailyQuests: quests });
  },

  claimQuestReward: (questId) => {
    const quests = get().dailyQuests.map((q) =>
      q.id === questId ? { ...q, claimed: true } : q,
    );
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;
    const coins = get().coins + quest.reward;
    const totalCoinsEarned = get().totalCoinsEarned + quest.reward;
    save("zb_quests", quests); save("zb_coins", coins); save("zb_tce", totalCoinsEarned);
    set({ dailyQuests: quests, coins, totalCoinsEarned });
  },

  refreshDailyQuestsIfNeeded: () => {
    const today = getTodayKey();
    const s = get();
    if (s.dailyQuestsDate !== today || s.dailyQuests.length === 0) {
      const quests = generateDailyQuests(today);
      save("zb_quests", quests); save("zb_qdate", today);
      set({ dailyQuests: quests, dailyQuestsDate: today });
    }
  },

  addPermanentPerk: (perk) => {
    const perks = [...get().permanentPerks];
    if (perks.includes(perk)) return;
    perks.push(perk);
    save("zb_perks", perks);
    set({ permanentPerks: perks });
  },
}));
