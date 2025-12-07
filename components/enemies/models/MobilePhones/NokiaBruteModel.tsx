"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface NokiaBruteModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}

export function NokiaBruteModel({
  isAttacking,
  isHit,
  hpPercentage,
}: NokiaBruteModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Screen / Face Refs
  const faceGroupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const screenBgRef = useRef<THREE.Mesh>(null);

  // Feature Refs
  const flashRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // State
  const offset = useRef(Math.random() * 100).current;
  const [isBlinking, setIsBlinking] = useState(false);
  const nextBlinkTime = useRef(0);

  // Floating Face State
  const facePos = useRef(new THREE.Vector2(0, 0));
  const faceVel = useRef(new THREE.Vector2(0.3, 0.2));

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !faceGroupRef.current ||
      !bodyRef.current ||
      !screenBgRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. PHYSICS ---
    const hopFreq = isAttacking ? 15 : 3;
    const hopHeight = isAttacking ? 0.05 : 0.05;
    groupRef.current.position.y =
      Math.abs(Math.sin(time * hopFreq)) * hopHeight + 0.1;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      isAttacking ? -0.2 : 0,
      delta * 5,
    );

    // --- 2. VIBRATION ---
    if (isAttacking) {
      bodyRef.current.position.x = (Math.random() - 0.5) * 0.08;
      bodyRef.current.position.z = (Math.random() - 0.5) * 0.08;
    } else if (isHit) {
      bodyRef.current.position.x = (Math.random() - 0.5) * 0.15;
    } else {
      bodyRef.current.position.set(0, 0, 0);
    }

    // --- 3. FACE ANIMATION ---

    // A. Blink Logic
    if (
      !isAttacking &&
      !isHit &&
      state.clock.elapsedTime > nextBlinkTime.current
    ) {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      nextBlinkTime.current = state.clock.elapsedTime + 2 + Math.random() * 4;
    }
    const eyeScaleY = isBlinking ? 0.1 : 1;

    // B. Face "Screensaver" Movement (Idle Only)
    if (!isAttacking && !isHit) {
      // Move face
      facePos.current.x += faceVel.current.x * delta;
      facePos.current.y += faceVel.current.y * delta;

      // Bounce off edges of screen (approx limits)
      if (facePos.current.x > 0.15 || facePos.current.x < -0.15)
        faceVel.current.x *= -1;
      if (facePos.current.y > 0.1 || facePos.current.y < -0.1)
        faceVel.current.y *= -1;
    } else {
      // Center face when active
      facePos.current.x = THREE.MathUtils.lerp(
        facePos.current.x,
        0,
        delta * 10,
      );
      facePos.current.y = THREE.MathUtils.lerp(
        facePos.current.y,
        0,
        delta * 10,
      );
    }

    faceGroupRef.current.position.x = facePos.current.x;
    faceGroupRef.current.position.y = facePos.current.y;

    // C. Expression Logic
    let targetEyeRot = 0;
    let targetMouthScaleY = 1;
    let targetMouthRot = 0; // 0 = Smile (Bowl up), 3.14 = Frown (Bowl down)
    let faceColor = "#222";
    let bgEmission = 0.5; // Brighter default backlight
    let eyeShapeScale = 1;

    if (isHit) {
      // SHOCK (X X Eyes)
      targetEyeRot = Math.PI / 4;
      targetMouthScaleY = 2; // Open wide O
      targetMouthRot = 0;
      faceColor = "#ffffff";
    } else if (isAttacking) {
      // ANGRY (> < Eyes)
      targetEyeRot = 0.7; // Angled down hard
      targetMouthScaleY = 0.5; // Gritted teeth
      targetMouthRot = Math.PI; // Frown
      faceColor = "#ef4444"; // Red
      bgEmission = 0.8; // Bright backlight
      eyeShapeScale = 0.3; // Narrow eyes
    } else {
      // CUTE IDLE
      targetEyeRot = 0;
      targetMouthRot = 0; // Smile
      faceColor = "#fff"; // Distinct black pixel
      eyeShapeScale = 1; // Round/Boxy eyes
    }

    if (leftEyeRef.current && rightEyeRef.current && mouthRef.current) {
      // Apply Rotations (Eyebrows effect)
      leftEyeRef.current.rotation.z = THREE.MathUtils.lerp(
        leftEyeRef.current.rotation.z,
        -targetEyeRot,
        delta * 10,
      );
      rightEyeRef.current.rotation.z = THREE.MathUtils.lerp(
        rightEyeRef.current.rotation.z,
        targetEyeRot,
        delta * 10,
      );

      // Apply Squint/Blink
      const currentScaleY = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        eyeScaleY * eyeShapeScale,
        delta * 15,
      );
      leftEyeRef.current.scale.y = currentScaleY;
      rightEyeRef.current.scale.y = currentScaleY;

      // Apply Mouth
      mouthRef.current.rotation.z = THREE.MathUtils.lerp(
        mouthRef.current.rotation.z,
        targetMouthRot,
        delta * 10,
      );
      mouthRef.current.scale.y = THREE.MathUtils.lerp(
        mouthRef.current.scale.y,
        targetMouthScaleY,
        delta * 10,
      );
      mouthRef.current.scale.x = THREE.MathUtils.lerp(
        mouthRef.current.scale.x,
        isAttacking ? 1.2 : 1,
        delta * 10,
      ); // Wider frown

      // Apply Colors
      (leftEyeRef.current.material as THREE.MeshBasicMaterial).color.set(
        faceColor,
      );
      (rightEyeRef.current.material as THREE.MeshBasicMaterial).color.set(
        faceColor,
      );
      (mouthRef.current.material as THREE.MeshBasicMaterial).color.set(
        faceColor,
      );

      // Pulse Backlight
      const bgMat = screenBgRef.current.material as THREE.MeshStandardMaterial;
      bgMat.emissiveIntensity = bgEmission + Math.sin(time * 3) * 0.1;
    }

    // --- 4. CAMERA FLASH ---
    if (flashRef.current && lightRef.current) {
      if (isAttacking) {
        const strobe = Math.sin(time * 30) > 0;
        const flashColor = strobe ? "#ffffff" : "#222";
        (flashRef.current.material as THREE.MeshBasicMaterial).color.set(
          flashColor,
        );
        lightRef.current.intensity = strobe ? 20 : 0;
      } else {
        (flashRef.current.material as THREE.MeshBasicMaterial).color.set(
          "#222",
        );
        lightRef.current.intensity = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* --- MAIN CHASSIS --- */}
        <RoundedBox args={[0.7, 1.4, 0.25]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color="#334155"
            roughness={0.6}
            metalness={0.4}
          />
        </RoundedBox>

        {/* --- FRONT: SCREEN AREA --- */}
        <group position={[0, 0.35, 0.13]}>
          {/* 2. The Face "Soul" */}
          <group ref={faceGroupRef} position={[0, 0, 0.01]}>
            {/* Left Eye */}
            <mesh ref={leftEyeRef} position={[-0.12, 0.05, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.01]} />
              <meshBasicMaterial color="#111" />
            </mesh>
            {/* Right Eye */}
            <mesh ref={rightEyeRef} position={[0.12, 0.05, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.01]} />
              <meshBasicMaterial color="#111" />
            </mesh>
            {/* Mouth (Half Torus) */}
            <mesh ref={mouthRef} position={[0, -0.1, 0]}>
              {/* Using a box for a pixel-art style smile line instead of torus for better visibility */}
              {/* Actually, Torus is good if sized right. Let's make it thicker. */}
              <torusGeometry args={[0.08, 0.025, 2, 16, Math.PI]} />
              <meshBasicMaterial color="#111" />
            </mesh>
          </group>

          {/* 3. Screen Backlight */}
          <mesh ref={screenBgRef} position={[0, 0, -0.001]}>
            <boxGeometry args={[0.54, 0.49, 0.01]} />
            <meshStandardMaterial
              color="#84cc16"
              emissive="#84cc16"
              emissiveIntensity={0.5}
              roughness={0.8}
            />
          </mesh>

          {/* 4. Bezel */}
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.6, 0.55, 0.005]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* --- FRONT: KEYPAD AREA --- */}
        <group position={[0, -0.3, 0.13]}>
          <group position={[0, 0.28, 0]}>
            <RoundedBox args={[0.5, 0.15, 0.02]} radius={0.02} smoothness={4}>
              <meshStandardMaterial
                color="#cbd5e1"
                metalness={0.5}
                roughness={0.2}
              />
            </RoundedBox>
          </group>

          {[...Array(12)].map((_, i) => {
            const x = (i % 3) - 1;
            const y = Math.floor(i / 3);
            return (
              <mesh key={i} position={[x * 0.18, 0.12 - y * 0.12, 0]}>
                <boxGeometry args={[0.15, 0.08, 0.02]} />
                <meshStandardMaterial
                  color="#e2e8f0"
                  roughness={0.2}
                  metalness={0.1}
                />
                <mesh position={[0, 0, 0.011]}>
                  <planeGeometry args={[0.08, 0.01]} />
                  <meshBasicMaterial color="#333" opacity={0.5} transparent />
                </mesh>
              </mesh>
            );
          })}
        </group>

        {/* --- BACK: BATTERY & CAMERA --- */}
        <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.13]}>
          <mesh position={[0, -0.2, 0.01]}>
            <boxGeometry args={[0.6, 0.8, 0.01]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          <group position={[0, 0.4, 0.02]}>
            <RoundedBox args={[0.5, 0.2, 0.02]} radius={0.02} smoothness={4}>
              <meshStandardMaterial
                color="#94a3b8"
                metalness={0.8}
                roughness={0.2}
              />
            </RoundedBox>

            <mesh position={[-0.1, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.01]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[-0.1, 0, 0.02]}>
              <circleGeometry args={[0.03]} />
              <meshBasicMaterial color="#3b82f6" opacity={0.3} transparent />
            </mesh>

            <mesh ref={flashRef} position={[0.1, 0, 0.015]}>
              <boxGeometry args={[0.06, 0.08, 0.01]} />
              <meshBasicMaterial color="#222" />
            </mesh>
            <pointLight
              ref={lightRef}
              position={[0.1, 0, 0.2]}
              distance={3}
              decay={2}
              color="white"
              intensity={0}
            />
          </group>
        </group>

        <mesh position={[0.25, 0.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
}
