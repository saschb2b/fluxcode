import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RevenantModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

export function RevenantModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#020617", // Void Black
  accentColor = "#a855f7", // Glitch Purple
}: RevenantModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // ANATOMY REFS
  const torsoRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const leftHornRef = useRef<THREE.Mesh>(null);
  const rightHornRef = useRef<THREE.Mesh>(null);

  const leftPauldronRef = useRef<THREE.Group>(null);
  const rightPauldronRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // FX REFS
  const scarfLeftRef = useRef<THREE.Group>(null);
  const scarfRightRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const coreCrystalRef = useRef<THREE.Mesh>(null);

  const [offset] = useState(() => Math.random() * 100);

  // Memoized Data for Scarf Segments
  const scarfSegments = useMemo(() => Array.from({ length: 8 }), []);

  useFrame((state, delta) => {
    // Safety
    if (
      !groupRef.current ||
      !torsoRef.current ||
      !headGroupRef.current ||
      !leftPauldronRef.current ||
      !rightPauldronRef.current ||
      !auraRef.current ||
      !scarfLeftRef.current ||
      !scarfRightRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. GODLY HOVER ---
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.15;
    const breath = 1 + Math.sin(time * 2) * 0.02;
    groupRef.current.scale.set(breath, breath, breath);

    // --- 2. THE SCARVES ---
    [scarfLeftRef.current, scarfRightRef.current].forEach(
      (scarf, sideIndex) => {
        scarf.children.forEach((segment, i) => {
          const wave = Math.sin(time * 3 + i * 0.5 + sideIndex * Math.PI);
          segment.position.z = 0.2 + i * 0.25;
          segment.position.x = wave * (0.1 + i * 0.05);
          segment.rotation.z = wave * 0.2;
          segment.rotation.x = Math.sin(time * 2 + i) * 0.1;

          if (hpPercentage < 0.5 && Math.random() > 0.9) {
            segment.scale.setScalar(0.5);
          } else {
            segment.scale.setScalar(1 - i * 0.1);
          }
        });
      },
    );

    // --- 3. ATTACK ANIMATION ---
    let armLift = 0;
    let hornAngle = 0.2;
    let visorHeight = 0.08;

    if (isAttacking) {
      armLift = 0.5 + Math.sin(time * 10) * 0.1;
      hornAngle = -0.2;
      visorHeight = 0.02;

      auraRef.current.rotation.y += delta * 5;
      auraRef.current.scale.setScalar(1.2 + Math.random() * 0.1);
    } else if (isHit) {
      groupRef.current.position.x = Math.sin(time * 20) * 0.1;
      hornAngle = 0.5;
      visorHeight = 0.15;
    } else {
      armLift = Math.sin(time) * 0.1;
      hornAngle = 0.3 + Math.sin(time * 0.5) * 0.05;
      auraRef.current.rotation.y += delta * 0.2;
      auraRef.current.rotation.z += delta * 0.1;
    }

    if (leftHornRef.current && rightHornRef.current && visorRef.current) {
      leftHornRef.current.rotation.x = THREE.MathUtils.lerp(
        leftHornRef.current.rotation.x,
        hornAngle,
        delta * 5,
      );
      rightHornRef.current.rotation.x = THREE.MathUtils.lerp(
        rightHornRef.current.rotation.x,
        hornAngle,
        delta * 5,
      );
      visorRef.current.scale.y = THREE.MathUtils.lerp(
        visorRef.current.scale.y,
        visorHeight * 10,
        delta * 10,
      );
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.position.y = -0.5 + armLift;
      rightArmRef.current.position.y = -0.5 + armLift;

      leftArmRef.current.rotation.z = -0.2 + Math.sin(time * 2) * 0.1;
      rightArmRef.current.rotation.z = 0.2 - Math.sin(time * 2) * 0.1;
    }

    // --- 4. COLOR & ENERGY ---
    const currentAccent = isAttacking ? "#ef4444" : accentColor;
    const pulse = 1 + Math.sin(time * 4) * 0.5;

    if (coreCrystalRef.current) {
      (
        coreCrystalRef.current.material as THREE.MeshStandardMaterial
      ).emissive.set(currentAccent);
      (
        coreCrystalRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = isAttacking ? 5 : 2 * pulse;
      coreCrystalRef.current.rotation.y += delta;
      coreCrystalRef.current.rotation.x += delta * 0.5;
    }

    if (visorRef.current) {
      (visorRef.current.material as THREE.MeshStandardMaterial).emissive.set(
        currentAccent,
      );
      (
        visorRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = isAttacking ? 4 : 2;
    }

    (auraRef.current.material as THREE.MeshBasicMaterial).color.set(
      currentAccent,
    );
    (auraRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.1 + (isAttacking ? 0.2 : 0) + Math.sin(time) * 0.05;
  });

  const metalColor = "#334155"; // Joints
  const darkArmor = primaryColor;

  return (
    <group ref={groupRef}>
      {/* --- GLITCH AURA --- */}
      <mesh ref={auraRef}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial
          color={accentColor}
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* --- TORSO --- */}
      <group ref={torsoRef}>
        {/* Main Chest */}
        <mesh castShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.3, 0.1, 0.6, 6]} />
          <meshStandardMaterial
            color={darkArmor}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Glowing Heart Crystal */}
        <mesh ref={coreCrystalRef} position={[0, 0.3, 0.25]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={2}
          />
        </mesh>

        {/* Ribs/Cage - FIX ROTATION ON MESH */}
        <mesh position={[0, 0.3, 0.25]} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.15, 0.02, 16, 4]} />
          <meshStandardMaterial color={metalColor} />
        </mesh>
      </group>

      {/* --- HEAD --- */}
      <group ref={headGroupRef} position={[0, 0.7, 0]}>
        <mesh>
          <dodecahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color={darkArmor}
            roughness={0.1}
            metalness={1.0}
          />
        </mesh>

        {/* Visor */}
        <mesh ref={visorRef} position={[0, 0, 0.15]}>
          <boxGeometry args={[0.25, 0.05, 0.02]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>

        {/* Horns */}
        <mesh
          ref={leftHornRef}
          position={[-0.22, 0.15, -0.1]}
          rotation={[0.2, 0, 0.2]}
        >
          <coneGeometry args={[0.1, 0.6, 4]} />
          <meshStandardMaterial
            color={darkArmor}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        <mesh
          ref={rightHornRef}
          position={[0.22, 0.15, -0.1]}
          rotation={[0.2, 0, -0.2]}
        >
          <coneGeometry args={[0.1, 0.6, 4]} />
          <meshStandardMaterial
            color={darkArmor}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* --- SHOULDERS --- */}
      <group ref={leftPauldronRef} position={[-0.45, 0.5, 0]}>
        <mesh rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
          <meshStandardMaterial
            color={darkArmor}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[-0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <circleGeometry args={[0.08, 3]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      <group ref={rightPauldronRef} position={[0.45, 0.5, 0]}>
        <mesh rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
          <meshStandardMaterial
            color={darkArmor}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0.16, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <circleGeometry args={[0.08, 3]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      {/* --- ARMS --- */}
      <group ref={leftArmRef} position={[-0.5, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.04, 0.3, 6]} />
          <meshStandardMaterial color={metalColor} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.5, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.04, 0.3, 6]} />
          <meshStandardMaterial color={metalColor} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* --- DATA SCARVES --- */}
      <group position={[0, 0.5, -0.2]}>
        <group ref={scarfLeftRef} position={[-0.15, 0, 0]}>
          {scarfSegments.map((_, i) => (
            <mesh key={i}>
              <planeGeometry args={[0.25, 0.3]} />
              <meshStandardMaterial
                color={accentColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.6 - i * 0.05}
                emissive={accentColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
        <group ref={scarfRightRef} position={[0.15, 0, 0]}>
          {scarfSegments.map((_, i) => (
            <mesh key={i}>
              <planeGeometry args={[0.25, 0.3]} />
              <meshStandardMaterial
                color={accentColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.6 - i * 0.05}
                emissive={accentColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
