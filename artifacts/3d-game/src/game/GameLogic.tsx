import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy, EnemyType, Bullet, PowerUpType } from "./store";
import { getObstacles, ARENA_HALF } from "./Arena";
import { getGun } from "./gameGuns";
import { getLevel } from "./gameLevels";
import {
  playEnemyHit, playEnemyDeath, playPlayerHit,
  playPowerUp, playGameOver, playLevelComplete,
  playWaveStart, playZoneDamage,
} from "./sounds";

// ─── Enemy base stats ─────────────────────────────────────────────────────────
const ENEMY_DEFS: Record<EnemyType, { hp:number; speed:number; damage:number; alertRadius:number }> = {
  chaser:  { hp:  30, speed: 5.0, damage: 10, alertRadius: 30 },
  tank:    { hp: 150, speed: 2.0, damage: 20, alertRadius: 20 },
  ranged:  { hp:  50, speed: 2.8, damage: 14, alertRadius: 35 },
  speeder: { hp:  20, speed: 9.0, damage:  8, alertRadius: 40 },
  bomber:  { hp:  90, speed: 2.5, damage: 25, alertRadius: 25 },
};

const COIN_REWARDS: Record<EnemyType, number> = {
  chaser: 3, ranged: 6, speeder: 5, tank: 12, bomber: 10,
};

const POWERUP_DURATION: Record<PowerUpType, number> = {
  speed: 8, shield: 5, rapidfire: 10, heal: 0, drone: 20,
};

const SAFE_ZONE_START = 23;
const SAFE_ZONE_MIN   = 6;
const ZONE_DMG_PER_SEC = 20;
const WAVE_DURATION    = 20;

let bulletId = 0;
let puId     = 0;

function spawnPos(): THREE.Vector3 {
  const side = Math.floor(Math.random() * 4);
  const h = ARENA_HALF;
  switch (side) {
    case 0: return new THREE.Vector3((Math.random()*2-1)*h, 0.7, -h);
    case 1: return new THREE.Vector3((Math.random()*2-1)*h, 0.7,  h);
    case 2: return new THREE.Vector3(-h, 0.7, (Math.random()*2-1)*h);
    default:return new THREE.Vector3( h, 0.7, (Math.random()*2-1)*h);
  }
}

function randomArenaPos(r: number): THREE.Vector3 {
  const a = Math.random() * Math.PI * 2;
  const d = Math.random() * r * 0.65;
  return new THREE.Vector3(Math.cos(a)*d, 0.5, Math.sin(a)*d);
}

