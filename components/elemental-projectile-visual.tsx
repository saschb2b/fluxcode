"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { DamageType } from "@/types/game"

interface ElementalProjectileVisualProps {
  damageType: DamageType
  scale?: number
}

export function ElementalProjectileVisual({ damageType, scale = 0.3 }: ElementalProjectileVisualProps) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.1
      groupRef.current.rotation.z += 0.05
    }
  })

  const getColor = () => {
    switch (damageType) {
      case DamageType.KINETIC:
        return "#94a3b8"
      case DamageType.ENERGY:
        return "#22d3ee"
      case DamageType.THERMAL:
        return "#f97316"
      case DamageType.VIRAL:
        return "#a855f7"
      case DamageType.CORROSIVE:
        return "#84cc16"
      case DamageType.EXPLOSIVE:
        return "#ef4444"
      case DamageType.GLACIAL:
        return "#06b6d4"
      case DamageType.CONCUSSION:
        return "#ff0000" // Placeholder color for Concussion
      default:
        return "#ffff00"
    }
  }

  const color = getColor()

  return (
    <group ref={groupRef} scale={scale}>
      {/* Kinetic - Box projectile */}
      {damageType === DamageType.KINETIC && (
        <>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
          </mesh>
        </>
      )}

      {/* Energy - Octahedron with ring */}
      {damageType === DamageType.ENERGY && (
        <>
          <mesh>
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[1, 0.1, 16, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* Thermal - Layered spheres (fire) */}
      {damageType === DamageType.THERMAL && (
        <>
          <mesh>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.5} />
          </mesh>
        </>
      )}

      {/* Corrosive - Nested toruses */}
      {damageType === DamageType.CORROSIVE && (
        <>
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.8, 0.15, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[1, 0.1, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
          </mesh>
        </>
      )}

      {/* Viral - Central sphere with orbiting particles */}
      {damageType === DamageType.VIRAL && (
        <>
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} rotation={[0, 0, (Math.PI * 2 * i) / 6]} position={[0.9, 0, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
            </mesh>
          ))}
        </>
      )}

      {/* Explosive - Dodecahedron with outer wireframe */}
      {damageType === DamageType.EXPLOSIVE && (
        <>
          <mesh>
            <dodecahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.1, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} wireframe />
          </mesh>
        </>
      )}

      {/* Glacial - Crystal with icicle spikes */}
      {damageType === DamageType.GLACIAL && (
        <>
          <mesh>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh key={i} rotation={[0, (Math.PI * 2 * i) / 8, Math.PI / 4]} position={[0.8, 0, 0]}>
              <coneGeometry args={[0.12, 0.4, 6]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
          ))}
        </>
      )}

      {/* Concussion - Dodecahedron with outer wireframe shockwave */}
      {damageType === DamageType.CONCUSSION && (
        <>
          <mesh>
            <dodecahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.1, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} wireframe />
          </mesh>
        </>
      )}

      <pointLight position={[0, 0, 0]} color={color} intensity={2} distance={3} />
    </group>
  )
}
