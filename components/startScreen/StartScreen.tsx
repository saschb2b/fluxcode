"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function ResonanceCore() {
  const coreGroup = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const dataStreamsRef = useRef<THREE.LineSegments>(null);

  const particleData = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i * 2) * Math.PI * 2;
      const radius = 1 + seededRandom(i * 2 + 1) * 2;
      const y = (seededRandom(i * 3) - 0.5) * 3;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      velocities[i * 3] = (seededRandom(i * 4) - 0.5) * 0.02;
      velocities[i * 3 + 1] = (seededRandom(i * 4 + 1) - 0.5) * 0.02;
      velocities[i * 3 + 2] = (seededRandom(i * 4 + 2) - 0.5) * 0.02;
    }

    return { positions, velocities, count };
  }, []);

  const dataStreamLines = useMemo(() => {
    const lines = new Float32Array(200 * 3);
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const startRadius = 0.5;
      const endRadius = 3.5;

      lines[i * 6] = Math.cos(angle) * startRadius;
      lines[i * 6 + 1] = 0;
      lines[i * 6 + 2] = Math.sin(angle) * startRadius;

      lines[i * 6 + 3] = Math.cos(angle) * endRadius;
      lines[i * 6 + 4] = 0;
      lines[i * 6 + 5] = Math.sin(angle) * endRadius;
    }
    return lines;
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < particleData.count; i++) {
        positions[i * 3] += particleData.velocities[i * 3];
        positions[i * 3 + 1] += particleData.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particleData.velocities[i * 3 + 2];

        const dist = Math.sqrt(
          positions[i * 3] ** 2 +
            positions[i * 3 + 1] ** 2 +
            positions[i * 3 + 2] ** 2,
        );

        if (dist > 4) {
          const angle = seededRandom(clock.elapsedTime * i) * Math.PI * 2;
          const radius = 1 + seededRandom(clock.elapsedTime * i + 1) * 2;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] =
            (seededRandom(clock.elapsedTime * i + 2) - 0.5) * 3;
          positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (coreGroup.current) {
      coreGroup.current.rotation.z += 0.001;
      const pulse = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.2;
      coreGroup.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={coreGroup}>
      <mesh>
        <icosahedronGeometry args={[0.8, 4]} />
        <meshStandardMaterial
          emissive="#00ffff"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleData.count}
            array={particleData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          color="#00ffff"
          transparent
          opacity={0.6}
        />
      </points>

      <lineSegments ref={dataStreamsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dataStreamLines.length / 3}
            array={dataStreamLines}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ff00ff"
          transparent
          opacity={0.3}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera position={[0, 0, 8]} fov={50} makeDefault />
      <ResonanceCore />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#00ffff" />
    </>
  );
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lastInputRef = useRef<number>(0);

  const menuItems = [
    { label: "[ INITIATE PROTOCOL ]", action: onStart },
    { label: "CONFIGURATION", action: () => setShowConfig(true) },
    { label: "CREDITS", action: () => {} },
    { label: "ROADMAP", action: () => {} },
  ];

  useEffect(() => {
    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      if (!gamepads) return;

      for (const gamepad of gamepads) {
        if (!gamepad) continue;

        const now = Date.now();
        const timeSinceLastInput = now - lastInputRef.current;

        if (timeSinceLastInput < 150) continue;

        // D-Pad Up or Left Stick Up
        if (gamepad.buttons[12].pressed || gamepad.axes[1] < -0.5) {
          lastInputRef.current = now;
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : menuItems.length - 1,
          );
          return;
        }

        // D-Pad Down or Left Stick Down
        if (gamepad.buttons[13].pressed || gamepad.axes[1] > 0.5) {
          lastInputRef.current = now;
          setSelectedIndex((prev) =>
            prev < menuItems.length - 1 ? prev + 1 : 0,
          );
          return;
        }

        // A Button (Button 0)
        if (gamepad.buttons[0].pressed) {
          lastInputRef.current = now;
          menuItems[selectedIndex].action();
          return;
        }

        // B Button (Button 1)
        if (gamepad.buttons[1].pressed && showConfig) {
          lastInputRef.current = now;
          setShowConfig(false);
          return;
        }
      }
    };

    const interval = setInterval(handleGamepadInput, 16);
    return () => clearInterval(interval);
  }, [selectedIndex, menuItems, showConfig]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (showConfig) return;

      const now = Date.now();
      if (now - lastInputRef.current < 150) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        lastInputRef.current = now;
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : menuItems.length - 1,
        );
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        lastInputRef.current = now;
        setSelectedIndex((prev) =>
          prev < menuItems.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        lastInputRef.current = now;
        menuItems[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [selectedIndex, menuItems, showConfig]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#0a0015] flex overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          style={{
            backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
        `,
            backgroundSize: "50px 50px",
          }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 w-1/3 flex flex-col justify-between p-8 md:p-12">
        <div>
          <h1
            className="text-4xl md:text-6xl font-black tracking-wider mb-2 text-cyan-400"
            style={{
              textShadow:
                "2px 2px 0 rgba(0, 255, 255, 0.3), -1px -1px 0 rgba(255, 0, 255, 0.3)",
              fontFamily: "monospace",
            }}
          >
            BATTLE
          </h1>
          <h2
            className="text-2xl md:text-4xl font-bold text-magenta-400 tracking-widest"
            style={{ fontFamily: "monospace" }}
          >
            PROTOCOL
          </h2>
          <div className="mt-3 text-xs md:text-sm text-cyan-300/60 tracking-[0.2em] uppercase">
            Program • Fight • Evolve
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className={`text-left text-lg md:text-xl font-bold transition-all px-4 py-2 ${
                selectedIndex === idx
                  ? "text-cyan-300 border-b-2 border-cyan-300 scale-105"
                  : "text-cyan-400 border-b-2 border-transparent"
              } ${
                selectedIndex === idx && item.label.includes("PROTOCOL")
                  ? "text-cyan-300"
                  : selectedIndex === idx && item.label.includes("CONFIG")
                    ? "text-magenta-300"
                    : selectedIndex === idx
                      ? "text-cyan-300"
                      : item.label.includes("PROTOCOL")
                        ? "text-cyan-400"
                        : item.label.includes("CONFIG")
                          ? "text-magenta-400"
                          : "text-cyan-300/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-cyan-300/40 text-xs tracking-wider font-mono">
            <div>v1.0.0 • ALPHA</div>
          </div>
          <div className="flex items-center gap-2 text-cyan-300/60 text-xs font-mono">
            <div className="w-5 h-5 border border-cyan-300/60 rounded flex items-center justify-center text-[10px]">
              A
            </div>
            <span>Accept</span>
            <div className="w-5 h-5 border border-cyan-300/60 rounded flex items-center justify-center text-[10px] ml-4">
              ↑↓
            </div>
            <span>Navigate</span>
          </div>
        </div>
      </div>

      <div className="relative z-0 w-2/3">
        <Canvas className="w-full h-full">
          <Scene />
        </Canvas>
      </div>

      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0a0015] border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.5)] p-8 rounded">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfig(false)}
              className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
            >
              <X className="w-6 h-6" />
            </Button>

            <h2
              className="text-3xl font-bold text-cyan-400 mb-6 tracking-wider pr-8"
              style={{ fontFamily: "monospace" }}
            >
              HOW TO PLAY
            </h2>

            <div className="space-y-6 text-cyan-100 text-base font-mono">
              <section>
                <h3 className="text-xl font-bold text-magenta-400 mb-2">
                  OBJECTIVE
                </h3>
                <p className="text-cyan-200/80">
                  Program your fighter with IF-THEN rules (Battle Protocols) to
                  defeat waves of enemies. Each victory unlocks new triggers and
                  actions to build more powerful strategies.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-magenta-400 mb-2">
                  BATTLE PROTOCOLS
                </h3>
                <p className="text-cyan-200/80 mb-2">
                  Click <span className="text-cyan-400 font-bold">PROGRAM</span>{" "}
                  to create IF-THEN rules:
                </p>
                <ul className="list-disc list-inside space-y-1 text-cyan-200/80 ml-4">
                  <li>
                    <span className="text-cyan-400">IF</span> (Trigger) -
                    Condition to check
                  </li>
                  <li>
                    <span className="text-magenta-400">THEN</span> (Action) -
                    What to do
                  </li>
                  <li>Higher priority protocols execute first</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-magenta-400 mb-2">
                  COMBAT
                </h3>
                <p className="text-cyan-200/80 mb-2">
                  Fighters execute on a 6×3 grid:
                </p>
                <ul className="list-disc list-inside space-y-1 text-cyan-200/80 ml-4">
                  <li>Blue side = Your fighter</li>
                  <li>Red side = Enemy fighter</li>
                  <li>Battle ends when one fighter reaches 0 HP</li>
                </ul>
              </section>
            </div>

            <Button
              onClick={() => setShowConfig(false)}
              className="w-full mt-6 h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
            >
              GOT IT
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
