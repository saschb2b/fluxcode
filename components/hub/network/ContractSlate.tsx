import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Text,
  RoundedBox,
  useCursor,
  MeshPortalMaterial,
  Float,
} from "@react-three/drei";
import * as THREE from "three";
import type { NetworkContractWithClaimed } from "@/lib/network-contracts";

// --- HOLOGRAPHIC ICONS ---
const ContractIcon = ({ type, color }: { type: string; color: string }) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.5;
      mesh.current.rotation.y += delta;
    }
  });

  const material = <meshBasicMaterial color={color} wireframe />;

  switch (type) {
    case "damage-type":
      return (
        <mesh ref={mesh}>
          <octahedronGeometry args={[0.4, 0]} />
          {material}
        </mesh>
      );
    case "survival":
      return (
        <mesh ref={mesh}>
          <icosahedronGeometry args={[0.4, 0]} />
          {material}
        </mesh>
      );
    case "efficiency":
      return (
        <mesh ref={mesh}>
          <torusGeometry args={[0.3, 0.1, 8, 16]} />
          {material}
        </mesh>
      );
    default:
      return (
        <mesh ref={mesh}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          {material}
        </mesh>
      );
  }
};

interface ContractSlateProps {
  contract: NetworkContractWithClaimed;
  index: number;
  position: [number, number, number];
  onClick: (c: NetworkContractWithClaimed) => void;
}

export function ContractSlate({
  contract,
  position,
  onClick,
}: ContractSlateProps) {
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  // Theme Colors
  const isDaily = contract.refreshType === "daily";
  const themeColor = isDaily ? "#fbbf24" : "#d946ef";
  const difficultyColor =
    contract.difficulty === "elite" ? "#ef4444" : themeColor;

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (hovered) {
      const targetX = state.pointer.y * 0.2;
      const targetY = state.pointer.x * 0.2;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        delta * 10,
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        delta * 10,
      );
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        position[2] + 0.5,
        delta * 10,
      );
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0,
        delta * 5,
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        delta * 5,
      );
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        position[2],
        delta * 5,
      );
    }
  });

  const isComplete = contract.progress >= contract.maxProgress;
  const progressPct = contract.progress / contract.maxProgress;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick(contract);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
      }}
    >
      {/* 1. OCCLUSION BACKING (Prevents background bleed-through) */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.7, 3.4, 0.05]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. MAIN BODY (Matte Black Metal) */}
      <RoundedBox args={[2.8, 3.5, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color="#111111" // Dark Grey/Black
          roughness={0.6} // Less shiny
          metalness={0.8}
          emissive={themeColor}
          emissiveIntensity={hovered ? 0.15 : 0}
          envMapIntensity={0} // CRITICAL: Disables green reflections from Hub
        />
      </RoundedBox>

      {/* 3. GLOWING BORDER FRAME */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.9, 3.6, 0.05]} />
        <meshBasicMaterial color={difficultyColor} />
      </mesh>

      {/* 4. CONTENT */}
      <group position={[0, 0, 0.1]}>
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.2}
          color={hovered ? "#fff" : themeColor}
          anchorX="center"
          anchorY="top"
          maxWidth={2.4}
          textAlign="center"
          lineHeight={1.2}
        >
          {contract.name.toUpperCase()}
        </Text>

        {/* PORTAL VIEWPORT */}
        <group position={[0, 0.2, 0]}>
          <mesh>
            <circleGeometry args={[0.8, 32]} />
            <MeshPortalMaterial resolution={512} blur={0.5}>
              {/* Opaque Portal Background */}
              <color attach="background" args={["#050505"]} />

              <ambientLight intensity={1.5} />
              <Float speed={2}>
                <ContractIcon type={contract.type} color={themeColor} />
              </Float>
              {/* Portal Grid */}
              <gridHelper
                args={[5, 10, themeColor, "#222"]}
                position={[0, -1, 0]}
              />
            </MeshPortalMaterial>
          </mesh>

          {/* Ring Border */}
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[0.8, 0.85, 32]} />
            <meshBasicMaterial color={themeColor} />
          </mesh>
        </group>

        {/* Progress Bar */}
        <group position={[0, -1.0, 0]}>
          <Text position={[0, 0, 0]} fontSize={0.12} color="#efefef">
            {contract.progress} / {contract.maxProgress}
          </Text>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.2, 0.15]} />
            <meshBasicMaterial color="#222" />
          </mesh>
          <mesh position={[-1.1 + 1.1 * progressPct, 0, 0.01]}>
            <planeGeometry args={[2.2 * progressPct, 0.15]} />
            <meshBasicMaterial color={isComplete ? "#4ade80" : themeColor} />
          </mesh>
        </group>

        {/* Reward */}
        <group position={[0, -1.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
            <meshBasicMaterial color="#222" />
          </mesh>
          <Text
            position={[0, 0, 0.16]}
            fontSize={0.15}
            color="#fbbf24"
            fontWeight="bold"
          >
            {contract.rewards.cipherFragments} CF
          </Text>
        </group>

        {isComplete && (
          <Text position={[0, 0, 0.5]} fontSize={0.4} color="#4ade80">
            READY
          </Text>
        )}
      </group>
    </group>
  );
}
