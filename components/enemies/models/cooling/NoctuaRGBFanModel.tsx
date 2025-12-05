"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface NoctuaRGBFanModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}

export function NoctuaRGBFanModel({
  isAttacking,
  isHit,
  hpPercentage,
}: NoctuaRGBFanModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const fanHubRef = useRef<THREE.Group>(null);

  // Body Parts
  const frameRef = useRef<THREE.Group>(null);
  const eyesContainerRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);

  // RGB Parts Refs
  const rgbRingRef = useRef<THREE.Mesh>(null);
  const cornerPadsRef = useRef<THREE.Group>(null);

  // State
  const offset = useRef(Math.random() * 100).current;
  const [isBlinking, setIsBlinking] = useState(false);
  const nextBlinkTime = useRef(0);
  const lookTarget = useRef(new THREE.Vector3(0, 0, 10));
  const nextLookTime = useRef(0);

  // --- CHROMAX PALETTE ---
  const colorFrame = "#171717"; // Matte Black
  const colorFan = "#262626"; // Dark Grey

  useFrame((state, delta) => {
    if (!groupRef.current || !fanHubRef.current || !eyesContainerRef.current)
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 0. RGB LOGIC ---
    // Cycle Hue based on time
    const hue = (time * 0.5) % 1;
    const rgbColor = new THREE.Color().setHSL(hue, 1, 0.6);
    const attackColor = new THREE.Color("#ff0000"); // Red override on attack

    const currentColor = isAttacking ? attackColor : rgbColor;
    const currentEmissive = isAttacking ? 3 : 1.5;

    // Apply to Inner Ring
    if (rgbRingRef.current) {
      const ringMat = rgbRingRef.current.material as THREE.MeshStandardMaterial;
      ringMat.color.copy(currentColor);
      ringMat.emissive.copy(currentColor);
      ringMat.emissiveIntensity = currentEmissive;
    }

    // Apply to Corner Pads
    if (cornerPadsRef.current) {
      cornerPadsRef.current.children.forEach((pad) => {
        // We access the material of each child. In R3F primitive loops, materials are unique instances by default if defined inline
        const mat = (pad as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color.copy(currentColor);
          mat.emissive.copy(currentColor);
          mat.emissiveIntensity = currentEmissive;
        }
      });
    }

    // --- 1. IDLE / MOVEMENT ANIMATION ---
    if (isAttacking) {
      // ATTACK: Aggressive hover
      groupRef.current.position.y = 0.5 + Math.sin(time * 30) * 0.02;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -0.5,
        delta * 8,
      ); // Deep tilt
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        delta * 5,
      );

      // Vibrate
      groupRef.current.position.x = (Math.random() - 0.5) * 0.08;
      groupRef.current.position.z = (Math.random() - 0.5) * 0.08;
    } else if (isHit) {
      groupRef.current.rotation.z = Math.sin(time * 20) * 0.2;
      groupRef.current.rotation.x = 0.2;
    } else {
      // IDLE
      groupRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.1;
      groupRef.current.rotation.x = Math.sin(time) * 0.05;

      // Look Around
      if (state.clock.elapsedTime > nextLookTime.current) {
        nextLookTime.current = state.clock.elapsedTime + 1 + Math.random() * 2;
        const randomAngle = (Math.random() - 0.5) * 0.5;
        lookTarget.current.set(Math.sin(randomAngle) * 5, 0, 10);
      }
      const targetRotY = lookTarget.current.x * 0.1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        delta * 2,
      );
    }

    // --- 2. FAN ROTATION ---
    // Performance fans spin faster
    const targetSpeed = isAttacking ? 80 : 8;
    fanHubRef.current.rotation.z -= delta * targetSpeed;

    // --- 3. EYE EXPRESSIONS ---
    if (
      !isAttacking &&
      !isHit &&
      state.clock.elapsedTime > nextBlinkTime.current
    ) {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      nextBlinkTime.current = state.clock.elapsedTime + 2 + Math.random() * 4;
    }

    const blinkScale = isBlinking ? 0.1 : 1;
    let targetSquint = 1;
    let targetPupilScale = 1;

    if (isAttacking) {
      targetSquint = 0.3; // Mean squint
      targetPupilScale = 0.5;
    } else if (isHit) {
      targetSquint = 1.2;
      targetPupilScale = 0.3;
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      // Blink / Squint
      const currentScale = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        blinkScale * targetSquint,
        delta * 15,
      );
      leftEyeRef.current.scale.y = currentScale;
      rightEyeRef.current.scale.y = currentScale;

      // Eyes match RGB color (Glowing Eyes)
      const leftMat = (leftEyeRef.current.children[0] as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;
      const rightMat = (rightEyeRef.current.children[0] as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;

      leftMat.color.copy(currentColor);
      rightMat.color.copy(currentColor);
      leftMat.emissive.copy(currentColor);
      rightMat.emissive.copy(currentColor);
      leftMat.emissiveIntensity = currentEmissive;
      rightMat.emissiveIntensity = currentEmissive;

      // Pupil Tracking
      if (leftPupilRef.current && rightPupilRef.current) {
        const currentPupilScale = THREE.MathUtils.lerp(
          leftPupilRef.current.scale.x,
          targetPupilScale,
          delta * 10,
        );
        leftPupilRef.current.scale.setScalar(currentPupilScale);
        rightPupilRef.current.scale.setScalar(currentPupilScale);

        if (!isAttacking) {
          const pupilX = lookTarget.current.x * 0.05;
          leftPupilRef.current.position.x = pupilX;
          rightPupilRef.current.position.x = pupilX;
        } else {
          leftPupilRef.current.position.x = 0;
          rightPupilRef.current.position.x = 0;
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* === 1. FRAME (Black) === */}
      <group ref={frameRef}>
        {/* Main Frame Bars */}
        <mesh position={[0, 0.45, 0]}>
          <RoundedBox args={[1.0, 0.1, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial
              color={colorFrame}
              roughness={0.2}
              metalness={0.5}
            />
          </RoundedBox>
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <RoundedBox args={[1.0, 0.1, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial
              color={colorFrame}
              roughness={0.2}
              metalness={0.5}
            />
          </RoundedBox>
        </mesh>
        <mesh position={[-0.45, 0, 0]}>
          <RoundedBox args={[0.1, 0.8, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial
              color={colorFrame}
              roughness={0.2}
              metalness={0.5}
            />
          </RoundedBox>
        </mesh>
        <mesh position={[0.45, 0, 0]}>
          <RoundedBox args={[0.1, 0.8, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial
              color={colorFrame}
              roughness={0.2}
              metalness={0.5}
            />
          </RoundedBox>
        </mesh>

        {/* INNER RGB RING */}
        <mesh ref={rgbRingRef} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.42, 0.02, 16, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* RGB CORNER PADS */}
        <group ref={cornerPadsRef}>
          {[1, -1].map((x) =>
            [1, -1].map((y) => (
              <mesh
                key={`pad-${x}-${y}`}
                position={[x * 0.45, y * 0.45, 0.16]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.06, 0.06, 0.05]} />
                <meshStandardMaterial color="white" />
              </mesh>
            )),
          )}
        </group>

        {/* Struts (Back) */}
        <group position={[0, 0, -0.1]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, 0, i * (Math.PI / 2) + Math.PI / 4]}>
              <boxGeometry args={[0.9, 0.05, 0.02]} />
              <meshStandardMaterial color={colorFrame} />
            </mesh>
          ))}
        </group>
      </group>

      {/* === 2. FAN HUB (Dark Grey) === */}
      <group ref={fanHubRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.2]} />
          <meshStandardMaterial
            color={colorFan}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Hub Sticker - Holographic Black */}
        <mesh position={[0, 0, 0.11]}>
          <circleGeometry args={[0.12]} />
          <meshStandardMaterial color="#111" metalness={1} roughness={0} />
        </mesh>

        {/* 7 BLADES */}
        {[...Array(7)].map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, 0, angle]}>
              <group position={[0.28, 0, 0]} rotation={[0.4, 0, 0.1]}>
                <RoundedBox
                  args={[0.4, 0.15, 0.03]}
                  radius={0.02}
                  smoothness={2}
                >
                  <meshStandardMaterial
                    color={colorFan}
                    roughness={0.3}
                    metalness={0.2}
                  />
                </RoundedBox>
              </group>
            </group>
          );
        })}
      </group>

      {/* === 3. EYES (RGB) === */}
      <group ref={eyesContainerRef} position={[0, 0.45, 0.16]}>
        <group ref={leftEyeRef} position={[-0.2, 0, 0]}>
          <mesh>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh ref={leftPupilRef} position={[0, 0, 0.01]}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>

        <group ref={rightEyeRef} position={[0.2, 0, 0]}>
          <mesh>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh ref={rightPupilRef} position={[0, 0, 0.01]}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
