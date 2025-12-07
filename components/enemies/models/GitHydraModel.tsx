"use client";

import { RoundedBox, Octahedron } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface GitHydraModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

// --- HEAD SUB-COMPONENT ---
function HydraHead({
  position,
  rotation,
  scale = 1,
  color,
  isActive,
  isMaster = false,
  isAttacking,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color: string;
  isActive: boolean;
  isMaster?: boolean;
  isAttacking: boolean;
}) {
  const jawRef = useRef<THREE.Group>(null);
  const armorTopRef = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);

  // Materials for performance
  const eyeMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (
      !jawRef.current ||
      !armorTopRef.current ||
      !eyeMat.current ||
      !eyeRef.current
    )
      return;

    // 1. JAW MECHANICS (Open Wide on Attack)
    const attackOpen = isAttacking ? 0.8 : 0;
    const idleSnap = Math.sin(state.clock.elapsedTime * 15) * 0.1 + 0.1;
    jawRef.current.rotation.x = THREE.MathUtils.lerp(
      jawRef.current.rotation.x,
      isAttacking ? attackOpen : isActive ? idleSnap : 0,
      0.1,
    );

    // 2. ARMOR FLARE (Venting heat)
    // The top plate lifts up when attacking
    armorTopRef.current.position.y = THREE.MathUtils.lerp(
      armorTopRef.current.position.y,
      isAttacking ? 0.15 : 0.05,
      0.1,
    );
    armorTopRef.current.rotation.x = THREE.MathUtils.lerp(
      armorTopRef.current.rotation.x,
      isAttacking ? -0.2 : 0,
      0.1,
    );

    // 3. COLOR SHIFT (Safe -> DANGER)
    const targetColor = isAttacking ? "#ef4444" : isActive ? color : "#333";
    eyeMat.current.color.set(targetColor);

    // 4. VIBRATION (If attacking)
    if (isAttacking && isActive) {
      eyeRef.current.position.x = (Math.random() - 0.5) * 0.02;
    } else {
      eyeRef.current.position.x = 0;
    }
  });

  return (
    <group
      position={position}
      rotation={rotation ? new THREE.Euler(...rotation) : undefined}
      scale={scale}
    >
      {/* Cranium Group */}
      <group>
        {/* Inner Glowing Core (Visible when armor flares) */}
        <RoundedBox args={[0.42, 0.32, 0.52]} radius={0.1} smoothness={4}>
          <meshBasicMaterial color={isAttacking ? "#ef4444" : "#1e293b"} />
        </RoundedBox>

        {/* Top Armor Plate (Flares up) */}
        <mesh ref={armorTopRef} position={[0, 0.05, 0]}>
          <RoundedBox args={[0.52, 0.25, 0.4]} radius={0.05} smoothness={2}>
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </RoundedBox>
        </mesh>
      </group>

      {/* Optical Sensor (Eye) */}
      <mesh ref={eyeRef} position={[0, 0.05, 0.28]}>
        <boxGeometry args={[isMaster ? 0.3 : 0.2, 0.1, 0.1]} />
        <meshBasicMaterial ref={eyeMat} color={color} toneMapped={false} />
      </mesh>

      {/* Aiming Laser (Only when attacking) */}
      {isAttacking && isActive && (
        <mesh position={[0, 0.05, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 5]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Lower Jaw */}
      <group ref={jawRef} position={[0, -0.1, 0]}>
        <mesh position={[0, -0.1, 0.1]}>
          <boxGeometry args={[0.4, 0.15, 0.5]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Glowing Fangs */}
        <mesh position={[0.15, 0.05, 0.35]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshBasicMaterial color={isAttacking ? "#ef4444" : "white"} />
        </mesh>
        <mesh position={[-0.15, 0.05, 0.35]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshBasicMaterial color={isAttacking ? "#ef4444" : "white"} />
        </mesh>
      </group>

      {/* Halo (Master) */}
      {isMaster && isActive && (
        <mesh position={[0, 0, -0.4]} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.4, 0.02, 4, 32]} />
          <meshBasicMaterial
            color={isAttacking ? "#ef4444" : color}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

// --- BODY SUB-COMPONENT ---
function CommitNode({
  index,
  offset,
  isAttacking,
}: {
  index: number;
  offset: number;
  isAttacking: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && spineRef.current && shieldRef.current) {
      const t = state.clock.elapsedTime + offset;

      // Movement Logic
      const speedMultiplier = isAttacking ? 2 : 1; // Slither faster when angry
      const zPos = 0.6 + index * 0.7;
      const sway = Math.sin(t * 3 * speedMultiplier - index * 0.8) * 0.3;
      const bob = Math.cos(t * 5 * speedMultiplier - index * 0.8) * 0.05;

      ref.current.position.set(sway, bob, -zPos);
      ref.current.rotation.z = -sway * 0.5;
      shieldRef.current.rotation.z = t + index;

      // Spine Glow Logic (Green -> Red)
      const spineMat = spineRef.current.material as THREE.MeshBasicMaterial;
      spineMat.color.set(isAttacking ? "#ef4444" : "#22c55e");
      spineMat.opacity = isAttacking ? 0.8 : 0.4;
    }
  });

  return (
    <group ref={ref}>
      {/* Core */}
      <mesh>
        <Octahedron args={[0.25]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* Shields */}
      <group ref={shieldRef}>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[-0.35, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
      </group>

      {/* Spine Line */}
      <mesh
        ref={spineRef}
        position={[0, 0, 0.35]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.7]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// --- MAIN MODEL ---
export function GitHydraModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#0f172a",
  accentColor = "#22c55e",
}: GitHydraModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const leftBranchRef = useRef<THREE.Group>(null);
  const rightBranchRef = useRef<THREE.Group>(null);

  const offset = useMemo(() => Math.random() * 100, []);
  const isBranch1Active = hpPercentage < 0.75;
  const isBranch2Active = hpPercentage < 0.5;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + offset;
    if (
      !groupRef.current ||
      !neckRef.current ||
      !leftBranchRef.current ||
      !rightBranchRef.current
    )
      return;

    // 1. SWAY
    groupRef.current.position.y = Math.sin(t) * 0.1;
    groupRef.current.rotation.z = Math.cos(t * 0.5) * 0.05;

    // 2. HEAD BEHAVIOR
    if (isAttacking) {
      neckRef.current.position.z = THREE.MathUtils.lerp(
        neckRef.current.position.z,
        0.8,
        delta * 5,
      ); // Hard lunge
      neckRef.current.rotation.x = -0.3;

      // Shake the neck container
      neckRef.current.position.x = (Math.random() - 0.5) * 0.05;
    } else {
      neckRef.current.position.z = THREE.MathUtils.lerp(
        neckRef.current.position.z,
        0,
        delta * 2,
      );
      neckRef.current.rotation.x = Math.sin(t * 1.5) * 0.1;
      neckRef.current.position.x = 0;
    }

    // 3. BRANCHES
    const leftTargetX = isBranch1Active ? 0.9 : 0.2;
    const leftTargetZ = isBranch1Active ? 0.2 : 0;
    leftBranchRef.current.position.x = THREE.MathUtils.lerp(
      leftBranchRef.current.position.x,
      leftTargetX,
      delta * 3,
    );
    leftBranchRef.current.position.z = THREE.MathUtils.lerp(
      leftBranchRef.current.position.z,
      leftTargetZ,
      delta * 3,
    );
    leftBranchRef.current.rotation.y = 0.3;

    const rightTargetX = isBranch2Active ? -0.9 : -0.2;
    const rightTargetZ = isBranch2Active ? 0.2 : 0;
    rightBranchRef.current.position.x = THREE.MathUtils.lerp(
      rightBranchRef.current.position.x,
      rightTargetX,
      delta * 3,
    );
    rightBranchRef.current.position.z = THREE.MathUtils.lerp(
      rightBranchRef.current.position.z,
      rightTargetZ,
      delta * 3,
    );
    rightBranchRef.current.rotation.y = -0.3;

    // 4. HIT REACTION
    if (isHit) {
      groupRef.current.position.x = (Math.random() - 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* HEADS */}
      <group ref={neckRef} position={[0, 0, 0]}>
        <HydraHead
          position={[0, 0, 0]}
          color={accentColor}
          isActive={true}
          isMaster={true}
          scale={1.2}
          isAttacking={isAttacking} // Pass attack state
        />
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.5]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        <group ref={leftBranchRef} position={[0.2, 0, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <HydraHead
            position={[0, 0, 0]}
            scale={0.7}
            color="#eab308"
            isActive={isBranch1Active}
            isAttacking={isAttacking}
          />
        </group>

        <group ref={rightBranchRef} position={[-0.2, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <HydraHead
            position={[0, 0, 0]}
            scale={0.7}
            color="#ef4444"
            isActive={isBranch2Active}
            isAttacking={isAttacking}
          />
        </group>
      </group>

      {/* BODY */}
      {[0, 1, 2, 3].map((i) => (
        <CommitNode
          key={i}
          index={i}
          offset={offset}
          isAttacking={isAttacking} // Pass attack state
        />
      ))}
    </group>
  );
}
