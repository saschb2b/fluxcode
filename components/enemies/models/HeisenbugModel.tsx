"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";

interface HeisenbugModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

export function HeisenbugModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#06b6d4",
  accentColor = "#a855f7",
}: HeisenbugModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ghostRef = useRef<THREE.Group>(null);

  const headRef = useRef<THREE.Group>(null);
  const leftAntennaRef = useRef<THREE.Group>(null);
  const rightAntennaRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);

  // New Parts
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const shellMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const eyeLeftMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const eyeRightMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const wingMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const offset = useMemo(() => Math.random() * 100, []);

  const glitchIntensity = useRef(0);
  const nextBlinkTime = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);

  const legs = useMemo(() => [0, 1, 2, 3, 4, 5], []);
  const legRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + offset;

    if (!groupRef.current || !bodyRef.current || !ghostRef.current) return;

    // --- 1. MOVEMENT & GLITCH ---
    const jitterAmount = isAttacking ? 0.05 : 0.02;
    const smoothY = Math.sin(t * 2) * 0.1;

    if (Math.random() > 0.95) {
      groupRef.current.position.x += (Math.random() - 0.5) * jitterAmount;
      groupRef.current.position.y =
        smoothY + (Math.random() - 0.5) * jitterAmount;
      glitchIntensity.current = 1.0;
    } else {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        0,
        delta * 5,
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        smoothY,
        delta * 5,
      );
    }
    glitchIntensity.current = THREE.MathUtils.lerp(
      glitchIntensity.current,
      0,
      delta * 10,
    );

    // --- 2. VISUAL GLITCH ---
    if (shellRef.current && shellMatRef.current) {
      if (glitchIntensity.current > 0.1) {
        const scaleDistortion =
          1.2 + (Math.random() - 0.5) * glitchIntensity.current;
        shellRef.current.scale.set(
          scaleDistortion,
          scaleDistortion,
          scaleDistortion,
        );
        shellMatRef.current.color.set(
          Math.random() > 0.5 ? "white" : accentColor,
        );
        shellMatRef.current.wireframe = true;
        shellMatRef.current.opacity = 0.8;
      } else {
        shellRef.current.scale.lerp(
          new THREE.Vector3(1.2, 1.2, 1.2),
          delta * 5,
        );
        shellMatRef.current.color.set("white");
        shellMatRef.current.wireframe = true;
        shellMatRef.current.opacity = 0.1;
      }
    }

    // --- 3. WINGS (Quantum Flutter) ---
    if (leftWingRef.current && rightWingRef.current) {
      // High speed flutter
      const wingSpeed = isAttacking ? 80 : 30;
      const flutter = Math.sin(t * wingSpeed) * 0.3;

      leftWingRef.current.rotation.z = 0.5 + flutter;
      rightWingRef.current.rotation.z = -0.5 - flutter;
    }

    // --- 4. GHOSTING ---
    ghostRef.current.position.lerp(bodyRef.current.position, delta * 2);
    ghostRef.current.rotation.copy(bodyRef.current.rotation);
    if (isHit || isAttacking) {
      ghostRef.current.visible = false;
      ghostRef.current.position.copy(bodyRef.current.position);
    } else {
      ghostRef.current.visible = true;
      ghostRef.current.scale.setScalar(1.1 + Math.sin(t * 10) * 0.05);
    }

    // --- 5. HEAD & ANTENNAE ---
    if (headRef.current) headRef.current.rotation.z = Math.sin(t * 3) * 0.05;

    if (leftAntennaRef.current && rightAntennaRef.current) {
      const twitch = Math.sin(t * 20) * 0.1;
      leftAntennaRef.current.rotation.z = 0.5 + twitch;
      rightAntennaRef.current.rotation.z = -0.5 - twitch;
    }

    // BLINKING
    if (
      !isAttacking &&
      !isHit &&
      state.clock.elapsedTime > nextBlinkTime.current
    ) {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      nextBlinkTime.current = state.clock.elapsedTime + 2 + Math.random() * 3;
    }
    const eyeScaleY = isBlinking ? 0.1 : 1;
    if (leftEyeRef.current)
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        eyeScaleY,
        delta * 20,
      );
    if (rightEyeRef.current)
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
        rightEyeRef.current.scale.y,
        eyeScaleY,
        delta * 20,
      );

    // LEGS
    legRefs.current.forEach((leg, i) => {
      if (leg) {
        const side = i % 2 === 0 ? 1 : -1;
        const legSpeed = isAttacking ? 30 : 15;
        const phase = i * 0.5;
        leg.rotation.z = side * (0.5 + Math.sin(t * legSpeed + phase) * 0.3);
        leg.rotation.x = Math.cos(t * legSpeed + phase) * 0.3;
      }
    });

    if (shellRef.current) {
      shellRef.current.rotation.x += delta * 0.5;
      shellRef.current.rotation.y += delta * 0.2;
    }

    // --- 6. COLORS ---
    if (
      bodyMatRef.current &&
      eyeLeftMatRef.current &&
      eyeRightMatRef.current &&
      wingMatRef.current
    ) {
      // Hit Flash Logic
      if (isHit) {
        bodyMatRef.current.color.set("white");
        bodyMatRef.current.emissive.set("white");
      } else {
        bodyMatRef.current.color.set(primaryColor);
        bodyMatRef.current.emissive.set(accentColor);
      }

      // Glitch Eye Logic
      const eyeColor1 = "#ffffff";
      const eyeColor2 = isAttacking ? "#ef4444" : accentColor;
      if (glitchIntensity.current > 0.5 || Math.floor(t * 2) % 2 === 0) {
        eyeLeftMatRef.current.color.set(eyeColor1);
        eyeRightMatRef.current.color.set(eyeColor2);
      } else {
        eyeLeftMatRef.current.color.set(eyeColor2);
        eyeRightMatRef.current.color.set(eyeColor1);
      }

      // Wing Pulse
      wingMatRef.current.color.set(accentColor);
      wingMatRef.current.opacity = 0.3 + Math.sin(t * 20) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- GHOST --- */}
      <group ref={ghostRef} position={[0, 0, -0.2]}>
        <mesh>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial
            color={accentColor}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* --- MAIN BODY --- */}
      <group ref={bodyRef}>
        {/* ABDOMEN (Now Complex) */}
        <group position={[0, 0, 0.1]}>
          {/* 1. Core Glowing Body */}
          <RoundedBox args={[0.45, 0.35, 0.45]} radius={0.1} smoothness={4}>
            <meshStandardMaterial
              ref={bodyMatRef}
              color={primaryColor}
              roughness={0.3}
              metalness={0.8}
              emissiveIntensity={0.5}
            />
          </RoundedBox>

          {/* 2. Armor Plating (Dark Metal Segments) */}
          <group>
            {/* Front Plate */}
            <mesh position={[0, 0.05, 0.1]}>
              <RoundedBox args={[0.48, 0.3, 0.15]} radius={0.05} smoothness={2}>
                <meshStandardMaterial
                  color="#0f172a"
                  roughness={0.5}
                  metalness={0.8}
                />
              </RoundedBox>
            </mesh>
            {/* Rear Plate */}
            <mesh position={[0, 0.08, -0.1]}>
              <RoundedBox args={[0.48, 0.25, 0.2]} radius={0.05} smoothness={2}>
                <meshStandardMaterial
                  color="#0f172a"
                  roughness={0.5}
                  metalness={0.8}
                />
              </RoundedBox>
            </mesh>
            {/* Side Tech Strips */}
            <mesh position={[0.24, 0, 0]}>
              <boxGeometry args={[0.02, 0.2, 0.3]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[-0.24, 0, 0]}>
              <boxGeometry args={[0.02, 0.2, 0.3]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>

          {/* 3. Quantum Wings (Floating) */}
          <group ref={leftWingRef} position={[0.25, 0.1, 0]}>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, 0.2]}>
              {/* Flat, geometric wing shape */}
              <boxGeometry args={[0.4, 0.02, 0.25]} />
              <meshBasicMaterial
                ref={wingMatRef}
                color={accentColor}
                transparent
                opacity={0.4}
              />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.4, 0.02, 0.25]} />
              <meshBasicMaterial
                color="white"
                wireframe
                transparent
                opacity={0.2}
              />
            </mesh>
          </group>

          <group ref={rightWingRef} position={[-0.25, 0.1, 0]}>
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.4, 0.02, 0.25]} />
              <meshBasicMaterial
                ref={wingMatRef}
                color={accentColor}
                transparent
                opacity={0.4}
              />
            </mesh>
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.4, 0.02, 0.25]} />
              <meshBasicMaterial
                color="white"
                wireframe
                transparent
                opacity={0.2}
              />
            </mesh>
          </group>

          {/* 4. Rear Engine */}
          <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.1]} />
            <meshBasicMaterial color="white" />
          </mesh>

          {/* 5. Outer Shell (The Wireframe Sphere) */}
          <mesh ref={shellRef} scale={[1.2, 1.2, 1.2]}>
            <icosahedronGeometry args={[0.35, 1]} />
            <meshBasicMaterial
              ref={shellMatRef}
              color="white"
              wireframe
              transparent
              opacity={0.1}
            />
          </mesh>
        </group>

        {/* HEAD */}
        <group ref={headRef} position={[0, 0.1, 0.35]}>
          <RoundedBox args={[0.35, 0.3, 0.3]} radius={0.15} smoothness={4}>
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.2}
              metalness={0.5}
            />
          </RoundedBox>

          {/* EYES */}
          <group ref={leftEyeRef} position={[0.1, 0.05, 0.16]}>
            <mesh>
              <circleGeometry args={[0.1, 32]} />
              <meshBasicMaterial ref={eyeLeftMatRef} color="white" />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <circleGeometry args={[0.05, 32]} />
              <meshBasicMaterial color="black" />
            </mesh>
            <mesh position={[0.04, 0.04, 0.02]}>
              <circleGeometry args={[0.025, 32]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
          <group ref={rightEyeRef} position={[-0.1, 0.05, 0.16]}>
            <mesh>
              <circleGeometry args={[0.1, 32]} />
              <meshBasicMaterial ref={eyeRightMatRef} color={accentColor} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <circleGeometry args={[0.05, 32]} />
              <meshBasicMaterial color="black" />
            </mesh>
            <mesh position={[0.04, 0.04, 0.02]}>
              <circleGeometry args={[0.025, 32]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>

          {/* MOUTH */}
          <group position={[0, -0.1, 0.16]}>
            <mesh rotation={[0, 0, 0.2]} position={[0.03, 0, 0]}>
              <coneGeometry args={[0.02, 0.08, 8]} />
              <meshStandardMaterial color="gray" />
            </mesh>
            <mesh rotation={[0, 0, -0.2]} position={[-0.03, 0, 0]}>
              <coneGeometry args={[0.02, 0.08, 8]} />
              <meshStandardMaterial color="gray" />
            </mesh>
          </group>

          {/* ANTENNAE */}
          <group ref={leftAntennaRef} position={[0.1, 0.15, 0]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.3]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.03]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
          <group ref={rightAntennaRef} position={[-0.1, 0.15, 0]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.3]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.03]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
        </group>

        {/* LEGS */}
        {legs.map((i) => {
          const side = i % 2 === 0 ? 1 : -1;
          const row = Math.floor(i / 2);
          const zPos = 0.2 - row * 0.15;

          return (
            <group
              key={i}
              ref={(el) => {
                legRefs.current[i] = el;
              }}
              position={[side * 0.2, -0.15, zPos]}
            >
              <mesh
                rotation={[0, 0, side * 0.5]}
                position={[side * 0.1, -0.1, 0]}
              >
                <capsuleGeometry args={[0.03, 0.25, 4, 8]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
