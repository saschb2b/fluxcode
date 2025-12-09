import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Float,
  Html,
  Sparkles,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "motion/react";

// --- PROPS ---
interface ConstructTabProps {
  onOpenCalibration: () => void;
  onSelectConstruct: () => void;
  selectedConstruct: any;
}

// --- SUB-COMPONENTS ---

// 2. THE UPLINK ARCH (Background Ring)
function UplinkArch() {
  return (
    <group position={[0, 4, -4]}>
      {/* The Ring Structure */}
      <mesh>
        <torusGeometry args={[3.5, 0.4, 16, 64]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Inner Glow Ring */}
      <mesh>
        <torusGeometry args={[3.0, 0.05, 16, 64]} />
        <meshBasicMaterial color="#3b82f6" toneMapped={false} />
      </mesh>

      {/* Support Struts */}
      <mesh position={[0, -3.5, 0]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Data Cables hanging down */}
      <DataCables />
    </group>
  );
}

const Cable = ({ start, end, slack }: any) => {
  const mid = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
    0.5,
  );
  mid.y -= slack;
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    mid,
    new THREE.Vector3(...end),
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.04, 8, false]} />
      <meshStandardMaterial color="#000" />
    </mesh>
  );
};

// 3. HANGING CABLES (Procedural Curves)
function DataCables() {
  return (
    <group position={[0, 0, 0]}>
      <Cable start={[-2, 3, 0]} end={[-2.5, -4, 2]} slack={0} />
      <Cable start={[2, 3, 0]} end={[2.5, -4, 2]} slack={0} />
      <Cable start={[0, 3.5, -0.5]} end={[0, 0, -1]} slack={1} />
    </group>
  );
}

// 4. THE MAIN STAGE
function MaintenanceBay() {
  const scannerRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (scannerRef.current) {
      // Slow vertical scan animation
      scannerRef.current.position.y =
        Math.sin(clock.getElapsedTime() * 0.5) * 1.5 + 2.0;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Floor Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={60}
          roughness={0.6}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0a"
          metalness={0.7}
          mirror={0.6}
        />
      </mesh>

      {/* Central Pad */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.1, 32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Emissive Ring on Pad */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      {/* Background Environment */}
      <UplinkArch />

      {/* Active Scanner Element */}
      <group ref={scannerRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.02, 64]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight intensity={1} color="#38bdf8" distance={3} decay={2} />
      </group>
    </group>
  );
}

// --- CHARACTER (Placeholder) ---
function ConstructModel() {
  return (
    <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
      <group position={[0, 0, 0]}>
        {/* Body */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 1.8, 0.5]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        {/* Armor Plates */}
        <mesh castShadow position={[0, 0.8, 0.3]}>
          <boxGeometry args={[0.6, 0.8, 0.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 1.6, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Glowing Eye/Visor */}
        <mesh position={[0, 1.6, 0.21]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>
    </Float>
  );
}

// --- UI (Unchanged logic, just layout) ---
function ConstructUI({ onCalibrate, onSelectConstruct }: any) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const MenuButton = ({ label, sub, onClick, id }: any) => (
    <motion.button
      whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      onClick={onClick}
      onMouseEnter={() => setHoveredItem(id)}
      onMouseLeave={() => setHoveredItem(null)}
      className="group relative w-full text-left p-4 border-l-2 border-white/10 hover:border-emerald-500 transition-all bg-black/60 backdrop-blur-md mb-2 overflow-hidden rounded-r-md shadow-lg"
    >
      <div className="relative z-10">
        <div className="text-xl font-bold text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
          {label}
        </div>
        <div className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em]">
          {sub}
        </div>
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent -z-0"
        initial={{ x: "-100%" }}
        animate={{ x: hoveredItem === id ? "0%" : "-100%" }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );

  const StatRow = ({ label, value, barColor }: any) => (
    <div className="flex flex-col gap-1 mb-3">
      <div className="flex justify-between items-end">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm text-white font-bold font-mono">{value}</span>
      </div>
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(parseInt(value) / 10, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${barColor}`}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* LEFT PANEL */}
      <Html
        position={[-4, 1.5, 0]}
        rotation={[0, 0.3, 0]}
        transform
        scale={0.2}
      >
        <div className="w-[350px] flex flex-col pointer-events-auto select-none">
          <div className="mb-6 pl-4 border-l-4 border-white pb-2">
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">
              Vanguard
            </h1>
            <span className="text-xs text-emerald-500 font-mono tracking-[0.5em] uppercase pl-1">
              Class: Brawler
            </span>
          </div>
          <MenuButton
            id="proto"
            label="Protocols"
            sub="Edit Logic Chain"
            onClick={onCalibrate}
          />
          <MenuButton
            id="equip"
            label="Equipment"
            sub="Hardware & Mods"
            onClick={onCalibrate}
          />
          <MenuButton
            id="paint"
            label="Appearance"
            sub="Skins & Colors"
            onClick={() => {}}
          />
          <div className="h-6" />
          <MenuButton
            id="swap"
            label="Swap Frame"
            sub="Select Construct"
            onClick={onSelectConstruct}
          />
        </div>
      </Html>

      {/* RIGHT PANEL */}
      <Html
        position={[4, 1.5, 0]}
        rotation={[0, -0.3, 0]}
        transform
        scale={0.2}
      >
        <div className="w-[320px] bg-black/80 backdrop-blur-xl p-6 border-t-2 border-emerald-500 pointer-events-auto select-none rounded-b-lg shadow-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-gray-700 pb-2">
            System Diagnostics
          </h3>
          <StatRow label="Integrity (HP)" value="850" barColor="bg-red-500" />
          <StatRow
            label="Barrier (Shield)"
            value="420"
            barColor="bg-blue-500"
          />
          <StatRow label="CPU Load" value="64%" barColor="bg-yellow-500" />
          <StatRow label="Mobility" value="1.2" barColor="bg-purple-500" />
          <div className="mt-6 flex gap-2">
            <div className="flex-1 bg-white/5 p-3 text-center rounded border border-white/10">
              <div className="text-2xl text-white font-bold">4</div>
              <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                Modules
              </div>
            </div>
            <div className="flex-1 bg-white/5 p-3 text-center rounded border border-white/10">
              <div className="text-2xl text-white font-bold">12</div>
              <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                Logic
              </div>
            </div>
          </div>
        </div>
      </Html>
    </>
  );
}

// --- MAIN EXPORT ---
export default function ConstructTab(props: ConstructTabProps) {
  return (
    <group>
      {/* LIGHTING SETUP */}
      <ambientLight intensity={0.1} color="#0f172a" />
      {/* Main Key Light */}
      <spotLight
        position={[-4, 8, 6]}
        angle={0.4}
        penumbra={0.5}
        intensity={40}
        color="#e2e8f0"
        castShadow
      />
      {/* Back Rim Light (Blue) to separate char from background */}
      <spotLight
        position={[0, 5, -5]}
        angle={0.8}
        intensity={20}
        color="#3b82f6"
      />
      {/* Fill Light (Teal) */}
      <pointLight position={[3, 2, 2]} intensity={5} color="#10b981" />

      <MaintenanceBay />
      <ConstructModel />
      <ConstructUI
        onCalibrate={props.onOpenCalibration}
        onSelectConstruct={props.onSelectConstruct}
      />

      {/* Floating Data Particles */}
      <Sparkles
        count={80}
        scale={[6, 8, 6]}
        size={3}
        speed={0.4}
        opacity={0.3}
        color="#38bdf8"
      />
    </group>
  );
}
