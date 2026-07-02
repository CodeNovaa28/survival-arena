import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy, EnemyType, Bullet, PowerUpType, ActivePowerUp, DamageEvent } from "./store";
import { getObstacles, ARENA_HALF } from "./Arena";
import { getGun } from "./gameGuns";
import { getMeleeWeapon } from "./gameMeleeWeapons";
import { CHARACTER_SKINS } from "./gameSkins";
import { getLevel } from "./gameLevels";
import {
  playEnemyHit, playEnemyDeath, playPlayerHit, playPowerUp,
  playGameOver, playLevelComplete, playWaveStart, playZoneDamage,
} from "./sounds";

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

const SAFE_ZONE_START  = 40;
const SAFE_ZONE_MIN    = 10;
const ZONE_DMG_PER_SEC = 20;
const WAVE_DURATION    = 20;
const CRIT_CHANCE      = 0.15;

const DRONE_STRIKE_DURATION = 15;
const DRONE_STRIKE_COOLDOWN = 60;
const SQUAD_DURATION        = 30;
const SQUAD_COOLDOWN        = 90;

let bulletId  = 0;
let puId      = 0;
let dmgEvtId  = 0;

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
  const a = Math.random()*Math.PI*2;
  const d = Math.random()*r*0.65;
  return new THREE.Vector3(Math.cos(a)*d, 0.5, Math.sin(a)*d);
}

const WEIGHTED: Record<EnemyType, number> = { chaser:3, ranged:2, speeder:2, tank:1, bomber:1 };
function pickType(allowed: EnemyType[]): EnemyType {
  const pool = allowed.flatMap((t) => Array<EnemyType>(WEIGHTED[t]).fill(t));
  return pool[Math.floor(Math.random()*pool.length)];
}

function makeEnemy(type: EnemyType, spMult: number, hpMult: number, label: string): Enemy {
  const def = ENEMY_DEFS[type];
  return {
    id: `${label}_${Date.now()}_${Math.random()}`,
    position: spawnPos(),
    hp: def.hp*hpMult, maxHp: def.hp*hpMult,
    type, speed: def.speed*spMult, baseDamage: def.damage,
    lastShot: 0, lastDamageTime: -99,
    alertRadius: def.alertRadius, zigzagPhase: Math.random()*Math.PI*2,
  };
}

function spawnPracticeDummies(): Enemy[] {
  return Array.from({ length: 12 }, (_, i) => {
    const angle  = (i / 12) * Math.PI * 2;
    const radius = 7 + (i % 3) * 5;
    return {
      id: `dummy_${i}`,
      position: new THREE.Vector3(Math.cos(angle) * radius, 0.7, Math.sin(angle) * radius),
      hp: 1200, maxHp: 1200, type: "tank" as EnemyType,
      speed: 0, baseDamage: 0, lastShot: 0, lastDamageTime: -99,
      alertRadius: 0, zigzagPhase: 0,
    };
  });
}

function buildWaveEndless(wave: number): Enemy[] {
  const all: EnemyType[] = ["chaser","ranged","speeder","tank","bomber"];
  const allowed =
    wave===1 ? ["chaser"] as EnemyType[] :
    wave===2 ? ["chaser","ranged"] as EnemyType[] :
    wave===3 ? ["chaser","ranged","tank"] as EnemyType[] :
    wave===4 ? ["chaser","ranged","tank","speeder"] as EnemyType[] : all;
  const count  = wave === 1 ? 4 : 3 + wave * 2;
  const spMult = Math.min(2.5, 1+(wave-1)*0.12);
  const hpMult = 1+(wave-1)*0.15;
  return Array.from({length:count}, (_,i) =>
    makeEnemy(pickType(allowed), spMult, hpMult, `w${wave}_${i}`));
}

function buildWaveLevel(
  levelId:number, waveNum:number, allowed:EnemyType[],
  spMult:number, hpMult:number, base:number, perWave:number,
): Enemy[] {
  const count = base+(waveNum-1)*perWave;
  return Array.from({length:count}, (_,i) =>
    makeEnemy(pickType(allowed), spMult, hpMult, `l${levelId}_w${waveNum}_${i}`));
}

function obstacleHit(pos: THREE.Vector3, obs: ReturnType<typeof getObstacles>): boolean {
  for (const o of obs) {
    if (Math.abs(pos.x-o.x)<o.w/2+0.15 && Math.abs(pos.z-o.z)<o.d/2+0.15 && pos.y<o.h) return true;
  }
  return false;
}

