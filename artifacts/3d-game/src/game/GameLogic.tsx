import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy, EnemyType, Bullet, PowerUpType } from "./store";
import { getObstacles, ARENA_HALF } from "./Arena";
import { getGun } from "./gameGuns";
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

const SAFE_ZONE_START  = 23;
const SAFE_ZONE_MIN    = 6;
const ZONE_DMG_PER_SEC = 20;
const WAVE_DURATION    = 20;

// Ability constants
const DRONE_STRIKE_DURATION = 15;   // seconds
const DRONE_STRIKE_COOLDOWN = 60;
const SQUAD_DURATION        = 30;
const SQUAD_COOLDOWN        = 90;

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

function buildWaveEndless(wave: number): Enemy[] {
  const all: EnemyType[] = ["chaser","ranged","speeder","tank","bomber"];
  const allowed =
    wave===1 ? ["chaser"] as EnemyType[] :
    wave===2 ? ["chaser","ranged"] as EnemyType[] :
    wave===3 ? ["chaser","ranged","tank"] as EnemyType[] :
    wave===4 ? ["chaser","ranged","tank","speeder"] as EnemyType[] : all;
  const count  = 4+wave*2;
  const spMult = Math.min(2.5, 1+(wave-1)*0.12);
  const hpMult = 1+(wave-1)*0.15;
  return Array.from({length:count}, (_,i) => makeEnemy(pickType(allowed), spMult, hpMult, `w${wave}_${i}`));
}

function buildWaveLevel(levelId:number, waveNum:number, allowed:EnemyType[], spMult:number, hpMult:number, base:number, perWave:number): Enemy[] {
  const count = base+(waveNum-1)*perWave;
  return Array.from({length:count}, (_,i) => makeEnemy(pickType(allowed), spMult, hpMult, `l${levelId}_w${waveNum}_${i}`));
}

function obstacleHit(pos: THREE.Vector3, obs: ReturnType<typeof getObstacles>): boolean {
  for (const o of obs) {
    if (Math.abs(pos.x-o.x)<o.w/2+0.15 && Math.abs(pos.z-o.z)<o.d/2+0.15 && pos.y<o.h) return true;
  }
  return false;
}

// Companion shoot positions relative to player (for drone, squad, guardian)
const DRONE_OFFSETS  = [new THREE.Vector3(-2.2,1.4,0), new THREE.Vector3(2.2,1.4,0)];
const SQUAD_OFFSETS  = [new THREE.Vector3(-2.8,0.8,-0.5), new THREE.Vector3(2.8,0.8,-0.5)];
const GUARDIAN_OFFSETS = [new THREE.Vector3(-2.4,0.8,-0.8), new THREE.Vector3(2.4,0.8,-0.8)];

function companionShot(from: THREE.Vector3, target: THREE.Vector3, dmg: number): Bullet {
  const dir = target.clone().sub(from).setY(0).normalize();
  return {
    id: `comp_${++bulletId}`,
    position: from.clone(),
    direction: dir, speed: 20,
    fromPlayer: true, damage: dmg, lifetime: 3,
  };
}

