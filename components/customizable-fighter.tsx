"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Group } from "three";
import { Html } from "@react-three/drei";
import type { Position } from "@/types/game";
import type { FighterCustomization, FighterPart } from "@/lib/fighter-parts";
import { Shield, Crosshair } from "lucide-react";
import { UnifiedIntegrityBar } from "./unified-integrity-bar";

interface CustomizableFighterProps {
  position: Position;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  customization?: FighterCustomization;
  shields?: number;
  maxShields?: number;
  armor?: number;
  maxArmor?: number;
  burnStacks?: number;
  viralStacks?: number;
  empStacks?: number;
  lagStacks?: number;
  corrosiveStacks?: number;
  displaceStacks?: number;
  isPawn?: boolean; // Added isPawn prop to identify guardian pawns
  isGuardian?: boolean; // Added isGuardian prop for size scaling
}

function PartMesh({ part, color }: { part: FighterPart; color: string }) {
  const geometry = useMemo(() => {
    switch (part.shape) {
      case "cube":
        return <boxGeometry args={part.scale} />;
      case "sphere":
        return <sphereGeometry args={[part.scale[0], 16, 16]} />;
      case "cylinder":
        return (
          <cylinderGeometry
            args={[part.scale[0], part.scale[0], part.scale[1], 16]}
          />
        );
      case "cone":
        return <coneGeometry args={[part.scale[0], part.scale[1], 16]} />;
      case "pyramid":
        return <coneGeometry args={[part.scale[0], part.scale[1], 4]} />;
      case "torus":
        return <torusGeometry args={[part.scale[0], part.scale[2], 16, 32]} />;
      default:
        return <boxGeometry args={part.scale} />;
    }
  }, [part.shape, part.scale]);

  return (
    <mesh position={part.position} rotation={part.rotation} castShadow>
      {geometry}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function getChassisModifier(chassis?: FighterPart): {
  scale: [number, number, number];
  shape: string;
} {
  if (!chassis) return { scale: [1, 1, 1], shape: "cube" };

  const chassisId = chassis.id;

  // Map chassis types to visual modifications
  if (
    chassisId.includes("stealth") ||
    chassisId.includes("ghost") ||
    chassisId.includes("recon")
  ) {
    return { scale: [0.8, 1.2, 0.4], shape: "cylinder" };
  }
  if (chassisId.includes("heavy") || chassisId.includes("fortress")) {
    return { scale: [1.3, 1.5, 0.8], shape: "cube" };
  }
  if (chassisId.includes("assault")) {
    return { scale: [1.1, 1.3, 0.7], shape: "cube" };
  }
  if (chassisId.includes("light") || chassisId.includes("scout")) {
    return { scale: [0.85, 1, 0.45], shape: "cylinder" };
  }
  if (chassisId.includes("support")) {
    return { scale: [0.95, 1.1, 0.6], shape: "cylinder" };
  }

  return { scale: [1, 1, 1], shape: "cube" };
}

export function CustomizableFighter({
  position,
  isPlayer,
  hp,
  maxHp,
  customization,
  shields = 0,
  maxShields = 0,
  armor = 0,
  maxArmor = 0,
  burnStacks = 0,
  viralStacks = 0,
  empStacks = 0,
  lagStacks = 0,
  corrosiveStacks = 0,
  displaceStacks = 0,
  isPawn = false, // Default to false
  isGuardian = false, // Default to false
}: CustomizableFighterProps) {
  if (!position) {
    console.error(
      "[v0] CustomizableFighter received undefined position, using fallback",
    );
    position = { x: 0, y: 0 };
  }

  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const currentPosRef = useRef<[number, number, number]>([0, 0.6, 0]);
  const targetPosRef = useRef<[number, number, number]>([0, 0.6, 0]);
  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);

  const targetWorldPos = useMemo(() => {
    const x = (position.x - 2.5) * 1.1;
    const z = (position.y - 1) * 1.1;
    return [x, 0.6, z] as [number, number, number];
  }, [position.x, position.y]);

  useEffect(() => {
    targetPosRef.current = targetWorldPos;
  }, [targetWorldPos]);

  useEffect(() => {
    currentPosRef.current = targetWorldPos;
    velocityRef.current = [0, 0, 0];
    if (groupRef.current) {
      groupRef.current.position.set(...targetWorldPos);
      groupRef.current.rotation.z = 0;
      groupRef.current.rotation.x = 0;
    }
  }, [targetWorldPos]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const current = currentPosRef.current;
    const target = targetPosRef.current;
    const velocity = velocityRef.current;

    const dx = target[0] - current[0];
    const dz = target[2] - current[2];
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 0.01) {
      const speed = 8;
      const damping = 0.85;

      velocity[0] += dx * speed * delta;
      velocity[2] += dz * speed * delta;

      velocity[0] *= damping;
      velocity[2] *= damping;

      current[0] += velocity[0] * delta;
      current[2] += velocity[2] * delta;

      groupRef.current.position.set(current[0], current[1], current[2]);

      const tiltAmount = Math.min(distance * 0.3, 0.3);
      groupRef.current.rotation.z = -velocity[0] * tiltAmount;
      groupRef.current.rotation.x = velocity[2] * tiltAmount;
    } else {
      current[0] = target[0];
      current[2] = target[2];
      velocity[0] = 0;
      velocity[2] = 0;
      groupRef.current.position.set(current[0], current[1], current[2]);
      groupRef.current.rotation.z = 0;
      groupRef.current.rotation.x = 0;
    }

    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const defaultColor = isPlayer ? "#3b82f6" : "#ef4444";
  const primaryColor = customization?.primaryColor || defaultColor;
  const secondaryColor = customization?.secondaryColor || defaultColor;
  const hpPercent = (hp / maxHp) * 100;
  const shieldPercent = maxShields > 0 ? (shields / maxShields) * 100 : 0;
  const armorPercent = maxArmor > 0 ? (armor / maxArmor) * 100 : 0;

  const armorReduction = armor > 0 ? (armor / (armor + 300)) * 100 : 0;

  const chassisModifier = useMemo(
    () => getChassisModifier(customization?.chassis),
    [customization?.chassis],
  );

  const sizeScale = useMemo(() => {
    if (isPlayer) return 1.0;
    if (isGuardian) return 1.4; // Guardians are 40% larger
    if (isPawn) return 0.7; // Pawns are 30% smaller
    return 1.0;
  }, [isPlayer, isGuardian, isPawn]);

  const showStatusEffects =
    burnStacks > 0 ||
    viralStacks > 0 ||
    empStacks > 0 ||
    lagStacks > 0 ||
    displaceStacks > 0 ||
    corrosiveStacks > 0;

  return (
    <group ref={groupRef}>
      <group ref={meshRef} scale={[sizeScale, sizeScale, sizeScale]}>
        {burnStacks > 0 && (
          <pointLight
            position={[0, 0, 0]}
            intensity={burnStacks * 0.5}
            distance={2}
            color="#ff4500"
            decay={2}
          />
        )}

        {viralStacks > 0 && (
          <pointLight
            position={[0, 0, 0]}
            intensity={viralStacks * 0.4}
            distance={2.5}
            color="#00ff00"
            decay={2}
          />
        )}

        {empStacks > 0 && (
          <pointLight
            position={[0, 0, 0]}
            intensity={empStacks * 0.6}
            distance={3}
            color="#00ffff"
            decay={2}
          />
        )}

        {customization?.body && (
          <PartMesh
            part={{
              ...customization.body,
              scale: [
                customization.body.scale[0] * chassisModifier.scale[0],
                customization.body.scale[1] * chassisModifier.scale[1],
                customization.body.scale[2] * chassisModifier.scale[2],
              ] as [number, number, number],
              shape: chassisModifier.shape as any,
            }}
            color={
              empStacks > 0
                ? `#00${Math.floor(255 - empStacks * 30)
                    .toString(16)
                    .padStart(2, "0")}ff`
                : viralStacks > 0
                  ? `#${Math.floor(255 - viralStacks * 30)
                      .toString(16)
                      .padStart(2, "0")}ff${Math.floor(255 - viralStacks * 30)
                      .toString(16)
                      .padStart(2, "0")}`
                  : primaryColor
            }
          />
        )}

        {customization?.head && (
          <PartMesh part={customization.head} color={primaryColor} />
        )}

        {customization?.leftArm && (
          <PartMesh
            part={{
              ...customization.leftArm,
              position: [-0.45, -0.1, 0] as [number, number, number],
            }}
            color={secondaryColor}
          />
        )}

        {customization?.rightArm && (
          <PartMesh
            part={{
              ...customization.rightArm,
              position: [0.45, -0.1, 0] as [number, number, number],
            }}
            color={secondaryColor}
          />
        )}

        {customization?.accessory && customization.accessory.id !== "none" && (
          <PartMesh part={customization.accessory} color={secondaryColor} />
        )}

        <mesh position={[0.1, 0.85, 0.21]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[-0.1, 0.85, 0.21]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={2}
          />
        </mesh>
      </group>

      <Html position={[0, 1.5, 0]} center zIndexRange={[0, 0]}>
        <UnifiedIntegrityBar
          entityName={isPlayer ? "PLAYER" : "ENEMY"}
          isPlayer={isPlayer}
          hp={hp}
          maxHp={maxHp}
          shields={shields}
          maxShields={maxShields}
          armor={armor}
          maxArmor={maxArmor}
          burnStacks={burnStacks}
          viralStacks={viralStacks}
          empStacks={empStacks}
          lagStacks={lagStacks}
          displaceStacks={displaceStacks}
          corrosiveStacks={corrosiveStacks}
          showStatusEffects={showStatusEffects}
        />
      </Html>
    </group>
  );
}
