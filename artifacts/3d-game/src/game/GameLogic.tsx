import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy, EnemyType, Bullet, PowerUpType } from "./store";
import { ARENA_HALF, obstacles } from "./Arena";
import {
  playEnemyHit, playEnemyDeath, playPlayerHit,
  playPowerUp, playGameOver, playWaveStart, playZoneDamage,
} from "./sounds";

// ─── Enemy definitions (base values — scaled per wave) ────────────────────────
const ENEMY_DEFS: Record<EnemyType, {
  hp: number; speed: number; damage: number; alertRadius: number;
}> = {
  chaser:  { hp: 30,  speed: 5.0, damage: 10, alertRadius: 30 },
  tank:    { hp: 150, speed: 2.0, damage: 20, alertRadius: 20 },
  ranged:  { hp: 50,  speed: 2.8, damage: 14, alertRadius: 35 },
  speeder: { hp: 20,  speed: 9.0, damage: 8,  alertRadius: 40 },
  bomber:  { hp: 90,  speed: 2.5, damage: 25, alertRadius: 25 },
};

const KILL_SCORES: Record<EnemyType, number> = {
  chaser: 0, tank: 0, ranged: 0, speeder: 0, bomber: 0,
};

// Power-up durations in seconds
const POWERUP_DURATION: Record<PowerUpType, number> = {
  speed: 8, shield: 5, rapidfire: 10, heal: 0,
};

const SAFE_ZONE_START = 23;
const SAFE_ZONE_MIN   = 6;
const ZONE_DAMAGE_PER_SEC = 20;
const WAVE_DURATION   = 20; // seconds between new waves

let bulletId = 0;
let puId     = 0;

function randomArenaPos(safeRadius: number): THREE.Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const r     = Math.random() * safeRadius * 0.7;
  return new THREE.Vector3(Math.cos(angle) * r, 0.5, Math.sin(angle) * r);
}

function spawnPos(): THREE.Vector3 {
  const side = Math.floor(Math.random() * 4);
  const h = ARENA_HALF;
  switch (side) {
    case 0: return new THREE.Vector3((Math.random() * 2 - 1) * h, 0.7, -h);
    case 1: return new THREE.Vector3((Math.random() * 2 - 1) * h, 0.7,  h);
    case 2: return new THREE.Vector3(-h, 0.7, (Math.random() * 2 - 1) * h);
    default:return new THREE.Vector3( h, 0.7, (Math.random() * 2 - 1) * h);
  }
}

function pickType(wave: number, idx: number): EnemyType {
  const r = Math.random();
  // Early waves: chasers only. Later: full mix.
  if (wave === 1) return "chaser";
  if (wave === 2) return r < 0.7 ? "chaser" : "ranged";
  if (wave === 3) return r < 0.5 ? "chaser" : r < 0.8 ? "ranged" : "tank";
  if (wave === 4) return r < 0.3 ? "chaser" : r < 0.5 ? "ranged" : r < 0.7 ? "tank" : "speeder";
  // Wave 5+
  if (r < 0.25)      return "chaser";
  if (r < 0.45)      return "ranged";
  if (r < 0.60)      return "tank";
  if (r < 0.78)      return "speeder";
  return "bomber";
}

function buildWave(wave: number): Enemy[] {
  const count = 4 + wave * 2;
  const speedMult = Math.min(2.5, 1 + (wave - 1) * 0.12);
  return Array.from({ length: count }, (_, i) => {
    const type = pickType(wave, i);
    const def  = ENEMY_DEFS[type];
    const hpScale = 1 + (wave - 1) * 0.15;
    return {
      id: `e_w${wave}_${i}_${Date.now()}_${Math.random()}`,
      position: spawnPos(),
      hp:       def.hp * hpScale,
      maxHp:    def.hp * hpScale,
      type,
      speed:    def.speed * speedMult,
      baseDamage: def.damage,
      lastShot:        0,
      lastDamageTime: -99,
      alertRadius:     def.alertRadius,
      zigzagPhase:     Math.random() * Math.PI * 2,
    } as Enemy;
  });
}

function bulletHitsObstacle(pos: THREE.Vector3): boolean {
  for (const obs of obstacles) {
    if (
      Math.abs(pos.x - obs.x) < obs.w / 2 + 0.15 &&
      Math.abs(pos.z - obs.z) < obs.d / 2 + 0.15 &&
      pos.y < obs.h
    ) return true;
  }
  return false;
}

