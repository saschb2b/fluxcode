import React, { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Html,
  Text,
  useCursor,
  Float,
  Instance,
  Instances,
  Grid,
  Sparkles,
  CameraControls,
  RoundedBox,
  Image,
  Line,
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";

// --- TYPES ---
interface HubProps {
  selectedConstruct: any;
  onStartRun: () => void;
  onSelectConstruct: () => void;
  onOpenShop: () => void;
  onOpenContracts: () => void;
  onOpenCodex: () => void;
  onOpenCalibration: () => void;
  onOpenClassManager: () => void;
  onOpenBattleArena: () => void;
}

type Tab = "PLAY" | "CONSTRUCT" | "OPERATIONS" | "ARCHIVE";
type GameMode = "NONE" | "BREACH" | "SIMULATION" | "EVENT";

// --- CONSTANTS ---
const TABS: Tab[] = ["PLAY", "CONSTRUCT", "OPERATIONS", "ARCHIVE"];

const VIEW_CONFIG = {
  // Map View: High angle, looking down at the table
  PLAY: { pos: [0, 8, 8], look: [0, 0, 2] },
  // Map View (Zoomed in on Breach):
  BREACH_FOCUS: { pos: [-2, 4, 4], look: [-2, 0, 0] },
  // Character View: Eye level
  CONSTRUCT: { pos: [0, 1, 5], look: [0, 1, 0] },
  // Store View
  OPERATIONS: { pos: [-5, 1, 5], look: [-8, 1, 0] },
};

// --- MAP COMPONENTS ---

function HoloMap({
  onSelectMode,
  activeMode,
}: {
  onSelectMode: (m: GameMode) => void;
  activeMode: GameMode;
}) {
  // A network of nodes connected by lines
  return (
    <group position={[0, 0, 0]}>
      {/* Base Table Grid */}
      <Grid
        position={[0, -0.1, 0]}
        args={[20, 20]}
        cellSize={0.5}
        sectionSize={2}
        fadeDistance={15}
        sectionColor="#1e293b"
        cellColor="#0f172a"
      />

      {/* NODE 1: BREACH (Main Game) */}
      <MapNode
        position={[-2, 0, 0]}
        color="#ef4444"
        label="BREACH"
        icon="☠"
        isSelected={activeMode === "BREACH"}
        onClick={() => onSelectMode("BREACH")}
      />

      {/* NODE 2: SIMULATION (Training) */}
      <MapNode
        position={[2, 0, 1]}
        color="#3b82f6"
        label="SIMULATION"
        icon="⚔"
        isSelected={activeMode === "SIMULATION"}
        onClick={() => onSelectMode("SIMULATION")}
      />

      {/* NODE 3: EVENT (Seasonal) */}
      <MapNode
        position={[0, 0, -3]}
        color="#fbbf24"
        label="NET WAR"
        icon="⚠"
        isSelected={activeMode === "EVENT"}
        onClick={() => onSelectMode("EVENT")}
      />

      {/* Connections */}
      <DataLine start={[-2, 0, 0]} end={[0, 0, -3]} color="#334155" />
      <DataLine start={[2, 0, 1]} end={[0, 0, -3]} color="#334155" />
      <DataLine start={[-2, 0, 0]} end={[2, 0, 1]} color="#334155" />
    </group>
  );
}

function MapNode({ position, color, label, icon, isSelected, onClick }: any) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group position={position}>
      {/* The Node Visual */}
      <Float speed={2} floatIntensity={0.5}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <cylinderGeometry args={[0.8, 0.8, 0.2, 6]} />
          <meshStandardMaterial
            color={isSelected ? "#fff" : color}
            emissive={color}
            emissiveIntensity={isSelected || hovered ? 2 : 0.5}
          />
        </mesh>
        {/* Icon */}
        <Text
          position={[0, 0.11, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="black"
        >
          {icon}
        </Text>
      </Float>

      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <ringGeometry args={[0.8, 0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Label floating above */}
      <Html position={[0, 1, 0]} center distanceFactor={10}>
        <div
          className={`px-2 py-1 bg-black/80 border ${isSelected ? "border-white text-white" : "border-gray-700 text-gray-400"} text-xs font-mono transition-all whitespace-nowrap`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function DataLine({ start, end, color }: any) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

// --- SCENE & RIG ---

const CameraRig = ({ tab, mode }: { tab: Tab; mode: GameMode }) => {
  const controls = useRef<CameraControls>(null);

  useEffect(() => {
    if (controls.current) {
      let targetConfig = VIEW_CONFIG[tab] || VIEW_CONFIG.PLAY;

      // Override for specific map modes to "Zoom In"
      if (tab === "PLAY" && mode === "BREACH")
        targetConfig = VIEW_CONFIG.BREACH_FOCUS;

      controls.current.setLookAt(
        targetConfig.pos[0],
        targetConfig.pos[1],
        targetConfig.pos[2],
        targetConfig.look[0],
        targetConfig.look[1],
        targetConfig.look[2],
        true,
      );
    }
  }, [tab, mode]);

  return (
    <CameraControls
      ref={controls}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
      mouseButtons={{ left: 0, right: 0, middle: 0, wheel: 0 }}
      touches={{ one: 0, two: 0, three: 0 }}
    />
  );
};

// --- UI OVERLAYS ---

function TopNav({
  activeTab,
  onSwitch,
}: {
  activeTab: Tab;
  onSwitch: (t: Tab) => void;
}) {
  return (
    <div className="absolute top-0 left-0 w-full flex justify-center pt-6 z-20 pointer-events-none">
      <div className="flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10">
        <div className="px-3 text-gray-500 font-bold text-xs">[Q]</div>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onSwitch(tab)}
            className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all ${
              activeTab === tab
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="px-3 text-gray-500 font-bold text-xs">[E]</div>
      </div>
    </div>
  );
}

function PlayerStatusCard({ selectedConstruct }: any) {
  // "Top Center Small" Requirement
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
      <div className="w-12 h-12 bg-gray-900 border-2 border-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_#10b98140] relative">
        {/* Placeholder for Character Icon */}
        <span className="text-xl">🤖</span>
        <div className="absolute -bottom-2 bg-emerald-600 text-black text-[10px] font-bold px-1 rounded">
          LV.12
        </div>
      </div>
      <span className="mt-1 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
        {selectedConstruct ? "Vanguard" : "No Unit"}
      </span>
    </div>
  );
}

function ModeDetailPanel({
  mode,
  onStart,
  onClose,
}: {
  mode: GameMode;
  onStart: () => void;
  onClose: () => void;
}) {
  if (mode === "NONE") return null;

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      className="absolute right-0 top-0 h-full w-[400px] bg-gradient-to-l from-black via-black/90 to-transparent p-12 flex flex-col justify-center z-10"
    >
      <div className="border-l-4 border-red-500 pl-6 flex flex-col gap-4">
        <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">
          {mode}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Infiltrate the core network. Breach protocols active. Recommended
          Power Level: 750.
        </p>

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between text-xs font-mono text-gray-500 uppercase">
            <span>Difficulty</span>
            <span className="text-red-400">HARD</span>
          </div>
          <div className="flex justify-between text-xs font-mono text-gray-500 uppercase">
            <span>Rewards</span>
            <span className="text-yellow-400">LEGENDARY</span>
          </div>
        </div>

        <div className="h-px w-full bg-white/10 my-4" />

        <button
          onClick={onStart}
          className="group relative px-8 py-4 bg-red-600 text-black font-black text-xl uppercase tracking-widest hover:bg-white transition-colors"
        >
          INITIATE BREACH
          {/* Decorative glitch effect */}
          <div className="absolute inset-0 border border-red-600 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform pointer-events-none" />
        </button>

        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-white text-left mt-2"
        >
          [ BACK TO MAP ]
        </button>
      </div>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---

export default function Hub(props: HubProps) {
  const [activeTab, setActiveTab] = useState<Tab>("PLAY");
  const [selectedMode, setSelectedMode] = useState<GameMode>("NONE");

  // Keyboard navigation for Tabs
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const idx = TABS.indexOf(activeTab);
      if (e.key.toLowerCase() === "q") {
        const next = idx - 1 < 0 ? TABS.length - 1 : idx - 1;
        setActiveTab(TABS[next]);
        setSelectedMode("NONE"); // Reset selection on tab switch
      }
      if (e.key.toLowerCase() === "e") {
        const next = idx + 1 >= TABS.length ? 0 : idx + 1;
        setActiveTab(TABS[next]);
        setSelectedMode("NONE");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeTab]);

  return (
    <div className="w-full h-dvh bg-black relative overflow-hidden">
      {/* 1. UI LAYER (HTML) */}
      <TopNav
        activeTab={activeTab}
        onSwitch={(t) => {
          setActiveTab(t);
          setSelectedMode("NONE");
        }}
      />

      <AnimatePresence>
        {activeTab === "PLAY" && (
          <>
            <PlayerStatusCard selectedConstruct={props.selectedConstruct} />
            <ModeDetailPanel
              mode={selectedMode}
              onStart={props.onStartRun}
              onClose={() => setSelectedMode("NONE")}
            />
          </>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 right-8 flex gap-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded">
            A
          </span>
          <span className="text-xs text-white uppercase tracking-widest">
            Select
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
            B
          </span>
          <span className="text-xs text-white uppercase tracking-widest">
            Back
          </span>
        </div>
      </div>

      {/* 2. 3D SCENE LAYER */}
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#020617"]} />
        <fog attach="fog" args={["#020617", 10, 50]} />

        <CameraRig tab={activeTab} mode={selectedMode} />

        {/* LIGHTING */}
        <ambientLight intensity={0.2} />
        <spotLight
          position={[10, 20, 10]}
          intensity={50}
          angle={0.5}
          penumbra={1}
          color="#60a5fa"
        />
        <pointLight position={[-10, 5, -5]} intensity={10} color="#f43f5e" />

        {/* CONTENT SWITCHING BASED ON TAB */}
        <group visible={activeTab === "PLAY"}>
          <HoloMap activeMode={selectedMode} onSelectMode={setSelectedMode} />
        </group>

        <group visible={activeTab === "CONSTRUCT"}>
          {/* The Hangar View */}
          <Float speed={2} rotationIntensity={0.2}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1, 2, 1]} />
              <meshStandardMaterial color="#10b981" wireframe />
            </mesh>
          </Float>
          <Grid
            position={[0, -2, 0]}
            args={[10, 10]}
            sectionColor="#10b981"
            cellColor="#064e3b"
            fadeDistance={10}
          />
          {/* Context UI for Construct */}
          <Html position={[1.5, 0, 0]}>
            <div className="w-64">
              <h1 className="text-2xl font-bold text-white mb-2">VANGUARD</h1>
              <div className="bg-gray-800 p-4 rounded text-xs text-gray-300">
                <p>Class: Balanced</p>
                <p>Power: 750</p>
                <button
                  onClick={props.onOpenCalibration}
                  className="mt-4 w-full bg-emerald-600 py-2 text-white font-bold hover:bg-emerald-500"
                >
                  CALIBRATE
                </button>
              </div>
            </div>
          </Html>
        </group>

        <group visible={activeTab === "OPERATIONS"}>
          {/* Shop Visuals */}
          <Instances range={5}>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color="#a855f7" />
            {/* Random shop blocks */}
            {[...Array(5)].map((_, i) => (
              <Instance key={i} position={[(i - 2) * 2, 0, 0]} />
            ))}
          </Instances>
          <Html position={[0, 2, 0]} center>
            <button
              onClick={props.onOpenShop}
              className="bg-purple-600 px-8 py-4 text-white font-bold text-xl uppercase shadow-lg hover:scale-105 transition-transform"
            >
              Open Protocol Vault
            </button>
          </Html>
        </group>

        {/* EFFECTS */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
          <Noise opacity={0.05} />
        </EffectComposer>
        <Sparkles count={100} scale={10} size={2} speed={0.2} opacity={0.2} />
      </Canvas>
    </div>
  );
}
