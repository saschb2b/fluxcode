"use client"

import { useState, useEffect, useRef } from "react"
import { BattleArena } from "@/components/battle-arena"
import { GameUI } from "@/components/game-ui"
import { StartScreen } from "@/components/start-screen"
import { Hub } from "@/components/hub"
import { CharacterSelection } from "@/components/character-selection"
import { FighterCustomization } from "@/components/fighter-customization"
import { MetaShop } from "@/components/meta-shop"
import { Codex } from "@/components/codex"
import { useGameState } from "@/hooks/use-game-state"
import { DEFAULT_CUSTOMIZATION } from "@/lib/fighter-parts"
import { CHARACTER_PRESETS } from "@/lib/character-presets"
import type { CharacterPreset } from "@/lib/character-presets"
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts"

export default function Home() {
  const gameState = useGameState()
  const [gamePhase, setGamePhase] = useState<"start" | "hub" | "character-select" | "game">("start")
  const [fighterCustomization, setFighterCustomization] = useState<FighterCustomizationType>(DEFAULT_CUSTOMIZATION)
  const [showCustomization, setShowCustomization] = useState(false)
  const [showMetaShop, setShowMetaShop] = useState(false)
  const [showCodex, setShowCodex] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (gamePhase === "hub" && !gameState.selectedCharacter && gameState.playerProgress.selectedCharacterId) {
      const persistedCharacter = CHARACTER_PRESETS.find(
        (char) => char.id === gameState.playerProgress.selectedCharacterId,
      )
      if (persistedCharacter) {
        gameState.setCharacter(persistedCharacter)
      }
    }
  }, [gamePhase, gameState])

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
    setGamePhase("hub")
  }

  const handleCharacterSelect = (character: CharacterPreset) => {
    gameState.setCharacter(character)
    setGamePhase("hub")
  }

  const handleCustomizationConfirm = (customization: FighterCustomizationType) => {
    setFighterCustomization(customization)
    setShowCustomization(false)
  }

  const handleBackToStart = () => {
    setGamePhase("start")
  }

  const handleBackToHub = () => {
    setGamePhase("hub")
  }

  const handleNewRun = () => {
    gameState.resetGame()
    setFighterCustomization(DEFAULT_CUSTOMIZATION)
    setGamePhase("hub")
  }

  const handleStartRun = () => {
    if (gameState.selectedCharacter) {
      setGamePhase("game")
    }
  }

  const handleOpenCharacterSelect = () => {
    setGamePhase("character-select")
  }

  const handleOpenCustomization = () => {
    setShowCustomization(true)
  }

  const handleOpenMetaShop = () => {
    setShowMetaShop(true)
  }

  const handleCloseMetaShop = () => {
    setShowMetaShop(false)
  }

  const handleOpenCodex = () => {
    setShowCodex(true)
  }

  const handleCloseCodex = () => {
    setShowCodex(false)
  }

  return (
    <>
      {gamePhase === "start" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <StartScreen onStart={handleStartGame} />
        </main>
      )}

      {gamePhase === "hub" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <Hub
            selectedCharacter={gameState.selectedCharacter}
            fighterCustomization={fighterCustomization}
            playerProgress={gameState.playerProgress}
            onStartRun={handleStartRun}
            onSelectCharacter={handleOpenCharacterSelect}
            onCustomizeFighter={handleOpenCustomization}
            onOpenShop={handleOpenMetaShop}
            onOpenCodex={handleOpenCodex}
            bgmAudioRef={audioRef}
          />
        </main>
      )}

      {gamePhase === "character-select" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <CharacterSelection onSelect={handleCharacterSelect} onBack={handleBackToHub} />
        </main>
      )}

      {gamePhase === "game" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <div className="crt-effect absolute inset-0" />

          <div className="absolute inset-0">
            <BattleArena
              gameState={gameState}
              fighterCustomization={fighterCustomization}
              enemyCustomization={gameState.enemyCustomization}
            />
          </div>

          <GameUI gameState={gameState} onNewRun={handleNewRun} onOpenMetaShop={handleOpenMetaShop} />
        </main>
      )}

      {showCustomization && (
        <div className="absolute inset-0 z-50">
          <FighterCustomization
            onConfirm={handleCustomizationConfirm}
            onBack={() => setShowCustomization(false)}
            currentCustomization={fighterCustomization}
          />
        </div>
      )}

      {showCodex && <Codex isOpen={showCodex} onClose={handleCloseCodex} />}

      {showMetaShop && (
        <MetaShop
          progress={gameState.playerProgress}
          onClose={handleCloseMetaShop}
          onPurchase={gameState.updatePlayerProgress}
        />
      )}
    </>
  )
}
