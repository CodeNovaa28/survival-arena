import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./store";
import { ARENA_HALF, getObstacles } from "./Arena";
import { CHARACTER_SKINS } from "./gameSkins";
import { getGun } from "./gameGuns";
import { playShoot, playShootShotgun, playShootSniper, playShootPlasma } from "./sounds";

enum Controls { forward="forward", back="back", left="left", right="right" }

const PLAYER_RADIUS = 0.4;
const BASE_SPEED    = 7;

const _raycaster    = new THREE.Raycaster();
const _groundPlane  = new THREE.Plane(new THREE.Vector3(0,1,0),0);
const _groundTarget = new THREE.Vector3();
const _smoothVel    = new THREE.Vector3();

export default function Player() {
  const meshRef    = useRef<THREE.Group>(null);
  const posRef     = useRef(new THREE.Vector3(0,0,0));
  const aimRef     = useRef(new THREE.Vector3(0,0,-1));
  const cooldownRef= useRef(0);
  const shieldRef  = useRef(0);

  const [, getControls] = useKeyboardControls<Controls>();
  const { camera, gl }  = useThree();

  // Get skin + gun at mount (read once — won't change during match)
  const skinId = useGameStore.getState().selectedSkin;
  const skin   = CHARACTER_SKINS.find((s) => s.id === skinId) ?? CHARACTER_SKINS[0];

  useEffect(() => {
    const canvas = gl.domElement;

    const updateAim = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((cx - rect.left) / rect.width)  * 2 - 1;
      const ny = -((cy - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      if (_raycaster.ray.intersectPlane(_groundPlane, _groundTarget)) {
        const d = _groundTarget.clone().sub(posRef.current).setY(0);
        if (d.lengthSq() > 0.01) aimRef.current.copy(d.normalize());
      }
    };

    const tryShoot = (cx: number, cy: number) => {
      const store = useGameStore.getState();
      if (store.phase !== "playing" || store.paused) return;
      if (cooldownRef.current > 0) return;

      updateAim(cx, cy);

      const gun     = getGun(store.tempWeapon ?? store.selectedGun);
      const hasRapid= store.activePowerUps.some((p) => p.type === "rapidfire");
      const cd      = hasRapid ? gun.fireRate * 0.4 : gun.fireRate;
      cooldownRef.current = cd;

      // Play sound
      if (gun.id === "shotgun") playShootShotgun();
      else if (gun.id === "sniper") playShootSniper();
      else if (gun.id === "plasma" || gun.id === "rapidstrike") playShootPlasma();
      else playShoot();

      // Build bullet directions (multi-shot spread)
      const spreadAngles: number[] =
        gun.bulletCount === 1
          ? [gun.spread > 0 ? (Math.random()-0.5)*gun.spread : 0]
          : Array.from({ length: gun.bulletCount }, (_, i) =>
              gun.bulletCount === 1 ? 0
                : -gun.spread + (i / (gun.bulletCount-1)) * gun.spread * 2
            );

      const aim    = aimRef.current;
      const bpBase = posRef.current.clone();
      bpBase.y = 0.8;

      const newBullets = spreadAngles.map((angleDeg) => {
        const a = (angleDeg * Math.PI) / 180;
        const dir = new THREE.Vector3(
          aim.x * Math.cos(a) - aim.z * Math.sin(a),
          0,
          aim.x * Math.sin(a) + aim.z * Math.cos(a)
        ).normalize();
        return {
          id:        `pb_${Date.now()}_${Math.random()}_${angleDeg}`,
          position:  bpBase.clone().addScaledVector(dir, 0.9),
          direction: dir,
          speed:     gun.bulletSpeed,
          fromPlayer:true,
          damage:    gun.damage,
          lifetime:  gun.range,
        };
      });

      const cur = useGameStore.getState().bullets;
      store.setBullets([...(Array.isArray(cur) ? cur : []), ...newBullets]);
    };

    const onMove      = (e: MouseEvent)   => updateAim(e.clientX, e.clientY);
    const onClick     = (e: MouseEvent)   => tryShoot(e.clientX, e.clientY);
    const onPtrDown   = (e: PointerEvent) => { if (e.button === 0) tryShoot(e.clientX, e.clientY); };

    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("click",      onClick);
    canvas.addEventListener("pointerdown",onPtrDown);
    return () => {
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("click",      onClick);
      canvas.removeEventListener("pointerdown",onPtrDown);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    if (store.phase !== "playing" || store.paused) return;
    const mesh = meshRef.current;
    if (!mesh) return;

    cooldownRef.current = Math.max(0, cooldownRef.current - delta);
    shieldRef.current  += delta * 3;

    const hasSpeed = store.activePowerUps.some((p) => p.type === "speed");
    const speed    = BASE_SPEED * (hasSpeed ? 1.6 : 1);
    const obs      = getObstacles(store.selectedMap);

    const ctrl = getControls();
    const vel  = new THREE.Vector3(0,0,0);
    if (ctrl.forward) vel.z -= 1;
    if (ctrl.back)    vel.z += 1;
    if (ctrl.left)    vel.x -= 1;
    if (ctrl.right)   vel.x += 1;

    if (vel.lengthSq() > 0) vel.normalize().multiplyScalar(speed * delta);

    _smoothVel.lerp(vel, 0.35);
    store.setPlayerVelocity(_smoothVel.clone().divideScalar(delta || 0.016));

    posRef.current.add(vel);
    posRef.current.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, posRef.current.x));
    posRef.current.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, posRef.current.z));

    for (const o of obs) {
      const hw = o.w/2 + PLAYER_RADIUS, hd = o.d/2 + PLAYER_RADIUS;
      const dx = posRef.current.x - o.x, dz = posRef.current.z - o.z;
      if (Math.abs(dx)<hw && Math.abs(dz)<hd) {
        Math.abs(dx)/hw < Math.abs(dz)/hd
          ? (posRef.current.x = o.x + Math.sign(dx)*hw)
          : (posRef.current.z = o.z + Math.sign(dz)*hd);
      }
    }

    mesh.position.set(posRef.current.x, 0, posRef.current.z);
    store.setPlayerPosition(posRef.current.clone());
    mesh.rotation.y = Math.atan2(aimRef.current.x, aimRef.current.z) + Math.PI;
  });

  const hasShield = useGameStore((s) => s.activePowerUps.some((p) => p.type === "shield"));

  return (
    <group ref={meshRef}>
      {/* Shield aura */}
      <ShieldAura active={hasShield} pulseRef={shieldRef} />

      {/* Body */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[0.6, 1.0, 0.45]} />
        <meshStandardMaterial color={skin.bodyColor} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Chest stripe */}
      <mesh position={[0, 0.82, -0.23]}>
        <boxGeometry args={[0.32, 0.28, 0.02]} />
        <meshBasicMaterial color={skin.accentColor} transparent opacity={0.8} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.55, 0]}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color={skin.headColor} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.57, -0.215]}>
        <boxGeometry args={[0.28, 0.1, 0.02]} />
        <meshBasicMaterial color={skin.accentColor} transparent opacity={0.9} />
      </mesh>
      {/* Gun barrel */}
      <mesh castShadow position={[0, 0.8, -0.6]}>
        <boxGeometry args={[0.1, 0.1, 0.38]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.18, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.3]} />
        <meshStandardMaterial color={skin.legColor} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.18, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.3]} />
        <meshStandardMaterial color={skin.legColor} />
      </mesh>
    </group>
  );
}

function ShieldAura({ active, pulseRef }: { active: boolean; pulseRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.visible = active;
    if (active) {
      const s = 1 + Math.sin(pulseRef.current) * 0.08;
      meshRef.current.scale.setScalar(s);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 + Math.sin(pulseRef.current) * 0.08;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0.8, 0]}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} side={THREE.FrontSide} />
    </mesh>
  );
}
