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
import { ConstructSlotManager } from "@/components/construct-slot-manager"
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
  const [showSlotManager, setShowSlotManager] = useState(false)
  const [showCalibration, setShowCalibration] = useState(false)
  const [pendingSlotAssignment, setPendingSlotAssignment] = useState<string | null>(null)
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
      const slotId = gameState.playerProgress.selectedConstructSlot || "slot-1"
      const slotData = gameState.playerProgress.activeConstructSlots?.[slotId]

      if (slotData) {
        const persistedConstruct = CONSTRUCTS.find((construct) => construct.id === slotData.constructId)
        if (persistedConstruct && !gameState.selectedConstruct) {
          gameState.setConstruct(persistedConstruct, slotId)
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

  const handleConstructSelect = (construct: Construct, slotId: string) => {
    gameState.setConstruct(construct, slotId)
    setGamePhase("hub")
    setPendingSlotAssignment(null)
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
    setPendingSlotAssignment("slot-1") // Default to slot-1 if opened from hub
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

  const handleOpenSlotManager = () => {
    setShowSlotManager(true)
  }

  const handleCloseSlotManager = () => {
    setShowSlotManager(false)
    setPendingSlotAssignment(null)
  }

  const handleSelectSlot = (slotId: string) => {
    const slotData = gameState.playerProgress.activeConstructSlots?.[slotId]
    if (slotData) {
      const construct = CONSTRUCTS.find((c) => c.id === slotData.constructId)
      if (construct) {
        gameState.setConstruct(construct, slotId)
        setShowSlotManager(false)
      }
    }
  }

  const handleAssignToSlot = (slotId: string) => {
    setPendingSlotAssignment(slotId)
    setShowSlotManager(false)
    setGamePhase("construct-select")
  }

  const handleOpenCalibration = () => {
    setShowCalibration(true)
  }

  const handleCloseCalibration = () => {
    setShowCalibration(false)
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
          {!gameState.selectedConstruct && <WelcomeDialog onOpenClassManager={handleOpenSlotManager} />}

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
            onOpenSlotManager={handleOpenSlotManager}
            onOpenCalibration={handleOpenCalibration}
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
            currentSlotId={pendingSlotAssignment || "slot-1"}
          />
        </main>
      )}

      {gamePhase === "class-manager" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <FighterClassManager
            customClasses={gameState.playerProgress.customFighterClasses || []}
            selectedClassId={gameState.playerProgress.selectedConstructSlot || null}
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

      {showSlotManager && (
        <ConstructSlotManager
          playerProgress={gameState.playerProgress}
          currentSlotId={gameState.playerProgress.selectedConstructSlot || null}
          onSelectSlot={handleSelectSlot}
          onAssignToSlot={handleAssignToSlot}
          onClose={handleCloseSlotManager}
        />
      )}

      {showCalibration && gameState.selectedConstruct && gameState.activeSlot && (
        <FighterClassManager
          customClasses={[
            {
              id: gameState.selectedConstruct.id,
              name: gameState.selectedConstruct.name,
              color: gameState.selectedConstruct.color,
              startingPairs: [],
              startingMovementPairs: gameState.movementPairs.map((p) => ({
                triggerId: p.trigger.id,
                actionId: p.action.id,
                priority: p.priority,
              })),
              startingTacticalPairs: gameState.tacticalPairs.map((p) => ({
                triggerId: p.trigger.id,
                actionId: p.action.id,
                priority: p.priority,
              })),
              customization: fighterCustomization,
            },
          ]}
          selectedClassId={gameState.selectedConstruct.id}
          onSaveClasses={(classes) => {
            const updatedClass = classes[0]
            if (updatedClass && gameState.activeSlot) {
              const newSlots = {
                ...(gameState.playerProgress.activeConstructSlots || {}),
                [gameState.activeSlot.slotId]: {
                  constructId: gameState.activeSlot.constructId,
                  movementProtocols: updatedClass.startingMovementPairs || [],
                  tacticalProtocols: updatedClass.startingTacticalPairs || [],
                },
              }
              gameState.updatePlayerProgress({
                ...gameState.playerProgress,
                activeConstructSlots: newSlots,
              })

              // Reload the construct to update the protocols in game state
              gameState.setConstruct(gameState.selectedConstruct!, gameState.activeSlot.slotId)
            }
            handleCloseCalibration()
          }}
          onSelectClass={() => {}}
          onClose={handleCloseCalibration}
        />
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
