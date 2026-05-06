import * as THREE from "three";
import { useGameStore, Bullet } from "./store";

function BulletMesh({ bullet }: { bullet: Bullet }) {
  return (
    <mesh position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
      <sphereGeometry args={[bullet.fromPlayer ? 0.13 : 0.1, 6, 6]} />
      <meshBasicMaterial color={bullet.fromPlayer ? "#fde68a" : "#f43f5e"} />
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