export default function GameLogic() {
  const gameTimeRef   = useRef(0);
  const waveTimerRef  = useRef(WAVE_DURATION);
  const puTimerRef    = useRef(15); // first power-up at 15s
  const waveLockedRef = useRef(false);
  const zoneSoundRef  = useRef(0);

  // Seed wave 1 on mount
  useEffect(() => {
    const s = useGameStore.getState();
    s.setWave(1);
    s.setEnemies(buildWave(1));
    s.setBullets([]);
    s.setPowerUpItems([]);
    s.setActivePowerUps([]);
    s.setSafeZoneRadius(SAFE_ZONE_START);
    s.setTimeSurvived(0);
    s.setKillCount(0);
    gameTimeRef.current  = 0;
    waveTimerRef.current = WAVE_DURATION;
    puTimerRef.current   = 15;
    waveLockedRef.current = false;
  }, []);

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (s.phase !== "playing") return;

    gameTimeRef.current  += delta;
    waveTimerRef.current -= delta;
    puTimerRef.current   -= delta;
    zoneSoundRef.current -= delta;

    const now       = gameTimeRef.current;
    const wave      = s.wave;
    const playerPos = s.playerPosition;
    const playerVel = s.playerVelocity;

    const enemies     : Enemy[]  = Array.isArray(s.enemies)      ? s.enemies      : [];
    const bullets     : Bullet[] = Array.isArray(s.bullets)      ? s.bullets      : [];
    const puItems                = Array.isArray(s.powerUpItems)  ? s.powerUpItems  : [];
    const activePUs              = Array.isArray(s.activePowerUps)? s.activePowerUps: [];

    // ── Time & high score ──────────────────────────────────────────────────────
    const newTime = s.timeSurvived + delta;

    // ── Safe zone shrink ───────────────────────────────────────────────────────
    const shrinkRate = 0.018 + (wave - 1) * 0.007;
    const newZone    = Math.max(SAFE_ZONE_MIN, s.safeZoneRadius - shrinkRate * delta);

    // Outside zone damage
    const playerDist = Math.sqrt(playerPos.x ** 2 + playerPos.z ** 2);
    let zoneDmg = 0;
    if (playerDist > newZone) {
      zoneDmg = ZONE_DAMAGE_PER_SEC * delta;
      if (zoneSoundRef.current <= 0) {
        playZoneDamage();
        zoneSoundRef.current = 0.8;
      }
    }

    // ── Active power-up timer ──────────────────────────────────────────────────
    const updatedActivePUs = activePUs
      .map((p) => ({ ...p, timeLeft: p.timeLeft - delta }))
      .filter((p) => p.timeLeft > 0);

    // ── Power-up spawn ─────────────────────────────────────────────────────────
    let updatedPuItems = puItems.map((p) => ({ ...p, lifetime: p.lifetime - delta })).filter((p) => p.lifetime > 0);
    if (puTimerRef.current <= 0) {
      const types: PowerUpType[] = ["speed", "shield", "rapidfire", "heal"];
      const weights = [0.3, 0.25, 0.25, 0.2];
      let r = Math.random();
      let chosenType: PowerUpType = "speed";
      for (let i = 0; i < types.length; i++) {
        r -= weights[i];
        if (r <= 0) { chosenType = types[i]; break; }
      }
      updatedPuItems.push({
        id:       `pu_${++puId}`,
        position: randomArenaPos(newZone),
        type:     chosenType,
        lifetime: 12,
      });
      puTimerRef.current = Math.max(10, 20 - wave);
    }

    // ── Power-up pickup ────────────────────────────────────────────────────────
    const remainingPUs: typeof updatedPuItems = [];
    for (const pu of updatedPuItems) {
      const dist = Math.sqrt(
        (pu.position.x - playerPos.x) ** 2 + (pu.position.z - playerPos.z) ** 2
      );
      if (dist < 1.5) {
        // Apply power-up
        if (pu.type === "heal") {
          s.setPlayerHp(Math.min(s.maxPlayerHp, s.playerHp + 35));
        } else {
          const dur = POWERUP_DURATION[pu.type];
          const existing = updatedActivePUs.find((p) => p.type === pu.type);
          if (existing) {
            existing.timeLeft = Math.max(existing.timeLeft, dur);
          } else {
            updatedActivePUs.push({ type: pu.type, timeLeft: dur, maxTime: dur });
          }
        }
        playPowerUp();
      } else {
        remainingPUs.push(pu);
      }
    }

    // ── Wave spawning ──────────────────────────────────────────────────────────
    const waveExhausted = enemies.length === 0 && now > 3;
    if ((waveTimerRef.current <= 0 || waveExhausted) && !waveLockedRef.current) {
      waveLockedRef.current = true;
      const newWave = wave + 1;
      s.setWave(newWave);
      s.setEnemies([...enemies, ...buildWave(newWave)]);
      waveTimerRef.current = WAVE_DURATION;
      playWaveStart();
      setTimeout(() => { waveLockedRef.current = false; }, 200);
      return;
    }

    // ── Bullet → enemy damage map ──────────────────────────────────────────────
    const damageMap  = new Map<string, number>();
    const bulletHits = new Set<string>();

    for (const b of bullets) {
      if (!b.fromPlayer) continue;
      for (const e of enemies) {
        const hitR = e.type === "tank" ? 1.4 : e.type === "bomber" ? 1.2 : 0.85;
        if (b.position.distanceTo(e.position) < hitR) {
          damageMap.set(e.id, (damageMap.get(e.id) ?? 0) + b.damage);
          bulletHits.add(b.id);
        }
      }
    }

    // ── Update enemies ─────────────────────────────────────────────────────────
    let contactDmg = 0;
    let kills = 0;
    const updatedEnemies: Enemy[] = [];
    const newEnemyBullets: Bullet[] = [];

    const hasShield = updatedActivePUs.some((p) => p.type === "shield");

    for (let i = 0; i < enemies.length; i++) {
      const e  = enemies[i];
      const hp = e.hp - (damageMap.get(e.id) ?? 0);

      if (hp <= 0) {
        // Bomber: AoE explosion
        if (e.type === "bomber") {
          const d = e.position.distanceTo(playerPos);
          if (d < 5) contactDmg += e.baseDamage * (1 - d / 5);
        }
        playEnemyDeath(e.type);
        kills++;
        continue;
      }

      if (damageMap.has(e.id)) playEnemyHit();

      const pos = e.position.clone();
      let lastShot       = e.lastShot;
      let lastDamageTime = e.lastDamageTime;

      const dx = playerPos.x - pos.x;
      const dz = playerPos.z - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < e.alertRadius) {
        // Predictive aim: estimate where player will be
        const predFactor = Math.min(0.5, dist / e.speed * 0.4);
        const predX = playerPos.x + playerVel.x * predFactor;
        const predZ = playerPos.z + playerVel.z * predFactor;
        const pdx   = predX - pos.x;
        const pdz   = predZ - pos.z;
        const pdist = Math.sqrt(pdx * pdx + pdz * pdz) || dist;

        let moveX = 0, moveZ = 0;

        if (e.type === "ranged") {
          const pref = 9;
          if (dist > pref + 2) { moveX = pdx / pdist; moveZ = pdz / pdist; }
          else if (dist < pref - 2) { moveX = -dx / dist; moveZ = -dz / dist; }
          else { moveX = dz / dist; moveZ = -dx / dist; }  // strafe
        } else if (e.type === "speeder") {
          // Fast zigzag toward predicted position
          moveX = pdx / pdist;
          moveZ = pdz / pdist;
          const zz = Math.sin(now * 5 + e.zigzagPhase);
          moveX += (-dz / dist) * zz * 0.5;
          moveZ += ( dx / dist) * zz * 0.5;
        } else if (e.type === "bomber") {
          // Bomber drifts toward player, slightly erratic
          moveX = pdx / pdist + Math.sin(now * 2 + e.zigzagPhase) * 0.2;
          moveZ = pdz / pdist + Math.cos(now * 2 + e.zigzagPhase) * 0.2;
        } else {
          // Chaser / tank: straight to predicted pos
          if (pdist > 0.5) { moveX = pdx / pdist; moveZ = pdz / pdist; }
        }

        // Separation
        for (let j = 0; j < enemies.length; j++) {
          if (j === i) continue;
          const o = enemies[j];
          const sx = pos.x - o.position.x;
          const sz = pos.z - o.position.z;
          const sd = Math.sqrt(sx * sx + sz * sz);
          const md = e.type === "tank" ? 1.8 : 1.3;
          if (sd < md && sd > 0.001) {
            const push = (md - sd) / sd;
            moveX += sx * push * 0.5;
            moveZ += sz * push * 0.5;
          }
        }

        const ml = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (ml > 0) {
          pos.x += (moveX / ml) * e.speed * delta;
          pos.z += (moveZ / ml) * e.speed * delta;
        }

        // Obstacle collision
        for (const obs of obstacles) {
          const hw = obs.w / 2 + 0.8;
          const hd = obs.d / 2 + 0.8;
          const odx = pos.x - obs.x;
          const odz = pos.z - obs.z;
          if (Math.abs(odx) < hw && Math.abs(odz) < hd) {
            Math.abs(odx) / hw < Math.abs(odz) / hd
              ? (pos.x = obs.x + Math.sign(odx) * hw)
              : (pos.z = obs.z + Math.sign(odz) * hd);
          }
        }

        pos.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, pos.x));
        pos.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, pos.z));

        // Ranged: shoot at predicted player position
        if (e.type === "ranged" && dist > 2 && now - lastShot > Math.max(1.2, 2.5 - wave * 0.15)) {
          newEnemyBullets.push({
            id:        `eb_${++bulletId}`,
            position:  new THREE.Vector3(pos.x + pdx / pdist, 0.8, pos.z + pdz / pdist),
            direction: new THREE.Vector3(pdx / pdist, 0, pdz / pdist),
            speed:     9,
            fromPlayer: false,
            damage:    e.baseDamage,
            lifetime:  5,
          });
          lastShot = now;
        }

        // Contact damage (chaser, tank, speeder, bomber)
        if (e.type !== "ranged" && dist < 1.1 && now - lastDamageTime > 0.5) {
          contactDmg += e.baseDamage * 0.5;
          lastDamageTime = now;
        }
      }

      updatedEnemies.push({ ...e, position: pos, hp, lastShot, lastDamageTime });
    }

    // ── Update bullets ─────────────────────────────────────────────────────────
    let bulletDmg = 0;
    const movedBullets: Bullet[] = [];

    for (const b of bullets) {
      if (bulletHits.has(b.id)) continue;

      const np    = b.position.clone().addScaledVector(b.direction, b.speed * delta);
      const life  = b.lifetime - delta;
      if (life <= 0) continue;
      if (Math.abs(np.x) > ARENA_HALF + 1.5 || Math.abs(np.z) > ARENA_HALF + 1.5) continue;
      if (bulletHitsObstacle(np)) continue;

      if (!b.fromPlayer) {
        const d = np.distanceTo(playerPos);
        if (d < 0.75) { bulletDmg += b.damage; continue; }
      }
      movedBullets.push({ ...b, position: np, lifetime: life });
    }

    for (const b of newEnemyBullets) {
      const np   = b.position.clone().addScaledVector(b.direction, b.speed * delta);
      const life = b.lifetime - delta;
      if (life <= 0) continue;
      if (bulletHitsObstacle(np)) continue;
      const d = np.distanceTo(playerPos);
      if (d < 0.75) { bulletDmg += b.damage; continue; }
      movedBullets.push({ ...b, position: np, lifetime: life });
    }

    // ── Apply damage to player ─────────────────────────────────────────────────
    const totalDmg = hasShield ? zoneDmg * 0.3 : (contactDmg + bulletDmg + zoneDmg);
    const newHp    = Math.max(0, Math.min(s.maxPlayerHp, s.playerHp - totalDmg));

    if (totalDmg > 0.5 && !hasShield) playPlayerHit();

    // ── Commit state ───────────────────────────────────────────────────────────
    s.setTimeSurvived(newTime);
    s.setSafeZoneRadius(newZone);
    s.setEnemies(updatedEnemies);
    s.setBullets(movedBullets);
    s.setPowerUpItems(remainingPUs);
    s.setActivePowerUps(updatedActivePUs);
    if (kills > 0) s.setKillCount(s.killCount + kills);

    if (newHp !== s.playerHp) {
      s.setPlayerHp(newHp);
      if (newHp <= 0) {
        playGameOver();
        s.finishGame();
      }
    }
  });

  return null;
}
