"use client";

import { useState, useEffect, useRef } from "react";
import { BattleArena } from "@/components/battle-arena";
import { GameUI } from "@/components/game-ui";
import { StartScreen } from "@/components/start-screen";
import Hub from "@/components/hub/Hub";
import { ConstructSelection } from "@/components/construct-selection";
import { FighterCustomization } from "@/components/fighter-customization";
import { MetaShop } from "@/components/meta-shop";
import { Codex } from "@/components/codex";
import { NetworkContractsView } from "@/components/network-contracts-view";
import { FighterClassManager } from "@/components/fighter-class-manager";
import { ConstructSlotManager } from "@/components/construct-slot-manager";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { useGameState } from "@/hooks/use-game-state";
import { DEFAULT_CUSTOMIZATION } from "@/lib/fighter-parts";
import { CONSTRUCTS } from "@/lib/constructs";
import {
  claimContractReward,
  forceRefreshContracts,
} from "@/lib/network-contracts";
import type { Construct } from "@/types/game";
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts";
import type { CustomFighterClass } from "@/lib/meta-progression";
import { AVAILABLE_TRIGGERS } from "@/lib/triggers";
import { AVAILABLE_ACTIONS } from "@/lib/actions";
import { GameView, useGameStore } from "@/lib/store/gameStore";
import { BenchmarkArena } from "@/components/battle/BenchmarkArena";

