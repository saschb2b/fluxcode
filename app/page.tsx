"use client"

import { useState } from "react"
import { BattleArena } from "@/components/battle-arena"
import { GameUI } from "@/components/game-ui"
import { StartScreen } from "@/components/start-screen"
import { CharacterSelection } from "@/components/character-selection"
import { useGameState } from "@/hooks/use-game-state"
import type { CharacterPreset } from "@/lib/character-presets"

export default function Home() {
  const gameState = useGameState()
  const [gamePhase, setGamePhase] = useState<"start" | "character-select" | "game">("start")

  const handleStartGame = () => {
    setGamePhase("character-select")
  }

  const handleCharacterSelect = (character: CharacterPreset) => {
    gameState.setCharacter(character)
    setGamePhase("game")
  }

  const handleBackToStart = () => {
    setGamePhase("start")
  }

  const handleNewRun = () => {
    gameState.resetGame()
    setGamePhase("character-select")
  }

  if (gamePhase === "start") {
    return (
      <main className="relative w-full h-screen overflow-hidden bg-background">
        <StartScreen onStart={handleStartGame} />
      </main>
    )
  }

  if (gamePhase === "character-select") {
    return (
      <main className="relative w-full h-screen overflow-hidden bg-background">
        <CharacterSelection onSelect={handleCharacterSelect} onBack={handleBackToStart} />
      </main>
    )
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      <div className="crt-effect absolute inset-0" />

      {/* Battle Arena - 3D View */}
      <div className="absolute inset-0">
        <BattleArena gameState={gameState} />
      </div>

      {/* Game UI Overlay */}
      <GameUI gameState={gameState} onNewRun={handleNewRun} />

      {/* Background Music */}
      <audio
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/game-8-bit-328398-9kEG5aaHJG70UWkJIYtqB6V9bDC5Bu.mp3"
        autoPlay
        loop
        className="hidden"
      />
    </main>
  )
}
