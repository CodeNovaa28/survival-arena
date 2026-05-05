import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "./store";

const _target = new THREE.Vector3();
const CAMERA_HEIGHT = 16;
const CAMERA_OFFSET_Z = 10;
const LERP_SPEED = 6;

export default function CameraController() {
  const { camera } = useThree();
  const phase = useGameStore((s) => s.phase);

  useFrame((_, delta) => {
    const playerPos = useGameStore.getState().playerPosition;
    _target.set(
      playerPos.x,
      playerPos.y + CAMERA_HEIGHT,
      playerPos.z + CAMERA_OFFSET_Z
    );
    camera.position.lerp(_target, Math.min(1, LERP_SPEED * delta));
    camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
  });

  return null;
}