export default function GameLogic() {
  const gameTimeRef      = useRef(0);
  const waveTimerRef     = useRef(WAVE_DURATION);
  const puTimerRef       = useRef(15);
  const waveLockedRef    = useRef(false);
  const zoneSoundRef     = useRef(0);
  const wavesSpawnedRef  = useRef(1);
  const levelCompleteRef = useRef(false);
  const obstaclesRef     = useRef(getObstacles("urban"));

  // Companion timers (local to avoid store thrash)
  const droneTimerRef    = useRef(0);
  const droneCoolRef     = useRef(0);
  const droneShootRef    = useRef(0);
  const squadTimerRef    = useRef(0);
  const squadCoolRef     = useRef(0);
  const squadShootRef    = useRef(0);
  const guardianShootRef = useRef(0);

  useEffect(() => {
    const s  = useGameStore.getState();
    const gun = getGun(s.selectedGun);
    const skin= CHARACTER_SKINS.find((sk) => sk.id === s.selectedSkin);

    obstaclesRef.current  = getObstacles(s.selectedMap);
    levelCompleteRef.current = false;
    wavesSpawnedRef.current  = 1;
    gameTimeRef.current      = 0;
    waveTimerRef.current     = WAVE_DURATION;
    puTimerRef.current       = 15;
    droneShootRef.current    = 0;
    squadShootRef.current    = 0;
    guardianShootRef.current = 0;

    // Second life perk
    const reviveAvailable =
      skin?.perk === "secondLife" || gun.perk === "secondLife";
    s.setReviveAvailable(reviveAvailable);

    // Guardian companion (ghost_squad skin + completed level 15+)
    const guardianActive =
      s.selectedSkin === "ghost_squad" && s.highestCompletedLevel >= 15;
    s.setGuardianActive(guardianActive);

    // Cooldowns based on prior session (reset each game)
    droneTimerRef.current = 0; droneCoolRef.current = 0;
    squadTimerRef.current = 0; squadCoolRef.current = 0;
    s.setDroneAbility(false, 0, 0);
    s.setSquadAbility(false, 0, 0);

    // Auto power-up from gun
    const initPUs = gun.autoPowerUp
      ? [{ type: gun.autoPowerUp, timeLeft: 9999, maxTime: 9999 }]
      : [];
    s.setActivePowerUps(initPUs);
    s.setBullets([]); s.setPowerUpItems([]);
    s.setSafeZoneRadius(SAFE_ZONE_START);
    s.setTimeSurvived(0); s.setKillCount(0);

    // Spawn first wave
    const levelDef = s.gameMode === "levels" ? getLevel(s.currentLevel) : null;
    if (levelDef) {
      s.setWave(1);
      s.setEnemies(buildWaveLevel(levelDef.id,1,levelDef.allowedTypes,levelDef.speedMult,levelDef.hpMult,levelDef.baseEnemyCount,levelDef.enemyCountPerWave));
    } else {
      s.setWave(1); s.setEnemies(buildWaveEndless(1));
    }
  }, []);

  // Q / E key listeners for abilities
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGameStore.getState();
      if (s.phase !== "playing" || s.paused) return;

      // Q – Drone Strike (need completed level 5+)
      if (e.code === "KeyQ" && s.highestCompletedLevel >= 5 && droneCoolRef.current <= 0 && !droneTimerRef.current) {
        droneTimerRef.current = DRONE_STRIKE_DURATION;
        droneCoolRef.current  = DRONE_STRIKE_COOLDOWN;
        s.setDroneAbility(true, DRONE_STRIKE_DURATION, DRONE_STRIKE_COOLDOWN);
      }
      // E – Squad Backup (need completed level 8+)
      if (e.code === "KeyE" && s.highestCompletedLevel >= 8 && squadCoolRef.current <= 0 && !squadTimerRef.current) {
        squadTimerRef.current = SQUAD_DURATION;
        squadCoolRef.current  = SQUAD_COOLDOWN;
        s.setSquadAbility(true, SQUAD_DURATION, SQUAD_COOLDOWN);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (s.phase !== "playing" || s.paused || levelCompleteRef.current) return;

    gameTimeRef.current  += delta;
    waveTimerRef.current -= delta;
    puTimerRef.current   -= delta;
    zoneSoundRef.current -= delta;

    // Tick companion timers
    if (droneTimerRef.current > 0) {
      droneTimerRef.current -= delta;
      if (droneTimerRef.current <= 0) {
        droneTimerRef.current = 0;
        s.setDroneAbility(false, 0, droneCoolRef.current);
      } else {
        s.setDroneAbility(true, droneTimerRef.current, droneCoolRef.current);
      }
    }
    if (droneCoolRef.current > 0) {
      droneCoolRef.current -= delta;
      if (droneCoolRef.current < 0) droneCoolRef.current = 0;
    }
    if (squadTimerRef.current > 0) {
      squadTimerRef.current -= delta;
      if (squadTimerRef.current <= 0) {
        squadTimerRef.current = 0;
        s.setSquadAbility(false, 0, squadCoolRef.current);
      } else {
        s.setSquadAbility(true, squadTimerRef.current, squadCoolRef.current);
      }
    }
    if (squadCoolRef.current > 0) {
      squadCoolRef.current -= delta;
      if (squadCoolRef.current < 0) squadCoolRef.current = 0;
    }

    droneShootRef.current    -= delta;
    squadShootRef.current    -= delta;
    guardianShootRef.current -= delta;

    const now       = gameTimeRef.current;
    const wave      = s.wave;
    const playerPos = s.playerPosition;
    const playerVel = s.playerVelocity;
    const gameMode  = s.gameMode;
    const levelDef  = gameMode === "levels" ? getLevel(s.currentLevel) : null;
    const obs       = obstaclesRef.current;

    const enemies      = Array.isArray(s.enemies)       ? s.enemies       : [];
    const bullets      = Array.isArray(s.bullets)       ? s.bullets       : [];
    const puItems      = Array.isArray(s.powerUpItems)  ? s.powerUpItems  : [];
    const activePUs    = Array.isArray(s.activePowerUps)? s.activePowerUps: [];

    const newTime = s.timeSurvived + delta;

    // ── Safe zone ──────────────────────────────────────────────────────────
    const shrinkMult = levelDef ? levelDef.safeZoneShrinkMult : 1;
    const shrinkRate = (0.018+(wave-1)*0.007)*shrinkMult;
    const newZone    = Math.max(SAFE_ZONE_MIN, s.safeZoneRadius - shrinkRate*delta);
    const playerDist = Math.sqrt(playerPos.x**2+playerPos.z**2);
    let   zoneDmg    = 0;
    if (playerDist > newZone) {
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
    const hasShield  = updatedActivePUs.some((p) => p.type==="shield");

    // ── Power-up item spawn ────────────────────────────────────────────────
    let updatedPuItems = puItems.map((p) => ({...p,lifetime:p.lifetime-delta})).filter((p) => p.lifetime>0);
    if (puTimerRef.current <= 0) {
      const types: PowerUpType[]  = ["speed","shield","rapidfire","heal","drone"];
      const weights               = [0.28,0.22,0.22,0.18,0.10];
      let r=Math.random(), chosen:PowerUpType="speed";
      for (let i=0;i<types.length;i++) { r-=weights[i]; if(r<=0){chosen=types[i];break;} }
      updatedPuItems.push({id:`pu_${++puId}`,position:randomArenaPos(newZone),type:chosen,lifetime:14});
      puTimerRef.current = Math.max(10, 20-wave);
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
        levelCompleteRef.current = true;
        playLevelComplete();
        s.setTimeSurvived(newTime);
        s.completeLevel(s.currentLevel, levelDef.reward);
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
        const nw=wave+1; s.setWave(nw);
        s.setEnemies([...enemies,...buildWaveEndless(nw)]);
        waveTimerRef.current=WAVE_DURATION; playWaveStart();
        setTimeout(() => { waveLockedRef.current=false; }, 200); return;
      }
    }

    // ── Hit detection ──────────────────────────────────────────────────────
    const damageMap  = new Map<string,number>();
    const bulletHits = new Set<string>();
    for (const b of bullets) {
      if (!b.fromPlayer) continue;
      for (const e of enemies) {
        const hitR = e.type==="tank"?1.4:e.type==="bomber"?1.2:0.85;
        if (b.position.distanceTo(e.position)<hitR) { damageMap.set(e.id,(damageMap.get(e.id)??0)+b.damage); bulletHits.add(b.id); }
      }
    }

    // ── Update enemies ─────────────────────────────────────────────────────
    let contactDmg=0, totalCoinsEarned=0;
    const updatedEnemies: Enemy[] = [];
    const newEnemyBullets: Bullet[] = [];

    for (let i=0;i<enemies.length;i++) {
      const e = enemies[i];
      const hp = e.hp-(damageMap.get(e.id)??0);
      if (hp<=0) {
        if (e.type==="bomber") { const d=e.position.distanceTo(playerPos); if(d<5&&!hasShield) contactDmg+=e.baseDamage*(1-d/5); }
        playEnemyDeath(e.type);
        totalCoinsEarned+=COIN_REWARDS[e.type];
        s.recordKill(e.type);
        continue;
      }
      if (damageMap.has(e.id)) playEnemyHit();

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

        if(e.type==="ranged"&&dist>2&&now-lastShot>Math.max(1.2,2.5-wave*0.12)) {
          newEnemyBullets.push({id:`eb_${++bulletId}`,position:new THREE.Vector3(pos.x+pdx/pdist,0.8,pos.z+pdz/pdist),direction:new THREE.Vector3(pdx/pdist,0,pdz/pdist),speed:9,fromPlayer:false,damage:e.baseDamage,lifetime:5});
          lastShot=now;
        }
        if(e.type!=="ranged"&&dist<1.1&&now-lastDamageTime>0.5) { contactDmg+=e.baseDamage*0.5; lastDamageTime=now; }
      }
      updatedEnemies.push({...e,position:pos,hp,lastShot,lastDamageTime});
    }

    // ── Companion shooting ─────────────────────────────────────────────────
    const newCompBullets: Bullet[] = [];
    const sorted = updatedEnemies.length > 0
      ? [...updatedEnemies].sort((a,b) => a.position.distanceTo(playerPos)-b.position.distanceTo(playerPos))
      : [];

    // Drone Strike (2 drones, 15 dmg, shoot every 1.4s)
    if (droneTimerRef.current > 0 && droneShootRef.current <= 0 && sorted.length > 0) {
      DRONE_OFFSETS.forEach((off, di) => {
        const t = sorted[di % sorted.length];
        if (t && t.position.distanceTo(playerPos) < 22) {
          newCompBullets.push(companionShot(playerPos.clone().add(off), t.position, 15));
        }
      });
      droneShootRef.current = 1.4;
    }

    // Squad Backup (2 helpers, 25 dmg, shoot every 1.0s)
    if (squadTimerRef.current > 0 && squadShootRef.current <= 0 && sorted.length > 0) {
      SQUAD_OFFSETS.forEach((off, di) => {
        const t = sorted[di % sorted.length];
        if (t && t.position.distanceTo(playerPos) < 25) {
          newCompBullets.push(companionShot(playerPos.clone().add(off), t.position, 25));
        }
      });
      squadShootRef.current = 1.0;
    }

    // Guardian (permanent, uses gun damage * 0.8, shoot every 0.8s)
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
    let bulletDmg = 0;
    const movedBullets: Bullet[] = [];
    const allBullets = [...bullets, ...newEnemyBullets, ...newCompBullets];
    for (const b of allBullets) {
      if (bulletHits.has(b.id)) continue;
      const np   = b.position.clone().addScaledVector(b.direction, b.speed*delta);
      const life = b.lifetime-delta;
      if (life<=0) continue;
      if (Math.abs(np.x)>ARENA_HALF+1.5||Math.abs(np.z)>ARENA_HALF+1.5) continue;
      if (obstacleHit(np,obs)) continue;
      if (!b.fromPlayer && np.distanceTo(playerPos)<0.75) { bulletDmg+=b.damage; continue; }
      movedBullets.push({...b,position:np,lifetime:life});
    }

    // ── Apply damage & check death ─────────────────────────────────────────
    const totalDmg = hasShield ? zoneDmg*0.3 : contactDmg+bulletDmg+zoneDmg;
    const newHp    = Math.max(0, Math.min(s.maxPlayerHp, s.playerHp-totalDmg));
    if (totalDmg>0.5&&!hasShield) playPlayerHit();

    // ── Commit ─────────────────────────────────────────────────────────────
    s.setTimeSurvived(newTime);
    s.setSafeZoneRadius(newZone);
    s.setEnemies(updatedEnemies);
    s.setBullets(movedBullets);
    s.setPowerUpItems(remainingPUs);
    s.setActivePowerUps(updatedActivePUs);
    const kills = enemies.length-updatedEnemies.length;
    if (kills>0) { s.setKillCount(s.killCount+kills); s.addSessionCoins(totalCoinsEarned); }

    if (newHp!==s.playerHp) {
      s.setPlayerHp(newHp);
      if (newHp<=0) {
        if (s.reviveAvailable) {
          s.revive();
        } else {
          playGameOver();
          s.finishGame();
        }
      }
    }
  });

  return null;
}
