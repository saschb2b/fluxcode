"use client"

import { useState, useEffect, useRef } from "react"
import { BattleArena } from "@/components/battle-arena"
import { GameUI } from "@/components/game-ui"
import { StartScreen } from "@/components/start-screen"
import { Hub } from "@/components/hub"
import { ConstructSelection } from "@/components/construct-selection"
import { FighterCustomization } from "@/components/fighter-customization"
import { MetaShop } from "@/components/meta-shop"
import { Codex } from "@/components/codex"
import { NetworkContractsView } from "@/components/network-contracts-view"
import { FighterClassManager } from "@/components/fighter-class-manager"
import { WelcomeDialog } from "@/components/welcome-dialog"
import { useGameState } from "@/hooks/use-game-state"
import { DEFAULT_CUSTOMIZATION } from "@/lib/fighter-parts"
import { CONSTRUCTS } from "@/lib/constructs"
import { claimContractReward, forceRefreshContracts } from "@/lib/network-contracts"
import type { Construct } from "@/types/game"
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts"
import type { CustomFighterClass } from "@/lib/meta-progression"

export default function Home() {
  const gameState = useGameState()
  const [gamePhase, setGamePhase] = useState<"start" | "hub" | "class-manager" | "construct-select" | "game">("start")
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
      if (gameState.playerProgress.selectedConstructId) {
        const persistedConstruct = CONSTRUCTS.find(
          (construct) => construct.id === gameState.playerProgress.selectedConstructId,
        )
        if (persistedConstruct && !gameState.selectedConstruct) {
          gameState.setConstruct(persistedConstruct)
        }
      }

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

  const handleConstructSelect = (construct: Construct, slotIndex: number) => {
    gameState.setConstruct(construct, slotIndex)
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
    if (gameState.selectedConstruct) {
      gameState.resetGame()
      setGamePhase("game")
    }
  }

  const handleOpenConstructSelect = () => {
    setGamePhase("construct-select")
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
        : CONSTRUCTS.map((construct) => ({
            id: construct.id,
            name: construct.name,
            color: construct.color,
            startingPairs: [],
            customization: DEFAULT_CUSTOMIZATION,
          }))

    const selectedClass = allClasses.find((c) => c.id === classId)
    if (selectedClass) {
      const construct = CONSTRUCTS.find((p) => p.id === selectedClass.id)
      if (construct) {
        const constructData: Construct = {
          ...construct,
          name: selectedClass.name,
          color: selectedClass.color,
        }
        gameState.setConstruct(constructData)

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
          {!gameState.selectedConstruct && <WelcomeDialog onOpenClassManager={handleOpenClassManager} />}

          <Hub
            selectedConstruct={gameState.selectedConstruct}
            fighterCustomization={fighterCustomization}
            playerProgress={gameState.playerProgress}
            playerMaxHp={gameState.player.maxHp}
            onStartRun={handleStartRun}
            onSelectConstruct={handleOpenConstructSelect}
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

      {gamePhase === "construct-select" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <ConstructSelection
            onSelect={handleConstructSelect}
            onBack={handleBackToHub}
            playerProgress={gameState.playerProgress}
          />
        </main>
      )}

      {gamePhase === "class-manager" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <FighterClassManager
            customClasses={gameState.playerProgress.customFighterClasses || []}
            selectedClassId={gameState.playerProgress.selectedConstructId}
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
              enemyCustomizations={gameState.enemyCustomizations}
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
