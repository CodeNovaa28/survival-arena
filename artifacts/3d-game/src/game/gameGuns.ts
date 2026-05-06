import { PowerUpType } from "./store";

export type GunTier = "basic" | "rare" | "epic" | "legendary";
export type GunPerk = "secondLife" | null;

export interface GunDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  tier: GunTier;
  fireRate: number;    // seconds between shots
  damage: number;
  bulletSpeed: number;
  range: number;       // bullet lifetime
  bulletCount: number;
  spread: number;      // spread half-angle in degrees
  autoPowerUp?: PowerUpType;
  perk?: GunPerk;
  perkDesc?: string;
  barrelColor: string;
  bulletColor: string;
  badge: string;
  statFireRate: number;
  statDamage: number;
  statRange: number;
}

export const GUNS: GunDef[] = [
  {
    id: "pistol", name: "Pistol",
    description: "Standard sidearm. Slow fire rate, limited range.",
    cost: 0, tier: "basic",
    fireRate: 0.55, damage: 22, bulletSpeed: 18, range: 1.6, bulletCount: 1, spread: 0,
    barrelColor: "#0f172a", bulletColor: "#fde68a", badge: "🔫",
    statFireRate: 3, statDamage: 4, statRange: 3,
  },
  {
    id: "rifle", name: "Assault Rifle",
    description: "Accurate, long-range, solid damage. A reliable upgrade.",
    cost: 80, tier: "basic",
    fireRate: 0.22, damage: 28, bulletSpeed: 28, range: 3.2, bulletCount: 1, spread: 0,
    barrelColor: "#1e293b", bulletColor: "#fef3c7", badge: "🎯",
    statFireRate: 6, statDamage: 5, statRange: 7,
  },
  {
    id: "smg", name: "SMG",
    description: "Blazing fast fire rate, close-range suppression.",
    cost: 130, tier: "rare",
    fireRate: 0.1, damage: 13, bulletSpeed: 22, range: 1.4, bulletCount: 1, spread: 0,
    barrelColor: "#374151", bulletColor: "#fbbf24", badge: "⚡",
    statFireRate: 9, statDamage: 3, statRange: 3,
  },
  {
    id: "shotgun", name: "Shotgun",
    description: "5 pellets per shot. Devastating up close.",
    cost: 200, tier: "rare",
    fireRate: 0.7, damage: 16, bulletSpeed: 16, range: 1.1, bulletCount: 5, spread: 22,
    barrelColor: "#1c1917", bulletColor: "#fb923c", badge: "💥",
    statFireRate: 3, statDamage: 7, statRange: 2,
  },
  {
    id: "sniper", name: "Sniper Rifle",
    description: "Extreme range, extreme damage. One-shots most enemies.",
    cost: 280, tier: "epic",
    fireRate: 1.4, damage: 100, bulletSpeed: 42, range: 4.5, bulletCount: 1, spread: 0,
    barrelColor: "#0c0a09", bulletColor: "#ffffff", badge: "🔭",
    statFireRate: 1, statDamage: 10, statRange: 10,
  },
  {
    id: "plasma", name: "Plasma Cannon",
    description: "High damage with auto-shield. Powered by arcane energy.",
    cost: 420, tier: "epic",
    fireRate: 0.45, damage: 50, bulletSpeed: 24, range: 2.8, bulletCount: 1, spread: 0,
    autoPowerUp: "shield",
    barrelColor: "#1e3a5f", bulletColor: "#60a5fa", badge: "🔵",
    statFireRate: 5, statDamage: 8, statRange: 6,
  },
  {
    id: "rapidstrike", name: "Rapid Strike",
    description: "Auto rapid-fire mode. Suppression specialist.",
    cost: 350, tier: "epic",
    fireRate: 0.09, damage: 11, bulletSpeed: 24, range: 1.8, bulletCount: 1, spread: 0,
    autoPowerUp: "rapidfire",
    barrelColor: "#431407", bulletColor: "#f97316", badge: "🔥",
    statFireRate: 10, statDamage: 2, statRange: 4,
  },
  {
    id: "trident", name: "Trident",
    description: "3 bullets in a wide spread. No target gets through.",
    cost: 520, tier: "legendary",
    fireRate: 0.32, damage: 32, bulletSpeed: 22, range: 2.2, bulletCount: 3, spread: 18,
    barrelColor: "#14532d", bulletColor: "#4ade80", badge: "🔱",
    statFireRate: 6, statDamage: 8, statRange: 5,
  },
  {
    id: "minigun", name: "Minigun",
    description: "Unstoppable torrent of fire. Auto speed-boost included.",
    cost: 800, tier: "legendary",
    fireRate: 0.07, damage: 15, bulletSpeed: 26, range: 2.0, bulletCount: 1, spread: 3,
    autoPowerUp: "speed",
    barrelColor: "#1a1a1a", bulletColor: "#facc15", badge: "💫",
    statFireRate: 10, statDamage: 4, statRange: 4,
  },
  {
    id: "lifeline", name: "Lifeline",
    description: "A steadfast weapon with one extra miracle — you get a second chance.",
    cost: 700, tier: "legendary",
    fireRate: 0.18, damage: 30, bulletSpeed: 26, range: 2.8, bulletCount: 1, spread: 0,
    perk: "secondLife",
    perkDesc: "💖 Revive once on death with 50% HP",
    barrelColor: "#134e4a", bulletColor: "#5eead4", badge: "💖",
    statFireRate: 7, statDamage: 6, statRange: 6,
  },
];

export const GUN_TIER_COLORS: Record<GunTier, string> = {
  basic:    "#94a3b8",
  rare:     "#3b82f6",
  epic:     "#a855f7",
  legendary:"#f59e0b",
};

export function getGun(id: string): GunDef {
  return GUNS.find((g) => g.id === id) ?? GUNS[0];
}
