import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, Html, Instance, Instances } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { motion } from "motion/react";

// Import our new components
// Adjust paths as needed based on where you put them
import { Tab, GameMode } from "./types";
import { CameraRig } from "./CameraRig";
import { PlayMap } from "./PlayMap";
import { HubUI } from "./HubUI";

// Define the other simple tabs here or move them to files too
const ConstructTab = ({ onCalibrate, onSelectConstruct }: any) => (
  <group>
    {/* Visual Placeholder for Character */}
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#10b981" wireframe />
    </mesh>
    <Html position={[1.5, 1.5, 0]}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 bg-black/80 border-l-2 border-emerald-500 p-4 backdrop-blur-md"
      >
        <h1 className="text-white font-bold">VANGUARD</h1>
        <button
          onClick={onCalibrate}
          className="mt-2 w-full bg-emerald-600/50 border border-emerald-500 text-white text-xs py-2 uppercase"
        >
          Calibrate
        </button>
      </motion.div>
    </Html>
  </group>
);

const OperationsTab = ({ onOpenShop }: any) => (
  <group position={[-4, 0, 0]}>
    <Instances range={5}>
      <boxGeometry args={[1, 3, 1]} />
      <meshStandardMaterial color="#a855f7" />
      {[...Array(5)].map((_, i) => (
        <Instance key={i} position={[(i - 2) * 1.5, 1.5, -2]} />
      ))}
    </Instances>
    <Html position={[0, 1.5, 0]} center>
      <button
        onClick={onOpenShop}
        className="bg-purple-600 px-6 py-3 text-white font-bold uppercase shadow-lg hover:scale-105 transition-transform"
      >
        Protocol Vault
      </button>
    </Html>
  </group>
);

// --- MAIN COMPONENT ---

export default function Hub(props: any) {
  const [activeTab, setActiveTab] = useState<Tab>("PLAY");
  const [selectedMode, setSelectedMode] = useState<GameMode>("NONE");
  const TABS: Tab[] = ["PLAY", "CONSTRUCT", "OPERATIONS", "ARCHIVE"];

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

  return (
    <div className="w-full h-dvh bg-black relative overflow-hidden">
      {/* 2D LAYER */}
      <HubUI
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        selectedMode={selectedMode}
        onCloseMode={() => setSelectedMode("NONE")}
        onStartRun={props.onStartRun}
        selectedConstruct={props.selectedConstruct}
      />

      {/* 3D LAYER */}
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#020617"]} />
        <fog attach="fog" args={["#020617", 5, 30]} />

        <CameraRig activeTab={activeTab} selectedMode={selectedMode} />

        {/* --- SCENE CONTENT --- */}
        <group visible={activeTab === "PLAY"}>
          <PlayMap activeMode={selectedMode} onSelectMode={setSelectedMode} />
        </group>

        {activeTab === "CONSTRUCT" && (
          <ConstructTab onCalibrate={props.onOpenCalibration} />
        )}

        {activeTab === "OPERATIONS" && (
          <OperationsTab onOpenShop={props.onOpenShop} />
        )}

        {/* EFFECTS */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
          <Noise opacity={0.06} />
        </EffectComposer>
        <Sparkles count={50} scale={15} size={2} speed={0.1} opacity={0.2} />
      </Canvas>
    </div>
  );
}
