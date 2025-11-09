"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import { StarField, FloatingGeometry, CircuitLayer, DataStreams, AmbientParticles } from "./cyberpunk-background"
import { CustomizableFighter } from "./customizable-fighter"
import type { FighterCustomization } from "@/lib/fighter-parts"

interface Hub3DSceneProps {
  fighterCustomization: FighterCustomization
  hasCharacter: boolean
}

export function Hub3DScene({ fighterCustomization, hasCharacter }: Hub3DSceneProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />

        {/* Ambient lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#ff00ff" />

        <Suspense fallback={null}>
          {/* Background elements */}
          <StarField />
          <FloatingGeometry />
          <CircuitLayer />
          <DataStreams />
          <AmbientParticles />

          {hasCharacter && (
            <group position={[0, 0, 0]}>
              <CustomizableFighter
                position={{ x: 2.5, y: 1 }}
                isPlayer={true}
                hp={100}
                maxHp={100}
                customization={fighterCustomization}
              />

              {/* Holographic platform under fighter */}
              <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 2, 32]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
              </mesh>

              {/* Rotating ring around fighter */}
              <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                <torusGeometry args={[2.5, 0.05, 16, 100]} />
                <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
              </mesh>
            </group>
          )}
        </Suspense>

        {/* Subtle camera controls - disabled on mobile for performance */}
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