export default function Home() {
  const { setView } = useGameStore();

  const gameState = useGameState();
  const [gamePhase, setGamePhase] = useState<
    | "start"
    | "hub"
    | "class-manager"
    | "construct-select"
    | "game"
    | "battle-arena"
  >("start");
  const [fighterCustomization, setFighterCustomization] =
    useState<FighterCustomizationType>(DEFAULT_CUSTOMIZATION);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showMetaShop, setShowMetaShop] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showSlotManager, setShowSlotManager] = useState(false);
  const [showFighterClassEditor, setShowFighterClassEditor] = useState(false);
  const [pendingSlotAssignment, setPendingSlotAssignment] = useState<
    string | null
  >(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestPlayerProgressRef = useRef(gameState.playerProgress);

  useEffect(() => {
    latestPlayerProgressRef.current = gameState.playerProgress;
  }, [gameState.playerProgress]);

  useEffect(() => {
    if (
      gameState.selectedCharacter &&
      gameState.playerProgress.customFighterClasses
    ) {
      const customClass = gameState.playerProgress.customFighterClasses.find(
        (c) => c.id === gameState.selectedCharacter?.id,
      );
      if (customClass && customClass.customization) {
        setFighterCustomization(customClass.customization);
      }
    }
  }, [
    gameState.selectedCharacter,
    gameState.playerProgress.customFighterClasses,
  ]);

  useEffect(() => {
    if (gamePhase === "hub") {
      const slotId = gameState.playerProgress.selectedConstructSlot || "slot-1";
      const slotData = gameState.playerProgress.activeConstructSlots?.[slotId];

      if (slotData) {
        const persistedConstruct = CONSTRUCTS.find(
          (construct) => construct.id === slotData.constructId,
        );
        if (persistedConstruct && !gameState.selectedConstruct) {
          gameState.setConstruct(persistedConstruct, slotId);
        }
      }

      const timer = setTimeout(() => {
        setIsInitialLoadComplete(true);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsInitialLoadComplete(false);
    }
  }, [gamePhase, gameState]);

  const handleStartGame = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    }
    setGamePhase("hub");
  };

  const handleConstructSelect = (construct: Construct, slotId: string) => {
    gameState.setConstruct(construct, slotId);
    setGamePhase("hub");
    setPendingSlotAssignment(null);
  };

  const handleCustomizationConfirm = (
    customization: FighterCustomizationType,
  ) => {
    setFighterCustomization(customization);
    setShowCustomization(false);
  };

  const handleBackToStart = () => {
    setGamePhase("start");
  };

  const handleBackToHub = () => {
    setGamePhase("hub");
  };

  const handleNewRun = () => {
    gameState.resetGame();
    setFighterCustomization(DEFAULT_CUSTOMIZATION);
    setGamePhase("hub");
  };

  const handleStartRun = () => {
    if (gameState.selectedConstruct) {
      gameState.resetGame();
      setGamePhase("game");
    }
  };

  const handleOpenConstructSelect = () => {
    setPendingSlotAssignment("slot-1"); // Default to slot-1 if opened from hub
    setGamePhase("construct-select");
  };

  const handleOpenCustomization = () => {
    setShowCustomization(true);
  };

  const handleOpenMetaShop = () => {
    setShowMetaShop(true);
  };

  const handleCloseMetaShop = () => {
    setShowMetaShop(false);
  };

  const handleOpenCodex = () => {
    setShowCodex(true);
  };

  const handleCloseCodex = () => {
    setShowCodex(false);
  };

  const handleOpenContracts = () => {
    setShowContracts(true);
  };

  const handleCloseContracts = () => {
    setShowContracts(false);
  };

  const handleOpenSlotManager = () => {
    setShowSlotManager(true);
  };

  const handleCloseSlotManager = () => {
    setShowSlotManager(false);
    setPendingSlotAssignment(null);
  };

  const handleSelectSlot = (slotId: string) => {
    console.log("[v0] handleSelectSlot called with slotId:", slotId);
    const slotData = gameState.playerProgress.activeConstructSlots?.[slotId];
    console.log("[v0] Slot data:", slotData);

    if (slotData) {
      const construct = CONSTRUCTS.find((c) => c.id === slotData.constructId);
      console.log("[v0] Found construct:", construct);

      if (construct) {
        gameState.setConstruct(construct, slotId);
        console.log(
          "[v0] setConstruct completed - activeSlot:",
          gameState.activeSlot,
        );
        console.log("[v0] Movement pairs:", gameState.movementPairs?.length);
        console.log("[v0] Tactical pairs:", gameState.tacticalPairs?.length);
        setShowSlotManager(false);
      }
    }
  };

  const handleAssignToSlot = (slotId: string) => {
    setPendingSlotAssignment(slotId);
    setShowSlotManager(false);
    setGamePhase("construct-select");
  };

  const handleOpenCalibration = () => {
    setShowFighterClassEditor(true);
    setView(GameView.TINKER);
  };

  const handleCloseCalibration = () => {
    setShowFighterClassEditor(false);
    setView(GameView.HUB);
  };

  const handleOpenClassManager = () => {
    setGamePhase("class-manager");
  };

  function handleOpenBattleArena(): void {
    setGamePhase("battle-arena");
  }

  const handleSaveCustomClasses = (classes: CustomFighterClass[]) => {
    gameState.updatePlayerProgress({
      ...gameState.playerProgress,
      customFighterClasses: classes,
    });
  };

  const handleSelectClass = (classId: string) => {
    const customClasses = gameState.playerProgress.customFighterClasses || [];
    const allClasses =
      customClasses.length > 0
        ? customClasses
        : CONSTRUCTS.map((construct) => ({
            id: construct.id,
            name: construct.name,
            color: construct.color,
            startingPairs: [],
            customization: DEFAULT_CUSTOMIZATION,
          }));

    const selectedClass = allClasses.find((c) => c.id === classId);
    if (selectedClass) {
      const construct = CONSTRUCTS.find((p) => p.id === selectedClass.id);
      if (construct) {
        const constructData: Construct = {
          ...construct,
          name: selectedClass.name,
          color: selectedClass.color,
        };
        gameState.setConstruct(constructData);

        if (selectedClass.customization) {
          setFighterCustomization(selectedClass.customization);
        } else {
          setFighterCustomization(DEFAULT_CUSTOMIZATION);
        }
      }
    }
    setGamePhase("hub");
  };

  const handleClaimContractReward = (
    contractId: string,
    refreshType: "daily" | "weekly",
  ) => {
    console.log(
      "[v0] handleClaimContractReward called - contractId:",
      contractId,
      "refreshType:",
      refreshType,
    );

    if (!gameState.playerProgress.contractProgress) {
      console.log("[v0] No contract progress found");
      return;
    }

    console.log(
      "[v0] Current contract progress:",
      gameState.playerProgress.contractProgress,
    );
    console.log(
      "[v0] Current cipher fragments:",
      gameState.playerProgress.cipherFragments,
    );

    const {
      contractProgress: updatedContractProgress,
      playerProgress: updatedPlayerProgress,
    } = claimContractReward(
      contractId,
      refreshType,
      gameState.playerProgress.contractProgress,
      gameState.playerProgress,
    );

    console.log("[v0] Updated contract progress:", updatedContractProgress);
    console.log("[v0] Updated player progress:", updatedPlayerProgress);
    console.log(
      "[v0] New cipher fragments:",
      updatedPlayerProgress.cipherFragments,
    );

    gameState.updatePlayerProgress({
      ...updatedPlayerProgress,
      contractProgress: updatedContractProgress,
    });

    console.log("[v0] Player progress updated successfully");
  };

  const handleForceRefreshContracts = () => {
    if (!gameState.playerProgress.contractProgress) return;

    const refreshedContracts = forceRefreshContracts(
      gameState.playerProgress.contractProgress,
    );

    gameState.updatePlayerProgress({
      ...gameState.playerProgress,
      contractProgress: refreshedContracts,
    });
  };

  return (
    <>
      {gamePhase === "start" && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <StartScreen onStart={handleStartGame} />
        </main>
      )}

      {gamePhase === "hub" && isInitialLoadComplete && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          {!gameState.selectedConstruct && (
            <WelcomeDialog onOpenClassManager={handleOpenSlotManager} />
          )}

          <Hub
            selectedConstruct={gameState.selectedConstruct}
            onStartRun={handleStartRun}
            onSelectConstruct={handleOpenConstructSelect}
            onOpenShop={handleOpenMetaShop}
            onOpenCodex={handleOpenCodex}
            onOpenContracts={handleOpenContracts}
            onOpenCalibration={handleOpenCalibration}
            onOpenClassManager={handleOpenClassManager}
            onOpenBattleArena={handleOpenBattleArena}
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
            selectedClassId={
              gameState.playerProgress.selectedConstructSlot || null
            }
            onSaveClasses={handleSaveCustomClasses}
            onSelectClass={handleSelectClass}
            onClose={handleBackToHub}
          />
        </main>
      )}

      {gamePhase === "battle-arena" && gameState.player && (
        <main className="relative w-full h-dvh overflow-hidden bg-background">
          <BenchmarkArena
            classData={gameState.player}
            onClose={() => setGamePhase("hub")}
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

          <GameUI
            gameState={gameState}
            onNewRun={handleNewRun}
            onOpenMetaShop={handleOpenMetaShop}
          />
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

      {showFighterClassEditor &&
        gameState.selectedConstruct &&
        gameState.activeSlot && (
          <FighterClassManager
            key={`calibration-${gameState.activeSlot.slotId}-${Date.now()}`}
            customClasses={[
              {
                id: gameState.selectedConstruct.id,
                name: gameState.selectedConstruct.name,
                color: gameState.selectedConstruct.color,
                startingPairs: [],
                startingMovementPairs:
                  latestPlayerProgressRef.current.activeConstructSlots?.[
                    gameState.activeSlot.slotId
                  ]?.movementProtocols || [],
                startingTacticalPairs:
                  latestPlayerProgressRef.current.activeConstructSlots?.[
                    gameState.activeSlot.slotId
                  ]?.tacticalProtocols || [],
                customization: fighterCustomization,
                constructStats: {
                  maxHp: gameState.selectedConstruct.baseHp,
                  maxShields: gameState.selectedConstruct.baseShields,
                  maxArmor: gameState.selectedConstruct.baseArmor,
                },
              },
            ]}
            selectedClassId={gameState.selectedConstruct.id}
            skipSelection={true}
            onSaveClasses={(classes) => {
              const updatedClass = classes[0];

              if (updatedClass && gameState.activeSlot) {
                const slotId = gameState.activeSlot.slotId;

                const movementProtocols = (
                  updatedClass.startingMovementPairs || []
                ).map((p) => ({
                  triggerId: p.triggerId,
                  actionId: p.actionId,
                  priority: p.priority,
                }));

                const tacticalProtocols = (
                  updatedClass.startingTacticalPairs || []
                ).map((p) => ({
                  triggerId: p.triggerId,
                  actionId: p.actionId,
                  priority: p.priority,
                }));

                const newSlots = {
                  ...(gameState.playerProgress.activeConstructSlots || {}),
                  [slotId]: {
                    constructId: gameState.activeSlot.constructId,
                    movementProtocols,
                    tacticalProtocols,
                  },
                };

                const newProgress = {
                  ...gameState.playerProgress,
                  activeConstructSlots: newSlots,
                };

                gameState.updatePlayerProgress(newProgress);
                latestPlayerProgressRef.current = newProgress;

                // This avoids the race condition where setConstruct reads stale state
                const movementPairs = movementProtocols
                  .map((p) => {
                    const trigger = AVAILABLE_TRIGGERS.find(
                      (t) => t.id === p.triggerId,
                    );
                    const action = AVAILABLE_ACTIONS.find(
                      (a) => a.id === p.actionId,
                    );
                    if (!trigger || !action) return null;
                    return {
                      trigger,
                      action,
                      priority: p.priority,
                      enabled: true,
                    };
                  })
                  .filter(Boolean) as any[];

                const tacticalPairs = tacticalProtocols
                  .map((p) => {
                    const trigger = AVAILABLE_TRIGGERS.find(
                      (t) => t.id === p.triggerId,
                    );
                    const action = AVAILABLE_ACTIONS.find(
                      (a) => a.id === p.actionId,
                    );
                    if (!trigger || !action) return null;
                    return {
                      trigger,
                      action,
                      priority: p.priority,
                      enabled: true,
                    };
                  })
                  .filter(Boolean) as any[];

                // Update the pairs using the existing add methods
                if (gameState.addMovementPair && gameState.removeMovementPair) {
                  // Clear existing pairs
                  const currentMovementCount =
                    gameState.movementPairs?.length || 0;
                  for (let i = currentMovementCount - 1; i >= 0; i--) {
                    gameState.removeMovementPair(i);
                  }
                  // Add new pairs
                  movementPairs.forEach((pair) => {
                    if (pair && gameState.addMovementPair) {
                      gameState.addMovementPair(pair.trigger, pair.action);
                    }
                  });
                }

                if (gameState.addTacticalPair && gameState.removeTacticalPair) {
                  // Clear existing pairs
                  const currentTacticalCount =
                    gameState.tacticalPairs?.length || 0;
                  for (let i = currentTacticalCount - 1; i >= 0; i--) {
                    gameState.removeTacticalPair(i);
                  }
                  // Add new pairs
                  tacticalPairs.forEach((pair) => {
                    if (pair && gameState.addTacticalPair) {
                      gameState.addTacticalPair(pair.trigger, pair.action);
                    }
                  });
                }
              }
              handleCloseCalibration();
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
          dailyContracts={
            gameState.playerProgress.contractProgress.dailyContracts
          }
          weeklyContracts={
            gameState.playerProgress.contractProgress.weeklyContracts
          }
          onClose={handleCloseContracts}
          onClaimReward={handleClaimContractReward}
          onForceRefresh={handleForceRefreshContracts}
          completedContractIds={
            gameState.playerProgress.contractProgress.completedContractIds
          }
        />
      )}
    </>
  );
}
