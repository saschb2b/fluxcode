import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EnemyDefinition } from "../types";
import { createPair } from "../utils";

const AlphaSentryVisuals = ({
  isAttacking,
  isHit,
  hpPercentage,
}: {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const finsRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  // Random offset for hovering to make instances look different
  const offset = useRef(Math.random() * 100).current;

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !finsRef.current ||
      !coreRef.current ||
      !laserRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // 1. Idle Hover (Bobbing + slight tilt)
    groupRef.current.position.y = Math.sin(time * 2) * 0.1;
    groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.05; // Banking

    // 2. Fin Animation (Magnetic orbit)
    // Idle: Slow rotation
    // Attack: Fins expand outward and spin faster
    const targetExpansion = isAttacking ? 0.3 : 0;
    const targetSpeed = isAttacking ? 5 : 1;

    finsRef.current.rotation.z += delta * targetSpeed;

    // Expand fins logic
    finsRef.current.children.forEach((fin, i) => {
      const angle = (i / 3) * Math.PI * 2;
      const baseDist = 0.35;
      const dist = THREE.MathUtils.lerp(
        Math.sqrt(fin.position.x ** 2 + fin.position.y ** 2), // current dist
        baseDist + targetExpansion,
        delta * 5,
      );
      fin.position.x = Math.cos(angle) * dist;
      fin.position.y = Math.sin(angle) * dist;

      // Tilt fins towards center
      fin.lookAt(0, 0, 0);
    });

    // 3. Eye / Laser Logic
    if (isAttacking) {
      // Charging shake
      coreRef.current.position.x = (Math.random() - 0.5) * 0.05;
      coreRef.current.position.y = (Math.random() - 0.5) * 0.05;

      // Laser flickers intensely
      laserRef.current.scale.set(1 + Math.random(), 1, 1 + Math.random());
      (laserRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.8 + Math.random() * 0.2;
    } else {
      // Calm reset
      coreRef.current.position.set(0, 0, 0);
      // Passive scanning pulse
      const scan = (Math.sin(time * 10) + 1) / 2; // 0 to 1
      (laserRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.1 + scan * 0.1;
      laserRef.current.scale.set(1, 1, 1);
    }
  });

  // Colors
  const baseColor = "#1e293b"; // Dark Slate (Chassis)
  const glowColor = isAttacking ? "#ef4444" : "#4ade80"; // Red if angry, Green if calm
  const hitColor = "white";
  const activeColor = isHit ? hitColor : baseColor;

  return (
    <group ref={groupRef}>
      {/* --- CENTRAL CORE --- */}
      <mesh ref={coreRef} castShadow>
        {/* Icosahedron looks more 'tech' than sphere */}
        <icosahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color={activeColor}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* --- THE EYE LENS --- */}
      <mesh position={[0, 0, 0.22]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={isAttacking ? 4.0 : 1.5}
          toneMapped={false}
        />
      </mesh>

      {/* --- FLOATING FINS (The Chassis) --- */}
      <group ref={finsRef}>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, 0]}
              rotation={[0, 0, angle]}
            >
              {/* A techy trapezoid shape */}
              <boxGeometry args={[0.15, 0.4, 0.05]} />
              <meshStandardMaterial
                color={isHit ? hitColor : "#334155"}
                roughness={0.5}
                metalness={0.6}
              />
              {/* Little lights on the tips of fins */}
              <mesh position={[0, 0.18, 0.03]}>
                <boxGeometry args={[0.02, 0.02, 0.02]} />
                <meshBasicMaterial color={glowColor} />
              </mesh>
            </mesh>
          );
        })}
      </group>

      {/* --- SCANNING LASER --- */}
      {/* Thin cylinder pointing left towards player */}
      <mesh
        ref={laserRef}
        position={[-2, 0, 0.22]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* --- DATA PARTICLES --- */}
      {/* Floating debris to show antigrav field */}
      <points position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.3, 4, 4]} />
        <pointsMaterial
          size={0.02}
          color={glowColor}
          transparent
          opacity={0.4}
        />
      </points>

      {/* --- DAMAGE SMOKE (If HP Low) --- */}
      {hpPercentage < 0.3 && (
        <mesh position={[0.1, 0.1, 0]}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshBasicMaterial color="#555" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

// --- The Definition ---
export const SENTRY_VARIANTS: Record<string, EnemyDefinition> = {
  alpha: {
    id: "sentry-alpha",
    name: "Sentry Alpha",
    description: "Standard security drone.",
    logicCheck: "Alignment Check",
    tier: "alpha",

    // Stats
    baseHp: 40,
    baseShields: 0,
    baseArmor: 0,
    resistances: {},

    // VISUALS: Directly returning the component
    renderer: (props) => <AlphaSentryVisuals {...props} />,

    // Logic
    ai: {
      initialPhase: "patrol",
      phases: {
        // PHASE 1: Calm, calculated
        patrol: {
          name: "Patrol Mode",
          movement: [createPair("different-row", "align-y", 2)],
          tactical: [createPair("same-row", "shoot", 2)], // Single shot
          transitions: [
            {
              targetPhase: "panic",
              // Switch if HP drops below 50%
              condition: (ctx) => ctx.hp / ctx.maxHp <= 0.5,
            },
          ],
        },

        // PHASE 2: Fast, aggressive, spammy
        panic: {
          name: "Panic Mode",
          movement: [
            createPair("always", "dodge", 2), // Jittery movement
            createPair("enemy-far", "move-forward", 1),
          ],
          tactical: [
            createPair("always", "rapid-fire", 2), // Spray and pray
          ],
          transitions: [], // No going back!
          onEnter: {
            glowColor: "#ff0000", // Eyes turn red
          },
        },
      },
    },
  },
};
