import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy, EnemyType, Bullet } from "./store";
import { ARENA_SIZE, obstacles } from "./Arena";

const ARENA_HALF = ARENA_SIZE / 2 - 1.5;
const WAVE_INTERVAL = 20;

const ENEMY_DEFS: Record<EnemyType, { hp: number; speed: number; damage: number; alertRadius: number }> = {
  chaser: { hp: 30, speed: 5.5, damage: 12, alertRadius: 30 },
  tank: { hp: 120, speed: 2.2, damage: 25, alertRadius: 20 },
  ranged: { hp: 50, speed: 3.0, damage: 18, alertRadius: 35 },
};

const KILL_SCORES: Record<EnemyType, number> = {
  chaser: 10,
  tank: 30,
  ranged: 20,
};

function randomSpawnPos(): THREE.Vector3 {
  const side = Math.floor(Math.random() * 4);
  const h = ARENA_HALF;
  switch (side) {
    case 0: return new THREE.Vector3((Math.random() * 2 - 1) * h, 0.7, -h);
    case 1: return new THREE.Vector3((Math.random() * 2 - 1) * h, 0.7, h);
    case 2: return new THREE.Vector3(-h, 0.7, (Math.random() * 2 - 1) * h);
    default: return new THREE.Vector3(h, 0.7, (Math.random() * 2 - 1) * h);
  }
}

function spawnWave(wave: number): Enemy[] {
  const count = 3 + wave * 2;
  const types: EnemyType[] = ["chaser", "tank", "ranged"];
  return Array.from({ length: count }, (_, i) => {
    const typeIndex = wave === 1 && i < 3 ? 0 : Math.floor(Math.random() * Math.min(3, wave + 1));
    const type: EnemyType = types[typeIndex];
    const def = ENEMY_DEFS[type];
    return {
      id: `enemy_w${wave}_${i}_${Date.now()}_${Math.random()}`,
      position: randomSpawnPos(),
      hp: def.hp,
      maxHp: def.hp,
      type,
      speed: def.speed,
      damage: def.damage,
      lastShot: 0,
      lastDamageTime: -999,
      alertRadius: def.alertRadius,
    } as Enemy;
  });
}

let idCounter = 0;

