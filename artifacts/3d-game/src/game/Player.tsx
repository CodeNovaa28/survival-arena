import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./store";
import { ARENA_HALF, obstacles } from "./Arena";
import { playShoot } from "./sounds";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
}

const BASE_SPEED = 7;
const PLAYER_RADIUS = 0.4;
const SHOOT_COOLDOWN_BASE = 0.25;

const _vel = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _groundTarget = new THREE.Vector3();
const _smoothVel = new THREE.Vector3();

export default function Player() {
  const meshRef      = useRef<THREE.Group>(null);
  const posRef       = useRef(new THREE.Vector3(0, 0, 0));
  const velRef       = useRef(new THREE.Vector3(0, 0, 0));
  const aimRef       = useRef(new THREE.Vector3(0, 0, -1));
  const cooldownRef  = useRef(0);
  const shieldPulse  = useRef(0);

  const [, getControls] = useKeyboardControls<Controls>();
  const { camera, gl }  = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const updateAim = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      if (_raycaster.ray.intersectPlane(_groundPlane, _groundTarget)) {
        _dir.subVectors(_groundTarget, posRef.current).setY(0);
        if (_dir.lengthSq() > 0.01) aimRef.current.copy(_dir.normalize());
      }
    };

    const tryShoot = (clientX: number, clientY: number) => {
      const store = useGameStore.getState();
      if (store.phase !== "playing") return;
      if (cooldownRef.current > 0) return;

      updateAim(clientX, clientY);
      const dir = aimRef.current.clone();

      const hasRapid = store.activePowerUps.some((p) => p.type === "rapidfire");
      const cooldown = hasRapid ? SHOOT_COOLDOWN_BASE * 0.4 : SHOOT_COOLDOWN_BASE;

      const bulletPos = posRef.current.clone();
      bulletPos.y = 0.8;
      bulletPos.addScaledVector(dir, 0.9);

      const current = useGameStore.getState().bullets;
      useGameStore.getState().setBullets([
        ...(Array.isArray(current) ? current : []),
        {
          id: `pb_${Date.now()}_${Math.random()}`,
          position: bulletPos,
          direction: dir,
          speed: 22,
          fromPlayer: true,
          damage: 25,
          lifetime: 3,
        },
      ]);
      cooldownRef.current = cooldown;
      playShoot();
    };

    const onMouseMove = (e: MouseEvent) => updateAim(e.clientX, e.clientY);
    const onClick     = (e: MouseEvent) => tryShoot(e.clientX, e.clientY);
    const onPointerDown = (e: PointerEvent) => { if (e.button === 0) tryShoot(e.clientX, e.clientY); };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("pointerdown", onPointerDown);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    if (store.phase !== "playing") return;

    const mesh = meshRef.current;
    if (!mesh) return;

    cooldownRef.current = Math.max(0, cooldownRef.current - delta);

    // Speed boost
    const hasSpeed = store.activePowerUps.some((p) => p.type === "speed");
    const speed = BASE_SPEED * (hasSpeed ? 1.6 : 1);

    // Input
    const ctrl = getControls();
    _vel.set(0, 0, 0);
    if (ctrl.forward) _vel.z -= 1;
    if (ctrl.back)    _vel.z += 1;
    if (ctrl.left)    _vel.x -= 1;
    if (ctrl.right)   _vel.x += 1;

    if (_vel.lengthSq() > 0) _vel.normalize().multiplyScalar(speed * delta);

    // Smooth velocity for store (used by predictive AI)
    _smoothVel.lerp(_vel, 0.3);
    store.setPlayerVelocity(_smoothVel.clone().divideScalar(delta || 0.016));

    posRef.current.add(_vel);

    // Arena clamp
    posRef.current.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, posRef.current.x));
    posRef.current.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, posRef.current.z));

    // Obstacle collision
    for (const obs of obstacles) {
      const hw = obs.w / 2 + PLAYER_RADIUS;
      const hd = obs.d / 2 + PLAYER_RADIUS;
      const dx = posRef.current.x - obs.x;
      const dz = posRef.current.z - obs.z;
      if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
        Math.abs(dx) / hw < Math.abs(dz) / hd
          ? (posRef.current.x = obs.x + Math.sign(dx) * hw)
          : (posRef.current.z = obs.z + Math.sign(dz) * hd);
      }
    }

    mesh.position.set(posRef.current.x, 0, posRef.current.z);
    store.setPlayerPosition(posRef.current.clone());

    // Rotate toward aim
    const angle = Math.atan2(aimRef.current.x, aimRef.current.z);
    mesh.rotation.y = angle;

    // Shield pulse
    shieldPulse.current += delta * 3;
  });

  return (
    <group ref={meshRef}>
      {/* Shield aura */}
      <ShieldAura pulseRef={shieldPulse} />
      {/* Body */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[0.6, 1.0, 0.45]} />
        <meshStandardMaterial color="#2563eb" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Chest stripe */}
      <mesh position={[0, 0.82, -0.23]}>
        <boxGeometry args={[0.35, 0.3, 0.02]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.55, 0]}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.57, -0.215]}>
        <boxGeometry args={[0.28, 0.1, 0.02]} />
        <meshBasicMaterial color="#bfdbfe" />
      </mesh>
      {/* Gun barrel */}
      <mesh castShadow position={[0, 0.8, -0.6]}>
        <boxGeometry args={[0.1, 0.1, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.18, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.3]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh position={[0.18, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.3]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
    </group>
  );
}

function ShieldAura({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const activePowerUps = useGameStore((s) => s.activePowerUps);
  const hasShield = activePowerUps.some((p) => p.type === "shield");

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.visible = hasShield;
    if (hasShield) {
      const scale = 1 + Math.sin(pulseRef.current) * 0.08;
      meshRef.current.scale.setScalar(scale);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(pulseRef.current) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.8, 0]}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} side={THREE.FrontSide} />
    </mesh>
  );
}
