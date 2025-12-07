"use client";

import { Trail, Instance, Instances, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";

// =========================================================
// 1. CALLBACK-CARP (The Laggy One) - Kept mostly same, slight polish
// =========================================================
export function CallbackCarpModel({ isAttacking, isHit }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const offset = useRef(Math.random() * 100).current;

  useFrame((state) => {
    if (!groupRef.current || !bodyRef.current) return;

    // LAG SIMULATION (Stepped time)
    const realTime = state.clock.elapsedTime + offset;
    const fps = 4; // Very low framerate feel
    const laggedTime = Math.floor(realTime * fps) / fps;

    // Glitchy movement
    groupRef.current.position.y = Math.sin(laggedTime * 5) * 0.2;
    groupRef.current.position.x = Math.cos(laggedTime * 3) * 0.1;
    groupRef.current.rotation.y = Math.sin(realTime) * 0.2; // Smooth rotation to contrast the lag position

    // Tail flap
    bodyRef.current.rotation.y = Math.sin(laggedTime * 15) * 0.6;
  });

  return (
    <group ref={groupRef}>
      <Trail
        width={0.6}
        length={5}
        color={"#2dd4bf"}
        attenuation={(t) => t * t}
      >
        <group ref={bodyRef}>
          {/* Head */}
          <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.15, 0.4, 8]} />
            <meshStandardMaterial
              color="#2dd4bf"
              roughness={0.2}
              emissive="#2dd4bf"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Body */}
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[0.2, 0.25, 0.4]} />
            <meshStandardMaterial color="#0d9488" />
          </mesh>
          {/* Tail */}
          <mesh
            position={[0, 0, -0.5]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1, 0.2, 1]}
          >
            <cylinderGeometry args={[0.02, 0.15, 0.4, 4]} />
            <meshBasicMaterial color="#5eead4" />
          </mesh>
          {/* Eyes */}
          <mesh position={[0.12, 0.05, 0.25]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh position={[-0.12, 0.05, 0.25]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </group>
      </Trail>
    </group>
  );
}

// =========================================================
// 2. PROMISE-PIRANHA (The Pending One) - REWORKED
// =========================================================
export function PromisePiranhaModel({ isAttacking, isHit }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const jawUpperRef = useRef<THREE.Group>(null);
  const jawLowerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  const offset = useRef(Math.random() * 100).current;

  // Colors
  const pendingColor = "#facc15"; // Yellow
  const rejectColor = "#ef4444"; // Red

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !ringRef.current ||
      !jawUpperRef.current ||
      !jawLowerRef.current
    )
      return;
    const t = state.clock.elapsedTime + offset;

    // Hover
    groupRef.current.position.y = Math.sin(t * 4) * 0.15;

    // RING ANIMATION (The "Promise" State)
    ringRef.current.rotation.z -= delta * 2;
    // Ring pulses when pending, Spikes when attacking
    const ringPulse = isAttacking ? 1.5 : 1 + Math.sin(t * 5) * 0.1;
    ringRef.current.scale.setScalar(ringPulse);

    // ATTACK LOGIC
    if (isAttacking) {
      // Frenzied biting
      const biteSpeed = 25;
      const bite = Math.sin(t * biteSpeed) * 0.4 + 0.4;
      jawUpperRef.current.rotation.x = -bite;
      jawLowerRef.current.rotation.x = bite;

      // Vibration (Shake)
      groupRef.current.position.x = (Math.random() - 0.5) * 0.1;
      groupRef.current.position.z = (Math.random() - 0.5) * 0.1;

      // Lunge forward
      groupRef.current.rotation.x = -0.2;
    } else {
      // Idle: Mouth slightly open (Awaiting...)
      jawUpperRef.current.rotation.x = THREE.MathUtils.lerp(
        jawUpperRef.current.rotation.x,
        -0.2,
        delta * 3,
      );
      jawLowerRef.current.rotation.x = THREE.MathUtils.lerp(
        jawLowerRef.current.rotation.x,
        0.2,
        delta * 3,
      );

      // Reset tilt
      groupRef.current.rotation.x = 0;
    }
  });

  const stateColor = isAttacking ? rejectColor : pendingColor;

  return (
    <group ref={groupRef}>
      {/* THE PROMISE RING (Floating Halo) */}
      <group ref={ringRef} position={[0, 0, -0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.03, 8, 4, Math.PI * 1.5]} />{" "}
          {/* Broken ring = Pending */}
          <meshBasicMaterial color={stateColor} />
        </mesh>
        {/* Loading Orbs */}
        <mesh position={[0.7, 0, 0]}>
          <octahedronGeometry args={[0.1]} />
          <meshBasicMaterial color={stateColor} />
        </mesh>
      </group>

      {/* BODY - Geometric Piranha Shape */}
      <group scale={0.7}>
        {/* Main Body (Diamond Shape) */}
        <mesh ref={bodyRef} rotation={[0, 0, Math.PI / 4]} scale={[1, 1.5, 1]}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Upper Jaw (Hinged) */}
        <group ref={jawUpperRef} position={[0, 0.1, 0.2]}>
          <mesh
            position={[0, 0, 0.2]}
            rotation={[-Math.PI / 2, Math.PI / 4, 0]}
          >
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Big Eye */}
          <mesh position={[0.18, 0.1, 0.1]}>
            <sphereGeometry args={[0.12]} />
            <meshBasicMaterial color={stateColor} />
          </mesh>
          <mesh position={[-0.18, 0.1, 0.1]}>
            <sphereGeometry args={[0.12]} />
            <meshBasicMaterial color={stateColor} />
          </mesh>
        </group>

        {/* Lower Jaw (Massive Underbite) */}
        <group ref={jawLowerRef} position={[0, -0.1, 0.2]}>
          <mesh
            position={[0, 0, 0.25]}
            rotation={[Math.PI / 2, Math.PI / 4, 0]}
          >
            <coneGeometry args={[0.25, 0.5, 4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Teeth (Spikes) */}
          <mesh position={[0.1, 0.2, 0.4]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.05, 0.2, 4]} />
            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[-0.1, 0.2, 0.4]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.05, 0.2, 4]} />
            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* Tail Fin */}
        <mesh position={[0, 0, -0.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.2, 0.5, 3]} />
          <meshStandardMaterial color={stateColor} wireframe />
        </mesh>
      </group>
    </group>
  );
}