export default function GameLogic() {
  const gameTimeRef = useRef(0);
  const waveTimerRef = useRef(WAVE_INTERVAL);
  const waveSpawningRef = useRef(false);
  const initializedRef = useRef(false);

  // Spawn first wave after mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const state = useGameStore.getState();
    if (state.phase === "playing") {
      state.setWave(1);
      state.setEnemies(spawnWave(1));
      state.setBullets([]);
      waveTimerRef.current = WAVE_INTERVAL;
      gameTimeRef.current = 0;
    }
  }, []);

  // Watch for restart (phase flip gameover -> playing)
  useEffect(() => {
    let prev = useGameStore.getState().phase;
    const unsub = useGameStore.subscribe((state) => {
      if (state.phase === "playing" && prev === "gameover") {
        waveTimerRef.current = WAVE_INTERVAL;
        gameTimeRef.current = 0;
        waveSpawningRef.current = false;
        state.setWave(1);
        state.setEnemies(spawnWave(1));
        state.setBullets([]);
      }
      prev = state.phase;
    });
    return unsub;
  }, []);

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    if (store.phase !== "playing") return;
    if (!initializedRef.current) return;

    gameTimeRef.current += delta;
    waveTimerRef.current -= delta;

    const playerPos = store.playerPosition;
    const now = gameTimeRef.current;

    // Guard against non-array states (safety)
    const enemies: Enemy[] = Array.isArray(store.enemies) ? store.enemies : [];
    const bullets: Bullet[] = Array.isArray(store.bullets) ? store.bullets : [];

    // ---- WAVE SPAWNING ----
    if ((waveTimerRef.current <= 0 || enemies.length === 0) && !waveSpawningRef.current) {
      waveSpawningRef.current = true;
      const newWave = store.wave + 1;
      store.setWave(newWave);
      const newEnemies = spawnWave(newWave);
      store.setEnemies([...enemies, ...newEnemies]);
      waveTimerRef.current = WAVE_INTERVAL;
      setTimeout(() => { waveSpawningRef.current = false; }, 500);
      return;
    }

    // ---- BULLET DAMAGE MAP ----
    const damageMap = new Map<string, number>();
    const bulletHits = new Set<string>();

    for (const bullet of bullets) {
      if (!bullet.fromPlayer) continue;
      for (const enemy of enemies) {
        const dist = bullet.position.distanceTo(enemy.position);
        const hitRadius = enemy.type === "tank" ? 1.3 : 0.9;
        if (dist < hitRadius) {
          damageMap.set(enemy.id, (damageMap.get(enemy.id) ?? 0) + bullet.damage);
          bulletHits.add(bullet.id);
        }
      }
    }

    // ---- UPDATE ENEMIES ----
    let newPlayerHp = store.playerHp;
    let scoreGain = 0;
    const updatedEnemies: Enemy[] = [];
    const newEnemyBullets: Bullet[] = [];

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      const hp = enemy.hp - (damageMap.get(enemy.id) ?? 0);

      if (hp <= 0) {
        scoreGain += KILL_SCORES[enemy.type];
        continue;
      }

      const pos = enemy.position.clone();
      let lastShot = enemy.lastShot;
      let lastDamageTime = enemy.lastDamageTime;

      const dx = playerPos.x - pos.x;
      const dz = playerPos.z - pos.z;
      const distToPlayer = Math.sqrt(dx * dx + dz * dz);

      if (distToPlayer < enemy.alertRadius) {
        let moveX = 0;
        let moveZ = 0;

        if (enemy.type === "ranged") {
          const preferred = 8;
          if (distToPlayer > preferred + 1.5) {
            moveX = dx / distToPlayer;
            moveZ = dz / distToPlayer;
          } else if (distToPlayer < preferred - 1.5) {
            moveX = -dx / distToPlayer;
            moveZ = -dz / distToPlayer;
          } else {
            moveX = dz / distToPlayer;
            moveZ = -dx / distToPlayer;
          }
        } else {
          if (distToPlayer > 0.6) {
            moveX = dx / distToPlayer;
            moveZ = dz / distToPlayer;
          }
        }

        // Separation
        for (let j = 0; j < enemies.length; j++) {
          if (j === i) continue;
          const other = enemies[j];
          const sdx = pos.x - other.position.x;
          const sdz = pos.z - other.position.z;
          const sd = Math.sqrt(sdx * sdx + sdz * sdz);
          const minDist = 1.4;
          if (sd < minDist && sd > 0.001) {
            const push = (minDist - sd) / sd;
            moveX += sdx * push * 0.6;
            moveZ += sdz * push * 0.6;
          }
        }

        const ml = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (ml > 0) {
          pos.x += (moveX / ml) * enemy.speed * delta;
          pos.z += (moveZ / ml) * enemy.speed * delta;
        }

        // Obstacle collision
        for (const obs of obstacles) {
          const hw = obs.w / 2 + 0.8;
          const hd = obs.d / 2 + 0.8;
          const odx = pos.x - obs.x;
          const odz = pos.z - obs.z;
          if (Math.abs(odx) < hw && Math.abs(odz) < hd) {
            if (Math.abs(odx) / hw < Math.abs(odz) / hd) {
              pos.x = obs.x + Math.sign(odx) * hw;
            } else {
              pos.z = obs.z + Math.sign(odz) * hd;
            }
          }
        }

        pos.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, pos.x));
        pos.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, pos.z));

        // Ranged shooting
        if (enemy.type === "ranged" && now - lastShot > 2.5 && distToPlayer > 0) {
          newEnemyBullets.push({
            id: `eb_${++idCounter}`,
            position: new THREE.Vector3(
              pos.x + (dx / distToPlayer) * 1.0,
              0.8,
              pos.z + (dz / distToPlayer) * 1.0
            ),
            direction: new THREE.Vector3(dx / distToPlayer, 0, dz / distToPlayer),
            speed: 8,
            fromPlayer: false,
            damage: enemy.damage,
            lifetime: 5,
          });
          lastShot = now;
        }

        // Contact damage (chaser/tank)
        if (enemy.type !== "ranged" && distToPlayer < 1.2) {
          if (now - lastDamageTime > 0.6) {
            newPlayerHp -= enemy.damage * 0.5;
            lastDamageTime = now;
          }
        }
      }

      updatedEnemies.push({ ...enemy, position: pos, hp, lastShot, lastDamageTime });
    }

    // ---- UPDATE BULLETS ----
    const movedBullets: Bullet[] = [];

    for (const bullet of bullets) {
      if (bulletHits.has(bullet.id)) continue;

      const newPos = bullet.position.clone().addScaledVector(bullet.direction, bullet.speed * delta);
      const newLife = bullet.lifetime - delta;

      if (newLife <= 0) continue;
      if (Math.abs(newPos.x) > ARENA_HALF + 2 || Math.abs(newPos.z) > ARENA_HALF + 2) continue;

      // Enemy bullets vs player
      if (!bullet.fromPlayer) {
        const dist = newPos.distanceTo(playerPos);
        if (dist < 0.7) {
          newPlayerHp -= bullet.damage;
          continue;
        }
      }

      movedBullets.push({ ...bullet, position: newPos, lifetime: newLife });
    }

    // Move and add new enemy bullets
    for (const bullet of newEnemyBullets) {
      const newPos = bullet.position.clone().addScaledVector(bullet.direction, bullet.speed * delta);
      const dist = newPos.distanceTo(playerPos);
      if (dist < 0.7) {
        newPlayerHp -= bullet.damage;
        continue;
      }
      movedBullets.push({ ...bullet, position: newPos, lifetime: bullet.lifetime - delta });
    }

    // ---- APPLY STATE ----
    store.setEnemies(updatedEnemies);
    store.setBullets(movedBullets);

    if (scoreGain > 0) {
      store.setScore(store.score + scoreGain);
    }

    const clampedHp = Math.max(0, Math.min(store.maxPlayerHp, newPlayerHp));
    if (clampedHp !== store.playerHp) {
      store.setPlayerHp(clampedHp);
      if (clampedHp <= 0) {
        store.setPhase("gameover");
      }
    }
  });

  return null;
}
