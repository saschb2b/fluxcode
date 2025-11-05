"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

// Floating geometric data structures in the background
export function FloatingGeometry() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.00005
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.03
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -30]}>
      {/* Large transparent cubes */}
      <mesh position={[-15, 5, -10]} rotation={[0.3, 0.3, 0]}>
        <boxGeometry args={[8, 8, 8]} />
        <meshBasicMaterial color="#4400ff" transparent opacity={0.1} wireframe />
      </mesh>

      <mesh position={[12, -3, -15]} rotation={[0.5, 0.2, 0.3]}>
        <octahedronGeometry args={[6]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.08} wireframe />
      </mesh>

      <mesh position={[0, 8, -20]} rotation={[0.2, 0.8, 0]}>
        <tetrahedronGeometry args={[5]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.12} wireframe />
      </mesh>

      <mesh position={[-10, -5, -25]} rotation={[0.1, 0.4, 0.2]}>
        <icosahedronGeometry args={[7]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.09} wireframe />
      </mesh>
    </group>
  )
}

// Circuit board pattern layer
export function CircuitLayer() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={[0, -2, -15]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 60, 20, 20]} />
      <meshBasicMaterial color="#1a0033" transparent opacity={0.3} wireframe />
    </mesh>
  )
}

// Data stream lines
export function DataStreams() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y = ((state.clock.elapsedTime * 0.5 + i * 3) % 30) - 15
      })
    }
  })

  const streams = Array.from({ length: 12 }, (_, i) => ({
    x: (i % 4) * 8 - 12,
    z: Math.floor(i / 4) * -10 - 10,
    color: i % 3 === 0 ? "#00ffff" : i % 3 === 1 ? "#ff00ff" : "#00ff00",
  }))

  return (
    <group ref={groupRef}>
      {streams.map((stream, i) => (
        <mesh key={i} position={[stream.x, 0, stream.z]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshBasicMaterial color={stream.color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Star field background
export function StarField() {
  const pointsRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.00003
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.01
    }
  })

  const particleCount = 500
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50

    // Random neon colors
    const colorChoice = Math.random()
    if (colorChoice < 0.33) {
      colors[i * 3] = 0
      colors[i * 3 + 1] = 1
      colors[i * 3 + 2] = 1
    } else if (colorChoice < 0.66) {
      colors[i * 3] = 1
      colors[i * 3 + 1] = 0
      colors[i * 3 + 2] = 1
    } else {
      colors[i * 3] = 0
      colors[i * 3 + 1] = 1
      colors[i * 3 + 2] = 0.5
    }
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.8} />
    </points>
  )
}

// Ambient floating particles
export function AmbientParticles() {
  const groupRef = useRef<THREE.Group>(null)

  // Store initial positions for each particle
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
        size: Math.random() * 0.3 + 0.1,
        shape: Math.floor(Math.random() * 3),
        color: ["#00ffff", "#ff00ff", "#00ff00"][Math.floor(Math.random() * 3)],
        // Random phase offsets for varied motion
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        // Random amplitude for varied float distances
        amplitudeX: Math.random() * 0.5 + 0.3,
        amplitudeY: Math.random() * 0.5 + 0.3,
      })),
    [],
  )

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const particle = particles[i]
        // Gentle floating motion around initial position
        const offsetX = Math.sin(state.clock.elapsedTime * 0.15 + particle.phaseX) * particle.amplitudeX
        const offsetY = Math.cos(state.clock.elapsedTime * 0.12 + particle.phaseY) * particle.amplitudeY

        child.position.x = particle.x + offsetX
        child.position.y = particle.y + offsetY
        // Very slow rotation for subtle movement
        child.rotation.z = state.clock.elapsedTime * 0.1 + i
      })
    }
  })

  return (
    <group ref={groupRef}>
      {particles.map((particle, i) => (
        <mesh
          key={i}
          position={[particle.x, particle.y, particle.z]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          {particle.shape === 0 && <boxGeometry args={[particle.size, particle.size, particle.size]} />}
          {particle.shape === 1 && <tetrahedronGeometry args={[particle.size]} />}
          {particle.shape === 2 && <octahedronGeometry args={[particle.size]} />}
          <meshBasicMaterial color={particle.color} transparent opacity={0.4} wireframe />
        </mesh>
      ))}
    </group>
  )
}
