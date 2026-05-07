import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";
import { getMeleeWeapon } from "./gameMeleeWeapons";

export default function MeleeEffect() {
  const outerRef = useRef<THREE.Mesh>(null);
  const matRef   = useRef<THREE.MeshBasicMaterial>(null);
  const progRef  = useRef(0);
  const swWasRef = useRef(false);
  const colRef   = useRef(new THREE.Color("#f97316"));

  useFrame((_, delta) => {
    const s      = useGameStore.getState();
    const weapon = getMeleeWeapon(s.selectedMelee);
    const mesh   = outerRef.current;
    const mat    = matRef.current;
    if (!mesh || !mat) return;

    if (s.meleeSwinging) {
      if (!swWasRef.current) {
        progRef.current = 0;
        swWasRef.current = true;
        colRef.current.set(weapon.color);
      }
      progRef.current = Math.min(1, progRef.current + delta / 0.38);
    } else {
      swWasRef.current = false;
      progRef.current  = 0;
    }

    const prog = progRef.current;
    if (!s.meleeSwinging && prog === 0) {
      mesh.visible = false;
      return;
    }

    const p = s.playerPosition;
    mesh.position.set(p.x, 0.12, p.z);
    mesh.visible = true;

    const scl = (0.15 + prog * 0.85) * weapon.range;
    mesh.scale.setScalar(scl);
    mat.color.copy(colRef.current);
    mat.opacity = 0.6 * (1 - prog * 0.9);
  });

  return (
    <mesh ref={outerRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.45, 1.0, 40]} />
      <meshBasicMaterial ref={matRef} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}
