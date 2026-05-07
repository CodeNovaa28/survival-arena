import React, { useState } from "react";
import { useGameStore } from "./store";
import { CHARACTER_SKINS, TIER_COLORS } from "./gameSkins";
import { GUNS, GUN_TIER_COLORS } from "./gameGuns";
import { MAPS } from "./gameMaps";
import { MELEE_WEAPONS, MELEE_TIER_COLORS } from "./gameMeleeWeapons";
import { playPurchase } from "./sounds";

type Tab = "character" | "guns" | "maps" | "melee";

export default function CustomizationHub() {
  const [tab, setTab] = useState<Tab>("character");
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 20%, #0a1628 0%, #020508 100%)",
      fontFamily: "'Courier New', monospace",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px", display: "flex",
        alignItems: "center", gap: 20, flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.4)",
      }}>
        <button
          onClick={() => setPhase("start")}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: "#94a3b8", borderRadius: 8, padding: "8px 16px",
            cursor: "pointer", fontSize: 13, fontFamily: "'Courier New', monospace",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
        >← BACK</button>

        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>CUSTOMIZE</div>
        </div>

        {/* Coin display */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 20 }}>🪙</span>
          <span style={{ fontSize: 20, fontWeight: "bold", color: "#f59e0b" }}>
            {useGameStore.getState().coins}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", padding: "14px 28px 0",
        gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.2)", flexShrink: 0,
      }}>
        {([
          { id: "character", label: "👤 CHARACTER" },
          { id: "guns",      label: "🔫 WEAPONS"   },
          { id: "melee",     label: "⚔️ MELEE"      },
          { id: "maps",      label: "🗺️ MAPS"        },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              background: tab === id ? "rgba(59,130,246,0.2)" : "transparent",
              border:  tab === id ? "1px solid rgba(59,130,246,0.5)" : "1px solid transparent",
              color:   tab === id ? "#93c5fd" : "#555",
              borderRadius: "8px 8px 0 0", padding: "10px 22px",
              cursor: "pointer", fontSize: 12, letterSpacing: 2,
              fontFamily: "'Courier New', monospace", fontWeight: "bold",
              borderBottom: "none", transition: "all 0.15s",
            }}
          >{label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {tab === "character" && <CharacterTab />}
        {tab === "guns"      && <GunsTab />}
        {tab === "melee"     && <MeleeTab />}
        {tab === "maps"      && <MapsTab />}
      </div>

      <style>{`
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ─── Character tab ─────────────────────────────────────────────────────────────
function CharacterTab() {
  const coins                = useGameStore((s) => s.coins);
  const ownedSkins           = useGameStore((s) => s.ownedSkins);
  const selectedSkin         = useGameStore((s) => s.selectedSkin);
  const highestCompletedLevel= useGameStore((s) => s.highestCompletedLevel);
  const purchaseSkin         = useGameStore((s) => s.purchaseSkin);
  const selectSkin           = useGameStore((s) => s.selectSkin);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
      {CHARACTER_SKINS.map((skin) => {
        const owned    = ownedSkins.includes(skin.id);
        const selected = selectedSkin === skin.id;
        const lvlReq   = skin.levelRequirement ?? 0;
        const lvlMet   = highestCompletedLevel >= lvlReq;
        const canBuy   = coins >= skin.cost && !owned && (lvlReq === 0 || lvlMet);
        const tierColor= TIER_COLORS[skin.tier];

        return (
          <div
            key={skin.id}
            style={{
              background: selected ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
              border: selected
                ? "2px solid rgba(59,130,246,0.6)"
                : `1px solid ${tierColor}30`,
              borderRadius: 12, padding: "18px 16px",
              transition: "all 0.18s", position: "relative",
            }}
          >
            {/* Tier badge */}
            <div style={{
              position: "absolute", top: 10, right: 12,
              fontSize: 10, color: tierColor, letterSpacing: 1, fontWeight: "bold",
            }}>
              {skin.tier.toUpperCase()}
            </div>

            {/* Preview */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ position: "relative", width: 44, height: 70 }}>
                {/* Body */}
                <div style={{
                  position: "absolute", bottom: 16, left: 6, right: 6, height: 30,
                  background: skin.bodyColor, borderRadius: 3,
                }} />
                {/* Head */}
                <div style={{
                  position: "absolute", top: 0, left: 10, right: 10, height: 18,
                  background: skin.headColor, borderRadius: 3,
                }} />
                {/* Accent stripe */}
                <div style={{
                  position: "absolute", top: 20, left: 7, right: 7, height: 8,
                  background: skin.accentColor, borderRadius: 2, opacity: 0.7,
                }} />
                {/* Legs */}
                <div style={{
                  position: "absolute", bottom: 0, left: 5, width: 13, height: 16,
                  background: skin.legColor, borderRadius: 2,
                }} />
                <div style={{
                  position: "absolute", bottom: 0, right: 5, width: 13, height: 16,
                  background: skin.legColor, borderRadius: 2,
                }} />
              </div>
            </div>

            {/* Info */}
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#fff", marginBottom: 3 }}>
              {skin.badge} {skin.name}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 8, lineHeight: 1.4 }}>
              {skin.description}
            </div>

            {/* Perk badge */}
            {skin.perkDesc && (
              <div style={{
                fontSize: 10, color: "#22c55e", background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)", borderRadius: 4,
                padding: "3px 8px", marginBottom: 8,
              }}>
                {skin.perkDesc}
              </div>
            )}

            {/* Level requirement */}
            {lvlReq > 0 && (
              <div style={{
                fontSize: 10, color: lvlMet ? "#f59e0b" : "#555",
                marginBottom: 10, display: "flex", alignItems: "center", gap: 4,
              }}>
                {lvlMet ? "⭐" : "🔒"} Unlocks after completing Level {lvlReq}
                {!lvlMet && <span style={{ color: "#333" }}> (you: {highestCompletedLevel})</span>}
              </div>
            )}

            {/* Action */}
            {selected ? (
              <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: "bold", letterSpacing: 1 }}>
                ✓ EQUIPPED
              </div>
            ) : owned ? (
              <button
                onClick={() => { selectSkin(skin.id); playPurchase(); }}
                style={shopBtnStyle("#1e3a5f", "#60a5fa")}
              >SELECT</button>
            ) : lvlReq > 0 && !lvlMet ? (
              <div style={{ fontSize: 11, color: "#444" }}>🔒 Complete Level {lvlReq} first</div>
            ) : skin.cost === 0 ? (
              <button
                onClick={() => { purchaseSkin(skin.id, 0); selectSkin(skin.id); }}
                style={shopBtnStyle("#14532d", "#22c55e")}
              >UNLOCK FREE</button>
            ) : canBuy ? (
              <button
                onClick={() => { if (purchaseSkin(skin.id, skin.cost)) { selectSkin(skin.id); playPurchase(); } }}
                style={shopBtnStyle("#78350f", "#f59e0b")}
              >🪙 {skin.cost}</button>
            ) : (
              <div style={{ fontSize: 11, color: "#555" }}>
                🪙 {skin.cost} <span style={{ color: "#333" }}>· Need {skin.cost - coins} more</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Guns tab ──────────────────────────────────────────────────────────────────
function GunsTab() {
  const coins       = useGameStore((s) => s.coins);
  const ownedGuns   = useGameStore((s) => s.ownedGuns);
  const selectedGun = useGameStore((s) => s.selectedGun);
  const purchaseGun = useGameStore((s) => s.purchaseGun);
  const selectGun   = useGameStore((s) => s.selectGun);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
      {GUNS.map((gun) => {
        const owned     = ownedGuns.includes(gun.id);
        const selected  = selectedGun === gun.id;
        const canBuy    = coins >= gun.cost && !owned;
        const tierColor = GUN_TIER_COLORS[gun.tier];

        return (
          <div
            key={gun.id}
            style={{
              background: selected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
              border: selected
                ? "2px solid rgba(59,130,246,0.6)"
                : `1px solid ${tierColor}28`,
              borderRadius: 12, padding: "18px 16px",
              transition: "all 0.18s",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 22 }}>{gun.badge}</div>
              <div style={{ fontSize: 10, color: tierColor, letterSpacing: 1, fontWeight: "bold" }}>
                {gun.tier.toUpperCase()}
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: "bold", color: "#fff", marginBottom: 4 }}>
              {gun.name}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 12, lineHeight: 1.4 }}>
              {gun.description}
            </div>
            {gun.autoPowerUp && (
              <div style={{
                fontSize: 10, color: "#a855f7", background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.3)", borderRadius: 4,
                padding: "3px 8px", marginBottom: 8, display: "inline-block",
              }}>
                AUTO: {gun.autoPowerUp.toUpperCase()}
              </div>
            )}
            {gun.perkDesc && (
              <div style={{
                fontSize: 10, color: "#22c55e", background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)", borderRadius: 4,
                padding: "3px 8px", marginBottom: 8, display: "block",
              }}>
                {gun.perkDesc}
              </div>
            )}

            {/* Stat bars */}
            <div style={{ marginBottom: 12 }}>
              <StatBar label="FIRE RATE" value={gun.statFireRate} color="#ef4444" />
              <StatBar label="DAMAGE"   value={gun.statDamage}   color="#f97316" />
              <StatBar label="RANGE"    value={gun.statRange}    color="#3b82f6" />
              {gun.bulletCount > 1 && (
                <div style={{ fontSize: 10, color: "#a855f7", marginTop: 4 }}>
                  ✦ {gun.bulletCount}-BULLET SPREAD
                </div>
              )}
            </div>

            {/* Action */}
            {selected ? (
              <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: "bold", letterSpacing: 1 }}>✓ EQUIPPED</div>
            ) : owned ? (
              <button onClick={() => { selectGun(gun.id); playPurchase(); }} style={shopBtnStyle("#1e3a5f", "#60a5fa")}>
                SELECT
              </button>
            ) : canBuy ? (
              <button
                onClick={() => { if (purchaseGun(gun.id, gun.cost)) { selectGun(gun.id); playPurchase(); } }}
                style={shopBtnStyle("#78350f", "#f59e0b")}
              >🪙 {gun.cost}</button>
            ) : (
              <div style={{ fontSize: 11, color: "#555" }}>
                🪙 {gun.cost} <span style={{ color: "#333" }}>· Need {gun.cost - coins} more</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Maps tab ─────────────────────────────────────────────────────────────────
function MapsTab() {
  const coins          = useGameStore((s) => s.coins);
  const ownedMaps      = useGameStore((s) => s.ownedMaps);
  const selectedMap    = useGameStore((s) => s.selectedMap);
  const totalKills     = useGameStore((s) => s.totalKillsByType);
  const purchaseMap    = useGameStore((s) => s.purchaseMap);
  const selectMap      = useGameStore((s) => s.selectMap);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
      {MAPS.map((map) => {
        const owned    = ownedMaps.includes(map.id);
        const selected = selectedMap === map.id;
        let   unlocked = owned;
        let   progress = "";

        if (!owned && map.unlockType === "coins") {
          const canBuy = coins >= (map.coinCost ?? 0);
          progress = canBuy ? "Can buy" : `Need ${(map.coinCost ?? 0) - coins} more coins`;
        }
        if (!owned && map.unlockType === "kills" && map.killRequirement) {
          const killed = totalKills[map.killRequirement.type] ?? 0;
          const need   = map.killRequirement.count;
          unlocked = killed >= need;
          progress = `${Math.min(killed, need)}/${need} ${map.killRequirement.type} kills`;
          if (unlocked && !owned) {
            purchaseMap(map.id, 0);
          }
        }

        return (
          <div
            key={map.id}
            style={{
              background: selected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
              border: selected
                ? "2px solid rgba(59,130,246,0.6)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "18px 16px",
              transition: "all 0.18s",
            }}
          >
            {/* Preview block */}
            <div style={{
              height: 48, borderRadius: 8, marginBottom: 12,
              background: `linear-gradient(135deg, ${map.theme.groundColor} 0%, ${map.theme.obstacleColor} 100%)`,
              border: `1px solid ${map.theme.obstacleAccent}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>
              {map.badge}
            </div>

            <div style={{ fontSize: 15, fontWeight: "bold", color: "#fff", marginBottom: 4 }}>
              {map.name}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 10, lineHeight: 1.4 }}>
              {map.description}
            </div>

            {/* Unlock info */}
            <div style={{
              fontSize: 10, color: "#666", marginBottom: 12,
              background: "rgba(255,255,255,0.03)", borderRadius: 6,
              padding: "6px 8px",
            }}>
              {map.unlockType === "free" && "✅ Free to play"}
              {map.unlockType === "coins" && (
                <span>🪙 {map.coinCost} coins {progress && `· ${progress}`}</span>
              )}
              {map.unlockType === "kills" && map.killRequirement && (
                <span>⚔️ {progress}</span>
              )}
            </div>

            {/* Action */}
            {selected ? (
              <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: "bold" }}>✓ SELECTED</div>
            ) : (owned || unlocked) ? (
              <button onClick={() => { purchaseMap(map.id, 0); selectMap(map.id); playPurchase(); }} style={shopBtnStyle("#1e3a5f", "#60a5fa")}>
                SELECT
              </button>
            ) : map.unlockType === "coins" && coins >= (map.coinCost ?? 0) ? (
              <button
                onClick={() => { if (purchaseMap(map.id, map.coinCost ?? 0)) { selectMap(map.id); playPurchase(); } }}
                style={shopBtnStyle("#78350f", "#f59e0b")}
              >🪙 {map.coinCost}</button>
            ) : (
              <div style={{ fontSize: 11, color: "#444" }}>🔒 Locked</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Melee tab ────────────────────────────────────────────────────────────────
function MeleeTab() {
  const coins         = useGameStore((s) => s.coins);
  const ownedMelees   = useGameStore((s) => s.ownedMelees);
  const selectedMelee = useGameStore((s) => s.selectedMelee);
  const purchaseMelee = useGameStore((s) => s.purchaseMelee);
  const selectMelee   = useGameStore((s) => s.selectMelee);

  return (
    <>
      {/* Hint row */}
      <div style={{
        background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.2)",
        borderRadius: 10, padding: "10px 16px", marginBottom: 18,
        display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#fb923c",
      }}>
        <span style={{ fontSize: 18 }}>⚔️</span>
        <span>Press <strong>F</strong> to swing your melee weapon in combat.
          Chainsaw: hold F. Critical hits (15% chance) deal 2× damage.
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {MELEE_WEAPONS.map((weapon) => {
          const owned     = ownedMelees.includes(weapon.id);
          const selected  = selectedMelee === weapon.id;
          const canBuy    = coins >= weapon.cost && !owned;
          const tierColor = MELEE_TIER_COLORS[weapon.tier];

          // Range bar (0-3.5m → 0-10)
          const statRange   = Math.round((weapon.range / 3.5) * 10);
          // Damage bar (25-190 → 1-10)
          const statDamage  = Math.round(((weapon.damage - 25) / 165) * 9) + 1;
          // Speed (cooldown inverted: 0.13=10, 2.0=1)
          const statSpeed   = Math.round(((2.0 - weapon.cooldown) / 1.87) * 9) + 1;

          return (
            <div
              key={weapon.id}
              style={{
                background: selected ? "rgba(251,146,60,0.1)" : "rgba(255,255,255,0.03)",
                border: selected
                  ? "2px solid rgba(251,146,60,0.6)"
                  : `1px solid ${tierColor}28`,
                borderRadius: 12, padding: "18px 16px",
                transition: "all 0.18s",
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 28 }}>{weapon.badge}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: tierColor, letterSpacing: 1, fontWeight: "bold" }}>
                    {weapon.tier.toUpperCase()}
                  </div>
                  {weapon.aoe && (
                    <div style={{ fontSize: 9, color: "#a855f7", marginTop: 2 }}>360° AoE</div>
                  )}
                  {weapon.chainsaw && (
                    <div style={{ fontSize: 9, color: "#ef4444", marginTop: 2 }}>HOLD F</div>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 15, fontWeight: "bold", color: "#fff", marginBottom: 4 }}>
                {weapon.name}
              </div>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 12, lineHeight: 1.5 }}>
                {weapon.description}
              </div>

              {/* Stat bars */}
              <div style={{ marginBottom: 12 }}>
                <StatBar label="DAMAGE"  value={statDamage}  color="#ef4444" />
                <StatBar label="SPEED"   value={statSpeed}   color="#f97316" />
                <StatBar label="RANGE"   value={statRange}   color="#3b82f6" />
              </div>

              {/* Quick stats row */}
              <div style={{
                display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 9, background: "rgba(239,68,68,0.1)", color: "#f87171", padding: "2px 6px", borderRadius: 4 }}>
                  {weapon.damage} DMG
                </span>
                <span style={{ fontSize: 9, background: "rgba(59,130,246,0.1)", color: "#60a5fa", padding: "2px 6px", borderRadius: 4 }}>
                  {weapon.range}m RANGE
                </span>
                <span style={{ fontSize: 9, background: "rgba(251,146,60,0.1)", color: "#fb923c", padding: "2px 6px", borderRadius: 4 }}>
                  {weapon.cooldown}s CD
                </span>
              </div>

              {/* Action */}
              {selected ? (
                <div style={{ fontSize: 12, color: "#fb923c", fontWeight: "bold", letterSpacing: 1 }}>✓ EQUIPPED</div>
              ) : owned ? (
                <button
                  onClick={() => { selectMelee(weapon.id); playPurchase(); }}
                  style={shopBtnStyle("#1e3a5f", "#60a5fa")}
                >SELECT</button>
              ) : weapon.cost === 0 ? (
                <button
                  onClick={() => { purchaseMelee(weapon.id, 0); selectMelee(weapon.id); playPurchase(); }}
                  style={shopBtnStyle("#14532d", "#22c55e")}
                >UNLOCK FREE</button>
              ) : canBuy ? (
                <button
                  onClick={() => { if (purchaseMelee(weapon.id, weapon.cost)) { selectMelee(weapon.id); playPurchase(); } }}
                  style={shopBtnStyle("#78350f", "#f59e0b")}
                >🪙 {weapon.cost}</button>
              ) : (
                <div style={{ fontSize: 11, color: "#555" }}>
                  🪙 {weapon.cost} <span style={{ color: "#333" }}>· Need {weapon.cost - coins} more</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 9, color: "#444" }}>{value}/10</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${value * 10}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function shopBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, color, border: `1px solid ${color}55`,
    borderRadius: 7, padding: "9px 18px", fontSize: 12,
    fontFamily: "'Courier New', monospace", letterSpacing: 2,
    cursor: "pointer", fontWeight: "bold", transition: "all 0.15s",
    width: "100%",
  };
}
