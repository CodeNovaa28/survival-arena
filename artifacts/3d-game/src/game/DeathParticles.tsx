import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";

const PARTICLE_COUNT = 28;
const GRAVITY = 12;
const COLORS = ["#ef4444", "#f97316", "#facc15", "#ffffff", "#ff6b6b", "#fca5a5", "#fcd34d"];

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  isCube: boolean;
  rotVel: THREE.Euler;
}

function buildParticles(origin: THREE.Vector3): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle     = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    const elevation = Math.random() * Math.PI * 0.55 + 0.1;
    const speed     = 4 + Math.random() * 9;
    const maxLife   = 1.2 + Math.random() * 1.0;
    return {
      pos: origin.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.5 + Math.random() * 0.6,
        (Math.random() - 0.5) * 0.4,
      )),
      vel: new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.sin(elevation) * speed + 1.5,
        Math.sin(angle) * Math.cos(elevation) * speed,
      ),
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      life:    maxLife,
      maxLife,
      size:    0.07 + Math.random() * 0.22,
      isCube:  i % 3 === 0,
      rotVel:  new THREE.Euler(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
      ),
    };
  });
}

function ParticleSystem({ origin }: { origin: THREE.Vector3 }) {
  const particles  = useRef<Particle[]>(buildParticles(origin));
  const meshRefs   = useRef<(THREE.Mesh | null)[]>([]);
  const ringRef    = useRef<THREE.Mesh>(null);
  const ringAge    = useRef(0);

  useFrame((_, delta) => {
    ringAge.current += delta;
    if (ringRef.current) {
      const s = 1 + ringAge.current * 12;
      ringRef.current.scale.set(s, s, s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.7 - ringAge.current * 1.2);
    }

    for (let i = 0; i < particles.current.length; i++) {
      const p   = particles.current[i];
      const mesh= meshRefs.current[i];
      if (!mesh) continue;
      if (p.life <= 0) { mesh.visible = false; continue; }

      p.life     -= delta;
      p.vel.y    -= GRAVITY * delta;
      p.pos.addScaledVector(p.vel, delta);
      if (p.isCube) {
        mesh.rotation.x += p.rotVel.x * delta;
        mesh.rotation.y += p.rotVel.y * delta;
        mesh.rotation.z += p.rotVel.z * delta;
      }

      mesh.position.copy(p.pos);
      const alpha = Math.max(0, p.life / p.maxLife);
      mesh.scale.setScalar(alpha);
      (mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
    }
  });

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
  const boxGeo    = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <group>
      {/* Shockwave ring */}
      <mesh ref={ringRef} position={[origin.x, 0.05, origin.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.55, 24]} />
        <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Particles */}
      {particles.current.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={p.pos.toArray()}
          geometry={p.isCube ? boxGeo : sphereGeo}
          scale={p.size}
        >
          <meshBasicMaterial color={p.color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function DeathParticles() {
  const playerDead = useGameStore((s) => s.playerDead);
  const deathPos   = useGameStore((s) => s.deathPos);

  if (!playerDead) return null;
  return <ParticleSystem origin={deathPos} />;
}
