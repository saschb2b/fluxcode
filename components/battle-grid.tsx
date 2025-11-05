"use client"

import { useRef } from "react"
import type { Mesh } from "three"
import * as THREE from "three"

export function BattleGrid() {
  const gridRef = useRef<Mesh>(null)

  // 6x3 grid: 3x3 blue (player) on left, 3x3 red (enemy) on right
  const tiles = []

  for (let x = 0; x < 6; x++) {
    for (let z = 0; z < 3; z++) {
      const isPlayerSide = x < 3
      const color = isPlayerSide ? "#3b82f6" : "#ef4444"
      const posX = (x - 2.5) * 1.1
      const posZ = (z - 1) * 1.1

      tiles.push(
        <mesh key={`${x}-${z}`} position={[posX, 0, posZ]} receiveShadow>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color={color} opacity={0.6} transparent emissive={color} emissiveIntensity={0.3} />
        </mesh>,
      )

      // Grid lines
      tiles.push(
        <lineSegments key={`line-${x}-${z}`} position={[posX, 0.06, posZ]}>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 0.1, 1)]} />
          <lineBasicMaterial color="#00ffff" opacity={0.8} transparent />
        </lineSegments>,
      )
    }
  }

  return (
    <group>
      {tiles}

      {/* Center divider line */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 3.5]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1} />
      </mesh>
    </group>
  )
}
