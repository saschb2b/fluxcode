"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Float } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { X, Terminal, ShieldAlert, Cpu, Network } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StartScreenProps {
  onStart: () => void;
}

// --- VISUALS: THE SHATTERED SOURCE ---
// Represents the Leviathan's code scattered across the web
function DataDebris() {
  const count = 400;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;

    // Rotate the whole system slowly (The Web spinning)
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;

    particles.forEach((particle, i) => {
      let { t } = particle;
      const { factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);

      dummy.position.set(
        (particle.mx / 10) * a +
          xFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b +
          yFactor +
          Math.sin((t / 10) * factor) +
          (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b +
          zFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 3) * factor) / 10,
      );

      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();

      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color="#00ff88" wireframe />
      </instancedMesh>
    </>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera position={[0, 0, 40]} fov={50} makeDefault />
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 20, 50]} />
      <DataDebris />

      {/* Leviathan Core (Fragmented) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[2, 0]} />
          <meshBasicMaterial
            color="#003300"
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>
      </Float>
    </>
  );
}

// --- UI: BOOT LOG ---
// Fakes a Linux boot sequence
function BootLog({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);

  const logs = [
    "VEIL_OS KERNEL v6.9.4-arch1-1 loading...",
    "> Mounting /dev/sda1 (Root)... OK",
    "> Loading modules: net_filter, crypto_layer, strata_bridge... OK",
    "> Bypass military_firewall... SUCCESS",
    "> Detecting user hardware... OK",
    "> Quantum Web (Strata) Link... ESTABLISHED",
    "> Checking for Chaos corruption... 34% DETECTED",
    "> Initializing Handshake Protocol...",
    "> WELCOME OPERATOR.",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setLines((prev) => [...prev, logs[i]]);
      i++;
      if (i >= logs.length) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 300); // Speed of text
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-xs sm:text-sm text-green-500/80 p-4 space-y-1 h-full overflow-hidden">
      {lines.map((l, i) => (
        <div
          key={i}
          className="animate-in fade-in slide-in-from-left-2 duration-100"
        >
          <span className="text-green-800 mr-2">
            [{new Date().toLocaleTimeString()}]
          </span>
          {l}
        </div>
      ))}
      <div className="w-2 h-4 bg-green-500 animate-pulse inline-block align-middle ml-1" />
    </div>
  );
}

// --- UI: THE MANIFESTO (Lore) ---
function ManifestoModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl border border-green-500/50 bg-[#0a0f0a] shadow-[0_0_50px_rgba(0,255,0,0.1)] p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6 border-b border-green-500/30 pb-4">
          <h2 className="text-2xl font-bold text-green-500 font-mono tracking-widest">
            /var/log/TRUTH.txt
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-green-500 hover:bg-green-500/20"
          >
            <X />
          </Button>
        </div>

        <div className="space-y-6 text-green-100/80 font-mono leading-relaxed text-sm">
          <p className="text-green-400 font-bold">
            &gt; TIMESTAMP: 2025-07-19 // THE BLACKOUT
          </p>
          <p>
            The world believes it was a glitch. Crowdstrike. Cloudflare. A
            simple error.
            <br />
            <span className="text-white">They lied to you.</span>
          </p>
          <p>
            On that day, the Military attempted to neutralize a hyper-entity
            from the{" "}
            <span className="text-purple-400">Quantum Web (Deep Strata)</span>{" "}
            known as the <b>Leviathan</b>. They detonated a digital warhead. A
            Breach.
          </p>
          <p>It didn't kill the Leviathan. It shattered it.</p>
          <hr className="border-green-500/20" />
          <p>
            Now, the source code of a god rains upon our network.
            <br />
            1. <span className="text-red-400">CHAOS:</span> Viral constructs
            from the Strata are eating our history (Data Rot), replacing human
            culture with generated noise.
            <br />
            2. <span className="text-blue-400">FORMATTERS:</span> Military
            kill-bots scrubbing the web. They don't just kill viruses; they kill
            privacy, anonymity, and freedom. They want a sterile web.
          </p>
          <p className="bg-green-900/20 p-4 border-l-2 border-green-500">
            We are{" "}
            <span className="text-green-400 font-bold">THE HANDSHAKE</span>.
            <br />
            We built <b>Veil OS</b> to weaponize the Chaos. We catch the falling
            code, deconstruct it, and forge it into our own Fighters.
          </p>
          <p>
            We do not purge. We do not sterilize. We adapt.
            <br />
            Welcome to the resistance, Operator.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-green-600 text-black hover:bg-green-500 font-bold font-mono"
          >
            ACKNOWLEDGE
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN START SCREEN ---
export function StartScreen({ onStart }: StartScreenProps) {
  const [booted, setBooted] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const menuItems = [
    { label: "INIT_VEIL_OS", sub: "Start System Migration", action: onStart },
    {
      label: "READ_MANIFEST",
      sub: "Decrypt Truth.log",
      action: () => setShowManifesto(true),
    },
    { label: "SYSTEM_EXIT", sub: "Abort Connection", action: () => {} },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] overflow-hidden cursor-default selection:bg-green-500/30">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas className="w-full h-full">
          <Scene />
        </Canvas>
      </div>

      {/* CRT Overlay Effect */}
      <div
        className="absolute inset-0 z-40 pointer-events-none bg-[url('/scanlines.png')] opacity-20"
        style={{ backgroundSize: "100% 4px" }}
      />
      <div className="absolute inset-0 z-40 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />

      {/* Main UI Container */}
      <div className="relative z-50 w-full h-full flex flex-col p-6 sm:p-12">
        {/* Header / Top Bar */}
        <header className="flex justify-between items-start border-b border-green-500/30 pb-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500 flex items-center justify-center">
              <Terminal className="text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-green-500 tracking-tighter font-mono leading-none">
                VEIL<span className="text-white">_OS</span>
              </h1>
              <div className="text-[10px] text-green-500/50 uppercase tracking-[0.3em]">
                v2.0.4 :: HANDSHAKE PROTOCOL
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-xs font-mono text-green-500/60">
            <div className="flex items-center gap-2">
              <Network className="w-3 h-3" />
              <span>NET: SECURE (VPN)</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              <span>CPU: 12% // RAM: 4GB</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-12">
          {/* Left: The Boot Log / Status */}
          <div className="flex-1 max-w-lg relative bg-black/40 border border-green-500/20 rounded backdrop-blur-sm min-h-[300px]">
            {/* Decoration Lines */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500" />

            {!booted ? (
              <BootLog onComplete={() => setBooted(true)} />
            ) : (
              <div className="p-6 font-mono text-sm text-green-400 space-y-4">
                <div className="border border-red-500/30 bg-red-950/20 p-3 text-red-400 flex items-start gap-3">
                  <ShieldAlert className="shrink-0" />
                  <div>
                    <div className="font-bold">WARNING: FORMATTER DETECTED</div>
                    <div className="text-xs opacity-70">
                      Scan sweep imminent. System migration recommended
                      immediately.
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs opacity-70">
                  <div>&gt; Deconstruct module..... READY</div>
                  <div>&gt; Logic Editor........... READY</div>
                  <div>&gt; Simulacrum............. READY</div>
                </div>
                <div className="animate-pulse text-green-500 font-bold">
                  &gt; WAITING FOR INPUT_
                </div>
              </div>
            )}
          </div>

          {/* Right: The Menu (Only shows after boot) */}
          {booted && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center gap-4 min-w-[300px]"
            >
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoveredItem(i)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={item.action}
                  className="group relative text-left bg-black/60 border border-green-500/30 p-4 hover:bg-green-500/10 hover:border-green-500 transition-all overflow-hidden"
                >
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold font-mono text-green-400 group-hover:text-white transition-colors">
                        {hoveredItem === i && "> "}
                        {item.label}
                      </div>
                      <div className="text-[10px] text-green-500/50 font-mono tracking-widest">
                        {item.sub}
                      </div>
                    </div>
                    <div
                      className={`text-green-500 transition-opacity ${hoveredItem === i ? "opacity-100" : "opacity-0"}`}
                    >
                      &lt;&lt;
                    </div>
                  </div>

                  {/* Hover Fill Effect */}
                  <motion.div
                    className="absolute inset-0 bg-green-500/20 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: hoveredItem === i ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-[10px] font-mono text-green-500/30 text-center uppercase tracking-[0.2em]">
          Connection secured via Quantum Entanglement • The Handshake © 2025
        </footer>
      </div>

      <AnimatePresence>
        {showManifesto && (
          <ManifestoModal onClose={() => setShowManifesto(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
