export type SkinTier = "basic" | "rare" | "epic" | "legendary" | "special";
export type SkinPerk = "secondLife" | "guardian" | null;

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  bodyColor: string;
  headColor: string;
  accentColor: string;
  legColor: string;
  tier: SkinTier;
  badge: string;
  perk?: SkinPerk;
  levelRequirement?: number; // must have completed this level
  perkDesc?: string;         // shown in shop
}

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: "soldier", name: "Soldier",
    description: "Standard-issue combat suit. Reliable and battle-tested.",
    cost: 0, bodyColor: "#2563eb", headColor: "#3b82f6",
    accentColor: "#bfdbfe", legColor: "#1d4ed8", tier: "basic", badge: "🪖",
  },
  {
    id: "shadow", name: "Shadow",
    description: "Dark operative suit for stealth operations.",
    cost: 60, bodyColor: "#1a1a2e", headColor: "#16213e",
    accentColor: "#cbd5e1", legColor: "#0d0d1a", tier: "basic", badge: "🌑",
  },
  {
    id: "neon", name: "Neon Striker",
    description: "Glowing neon combat armor — be seen, be feared.",
    cost: 120, bodyColor: "#7c3aed", headColor: "#8b5cf6",
    accentColor: "#c4b5fd", legColor: "#6d28d9", tier: "rare", badge: "⚡",
  },
  {
    id: "crimson", name: "Crimson Guard",
    description: "Elite red armor worn by veteran warriors.",
    cost: 180, bodyColor: "#991b1b", headColor: "#dc2626",
    accentColor: "#fca5a5", legColor: "#7f1d1d", tier: "rare", badge: "🔴",
  },
  {
    id: "arctic", name: "Arctic Wolf",
    description: "Insulated combat suit built for frozen terrain.",
    cost: 150, bodyColor: "#cbd5e1", headColor: "#f1f5f9",
    accentColor: "#60a5fa", legColor: "#94a3b8", tier: "rare", badge: "❄️",
  },
  {
    id: "toxic", name: "Toxic",
    description: "Hazmat-grade suit. Do not approach without gloves.",
    cost: 200, bodyColor: "#365314", headColor: "#4d7c0f",
    accentColor: "#bef264", legColor: "#1a2e05", tier: "rare", badge: "☢️",
  },
  {
    id: "gold", name: "Gold Commander",
    description: "Prestigious golden armor of champions.",
    cost: 350, bodyColor: "#b45309", headColor: "#d97706",
    accentColor: "#fde68a", legColor: "#92400e", tier: "epic", badge: "👑",
  },
  {
    id: "phantom", name: "Phantom",
    description: "Ethereal armor from beyond the veil.",
    cost: 450, bodyColor: "#312e81", headColor: "#4338ca",
    accentColor: "#c7d2fe", legColor: "#1e1b4b", tier: "epic", badge: "👻",
  },
  {
    id: "inferno", name: "Inferno",
    description: "Forged in volcano fire. Burns to the touch.",
    cost: 500, bodyColor: "#7c2d12", headColor: "#c2410c",
    accentColor: "#fed7aa", legColor: "#431407", tier: "epic", badge: "🔥",
  },
  {
    id: "phoenix", name: "Phoenix",
    description: "Fire-born warrior. Burns, but never dies — once.",
    cost: 800, bodyColor: "#92400e", headColor: "#f97316",
    accentColor: "#fef3c7", legColor: "#7c2d12", tier: "legendary", badge: "🦅",
    perk: "secondLife",
    perkDesc: "💖 Revive once on death with 50% HP",
  },
  {
    id: "commander", name: "War Commander",
    description: "Legendary armor. Worn only by the greatest warriors.",
    cost: 900, bodyColor: "#064e3b", headColor: "#065f46",
    accentColor: "#6ee7b7", legColor: "#022c22", tier: "legendary", badge: "⭐",
  },
  {
    id: "ghost_squad", name: "Ghost Squad",
    description: "Elite ghost unit. You never fight alone.",
    cost: 0, bodyColor: "#1e3a5f", headColor: "#1e40af",
    accentColor: "#93c5fd", legColor: "#1e3a5f", tier: "special", badge: "👥",
    perk: "guardian",
    perkDesc: "⚔️ Spawns 2 permanent AI companions using your gun",
    levelRequirement: 15,
  },
];

export const TIER_COLORS: Record<SkinTier, string> = {
  basic:    "#94a3b8",
  rare:     "#3b82f6",
  epic:     "#a855f7",
  legendary:"#f59e0b",
  special:  "#22c55e",
};
