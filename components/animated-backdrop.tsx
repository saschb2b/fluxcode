"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"

export function AnimatedBackdrop() {
  const gridRef = useRef<Group>(null)
  const particlesRef = useRef<Mesh>(null)
  const ringsRef = useRef<Group>(null)

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.z = state.clock.elapsedTime * 0.05
      gridRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.5 - 2
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.05
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.2
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.15
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      ringsRef.current.scale.set(scale, scale, scale)
    }
  })

  const particleCount = 100
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5
  }

  return (
    <>
      <group ref={gridRef} position={[0, 0, -2]}>
        <gridHelper args={[20, 20, "#06b6d4", "#06b6d4"]} rotation={[Math.PI / 2, 0, 0]} />
        <gridHelper
          args={[20, 20, "#ec4899", "#ec4899"]}
          rotation={[Math.PI / 2, 0, Math.PI / 4]}
          position={[0, 0, -0.5]}
        />
      </group>

      <points ref={particlesRef} position={[0, 0, -3]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#06b6d4" transparent opacity={0.6} sizeAttenuation />
      </points>

      <group ref={ringsRef} position={[0, 0, -4]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[2, 0.05, 16, 100]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.5, 0.05, 16, 100]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[3, 0.05, 16, 100]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} transparent opacity={0.3} />
        </mesh>
      </group>

      <mesh position={[-3, 2, -3]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} transparent opacity={0.2} />
      </mesh>
      <mesh position={[3, -2, -3]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} transparent opacity={0.2} />
      </mesh>
    </>
  )
}
