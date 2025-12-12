import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, Html, Instance, Instances } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { Tab, GameMode } from "./types";
import { CameraRig } from "./CameraRig";
import { PlayMap } from "./PlayMap";
import { HubUI } from "./HubUI";
import ConstructTab from "./ConstructTab";
import { ArchiveTab } from "./ArchiveTab";

// --- OPERATIONS TAB (Placeholder) ---
const OperationsTab = ({ onOpenShop }: any) => (
  <group position={[-4, 0, 0]}>
    <Instances range={5}>
      <boxGeometry args={[1, 3, 1]} />
      <meshStandardMaterial color="#a855f7" />
      {[...Array(5)].map((_, i) => (
        <Instance key={i} position={[(i - 2) * 1.5, 1.5, -2]} />
      ))}
    </Instances>
    <Html position={[0, 1.5, 0]} transform scale={0.25}>
      <button
        onClick={onOpenShop}
        className="bg-purple-600 px-6 py-3 text-white font-bold uppercase shadow-lg hover:scale-105 transition-transform whitespace-nowrap"
      >
        Protocol Vault
      </button>
    </Html>
  </group>
);

// --- MAIN COMPONENT ---

interface HubProps {
  selectedConstruct: any;
  onOpenShop: () => void;
  onOpenCalibration: () => void;
  onOpenSlotManager: () => void;
  onStartRun: () => void;
  onOpenBattleArena: () => void;
  onOpenCodex: () => void;
  onOpenContracts: () => void;
}

const TABS: Tab[] = ["PLAY", "CONSTRUCT", "OPERATIONS", "ARCHIVE"];

export default function Hub(props: HubProps) {
  const [activeTab, setActiveTab] = useState<Tab>("PLAY");
  const [selectedMode, setSelectedMode] = useState<GameMode>("NONE");

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const idx = TABS.indexOf(activeTab);
      if (e.key.toLowerCase() === "q") {
        setActiveTab(TABS[idx - 1 < 0 ? TABS.length - 1 : idx - 1]);
        setSelectedMode("NONE");
      }
      if (e.key.toLowerCase() === "e") {
        setActiveTab(TABS[idx + 1 >= TABS.length ? 0 : idx + 1]);
        setSelectedMode("NONE");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeTab]);

  const handleStartGameMode = (mode: GameMode) => {
    console.log("Initiating Mode:", mode);

    switch (mode) {
      case "BREACH":
        props.onStartRun();
        break;
      case "ARENA":
        props.onOpenBattleArena();
        break;
      case "OVERLOAD":
        // TODO: Implement Overload handler
        console.warn("Overload not implemented yet");
        break;
      case "MIRROR":
        // TODO: Implement PvP handler
        console.warn("Mirror Protocol not implemented yet");
        break;
      default:
        console.error("Unknown game mode:", mode);
    }
  };

  return (
    <div className="w-full h-dvh bg-black relative overflow-hidden">
      {/* 2D LAYER */}
      <HubUI
        activeTab={activeTab}
        onSwitchTab={(t) => {
          setActiveTab(t);
          setSelectedMode("NONE");
        }}
        selectedMode={selectedMode}
        onCloseMode={() => setSelectedMode("NONE")}
        onStartMode={handleStartGameMode}
        selectedConstruct={props.selectedConstruct}
      />

      {/* 3D LAYER */}
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#020617"]} />
        <fog attach="fog" args={["#020617", 5, 30]} />

        {/* Camera Controller */}
        <CameraRig activeTab={activeTab} selectedMode={selectedMode} />

        {/*
           STRICT CONDITIONAL RENDERING
           We use JS { && } syntax. This completely UNMOUNTS the components.
           This ensures click listeners in PlayMap do not exist when you are in Construct tab.
        */}

        {activeTab === "PLAY" && (
          <PlayMap activeMode={selectedMode} onSelectMode={setSelectedMode} />
        )}

        {activeTab === "CONSTRUCT" && (
          <ConstructTab
            selectedConstruct={props.selectedConstruct}
            onOpenCalibration={props.onOpenCalibration}
            onOpenSlotManager={props.onOpenSlotManager}
          />
        )}

        {activeTab === "OPERATIONS" && (
          <OperationsTab onOpenShop={props.onOpenShop} />
        )}

        {activeTab === "ARCHIVE" && <ArchiveTab />}

        {/* GLOBAL EFFECTS */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
          <Noise opacity={0.06} />
        </EffectComposer>

        {/* Only show global sparkles if not in Construct tab (which has its own) */}
        {activeTab !== "CONSTRUCT" && (
          <Sparkles count={50} scale={15} size={2} speed={0.1} opacity={0.2} />
        )}
      </Canvas>
    </div>
  );
}
