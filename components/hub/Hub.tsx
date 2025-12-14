import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, Sparkles } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { Tab, GameMode } from "./types";
import { CameraRig } from "./CameraRig";
import { PlayMap } from "./map/PlayMap";
import { HubUI } from "./HubUI";
import ConstructTab from "./construct/ConstructTab";
import { ArchiveTab } from "./archive/ArchiveTab";
import ShopTab from "./shop/ShopTab";
import { PlayerProgress } from "@/lib/meta-progression";
import NetworkTab from "./network/NetworkTab";
import { NetworkContractWithClaimed } from "@/lib/network-contracts";

interface HubProps {
  onOpenCalibration: () => void;
  onOpenSlotManager: () => void;
  onStartRun: () => void;
  onOpenBattleArena: () => void;
  // shop
  progress: PlayerProgress;
  onProgressUpdate: (progress: PlayerProgress) => void;
  // network
  dailyContracts: NetworkContractWithClaimed[];
  weeklyContracts: NetworkContractWithClaimed[];
  onClaimReward: (contractId: string, refreshType: "daily" | "weekly") => void;
  onForceRefresh?: () => void;
  // legacy
  selectedConstruct: any;
}

const TABS: Tab[] = ["PLAY", "CONSTRUCT", "SHOP", "NETWORK", "ARCHIVE"];

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
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 5, 25]} />
        {/* --- GLOBAL VEIL OS ENVIRONMENT --- */}

        {/* 1. Circuit Board Floor */}
        <Grid
          position={[0, -0.51, 0]}
          args={[40, 40]}
          cellSize={1}
          sectionSize={5}
          fadeDistance={25}
          sectionColor="#15803d" // Green-700
          cellColor="#052e16" // Green-950
          sectionThickness={1.5}
          cellThickness={1}
          infiniteGrid
        />

        {/* 2. "Raw Data" Floating in the air (Green Code Fragments) */}
        <Sparkles
          count={200}
          scale={[20, 10, 20]}
          size={2}
          speed={0.2}
          opacity={0.4}
          color="#4ade80" // Green-400
          position={[0, 5, 0]}
        />
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

        {activeTab === "SHOP" && (
          <ShopTab
            playerProgress={props.progress}
            onPurchase={props.onProgressUpdate}
          />
        )}

        {activeTab === "NETWORK" && (
          <NetworkTab
            dailyContracts={props.dailyContracts}
            weeklyContracts={props.weeklyContracts}
            onClaimReward={props.onClaimReward}
            onForceRefresh={props.onForceRefresh}
          />
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
