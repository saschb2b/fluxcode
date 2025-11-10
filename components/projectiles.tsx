"use client"

import { useRef } from "react"
import type { Group } from "three"
import type { Projectile } from "@/types/game"
import { ElementalProjectileVisual } from "./elemental-projectile-visual"
import { DamageType } from "@/types/game"

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
  const groupRef = useRef<Group>(null)

  const worldPos = [(projectile.position.x - 2.5) * 1.1, 0.6, (projectile.position.y - 1) * 1.1] as [
    number,
    number,
    number,
  ]

  const damageType = projectile.damageType || DamageType.KINETIC

  return (
    <group ref={groupRef} position={worldPos}>
      <ElementalProjectileVisual damageType={damageType} scale={0.2} />
    </group>
  )
}
