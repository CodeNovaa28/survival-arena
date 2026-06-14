export type MeleeTier = "basic" | "rare" | "epic" | "legendary";

export interface MeleeWeapon {
  id: string;
  name: string;
  description: string;
  cost: number;
  tier: MeleeTier;
  damage: number;
  range: number;      // meters
  cooldown: number;   // seconds
  aoe: boolean;       // true = 360° circle, false = front arc
  swingArc: number;   // degrees (used when aoe=false)
  badge: string;
  color: string;
  chainsaw?: boolean; // hold-F mode
}

export const MELEE_WEAPONS: MeleeWeapon[] = [
  {
    id: "fists", name: "Fists",
    description: "No weapon? Use your hands. Better than nothing.",
    cost: 0, tier: "basic",
    damage: 25, range: 1.4, cooldown: 0.50, aoe: false, swingArc: 130,
    badge: "✊", color: "#f97316",
  },
  {
    id: "baton", name: "Iron Baton",
    description: "A heavy police baton. Free, fast, and hits harder than bare fists.",
    cost: 0, tier: "basic",
    damage: 42, range: 1.7, cooldown: 0.38, aoe: false, swingArc: 110,
    badge: "🏑", color: "#94a3b8",
  },
  {
    id: "knife", name: "Combat Knife",
    description: "Fast, silent, deadly. Strike before they can react.",
    cost: 120, tier: "basic",
    damage: 48, range: 1.6, cooldown: 0.30, aoe: false, swingArc: 100,
    badge: "🔪", color: "#94a3b8",
  },
  {
    id: "bat", name: "Baseball Bat",
    description: "Classic crowd control. Sends them flying sideways.",
    cost: 200, tier: "rare",
    damage: 80, range: 2.0, cooldown: 0.75, aoe: false, swingArc: 155,
    badge: "🏏", color: "#b45309",
  },
  {
    id: "katana", name: "Katana",
    description: "One fluid motion — precise, fast, and lethal.",
    cost: 380, tier: "epic",
    damage: 100, range: 2.6, cooldown: 0.62, aoe: false, swingArc: 175,
    badge: "⚔️", color: "#6366f1",
  },
  {
    id: "hammer", name: "War Hammer",
    description: "Slow but devastating. Crushes everything in a full circle.",
    cost: 550, tier: "epic",
    damage: 190, range: 2.4, cooldown: 2.00, aoe: true, swingArc: 360,
    badge: "🔨", color: "#b45309",
  },
  {
    id: "chainsaw", name: "Chainsaw",
    description: "Hold F to shred. Relentless sustained damage up close.",
    cost: 700, tier: "legendary",
    damage: 35, range: 1.8, cooldown: 0.13, aoe: false, swingArc: 120,
    badge: "⚡", color: "#ef4444", chainsaw: true,
  },
  {
    id: "plasma_blade", name: "Plasma Blade",
    description: "Energy arc vaporizes a full ring of enemies. Legendary.",
    cost: 950, tier: "legendary",
    damage: 135, range: 3.2, cooldown: 0.80, aoe: true, swingArc: 360,
    badge: "💜", color: "#a855f7",
  },
];

export const MELEE_TIER_COLORS: Record<MeleeTier, string> = {
  basic:    "#94a3b8",
  rare:     "#3b82f6",
  epic:     "#a855f7",
  legendary:"#f59e0b",
};

export function getMeleeWeapon(id: string): MeleeWeapon {
  return MELEE_WEAPONS.find((m) => m.id === id) ?? MELEE_WEAPONS[0];
}
