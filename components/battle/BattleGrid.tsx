"use client";

import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

const TILE_SIZE = 1.1;
const SPACING = 1.1; // Exactly matches size for seamless tiling

interface TileProps {
  x: number;
  z: number;
  isPlayerSide: boolean;
}

function Tile({ x, z, isPlayerSide }: TileProps) {
  // Much darker, "Deep Sci-Fi" palette
  const panelColor = isPlayerSide ? "#1d4ed8" : "#be185d"; // Deep Royal Blue vs Deep Raspberry
  const frameColor = isPlayerSide ? "#0f172a" : "#450a0a"; // Almost black-blue vs black-red
  const detailColor = isPlayerSide ? "#60a5fa" : "#f472b6"; // Lighter accent for corners

  const posX = (x - 2.5) * SPACING;
  const posZ = (z - 1) * SPACING;

  return (
    <group position={[posX, 0, posZ]}>
      {/* 1. BASE FRAME - Standard Box for seamless floor (No Gaps) */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>

      {/* 2. TOP PANEL - Rounded and slightly inset */}
      <RoundedBox
        args={[TILE_SIZE * 0.94, 0.04, TILE_SIZE * 0.94]} // 0.94 fills most of the space
        radius={0.03}
        smoothness={4}
        position={[0, 0.02, 0]}
      >
        <meshStandardMaterial
          color={panelColor}
          roughness={0.4}
          metalness={0.2}
          emissive={panelColor}
          emissiveIntensity={0.1} // Very low glow to stop it looking like a lightbulb
        />
      </RoundedBox>

      {/* 3. CORNER DETAILS - Flat geometric accents */}
      {[1, -1].map((dx) =>
        [1, -1].map((dz) => (
          <mesh
            key={`${dx}-${dz}`}
            position={[dx * (TILE_SIZE * 0.42), 0.041, dz * (TILE_SIZE * 0.42)]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {/* Simple L-shape marker using plane */}
            <planeGeometry args={[0.12, 0.12]} />
            <meshBasicMaterial color={detailColor} transparent opacity={0.3} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function BattleGrid() {
  const groupRef = useRef<Group>(null);

  const gridData = [];
  for (let x = 0; x < 6; x++) {
    for (let z = 0; z < 3; z++) {
      gridData.push({ x, z, isPlayerSide: x < 3 });
    }
  }

  // Calculate floor dimensions
  const totalWidth = 6 * SPACING;
  const totalDepth = 3 * SPACING;

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      {gridData.map((data) => (
        <Tile
          key={`tile-${data.x}-${data.z}`}
          x={data.x}
          z={data.z}
          isPlayerSide={data.isPlayerSide}
        />
      ))}

      {/* SUB-FLOOR MESH to catch any tiny render seams */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[totalWidth, 0.01, totalDepth]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* CENTER DIVIDER LINE */}
      <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, totalDepth]} />
        <meshBasicMaterial
          color="#fbbf24" // Amber/Gold
          opacity={0.8}
          transparent
        />
      </mesh>
    </group>
  );
}
