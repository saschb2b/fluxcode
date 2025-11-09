"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Zap, Trophy, X } from "lucide-react"
import { PROTOCOL_MASTERIES } from "@/lib/protocol-mastery"
import type { PlayerMasteryProgress } from "@/lib/protocol-mastery"
import { Button } from "@/components/ui/button"

interface ProtocolMasteryTrackerProps {
  masteryProgress?: PlayerMasteryProgress
  compact?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function ProtocolMasteryTracker({
  masteryProgress,
  compact = false,
  isOpen = false,
  onClose,
}: ProtocolMasteryTrackerProps) {
  const progress = masteryProgress || {
    completedMasteries: [],
    inProgressMasteries: {},
    currentRunStats: {
      triggerUsage: {},
      actionUsage: {},
      damageByType: {},
      pairExecutions: [],
    },
  }

  const activeMasteries = PROTOCOL_MASTERIES.filter((m) => !progress.completedMasteries.includes(m.id)).slice(
    0,
    compact ? 3 : 6,
  )

  if (isOpen && onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(0,255,255,0.3)]">
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/30">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wider">Protocol Mastery</h2>
              <Badge variant="outline" className="ml-2">
                {progress.completedMasteries.length} / {PROTOCOL_MASTERIES.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROTOCOL_MASTERIES.map((mastery) => {
                const isCompleted = progress.completedMasteries.includes(mastery.id)
                const inProgress = progress.inProgressMasteries[mastery.id]

                return (
                  <Card
                    key={mastery.id}
                    className={`p-4 border-2 transition-all ${
                      isCompleted
                        ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50"
                        : "bg-slate-900/60 border-slate-700/50 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? "bg-green-500/20" : "bg-slate-800/50"
                        }`}
                        style={{ borderColor: mastery.iconColor, borderWidth: 2 }}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Zap className="w-5 h-5" style={{ color: mastery.iconColor }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white truncate">{mastery.name}</h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5"
                            style={{ borderColor: mastery.iconColor, color: mastery.iconColor }}
                          >
                            {mastery.category}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-400 mb-2">{mastery.description}</p>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-cyan-400 font-mono font-bold">
                            +{mastery.reward.cipherFragmentBonus} CF
                          </span>
                          {mastery.reward.cipherFragmentMultiplier && (
                            <span className="text-yellow-400 font-mono">
                              +{Math.floor(mastery.reward.cipherFragmentMultiplier * 100)}% bonus
                            </span>
                          )}
                        </div>

                        {inProgress && !isCompleted && (
                          <div className="mt-2">
                            <Progress value={(inProgress.currentCount / (mastery.requirement.count || 1)) * 100} />
                            <div className="text-[10px] text-slate-500 mt-1">
                              Progress: {inProgress.currentCount} / {mastery.requirement.count}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <Card className="bg-slate-900/80 border-cyan-500/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Active Challenges</h3>
        </div>
        <div className="space-y-2">
          {activeMasteries.map((mastery) => (
            <div key={mastery.id} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300">{mastery.name}</span>
                <span className="text-cyan-400 font-mono">+{mastery.reward.cipherFragmentBonus} CF</span>
              </div>
              <div className="text-[10px] text-slate-500">{mastery.description}</div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">Protocol Mastery</h2>
        <Badge variant="outline" className="ml-auto">
          {progress.completedMasteries.length} / {PROTOCOL_MASTERIES.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROTOCOL_MASTERIES.map((mastery) => {
          const isCompleted = progress.completedMasteries.includes(mastery.id)
          const inProgress = progress.inProgressMasteries[mastery.id]

          return (
            <Card
              key={mastery.id}
              className={`p-4 border-2 transition-all ${
                isCompleted
                  ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50"
                  : "bg-slate-900/60 border-slate-700/50 hover:border-cyan-500/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-green-500/20" : "bg-slate-800/50"
                  }`}
                  style={{ borderColor: mastery.iconColor, borderWidth: 2 }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Zap className="w-5 h-5" style={{ color: mastery.iconColor }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white truncate">{mastery.name}</h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5"
                      style={{ borderColor: mastery.iconColor, color: mastery.iconColor }}
                    >
                      {mastery.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">{mastery.description}</p>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-cyan-400 font-mono font-bold">+{mastery.reward.cipherFragmentBonus} CF</span>
                    {mastery.reward.cipherFragmentMultiplier && (
                      <span className="text-yellow-400 font-mono">
                        +{Math.floor(mastery.reward.cipherFragmentMultiplier * 100)}% bonus
                      </span>
                    )}
                  </div>

                  {inProgress && !isCompleted && (
                    <div className="mt-2">
                      <Progress value={(inProgress.currentCount / (mastery.requirement.count || 1)) * 100} />
                      <div className="text-[10px] text-slate-500 mt-1">
                        Progress: {inProgress.currentCount} / {mastery.requirement.count}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
