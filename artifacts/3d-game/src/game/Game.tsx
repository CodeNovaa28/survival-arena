import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useGameStore } from "./store";
import { getMap } from "./gameMaps";
import Arena from "./Arena";
import Player from "./Player";
import Enemies from "./Enemies";
import Bullets from "./Bullets";
import PowerUps from "./PowerUps";
import SafeZone from "./SafeZone";
import GameLogic from "./GameLogic";
import CameraController from "./CameraController";
import Companions from "./Companions";
import HUD from "./HUD";
import StartScreen from "./StartScreen";
import GameOverScreen from "./GameOverScreen";
import PauseMenu from "./PauseMenu";
import CustomizationHub from "./CustomizationHub";
import LevelSelectScreen from "./LevelSelectScreen";

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

function Scene({ mapId }: { mapId: string }) {
  const map = getMap(mapId);
  const t   = map.theme;
  return (
    <>
      <ambientLight intensity={t.ambientIntensity} color={t.ambientColor} />
      <directionalLight
        position={[20, 40, 20]} intensity={1.0} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5} shadow-camera-far={200}
        shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30}
        color={t.dirLightColor}
      />
      <pointLight position={[0, 8, 0]} intensity={0.5} color={t.pointLightColor} distance={45} />
      <fog attach="fog" args={[t.fogColor, 38, 72]} />

      <Arena mapId={mapId} />
      <SafeZone />
      <Player />
      <Enemies />
      <Bullets />
      <PowerUps />
      <Companions />
      <GameLogic />
      <CameraController />
    </>
  );
}

export default function Game() {
  const phase     = useGameStore((s) => s.phase);
  const gameKey   = useGameStore((s) => s.gameKey);
  const paused    = useGameStore((s) => s.paused);
  const selectedMap = useGameStore((s) => s.selectedMap);
  const setPaused = useGameStore((s) => s.setPaused);

  // ESC → toggle pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" && phase === "playing") {
        setPaused(!useGameStore.getState().paused);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const showCanvas = phase === "playing" || phase === "gameover";

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#020508",
      position: "relative", overflow: "hidden",
    }}>
      {/* ── Start screen ── */}
      {phase === "start"         && <StartScreen />}
      {phase === "customization" && <CustomizationHub />}
      {phase === "levelselect"   && <LevelSelectScreen />}

      {/* ── 3-D canvas (keyed so it fully remounts on restart) ── */}
      {showCanvas && (
        <KeyboardControls map={KEY_MAP}>
          <Canvas
            key={gameKey}
            shadows
            camera={{ position: [0, 17, 11], fov: 58, near: 0.1, far: 500 }}
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true }}
          >
            <Scene mapId={selectedMap} />
          </Canvas>
        </KeyboardControls>
      )}

      {/* ── HUD ── */}
      {phase === "playing" && <HUD />}

      {/* ── Pause menu overlay ── */}
      {phase === "playing" && paused && <PauseMenu />}

      {/* ── Game-over / victory overlay ── */}
      {phase === "gameover" && <GameOverScreen />}
    </div>
  );
}
