"use client"

import { useState, useEffect, useRef } from "react"
import { BattleArena } from "@/components/battle-arena"
import { GameUI } from "@/components/game-ui"
import { StartScreen } from "@/components/start-screen"
import { CharacterSelection } from "@/components/character-selection"
import { FighterCustomization } from "@/components/fighter-customization"
import { useGameState } from "@/hooks/use-game-state"
import type { CharacterPreset } from "@/lib/character-presets"
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts"

export default function Home() {
  const gameState = useGameState()
  const [gamePhase, setGamePhase] = useState<"start" | "character-select" | "customize" | "game">("start")
  const [fighterCustomization, setFighterCustomization] = useState<FighterCustomizationType | undefined>(undefined)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/game-8-bit-328398-9kEG5aaHJG70UWkJIYtqB6V9bDC5Bu.mp3",
      )
      audioRef.current.loop = true
      audioRef.current.volume = 0.5

      audioRef.current.play().catch((error) => {
        console.log("[v0] Audio autoplay blocked, will play on user interaction:", error)
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleStartGame = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.error)
    }
    setGamePhase("character-select")
  }

  const handleCharacterSelect = (character: CharacterPreset) => {
    gameState.setCharacter(character)
    setGamePhase("customize")
  }

  const handleCustomizationConfirm = (customization: FighterCustomizationType) => {
    setFighterCustomization(customization)
    setGamePhase("game")
  }

  const handleBackToStart = () => {
    setGamePhase("start")
  }

  const handleBackToCharacterSelect = () => {
    setGamePhase("character-select")
  }

  const handleNewRun = () => {
    gameState.resetGame()
    setFighterCustomization(undefined)
    setGamePhase("character-select")
  }

  return (
    <>
      {gamePhase === "start" && (
        <main className="relative w-full h-screen overflow-hidden bg-background">
          <StartScreen onStart={handleStartGame} />
        </main>
      )}

      {gamePhase === "character-select" && (
        <main className="relative w-full h-screen overflow-hidden bg-background">
          <CharacterSelection onSelect={handleCharacterSelect} onBack={handleBackToStart} />
        </main>
      )}

      {gamePhase === "customize" && (
        <main className="relative w-full h-screen overflow-hidden bg-background">
          <FighterCustomization onConfirm={handleCustomizationConfirm} onBack={handleBackToCharacterSelect} />
        </main>
      )}

      {gamePhase === "game" && (
        <main className="relative w-full h-screen overflow-hidden bg-background">
          <div className="crt-effect absolute inset-0" />

          <div className="absolute inset-0">
            <BattleArena
              gameState={gameState}
              fighterCustomization={fighterCustomization}
              enemyCustomization={gameState.enemyCustomization}
            />
          </div>

          <GameUI gameState={gameState} onNewRun={handleNewRun} />
        </main>
      )}
    </>
  )
}
