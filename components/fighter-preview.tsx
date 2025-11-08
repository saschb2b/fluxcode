"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"
import type { FighterCustomization, FighterPart } from "@/lib/fighter-parts"

interface FighterPreviewProps {
  customization: FighterCustomization
  autoRotate?: boolean
}

function PartMesh({ part, color }: { part: FighterPart; color: string }) {
  const geometry = (() => {
    switch (part.shape) {
      case "cube":
        return <boxGeometry args={part.scale} />
      case "sphere":
        return <sphereGeometry args={[part.scale[0], 16, 16]} />
      case "cylinder":
        return <cylinderGeometry args={[part.scale[0], part.scale[0], part.scale[1], 16]} />
      case "cone":
        return <coneGeometry args={[part.scale[0], part.scale[1], 16]} />
      case "pyramid":
        return <coneGeometry args={[part.scale[0], part.scale[1], 4]} />
      case "torus":
        return <torusGeometry args={[part.scale[0], part.scale[2], 16, 32]} />
      default:
        return <boxGeometry args={part.scale} />
    }
  })()

  return (
    <mesh position={part.position} rotation={part.rotation} castShadow>
      {geometry}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  )
}

export function FighterPreview({ customization, autoRotate = false }: FighterPreviewProps) {
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  const primaryColor = customization.primaryColor
  const secondaryColor = customization.secondaryColor

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={meshRef}>
        {/* Core (Head - AI Processor) */}
        {customization.head && <PartMesh part={customization.head} color={primaryColor} />}

        {/* Chassis (Body Structure) */}
        {customization.body && <PartMesh part={customization.body} color={primaryColor} />}

        {/* Hull (Outer Armor) - rendered slightly larger than chassis */}
        {customization.chassis && (
          <PartMesh
            part={{
              ...customization.chassis,
              scale: [
                customization.chassis.scale[0] * 1.08,
                customization.chassis.scale[1] * 1.05,
                customization.chassis.scale[2] * 1.08,
              ] as [number, number, number],
            }}
            color={secondaryColor}
          />
        )}

        {/* Modules (Left Arm - System Modules) */}
        {customization.leftArm && (
          <PartMesh
            part={{
              ...customization.leftArm,
              position: [-0.45, -0.1, 0] as [number, number, number],
            }}
            color={secondaryColor}
          />
        )}

        {/* Weapon (Right Arm - Weapon Systems) */}
        {customization.rightArm && (
          <PartMesh
            part={{
              ...customization.rightArm,
              position: [0.45, -0.1, 0] as [number, number, number],
            }}
            color={secondaryColor}
          />
        )}

        {/* Array (Accessory - Sensor Array) */}
        {customization.accessory && customization.accessory.id !== "none" && (
          <PartMesh part={customization.accessory} color={secondaryColor} />
        )}

        {/* Eyes */}
        <mesh position={[0.1, 0.85, 0.21]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.1, 0.85, 0.21]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  )
}