// =========================================================
// 3. OBSERVABLE-ORCA (The Data Stream) - REWORKED
// =========================================================
function OrcaInternalStream({ isAttacking }: { isAttacking: boolean }) {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const speed = isAttacking ? 3 : 1;

    for (let i = 0; i < count; i++) {
      // Move from head (Z+) to tail (Z-)
      const progress = (t * 0.5 * speed + i / count) % 1;
      const z = 2.0 - progress * 5.0;

      // Constrain to body shape (Taper at ends)
      // Simple curve approximation: 1 - z^2 roughly
      const width = Math.max(0.1, 1 - Math.pow(z / 2.5, 2));

      const angle = i * 137.5; // Golden angle for spiral
      const radius = Math.random() * width * 0.5;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      dummy.position.set(x, y, z);

      // Scale based on "data packet" size
      const s = Math.random() * 0.15;
      dummy.scale.set(s, s, s * 2); // Elongated bits

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const streamColor = isAttacking ? "#ef4444" : "#00ff00"; // Red stream on attack

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={streamColor} />
    </instancedMesh>
  );
}

export function ObservableOrcaModel({ isAttacking, isHit }: any) {
  const groupRef = useRef<THREE.Group>(null);

  // Body Segments for swimming motion
  const headRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  const pulseRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (
      !groupRef.current ||
      !headRef.current ||
      !midRef.current ||
      !tailRef.current ||
      !pulseRingRef.current
    )
      return;
    const t = state.clock.elapsedTime;

    // 1. SWIMMING MOTION (Spine Wiggle)
    // Propagate sine wave down the body
    const swimSpeed = isAttacking ? 10 : 3;
    const amp = isAttacking ? 0.2 : 0.1;

    headRef.current.rotation.y = Math.sin(t * swimSpeed) * amp * 0.5;
    midRef.current.rotation.y = Math.sin(t * swimSpeed - 0.5) * amp;
    tailRef.current.rotation.y = Math.sin(t * swimSpeed - 1.0) * amp * 1.5;

    // Vertical bob
    groupRef.current.position.y = Math.sin(t) * 0.2;

    // 2. ATTACK: PULSE NOVA
    if (isAttacking) {
      // Rapid expansion of rings
      const pulse = (t * 4) % 1; // Fast loop 0 to 1
      pulseRingRef.current.scale.setScalar(pulse * 8); // Expand huge
      (pulseRingRef.current.material as THREE.MeshBasicMaterial).opacity =
        1 - pulse;
      (pulseRingRef.current.material as THREE.MeshBasicMaterial).color.set(
        "#ef4444",
      ); // Red warning
    } else {
      // Gentle idle pulse
      const pulse = (t * 0.5) % 1;
      pulseRingRef.current.scale.setScalar(1 + pulse);
      (pulseRingRef.current.material as THREE.MeshBasicMaterial).opacity =
        (1 - pulse) * 0.2;
      (pulseRingRef.current.material as THREE.MeshBasicMaterial).color.set(
        "#00ff00",
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- INTERNAL DATA STREAM --- */}
      <OrcaInternalStream isAttacking={isAttacking} />

      {/* --- GLASS HULL (Segmented) --- */}

      {/* HEAD */}
      <group ref={headRef} position={[0, 0, 1.2]}>
        <mesh>
          <RoundedBox args={[0.8, 0.7, 1]} radius={0.3} smoothness={4}>
            <meshPhysicalMaterial
              color={isHit ? "white" : "#001133"}
              transmission={0.6}
              roughness={0.2}
              metalness={0.8}
              thickness={0.5}
              transparent
              opacity={0.5}
            />
          </RoundedBox>
        </mesh>
        {/* Eyes */}
        <mesh position={[0.3, 0.1, 0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.4]} />
          <meshBasicMaterial color={isAttacking ? "#ff0000" : "white"} />
        </mesh>
        <mesh position={[-0.3, 0.1, 0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.4]} />
          <meshBasicMaterial color={isAttacking ? "#ff0000" : "white"} />
        </mesh>
      </group>

      {/* MID BODY (Pivot) */}
      <group ref={midRef} position={[0, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 1.5, 16]} />
          <meshPhysicalMaterial
            color="#001133"
            transmission={0.6}
            opacity={0.5}
            transparent
            roughness={0.2}
          />
        </mesh>
        {/* Side Fins */}
        <mesh position={[0.6, -0.2, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.8, 0.1, 0.4]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[-0.6, -0.2, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.8, 0.1, 0.4]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        {/* Dorsal Fin */}
        <mesh position={[0, 0.5, 0]} rotation={[-0.5, 0, 0]}>
          <coneGeometry args={[0.1, 0.6, 4]} scale={[1, 1, 2]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      </group>

      {/* TAIL */}
      <group ref={tailRef} position={[0, 0, -1.0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.35, 1.2, 16]} />
          <meshPhysicalMaterial
            color="#001133"
            transmission={0.6}
            opacity={0.5}
            transparent
          />
        </mesh>
        {/* Flukes */}
        <mesh position={[0, 0, -0.6]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.4]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      </group>

      {/* PULSE WAVE RING */}
      <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial
          color="#00ff00"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
