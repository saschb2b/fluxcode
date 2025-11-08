"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { BattleGrid } from "./battle-grid"
import { CustomizableFighter } from "./customizable-fighter"
import { Projectiles } from "./projectiles"
import { FloatingGeometry, CircuitLayer, DataStreams, StarField, AmbientParticles } from "./cyberpunk-background"
import { GlitchOverlay } from "./glitch-effect"
import type { GameState } from "@/types/game"
import type { FighterCustomization } from "@/lib/fighter-parts"

interface BattleArenaProps {
  gameState: GameState
  fighterCustomization?: FighterCustomization
  enemyCustomization?: FighterCustomization
}

export function BattleArena({ gameState, fighterCustomization, enemyCustomization }: BattleArenaProps) {
  return (
    <>
      <Canvas shadows className="crt-effect">
        <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, 0, 0]}
        />

        <color attach="background" args={["#0a0015"]} />
        <fog attach="fog" args={["#0a0015", 20, 60]} />

        {/* Background layers (furthest to nearest) */}
        <StarField />
        <FloatingGeometry />
        <CircuitLayer />
        <DataStreams />
        <AmbientParticles />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00ffff" />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#ff00ff" />

        {/* Battle Grid */}
        <BattleGrid />

        {/* Player Fighter */}
        <CustomizableFighter
          position={gameState.player.position}
          isPlayer={true}
          hp={gameState.player.hp}
          maxHp={gameState.player.maxHp}
          customization={fighterCustomization}
        />

        {/* Enemy Fighter */}
        <CustomizableFighter
          position={gameState.enemy.position}
          isPlayer={false}
          hp={gameState.enemy.hp}
          maxHp={gameState.enemy.maxHp}
          customization={enemyCustomization}
          shields={gameState.enemy.shields}
          maxShields={gameState.enemy.maxShields}
          armor={gameState.enemy.armor}
          maxArmor={gameState.enemy.maxArmor}
        />

        {/* Projectiles */}
        <Projectiles projectiles={gameState.projectiles} />
      </Canvas>

      <GlitchOverlay />
    </>
  )
}
