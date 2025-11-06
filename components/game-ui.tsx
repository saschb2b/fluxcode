"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProgrammingPanel } from "@/components/programming-panel"
import { RewardSelection } from "@/components/reward-selection"
import { Codex } from "@/components/codex"
import { BattleStatsChart } from "@/components/battle-stats-chart"
import { EnemyIntroduction } from "@/components/enemy-introduction"
import type { GameState } from "@/types/game"
import { Code, Coins, TrendingUp } from "lucide-react"
import { calculateCurrencyReward } from "@/lib/meta-progression"

interface GameUIProps {
  gameState: GameState
  onNewRun: () => void
  onOpenMetaShop: () => void
}

export function GameUI({ gameState, onNewRun, onOpenMetaShop }: GameUIProps) {
  const [isProgrammingOpen, setIsProgrammingOpen] = useState(false)
  const [isCodexOpen, setIsCodexOpen] = useState(false)

  const currencyEarned = gameState.battleState === "defeat" ? calculateCurrencyReward(gameState.wave - 1) : 0

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-auto px-2 sm:px-4">
          <Card className="px-3 sm:px-6 py-2 sm:py-3 bg-card/90 backdrop-blur border-2 border-primary">
            <div className="flex items-center gap-2 sm:gap-8">
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Wave</div>
                <div className="text-lg sm:text-2xl font-bold text-primary">{gameState.wave}</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Status</div>
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  {gameState.battleState === "idle" && "READY"}
                  {gameState.battleState === "fighting" && "FIGHTING"}
                  {gameState.battleState === "victory" && "VICTORY"}
                  {gameState.battleState === "defeat" && "DEFEAT"}
                </div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Protocols</div>
                <div className="text-lg sm:text-2xl font-bold text-secondary">
                  {gameState.triggerActionPairs.length}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Battle Controls */}
        {gameState.battleState === "idle" && (
          <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex flex-col items-center gap-3 pointer-events-auto px-4">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-card/90 backdrop-blur h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold shadow-lg active:scale-95 w-full sm:w-auto max-w-xs"
              onClick={() => setIsProgrammingOpen(true)}
            >
              <Code className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              ADJUST PROTOCOLS
            </Button>
            <Button
              size="lg"
              className="text-base sm:text-lg font-bold px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/80 border-2 border-primary-foreground shadow-lg active:scale-95 w-full sm:w-auto max-w-xs"
              onClick={gameState.startBattle}
              disabled={gameState.triggerActionPairs.length === 0}
            >
              START BATTLE
            </Button>
          </div>
        )}

        {/* Victory/Defeat Screen */}
        {(gameState.battleState === "victory" || gameState.battleState === "defeat") &&
          !gameState.showRewardSelection && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur pointer-events-auto p-4">
              <Card className="p-6 sm:p-8 bg-card border-4 border-primary max-w-md w-full">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4">
                  {gameState.battleState === "victory" ? (
                    <span className="text-primary">VICTORY!</span>
                  ) : (
                    <span className="text-destructive">DEFEAT</span>
                  )}
                </h2>

                {gameState.battleState === "defeat" && currencyEarned > 0 && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <Coins className="w-5 h-5" />
                      <span className="font-bold text-lg">+{currencyEarned} Currency Earned</span>
                    </div>
                    <p className="text-center text-xs text-yellow-400/80 mt-1">
                      Completed {gameState.wave - 1} wave{gameState.wave - 1 !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                <p className="text-center text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  {gameState.battleState === "victory"
                    ? "You earned a new trigger or action!"
                    : "Your run is over. Try again!"}
                </p>

                {gameState.battleHistory && gameState.battleHistory.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <BattleStatsChart history={gameState.battleHistory} />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {gameState.battleState === "defeat" && gameState.playerProgress.totalRuns > 1 && (
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12 active:scale-95"
                      onClick={onOpenMetaShop}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrades
                    </Button>
                  )}
                  <Button className="flex-1 bg-transparent h-12 active:scale-95" variant="outline" onClick={onNewRun}>
                    New Run
                  </Button>
                  {gameState.battleState === "victory" && (
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/80 h-12 active:scale-95"
                      onClick={gameState.nextWave}
                    >
                      Next Wave
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
      </div>

      {/* Enemy Introduction Screen */}
      {gameState.showEnemyIntro && (
        <EnemyIntroduction
          wave={gameState.wave}
          enemyCustomization={gameState.enemyCustomization}
          enemyMaxHp={gameState.enemy.maxHp}
          onBeginBattle={gameState.continueAfterIntro}
          isOpen={gameState.showEnemyIntro}
        />
      )}

      <ProgrammingPanel
        pairs={gameState.triggerActionPairs}
        unlockedTriggers={gameState.unlockedTriggers}
        unlockedActions={gameState.unlockedActions}
        onAddPair={gameState.addTriggerActionPair}
        onRemovePair={gameState.removeTriggerActionPair}
        onUpdatePriority={gameState.updatePairPriority}
        isOpen={isProgrammingOpen}
        onClose={() => setIsProgrammingOpen(false)}
      />

      <RewardSelection
        availableTriggers={gameState.availableRewardTriggers}
        availableActions={gameState.availableRewardActions}
        onSelectTrigger={gameState.selectRewardTrigger}
        onSelectAction={gameState.selectRewardAction}
        isOpen={gameState.showRewardSelection}
      />

      {/* Codex component */}
      <Codex isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />
    </>
  )
}
