"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, Line } from "three";
import { Vector3, BufferAttribute } from "three";
import { DamageType } from "@/types/game";

interface ElementalProjectileVisualProps {
  damageType: DamageType;
  scale?: number;
}

export function ElementalProjectileVisual({
  damageType,
  scale = 0.3,
}: ElementalProjectileVisualProps) {
  const groupRef = useRef<Group>(null);
  const meshesRef = useRef<Mesh[]>([]);
  const positionHistoryRef = useRef<Vector3[]>([]);
  const trailRef = useRef<Line>(null);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    groupRef.current.rotation.y += 0.1;
    groupRef.current.rotation.z += 0.05;

    const meshes = meshesRef.current;

    // Update Energy pulsing
    if (damageType === DamageType.ENERGY && meshes[0]) {
      (meshes[0].material as any).emissiveIntensity =
        Math.sin(elapsed * 3) * 0.5 + 1;
      if (meshes[1])
        (meshes[1].material as any).opacity =
          Math.abs(Math.sin(elapsed * 2.5)) * 0.4 + 0.2;
      if (meshes[2])
        (meshes[2].material as any).opacity =
          Math.abs(Math.sin(elapsed * 2 + 1)) * 0.3 + 0.1;
    }

    // Update Thermal flickering
    if (damageType === DamageType.THERMAL && meshes[0]) {
      (meshes[0].material as any).emissiveIntensity =
        Math.sin(elapsed * 4) * 0.5 + 1.5;
      if (meshes[1])
        (meshes[1].material as any).emissiveIntensity =
          Math.sin(elapsed * 3.5) * 0.5 + 1;
      if (meshes[2])
        (meshes[2].material as any).emissiveIntensity =
          Math.sin(elapsed * 3) * 0.5 + 0.8;
    }

    // Update Corrosive rotating rings
    if (damageType === DamageType.CORROSIVE && meshes[1] && meshes[2]) {
      meshes[1].rotation.x = Math.PI / 4 + elapsed * 0.8;
      meshes[2].rotation.z = Math.PI / 4 + elapsed * 1.1;
    }

    // Update Viral orbiting particles
    if (damageType === DamageType.VIRAL) {
      for (let i = 0; i < 6; i++) {
        const particle = meshes[1 + i];
        if (particle) {
          const orbitAngle = elapsed * 2 + (Math.PI * 2 * i) / 6;
          particle.position.x = Math.cos(orbitAngle) * 0.9;
          particle.position.z = Math.sin(orbitAngle) * 0.9;
          particle.scale.setScalar(Math.sin(elapsed * 3 + i) * 0.2 + 0.95);
        }
      }
    }

    // Update Glacial pulsing spikes
    if (damageType === DamageType.GLACIAL) {
      for (let i = 0; i < 8; i++) {
        const spike = meshes[1 + i];
        if (spike) {
          const pulseScale = Math.sin(elapsed * 2.5 + i) * 0.3 + 1;
          spike.scale.setScalar(pulseScale);
        }
      }
    }

    // Update Concussion pulsing
    if (damageType === DamageType.CONCUSSION && meshes[0] && meshes[1]) {
      (meshes[0].material as any).emissiveIntensity =
        Math.sin(elapsed * 3) * 0.5 + 1;
      meshes[1].scale.setScalar(Math.sin(elapsed * 2.5) * 0.2 + 1.1);
      (meshes[1].material as any).opacity =
        Math.abs(Math.sin(elapsed * 2.5)) * 0.3;
    }

    // Trail for kinetic
    if (damageType === DamageType.KINETIC) {
      const currentPos = groupRef.current.position.clone();
      positionHistoryRef.current.push(currentPos);

      if (positionHistoryRef.current.length > 20) {
        positionHistoryRef.current.shift();
      }

      if (trailRef.current) {
        const positions = new Float32Array(
          positionHistoryRef.current.flatMap((p) => [p.x, p.y, p.z]),
        );
        trailRef.current.geometry.setAttribute(
          "position",
          new BufferAttribute(positions, 3),
        );
        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  const getColor = (): string => {
    const colors: Record<DamageType, string> = {
      [DamageType.KINETIC]: "#94a3b8",
      [DamageType.ENERGY]: "#22d3ee",
      [DamageType.THERMAL]: "#f97316",
      [DamageType.VIRAL]: "#a855f7",
      [DamageType.CORROSIVE]: "#84cc16",
      [DamageType.GLACIAL]: "#06b6d4",
      [DamageType.CONCUSSION]: "#ff0000",
    };
    return colors[damageType] ?? "#ffff00";
  };

  const color = getColor();

  return (
    <group ref={groupRef} scale={scale}>
      {damageType === DamageType.KINETIC && (
        <>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[0] = el;
            }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={color}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[1] = el;
            }}
          >
            <boxGeometry args={[1.15, 1.15, 1.15]} />
            <meshStandardMaterial
              color="#64748b"
              metalness={0.7}
              roughness={0.3}
              transparent
              opacity={0.4}
            />
          </mesh>
          <group>
            {[0, 1, 2, 3].map((i) => {
              const angle = (Math.PI * 2 * i) / 4;
              const x = Math.cos(angle) * 0.7;
              const z = Math.sin(angle) * 0.7;
              return (
                <line key={i} position={[x, 0, z]}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      count={2}
                      array={new Float32Array([0, 0, 0, x * 0.5, 0, z * 0.5])}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial
                    color={color}
                    linewidth={2}
                    transparent
                    opacity={0.6}
                  />
                </line>
              );
            })}
          </group>
          <line ref={trailRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={1}
                array={new Float32Array([0, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={color}
              transparent
              opacity={0.5}
              linewidth={1}
            />
          </line>
          <mesh position={[0, 0, 0.55]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color="#cbd5e1" transparent opacity={0.4} />
          </mesh>
        </>
      )}

      {damageType === DamageType.ENERGY && (
        <>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[0] = el;
            }}
          >
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[1] = el;
            }}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[1, 0.1, 16, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[2] = el;
            }}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[1.1, 0.08, 16, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </mesh>
        </>
      )}

      {damageType === DamageType.THERMAL && (
        <>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[0] = el;
            }}
          >
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[1] = el;
            }}
            position={[0, 0.3, 0]}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh
            ref={(el) => {
              if (el) meshesRef.current[2] = el;
            }}
            position={[0, 0.5, 0]}
          >
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.5}
            />
          </mesh>
        </>
      )}

      {damageType === DamageType.CORROSIVE && (
        <>
          <mesh ref={(el) => (meshesRef.current[0] = el!)}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh ref={(el) => (meshesRef.current[1] = el!)}>
            <torusGeometry args={[0.8, 0.15, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh ref={(el) => (meshesRef.current[2] = el!)}>
            <torusGeometry args={[1, 0.1, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
            />
          </mesh>
        </>
      )}

      {damageType === DamageType.VIRAL && (
        <>
          <mesh ref={(el) => (meshesRef.current[0] = el!)}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
            />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              ref={(el) => {
                if (el) meshesRef.current[1 + i] = el;
              }}
              rotation={[0, 0, (Math.PI * 2 * i) / 6]}
            >
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.7}
              />
            </mesh>
          ))}
        </>
      )}

      {damageType === DamageType.GLACIAL && (
        <>
          <mesh ref={(el) => (meshesRef.current[0] = el!)}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
            />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh
              key={i}
              ref={(el) => {
                if (el) meshesRef.current[1 + i] = el;
              }}
              rotation={[0, (Math.PI * 2 * i) / 8, Math.PI / 4]}
              position={[0.8, 0, 0]}
            >
              <coneGeometry args={[0.12, 0.4, 6]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </>
      )}

      {damageType === DamageType.CONCUSSION && (
        <>
          <mesh ref={(el) => (meshesRef.current[0] = el!)}>
            <dodecahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
            />
          </mesh>
          <mesh ref={(el) => (meshesRef.current[1] = el!)}>
            <icosahedronGeometry args={[1.1, 0]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        </>
      )}

      <pointLight
        position={[0, 0, 0]}
        color={color}
        intensity={2}
        distance={3}
      />
    </group>
  );
}
