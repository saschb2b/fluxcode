"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProgrammingPanel } from "@/components/programming-panel"
import { RewardSelection } from "@/components/reward-selection"
import { Codex } from "@/components/codex"
import type { GameState } from "@/types/game"
import { Code, BookOpen } from "lucide-react"

interface GameUIProps {
  gameState: GameState
  onNewRun: () => void // Added onNewRun prop
}

export function GameUI({ gameState, onNewRun }: GameUIProps) {
  const [isProgrammingOpen, setIsProgrammingOpen] = useState(false)
  const [isCodexOpen, setIsCodexOpen] = useState(false)

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top HUD */}
        <div className="absolute top-2 sm:top-4 left-0 right-0 flex justify-center pointer-events-auto px-2">
          <Card className="px-3 sm:px-6 py-2 sm:py-3 bg-card/90 backdrop-blur border-2 border-primary">
            <div className="flex items-center gap-3 sm:gap-8">
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
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Rules</div>
                <div className="text-lg sm:text-2xl font-bold text-secondary">
                  {gameState.triggerActionPairs.length}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {gameState.battleState === "idle" && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 pointer-events-auto">
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base active:scale-95"
                onClick={() => setIsCodexOpen(true)}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">CODEX</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base active:scale-95"
                onClick={() => setIsProgrammingOpen(true)}
              >
                <Code className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">PROGRAM</span>
              </Button>
            </div>
          </div>
        )}

        {/* Battle Controls */}
        {gameState.battleState === "idle" && (
          <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center pointer-events-auto px-4">
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
                <p className="text-center text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  {gameState.battleState === "victory"
                    ? "You earned a new trigger or action!"
                    : "Your run is over. Try again!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
