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
// Different 3D shapes based on contract type
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
  index,
  position,
  onClick,
}: ContractSlateProps) {
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  // Theme Colors
  const isDaily = contract.refreshType === "daily";
  const themeColor = isDaily ? "#fbbf24" : "#d946ef"; // Amber vs Fuschia
  const difficultyColor =
    contract.difficulty === "elite" ? "#ef4444" : themeColor;

  // Tilt Logic Ref
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth Tilt towards mouse
    if (hovered) {
      // Convert mouse screen pos to slight rotation
      const targetX = state.pointer.y * 0.2; // Tilt X based on Mouse Y
      const targetY = state.pointer.x * 0.2; // Tilt Y based on Mouse X

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
      // Slight lift
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        position[2] + 0.5,
        delta * 10,
      );
    } else {
      // Return to rest
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
      {/* 1. GLASS SLATE BODY */}
      <RoundedBox args={[2.8, 3.5, 0.1]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color="#000"
          roughness={0.2}
          metalness={0.9}
          transmission={0} // Opaque metal look like Warframe UI
          clearcoat={1}
          emissive={themeColor}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </RoundedBox>

      {/* 2. GLOWING BORDER FRAME */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.9, 3.6, 0.05]} />
        <meshBasicMaterial color={difficultyColor} />
      </mesh>

      {/* 3. CONTENT CONTAINER (Floating slightly above card) */}
      <group position={[0, 0, 0.1]}>
        {/* Header: Title */}
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.2} // Slightly smaller
          color={hovered ? "#fff" : themeColor}
          anchorX="center"
          anchorY="top" // Grow downwards
          maxWidth={2.4} // Constrain width inside card
          textAlign="center"
          lineHeight={1.2}
        >
          {contract.name.toUpperCase()}
        </Text>

        {/* Center: Holographic Icon Viewport */}
        {/* Use Portal to simulate depth "inside" the card */}
        <group position={[0, 0.2, 0]}>
          <mesh>
            <circleGeometry args={[0.8, 32]} />
            <MeshPortalMaterial>
              <color attach="background" args={["#000"]} />
              <ambientLight intensity={1} />
              <Float speed={2}>
                <ContractIcon type={contract.type} color={themeColor} />
              </Float>
              {/* Grid inside portal */}
              <gridHelper
                args={[5, 10, themeColor, themeColor]}
                position={[0, -1, 0]}
              />
            </MeshPortalMaterial>
          </mesh>
          {/* Ring around portal */}
          <mesh>
            <ringGeometry args={[0.8, 0.85, 32]} />
            <meshBasicMaterial color={themeColor} />
          </mesh>
        </group>

        {/* Footer: Progress Bar */}
        <group position={[0, -1.0, 0]}>
          <Text position={[0, 0.3, 0]} fontSize={0.12} color="#aaa">
            {contract.progress} / {contract.maxProgress}
          </Text>
          {/* Bar Background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.2, 0.15]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          {/* Bar Fill */}
          <mesh position={[-1.1 + 1.1 * progressPct, 0, 0.01]}>
            <planeGeometry args={[2.2 * progressPct, 0.15]} />
            <meshBasicMaterial color={isComplete ? "#4ade80" : themeColor} />
          </mesh>
        </group>

        {/* Reward Pill */}
        <group position={[0, -1.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
            <meshBasicMaterial color="#333" />
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

        {/* Claim Overlay */}
        {isComplete && (
          <Text position={[0, 0, 0.5]} fontSize={0.4} color="#4ade80">
            READY
          </Text>
        )}
      </group>
    </group>
  );
}
