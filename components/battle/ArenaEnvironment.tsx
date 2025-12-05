"use client";

import { Instance, Instances, Grid } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// ... (DataPillars code remains the same as above) ...
function DataPillars() {
  const particles = useMemo(() => {
    const temp = [];
    const count = 40;
    const minRadius = 15;
    const maxRadius = 60;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const yFactor = -20 - Math.random() * 10;
      const speed = 0.2 + Math.random() * 0.5;
      const timeOffset = Math.random() * 100;

      temp.push({ x, z, yFactor, speed, timeOffset });
    }
    return temp;
  }, []);

  return (
    <Instances range={40}>
      <boxGeometry args={[2, 60, 2]} />
      <meshStandardMaterial color="#0f172a" roughness={0.8} />
      {particles.map((data, i) => (
        <Pillar key={i} data={data} />
      ))}
    </Instances>
  );
}

function Pillar({ data }: { data: any }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() + data.timeOffset;
      const yOscillation = Math.sin(t * data.speed) * 2;
      ref.current.position.set(data.x, data.yFactor + yOscillation, data.z);
    }
  });
  return <Instance ref={ref} />;
}
// ... (End DataPillars) ...

export function ArenaEnvironment() {
  return (
    <group>
      {/* 1. ATMOSPHERE */}
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 10, 50]} />

      {/* 2. BACKGROUND GEOMETRY */}
      <DataPillars />

      {/* 3. THE "ABYSS" GRID - REPLACED */}
      {/* Using Drei's Grid for better visibility and infinite fade effect */}
      <group position={[0, -8, 0]}>
        <Grid
          infiniteGrid
          cellSize={2}
          sectionSize={10}
          fadeDistance={50} // Matches the fog end distance
          sectionColor="#6366f1" // Bright Indigo (Visible)
          cellColor="#1e293b" // Slate (Subtle)
          sectionThickness={1.5}
          cellThickness={1}
        />
      </group>

      {/* 4. LIGHTING */}
      <ambientLight intensity={0.4} />
      <spotLight
        position={[-15, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={30}
        color="#3b82f6"
        distance={50}
        castShadow
      />
      <spotLight
        position={[15, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={30}
        color="#ef4444"
        distance={50}
        castShadow
      />
    </group>
  );
}
