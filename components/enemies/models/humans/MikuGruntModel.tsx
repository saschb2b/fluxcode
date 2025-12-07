"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface MikuGruntModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}

export function MikuGruntModel({
  isAttacking,
  isHit,
  hpPercentage,
}: MikuGruntModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Body Parts
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const armLeftRef = useRef<THREE.Group>(null);
  const armRightRef = useRef<THREE.Group>(null);
  const legLeftRef = useRef<THREE.Group>(null);
  const legRightRef = useRef<THREE.Group>(null);

  // Miku Specifics
  const hairLeftRef = useRef<THREE.Group>(null);
  const hairRightRef = useRef<THREE.Group>(null);
  const skirtRef = useRef<THREE.Mesh>(null);

  // Weaponry (Floating Amps & Mic)
  const leftAmpRef = useRef<THREE.Group>(null);
  const rightAmpRef = useRef<THREE.Group>(null);
  const micRef = useRef<THREE.Group>(null); // Virtual Mic
  const soundWaveRef = useRef<THREE.Mesh>(null);

  const offset = useRef(Math.random() * 100).current;

  // Palette
  const tealColor = "#39c5bb";
  const skinColor = "#1e293b";
  const shirtColor = "#d1d5db";
  const skirtColor = "#0f172a";
  const glowColor = isAttacking ? "#ec4899" : "#39c5bb"; // Pink vs Teal

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !torsoRef.current ||
      !hairLeftRef.current ||
      !leftAmpRef.current
    )
      return;

    const t = state.clock.elapsedTime + offset;

    // --- 1. IDLE / DANCE PHYSICS ---
    const bounce = Math.abs(Math.sin(t * 4)) * 0.03;
    groupRef.current.position.y = bounce;

    // --- 2. HAIR ANIMATION ---
    if (hairLeftRef.current && hairRightRef.current) {
      // Dramatic hair blow when singing
      const wind = isAttacking ? 0.8 : 0.2;
      const flutter = Math.sin(t * 10) * 0.1;

      hairLeftRef.current.rotation.z = 0.3 + (isAttacking ? 0.4 : 0) + flutter;
      hairLeftRef.current.rotation.x = isAttacking
        ? 0.5
        : Math.sin(t * 2) * 0.1;

      hairRightRef.current.rotation.z =
        -0.3 - (isAttacking ? 0.4 : 0) - flutter;
      hairRightRef.current.rotation.x = isAttacking
        ? 0.5
        : Math.sin(t * 2) * 0.1;
    }

    // --- 3. ATTACK: THE DIVA PERFORMANCE ---
    if (isAttacking) {
      // POSE: Hand to mouth (Holding Mic)
      // Right Arm (Mic Hand)
      if (armRightRef.current) {
        armRightRef.current.rotation.x = THREE.MathUtils.lerp(
          armRightRef.current.rotation.x,
          -2.5,
          delta * 10,
        );
        armRightRef.current.rotation.z = THREE.MathUtils.lerp(
          armRightRef.current.rotation.z,
          -0.5,
          delta * 10,
        );
        armRightRef.current.rotation.y = -0.5;
      }

      // Left Arm (Outstretched to audience)
      if (armLeftRef.current) {
        armLeftRef.current.rotation.x = THREE.MathUtils.lerp(
          armLeftRef.current.rotation.x,
          -0.5,
          delta * 5,
        );
        armLeftRef.current.rotation.z = 0.5;
      }

      // FLOATING AMPS: Snap forward to blast
      if (leftAmpRef.current && rightAmpRef.current) {
        // Move from behind back to beside head
        leftAmpRef.current.position.z = THREE.MathUtils.lerp(
          leftAmpRef.current.position.z,
          0.2,
          delta * 5,
        );
        leftAmpRef.current.position.x = THREE.MathUtils.lerp(
          leftAmpRef.current.position.x,
          -0.5,
          delta * 5,
        );
        leftAmpRef.current.lookAt(0, 0, 10); // Face target

        rightAmpRef.current.position.z = THREE.MathUtils.lerp(
          rightAmpRef.current.position.z,
          0.2,
          delta * 5,
        );
        rightAmpRef.current.position.x = THREE.MathUtils.lerp(
          rightAmpRef.current.position.x,
          0.5,
          delta * 5,
        );
        rightAmpRef.current.lookAt(0, 0, 10);

        // Vibrate Amps
        const bass = Math.sin(t * 50) * 0.02;
        leftAmpRef.current.scale.setScalar(1 + bass);
        rightAmpRef.current.scale.setScalar(1 + bass);
      }

      // Show Mic
      if (micRef.current) micRef.current.visible = true;

      // Sound Wave Visual (Coming from Center)
      if (soundWaveRef.current) {
        soundWaveRef.current.visible = true;
        soundWaveRef.current.scale.x = ((t * 5) % 2) + 0.5;
        soundWaveRef.current.scale.y = ((t * 5) % 2) + 0.5;
        (soundWaveRef.current.material as THREE.MeshBasicMaterial).opacity =
          1 - ((t * 5) % 1);
      }
    } else {
      // IDLE: Dance Sway
      if (armRightRef.current) {
        armRightRef.current.rotation.x = THREE.MathUtils.lerp(
          armRightRef.current.rotation.x,
          0,
          delta * 5,
        );
        armRightRef.current.rotation.z = -0.2;
        armRightRef.current.rotation.y = 0;
      }
      if (armLeftRef.current) {
        armLeftRef.current.rotation.x = THREE.MathUtils.lerp(
          armLeftRef.current.rotation.x,
          0,
          delta * 5,
        );
        armLeftRef.current.rotation.z = 0.2;
      }

      // AMPS: Float behind back
      if (leftAmpRef.current && rightAmpRef.current) {
        leftAmpRef.current.position.z = -0.3;
        leftAmpRef.current.position.x = -0.3;
        leftAmpRef.current.rotation.y = 0;

        rightAmpRef.current.position.z = -0.3;
        rightAmpRef.current.position.x = 0.3;
        rightAmpRef.current.rotation.y = 0;
      }

      if (micRef.current) micRef.current.visible = false;
      if (soundWaveRef.current) soundWaveRef.current.visible = false;
    }

    // --- 4. LEGS ---
    if (isAttacking) {
      // Planted stance for singing
      if (legLeftRef.current) legLeftRef.current.rotation.x = 0;
      if (legRightRef.current) legRightRef.current.rotation.x = 0;
    } else {
      // Cute Idle sway
      if (legLeftRef.current)
        legLeftRef.current.rotation.z = -0.1 + Math.sin(t * 2) * 0.05;
      if (legRightRef.current)
        legRightRef.current.rotation.z = 0.1 - Math.sin(t * 2) * 0.05;
    }

    // --- 5. HIT REACTION ---
    if (isHit) {
      groupRef.current.position.x = (Math.random() - 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[0, 0.4, 0]}>
        {/* === TORSO === */}
        <group ref={torsoRef}>
          <mesh position={[0, 0.25, 0]}>
            <RoundedBox args={[0.35, 0.4, 0.25]} radius={0.05} smoothness={4}>
              <meshStandardMaterial color={shirtColor} />
            </RoundedBox>
          </mesh>
          <mesh position={[0, 0.25, 0.13]}>
            <boxGeometry args={[0.08, 0.25, 0.02]} />
            <meshBasicMaterial color={tealColor} />
          </mesh>

          {/* Skirt */}
          <mesh ref={skirtRef} position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.19, 0.35, 0.25, 8]} />
            <meshStandardMaterial color={skirtColor} side={THREE.DoubleSide} />
          </mesh>

          {/* === FLOATING AMPS (The Weapon System) === */}
          <group ref={leftAmpRef} position={[-0.3, 0.4, -0.3]}>
            <RoundedBox args={[0.2, 0.3, 0.15]} radius={0.05} smoothness={2}>
              <meshStandardMaterial color="#111" />
            </RoundedBox>
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
          </group>

          <group ref={rightAmpRef} position={[0.3, 0.4, -0.3]}>
            <RoundedBox args={[0.2, 0.3, 0.15]} radius={0.05} smoothness={2}>
              <meshStandardMaterial color="#111" />
            </RoundedBox>
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
          </group>

          {/* === HEAD === */}
          <group ref={headRef} position={[0, 0.55, 0]}>
            <RoundedBox args={[0.28, 0.3, 0.28]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color="#f1f5f9" />
            </RoundedBox>
            {/* Visor */}
            <mesh position={[0, 0.02, 0.13]}>
              <boxGeometry args={[0.2, 0.1, 0.05]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.06, 0.02, 0.16]}>
              <planeGeometry args={[0.05, 0.05]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
            <mesh position={[0.06, 0.02, 0.16]}>
              <planeGeometry args={[0.05, 0.05]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>

            {/* Headset & Hair */}
            <mesh position={[0.16, 0.05, 0]}>
              <boxGeometry args={[0.05, 0.15, 0.1]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[-0.16, 0.05, 0]}>
              <boxGeometry args={[0.05, 0.15, 0.1]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <torusGeometry args={[0.16, 0.02, 4, 16, Math.PI]} />
              <meshStandardMaterial color="#111" />
            </mesh>

            <group ref={hairLeftRef} position={[-0.2, 0.1, 0]}>
              <mesh position={[-0.1, -0.4, 0]}>
                <RoundedBox
                  args={[0.15, 0.9, 0.15]}
                  radius={0.05}
                  smoothness={2}
                >
                  <meshStandardMaterial color={tealColor} />
                </RoundedBox>
              </mesh>
              <mesh position={[-0.05, 0, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color="#ec4899" />
              </mesh>
            </group>

            <group ref={hairRightRef} position={[0.2, 0.1, 0]}>
              <mesh position={[0.1, -0.4, 0]}>
                <RoundedBox
                  args={[0.15, 0.9, 0.15]}
                  radius={0.05}
                  smoothness={2}
                >
                  <meshStandardMaterial color={tealColor} />
                </RoundedBox>
              </mesh>
              <mesh position={[0.05, 0, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color="#ec4899" />
              </mesh>
            </group>
          </group>

          {/* === ARMS === */}
          {/* Left Arm */}
          <group ref={armLeftRef} position={[-0.25, 0.35, 0]}>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.2]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.35]} />
              <meshStandardMaterial color={shirtColor} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.07, 0.06, 0.02]} />
              <meshBasicMaterial color={tealColor} />
            </mesh>
          </group>

          {/* Right Arm (Mic Hand) */}
          <group ref={armRightRef} position={[0.25, 0.35, 0]}>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.2]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.35]} />
              <meshStandardMaterial color={shirtColor} />
            </mesh>

            {/* HOLOGRAPHIC MIC (Appears on attack) */}
            <group
              ref={micRef}
              position={[0, -0.65, 0.1]}
              rotation={[Math.PI / 2, 0, 0]}
              visible={false}
            >
              <cylinderGeometry args={[0.03, 0.02, 0.15]} />
              <meshStandardMaterial color="#111" />
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.05]} />
                <meshBasicMaterial color={tealColor} wireframe />
              </mesh>
            </group>
          </group>

          {/* SOUND WAVE (Emanating from center front) */}
          <mesh
            ref={soundWaveRef}
            position={[0, 0.5, 0.5]}
            rotation={[Math.PI / 2, 0, 0]}
            visible={false}
          >
            <ringGeometry args={[0.1, 0.8, 16]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* === LEGS === */}
        <group position={[0, -0.2, 0]}>
          <group ref={legLeftRef} position={[-0.1, 0, 0]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.055, 0.05, 0.3]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.45]} />
              <meshStandardMaterial color={shirtColor} />
            </mesh>
            <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.06, 0.01, 4, 16]} />
              <meshBasicMaterial color={tealColor} />
            </mesh>
            <mesh position={[0, -0.72, 0.05]}>
              <boxGeometry args={[0.1, 0.08, 0.15]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>

          <group ref={legRightRef} position={[0.1, 0, 0]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.055, 0.05, 0.3]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.45]} />
              <meshStandardMaterial color={shirtColor} />
            </mesh>
            <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.06, 0.01, 4, 16]} />
              <meshBasicMaterial color={tealColor} />
            </mesh>
            <mesh position={[0, -0.72, 0.05]}>
              <boxGeometry args={[0.1, 0.08, 0.15]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
