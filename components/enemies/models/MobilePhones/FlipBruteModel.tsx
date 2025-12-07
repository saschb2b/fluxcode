"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface FlipBruteModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}

export function FlipBruteModel({
  isAttacking,
  isHit,
  hpPercentage,
}: FlipBruteModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hingeRef = useRef<THREE.Group>(null);

  // Face Refs
  const faceGroupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  // Outer Screen Refs
  const outerScreenBgRef = useRef<THREE.Mesh>(null);
  const outerIconRef = useRef<THREE.Mesh>(null);

  // State
  const offset = useRef(Math.random() * 100).current;
  const [isBlinking, setIsBlinking] = useState(false);
  const nextBlinkTime = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current || !hingeRef.current || !faceGroupRef.current) return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. PHYSICS ---
    // Floating motion
    groupRef.current.position.y = 0.6 + Math.sin(time * 2) * 0.1; // Base Y=0.6 to clear floor

    // Tilt forward slightly to face the player camera
    groupRef.current.rotation.x = -0.5;

    // --- 2. HINGE MECHANICS (FIXED) ---
    // 0 rad = Closed shut
    // -2.8 rad = Fully Open (approx 160 degrees)

    // Idle Target: -2.6 (Comfortable open viewing angle)
    // Attack Target: -0.1 (Snapped shut)

    const targetHinge = isAttacking ? 3 : 0.5;

    const hingeSpeed = isAttacking ? 25 : 5;
    hingeRef.current.rotation.x = THREE.MathUtils.lerp(
      hingeRef.current.rotation.x,
      targetHinge,
      delta * hingeSpeed,
    );

    // Vibration when attacking
    if (isAttacking) {
      groupRef.current.position.x = (Math.random() - 0.5) * 0.05;
      groupRef.current.position.z = (Math.random() - 0.5) * 0.05;
    }

    // --- 3. FACE ANIMATION ---
    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextBlinkTime.current) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        nextBlinkTime.current = state.clock.elapsedTime + 2 + Math.random() * 3;
      }
    }
    const eyeScaleY = isBlinking ? 0.1 : 1;

    if (leftEyeRef.current && rightEyeRef.current && mouthRef.current) {
      // Blink
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        eyeScaleY,
        delta * 20,
      );
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
        rightEyeRef.current.scale.y,
        eyeScaleY,
        delta * 20,
      );

      // Colors
      const faceColor = "#e0f2fe";
      (leftEyeRef.current.material as THREE.MeshBasicMaterial).color.set(
        faceColor,
      );
      (rightEyeRef.current.material as THREE.MeshBasicMaterial).color.set(
        faceColor,
      );
      (mouthRef.current.material as THREE.MeshBasicMaterial).color.set(
        faceColor,
      );
    }

    // --- 4. OUTER SCREEN ---
    if (outerScreenBgRef.current && outerIconRef.current) {
      const outerColor = isAttacking ? "#ef4444" : "#0284c7";
      const outerIntensity = isAttacking ? 2 : 0.5;

      (
        outerScreenBgRef.current.material as THREE.MeshStandardMaterial
      ).color.set(outerColor);
      (
        outerScreenBgRef.current.material as THREE.MeshStandardMaterial
      ).emissive.set(outerColor);
      (
        outerScreenBgRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = outerIntensity + Math.sin(time * 10) * 0.5;

      outerIconRef.current.rotation.z = isAttacking ? time * 10 : 0;
      outerIconRef.current.visible = true;
    }
  });

  const chassisColor = "#94a3b8";
  const keypadColor = "#cbd5e1";
  const chinColor = "#1e293b";

  return (
    <group ref={groupRef}>
      {/* === BASE (KEYPAD) === */}
      <group position={[0, -0.6, 0]}>
        <RoundedBox args={[0.8, 1.2, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial
            color={chassisColor}
            metalness={0.8}
            roughness={0.3}
          />
        </RoundedBox>

        {/* Chin */}
        <mesh position={[0, -0.5, 0.03]}>
          <RoundedBox args={[0.8, 0.25, 0.08]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color={chinColor} roughness={0.6} />
          </RoundedBox>
        </mesh>

        {/* Keypad */}
        <mesh position={[0, 0.1, 0.03]}>
          <planeGeometry args={[0.7, 0.8]} />
          <meshStandardMaterial
            color={keypadColor}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {[...Array(12)].map((_, i) => {
          const x = (i % 3) - 1;
          const y = Math.floor(i / 3);
          return (
            <mesh key={i} position={[x * 0.2, 0.4 - y * 0.15, 0.035]}>
              <planeGeometry args={[0.15, 0.1]} />
              <meshBasicMaterial color="#333" opacity={0.3} transparent />
            </mesh>
          );
        })}
      </group>

      {/* === HINGE PIVOT === */}
      {/* Positioned at the TOP of the base (-0.6 + 0.6 = 0 relative to group) */}
      <group position={[0, 0, 0]} ref={hingeRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.82]} />
          <meshStandardMaterial color={chinColor} />
        </mesh>

        {/* === LID (SCREEN) === */}
        {/* Offset Y+0.6 relative to hinge so it pivots from its bottom edge */}
        <group position={[0, 0.6, 0]}>
          <RoundedBox args={[0.8, 1.2, 0.05]} radius={0.02} smoothness={4}>
            <meshStandardMaterial
              color={chassisColor}
              metalness={0.8}
              roughness={0.3}
            />
          </RoundedBox>

          {/* INNER FACE (Correct side) */}
          <group position={[0, 0, 0.03]}>
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.7, 0.9, 0.01]} />
              <meshStandardMaterial color="black" roughness={0.2} />
            </mesh>

            <group ref={faceGroupRef} position={[0, 0.05, 0.01]}>
              <mesh ref={leftEyeRef} position={[-0.15, 0.1, 0]}>
                <circleGeometry args={[0.08, 32]} />
                <meshBasicMaterial color="#e0f2fe" />
              </mesh>
              <mesh ref={rightEyeRef} position={[0.15, 0.1, 0]}>
                <circleGeometry args={[0.08, 32]} />
                <meshBasicMaterial color="#e0f2fe" />
              </mesh>
              <mesh ref={mouthRef} position={[0, -0.1, 0]}>
                <torusGeometry args={[0.05, 0.02, 2, 16, Math.PI]} />
                <meshBasicMaterial color="#e0f2fe" />
              </mesh>
            </group>
          </group>

          {/* OUTER SCREEN (Back side) */}
          <group position={[0, 0.2, -0.04]} rotation={[0, Math.PI, 0]}>
            <mesh>
              <boxGeometry args={[0.4, 0.3, 0.01]} />
              <meshStandardMaterial color="black" roughness={0.1} />
            </mesh>
            <mesh ref={outerScreenBgRef} position={[0, 0, 0.01]}>
              <planeGeometry args={[0.35, 0.25]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
            <mesh ref={outerIconRef} position={[0, 0, 0.02]}>
              <ringGeometry args={[0.08, 0.1, 4]} />
              <meshBasicMaterial color="white" />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <circleGeometry args={[0.05]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
