"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Trigger, Action } from "@/types/game"
import { Sparkles, RefreshCw } from "lucide-react"

interface RewardSelectionProps {
  availableTriggers: Trigger[]
  availableActions: Action[]
  onSelectTrigger: (trigger: Trigger) => void
  onSelectAction: (action: Action) => void
  isOpen: boolean
  rerollsRemaining: number
  onReroll: () => void
}

export function RewardSelection({
  availableTriggers,
  availableActions,
  onSelectTrigger,
  onSelectAction,
  isOpen,
  rerollsRemaining,
  onReroll,
}: RewardSelectionProps) {
  if (!isOpen) return null

  const allRewards: Array<{ type: "trigger" | "action"; item: Trigger | Action }> = [
    ...availableTriggers.map((t) => ({ type: "trigger" as const, item: t })),
    ...availableActions.map((a) => ({ type: "action" as const, item: a })),
  ]

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl border-2 sm:border-4 border-primary p-4 sm:p-8 my-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h2 className="text-xl sm:text-3xl font-bold text-primary">CHOOSE YOUR REWARD</h2>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <p className="text-xs sm:text-base text-muted-foreground px-2">
            Select one reward to unlock for your fighter
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4">
          {allRewards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm sm:text-base">All rewards unlocked!</p>
            </div>
          ) : (
            allRewards.map((reward, index) => {
              const isTrigger = reward.type === "trigger"
              const item = reward.item

              return (
                <Card
                  key={`${reward.type}-${item.id}-${index}`}
                  className={`p-3 sm:p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${
                    isTrigger ? "hover:border-accent" : "hover:border-secondary"
                  }`}
                  onClick={() => {
                    if (isTrigger) {
                      onSelectTrigger(item as Trigger)
                    } else {
                      onSelectAction(item as Action)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded ${
                            isTrigger ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"
                          }`}
                        >
                          {isTrigger ? "IF" : "THEN"}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-foreground">{item.name}</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                      {!isTrigger && (
                        <p className="text-xs text-accent mt-2">Cooldown: {(item as Action).cooldown}ms</p>
                      )}
                    </div>
                    <div
                      className={`font-bold text-xs sm:text-sm whitespace-nowrap ${
                        isTrigger ? "text-accent" : "text-secondary"
                      }`}
                    >
                      SELECT
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {allRewards.length > 0 && (
          <div className="flex items-center justify-center gap-3 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onReroll}
              disabled={rerollsRemaining <= 0}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Reroll</span>
              <span className="text-xs text-muted-foreground">({rerollsRemaining} left)</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
