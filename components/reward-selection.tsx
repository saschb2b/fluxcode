"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Trigger, Action, DamageType } from "@/types/game"
import { Sparkles, RefreshCw, Zap, Shield, Activity } from "lucide-react"
import { useState } from "react"

interface RewardSelectionProps {
  availableTriggers: Trigger[]
  availableActions: Action[]
  onSelectTrigger: (trigger: Trigger) => void
  onSelectAction: (action: Action) => void
  isOpen: boolean
  rerollsRemaining: number
  onReroll: () => void
}

const DAMAGE_TYPE_COLORS: Record<DamageType, { bg: string; text: string; border: string; glow: string }> = {
  kinetic: { bg: "bg-gray-500/20", text: "text-gray-300", border: "border-gray-500/50", glow: "shadow-gray-500/20" },
  energy: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/50", glow: "shadow-blue-500/20" },
  thermal: {
    bg: "bg-orange-500/20",
    text: "text-orange-300",
    border: "border-orange-500/50",
    glow: "shadow-orange-500/20",
  },
  viral: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/50", glow: "shadow-green-500/20" },
  corrosive: { bg: "bg-lime-500/20", text: "text-lime-300", border: "border-lime-500/50", glow: "shadow-lime-500/20" },
  concussion: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/50", glow: "shadow-red-500/20" }, // Renamed from explosive
  glacial: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/50", glow: "shadow-cyan-500/20" },
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
  const [isIntegrating, setIsIntegrating] = useState(false)
  const [selectedReward, setSelectedReward] = useState<string>("")

  if (!isOpen) return null

  const handleRewardSelection = (callback: () => void, rewardName: string) => {
    setSelectedReward(rewardName)
    setIsIntegrating(true)

    setTimeout(() => {
      callback()
      setIsIntegrating(false)
      setSelectedReward("")
    }, 2000)
  }

  const allRewards: Array<{ type: "trigger" | "action"; item: Trigger | Action }> = [
    ...availableTriggers.map((t) => ({ type: "trigger" as const, item: t })),
    ...availableActions.map((a) => ({ type: "action" as const, item: a })),
  ]

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl border-2 border-cyan-500/50 bg-black/90 p-4 sm:p-8 my-auto relative shadow-2xl shadow-cyan-500/20">
        {isIntegrating && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/95 backdrop-blur-md rounded-lg">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-lg animate-spin-slow" />
                <div className="absolute inset-2 border-4 border-primary/50 rounded-lg animate-spin-reverse" />
                <div className="absolute inset-4 border-4 border-magenta-500/30 rounded-lg animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-primary animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-lg sm:text-xl font-bold text-cyan-400 font-mono tracking-wider animate-pulse-glow">
                  INTEGRATING PROTOCOL
                </div>
                <div className="text-xs sm:text-sm text-cyan-400/80 font-mono truncate max-w-[250px]">
                  {selectedReward}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-mono">
                  <span className="animate-typing-1">.</span>
                  <span className="animate-typing-2">.</span>
                  <span className="animate-typing-3">.</span>
                </div>
              </div>

              <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none rounded-lg">
                <div className="absolute inset-0 animate-binary-scroll font-mono text-xs text-green-400 leading-tight">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i}>{Math.random().toString(2).substring(2, 40)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400/60">BREACH_TERMINAL v2.4.1</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono tracking-tight mb-1">
                PROTOCOL ACQUISITION
              </h2>
              <p className="text-xs sm:text-sm text-cyan-400/70 font-mono">{">"} SELECT_MODULE FOR INTEGRATION</p>
            </div>
            <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-2">
          {allRewards.length === 0 ? (
            <div className="text-center py-8 text-cyan-400/60 font-mono">
              <p className="text-sm sm:text-base">{">"} ALL_PROTOCOLS_UNLOCKED</p>
            </div>
          ) : (
            allRewards.map((reward, index) => {
              const isTrigger = reward.type === "trigger"
              const item = reward.item
              const action = !isTrigger ? (item as Action) : null
              const damageType = action?.damageType
              const colors = damageType ? DAMAGE_TYPE_COLORS[damageType] : null
              const coreType = action?.coreType

              return (
                <Card
                  key={`${reward.type}-${item.id}-${index}`}
                  className={`p-3 sm:p-4 border-2 cursor-pointer transition-all bg-black/60 ${
                    isTrigger
                      ? "border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 hover:bg-cyan-500/5"
                      : damageType === "kinetic"
                        ? "border-gray-500/40 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-500/30 hover:bg-gray-500/5"
                        : damageType === "energy"
                          ? "border-blue-500/40 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30 hover:bg-blue-500/5"
                          : damageType === "thermal"
                            ? "border-orange-500/40 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/30 hover:bg-orange-500/5"
                            : damageType === "viral"
                              ? "border-green-500/40 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30 hover:bg-green-500/5"
                              : damageType === "corrosive"
                                ? "border-lime-500/40 hover:border-lime-400 hover:shadow-lg hover:shadow-lime-500/30 hover:bg-lime-500/5"
                                : damageType === "concussion"
                                  ? "border-red-500/40 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/30 hover:bg-red-500/5"
                                  : damageType === "glacial"
                                    ? "border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 hover:bg-cyan-500/5"
                                    : "border-magenta-500/40 hover:border-magenta-400 hover:shadow-lg hover:shadow-magenta-500/30 hover:bg-magenta-500/5"
                  }`}
                  onClick={() => {
                    if (isTrigger) {
                      handleRewardSelection(() => onSelectTrigger(item as Trigger), item.name)
                    } else {
                      handleRewardSelection(() => onSelectAction(item as Action), item.name)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                            isTrigger
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                              : "bg-magenta-500/20 text-magenta-400 border-magenta-500/50"
                          }`}
                        >
                          {isTrigger ? "CONDITION" : "EXECUTION"}
                        </span>
                        {!isTrigger && coreType && (
                          <span
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                              coreType === "movement"
                                ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                                : "bg-orange-500/20 text-orange-400 border-orange-500/50"
                            }`}
                          >
                            {coreType === "movement" ? "MOVEMENT" : "TACTICAL"}
                          </span>
                        )}
                        {damageType && (
                          <span
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${colors!.bg} ${colors!.text} ${colors!.border}`}
                          >
                            {damageType.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-foreground font-mono mb-1">
                        {">"} {item.name.toUpperCase()}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed">
                        {item.description}
                      </p>
                      {!isTrigger && (
                        <p className="text-xs text-cyan-400/70 mt-2 font-mono">
                          COOLDOWN: {(item as Action).cooldown}ms
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Sparkles
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${isTrigger ? "text-cyan-400" : "text-magenta-400"} animate-pulse`}
                      />
                      <span
                        className={`font-bold text-xs font-mono ${isTrigger ? "text-cyan-400" : "text-magenta-400"}`}
                      >
                        SELECT
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {allRewards.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-cyan-500/30">
            <div className="text-xs font-mono text-cyan-400/60">
              {">"} REROLL_AVAILABLE: {rerollsRemaining}/3
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReroll}
              disabled={rerollsRemaining <= 0}
              className={`gap-2 font-mono border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 ${
                rerollsRemaining <= 0 ? "opacity-30 cursor-not-allowed" : "hover:shadow-lg hover:shadow-cyan-500/20"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${rerollsRemaining > 0 ? "animate-spin-slow" : ""}`} />
              <span>REROLL</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
