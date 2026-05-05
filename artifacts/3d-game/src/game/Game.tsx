import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./store";
import Arena from "./Arena";
import Player from "./Player";
import Enemies from "./Enemies";
import Bullets from "./Bullets";
import GameLogic from "./GameLogic";
import CameraController from "./CameraController";
import HUD from "./HUD";
import GameOverScreen from "./GameOverScreen";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
}

const KEY_MAP = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
];

export default function Game() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a", position: "relative", overflow: "hidden" }}>
      <KeyboardControls map={KEY_MAP}>
        <Canvas
          shadows
          camera={{ position: [0, 16, 10], fov: 60, near: 0.1, far: 500 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[20, 40, 20]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={200}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          <pointLight position={[0, 10, 0]} intensity={0.3} color="#4488ff" />
          <fog attach="fog" args={["#0a0a0a", 40, 80]} />

          {/* Scene */}
          <Arena />
          <Player />
          <Enemies />
          <Bullets />

          {/* Logic & Camera (no render output) */}
          <GameLogic />
          <CameraController />
        </Canvas>
      </KeyboardControls>

      {/* HUD overlay */}
      {phase === "playing" && <HUD />}

      {/* Game Over overlay */}
      {phase === "gameover" && <GameOverScreen />}
    </div>
  );
}
