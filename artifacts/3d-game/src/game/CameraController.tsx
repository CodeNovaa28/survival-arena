import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";

const _target = new THREE.Vector3();
const CAMERA_H = 17;
const CAMERA_Z = 11;
const LERP     = 5;

export default function CameraController() {
  const { camera } = useThree();
  const shakeTimeRef = useRef(0);

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    const p = s.playerPosition;
    _target.set(p.x, p.y + CAMERA_H, p.z + CAMERA_Z);
    camera.position.lerp(_target, Math.min(1, LERP * delta));

    if (s.levelCompleting) {
      shakeTimeRef.current += delta;
      const t = shakeTimeRef.current;
      const intensity = Math.min(t * t * 0.35, 2.2);
      camera.position.x += (Math.random() - 0.5) * intensity;
      camera.position.y += (Math.random() - 0.5) * intensity * 0.5;
      camera.position.z += (Math.random() - 0.5) * intensity;
    } else {
      shakeTimeRef.current = 0;
    }

    camera.lookAt(p.x, p.y, p.z);
  });

  return null;
}
