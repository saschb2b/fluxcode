"use client"

import { useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Group } from "three"

interface EnemyDefeatEffectProps {
  position: [number, number, number]
  onComplete: () => void
}

export function EnemyDefeatEffect({ position, onComplete }: EnemyDefeatEffectProps) {
  const groupRef = useRef<Group>(null)
  const [progress, setProgress] = useState(0)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    setProgress((prev) => {
      const newProgress = prev + delta * 2 // 0.5 second animation
      if (newProgress >= 1) {
        onComplete()
        return 1
      }
      return newProgress
    })

    // Glitch effect: random position jitter
    if (progress < 0.8) {
      const jitterAmount = progress * 0.3
      groupRef.current.position.x = position[0] + (Math.random() - 0.5) * jitterAmount
      groupRef.current.position.y = position[1] + (Math.random() - 0.5) * jitterAmount
      groupRef.current.position.z = position[2] + (Math.random() - 0.5) * jitterAmount
    }

    // Scale down and fade out
    const scale = 1 - progress
    groupRef.current.scale.set(scale, scale, scale)

    // Spin out of existence
    groupRef.current.rotation.y = progress * Math.PI * 4
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Data corruption particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = progress * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return (
          <mesh key={i} position={[x, Math.random() * progress, z]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={3}
              opacity={1 - progress}
              transparent
            />
          </mesh>
        )
      })}

      {/* Central glitch sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={5}
          opacity={(1 - progress) * 0.5}
          transparent
          wireframe
        />
      </mesh>

      {/* Expanding ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[progress * 1.5, 0.05, 8, 16]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={4}
          opacity={1 - progress}
          transparent
        />
      </mesh>

      {/* Pulsing light */}
      <pointLight intensity={10 * (1 - progress)} distance={5} color="#00ffff" decay={2} />
    </group>
  )
}
