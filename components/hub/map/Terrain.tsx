import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  GRID_SIZE,
  HEX_HEIGHT,
  HEX_RADIUS,
  HEX_WIDTH,
  getTerrainData,
} from "./config";
import { GameMode } from "../types";

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
      // Wave calculation
      const waveY =
        Math.sin(dist * 0.6 - time * 0.8) * 0.15 +
        Math.cos(x * 0.3 + time * 0.5) * 0.1;

      dummy.position.set(x, -0.6 + waveY, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
      wireRef.current!.setMatrixAt(i, dummy.matrix);
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

const BiomeMesh = ({
  tiles,
  mode,
  geometry,
  material,
  activeMode,
  hoveredMode,
  onSelect,
  onHover,
}: {
  tiles: any[];
  mode: GameMode;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  activeMode: GameMode;
  hoveredMode: GameMode;
  onSelect: (m: GameMode) => void;
  onHover: (m: GameMode) => void;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const isHighlighted = activeMode === mode || hoveredMode === mode;

  // Memoize the material so it only changes when highlight state changes
  const displayMaterial = useMemo(() => {
    const mat = material.clone();
    if (isHighlighted) {
      // @ts-ignore
      if (mat.emissive) {
        // @ts-ignore
        mat.emissiveIntensity = 2.0;
        // @ts-ignore
        mat.color.offsetHSL(0, 0, 0.1);
      }
    }
    return mat;
  }, [material, isHighlighted]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();

    tiles.forEach((data, i) => {
      // Set Position/Scale
      tempObject.position.set(
        data.position[0],
        data.position[1],
        data.position[2],
      );
      tempObject.scale.set(1, data.height, 1);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Set Color
      tempColor.set(data.color);
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  }, [tiles, displayMaterial]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, displayMaterial, tiles.length]}
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

const PropsMesh = ({
  items,
  geometry,
  material,
}: {
  items: any[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempObject = new THREE.Object3D();

    items.forEach((data, i) => {
      tempObject.position.set(
        data.position[0],
        data.position[1],
        data.position[2],
      );
      tempObject.rotation.set(
        data.rotation[0],
        data.rotation[1],
        data.rotation[2],
      );
      tempObject.scale.set(data.scale, data.scale, data.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [items]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, items.length]} />
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
  // Pre-calculate all data points ONCE.
  // This is pure math (fast). The React Node creation was the slow part.
  const { tiles, props } = useMemo(() => {
    const _tiles = {
      breach: [],
      overload: [],
      mirror: [],
      arena: [],
      ocean: [],
    } as any;
    const _props = {
      breach: [],
      overload: [],
      mirror: [],
      arena: [],
    } as any;

    for (let q = -GRID_SIZE; q <= GRID_SIZE; q++) {
      for (let r = -GRID_SIZE; r <= GRID_SIZE; r++) {
        const x = HEX_WIDTH * q + (HEX_WIDTH / 2) * r;
        const z = HEX_HEIGHT * 0.75 * r;

        const d = getTerrainData(x, z);
        if (!d) continue;

        if (d.biome === "ocean") {
          _tiles.ocean.push(d);
        } else {
          // Push to specific biome array
          if (_tiles[d.biome]) {
            _tiles[d.biome].push(d);
          } else {
            // Fallback
            _tiles.ocean.push(d);
          }

          // Generate Prop data
          const rand = Math.random();
          if (d.height > 0.4 && rand > 0.75 && _props[d.biome]) {
            const pScale = 0.2 + Math.random() * 0.3;
            _props[d.biome].push({
              position: [x, d.height, z],
              scale: pScale,
              rotation: [rand, rand, rand],
            });
          }
        }
      }
    }
    return { tiles: _tiles, props: _props };
  }, []);

  // -- GEOMETRIES & MATERIALS --
  // We create them once here to pass into the InstancedMeshes
  const hexGeo = useMemo(
    () =>
      new THREE.CylinderGeometry(HEX_RADIUS * 0.95, HEX_RADIUS * 0.95, 1, 6),
    [],
  );

  // Materials
  const matBreach = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a0505",
        roughness: 0.9,
        flatShading: true,
      }),
    [],
  );
  const matOverload = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#451a03",
        roughness: 0.8,
        metalness: 0.5,
      }),
    [],
  );
  const matMirror = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0e7490",
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.6,
        thickness: 1.5,
      }),
    [],
  );
  const matArena = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1e1b4b",
        roughness: 0.3,
        metalness: 0.8,
      }),
    [],
  );

  // Props Geometries/Materials
  const geoCone = useMemo(() => new THREE.ConeGeometry(0.2, 0.4, 4), []);
  const matCone = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#000",
        emissive: "#ef4444",
        emissiveIntensity: 2,
      }),
    [],
  );

  const geoBox = useMemo(() => new THREE.BoxGeometry(0.3, 0.3, 0.3), []);
  const matBox = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d97706", wireframe: true }),
    [],
  );

  const geoStream = useMemo(() => new THREE.BoxGeometry(0.05, 1, 0.05), []);
  const matStream = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#a5f3fc" }),
    [],
  );

  const geoCube = useMemo(() => new THREE.BoxGeometry(0.2, 0.2, 0.2), []);
  const matCube = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#a855f7", wireframe: true }),
    [],
  );

  return (
    <group position={[0, -1, 0]}>
      {/* --- BREACH --- */}
      <BiomeMesh
        mode="BREACH"
        tiles={tiles.breach}
        geometry={hexGeo}
        material={matBreach}
        activeMode={activeMode}
        hoveredMode={hoveredMode}
        onSelect={onSelectMode}
        onHover={onHoverMode}
      />
      <PropsMesh items={props.breach} geometry={geoCone} material={matCone} />

      {/* --- OVERLOAD --- */}
      <BiomeMesh
        mode="OVERLOAD"
        tiles={tiles.overload}
        geometry={hexGeo}
        material={matOverload}
        activeMode={activeMode}
        hoveredMode={hoveredMode}
        onSelect={onSelectMode}
        onHover={onHoverMode}
      />
      <PropsMesh items={props.overload} geometry={geoBox} material={matBox} />

      {/* --- MIRROR --- */}
      <BiomeMesh
        mode="MIRROR"
        tiles={tiles.mirror}
        geometry={hexGeo}
        material={matMirror}
        activeMode={activeMode}
        hoveredMode={hoveredMode}
        onSelect={onSelectMode}
        onHover={onHoverMode}
      />
      <PropsMesh
        items={props.mirror}
        geometry={geoStream}
        material={matStream}
      />

      {/* --- ARENA --- */}
      <BiomeMesh
        mode="ARENA"
        tiles={tiles.arena}
        geometry={hexGeo}
        material={matArena}
        activeMode={activeMode}
        hoveredMode={hoveredMode}
        onSelect={onSelectMode}
        onHover={onHoverMode}
      />
      <PropsMesh items={props.arena} geometry={geoCube} material={matCube} />

      {/* --- OCEAN --- */}
      <CyberOcean tiles={tiles.ocean} />
    </group>
  );
}
