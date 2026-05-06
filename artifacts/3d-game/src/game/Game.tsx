import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useGameStore } from "./store";
import Arena from "./Arena";
import Player from "./Player";
import Enemies from "./Enemies";
import Bullets from "./Bullets";
import PowerUps from "./PowerUps";
import SafeZone from "./SafeZone";
import GameLogic from "./GameLogic";
import CameraController from "./CameraController";
import HUD from "./HUD";
import StartScreen from "./StartScreen";
import GameOverScreen from "./GameOverScreen";

enum Controls {
  forward = "forward",
  back    = "back",
  left    = "left",
  right   = "right",
}

const KEY_MAP = [
  { name: Controls.forward, keys: ["ArrowUp",    "KeyW"] },
  { name: Controls.back,    keys: ["ArrowDown",  "KeyS"] },
  { name: Controls.left,    keys: ["ArrowLeft",  "KeyA"] },
  { name: Controls.right,   keys: ["ArrowRight", "KeyD"] },
];

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} color="#b0c8e8" />
      <directionalLight
        position={[20, 40, 20]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        color="#fff5e8"
      />
      <pointLight position={[0, 8, 0]}  intensity={0.4} color="#4466aa" distance={40} />
      <pointLight position={[0, 4, 0]}  intensity={0.2} color="#224488" distance={20} />
      <fog attach="fog" args={["#050a10", 35, 70]} />

      <Arena />
      <SafeZone />
      <Player />
      <Enemies />
      <Bullets />
      <PowerUps />
      <GameLogic />
      <CameraController />
    </>
  );
}

export default function Game() {
  const phase   = useGameStore((s) => s.phase);
  const gameKey = useGameStore((s) => s.gameKey);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050a10",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Start screen — shown before first play */}
      {phase === "start" && <StartScreen />}

      {/* 3-D canvas — keyed so it fully remounts on restart */}
      {phase !== "start" && (
        <KeyboardControls map={KEY_MAP}>
          <Canvas
            key={gameKey}
            shadows
            camera={{ position: [0, 17, 11], fov: 58, near: 0.1, far: 500 }}
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true }}
          >
            <Scene />
          </Canvas>
        </KeyboardControls>
      )}

      {/* HUD overlay */}
      {phase === "playing" && <HUD />}

      {/* Game over overlay */}
      {phase === "gameover" && <GameOverScreen />}
    </div>
  );
}
