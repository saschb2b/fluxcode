"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface NoctuaFanModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}

export function NoctuaFanModel({
  isAttacking,
  isHit,
  hpPercentage,
}: NoctuaFanModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const fanHubRef = useRef<THREE.Group>(null);

  // Body Parts
  const frameRef = useRef<THREE.Group>(null);
  const eyesContainerRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);

  // State
  const offset = useRef(Math.random() * 100).current;
  const [isBlinking, setIsBlinking] = useState(false);
  const nextBlinkTime = useRef(0);
  const lookTarget = useRef(new THREE.Vector3(0, 0, 10));
  const nextLookTime = useRef(0);

  // --- NOCTUA PALETTE ---
  const colorFrame = "#e3dccb"; // Lighter cream
  const colorFan = "#7f5341"; // Rich brown
  const colorRubber = "#3e2723"; // Dark pad

  useFrame((state, delta) => {
    if (!groupRef.current || !fanHubRef.current || !eyesContainerRef.current)
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. IDLE / MOVEMENT ANIMATION ---
    if (isAttacking) {
      // ATTACK: Lock on and hover aggressively
      groupRef.current.position.y = 0.5 + Math.sin(time * 20) * 0.02; // Vibrate Y
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -0.4,
        delta * 5,
      ); // Tilt forward to "blow"
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        delta * 5,
      ); // Face forward

      // Vibrate X/Z
      groupRef.current.position.x = (Math.random() - 0.5) * 0.05;
      groupRef.current.position.z = (Math.random() - 0.5) * 0.05;
    } else if (isHit) {
      // HIT: Knockback
      groupRef.current.rotation.z = Math.sin(time * 20) * 0.2; // Shake
      groupRef.current.rotation.x = 0.2; // Tilt back
    } else {
      // CUTE IDLE: Bob and Look Around
      groupRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.1;
      groupRef.current.rotation.x = Math.sin(time) * 0.05; // Gentle pitch

      // Random Look Logic
      if (state.clock.elapsedTime > nextLookTime.current) {
        nextLookTime.current = state.clock.elapsedTime + 1 + Math.random() * 2;
        const randomAngle = (Math.random() - 0.5) * 0.5;
        lookTarget.current.set(Math.sin(randomAngle) * 5, 0, 10);
      }

      // Smoothly rotate body to look target
      const targetRotY = lookTarget.current.x * 0.1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        delta * 2,
      );
    }

    // --- 2. FAN ROTATION (The Mouth) ---
    // Idle: Slow spin (15 rad/s) | Attack: TURBO (60 rad/s)
    const targetSpeed = isAttacking ? 60 : 5;
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
    let targetEyeColor = "white";
    let targetPupilScale = 1;

    if (isAttacking) {
      targetSquint = 0.4; // Angry squint
      targetEyeColor = "#ef4444"; // Red LED mode
      targetPupilScale = 0.5; // Pinprick focus
    } else if (isHit) {
      targetSquint = 1.2; // Wide open surprise
      targetPupilScale = 0.3;
    }

    // Apply Transforms
    if (leftEyeRef.current && rightEyeRef.current) {
      // Squint / Blink
      const currentScale = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        blinkScale * targetSquint,
        delta * 15,
      );
      leftEyeRef.current.scale.y = currentScale;
      rightEyeRef.current.scale.y = currentScale;

      // Color
      const eyeMat = (leftEyeRef.current.children[0] as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;
      eyeMat.color.set(targetEyeColor);

      // Pupil Tracking & Scaling
      if (leftPupilRef.current && rightPupilRef.current) {
        // Scale pupil
        const currentPupilScale = THREE.MathUtils.lerp(
          leftPupilRef.current.scale.x,
          targetPupilScale,
          delta * 10,
        );
        leftPupilRef.current.scale.setScalar(currentPupilScale);
        rightPupilRef.current.scale.setScalar(currentPupilScale);

        // Move pupil
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
      {/* === 1. FRAME === */}
      <group ref={frameRef}>
        {/* Top */}
        <mesh position={[0, 0.45, 0]}>
          <RoundedBox args={[1.0, 0.1, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color={colorFrame} roughness={0.4} />
          </RoundedBox>
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -0.45, 0]}>
          <RoundedBox args={[1.0, 0.1, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color={colorFrame} roughness={0.4} />
          </RoundedBox>
        </mesh>
        {/* Left */}
        <mesh position={[-0.45, 0, 0]}>
          <RoundedBox args={[0.1, 0.8, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color={colorFrame} roughness={0.4} />
          </RoundedBox>
        </mesh>
        {/* Right */}
        <mesh position={[0.45, 0, 0]}>
          <RoundedBox args={[0.1, 0.8, 0.3]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color={colorFrame} roughness={0.4} />
          </RoundedBox>
        </mesh>

        {/* Struts */}
        <group position={[0, 0, -0.1]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, 0, i * (Math.PI / 2) + Math.PI / 4]}>
              <boxGeometry args={[0.9, 0.05, 0.02]} />
              <meshStandardMaterial color={colorFrame} />
            </mesh>
          ))}
        </group>

        {/* Rubber Pads */}
        {[1, -1].map((x) =>
          [1, -1].map((y) => (
            <mesh
              key={`pad-${x}-${y}`}
              position={[x * 0.45, y * 0.45, 0.16]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.06, 0.06, 0.05]} />
              <meshStandardMaterial color={colorRubber} />
            </mesh>
          )),
        )}
      </group>

      {/* === 2. FAN HUB === */}
      <group ref={fanHubRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.2]} />
          <meshStandardMaterial color={colorFan} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <circleGeometry args={[0.12]} />
          <meshBasicMaterial color="#dcd0b8" />
        </mesh>

        {/* BLADES */}
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
                  <meshStandardMaterial color={colorFan} roughness={0.3} />
                </RoundedBox>
              </group>
            </group>
          );
        })}
      </group>

      {/* === 3. EYES === */}
      <group ref={eyesContainerRef} position={[0, 0.45, 0.16]}>
        <group ref={leftEyeRef} position={[-0.2, 0, 0]}>
          <mesh>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh ref={leftPupilRef} position={[0, 0, 0.01]}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color={colorRubber} />
          </mesh>
        </group>

        <group ref={rightEyeRef} position={[0.2, 0, 0]}>
          <mesh>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh ref={rightPupilRef} position={[0, 0, 0.01]}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color={colorRubber} />
          </mesh>
        </group>

        {!isAttacking && (
          <>
            <mesh position={[-0.2, -0.08, 0.01]}>
              <circleGeometry args={[0.04]} />
              <meshBasicMaterial color="#ffab91" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.2, -0.08, 0.01]}>
              <circleGeometry args={[0.04]} />
              <meshBasicMaterial color="#ffab91" transparent opacity={0.6} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
