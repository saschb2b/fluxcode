"use client";

import { RoundedBox, Trail, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// =========================================================
// 1. ROLLER-RODENT (Mechanical / Retro)
// =========================================================
export function RollerRodentModel({ isAttacking, isHit, hpPercentage }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Group>(null);

  const offset = useRef(Math.random() * 100).current;
  const beigeColor = "#e8e4c9"; // Retro plastic
  const cordColor = "#94a3b8"; // Old grey cable

  useFrame((state) => {
    if (!groupRef.current || !ballRef.current) return;
    const t = state.clock.elapsedTime + offset;

    // MOVEMENT: Clumsy, stuttery
    const stutter = Math.sin(t * 10) > 0.5 ? 0 : 1; // Stop/Start motion
    const wobble = Math.sin(t * 5) * 0.05;

    // Position
    groupRef.current.position.y = 0.3 + wobble; // Heavy bob

    if (isAttacking) {
      // Ramming speed (ignores stutter)
      groupRef.current.position.z = Math.sin(t * 20) * 0.1;
    }

    // THE BALL: Rolls based on implied movement
    ballRef.current.rotation.x -= 0.1 * (isAttacking ? 3 : stutter);

    // HIT REACTION
    if (isHit) {
      groupRef.current.rotation.z = 0.2; // Tilt impact
    } else {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        0,
        0.1,
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* CHASSIS */}
      <group position={[0, 0.1, 0]}>
        <RoundedBox args={[0.6, 0.35, 0.8]} radius={0.05} smoothness={2}>
          <meshStandardMaterial color={beigeColor} roughness={0.6} />
        </RoundedBox>

        {/* Buttons (Split) */}
        <mesh position={[-0.15, 0.18, 0.25]}>
          <boxGeometry args={[0.28, 0.05, 0.3]} />
          <meshStandardMaterial color={beigeColor} />
        </mesh>
        <mesh position={[0.15, 0.18, 0.25]}>
          <boxGeometry args={[0.28, 0.05, 0.3]} />
          <meshStandardMaterial color={beigeColor} />
        </mesh>
      </group>

      {/* THE TRACKBALL (Dirty Rubber) */}
      <mesh ref={ballRef} position={[0, -0.15, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} map={null} />
      </mesh>

      {/* TAIL (The Cord) */}
      <group position={[0, 0, -0.4]}>
        <Trail width={0.4} length={4} color={cordColor} attenuation={(t) => t}>
          <mesh ref={tailRef}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color={cordColor} />
          </mesh>
        </Trail>
      </group>

      {/* DUST BUNNY ARMOR */}
      {/* Particles visible if HP is high (armor intact) */}
      {hpPercentage > 0.3 && (
        <group position={[0, -0.2, 0]}>
          <Sparkles
            count={20}
            scale={[1.2, 0.5, 1.2]}
            size={4}
            speed={0.2}
            opacity={0.5}
            color="#a1a1aa"
          />
        </group>
      )}
    </group>
  );
}

// =========================================================
// 2. OPTI-SQUEAK (Optical / Modern)
// =========================================================
export function OptiSqueakModel({ isAttacking, isHit }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Mesh>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  const offset = useRef(Math.random() * 100).current;

  useFrame((state) => {
    if (!groupRef.current || !wheelRef.current || !laserRef.current) return;
    const t = state.clock.elapsedTime + offset;

    // HOVERING
    groupRef.current.position.y = 0.4 + Math.sin(t * 3) * 0.05;

    // LASER PULSE
    const laserIntensity = isAttacking ? 2 : 1 + Math.sin(t * 10) * 0.2;
    (laserRef.current.material as THREE.MeshBasicMaterial).opacity =
      laserIntensity * 0.3;
    laserRef.current.scale.setScalar(1 + Math.sin(t * 20) * 0.05);

    // SCROLL WHEEL (Spins constantly)
    wheelRef.current.rotation.x += 0.1;

    // DOUBLE CLICK GLITCH (Attack Animation)
    if (isAttacking) {
      // Frantic twitching
      groupRef.current.position.x = (Math.random() - 0.5) * 0.1;
      // Pitch forward
      groupRef.current.rotation.x = -0.3;
    } else {
      groupRef.current.position.x = 0;
      groupRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* BODY (Smooth Capsule-like) */}
      <group>
        <RoundedBox args={[0.55, 0.3, 0.85]} radius={0.15} smoothness={8}>
          <meshPhysicalMaterial color="white" roughness={0.2} clearcoat={1} />
        </RoundedBox>

        {/* SCROLL FIN (Shark Fin) */}
        <mesh
          ref={wheelRef}
          position={[0, 0.15, 0.1]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      {/* THE OPTICAL SENSOR (Laser Cone) */}
      <mesh ref={laserRef} position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 16, 1, true]} />
        <meshBasicMaterial
          color="#ff0000"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* LASER DOT (Ground) */}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* THIN WHIP TAIL */}
      <Trail width={0.1} length={6} color="#333" attenuation={(t) => t * t}>
        <mesh position={[0, 0, -0.45]}>
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </Trail>
    </group>
  );
}

// =========================================================
// 3. MACRO-MARSUPIAL (Gaming / Wireless)
// =========================================================
export function MacroMarsupialModel({ isAttacking, isHit }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const rgbStripsRef = useRef<THREE.Group>(null);
  const sideButtonsRef = useRef<THREE.Group>(null);

  const offset = useRef(Math.random() * 100).current;

  useFrame((state, delta) => {
    if (!groupRef.current || !rgbStripsRef.current) return;
    const t = state.clock.elapsedTime + offset;

    // --- RGB LOGIC ---
    const hue = (t * 0.5) % 1;
    const rgbColor = new THREE.Color().setHSL(hue, 1, 0.5);
    const attackColor = new THREE.Color("#ff00ff"); // Magenta/Purple attack

    // Apply RGB to strips
    rgbStripsRef.current.children.forEach((strip) => {
      const mat = (strip as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.color.copy(isAttacking ? attackColor : rgbColor);
    });

    // Apply RGB to Side Buttons (Simulating ripple)
    if (sideButtonsRef.current) {
      sideButtonsRef.current.children.forEach((btn, i) => {
        const mat = (btn as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const btnHue = (hue + i * 0.05) % 1;
        const btnColor = new THREE.Color().setHSL(btnHue, 1, 0.5);
        mat.emissive.copy(isAttacking ? attackColor : btnColor);
      });
    }

    // --- MOVEMENT (Teleporting/Aggressive) ---
    // High polling rate jitter
    if (isAttacking) {
      // Visible "Glitch" vibration
      groupRef.current.position.x = (Math.random() - 0.5) * 0.15;
    } else {
      // Smooth hover
      groupRef.current.position.y = 0.4 + Math.sin(t * 2) * 0.05;
      groupRef.current.position.x = 0;
    }

    // Hit Reaction (Flicker)
    if (isHit) {
      groupRef.current.visible = Math.random() > 0.5;
    } else {
      groupRef.current.visible = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* BODY (Aggressive Angular) */}
      <mesh>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* TOP PLATING */}
      <mesh position={[0, 0.15, 0.1]}>
        <boxGeometry args={[0.55, 0.1, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* RGB STRIPS */}
      <group ref={rgbStripsRef}>
        <mesh position={[0.25, 0, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.05, 0.6, 0.8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-0.25, 0, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.05, 0.6, 0.8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      {/* SIDE BUTTONS (MMO Grid) */}
      <group
        ref={sideButtonsRef}
        position={[-0.32, 0, 0]}
        rotation={[0, 0, -0.2]}
      >
        {[...Array(9)].map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          return (
            <mesh key={i} position={[0, 0.1 - row * 0.1, 0.2 - col * 0.15]}>
              <boxGeometry args={[0.05, 0.08, 0.12]} />
              <meshStandardMaterial
                color="#333"
                emissive="white"
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* NO TAIL (Wireless Symbol floating behind?) */}
      <mesh position={[0, 0.5, -0.4]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.02, 4, 16, Math.PI]} />
        <meshBasicMaterial color="cyan" />
      </mesh>
      <mesh position={[0, 0.4, -0.4]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.05, 0.02, 4, 16, Math.PI]} />
        <meshBasicMaterial color="cyan" />
      </mesh>
    </group>
  );
}