const DRONE_OFFSETS    = [new THREE.Vector3(-2.2,1.4,0), new THREE.Vector3(2.2,1.4,0)];
const SQUAD_OFFSETS    = [new THREE.Vector3(-2.8,0.8,-0.5), new THREE.Vector3(2.8,0.8,-0.5)];
const GUARDIAN_OFFSETS = [new THREE.Vector3(-2.4,0.8,-0.8), new THREE.Vector3(2.4,0.8,-0.8)];

function companionShot(from: THREE.Vector3, target: THREE.Vector3, dmg: number): Bullet {
  const dir = target.clone().sub(from).setY(0).normalize();
  return {
    id: `comp_${++bulletId}`,
    position: from.clone(), direction: dir,
    speed: 20, fromPlayer: true, damage: dmg, lifetime: 3,
  };
}

function emitDmgEvent(
  s: ReturnType<typeof useGameStore.getState>,
  x: number, z: number, raw: number, crit: boolean, melee: boolean,
) {
  const val = Math.round(crit ? raw * 2 : raw);
  const evt: DamageEvent = { id: `de_${++dmgEvtId}`, x, z, value: val, crit, melee };
  s.addDamageEvent(evt);
  return val;
}

export default function GameLogic() {
  const gameTimeRef      = useRef(0);
  const waveTimerRef     = useRef(WAVE_DURATION);
  const puTimerRef       = useRef(15);
  const waveLockedRef    = useRef(false);
  const zoneSoundRef     = useRef(0);
  const wavesSpawnedRef  = useRef(1);
  const levelCompleteRef   = useRef(false);
  const checkpointSavedRef = useRef(false);
  const obstaclesRef     = useRef(getObstacles("urban"));

  // Companion timers
  const droneTimerRef    = useRef(0);
  const droneCoolRef     = useRef(0);
  const droneShootRef    = useRef(0);
  const squadTimerRef    = useRef(0);
  const squadCoolRef     = useRef(0);
  const squadShootRef    = useRef(0);
  const guardianShootRef = useRef(0);

  // Melee
  const meleeCoolRef     = useRef(0);
  const meleeHeldRef     = useRef(false);
  const meleeSwingRef    = useRef(false);

  // Map drops
  const heartDropTimerRef  = useRef(50 + Math.random() * 15);
  const weaponDropTimerRef = useRef(110 + Math.random() * 30);

  useEffect(() => {
    const s   = useGameStore.getState();
    const gun  = getGun(s.selectedGun);
    const skin = CHARACTER_SKINS.find((sk) => sk.id === s.selectedSkin);

    obstaclesRef.current     = getObstacles(s.selectedMap);
    levelCompleteRef.current   = false;
    checkpointSavedRef.current = false;
    wavesSpawnedRef.current    = 1;
    gameTimeRef.current      = 0;
    waveTimerRef.current     = WAVE_DURATION;
    puTimerRef.current       = 15;
    droneShootRef.current    = 0;
    squadShootRef.current    = 0;
    guardianShootRef.current = 0;
    meleeCoolRef.current         = 0;
    heartDropTimerRef.current    = 50 + Math.random() * 15;
    weaponDropTimerRef.current   = 110 + Math.random() * 30;

    // Apply permanent perks
    const perks = s.permanentPerks;
    const baseMaxHp = perks.includes("extra_hp") ? 125 : 100;
    s.setMaxPlayerHp(baseMaxHp);
    s.setPlayerHp(baseMaxHp);

    const reviveAvailable =
      skin?.perk === "secondLife" || gun.perk === "secondLife" || perks.includes("second_life");
    s.setReviveAvailable(reviveAvailable);

    const guardianActive =
      s.selectedSkin === "ghost_squad" && s.highestCompletedLevel >= 15;
    s.setGuardianActive(guardianActive);

    droneTimerRef.current = 0; droneCoolRef.current = 0;
    s.setDroneAbility(false, 0, 0);
    s.setSquadAbility(false, 0, 0);

    const initPUs: ActivePowerUp[] = gun.autoPowerUp
      ? [{ type: gun.autoPowerUp, timeLeft: 9999, maxTime: 9999 }] : [];
    if (perks.includes("start_rapid") && !initPUs.some((p) => p.type === "rapidfire")) {
      initPUs.push({ type: "rapidfire", timeLeft: 8, maxTime: 8 });
    }
    if (perks.includes("start_shield") && !initPUs.some((p) => p.type === "shield")) {
      initPUs.push({ type: "shield", timeLeft: 8, maxTime: 8 });
    }
    if (perks.includes("start_drone") && droneTimerRef.current <= 0) {
      droneTimerRef.current = 10; droneCoolRef.current = DRONE_STRIKE_COOLDOWN;
      s.setDroneAbility(true, 10, DRONE_STRIKE_COOLDOWN);
    }
    if (perks.includes("companion_5s") && squadTimerRef.current <= 0) {
      squadTimerRef.current = 5; squadCoolRef.current = SQUAD_COOLDOWN;
      s.setSquadAbility(true, 5, SQUAD_COOLDOWN);
    }
    s.setActivePowerUps(initPUs);
    s.setBullets([]); s.setPowerUpItems([]);
    s.setSafeZoneRadius(SAFE_ZONE_START);
    s.setTimeSurvived(0); s.setKillCount(0); s.setKillStreak(0);

    const levelDef = s.gameMode === "levels" ? getLevel(s.currentLevel) : null;
    const startCpWave = s.startCheckpointWave;
    if (s.gameMode === "practice") {
      s.setWave(1);
      s.setSafeZoneRadius(50);
      s.setEnemies(spawnPracticeDummies());
    } else if (levelDef) {
      const startWave = startCpWave > 0 ? startCpWave : 1;
      s.setWave(startWave);
      wavesSpawnedRef.current = startWave;
      if (startCpWave > 0) {
        s.setPlayerHp(Math.max(30, Math.min(s.checkpointHp, baseMaxHp)));
        checkpointSavedRef.current = true; // don't overwrite checkpoint with lower wave
        useGameStore.setState({ startCheckpointWave: 0 });
      }
      s.setEnemies(buildWaveLevel(
        levelDef.id, startWave, levelDef.allowedTypes,
        levelDef.speedMult, levelDef.hpMult,
        levelDef.baseEnemyCount, levelDef.enemyCountPerWave,
      ));
    } else {
      s.setWave(1); s.setEnemies(buildWaveEndless(1));
    }
  }, []);

  // Q / E ability keys + F melee
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = useGameStore.getState();
      if (s.phase !== "playing" || s.paused) return;

      if (e.code === "KeyQ" && (s.highestCompletedLevel >= 5 || s.permanentPerks.includes("q_always")) && droneCoolRef.current <= 0 && !droneTimerRef.current) {
        droneTimerRef.current = DRONE_STRIKE_DURATION;
        droneCoolRef.current  = DRONE_STRIKE_COOLDOWN;
        s.setDroneAbility(true, DRONE_STRIKE_DURATION, DRONE_STRIKE_COOLDOWN);
      }
      if (e.code === "KeyE" && s.highestCompletedLevel >= 8 && squadCoolRef.current <= 0 && !squadTimerRef.current) {
        squadTimerRef.current = SQUAD_DURATION;
        squadCoolRef.current  = SQUAD_COOLDOWN;
        s.setSquadAbility(true, SQUAD_DURATION, SQUAD_COOLDOWN);
      }
      if (e.code === "KeyF") {
        meleeHeldRef.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyF") meleeHeldRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (s.phase !== "playing" || s.paused || levelCompleteRef.current) return;

    gameTimeRef.current  += delta;
    waveTimerRef.current -= delta;
    puTimerRef.current   -= delta;
    zoneSoundRef.current -= delta;

    // ── Companion timers ──────────────────────────────────────────────────
    if (droneTimerRef.current > 0) {
      droneTimerRef.current -= delta;
      if (droneTimerRef.current <= 0) { droneTimerRef.current = 0; s.setDroneAbility(false, 0, droneCoolRef.current); }
      else s.setDroneAbility(true, droneTimerRef.current, droneCoolRef.current);
    }
    if (droneCoolRef.current > 0) { droneCoolRef.current -= delta; if (droneCoolRef.current < 0) droneCoolRef.current = 0; }
    if (squadTimerRef.current > 0) {
      squadTimerRef.current -= delta;
      if (squadTimerRef.current <= 0) { squadTimerRef.current = 0; s.setSquadAbility(false, 0, squadCoolRef.current); }
      else s.setSquadAbility(true, squadTimerRef.current, squadCoolRef.current);
    }
    if (squadCoolRef.current > 0) { squadCoolRef.current -= delta; if (squadCoolRef.current < 0) squadCoolRef.current = 0; }
    droneShootRef.current    -= delta;
    squadShootRef.current    -= delta;
    guardianShootRef.current -= delta;

    // ── Melee cooldown ────────────────────────────────────────────────────
    if (meleeCoolRef.current > 0) {
      meleeCoolRef.current -= delta;
      if (meleeCoolRef.current < 0) meleeCoolRef.current = 0;
      s.setMeleeCooldown(meleeCoolRef.current);
    }

    const now       = gameTimeRef.current;
    const playerPos = s.playerPosition;
    const playerVel = s.playerVelocity;
    const gameMode  = s.gameMode;
    const levelDef  = gameMode === "levels" ? getLevel(s.currentLevel) : null;
    const obs       = obstaclesRef.current;

    const enemies   = Array.isArray(s.enemies)        ? s.enemies        : [];
    const bullets   = Array.isArray(s.bullets)        ? s.bullets        : [];
    const puItems   = Array.isArray(s.powerUpItems)   ? s.powerUpItems   : [];
    const activePUs = Array.isArray(s.activePowerUps) ? s.activePowerUps : [];

    const newTime = s.timeSurvived + delta;

    // ── Safe zone ──────────────────────────────────────────────────────────
    const shrinkMult = levelDef ? levelDef.safeZoneShrinkMult : 1;
    const shrinkRate = (0.018+(s.wave-1)*0.007)*shrinkMult;
    const newZone    = gameMode === "practice" ? SAFE_ZONE_START
      : Math.max(SAFE_ZONE_MIN, s.safeZoneRadius - shrinkRate*delta);
    const playerDist = Math.sqrt(playerPos.x**2+playerPos.z**2);
    let   zoneDmg    = 0;
    if (playerDist > newZone && gameMode !== "practice") {
      zoneDmg = ZONE_DMG_PER_SEC*delta;
      if (zoneSoundRef.current <= 0) { playZoneDamage(); zoneSoundRef.current = 0.8; }
    }

    // ── Active power-ups ───────────────────────────────────────────────────
    const gun = getGun(s.selectedGun);
    const updatedActivePUs = activePUs
      .map((p) => p.type===gun.autoPowerUp ? {...p,timeLeft:9999} : {...p,timeLeft:p.timeLeft-delta})
      .filter((p) => p.timeLeft>0);
    if (gun.autoPowerUp && !updatedActivePUs.some((p) => p.type===gun.autoPowerUp)) {
      updatedActivePUs.push({type:gun.autoPowerUp,timeLeft:9999,maxTime:9999});
    }
    const hasShield   = updatedActivePUs.some((p) => p.type==="shield");
    const hasRapid    = updatedActivePUs.some((p) => p.type==="rapidfire");
    const effectiveFR = hasRapid ? gun.fireRate * 0.4 : gun.fireRate;

    // ── Power-up item spawn ────────────────────────────────────────────────
    let updatedPuItems = puItems
      .map((p) => ({...p,lifetime:p.lifetime-delta}))
      .filter((p) => p.lifetime>0);
    if (puTimerRef.current <= 0) {
      const types: PowerUpType[] = ["speed","shield","rapidfire","heal","drone"];
      const weights = [0.28,0.22,0.22,0.18,0.10];
      let r=Math.random(), chosen:PowerUpType="speed";
      for (let i=0;i<types.length;i++) { r-=weights[i]; if(r<=0){chosen=types[i];break;} }
      updatedPuItems.push({id:`pu_${++puId}`,position:randomArenaPos(newZone),type:chosen,lifetime:14});
      puTimerRef.current = Math.max(10, 20-s.wave);
    }

    // ── Power-up pickup ────────────────────────────────────────────────────
    const remainingPUs: typeof updatedPuItems = [];
    for (const pu of updatedPuItems) {
      const d = Math.sqrt((pu.position.x-playerPos.x)**2+(pu.position.z-playerPos.z)**2);
      if (d < 1.5) {
        if (pu.type==="heal") {
          s.setPlayerHp(Math.min(s.maxPlayerHp, s.playerHp+35));
        } else {
          const dur = POWERUP_DURATION[pu.type];
          const idx = updatedActivePUs.findIndex((p) => p.type===pu.type);
          if (idx>=0) updatedActivePUs[idx].timeLeft = Math.max(updatedActivePUs[idx].timeLeft,dur);
          else updatedActivePUs.push({type:pu.type,timeLeft:dur,maxTime:dur});
        }
        playPowerUp();
      } else { remainingPUs.push(pu); }
    }

    // ── Wave logic ─────────────────────────────────────────────────────────
    const waveExhausted = enemies.length===0 && now>3;
    if (gameMode==="levels" && levelDef) {
      if (waveExhausted && wavesSpawnedRef.current>=levelDef.waves && !waveLockedRef.current) {
        levelCompleteRef.current = true; playLevelComplete();
        s.setTimeSurvived(newTime); s.completeLevel(s.currentLevel, levelDef.reward);
        return;
      }
      if ((waveTimerRef.current<=0||waveExhausted) && !waveLockedRef.current && wavesSpawnedRef.current<levelDef.waves) {
        waveLockedRef.current = true;
        const nw = wavesSpawnedRef.current+1;
        wavesSpawnedRef.current = nw; s.setWave(nw);
        s.setEnemies([...enemies,...buildWaveLevel(levelDef.id,nw,levelDef.allowedTypes,levelDef.speedMult,levelDef.hpMult,levelDef.baseEnemyCount,levelDef.enemyCountPerWave)]);
        waveTimerRef.current = WAVE_DURATION; playWaveStart();
        setTimeout(() => { waveLockedRef.current=false; }, 200); return;
      }
    } else {
      if ((waveTimerRef.current<=0||waveExhausted) && !waveLockedRef.current) {
        waveLockedRef.current = true;
        const nw=s.wave+1; s.setWave(nw);
        s.setEnemies([...enemies,...buildWaveEndless(nw)]);
        waveTimerRef.current=WAVE_DURATION; playWaveStart();
        setTimeout(() => { waveLockedRef.current=false; }, 200); return;
      }
    }

    // ── Melee attack ───────────────────────────────────────────────────────
    const meleeWeapon = getMeleeWeapon(s.selectedMelee);
    const meleeDamageMap = new Map<string, number>();
    let meleeTriggered = false;

    // Auto-melee: trigger when closest enemy enters range, OR F is held
    const closestEnemyDist = enemies.reduce((min, en) => Math.min(min, en.position.distanceTo(playerPos)), Infinity);
    const autoMelee = closestEnemyDist <= meleeWeapon.range + 0.5;

    if ((autoMelee || meleeHeldRef.current) && meleeCoolRef.current <= 0) {
      meleeCoolRef.current = meleeWeapon.cooldown;
      s.setMeleeCooldown(meleeWeapon.cooldown);
      meleeTriggered = true;

      // Swing visual (show for 0.35s)
      if (!meleeSwingRef.current) {
        meleeSwingRef.current = true;
        s.setMeleeSwinging(true);
        setTimeout(() => { meleeSwingRef.current = false; s.setMeleeSwinging(false); }, 350);
      }

      // Player facing direction (from velocity or default forward)
      const velLen = Math.sqrt(playerVel.x**2 + playerVel.z**2);
      let facX   = velLen > 0.1 ? playerVel.x / velLen : 0;
      let facZ   = velLen > 0.1 ? playerVel.z / velLen : 1;
      // Auto-melee: aim toward the closest enemy
      if (autoMelee) {
        const cl = enemies.reduce<{dist:number;ex:number;ez:number}>(
          (a, en) => { const d=en.position.distanceTo(playerPos); return d<a.dist?{dist:d,ex:en.position.x,ez:en.position.z}:a; },
          { dist:Infinity, ex:playerPos.x, ez:playerPos.z+1 }
        );
        const adx=cl.ex-playerPos.x, adz=cl.ez-playerPos.z, al=Math.sqrt(adx*adx+adz*adz)||1;
        facX=adx/al; facZ=adz/al;
      }

      for (const e of enemies) {
        const dx   = e.position.x - playerPos.x;
        const dz   = e.position.z - playerPos.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist > meleeWeapon.range + 0.4) continue;

        let inArc = true;
        if (!meleeWeapon.aoe) {
          const dot = (dx/dist)*facX + (dz/dist)*facZ;
          const halfRad = (meleeWeapon.swingArc * Math.PI / 180) / 2;
          inArc = Math.acos(Math.max(-1, Math.min(1, dot))) <= halfRad;
        }
        if (!inArc) continue;

        const crit = Math.random() < CRIT_CHANCE;
        const raw  = meleeWeapon.damage;
        const val  = emitDmgEvent(s, e.position.x, e.position.z, raw, crit, true);
        meleeDamageMap.set(e.id, (meleeDamageMap.get(e.id) ?? 0) + val);
      }
    }

    // ── Bullet hit detection ───────────────────────────────────────────────
    const bulletDamageMap = new Map<string,number>();
    const bulletHits      = new Set<string>();
    for (const b of bullets) {
      if (!b.fromPlayer) continue;
      for (const e of enemies) {
        const hitR = e.type==="tank"?1.4:e.type==="bomber"?1.2:0.85;
        if (b.position.distanceTo(e.position)<hitR) {
          const crit = Math.random() < CRIT_CHANCE;
          const raw  = b.damage;
          const val  = emitDmgEvent(s, e.position.x, e.position.z, raw, crit, false);
          bulletDamageMap.set(e.id, (bulletDamageMap.get(e.id) ?? 0) + val);
          bulletHits.add(b.id);
        }
      }
    }

    // ── Update enemies ─────────────────────────────────────────────────────
    let contactDmg=0, totalCoinsEarned=0, killsThisFrame=0;
    const updatedEnemies: Enemy[] = [];
    const newEnemyBullets: Bullet[] = [];

    for (let i=0;i<enemies.length;i++) {
      const e  = enemies[i];
      const dmg= (bulletDamageMap.get(e.id) ?? 0) + (meleeDamageMap.get(e.id) ?? 0);
      const hp = e.hp - dmg;

      if (hp<=0) {
        if (e.type==="bomber") { const d=e.position.distanceTo(playerPos); if(d<5&&!hasShield) contactDmg+=e.baseDamage*(1-d/5); }
        playEnemyDeath(e.type);
        totalCoinsEarned+=COIN_REWARDS[e.type];
        s.recordKill(e.type);
        killsThisFrame++;
        continue;
      }
      if (dmg > 0) playEnemyHit();

      const pos=e.position.clone(); let lastShot=e.lastShot, lastDamageTime=e.lastDamageTime;
      const dx=playerPos.x-pos.x, dz=playerPos.z-pos.z, dist=Math.sqrt(dx*dx+dz*dz)||0.01;

      if (dist<e.alertRadius) {
        const pf=Math.min(0.5,dist/e.speed*0.4);
        const predX=playerPos.x+playerVel.x*pf, predZ=playerPos.z+playerVel.z*pf;
        const pdx=predX-pos.x, pdz=predZ-pos.z, pdist=Math.sqrt(pdx*pdx+pdz*pdz)||dist;

        let mx=0,mz=0;
        if (e.type==="ranged") {
          const pref=9;
          if(dist>pref+2){mx=pdx/pdist;mz=pdz/pdist;}
          else if(dist<pref-2){mx=-dx/dist;mz=-dz/dist;}
          else{mx=dz/dist;mz=-dx/dist;}
        } else if(e.type==="speeder") {
          mx=pdx/pdist;mz=pdz/pdist;
          const zz=Math.sin(now*5+e.zigzagPhase);
          mx+=(-dz/dist)*zz*0.5;mz+=(dx/dist)*zz*0.5;
        } else if(e.type==="bomber") {
          mx=pdx/pdist+Math.sin(now*2+e.zigzagPhase)*0.2;
          mz=pdz/pdist+Math.cos(now*2+e.zigzagPhase)*0.2;
        } else { if(pdist>0.5){mx=pdx/pdist;mz=pdz/pdist;} }

        for (let j=0;j<enemies.length;j++) {
          if(j===i)continue;
          const sx=pos.x-enemies[j].position.x,sz=pos.z-enemies[j].position.z,sd=Math.sqrt(sx*sx+sz*sz);
          const md=e.type==="tank"?1.8:1.3;
          if(sd<md&&sd>0.001){const push=(md-sd)/sd;mx+=sx*push*0.5;mz+=sz*push*0.5;}
        }
        const ml=Math.sqrt(mx*mx+mz*mz);
        if(ml>0){pos.x+=(mx/ml)*e.speed*delta;pos.z+=(mz/ml)*e.speed*delta;}

        for (const o of obs) {
          const hw=o.w/2+0.8,hd=o.d/2+0.8,odx=pos.x-o.x,odz=pos.z-o.z;
          if(Math.abs(odx)<hw&&Math.abs(odz)<hd) {
            Math.abs(odx)/hw<Math.abs(odz)/hd?(pos.x=o.x+Math.sign(odx)*hw):(pos.z=o.z+Math.sign(odz)*hd);
          }
        }
        pos.x=Math.max(-ARENA_HALF,Math.min(ARENA_HALF,pos.x));
        pos.z=Math.max(-ARENA_HALF,Math.min(ARENA_HALF,pos.z));

        if(e.type==="ranged"&&dist>2&&now-lastShot>Math.max(1.2,2.5-s.wave*0.12) && gameMode!=="practice") {
          newEnemyBullets.push({id:`eb_${++bulletId}`,position:new THREE.Vector3(pos.x+pdx/pdist,0.8,pos.z+pdz/pdist),direction:new THREE.Vector3(pdx/pdist,0,pdz/pdist),speed:9,fromPlayer:false,damage:e.baseDamage,lifetime:5});
          lastShot=now;
        }
        if(e.type!=="ranged"&&dist<1.1&&now-lastDamageTime>0.5 && gameMode!=="practice") { contactDmg+=e.baseDamage*0.5; lastDamageTime=now; }
      }
      updatedEnemies.push({...e,position:pos,hp,lastShot,lastDamageTime});
    }

    // Practice mode: respawn dummies when killed, don't let count drop below 12
    if (gameMode === "practice") {
      while (updatedEnemies.length < 12) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 6 + Math.random() * 11;
        updatedEnemies.push({
          id: `dummy_${Date.now()}_${Math.random()}`,
          position: new THREE.Vector3(Math.cos(angle)*radius, 0.7, Math.sin(angle)*radius),
          hp: 1200, maxHp: 1200, type: "tank" as EnemyType,
          speed: 0, baseDamage: 0, lastShot: 0, lastDamageTime: -99,
          alertRadius: 0, zigzagPhase: 0,
        });
      }
    }

    // ── Killstreak ─────────────────────────────────────────────────────────
    let newKillStreak = s.killStreak + killsThisFrame;
    // Coin multiplier based on streak before this kill batch
    const streakMult = s.killStreak >= 20 ? 3 : s.killStreak >= 10 ? 2 : s.killStreak >= 5 ? 1.5 : 1;
    totalCoinsEarned = Math.round(totalCoinsEarned * streakMult);

    // ── Companion shooting ─────────────────────────────────────────────────
    const newCompBullets: Bullet[] = [];
    const sorted = updatedEnemies.length > 0
      ? [...updatedEnemies].sort((a,b) => a.position.distanceTo(playerPos)-b.position.distanceTo(playerPos))
      : [];

    if (droneTimerRef.current > 0 && droneShootRef.current <= 0 && sorted.length > 0) {
      DRONE_OFFSETS.forEach((off, di) => {
        const t = sorted[di % sorted.length];
        if (t && t.position.distanceTo(playerPos) < 22) {
          newCompBullets.push(companionShot(playerPos.clone().add(off), t.position, 15));
        }
      });
      droneShootRef.current = 1.4;
    }
    if (squadTimerRef.current > 0 && squadShootRef.current <= 0 && sorted.length > 0) {
      SQUAD_OFFSETS.forEach((off, di) => {
        const t = sorted[di % sorted.length];
        if (t && t.position.distanceTo(playerPos) < 25) {
          newCompBullets.push(companionShot(playerPos.clone().add(off), t.position, 25));
        }
      });
      squadShootRef.current = 1.0;
    }
    if (s.guardianActive && guardianShootRef.current <= 0 && sorted.length > 0) {
      const gunDmg = getGun(s.selectedGun).damage * 0.8;
      GUARDIAN_OFFSETS.forEach((off, di) => {
        const t = sorted[di % sorted.length];
        if (t && t.position.distanceTo(playerPos) < 28) {
          newCompBullets.push(companionShot(playerPos.clone().add(off), t.position, gunDmg));
        }
      });
      guardianShootRef.current = 0.8;
    }

    // ── Bullet movement ────────────────────────────────────────────────────
    let bulletPlayerDmg = 0;
    const movedBullets: Bullet[] = [];
    const allBullets = [...bullets, ...newEnemyBullets, ...newCompBullets];
    for (const b of allBullets) {
      if (bulletHits.has(b.id)) continue;
      const np   = b.position.clone().addScaledVector(b.direction, b.speed*delta);
      const life = b.lifetime - delta;
      if (life<=0) continue;
      if (Math.abs(np.x)>ARENA_HALF+1.5||Math.abs(np.z)>ARENA_HALF+1.5) continue;
      if (obstacleHit(np,obs)) continue;
      const bxz = Math.sqrt((np.x-playerPos.x)**2+(np.z-playerPos.z)**2);
      if (!b.fromPlayer && bxz<1.0) { bulletPlayerDmg+=b.damage; continue; }
      movedBullets.push({...b,position:np,lifetime:life});
    }

    // ── Map drops: spawn + pickup ───────────────────────────────────────────
    if (gameMode !== "practice") {
      heartDropTimerRef.current  -= delta;
      weaponDropTimerRef.current -= delta;

      const currentDrops = s.mapDrops;

      if (heartDropTimerRef.current <= 0) {
        heartDropTimerRef.current = 45 + Math.random() * 15;
        if (currentDrops.filter(d => d.type === "heart").length < 2) {
          const angle = Math.random() * Math.PI * 2;
          const r = 5 + Math.random() * 14;
          s.setMapDrops([...currentDrops, {
            id: `heart_${Date.now()}`,
            position: new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r),
            type: "heart", lifetime: 30,
          }]);
        }
      }

      if (weaponDropTimerRef.current <= 0) {
        weaponDropTimerRef.current = 100 + Math.random() * 30;
        if (currentDrops.filter(d => d.type === "weapon").length < 1 && !s.tempWeapon) {
          const angle = Math.random() * Math.PI * 2;
          const r = 5 + Math.random() * 14;
          const dropGunIds = ["rifle", "shotgun", "sniper", "plasma"];
          const weaponId = dropGunIds[Math.floor(Math.random() * dropGunIds.length)];
          s.setMapDrops([...currentDrops, {
            id: `weapon_${Date.now()}`,
            position: new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r),
            type: "weapon", weaponId, lifetime: 45,
          }]);
        }
      }

      // Pickup check
      if (currentDrops.length > 0) {
        let changed = false;
        const remaining = currentDrops.filter(drop => {
          if (drop.position.distanceTo(playerPos) < 1.5) {
            if (drop.type === "heart") {
              s.setPlayerHp(Math.min(s.maxPlayerHp, s.playerHp + 25));
            } else if (drop.type === "weapon" && drop.weaponId) {
              s.setTempWeapon(drop.weaponId);
            }
            changed = true;
            return false;
          }
          return true;
        });
        if (changed) s.setMapDrops(remaining);
      }
    }

    // ── Damage & death ─────────────────────────────────────────────────────
    const rawDmg   = contactDmg + bulletPlayerDmg + zoneDmg;
    const totalDmg = hasShield ? zoneDmg * 0.3 : rawDmg;
    const newHp    = Math.max(0, Math.min(s.maxPlayerHp, s.playerHp - totalDmg));

    if (rawDmg > 0.5 && !hasShield) { playPlayerHit(); newKillStreak = 0; } // streak reset on damage

    // ── Commit ─────────────────────────────────────────────────────────────
    s.setTimeSurvived(newTime);
    s.setSafeZoneRadius(newZone);
    s.setEnemies(updatedEnemies);
    s.setBullets(movedBullets);
    s.setPowerUpItems(remainingPUs);
    s.setActivePowerUps(updatedActivePUs);
    if (killsThisFrame > 0) {
      s.setKillCount(s.killCount + killsThisFrame);
      s.addSessionCoins(totalCoinsEarned);
    }
    s.setKillStreak(newKillStreak);

    // ── Checkpoint detection (levels mode only) ─────────────────────────────
    if (gameMode === "levels" && !checkpointSavedRef.current) {
      const lDef = getLevel(s.currentLevel);
      if (lDef.waves >= 6) {
        const cpWave = Math.ceil(lDef.waves / 2);
        if (s.wave >= cpWave) {
          checkpointSavedRef.current = true;
          s.setCheckpoint(s.wave, s.playerHp);
        }
      }
    }

    if (newHp !== s.playerHp) {
      // In practice mode, never die — floor at 1 HP
      const finalHp = gameMode === "practice" ? Math.max(1, newHp) : newHp;
      s.setPlayerHp(finalHp);
      if (finalHp <= 0) {
        if (s.reviveAvailable) { s.revive(); }
        else { playGameOver(); s.finishGame(); }
      }
    }
  });

  return null;
}
