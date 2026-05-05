import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./store";
import { ARENA_SIZE, obstacles } from "./Arena";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
}

const PLAYER_SPEED = 7;
const PLAYER_SIZE = 0.5;
const ARENA_HALF = ARENA_SIZE / 2 - 1;
const SHOOT_COOLDOWN = 0.25;

const _dir = new THREE.Vector3();
const _vel = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _target = new THREE.Vector3();

export default function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef(new THREE.Vector3(0, 0.8, 0));
  const shootCooldownRef = useRef(0);
  const lastMouseWorldRef = useRef(new THREE.Vector3(0, 0.8, 5));

  const [, getControls] = useKeyboardControls<Controls>();
  const { camera, gl } = useThree();

  const setPlayerHp = useGameStore((s) => s.setPlayerHp);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const setBullets = useGameStore((s) => s.setBullets);
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      _raycaster.ray.intersectPlane(_groundPlane, _target);
      if (_target) {
        lastMouseWorldRef.current.copy(_target);
      }
    };

    const handleShoot = (clientX: number, clientY: number) => {
      if (phase !== "playing") return;
      if (shootCooldownRef.current > 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      _raycaster.ray.intersectPlane(_groundPlane, _target);

      const dir = new THREE.Vector3()
        .subVectors(_target, posRef.current)
        .setY(0)
        .normalize();

      if (dir.lengthSq() > 0.01) {
        const bulletPos = posRef.current.clone().addScaledVector(dir, 0.8);
        bulletPos.y = 0.8;
        // Get current bullets from store directly (setBullets takes an array, not an updater fn)
        const currentBullets = useGameStore.getState().bullets;
        useGameStore.getState().setBullets([
          ...(Array.isArray(currentBullets) ? currentBullets : []),
          {
            id: `pb_${Date.now()}_${Math.random()}`,
            position: bulletPos,
            direction: dir,
            speed: 20,
            fromPlayer: true,
            damage: 25,
            lifetime: 3,
          },
        ]);
        shootCooldownRef.current = SHOOT_COOLDOWN;
      }
    };

    const handleClick = (e: MouseEvent) => handleShoot(e.clientX, e.clientY);
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 0) handleShoot(e.clientX, e.clientY);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("pointerdown", handlePointerDown);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [camera, gl, phase, setBullets]);

  useFrame((_, delta) => {
    if (phase !== "playing") return;
    const mesh = meshRef.current;
    if (!mesh) return;

    shootCooldownRef.current -= delta;

    const controls = getControls();
    _vel.set(0, 0, 0);
    if (controls.forward) _vel.z -= 1;
    if (controls.back) _vel.z += 1;
    if (controls.left) _vel.x -= 1;
    if (controls.right) _vel.x += 1;

    if (_vel.lengthSq() > 0) {
      _vel.normalize().multiplyScalar(PLAYER_SPEED * delta);
      posRef.current.add(_vel);
    }

    // Clamp to arena
    posRef.current.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, posRef.current.x));
    posRef.current.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, posRef.current.z));

    // Obstacle collision
    for (const obs of obstacles) {
      const hw = obs.w / 2 + PLAYER_SIZE;
      const hd = obs.d / 2 + PLAYER_SIZE;
      const dx = posRef.current.x - obs.x;
      const dz = posRef.current.z - obs.z;
      if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
        if (Math.abs(dx) / hw < Math.abs(dz) / hd) {
          posRef.current.x = obs.x + Math.sign(dx) * hw;
        } else {
          posRef.current.z = obs.z + Math.sign(dz) * hd;
        }
      }
    }

    mesh.position.copy(posRef.current);

    // Rotate toward mouse
    const mouseWorld = lastMouseWorldRef.current;
    _dir.subVectors(mouseWorld, posRef.current).setY(0);
    if (_dir.lengthSq() > 0.01) {
      const angle = Math.atan2(_dir.x, _dir.z);
      mesh.rotation.y = angle;
    }

    setPlayerPosition(posRef.current.clone());
  });

  return (
    <group ref={meshRef} position={[0, 0.8, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 1.0, 0.4]} />
        <meshLambertMaterial color="#3b82f6" />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshLambertMaterial color="#60a5fa" />
      </mesh>
      {/* Gun */}
      <mesh castShadow position={[0, 0.1, -0.45]}>
        <boxGeometry args={[0.1, 0.1, 0.4]} />
        <meshLambertMaterial color="#1e293b" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.12, 0.82, -0.22]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshLambertMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.12, 0.82, -0.22]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshLambertMaterial color="#fff" />
      </mesh>
    </group>
  );
}
