import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Float,
  Sparkles,
  Box,
  Cylinder,
  Icosahedron,
  Octahedron,
  MeshDistortMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { FloatingLabel } from "./MapUtils";
import { POS_BREACH, POS_OVERLOAD, POS_MIRROR, POS_ARENA } from "./config";

// Interface for controlled props
interface CastleProps {
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}

export function BreachCastle({
  isSelected,
  isHovered,
  onClick,
  onHover,
}: CastleProps) {
  // Shared interactive group props
  const interactionProps = {
    onClick: (e: any) => {
      e.stopPropagation();
      onClick();
    },
    onPointerOver: (e: any) => {
      e.stopPropagation();
      onHover(true);
    },
    onPointerOut: (e: any) => {
      e.stopPropagation();
      onHover(false);
    },
  };

  return (
    <group position={[POS_BREACH.x, 0.2, POS_BREACH.y]} {...interactionProps}>
      <group position={[0, 0.5, 0]}>
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            args={[0.4, 2, 0.4]}
            position={[Math.cos(i * 1.57) * 1.2, 0, Math.sin(i * 1.57) * 1.2]}
          >
            <meshStandardMaterial color="#7f1d1d" />
          </Box>
        ))}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.05, 32]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <Box args={[1, 1.5, 1]} position={[0, 0.75, 0]}>
        <meshStandardMaterial
          color={isSelected ? "#fff" : "#991b1b"}
          emissive="#ef4444"
          emissiveIntensity={isSelected || isHovered ? 1 : 0.2}
        />
      </Box>
      <pointLight
        position={[0, 2, 0]}
        color="#ef4444"
        intensity={isSelected ? 10 : 3}
        distance={5}
      />
      <Sparkles
        count={20}
        color="#ef4444"
        scale={[2, 2, 2]}
        position={[0, 1, 0]}
        size={4}
        speed={0.4}
      />
      <FloatingLabel
        label="BREACH"
        sub="CAMPAIGN"
        color="#ef4444"
        hovered={isHovered || isSelected}
      />
    </group>
  );
}

export function OverloadCastle({
  isSelected,
  isHovered,
  onClick,
  onHover,
}: CastleProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    }
  });

  const interactionProps = {
    onClick: (e: any) => {
      e.stopPropagation();
      onClick();
    },
    onPointerOver: (e: any) => {
      e.stopPropagation();
      onHover(true);
    },
    onPointerOut: (e: any) => {
      e.stopPropagation();
      onHover(false);
    },
  };

  return (
    <group position={[POS_OVERLOAD.x, 0, POS_OVERLOAD.y]} {...interactionProps}>
      <Float speed={5} rotationIntensity={2} floatIntensity={1}>
        <Icosahedron ref={coreRef} args={[0.8, 0]} position={[0, 1.2, 0]}>
          <MeshDistortMaterial
            color={isSelected ? "#fff" : "#f59e0b"}
            emissive="#f59e0b"
            emissiveIntensity={isSelected ? 2 : 1}
            speed={5}
            distort={0.4}
            radius={1}
          />
        </Icosahedron>
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
      </mesh>
      <pointLight
        position={[0, 2, 0]}
        color="#f59e0b"
        intensity={isSelected ? 10 : 3}
        distance={5}
      />
      <Sparkles
        count={40}
        color="#fbbf24"
        scale={[3, 3, 3]}
        position={[0, 1, 0]}
        size={6}
        speed={2}
        noise={1}
      />
      <FloatingLabel
        label="OVERLOAD"
        sub="SURVIVAL"
        color="#f59e0b"
        hovered={isHovered || isSelected}
      />
    </group>
  );
}

export function MirrorCastle({
  isSelected,
  isHovered,
  onClick,
  onHover,
}: CastleProps) {
  const interactionProps = {
    onClick: (e: any) => {
      e.stopPropagation();
      onClick();
    },
    onPointerOver: (e: any) => {
      e.stopPropagation();
      onHover(true);
    },
    onPointerOut: (e: any) => {
      e.stopPropagation();
      onHover(false);
    },
  };

  return (
    <group position={[POS_MIRROR.x, 0.5, POS_MIRROR.y]} {...interactionProps}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Octahedron args={[0.8, 0]} position={[0, 1.4, 0]}>
          <meshPhysicalMaterial
            color={isSelected ? "#fff" : "#06b6d4"}
            roughness={0}
            metalness={1}
            emissive="#06b6d4"
            emissiveIntensity={isSelected ? 1 : 0.2}
          />
        </Octahedron>
        <Box args={[0.2, 0.8, 0.2]} position={[1, 1, 0]} rotation={[0, 0, 0.2]}>
          <meshStandardMaterial color="#22d3ee" />
        </Box>
        <Box
          args={[0.2, 0.8, 0.2]}
          position={[-1, 1.7, 0]}
          rotation={[0, 0, -0.2]}
        >
          <meshStandardMaterial color="#22d3ee" />
        </Box>
      </Float>
      <pointLight
        position={[0, 2, 0]}
        color="#06b6d4"
        intensity={isSelected ? 10 : 3}
        distance={5}
      />
      <Sparkles
        count={30}
        color="#22d3ee"
        scale={[2, 4, 2]}
        position={[0, 2, 0]}
        size={2}
        speed={0.2}
        opacity={0.5}
      />
      <FloatingLabel
        label="MIRROR"
        sub="PVP DUEL"
        color="#22d3ee"
        hovered={isHovered || isSelected}
      />
    </group>
  );
}

export function ArenaCastle({
  isSelected,
  isHovered,
  onClick,
  onHover,
}: CastleProps) {
  const interactionProps = {
    onClick: (e: any) => {
      e.stopPropagation();
      onClick();
    },
    onPointerOver: (e: any) => {
      e.stopPropagation();
      onHover(true);
    },
    onPointerOut: (e: any) => {
      e.stopPropagation();
      onHover(false);
    },
  };

  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef1.current) ringRef1.current.rotation.x = t * 0.5;
    if (ringRef2.current) ringRef2.current.rotation.y = t * 0.3;
  });

  return (
    <group position={[POS_ARENA.x, 0.5, POS_ARENA.y]} {...interactionProps}>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
        {/* Holographic Rings */}
        <mesh ref={ringRef1}>
          <torusGeometry args={[1.0, 0.05, 16, 32]} />
          <meshBasicMaterial color={isSelected ? "#fff" : "#a855f7"} />
        </mesh>
        <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.05, 16, 32]} />
          <meshBasicMaterial color="#d8b4fe" />
        </mesh>

        {/* Central Core */}
        <mesh>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#7e22ce"
            emissive="#a855f7"
            emissiveIntensity={2}
          />
        </mesh>
      </Float>

      {/* Base Projector */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 0.5, 8]} />
        <meshStandardMaterial color="#3b0764" />
      </mesh>

      <pointLight
        position={[0, 0, 0]}
        color="#a855f7"
        intensity={isSelected ? 10 : 5}
        distance={5}
      />

      {/* Digital Matrix Particles */}
      <Sparkles
        count={40}
        color="#d8b4fe"
        scale={[2.5, 2.5, 2.5]}
        size={3}
        speed={0.5}
        noise={0}
      />

      <FloatingLabel
        label="ARENA"
        sub="SIMULATION"
        color="#a855f7"
        hovered={isHovered || isSelected}
      />
    </group>
  );
}
