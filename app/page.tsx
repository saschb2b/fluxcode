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
import { NetworkContractsView } from "@/components/network-contracts-view"
import { FighterClassManager } from "@/components/fighter-class-manager"
import { WelcomeDialog } from "@/components/welcome-dialog"
import { useGameState } from "@/hooks/use-game-state"
import { DEFAULT_CUSTOMIZATION } from "@/lib/fighter-parts"
import { CHARACTER_PRESETS } from "@/lib/character-presets"
import { claimContractReward, forceRefreshContracts } from "@/lib/network-contracts"
import type { CharacterPreset } from "@/lib/character-presets"
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts"
import type { CustomFighterClass } from "@/lib/meta-progression"

export default function Home() {
  const gameState = useGameState()
  const [gamePhase, setGamePhase] = useState<"start" | "hub" | "class-manager" | "character-select" | "game">("start")
  const [fighterCustomization, setFighterCustomization] = useState<FighterCustomizationType>(DEFAULT_CUSTOMIZATION)
  const [showCustomization, setShowCustomization] = useState(false)
  const [showMetaShop, setShowMetaShop] = useState(false)
  const [showCodex, setShowCodex] = useState(false)
  const [showContracts, setShowContracts] = useState(false)
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
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

  useEffect(() => {
    if (gameState.selectedCharacter && gameState.playerProgress.customFighterClasses) {
      const customClass = gameState.playerProgress.customFighterClasses.find(
        (c) => c.id === gameState.selectedCharacter?.id,
      )
      if (customClass && customClass.customization) {
        setFighterCustomization(customClass.customization)
      }
    }
  }, [gameState.selectedCharacter, gameState.playerProgress.customFighterClasses])

  useEffect(() => {
    if (gamePhase === "hub") {
      if (gameState.playerProgress.selectedCharacterId) {
        const persistedCharacter = CHARACTER_PRESETS.find(
          (char) => char.id === gameState.playerProgress.selectedCharacterId,
        )
        if (persistedCharacter && !gameState.selectedCharacter) {
          gameState.setCharacter(persistedCharacter)
        }
      }

      // Use a small timeout to ensure character is loaded before showing UI
      const timer = setTimeout(() => {
        setIsInitialLoadComplete(true)
      }, 50)

      return () => clearTimeout(timer)
    } else {
      setIsInitialLoadComplete(false)
    }
  }, [gamePhase, gameState])

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
      gameState.resetGame()
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

  const handleOpenContracts = () => {
    setShowContracts(true)
  }

  const handleCloseContracts = () => {
    setShowContracts(false)
  }

  const handleOpenClassManager = () => {
    setGamePhase("class-manager")
  }

  const handleSaveCustomClasses = (classes: CustomFighterClass[]) => {
    gameState.updatePlayerProgress({
      ...gameState.playerProgress,
      customFighterClasses: classes,
    })
  }

  const handleSelectClass = (classId: string) => {
    const customClasses = gameState.playerProgress.customFighterClasses || []
    const allClasses =
      customClasses.length > 0
        ? customClasses
        : CHARACTER_PRESETS.map((preset) => ({
            id: preset.id,
            name: preset.name,
            color: preset.color,
            startingPairs: preset.startingPairs.map((pair) => ({
              triggerId: pair.trigger.id,
              actionId: pair.action.id,
              priority: pair.priority,
            })),
            customization: DEFAULT_CUSTOMIZATION, // Default customization for presets
          }))

    const selectedClass = allClasses.find((c) => c.id === classId)
    if (selectedClass) {
      const preset = CHARACTER_PRESETS.find((p) => p.id === selectedClass.id)
      if (preset) {
        const characterPreset: CharacterPreset = {
          ...preset,
          name: selectedClass.name,
          color: selectedClass.color,
        }
        gameState.setCharacter(characterPreset)

        if (selectedClass.customization) {
          setFighterCustomization(selectedClass.customization)
        } else {
          setFighterCustomization(DEFAULT_CUSTOMIZATION)
        }
      }
    }
    setGamePhase("hub")
  }

  const handleClaimContractReward = (contractId: string, refreshType: "daily" | "weekly") => {
    console.log("[v0] handleClaimContractReward called - contractId:", contractId, "refreshType:", refreshType)

    if (!gameState.playerProgress.contractProgress) {
      console.log("[v0] No contract progress found")
      return
    }

    console.log("[v0] Current contract progress:", gameState.playerProgress.contractProgress)
    console.log("[v0] Current cipher fragments:", gameState.playerProgress.cipherFragments)

    const { contractProgress: updatedContractProgress, playerProgress: updatedPlayerProgress } = claimContractReward(
      contractId,
      refreshType,
      gameState.playerProgress.contractProgress,
      gameState.playerProgress,
    )

    console.log("[v0] Updated contract progress:", updatedContractProgress)
    console.log("[v0] Updated player progress:", updatedPlayerProgress)
    console.log("[v0] New cipher fragments:", updatedPlayerProgress.cipherFragments)

    gameState.updatePlayerProgress({
      ...updatedPlayerProgress,
      contractProgress: updatedContractProgress,
    })

    console.log("[v0] Player progress updated successfully")
  }

  const handleForceRefreshContracts = () => {
    if (!gameState.playerProgress.contractProgress) return

    const refreshedContracts = forceRefreshContracts(gameState.playerProgress.contractProgress)

    gameState.updatePlayerProgress({
      ...gameState.playerProgress,
      contractProgress: refreshedContracts,
    })
  }

  return (
    <>
      {gamePhase === "start" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <StartScreen onStart={handleStartGame} />
        </main>
      )}

      {gamePhase === "hub" && isInitialLoadComplete && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          {!gameState.selectedCharacter && <WelcomeDialog onOpenClassManager={handleOpenClassManager} />}

          <Hub
            selectedCharacter={gameState.selectedCharacter}
            fighterCustomization={fighterCustomization}
            playerProgress={gameState.playerProgress}
            playerMaxHp={gameState.player.maxHp}
            onStartRun={handleStartRun}
            onSelectCharacter={handleOpenCharacterSelect}
            onCustomizeFighter={handleOpenCustomization}
            onOpenShop={handleOpenMetaShop}
            onOpenCodex={handleOpenCodex}
            onOpenContracts={handleOpenContracts}
            onOpenClassManager={handleOpenClassManager}
            bgmAudioRef={audioRef}
            isInHub={true}
          />
        </main>
      )}

      {gamePhase === "character-select" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <CharacterSelection onSelect={handleCharacterSelect} onBack={handleBackToHub} />
        </main>
      )}

      {gamePhase === "class-manager" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <FighterClassManager
            customClasses={gameState.playerProgress.customFighterClasses || []}
            selectedClassId={gameState.playerProgress.selectedCharacterId}
            onSaveClasses={handleSaveCustomClasses}
            onSelectClass={handleSelectClass}
            onClose={handleBackToHub}
          />
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

      {showContracts && gameState.playerProgress.contractProgress && (
        <NetworkContractsView
          dailyContracts={gameState.playerProgress.contractProgress.dailyContracts}
          weeklyContracts={gameState.playerProgress.contractProgress.weeklyContracts}
          onClose={handleCloseContracts}
          onClaimReward={handleClaimContractReward}
          onForceRefresh={handleForceRefreshContracts}
          completedContractIds={gameState.playerProgress.contractProgress.completedContractIds}
        />
      )}
    </>
  )
}
