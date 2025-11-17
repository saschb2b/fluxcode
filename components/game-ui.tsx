"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProgrammingPanel } from "@/components/programming-panel"
import { RewardSelection } from "@/components/reward-selection"
import { Codex } from "@/components/codex"
import { BattleStatsChart } from "@/components/battle-stats-chart"
import { EnemyIntroduction } from "@/components/enemy-introduction"
import { LayerProgressWidget } from "@/components/layer-progress-widget"
import { NetworkMap } from "@/components/network-map"
import type { GameState } from "@/types/game"
import { Coins, LogOut, Sparkles, Code } from "lucide-react"
import { calculateCipherFragmentReward } from "@/lib/meta-progression"

interface GameUIProps {
  gameState: GameState
  onNewRun: () => void
  onOpenMetaShop: () => void
}

export function GameUI({ gameState, onNewRun, onOpenMetaShop }: GameUIProps) {
  const [isProgrammingOpen, setIsProgrammingOpen] = useState(false)
  const [isCodexOpen, setIsCodexOpen] = useState(false)
  const [isNetworkMapOpen, setIsNetworkMapOpen] = useState(false)

  const totalNodesCompleted = gameState.currentLayerIndex * 7 + gameState.currentNodeIndex
  const fragmentsEarned = gameState.battleState === "defeat" ? calculateCipherFragmentReward(totalNodesCompleted) : 0

  console.log(
    "[v0] GameUI render - battleState:",
    gameState.battleState,
    "justEarnedReward:",
    gameState.justEarnedReward,
  )

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-auto px-2 sm:px-4">
          <LayerProgressWidget
            layers={gameState.networkLayers}
            currentLayerIndex={gameState.currentLayerIndex}
            currentNodeIndex={gameState.currentNodeIndex}
            isGuardianBattle={gameState.isGuardianBattle}
            onOpenMap={() => setIsNetworkMapOpen(true)}
          />
        </div>

        {/* Battle Controls */}
        {gameState.battleState === "idle" && (
          <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex flex-col items-center gap-3 pointer-events-auto px-4">
            {gameState.justEarnedReward && (
              <div className="mb-2 p-3 rounded-lg border-2 border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/20 animate-pulse max-w-xs w-full">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-400 uppercase tracking-wider">Protocol Acquired</span>
                </div>
                <p className="text-xs text-green-300">
                  <span className="font-mono font-bold">{gameState.justEarnedReward.name}</span> is now available!
                </p>
              </div>
            )}

            {gameState.justEarnedReward && (
              <Button
                size="lg"
                variant="outline"
                className="w-full max-w-xs text-base font-bold px-6 py-5 border-2 border-green-500 text-green-400 hover:bg-green-500/20 hover:text-green-300 bg-transparent shadow-lg shadow-green-500/20 animate-pulse active:scale-95"
                onClick={() => setIsProgrammingOpen(true)}
              >
                <Code className="w-5 h-5 mr-2" />
                CONFIGURE NEW PROTOCOL
              </Button>
            )}

            <Button
              size="lg"
              className="text-base sm:text-lg font-bold px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/80 border-2 border-primary-foreground shadow-lg active:scale-95 w-full sm:w-auto max-w-xs"
              onClick={gameState.startBattle}
              disabled={
                (gameState.movementPairs?.length || 0) === 0 &&
                (gameState.tacticalPairs?.length || 0) === 0 &&
                gameState.triggerActionPairs.length === 0
              }
            >
              START BATTLE
            </Button>
          </div>
        )}

        {(gameState.battleState === "victory" || gameState.battleState === "defeat") &&
          !gameState.showRewardSelection && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur pointer-events-auto p-4">
              <Card className="p-6 sm:p-8 bg-card border-4 border-primary max-w-md w-full">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4">
                  {gameState.battleState === "victory" ? (
                    <span className="text-primary">BREACH SUCCESSFUL</span>
                  ) : (
                    <span className="text-yellow-400">DATA EXTRACTED</span>
                  )}
                </h2>

                {gameState.battleHistory && gameState.battleHistory.length > 0 && (
                  <div className="mb-4">
                    <BattleStatsChart history={gameState.battleHistory} />
                  </div>
                )}

                {fragmentsEarned > 0 && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <Coins className="w-5 h-5" />
                      <span className="font-bold text-lg">+{fragmentsEarned} Cipher Fragments</span>
                    </div>
                    <p className="text-center text-xs text-yellow-400/80 mt-1">
                      Secured from {totalNodesCompleted} nodes
                    </p>
                  </div>
                )}

                {gameState.battleState === "victory" && (
                  <p className="text-center text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                    New protocol available. Continue deeper or extract now.
                  </p>
                )}

                <div className="mb-4 sm:mb-6">
                  {gameState.battleState === "victory" ? (
                    <>
                      {gameState.wave > 1 && (
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 active:scale-95 bg-transparent"
                          onClick={gameState.extractFromBreach}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Extract ({calculateCipherFragmentReward(totalNodesCompleted)} CF)
                        </Button>
                      )}
                      <Button
                        className="w-full bg-primary hover:bg-primary/80 h-12 text-base font-bold active:scale-95"
                        onClick={gameState.nextWave}
                      >
                        Continue Breach
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/80 h-12 text-base font-bold active:scale-95"
                      onClick={onNewRun}
                    >
                      Return to Hub
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
      </div>

      {/* Enemy Introduction Screen */}
      {gameState.showEnemyIntro && gameState.enemy && (
        <EnemyIntroduction
          wave={gameState.wave}
          enemyCustomization={gameState.enemyCustomization}
          enemyMaxHp={gameState.enemy.maxHp}
          onBeginBattle={gameState.continueAfterIntro}
          isOpen={gameState.showEnemyIntro}
          currentLayer={gameState.networkLayers[gameState.currentLayerIndex]}
          currentNodeIndex={gameState.currentNodeIndex}
          isGuardianBattle={gameState.isGuardianBattle}
          enemyShields={gameState.enemy.maxShields}
          enemyArmor={gameState.enemy.maxArmor}
          enemyResistances={gameState.enemy.resistances}
        />
      )}

      <ProgrammingPanel
        pairs={gameState.triggerActionPairs}
        movementPairs={gameState.movementPairs || []}
        tacticalPairs={gameState.tacticalPairs || []}
        maxMovementSlots={gameState.selectedConstruct?.maxMovementCores || 6}
        maxTacticalSlots={gameState.selectedConstruct?.maxTacticalCores || 6}
        unlockedTriggers={gameState.unlockedTriggers}
        unlockedActions={gameState.unlockedActions}
        onAddPair={gameState.addTriggerActionPair}
        onRemovePair={gameState.removeTriggerActionPair}
        onUpdatePriority={gameState.updatePairPriority}
        onTogglePair={gameState.togglePair}
        onAddMovementPair={gameState.addMovementPair}
        onAddTacticalPair={gameState.addTacticalPair}
        onRemoveMovementPair={gameState.removeMovementPair}
        onRemoveTacticalPair={gameState.removeTacticalPair}
        isOpen={isProgrammingOpen}
        onClose={() => setIsProgrammingOpen(false)}
        key={`programming-${gameState.selectedConstruct?.id}-${gameState.movementPairs?.length}-${gameState.tacticalPairs?.length}`}
      />

      <RewardSelection
        availableTriggers={gameState.availableRewardTriggers}
        availableActions={gameState.availableRewardActions}
        onSelectTrigger={gameState.selectRewardTrigger}
        onSelectAction={gameState.selectRewardAction}
        isOpen={gameState.showRewardSelection}
        rerollsRemaining={gameState.rerollsRemaining}
        onReroll={gameState.rerollRewards}
      />

      {/* Network Map Modal */}
      <NetworkMap
        layers={gameState.networkLayers}
        currentLayerIndex={gameState.currentLayerIndex}
        currentNodeIndex={gameState.currentNodeIndex}
        isOpen={isNetworkMapOpen}
        onClose={() => setIsNetworkMapOpen(false)}
      />

      {/* Codex component */}
      <Codex isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />
    </>
  )
}
