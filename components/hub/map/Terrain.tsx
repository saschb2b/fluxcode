import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  GRID_SIZE,
  HEX_HEIGHT,
  HEX_RADIUS,
  HEX_WIDTH,
  getTerrainData,
} from "./config";
import { GameMode } from "../types";

// --- OCEAN (Unchanged) ---
function CyberOcean({ tiles }: { tiles: any[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const wireRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !wireRef.current) return;
    const time = clock.getElapsedTime();

    tiles.forEach((tile, i) => {
      const x = tile.position[0];
      const z = tile.position[2];
      const dist = Math.sqrt(x * x + z * z);
      const waveY =
        Math.sin(dist * 0.6 - time * 0.8) * 0.15 +
        Math.cos(x * 0.3 + time * 0.5) * 0.1;

      dummy.position.set(x, -0.6 + waveY, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
      wireRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    wireRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, tiles.length]}>
        <cylinderGeometry
          args={[HEX_RADIUS * 0.95, HEX_RADIUS * 0.95, 0.4, 6]}
        />
        <meshStandardMaterial
          color="#020617"
          emissive="#172554"
          emissiveIntensity={0.6}
          roughness={0.1}
        />
      </instancedMesh>
      <instancedMesh ref={wireRef} args={[undefined, undefined, tiles.length]}>
        <cylinderGeometry
          args={[HEX_RADIUS * 0.96, HEX_RADIUS * 0.96, 0.41, 6]}
        />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.1}
        />
      </instancedMesh>
      <Sparkles
        count={150}
        scale={[15, 2, 15]}
        size={3}
        speed={0.4}
        opacity={0.3}
        color="#7dd3fc"
        position={[0, -0.5, 0]}
      />
    </group>
  );
}

// --- INTERACTIVE TILE ---
// This wrapper handles the hover logic per tile
const TileInstance = ({
  data,
  mode,
  isHighlighted,
  onSelect,
  onHover,
}: any) => {
  // We calculate the color once based on state to avoid re-creating objects every frame
  const displayColor = useMemo(() => {
    const base = new THREE.Color(data.color);
    if (isHighlighted) {
      // Brighten and saturate the color on hover
      base.offsetHSL(0, 0.1, 0.2);
      // Add a specific tint based on mode
      if (mode === "BREACH") base.lerp(new THREE.Color("#ef4444"), 0.3);
      if (mode === "OVERLOAD") base.lerp(new THREE.Color("#fbbf24"), 0.3);
      if (mode === "MIRROR") base.lerp(new THREE.Color("#22d3ee"), 0.3);
    }
    return base;
  }, [data.color, isHighlighted, mode]);

  return (
    <Instance
      position={data.position}
      scale={[1, data.height, 1]}
      color={displayColor}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(mode);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(mode);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover("NONE");
      }}
    />
  );
};

// --- MAIN TERRAIN ---
interface TerrainProps {
  activeMode: GameMode;
  hoveredMode: GameMode;
  onSelectMode: (m: GameMode) => void;
  onHoverMode: (m: GameMode) => void;
}

export function Terrain({
  activeMode,
  hoveredMode,
  onSelectMode,
  onHoverMode,
}: TerrainProps) {
  const data = useMemo(() => {
    const tiles = { breach: [], overload: [], mirror: [], ocean: [] } as any;
    const props = { breach: [], overload: [], mirror: [] } as any;

    for (let q = -GRID_SIZE; q <= GRID_SIZE; q++) {
      for (let r = -GRID_SIZE; r <= GRID_SIZE; r++) {
        const x = HEX_WIDTH * q + (HEX_WIDTH / 2) * r;
        const z = HEX_HEIGHT * 0.75 * r;

        const d = getTerrainData(x, z);
        if (!d) continue;

        if (d.biome === "ocean") {
          tiles.ocean.push(d);
        } else {
          tiles[d.biome].push(d);
          const rand = Math.random();
          if (d.height > 0.4 && rand > 0.7) {
            const pScale = 0.2 + Math.random() * 0.3;
            props[d.biome].push({
              position: [x, d.height, z],
              scale: pScale,
              rotation: [rand, rand, rand],
            });
          }
        }
      }
    }
    return { tiles, props };
  }, []);

  // Helper to determine if a specific biome group should glow
  const checkHighlight = (biomeMode: GameMode) => {
    return hoveredMode === biomeMode || activeMode === biomeMode;
  };

  return (
    <group position={[0, -1, 0]}>
      {/* BREACH */}
      <Instances range={data.tiles.breach.length}>
        <cylinderGeometry args={[HEX_RADIUS * 0.95, HEX_RADIUS * 0.95, 1, 6]} />
        <meshStandardMaterial color="#1a0505" roughness={0.9} flatShading />
        {data.tiles.breach.map((d: any, i: number) => (
          <TileInstance
            key={i}
            data={d}
            mode="BREACH"
            isHighlighted={checkHighlight("BREACH")}
            onSelect={onSelectMode}
            onHover={onHoverMode}
          />
        ))}
      </Instances>
      <Instances range={data.props.breach.length}>
        <coneGeometry args={[0.2, 0.4, 4]} />
        <meshStandardMaterial
          color="#000"
          emissive="#ef4444"
          emissiveIntensity={checkHighlight("BREACH") ? 3 : 1}
        />
        {data.props.breach.map((d: any, i: number) => (
          <Instance key={i} position={d.position} scale={d.scale} />
        ))}
      </Instances>

      {/* OVERLOAD */}
      <Instances range={data.tiles.overload.length}>
        <cylinderGeometry args={[HEX_RADIUS * 0.9, HEX_RADIUS * 0.8, 1, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} metalness={0.5} />
        {data.tiles.overload.map((d: any, i: number) => (
          <TileInstance
            key={i}
            data={d}
            mode="OVERLOAD"
            isHighlighted={checkHighlight("OVERLOAD")}
            onSelect={onSelectMode}
            onHover={onHoverMode}
          />
        ))}
      </Instances>
      <Instances range={data.props.overload.length}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#d97706" wireframe />
        {data.props.overload.map((d: any, i: number) => (
          <Instance
            key={i}
            position={[d.position[0], d.position[1] + 0.3, d.position[2]]}
            rotation={d.rotation}
            scale={d.scale}
          />
        ))}
      </Instances>

      {/* MIRROR */}
      <Instances range={data.tiles.mirror.length}>
        <cylinderGeometry args={[HEX_RADIUS * 0.9, HEX_RADIUS * 0.9, 1, 6]} />
        <meshPhysicalMaterial
          color="#0e7490"
          roughness={0.1}
          metalness={0.1}
          transmission={0.6}
          thickness={1.5}
          ior={1.5}
        />
        {data.tiles.mirror.map((d: any, i: number) => (
          <TileInstance
            key={i}
            data={d}
            mode="MIRROR"
            isHighlighted={checkHighlight("MIRROR")}
            onSelect={onSelectMode}
            onHover={onHoverMode}
          />
        ))}
      </Instances>
      <Instances range={data.props.mirror.length}>
        <boxGeometry args={[0.05, 1, 0.05]} />
        <meshBasicMaterial color="#a5f3fc" />
        {data.props.mirror.map((d: any, i: number) => (
          <Instance
            key={i}
            position={[d.position[0], d.position[1] + 0.5, d.position[2]]}
            scale={[1, d.scale, 1]}
          />
        ))}
      </Instances>

      <CyberOcean tiles={data.tiles.ocean} />
    </group>
  );
}
