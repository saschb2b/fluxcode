"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"
import { Html } from "@react-three/drei"
import type { Position } from "@/types/game"

interface FighterProps {
  position: Position
  isPlayer: boolean
  hp: number
  maxHp: number
}

export function Fighter({ position, isPlayer, hp, maxHp }: FighterProps) {
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<Group>(null)
  const currentPosRef = useRef<[number, number, number]>([0, 0.6, 0])
  const targetPosRef = useRef<[number, number, number]>([0, 0.6, 0])
  const velocityRef = useRef<[number, number, number]>([0, 0, 0])

  // Convert grid position to world position
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

    // Calculate distance to target
    const dx = target[0] - current[0]
    const dz = target[2] - current[2]
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance > 0.01) {
      // Apply smooth easing with acceleration/deceleration
      const speed = 8 // Movement speed
      const damping = 0.85 // Velocity damping for smooth stop

      // Accelerate towards target
      velocity[0] += dx * speed * delta
      velocity[2] += dz * speed * delta

      // Apply damping
      velocity[0] *= damping
      velocity[2] *= damping

      // Update position
      current[0] += velocity[0] * delta
      current[2] += velocity[2] * delta

      groupRef.current.position.set(current[0], current[1], current[2])

      // Add slight tilt in movement direction for swoosh effect
      const tiltAmount = Math.min(distance * 0.3, 0.3)
      groupRef.current.rotation.z = -velocity[0] * tiltAmount
      groupRef.current.rotation.x = velocity[2] * tiltAmount
    } else {
      // Snap to target and reset rotation
      current[0] = target[0]
      current[2] = target[2]
      velocity[0] = 0
      velocity[2] = 0
      groupRef.current.position.set(current[0], current[1], current[2])
      groupRef.current.rotation.z = 0
      groupRef.current.rotation.x = 0
    }

    // Idle bobbing animation
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  const color = isPlayer ? "#3b82f6" : "#ef4444"
  const hpPercent = (hp / maxHp) * 100

  return (
    <group ref={groupRef}>
      {/* Fighter body - pixelated cube */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>

      {/* Fighter head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.1, 0.85, 0.21]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.1, 0.85, 0.21]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>

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
