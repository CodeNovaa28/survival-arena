import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";

const _target = new THREE.Vector3();
const CAMERA_H = 17;
const CAMERA_Z = 11;
const LERP     = 5;

export default function CameraController() {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const p = useGameStore.getState().playerPosition;
    _target.set(p.x, p.y + CAMERA_H, p.z + CAMERA_Z);
    camera.position.lerp(_target, Math.min(1, LERP * delta));
    camera.lookAt(p.x, p.y, p.z);
  });

  return null;
}