// Weighted pick from allowed types
function pickType(allowedTypes: EnemyType[]): EnemyType {
  const W: Record<EnemyType, number> = { chaser:3, ranged:2, speeder:2, tank:1, bomber:1 };
  const pool = allowedTypes.flatMap((t) => Array<EnemyType>(W[t]).fill(t));
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildWaveEndless(wave: number): Enemy[] {
  const all: EnemyType[] = ["chaser","ranged","speeder","tank","bomber"];
  const allowed: EnemyType[] =
    wave === 1 ? ["chaser"] :
    wave === 2 ? ["chaser","ranged"] :
    wave === 3 ? ["chaser","ranged","tank"] :
    wave === 4 ? ["chaser","ranged","tank","speeder"] :
    all;
  const count  = 4 + wave * 2;
  const spMult = Math.min(2.5, 1 + (wave-1) * 0.12);
  const hpMult = 1 + (wave-1) * 0.15;
  return Array.from({ length: count }, (_, i) => {
    const type = pickType(allowed);
    const def  = ENEMY_DEFS[type];
    return {
      id: `e_w${wave}_${i}_${Date.now()}_${Math.random()}`,
      position: spawnPos(),
      hp: def.hp * hpMult, maxHp: def.hp * hpMult,
      type, speed: def.speed * spMult, baseDamage: def.damage,
      lastShot: 0, lastDamageTime: -99,
      alertRadius: def.alertRadius, zigzagPhase: Math.random()*Math.PI*2,
    } as Enemy;
  });
}

function buildWaveLevel(levelId: number, waveNum: number, allowed: EnemyType[], spMult: number, hpMult: number, baseCount: number, perWave: number): Enemy[] {
  const count = baseCount + (waveNum - 1) * perWave;
  return Array.from({ length: count }, (_, i) => {
    const type = pickType(allowed);
    const def  = ENEMY_DEFS[type];
    return {
      id: `e_l${levelId}_w${waveNum}_${i}_${Date.now()}_${Math.random()}`,
      position: spawnPos(),
      hp: def.hp * hpMult, maxHp: def.hp * hpMult,
      type, speed: def.speed * spMult, baseDamage: def.damage,
      lastShot: 0, lastDamageTime: -99,
      alertRadius: def.alertRadius, zigzagPhase: Math.random()*Math.PI*2,
    } as Enemy;
  });
}

function obstacleHit(pos: THREE.Vector3, obsArr: ReturnType<typeof getObstacles>): boolean {
  for (const obs of obsArr) {
    if (
      Math.abs(pos.x - obs.x) < obs.w/2 + 0.15 &&
      Math.abs(pos.z - obs.z) < obs.d/2 + 0.15 &&
      pos.y < obs.h
    ) return true;
  }
  return false;
}

export default function GameLogic() {
  const gameTimeRef    = useRef(0);
  const waveTimerRef   = useRef(WAVE_DURATION);
  const puTimerRef     = useRef(15);
  const waveLockedRef  = useRef(false);
  const zoneSoundRef   = useRef(0);
  const droneTimerRef  = useRef(0);
  const wavesSpawnedRef= useRef(1);
  const levelCompleteRef = useRef(false);
  const obstaclesRef   = useRef(getObstacles("urban"));

  useEffect(() => {
    const s = useGameStore.getState();
    const gameMode  = s.gameMode;
    const levelDef  = gameMode === "levels" ? getLevel(s.currentLevel) : null;
    const gun       = getGun(s.selectedGun);

    obstaclesRef.current = getObstacles(s.selectedMap);

    // Auto power-up from gun
    const initialPUs = gun.autoPowerUp
      ? [{ type: gun.autoPowerUp, timeLeft: 9999, maxTime: 9999 }]
      : [];

    s.setActivePowerUps(initialPUs);
    s.setBullets([]);
    s.setPowerUpItems([]);
    s.setSafeZoneRadius(SAFE_ZONE_START);
    s.setTimeSurvived(0);
    s.setKillCount(0);

    wavesSpawnedRef.current = 1;
    levelCompleteRef.current = false;
    gameTimeRef.current  = 0;
    waveTimerRef.current = WAVE_DURATION;
    puTimerRef.current   = 15;
    droneTimerRef.current= 0;
    waveLockedRef.current= false;

    if (gameMode === "levels" && levelDef) {
      s.setWave(1);
      s.setEnemies(buildWaveLevel(levelDef.id, 1, levelDef.allowedTypes, levelDef.speedMult, levelDef.hpMult, levelDef.baseEnemyCount, levelDef.enemyCountPerWave));
    } else {
      s.setWave(1);
      s.setEnemies(buildWaveEndless(1));
    }
  }, []);

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (s.phase !== "playing" || s.paused || levelCompleteRef.current) return;

    gameTimeRef.current  += delta;
    waveTimerRef.current -= delta;
    puTimerRef.current   -= delta;
    zoneSoundRef.current -= delta;
    droneTimerRef.current-= delta;

    const now       = gameTimeRef.current;
    const wave      = s.wave;
    const playerPos = s.playerPosition;
    const playerVel = s.playerVelocity;
    const gameMode  = s.gameMode;
    const levelDef  = gameMode === "levels" ? getLevel(s.currentLevel) : null;
    const obs       = obstaclesRef.current;

    const enemies      : Enemy[]  = Array.isArray(s.enemies)       ? s.enemies       : [];
    const bullets      : Bullet[] = Array.isArray(s.bullets)       ? s.bullets       : [];
    const puItems                 = Array.isArray(s.powerUpItems)   ? s.powerUpItems  : [];
    const activePUs               = Array.isArray(s.activePowerUps) ? s.activePowerUps: [];

    const newTime = s.timeSurvived + delta;

    // ── Safe zone ──────────────────────────────────────────────────────────
    const shrinkMult = levelDef ? levelDef.safeZoneShrinkMult : 1;
    const shrinkRate = (0.018 + (wave-1) * 0.007) * shrinkMult;
    const newZone    = Math.max(SAFE_ZONE_MIN, s.safeZoneRadius - shrinkRate * delta);

    const playerDist = Math.sqrt(playerPos.x**2 + playerPos.z**2);
    let   zoneDmg    = 0;
    if (playerDist > newZone) {
      zoneDmg = ZONE_DMG_PER_SEC * delta;
      if (zoneSoundRef.current <= 0) { playZoneDamage(); zoneSoundRef.current = 0.8; }
    }

    // ── Active power-ups ───────────────────────────────────────────────────
    const gun = getGun(s.selectedGun);
    const updatedActivePUs = activePUs
      .map((p) => {
        // Auto power-up from gun: keep refreshed
        if (p.type === gun.autoPowerUp) return { ...p, timeLeft: 9999 };
        return { ...p, timeLeft: p.timeLeft - delta };
      })
      .filter((p) => p.timeLeft > 0);

    // Ensure auto power-up always present
    if (gun.autoPowerUp && !updatedActivePUs.some((p) => p.type === gun.autoPowerUp)) {
      updatedActivePUs.push({ type: gun.autoPowerUp!, timeLeft: 9999, maxTime: 9999 });
    }

    const hasShield  = updatedActivePUs.some((p) => p.type === "shield");
    const hasDrone   = updatedActivePUs.some((p) => p.type === "drone");

    // ── Power-up item spawn ────────────────────────────────────────────────
    let updatedPuItems = puItems
      .map((p) => ({ ...p, lifetime: p.lifetime - delta }))
      .filter((p) => p.lifetime > 0);

    if (puTimerRef.current <= 0) {
      const types: PowerUpType[] = ["speed","shield","rapidfire","heal","drone"];
      const weights = [0.28, 0.22, 0.22, 0.18, 0.10];
      let r = Math.random();
      let chosen: PowerUpType = "speed";
      for (let i = 0; i < types.length; i++) { r -= weights[i]; if (r <= 0) { chosen = types[i]; break; } }
      updatedPuItems.push({ id:`pu_${++puId}`, position: randomArenaPos(newZone), type: chosen, lifetime: 14 });
      puTimerRef.current = Math.max(10, 20 - wave);
    }

    // ── Power-up pickup ────────────────────────────────────────────────────
    let totalCoinsEarned = 0;
    const remainingPUs: typeof updatedPuItems = [];
    for (const pu of updatedPuItems) {
      const dist = Math.sqrt((pu.position.x-playerPos.x)**2 + (pu.position.z-playerPos.z)**2);
      if (dist < 1.5) {
        if (pu.type === "heal") {
          s.setPlayerHp(Math.min(s.maxPlayerHp, s.playerHp + 35));
        } else {
          const dur = POWERUP_DURATION[pu.type];
          const exists = updatedActivePUs.find((p) => p.type === pu.type);
          if (exists) { exists.timeLeft = Math.max(exists.timeLeft, dur); }
          else { updatedActivePUs.push({ type: pu.type, timeLeft: dur, maxTime: dur }); }
        }
        playPowerUp();
      } else {
        remainingPUs.push(pu);
      }
    }

    // ── Wave spawning ──────────────────────────────────────────────────────
    const waveExhausted = enemies.length === 0 && now > 3;

    if (gameMode === "levels" && levelDef) {
      // Check level complete
      if (waveExhausted && wavesSpawnedRef.current >= levelDef.waves && !waveLockedRef.current) {
        levelCompleteRef.current = true;
        playLevelComplete();
        s.setTimeSurvived(newTime);
        s.completeLevel(s.currentLevel, levelDef.reward);
        return;
      }
      // Spawn next level wave
      if ((waveTimerRef.current <= 0 || waveExhausted) && !waveLockedRef.current && wavesSpawnedRef.current < levelDef.waves) {
        waveLockedRef.current = true;
        const nextWaveNum = wavesSpawnedRef.current + 1;
        wavesSpawnedRef.current = nextWaveNum;
        s.setWave(nextWaveNum);
        s.setEnemies([...enemies, ...buildWaveLevel(levelDef.id, nextWaveNum, levelDef.allowedTypes, levelDef.speedMult, levelDef.hpMult, levelDef.baseEnemyCount, levelDef.enemyCountPerWave)]);
        waveTimerRef.current = WAVE_DURATION;
        playWaveStart();
        setTimeout(() => { waveLockedRef.current = false; }, 200);
        return;
      }
    } else {
      // Endless: spawn next wave
      if ((waveTimerRef.current <= 0 || waveExhausted) && !waveLockedRef.current) {
        waveLockedRef.current = true;
        const newWave = wave + 1;
        s.setWave(newWave);
        s.setEnemies([...enemies, ...buildWaveEndless(newWave)]);
        waveTimerRef.current = WAVE_DURATION;
        playWaveStart();
        setTimeout(() => { waveLockedRef.current = false; }, 200);
        return;
      }
    }

    // ── Bullet → enemy hit map ─────────────────────────────────────────────
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

    // ── Update enemies ─────────────────────────────────────────────────────
    let contactDmg = 0;
    const updatedEnemies: Enemy[] = [];
    const newEnemyBullets: Bullet[] = [];

    for (let i = 0; i < enemies.length; i++) {
      const e  = enemies[i];
      const hp = e.hp - (damageMap.get(e.id) ?? 0);

      if (hp <= 0) {
        if (e.type === "bomber") {
          const d = e.position.distanceTo(playerPos);
          if (d < 5 && !hasShield) contactDmg += e.baseDamage * (1 - d/5);
        }
        playEnemyDeath(e.type);
        totalCoinsEarned += COIN_REWARDS[e.type];
        s.recordKill(e.type);
        continue;
      }
      if (damageMap.has(e.id)) playEnemyHit();

      const pos = e.position.clone();
      let lastShot = e.lastShot, lastDamageTime = e.lastDamageTime;

      const dx = playerPos.x - pos.x, dz = playerPos.z - pos.z;
      const dist = Math.sqrt(dx*dx + dz*dz);

      if (dist < e.alertRadius) {
        const pf   = Math.min(0.5, dist / e.speed * 0.4);
        const predX= playerPos.x + playerVel.x * pf;
        const predZ= playerPos.z + playerVel.z * pf;
        const pdx  = predX - pos.x, pdz = predZ - pos.z;
        const pdist= Math.sqrt(pdx*pdx + pdz*pdz) || dist;

        let mx = 0, mz = 0;
        if (e.type === "ranged") {
          const pref = 9;
          if (dist > pref + 2) { mx = pdx/pdist; mz = pdz/pdist; }
          else if (dist < pref - 2) { mx = -dx/dist; mz = -dz/dist; }
          else { mx = dz/dist; mz = -dx/dist; }
        } else if (e.type === "speeder") {
          mx = pdx/pdist; mz = pdz/pdist;
          const zz = Math.sin(now*5 + e.zigzagPhase);
          mx += (-dz/dist)*zz*0.5; mz += (dx/dist)*zz*0.5;
        } else if (e.type === "bomber") {
          mx = pdx/pdist + Math.sin(now*2 + e.zigzagPhase)*0.2;
          mz = pdz/pdist + Math.cos(now*2 + e.zigzagPhase)*0.2;
        } else {
          if (pdist > 0.5) { mx = pdx/pdist; mz = pdz/pdist; }
        }

        // Separation
        for (let j = 0; j < enemies.length; j++) {
          if (j === i) continue;
          const sx = pos.x - enemies[j].position.x, sz = pos.z - enemies[j].position.z;
          const sd = Math.sqrt(sx*sx + sz*sz);
          const md = e.type === "tank" ? 1.8 : 1.3;
          if (sd < md && sd > 0.001) { const push=(md-sd)/sd; mx+=sx*push*0.5; mz+=sz*push*0.5; }
        }

        const ml = Math.sqrt(mx*mx + mz*mz);
        if (ml > 0) { pos.x += (mx/ml)*e.speed*delta; pos.z += (mz/ml)*e.speed*delta; }

        // Obstacle avoidance
        for (const o of obs) {
          const hw = o.w/2+0.8, hd = o.d/2+0.8;
          const odx = pos.x-o.x, odz = pos.z-o.z;
          if (Math.abs(odx)<hw && Math.abs(odz)<hd) {
            Math.abs(odx)/hw < Math.abs(odz)/hd
              ? (pos.x = o.x + Math.sign(odx)*hw)
              : (pos.z = o.z + Math.sign(odz)*hd);
          }
        }
        pos.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, pos.x));
        pos.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, pos.z));

        // Ranged shoots at predicted player
        if (e.type === "ranged" && dist > 2 && now - lastShot > Math.max(1.2, 2.5 - wave*0.12)) {
          newEnemyBullets.push({
            id: `eb_${++bulletId}`,
            position: new THREE.Vector3(pos.x + pdx/pdist, 0.8, pos.z + pdz/pdist),
            direction: new THREE.Vector3(pdx/pdist, 0, pdz/pdist),
            speed: 9, fromPlayer: false, damage: e.baseDamage, lifetime: 5,
          });
          lastShot = now;
        }

        // Contact damage
        if (e.type !== "ranged" && dist < 1.1 && now - lastDamageTime > 0.5) {
          contactDmg += e.baseDamage * 0.5;
          lastDamageTime = now;
        }
      }
      updatedEnemies.push({ ...e, position: pos, hp, lastShot, lastDamageTime });
    }

    // ── Drone auto-shoot ───────────────────────────────────────────────────
    if (hasDrone && droneTimerRef.current <= 0 && updatedEnemies.length > 0) {
      const sorted = [...updatedEnemies].sort((a, b) =>
        a.position.distanceTo(playerPos) - b.position.distanceTo(playerPos)
      );
      for (let di = 0; di < Math.min(2, sorted.length); di++) {
        const target = sorted[di];
        if (!target) break;
        const ddx = target.position.x - playerPos.x;
        const ddz = target.position.z - playerPos.z;
        const dd  = Math.sqrt(ddx*ddx + ddz*ddz);
        if (dd < 22 && dd > 0) {
          newEnemyBullets.push({
            id: `drone_${++bulletId}`,
            position: new THREE.Vector3(playerPos.x, 1.4, playerPos.z),
            direction: new THREE.Vector3(ddx/dd, 0, ddz/dd),
            speed: 20, fromPlayer: true, damage: 20, lifetime: 3,
          });
        }
      }
      droneTimerRef.current = 1.4;
    }

    // ── Update bullets ─────────────────────────────────────────────────────
    let bulletDmg = 0;
    const movedBullets: Bullet[] = [];

    const allBullets = [...bullets, ...newEnemyBullets];
    for (const b of allBullets) {
      if (bulletHits.has(b.id)) continue;
      const np   = b.position.clone().addScaledVector(b.direction, b.speed*delta);
      const life = b.lifetime - delta;
      if (life <= 0) continue;
      if (Math.abs(np.x) > ARENA_HALF+1.5 || Math.abs(np.z) > ARENA_HALF+1.5) continue;
      if (obstacleHit(np, obs)) continue;
      if (!b.fromPlayer) {
        if (np.distanceTo(playerPos) < 0.75) { bulletDmg += b.damage; continue; }
      }
      movedBullets.push({ ...b, position: np, lifetime: life });
    }

    // ── Apply damage ───────────────────────────────────────────────────────
    const totalDmg = hasShield
      ? zoneDmg * 0.3
      : contactDmg + bulletDmg + zoneDmg;
    const newHp = Math.max(0, Math.min(s.maxPlayerHp, s.playerHp - totalDmg));

    if (totalDmg > 0.5 && !hasShield) playPlayerHit();

    // ── Commit ─────────────────────────────────────────────────────────────
    s.setTimeSurvived(newTime);
    s.setSafeZoneRadius(newZone);
    s.setEnemies(updatedEnemies);
    s.setBullets(movedBullets);
    s.setPowerUpItems(remainingPUs);
    s.setActivePowerUps(updatedActivePUs);

    const kills = enemies.length - updatedEnemies.length;
    if (kills > 0) {
      s.setKillCount(s.killCount + kills);
      s.addSessionCoins(totalCoinsEarned);
    }

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
