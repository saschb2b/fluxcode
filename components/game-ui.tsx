"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProgrammingPanel } from "@/components/programming-panel"
import { RewardSelection } from "@/components/reward-selection"
import type { GameState } from "@/types/game"
import { Code } from "lucide-react"

interface GameUIProps {
  gameState: GameState
  onNewRun: () => void // Added onNewRun prop
}

export function GameUI({ gameState, onNewRun }: GameUIProps) {
  const [isProgrammingOpen, setIsProgrammingOpen] = useState(false)

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top HUD */}
        <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-auto">
          <Card className="px-6 py-3 bg-card/90 backdrop-blur border-2 border-primary">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Wave</div>
                <div className="text-2xl font-bold text-primary">{gameState.wave}</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Status</div>
                <div className="text-sm font-bold text-foreground">
                  {gameState.battleState === "idle" && "READY"}
                  {gameState.battleState === "fighting" && "FIGHTING"}
                  {gameState.battleState === "victory" && "VICTORY"}
                  {gameState.battleState === "defeat" && "DEFEAT"}
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Rules</div>
                <div className="text-2xl font-bold text-secondary">{gameState.triggerActionPairs.length}</div>
              </div>
            </div>
          </Card>
        </div>

        {gameState.battleState === "idle" && (
          <div className="absolute top-4 right-4 pointer-events-auto">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
              onClick={() => setIsProgrammingOpen(true)}
            >
              <Code className="w-5 h-5 mr-2" />
              PROGRAM
            </Button>
          </div>
        )}

        {/* Battle Controls */}
        {gameState.battleState === "idle" && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
            <Button
              size="lg"
              className="text-lg font-bold px-8 py-6 bg-primary hover:bg-primary/80 border-2 border-primary-foreground shadow-lg"
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
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur pointer-events-auto">
              <Card className="p-8 bg-card border-4 border-primary max-w-md">
                <h2 className="text-4xl font-bold text-center mb-4">
                  {gameState.battleState === "victory" ? (
                    <span className="text-primary">VICTORY!</span>
                  ) : (
                    <span className="text-destructive">DEFEAT</span>
                  )}
                </h2>
                <p className="text-center text-muted-foreground mb-6">
                  {gameState.battleState === "victory"
                    ? "You earned a new trigger or action!"
                    : "Your run is over. Try again!"}
                </p>
                <div className="flex gap-4">
                  <Button className="flex-1 bg-transparent" variant="outline" onClick={onNewRun}>
                    New Run
                  </Button>
                  {gameState.battleState === "victory" && (
                    <Button className="flex-1 bg-primary hover:bg-primary/80" onClick={gameState.nextWave}>
                      Next Wave
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
      </div>

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
    </>
  )
}
