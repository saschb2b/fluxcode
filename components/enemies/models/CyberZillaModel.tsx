"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";

interface CyberZillaModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

export function CyberZillaModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#1e1b4b",
  accentColor = "#f472b6",
}: CyberZillaModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const browLeftRef = useRef<THREE.Mesh>(null);
  const browRightRef = useRef<THREE.Mesh>(null);

  const armLeftRef = useRef<THREE.Group>(null);
  const armRightRef = useRef<THREE.Group>(null);

  const skinMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const offset = useMemo(() => Math.random() * 100, []);

  const [isBlinking, setIsBlinking] = useState(false);
  const nextBlinkTime = useRef(0);
  const lookTarget = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + offset;

    if (!groupRef.current || !headRef.current || !jawRef.current) return;

    // --- 1. BODY & ARMS ANIMATION ---
    const breathSpeed = isAttacking ? 15 : 2.5;
    const bounceHeight = isAttacking ? 0.02 : 0.02;
    groupRef.current.position.y =
      Math.abs(Math.sin(t * breathSpeed)) * bounceHeight;

    if (tailRef.current) {
      const wagSpeed = isAttacking ? 20 : 4;
      tailRef.current.rotation.y =
        Math.sin(t * wagSpeed) * (isAttacking ? 0.1 : 0.2);
    }

    // ARMS: Cute waddle sway
    if (armLeftRef.current && armRightRef.current) {
      if (isAttacking) {
        // Arms up in excitement/rage!
        armLeftRef.current.rotation.z = THREE.MathUtils.lerp(
          armLeftRef.current.rotation.z,
          2.5,
          delta * 5,
        ); // Up
        armRightRef.current.rotation.z = THREE.MathUtils.lerp(
          armRightRef.current.rotation.z,
          -2.5,
          delta * 5,
        ); // Up
      } else {
        // Idle Swing
        const armSway = Math.sin(t * 4) * 0.2;
        // Arms resting position is rotation Z +/- 0.5. We add sway to X.
        armLeftRef.current.rotation.x = armSway;
        armRightRef.current.rotation.x = -armSway;

        // Reset Z to idle
        armLeftRef.current.rotation.z = THREE.MathUtils.lerp(
          armLeftRef.current.rotation.z,
          -0.5,
          delta * 5,
        );
        armRightRef.current.rotation.z = THREE.MathUtils.lerp(
          armRightRef.current.rotation.z,
          0.5,
          delta * 5,
        );
      }
    }

    // --- 2. HEAD & LOOK LOGIC ---
    if (Math.floor(t) % 3 === 0) {
      lookTarget.current.x = Math.sin(t * 0.5) * 0.2;
      lookTarget.current.y = Math.sin(t * 0.3) * 0.05;
    }
    const lookSpeed = isAttacking ? 10 : 2;
    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y,
      isAttacking ? 0 : lookTarget.current.x,
      delta * lookSpeed,
    );
    headRef.current.rotation.z = THREE.MathUtils.lerp(
      headRef.current.rotation.z,
      isAttacking ? 0 : lookTarget.current.y,
      delta * lookSpeed,
    );
    headRef.current.rotation.x = Math.sin(t * 2) * 0.03;

    // --- 3. FACE LOGIC ---
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

    let targetBrowRot = 0;
    let targetBrowY = 0.15;
    let pupilX = 0;
    let targetJawRot = 0;

    if (isAttacking) {
      targetBrowRot = 0.5;
      targetBrowY = 0.12;
      pupilX = 0;
      targetJawRot = 0.6; // OPEN WIDE
      headRef.current.position.x = (Math.random() - 0.5) * 0.02;
    } else if (isHit) {
      targetBrowRot = -0.3;
      targetBrowY = 0.18;
      pupilX = 0;
      targetJawRot = 0.2;
    } else {
      targetBrowRot = -0.1;
      pupilX = Math.sin(t * 0.5) * 0.05;
      targetJawRot = 0;
    }

    if (browLeftRef.current) {
      browLeftRef.current.rotation.z = THREE.MathUtils.lerp(
        browLeftRef.current.rotation.z,
        -targetBrowRot,
        delta * 10,
      );
      browLeftRef.current.position.y = THREE.MathUtils.lerp(
        browLeftRef.current.position.y,
        targetBrowY,
        delta * 10,
      );
    }
    if (browRightRef.current) {
      browRightRef.current.rotation.z = THREE.MathUtils.lerp(
        browRightRef.current.rotation.z,
        targetBrowRot,
        delta * 10,
      );
      browRightRef.current.position.y = THREE.MathUtils.lerp(
        browRightRef.current.position.y,
        targetBrowY,
        delta * 10,
      );
    }

    if (leftPupilRef.current) leftPupilRef.current.position.x = pupilX;
    if (rightPupilRef.current) rightPupilRef.current.position.x = pupilX;

    jawRef.current.rotation.x = THREE.MathUtils.lerp(
      jawRef.current.rotation.x,
      targetJawRot,
      delta * 10,
    );

    // --- 4. COLORS ---
    if (skinMatRef.current && glowMatRef.current) {
      if (isHit) {
        skinMatRef.current.color.set("white");
        skinMatRef.current.emissive.set("white");
        skinMatRef.current.emissiveIntensity = 0.5;
      } else {
        skinMatRef.current.color.set(primaryColor);
        skinMatRef.current.emissive.set("black");
        skinMatRef.current.emissiveIntensity = 0;
      }

      if (isAttacking) {
        glowMatRef.current.color.set("#ff0000");
      } else {
        glowMatRef.current.color.set(accentColor);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- HEAD --- */}
      <group ref={headRef} position={[0, 0.55, 0.2]}>
        <group position={[0, 0.1, 0]}>
          {/* Main Skull */}
          <RoundedBox args={[0.55, 0.45, 0.55]} radius={0.06} smoothness={4}>
            <meshStandardMaterial
              ref={skinMatRef}
              color={primaryColor}
              roughness={0.4}
              metalness={0.6}
            />
          </RoundedBox>

          {/* SCALES */}
          <group position={[0, 0.22, 0.1]}>
            <mesh position={[0, 0.01, -0.05]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.15, 0.02, 0.15]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
            <mesh position={[0.18, 0, 0]} rotation={[-0.1, 0, -0.2]}>
              <boxGeometry args={[0.1, 0.02, 0.12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
            <mesh position={[-0.18, 0, 0]} rotation={[-0.1, 0, 0.2]}>
              <boxGeometry args={[0.1, 0.02, 0.12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
          </group>

          {/* EYES */}
          <group ref={leftEyeRef} position={[0.18, 0, 0.28]}>
            <mesh>
              <circleGeometry args={[0.09, 32]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <mesh ref={leftPupilRef} position={[0, 0, 0.001]}>
              <circleGeometry args={[0.045, 32]} />
              <meshBasicMaterial color="#d97706" />
            </mesh>
            <mesh position={[0.03, 0.03, 0.002]}>
              <circleGeometry args={[0.025, 32]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
          <group ref={rightEyeRef} position={[-0.18, 0, 0.28]}>
            <mesh>
              <circleGeometry args={[0.09, 32]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <mesh ref={rightPupilRef} position={[0, 0, 0.001]}>
              <circleGeometry args={[0.045, 32]} />
              <meshBasicMaterial color="#d97706" />
            </mesh>
            <mesh position={[0.03, 0.03, 0.002]}>
              <circleGeometry args={[0.025, 32]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>

          {/* BROWS */}
          <mesh ref={browLeftRef} position={[0.18, 0.15, 0.29]}>
            <boxGeometry args={[0.18, 0.04, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh ref={browRightRef} position={[-0.18, 0.15, 0.29]}>
            <boxGeometry args={[0.18, 0.04, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* JAW & SNAGGLETOOTH */}
        <group ref={jawRef} position={[0, -0.12, -0.05]}>
          <RoundedBox args={[0.52, 0.12, 0.45]} radius={0.04} smoothness={2}>
            <meshStandardMaterial color={primaryColor} roughness={0.4} />
          </RoundedBox>

          {/* TOOTH: Attached to jaw, moves when mouth opens */}
          <mesh position={[0.1, 0.08, 0.22]} rotation={[0, 0, -0.1]}>
            <coneGeometry args={[0.03, 0.08, 8]} />
            <meshStandardMaterial color="white" roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* --- BODY --- */}
      <group position={[0, 0.1, 0]}>
        <RoundedBox args={[0.65, 0.5, 0.6]} radius={0.08} smoothness={2}>
          <meshStandardMaterial
            color={primaryColor}
            roughness={0.4}
            metalness={0.6}
          />
        </RoundedBox>
        <mesh position={[0, -0.05, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
          <meshBasicMaterial ref={glowMatRef} color={accentColor} />
        </mesh>
      </group>

      {/* --- SPINES --- */}
      {[0.4, 0.1, -0.2].map((yPos, i) => (
        <group key={i} position={[0, yPos + 0.1, -0.3]} rotation={[0.5, 0, 0]}>
          <RoundedBox
            args={[0.2, 0.2, 0.05]}
            radius={0.02}
            smoothness={1}
            rotation={[0, 0, Math.PI / 4]}
          >
            <meshBasicMaterial color={accentColor} />
          </RoundedBox>
        </group>
      ))}

      {/* --- TAIL --- */}
      <group ref={tailRef} position={[0, -0.1, -0.3]}>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[0.3, 0.2, 0.4]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        <mesh position={[0, 0.05, -0.5]}>
          <dodecahedronGeometry args={[0.1]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      {/* --- LIMBS --- */}
      <mesh position={[0.25, -0.15, 0.1]}>
        <RoundedBox args={[0.22, 0.25, 0.35]} radius={0.05} smoothness={2}>
          <meshStandardMaterial color="#0f172a" />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.25, -0.15, 0.1]}>
        <RoundedBox args={[0.22, 0.25, 0.35]} radius={0.05} smoothness={2}>
          <meshStandardMaterial color="#0f172a" />
        </RoundedBox>
      </mesh>

      {/* Arms now have refs for animation */}
      <group
        ref={armLeftRef}
        position={[0.35, 0.15, 0.1]}
        rotation={[0, 0, -0.5]}
      >
        <RoundedBox args={[0.12, 0.25, 0.12]} radius={0.03} smoothness={2}>
          <meshStandardMaterial color={primaryColor} />
        </RoundedBox>
        {/* Claw */}
        <mesh position={[0, -0.13, 0.04]}>
          <boxGeometry args={[0.04, 0.06, 0.04]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      <group
        ref={armRightRef}
        position={[-0.35, 0.15, 0.1]}
        rotation={[0, 0, 0.5]}
      >
        <RoundedBox args={[0.12, 0.25, 0.12]} radius={0.03} smoothness={2}>
          <meshStandardMaterial color={primaryColor} />
        </RoundedBox>
        {/* Claw */}
        <mesh position={[0, -0.13, 0.04]}>
          <boxGeometry args={[0.04, 0.06, 0.04]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  );
}
