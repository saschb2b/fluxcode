"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh } from "three"
import type { Projectile } from "@/types/game"

interface ProjectilesProps {
  projectiles: Projectile[]
}

export function Projectiles({ projectiles }: ProjectilesProps) {
  return (
    <group>
      {projectiles.map((projectile) => (
        <ProjectileEntity key={projectile.id} projectile={projectile} />
      ))}
    </group>
  )
}

function ProjectileEntity({ projectile }: { projectile: Projectile }) {
  const meshRef = useRef<Mesh>(null)

  const worldPos = [(projectile.position.x - 2.5) * 1.1, 0.6, (projectile.position.y - 1) * 1.1] as [
    number,
    number,
    number,
  ]

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={worldPos}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
    </mesh>
  )
}
