"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"
import type { FighterCustomization } from "@/lib/fighter-parts"

interface Fighter3DProps {
  customization: FighterCustomization
  isPlayer: boolean
}

export function Fighter3D({ customization, isPlayer }: Fighter3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      // Slow rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const primaryColor = customization.primaryColor
  const secondaryColor = customization.secondaryColor

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.5, 0.5]} />
        <meshStandardMaterial color={primaryColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Visor/Eyes - Changed from meshBasicMaterial to meshStandardMaterial to support emissive */}
      <mesh position={[0, 1.1, 0.31]}>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.65, 0.2, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color={primaryColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.65, 0.2, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color={primaryColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, -1.2, 0]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.3, -1.2, 0]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Glowing core - Changed from meshBasicMaterial to meshStandardMaterial to support emissive */}
      <mesh position={[0, 0.3, 0.26]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Energy field effect - Removed emissive properties from meshBasicMaterial */}
      <mesh position={[0, 0, 0]} scale={1.2}>
        <boxGeometry args={[1.2, 1.8, 0.6]} />
        <meshBasicMaterial color={primaryColor} transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  )
}
