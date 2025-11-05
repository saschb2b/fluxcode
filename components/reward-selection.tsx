"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Trigger, Action } from "@/types/game"
import { Sparkles } from "lucide-react"

interface RewardSelectionProps {
  availableTriggers: Trigger[]
  availableActions: Action[]
  onSelectTrigger: (trigger: Trigger) => void
  onSelectAction: (action: Action) => void
  isOpen: boolean
}

export function RewardSelection({
  availableTriggers,
  availableActions,
  onSelectTrigger,
  onSelectAction,
  isOpen,
}: RewardSelectionProps) {
  const [selectedType, setSelectedType] = useState<"trigger" | "action" | null>(null)

  if (!isOpen) return null

  const hasNewTriggers = availableTriggers.length > 0
  const hasNewActions = availableActions.length > 0

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-4 border-primary p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-primary">CHOOSE YOUR REWARD</h2>
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Select a new trigger or action to unlock for your fighter</p>
        </div>

        {!selectedType ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Trigger Option */}
            <Card
              className={`p-6 border-2 cursor-pointer transition-all hover:border-accent hover:shadow-lg ${
                !hasNewTriggers ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => hasNewTriggers && setSelectedType("trigger")}
            >
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-accent">IF</div>
                <h3 className="text-xl font-bold text-foreground">New Trigger</h3>
                <p className="text-sm text-muted-foreground">Unlock a new condition to detect battle situations</p>
                {hasNewTriggers && (
                  <div className="text-xs text-primary font-bold">{availableTriggers.length} available</div>
                )}
                {!hasNewTriggers && <div className="text-xs text-destructive font-bold">All unlocked!</div>}
              </div>
            </Card>

            {/* Action Option */}
            <Card
              className={`p-6 border-2 cursor-pointer transition-all hover:border-secondary hover:shadow-lg ${
                !hasNewActions ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => hasNewActions && setSelectedType("action")}
            >
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-secondary">THEN</div>
                <h3 className="text-xl font-bold text-foreground">New Action</h3>
                <p className="text-sm text-muted-foreground">Unlock a new ability for your fighter to execute</p>
                {hasNewActions && (
                  <div className="text-xs text-primary font-bold">{availableActions.length} available</div>
                )}
                {!hasNewActions && <div className="text-xs text-destructive font-bold">All unlocked!</div>}
              </div>
            </Card>
          </div>
        ) : selectedType === "trigger" ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)} className="mb-4">
              ← Back
            </Button>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {availableTriggers.map((trigger) => (
                <Card
                  key={trigger.id}
                  className="p-4 border-2 cursor-pointer hover:border-accent transition-all"
                  onClick={() => onSelectTrigger(trigger)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-1">{trigger.name}</h4>
                      <p className="text-sm text-muted-foreground">{trigger.description}</p>
                    </div>
                    <div className="text-accent font-bold text-sm">SELECT</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)} className="mb-4">
              ← Back
            </Button>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {availableActions.map((action) => (
                <Card
                  key={action.id}
                  className="p-4 border-2 cursor-pointer hover:border-secondary transition-all"
                  onClick={() => onSelectAction(action)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-1">{action.name}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                      <p className="text-xs text-accent mt-2">Cooldown: {action.cooldown}ms</p>
                    </div>
                    <div className="text-secondary font-bold text-sm">SELECT</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
