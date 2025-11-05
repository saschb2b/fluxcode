"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"
import { Html } from "@react-three/drei"
import type { Position } from "@/types/game"
import type { FighterCustomization, FighterPart } from "@/lib/fighter-parts"

interface CustomizableFighterProps {
  position: Position
  isPlayer: boolean
  hp: number
  maxHp: number
  customization?: FighterCustomization
}

function PartMesh({ part, color }: { part: FighterPart; color: string }) {
  const geometry = useMemo(() => {
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
  }, [part.shape, part.scale])

  return (
    <mesh position={part.position} rotation={part.rotation} castShadow>
      {geometry}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  )
}

export function CustomizableFighter({ position, isPlayer, hp, maxHp, customization }: CustomizableFighterProps) {
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<Group>(null)
  const currentPosRef = useRef<[number, number, number]>([0, 0.6, 0])
  const targetPosRef = useRef<[number, number, number]>([0, 0.6, 0])
  const velocityRef = useRef<[number, number, number]>([0, 0, 0])

  const targetWorldPos = useMemo(() => {
    const x = (position.x - 2.5) * 1.1
    const z = (position.y - 1) * 1.1
    return [x, 0.6, z] as [number, number, number]
  }, [position.x, position.y])

  useEffect(() => {
    targetPosRef.current = targetWorldPos
  }, [targetWorldPos])

  useEffect(() => {
    currentPosRef.current = targetWorldPos
    velocityRef.current = [0, 0, 0]
    if (groupRef.current) {
      groupRef.current.position.set(...targetWorldPos)
      groupRef.current.rotation.z = 0
      groupRef.current.rotation.x = 0
    }
  }, [targetWorldPos])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const current = currentPosRef.current
    const target = targetPosRef.current
    const velocity = velocityRef.current

    const dx = target[0] - current[0]
    const dz = target[2] - current[2]
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance > 0.01) {
      const speed = 8
      const damping = 0.85

      velocity[0] += dx * speed * delta
      velocity[2] += dz * speed * delta

      velocity[0] *= damping
      velocity[2] *= damping

      current[0] += velocity[0] * delta
      current[2] += velocity[2] * delta

      groupRef.current.position.set(current[0], current[1], current[2])

      const tiltAmount = Math.min(distance * 0.3, 0.3)
      groupRef.current.rotation.z = -velocity[0] * tiltAmount
      groupRef.current.rotation.x = velocity[2] * tiltAmount
    } else {
      current[0] = target[0]
      current[2] = target[2]
      velocity[0] = 0
      velocity[2] = 0
      groupRef.current.position.set(current[0], current[1], current[2])
      groupRef.current.rotation.z = 0
      groupRef.current.rotation.x = 0
    }

    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  const defaultColor = isPlayer ? "#3b82f6" : "#ef4444"
  const primaryColor = customization?.primaryColor || defaultColor
  const secondaryColor = customization?.secondaryColor || defaultColor
  const hpPercent = (hp / maxHp) * 100

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        {/* Body */}
        {customization?.body && <PartMesh part={customization.body} color={primaryColor} />}

        {/* Head */}
        {customization?.head && <PartMesh part={customization.head} color={primaryColor} />}

        {/* Left Arm */}
        {customization?.leftArm && (
          <PartMesh
            part={{
              ...customization.leftArm,
              position: [-0.45, -0.1, 0] as [number, number, number],
            }}
            color={secondaryColor}
          />
        )}

        {/* Right Arm */}
        {customization?.rightArm && (
          <PartMesh
            part={{
              ...customization.rightArm,
              position: [0.45, -0.1, 0] as [number, number, number],
            }}
            color={secondaryColor}
          />
        )}

        {/* Accessory */}
        {customization?.accessory && customization.accessory.id !== "none" && (
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

      {/* HP Bar */}
      <Html position={[0, 1.5, 0]} center zIndexRange={[0, 0]}>
        <div className="flex flex-col items-center gap-1 pointer-events-none">
          <div className="text-xs font-bold text-foreground px-2 py-0.5 bg-card/80 rounded border border-border">
            {isPlayer ? "PLAYER" : "ENEMY"}
          </div>
          <div className="w-20 h-2 bg-muted rounded-sm border border-border overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${hpPercent}%`,
                backgroundColor: hpPercent > 50 ? "#22c55e" : hpPercent > 25 ? "#eab308" : "#ef4444",
              }}
            />
          </div>
          <div className="text-xs font-mono text-foreground">
            {hp}/{maxHp}
          </div>
        </div>
      </Html>
    </group>
  )
}
