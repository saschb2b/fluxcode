"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CyberGruntModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}

export function CyberGruntModel({
  isAttacking,
  isHit,
  hpPercentage,
}: CyberGruntModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Body Parts
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const armLeftRef = useRef<THREE.Group>(null);
  const armRightRef = useRef<THREE.Group>(null);
  const legLeftRef = useRef<THREE.Group>(null);
  const legRightRef = useRef<THREE.Group>(null);

  // Weapon
  const cannonBarrelRef = useRef<THREE.Mesh>(null);
  const cannonLightRef = useRef<THREE.PointLight>(null);

  const offset = useRef(Math.random() * 100).current;

  const armorColor = "#334155";
  const jointColor = "#0f172a";
  const glowColor = isAttacking ? "#ef4444" : "#3b82f6";

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !torsoRef.current ||
      !legLeftRef.current ||
      !legRightRef.current
    )
      return;

    const t = state.clock.elapsedTime + offset;

    // --- 1. PHYSICS (Bobbing relative to ground) ---
    const breath = Math.sin(t * 2) * 0.01;
    const walkBob = isAttacking ? Math.abs(Math.sin(t * 8)) * 0.05 : 0;

    // Base Y is 0 (Ground). We add bobbing.
    groupRef.current.position.y = breath + walkBob;

    // --- 2. LEGS ---
    if (isAttacking) {
      // Marching
      const walkSpeed = 8;
      legLeftRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.4;
      legRightRef.current.rotation.x = Math.cos(t * walkSpeed) * 0.4;
      torsoRef.current.rotation.y = Math.cos(t * walkSpeed) * 0.1;
    } else {
      // Stance
      legLeftRef.current.rotation.x = 0;
      legLeftRef.current.rotation.z = -0.1;
      legRightRef.current.rotation.x = 0;
      legRightRef.current.rotation.z = 0.1;
      torsoRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }

    // --- 3. ARMS ---
    if (isAttacking && armRightRef.current && armLeftRef.current) {
      armRightRef.current.rotation.x = THREE.MathUtils.lerp(
        armRightRef.current.rotation.x,
        -Math.PI / 2,
        delta * 15,
      );
      armRightRef.current.rotation.z = 0;

      armLeftRef.current.rotation.x = -0.5;
      armLeftRef.current.rotation.z = 0.4;

      armRightRef.current.position.z = Math.sin(t * 40) * 0.02; // Recoil
    } else if (armRightRef.current && armLeftRef.current) {
      armRightRef.current.rotation.x = THREE.MathUtils.lerp(
        armRightRef.current.rotation.x,
        0,
        delta * 5,
      );
      armRightRef.current.rotation.z = -0.2;
      armLeftRef.current.rotation.x = THREE.MathUtils.lerp(
        armLeftRef.current.rotation.x,
        0,
        delta * 5,
      );
      armLeftRef.current.rotation.z = 0.2;
    }

    // --- 4. HEAD ---
    if (headRef.current) {
      if (isAttacking) {
        headRef.current.rotation.y = 0;
        headRef.current.rotation.x = 0;
      } else {
        headRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
      }
    }

    // --- 5. FX ---
    if (cannonBarrelRef.current) {
      const mat = cannonBarrelRef.current.material as THREE.MeshBasicMaterial;
      if (isAttacking) {
        const flash = Math.sin(t * 30) > 0 ? 1 : 0.5;
        mat.color.set("#ef4444");
        mat.opacity = flash;
        if (cannonLightRef.current)
          cannonLightRef.current.intensity = flash * 3;
      } else {
        mat.color.set("#3b82f6");
        mat.opacity = 0.2;
        if (cannonLightRef.current) cannonLightRef.current.intensity = 0;
      }
    }

    // --- 6. HIT ---
    if (isHit) {
      groupRef.current.position.z = -0.1;
      torsoRef.current.rotation.x = -0.2;
    } else {
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        0,
        delta * 5,
      );
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(
        torsoRef.current.rotation.x,
        0.1,
        delta * 5,
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* SHIFT EVERYTHING UP so (0,0,0) is the feet */}
      <group position={[0, 0.3, 0]}>
        {/* === TORSO === */}
        <group ref={torsoRef}>
          <mesh position={[0, 0.25, 0]}>
            <RoundedBox args={[0.5, 0.45, 0.35]} radius={0.05} smoothness={4}>
              <meshStandardMaterial
                color={armorColor}
                roughness={0.4}
                metalness={0.6}
              />
            </RoundedBox>
          </mesh>
          <mesh position={[0, 0.25, 0.18]}>
            <boxGeometry args={[0.2, 0.1, 0.02]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.3]} />
            <meshStandardMaterial color={jointColor} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <RoundedBox args={[0.48, 0.15, 0.3]} radius={0.05}>
              <meshStandardMaterial color={armorColor} />
            </RoundedBox>
          </mesh>

          {/* HEAD */}
          <group ref={headRef} position={[0, 0.6, 0]}>
            <RoundedBox args={[0.3, 0.35, 0.35]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color={armorColor} />
            </RoundedBox>
            <mesh position={[0, 0.05, 0.16]}>
              <boxGeometry args={[0.25, 0.1, 0.05]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 0.05, 0.19]}>
              <planeGeometry args={[isAttacking ? 0.15 : 0.08, 0.04]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
          </group>

          {/* ARMS */}
          <group ref={armLeftRef} position={[-0.38, 0.4, 0]}>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.15, 0.5, 0.15]} />
              <meshStandardMaterial color={armorColor} />
            </mesh>
            <mesh position={[0, -0.55, 0]}>
              <boxGeometry args={[0.12, 0.15, 0.15]} />
              <meshStandardMaterial color={jointColor} />
            </mesh>
          </group>

          <group ref={armRightRef} position={[0.38, 0.4, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.18]} />
              <meshStandardMaterial color={armorColor} />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.18, 0.5, 0.18]} />
              <meshStandardMaterial color={armorColor} />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 0.4]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh ref={cannonBarrelRef} position={[0, -0.82, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.05]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
            <pointLight
              ref={cannonLightRef}
              position={[0, -0.9, 0]}
              distance={3}
              decay={2}
              color={glowColor}
            />
          </group>
        </group>

        {/* === LEGS (Pivot relative to hip height -0.3) === */}
        <group position={[0, -0.3, 0]}>
          <group ref={legLeftRef} position={[-0.18, 0, 0]}>
            <mesh position={[0, -0.28, 0]}>
              <boxGeometry args={[0.16, 0.55, 0.16]} />
              <meshStandardMaterial color={armorColor} />
            </mesh>
            <mesh position={[0, -0.55, 0.08]}>
              <boxGeometry args={[0.18, 0.2, 0.32]} />
              <meshStandardMaterial color={jointColor} />
            </mesh>
          </group>

          <group ref={legRightRef} position={[0.18, 0, 0]}>
            <mesh position={[0, -0.28, 0]}>
              <boxGeometry args={[0.16, 0.55, 0.16]} />
              <meshStandardMaterial color={armorColor} />
            </mesh>
            <mesh position={[0, -0.55, 0.08]}>
              <boxGeometry args={[0.18, 0.2, 0.32]} />
              <meshStandardMaterial color={jointColor} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
