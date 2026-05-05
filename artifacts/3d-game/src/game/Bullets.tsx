import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Bullet } from "./store";

function BulletMesh({ bullet }: { bullet: Bullet }) {
  return (
    <mesh position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
      <sphereGeometry args={[0.12, 6, 6]} />
      <meshBasicMaterial color={bullet.fromPlayer ? "#facc15" : "#f43f5e"} />
    </mesh>
  );
}

export default function Bullets() {
  const bullets = useGameStore((s) => s.bullets);
  if (!Array.isArray(bullets)) return null;
  return (
    <>
      {bullets.map((b) => (
        <BulletMesh key={b.id} bullet={b} />
      ))}
    </>
  );
}
