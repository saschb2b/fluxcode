"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DamageType } from "@/types/game";
import { GEOMETRIES, MATERIALS } from "@/components/bullets/bulleta-assets"; // Import the file above
import { Trail } from "@react-three/drei";

interface ElementalProjectileVisualProps {
  damageType: DamageType;
  scale?: number;
}

export function ElementalProjectileVisual({
  damageType,
  scale = 0.3,
}: ElementalProjectileVisualProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    // Rotate Group
    groupRef.current.rotation.y += 0.1;
    groupRef.current.rotation.z += 0.05;

    // --- ANIMATION LOGIC (Simplified for brevity) ---
    // Note: Mutating shared materials (like emissiveIntensity) affects ALL bullets of that type.
    // If you need unique pulsing per bullet, you must clone the material in a useMemo.
    // For now, assuming synchronized pulsing is acceptable for performance.

    // Example: Viral orbiting particles
    if (damageType === DamageType.VIRAL) {
      for (let i = 0; i < 6; i++) {
        const particle = meshesRef.current[1 + i];
        if (particle) {
          const orbitAngle = elapsed * 2 + (Math.PI * 2 * i) / 6;
          particle.position.set(
            Math.cos(orbitAngle) * 0.9,
            0,
            Math.sin(orbitAngle) * 0.9,
          );
          const s = Math.sin(elapsed * 3 + i) * 0.2 + 0.95;
          particle.scale.setScalar(s);
        }
      }
    }
  });

  // Helper to attach meshes to ref array
  const setRef = (index: number) => (el: THREE.Mesh | null) => {
    if (el) meshesRef.current[index] = el;
  };

  return (
    <group ref={groupRef} scale={scale}>
      {/* ---------------- KINETIC ---------------- */}
      {damageType === DamageType.KINETIC && (
        <Trail width={1} length={4} color="#94a3b8" attenuation={(t) => t * t}>
          <mesh
            ref={setRef(0)}
            geometry={GEOMETRIES.box}
            material={MATERIALS.kineticMain}
          />
          <mesh
            ref={setRef(1)}
            geometry={GEOMETRIES.boxLarge}
            material={MATERIALS.kineticGlow}
          />
        </Trail>
      )}

      {/* ---------------- ENERGY (Plasma) ---------------- */}
      {damageType === DamageType.ENERGY && (
        // Shorter, brighter trail for plasma
        <Trail width={1.5} length={3} color="#22d3ee" attenuation={(t) => t}>
          {/* Core */}
          <mesh
            ref={setRef(0)}
            geometry={GEOMETRIES.octahedron}
            material={MATERIALS.energyMain}
          />
          {/* Rings */}
          <mesh
            ref={setRef(1)}
            geometry={GEOMETRIES.torusMain}
            material={MATERIALS.energyRing}
            scale={0.8}
          />
          <mesh
            ref={setRef(2)}
            geometry={GEOMETRIES.torusThin}
            material={MATERIALS.energyRing}
          />
        </Trail>
      )}

      {/* ---------------- THERMAL ---------------- */}
      {damageType === DamageType.THERMAL && (
        <>
          <mesh
            ref={setRef(0)}
            geometry={GEOMETRIES.sphere}
            material={MATERIALS.thermalMain}
          />
          <mesh
            ref={setRef(1)}
            position={[0, 0.3, 0]}
            scale={0.6}
            geometry={GEOMETRIES.sphere}
            material={MATERIALS.thermalCore}
          />
        </>
      )}

      {/* ---------------- VIRAL ---------------- */}
      {damageType === DamageType.VIRAL && (
        <>
          {/* Main Virus Body */}
          <mesh
            ref={setRef(0)}
            geometry={GEOMETRIES.sphere}
            material={MATERIALS.viralCore}
          />
          {/* Orbiting Particles */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              ref={setRef(1 + i)}
              geometry={GEOMETRIES.sphereTiny}
              material={MATERIALS.viralParticle}
            />
          ))}
        </>
      )}

      {/* ---------------- CORROSIVE ---------------- */}
      {damageType === DamageType.CORROSIVE && (
        <>
          {/* Acid Core */}
          <mesh
            ref={setRef(0)}
            geometry={GEOMETRIES.sphere}
            material={MATERIALS.corrosiveCore}
          />
          {/* Bubbling Rings */}
          <mesh
            ref={setRef(1)}
            geometry={GEOMETRIES.torusFat}
            material={MATERIALS.corrosiveShell}
            scale={0.9}
          />
        </>
      )}

      {/* ---------------- GLACIAL ---------------- */}
      {damageType === DamageType.GLACIAL && (
        <>
          {/* Ice Core */}
          <mesh
            ref={setRef(0)}
            geometry={GEOMETRIES.octahedron}
            material={MATERIALS.glacialCore}
          />
          {/* Spikes expanding from center */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            // Calculate initial rotation for spikes to point outward
            const rotX = Math.random() * Math.PI;
            const rotY = (Math.PI * 2 * i) / 8;
            return (
              <mesh
                key={i}
                ref={setRef(1 + i)}
                geometry={GEOMETRIES.coneSpike}
                material={MATERIALS.glacialSpike}
                rotation={[rotX, rotY, 0]}
                position={[0.6, 0, 0]} // Position will be overridden by animation
              />
            );
          })}
        </>
      )}

      {/* ---------------- CONCUSSION ---------------- */}
      {damageType === DamageType.CONCUSSION && (
        <>
          {/* Heavy Weight */}
          <mesh
            ref={setRef(0)}
            geometry={GEOMETRIES.dodecahedron}
            material={MATERIALS.concussionCore}
          />
          {/* Shockwave Cage */}
          <mesh
            ref={setRef(1)}
            geometry={GEOMETRIES.icosahedron}
            material={MATERIALS.concussionWave}
          />
        </>
      )}

      {/* Dynamic Lighting based on damage type */}
      <pointLight
        position={[0, 0, 0]}
        color={
          MATERIALS[
            (damageType.toLowerCase() + "Main") as keyof typeof MATERIALS
          ]?.color || "white"
        }
        intensity={2}
        distance={3}
        decay={2}
      />
    </group>
  );
}
