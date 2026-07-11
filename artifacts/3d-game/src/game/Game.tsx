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
import MeleeEffect from "./MeleeEffect";
import DamageNumbers from "./DamageNumbers";
import DeathParticles from "./DeathParticles";
import KillEffects from "./KillEffects";
import HUD from "./HUD";
import StartScreen from "./StartScreen";
import GameOverScreen from "./GameOverScreen";
import PauseMenu from "./PauseMenu";
import CustomizationHub from "./CustomizationHub";
import LevelSelectScreen from "./LevelSelectScreen";
import DailyRewards from "./DailyRewards";
import PracticeMode from "./PracticeMode";
import HelpButton from "./HelpButton";
import SettingsScreen from "./SettingsScreen";
import Cutscene from "./Cutscene";
import MinigamesHub from "./MinigamesHub";
import MapDropItems from "./MapDropItems";

enum Controls {
  forward = "forward", back = "back", left = "left", right = "right",
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
      <MeleeEffect />
      <DamageNumbers />
      <MapDropItems />
      <DeathParticles />
      <KillEffects />
      <GameLogic />
      <CameraController />
    </>
  );
}

export default function Game() {
  const phase          = useGameStore((s) => s.phase);
  const gameKey        = useGameStore((s) => s.gameKey);
  const paused         = useGameStore((s) => s.paused);
  const selectedMap    = useGameStore((s) => s.selectedMap);
  const setPaused      = useGameStore((s) => s.setPaused);
  const gameMode       = useGameStore((s) => s.gameMode);
  const levelCompleting= useGameStore((s) => s.levelCompleting);
  const secretPortalOpen=useGameStore((s) => s.secretPortalOpen);
  const inSecretLevel  = useGameStore((s) => s.inSecretLevel);
  const secretWave     = useGameStore((s) => s.secretWave);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" && phase === "playing") {
        setPaused(!useGameStore.getState().paused);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const showCanvas = phase === "playing" || phase === "gameover" || levelCompleting;

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#020508", position: "relative", overflow: "hidden",
    }}>
      {phase === "start"         && <StartScreen />}
      {phase === "customization" && <CustomizationHub />}
      {phase === "levelselect"   && <LevelSelectScreen />}
      {phase === "dailyrewards"  && <DailyRewards />}
      {phase === "practice"      && <PracticeMode />}
      {phase === "settings"      && <SettingsScreen />}
      {phase === "minigames"     && <MinigamesHub />}
      {phase === "cutscene"      && <Cutscene />}

      {showCanvas && (
        <KeyboardControls map={KEY_MAP}>
          <Canvas
            key={gameKey}
            shadows={{ type: 2 }}
            camera={{ position: [0, 17, 11], fov: 58, near: 0.1, far: 500 }}
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true }}
          >
            <Scene mapId={selectedMap} />
          </Canvas>
        </KeyboardControls>
      )}

      {/* Level-complete flash overlay */}
      {levelCompleting && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 80,
            background: "radial-gradient(ellipse at center, rgba(250,204,21,0.35) 0%, rgba(255,255,255,0.18) 60%, transparent 100%)",
            animation: "zbFlash 0.6s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Level-complete banner */}
      {levelCompleting && (
        <div style={{
          position: "fixed", top: "38%", left: "50%", transform: "translateX(-50%)",
          zIndex: 90, textAlign: "center", pointerEvents: "none",
          animation: "zbSlideUp 0.4s ease-out forwards",
        }}>
          <div style={{
            fontSize: 48, fontWeight: 900, color: "#facc15",
            fontFamily: "'Courier New', monospace", letterSpacing: 6,
            textShadow: "0 0 30px rgba(250,204,21,0.7), 0 4px 24px #000",
          }}>LEVEL COMPLETE</div>
          <div style={{ fontSize: 16, color: "#fde68a", letterSpacing: 4, marginTop: 8 }}>
            RETURNING TO BASE…
          </div>
        </div>
      )}

      {/* Secret portal notification */}
      {secretPortalOpen && !inSecretLevel && phase === "playing" && (
        <div style={{
          position: "fixed", top: 90, left: "50%", transform: "translateX(-50%)",
          zIndex: 60, textAlign: "center", pointerEvents: "none",
          animation: "zbPulse 2s ease-in-out infinite",
        }}>
          <div style={{
            background: "rgba(124,58,237,0.25)", border: "1px solid rgba(168,85,247,0.6)",
            borderRadius: 12, padding: "10px 26px",
            fontSize: 13, color: "#c084fc",
            fontFamily: "'Courier New', monospace", letterSpacing: 3,
          }}>🔮 SECRET PATH UNLOCKED — NE CORNER</div>
        </div>
      )}

      {/* Secret level wave banner */}
      {inSecretLevel && phase === "playing" && (
        <div style={{
          position: "fixed", top: 90, left: "50%", transform: "translateX(-50%)",
          zIndex: 60, pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(124,58,237,0.35)", border: "1px solid rgba(168,85,247,0.7)",
            borderRadius: 12, padding: "10px 28px", textAlign: "center",
            fontSize: 13, color: "#e879f9",
            fontFamily: "'Courier New', monospace", letterSpacing: 3,
          }}>
            {secretWave < 4
              ? `☠️ SECRET ZONE — WAVE ${secretWave}/4`
              : "💀 BOSS WAVE — DEFEAT THE GUARDIAN"}
          </div>
        </div>
      )}

      {phase === "playing" && <HUD />}
      {phase === "playing" && gameMode === "practice" && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 8, padding: "6px 20px", fontSize: 11, color: "#4ade80",
          fontFamily: "'Courier New', monospace", letterSpacing: 3, zIndex: 50,
          pointerEvents: "none",
        }}>⚙️ PRACTICE MODE — NO DEATH · DUMMIES RESPAWN · ESC TO PAUSE</div>
      )}
      {phase === "playing" && paused && <PauseMenu />}
      {phase === "gameover" && <GameOverScreen />}

      {/* Help button — always visible except during gameplay */}
      {phase !== "playing" && !levelCompleting && <HelpButton />}

      <style>{`
        @keyframes zbFlash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes zbSlideUp {
          0%   { opacity: 0; transform: translateX(-50%) translateY(20px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes zbPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
