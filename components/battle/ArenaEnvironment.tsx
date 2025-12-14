"use client";

import { Instance, Instances, Grid, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// Shared logic for generating pillar positions
function usePillarData() {
  return useMemo(() => {
    const temp = [];
    const count = 50; // Increased count for density
    const minRadius = 18;
    const maxRadius = 70;

    for (let i = 0; i < count; i++) {
      // Polar coordinates for donut distribution
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Randomize height and speed
      const yFactor = -25 - Math.random() * 15;
      const speed = 0.2 + Math.random() * 0.5;
      const timeOffset = Math.random() * 100;

      // Random scale to vary thickness
      const scaleXZ = 1 + Math.random() * 1.5;

      temp.push({ x, z, yFactor, speed, timeOffset, scaleXZ });
    }
    return temp;
  }, []);
}

function CyberPillars() {
  const data = usePillarData();

  return (
    <group>
      {/* LAYER 1: The Solid Hull (Blocks view, catches shadows) */}
      <Instances range={data.length}>
        <boxGeometry args={[2, 80, 2]} />
        <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
        {data.map((props, i) => (
          <PillarInstance key={`hull-${i}`} {...props} />
        ))}
      </Instances>

      {/* LAYER 2: The Wireframe Cage (The "Cyber" look) */}
      <Instances range={data.length}>
        {/* Slightly larger geometry */}
        <boxGeometry args={[2.1, 80, 2.1]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.15}
        />
        {data.map((props, i) => (
          <PillarInstance key={`wire-${i}`} {...props} />
        ))}
      </Instances>

      {/* LAYER 3: Emissive Stripe (Vertical Data Line) */}
      <Instances range={data.length}>
        <boxGeometry args={[0.2, 80, 2.2]} /> {/* Thin strip sticking out */}
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
        {data.map((props, i) => (
          <PillarInstance key={`light-${i}`} {...props} />
        ))}
      </Instances>
    </group>
  );
}

function PillarInstance({ x, z, yFactor, speed, timeOffset, scaleXZ }: any) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() + timeOffset;
      // Slow, heavy vertical breathing
      const yOscillation = Math.sin(t * speed * 0.5) * 4;

      ref.current.position.set(x, yFactor + yOscillation, z);
      ref.current.scale.set(scaleXZ, 1, scaleXZ);
    }
  });

  return <Instance ref={ref} />;
}

export function ArenaEnvironment() {
  return (
    <group>
      {/* 1. ATMOSPHERE */}
      {/* Dark Blue/Purple tint for deep space feel */}
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 15, 60]} />

      {/* 2. CYBER PILLARS */}
      <CyberPillars />

      {/* 3. DIGITAL HORIZON GRID */}
      <group position={[0, -6, 0]}>
        {/* Main Floor Grid */}
        <Grid
          infiniteGrid
          cellSize={2}
          sectionSize={10}
          fadeDistance={60}
          sectionColor="#4f46e5" // Indigo
          cellColor="#1e293b" // Slate
          sectionThickness={1.5}
          cellThickness={1}
        />
        {/* Reflection Plane Illusion (subtle glow underneath) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* 4. BACKGROUND DATA RAIN */}
      {/* Simulates "bits" floating in the void */}
      <Sparkles
        count={200}
        scale={[60, 40, 60]} // Wide area
        size={4}
        speed={0.4}
        opacity={0.5}
        color="#6366f1"
        position={[0, 10, -10]} // Higher up
      />

      {/* 5. LIGHTING */}
      <ambientLight intensity={0.2} />

      {/* Dramatic Rim Lighting */}
      <spotLight
        position={[-30, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={40}
        color="#3b82f6" // Cyber Blue
        distance={100}
        castShadow
      />
      <spotLight
        position={[30, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={40}
        color="#a855f7" // Cyber Purple
        distance={100}
        castShadow
      />
      {/* Fill Light from below (Underglow) */}
      <pointLight
        position={[0, -10, 0]}
        intensity={10}
        color="#0f172a"
        distance={50}
      />
    </group>
  );
}
