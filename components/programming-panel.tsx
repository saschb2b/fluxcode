"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Trigger, Action, TriggerActionPair } from "@/types/game"
import { X, Plus, ChevronUp, ChevronDown, Trash2, Info, Zap } from "lucide-react"

interface ProgrammingPanelProps {
  pairs: TriggerActionPair[]
  unlockedTriggers: Trigger[]
  unlockedActions: Action[]
  onAddPair: (trigger: Trigger, action: Action) => void
  onRemovePair: (index: number) => void
  onUpdatePriority: (index: number, priority: number) => void
  isOpen: boolean
  onClose: () => void
}

export function ProgrammingPanel({
  pairs,
  unlockedTriggers,
  unlockedActions,
  onAddPair,
  onRemovePair,
  onUpdatePriority,
  isOpen,
  onClose,
}: ProgrammingPanelProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null)
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [enabledStates, setEnabledStates] = useState<Record<number, boolean>>({})
  const [formStep, setFormStep] = useState<"select-type" | "select-trigger" | "select-action" | "confirm">(
    "select-type",
  )

  const handleAddPair = () => {
    if (selectedTrigger && selectedAction) {
      onAddPair(selectedTrigger, selectedAction)
      setSelectedTrigger(null)
      setSelectedAction(null)
      setFormStep("select-type")
    }
  }

  const handleResetForm = () => {
    setSelectedTrigger(null)
    setSelectedAction(null)
    setFormStep("select-type")
  }

  const sortedPairsWithIndices = pairs
    .map((pair, originalIndex) => ({ pair, originalIndex }))
    .sort((a, b) => b.pair.priority - a.pair.priority)

  const movePairUp = (displayIndex: number) => {
    if (displayIndex > 0) {
      const currentItem = sortedPairsWithIndices[displayIndex]
      const aboveItem = sortedPairsWithIndices[displayIndex - 1]

      const tempPriority = currentItem.pair.priority
      onUpdatePriority(currentItem.originalIndex, aboveItem.pair.priority)
      onUpdatePriority(aboveItem.originalIndex, tempPriority)
    }
  }

  const movePairDown = (displayIndex: number) => {
    if (displayIndex < sortedPairsWithIndices.length - 1) {
      const currentItem = sortedPairsWithIndices[displayIndex]
      const belowItem = sortedPairsWithIndices[displayIndex + 1]

      const tempPriority = currentItem.pair.priority
      onUpdatePriority(currentItem.originalIndex, belowItem.pair.priority)
      onUpdatePriority(belowItem.originalIndex, tempPriority)
    }
  }

  const toggleEnabled = (index: number) => {
    setEnabledStates((prev) => ({
      ...prev,
      [index]: !(prev[index] ?? true),
    }))
  }

  if (!isOpen) return null

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950 border-2 border-amber-600/40 shadow-2xl shadow-amber-900/30">
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-amber-600/30 bg-gradient-to-r from-slate-900/80 to-transparent">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg sm:text-2xl font-bold border-2 border-amber-500/50">
                P1
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-amber-400 tracking-wide">Battle Protocols</h2>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 hidden sm:block">
                  Configure your fighter's AI behavior
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-full h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col sm:flex-row min-h-0">
            <div className="w-full sm:w-96 h-[40%] sm:h-auto border-b sm:border-b-0 sm:border-r border-amber-600/30 bg-slate-900/30 overflow-y-auto sm:overflow-y-visible flex flex-col">
              <div className="p-3 sm:p-6 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <div className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
                    Add Protocol
                  </div>
                  {formStep !== "select-type" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetForm}
                      className="text-xs text-slate-500 hover:text-slate-300 h-6 px-2"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`flex-1 h-1 rounded ${formStep !== "select-type" ? "bg-amber-500" : "bg-slate-700"}`}
                  />
                  <div
                    className={`flex-1 h-1 rounded ${selectedTrigger && selectedAction ? "bg-amber-500" : "bg-slate-700"}`}
                  />
                </div>

                {/* Step: Initial Selection */}
                {formStep === "select-type" && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 mb-3">
                      Create a new protocol by selecting a condition and action:
                    </p>
                    <Button
                      className="w-full h-16 bg-gradient-to-r from-cyan-600/20 to-cyan-700/20 hover:from-cyan-600/30 hover:to-cyan-700/30 border-2 border-cyan-500/30 text-cyan-200 font-bold justify-start px-4"
                      onClick={() => setFormStep("select-trigger")}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Zap className="w-6 h-6 text-cyan-400" />
                        <div className="text-left">
                          <div className="text-sm">Select Condition</div>
                          <div className="text-xs text-cyan-400/70">When to trigger</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                )}

                {/* Step: Select Trigger */}
                {formStep === "select-trigger" && (
                  <div className="flex flex-col gap-2 flex-1 min-h-0">
                    <div className="text-xs text-slate-400 mb-1">
                      Select a condition ({unlockedTriggers.length} available):
                    </div>
                    <div className="h-[300px]">
                      <ScrollArea className="h-full">
                        <div className="space-y-1.5 pr-2">
                          {unlockedTriggers.map((trigger) => (
                            <button
                              key={trigger.id}
                              onClick={() => {
                                setSelectedTrigger(trigger)
                                setFormStep("select-action")
                              }}
                              className="w-full p-3 bg-slate-950/60 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-left transition-all active:scale-[0.98]"
                            >
                              <div className="font-medium text-sm text-cyan-200 mb-1">{trigger.name}</div>
                              <div className="text-xs text-slate-400 line-clamp-2">{trigger.description}</div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}

                {/* Step: Select Action */}
                {formStep === "select-action" && selectedTrigger && (
                  <div className="flex flex-col gap-2 flex-1 min-h-0">
                    <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded">
                      <div className="text-xs text-cyan-400 mb-0.5">Condition:</div>
                      <div className="text-sm text-cyan-200 font-medium">{selectedTrigger.name}</div>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">
                      Select an action ({unlockedActions.length} available):
                    </div>
                    <div className="h-[250px]">
                      <ScrollArea className="h-full">
                        <div className="space-y-1.5 pr-2">
                          {unlockedActions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => {
                                setSelectedAction(action)
                                setFormStep("confirm")
                              }}
                              className="w-full p-3 bg-slate-950/60 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/50 rounded-lg text-left transition-all active:scale-[0.98]"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="font-medium text-sm text-rose-200">{action.name}</div>
                                <div className="text-xs text-amber-400 shrink-0">{action.cooldown}ms</div>
                              </div>
                              <div className="text-xs text-slate-400 line-clamp-2">{action.description}</div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}

                {/* Step: Confirm */}
                {formStep === "confirm" && selectedTrigger && selectedAction && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400 mb-2">Review your protocol:</div>

                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="text-xs text-cyan-400 mb-1">IF (Condition):</div>
                      <div className="text-sm text-cyan-200 font-medium mb-1">{selectedTrigger.name}</div>
                      <div className="text-xs text-slate-400">{selectedTrigger.description}</div>
                    </div>

                    <div className="flex justify-center">
                      <div className="text-amber-400 text-2xl">↓</div>
                    </div>

                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                      <div className="text-xs text-rose-400 mb-1">THEN (Action):</div>
                      <div className="text-sm text-rose-200 font-medium mb-1">{selectedAction.name}</div>
                      <div className="text-xs text-slate-400 mb-2">{selectedAction.description}</div>
                      <div className="text-xs text-amber-400">Cooldown: {selectedAction.cooldown}ms</div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-11 border-slate-600 text-slate-300 bg-transparent"
                        onClick={handleResetForm}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 h-11 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold"
                        onClick={handleAddPair}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Protocol
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-700 hidden sm:block">
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>• Protocols execute top to bottom</p>
                    <p>• First matching condition wins</p>
                    <p>• Toggle ON/OFF to enable/disable</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-3 sm:p-6 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
                <div className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Active Protocols ({sortedPairsWithIndices.length}/12)
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                  {unlockedTriggers.length} conditions • {unlockedActions.length} actions unlocked
                </div>
              </div>

              <ScrollArea className="flex-1">
                {sortedPairsWithIndices.length === 0 ? (
                  <div className="text-center text-slate-600 py-8 sm:py-16">
                    <div className="text-3xl sm:text-5xl mb-2 sm:mb-4">◇</div>
                    <p className="text-xs sm:text-sm">No protocols configured</p>
                    <p className="text-[10px] sm:text-xs mt-1 sm:mt-2">Add your first protocol to begin</p>
                  </div>
                ) : (
                  sortedPairsWithIndices.map(({ pair, originalIndex }, displayIndex) => {
                    const isEnabled = enabledStates[originalIndex] ?? true
                    const isAllyTarget =
                      pair.trigger.name.toLowerCase().includes("ally") ||
                      pair.trigger.name.toLowerCase().includes("self") ||
                      pair.action.name.toLowerCase().includes("heal") ||
                      pair.action.name.toLowerCase().includes("dodge")
                    const barColor = isAllyTarget ? "from-cyan-600/40 to-blue-700/40" : "from-rose-600/40 to-red-700/40"
                    const borderColor = isAllyTarget ? "border-cyan-500/30" : "border-rose-500/30"
                    const textColor = isAllyTarget ? "text-cyan-100" : "text-rose-100"

                    return (
                      <div
                        key={originalIndex}
                        className={`group relative flex items-center gap-2 sm:gap-3 h-12 sm:h-14 rounded-lg border ${borderColor} bg-gradient-to-r ${barColor} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${!isEnabled ? "opacity-40" : ""}`}
                      >
                        <div className="flex items-center justify-center w-12 sm:w-16 h-full border-r border-slate-700/50">
                          <button
                            onClick={() => toggleEnabled(originalIndex)}
                            className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full transition-colors ${
                              isEnabled ? "bg-amber-500" : "bg-slate-700"
                            } relative`}
                          >
                            <div
                              className={`absolute top-0.5 ${isEnabled ? "right-0.5" : "left-0.5"} w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white transition-all shadow-lg`}
                            />
                            <span
                              className={`absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold ${isEnabled ? "text-white" : "text-slate-500"}`}
                            >
                              {isEnabled ? "ON" : "OFF"}
                            </span>
                          </button>
                        </div>

                        <div className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 border border-amber-500/50 text-amber-400 font-bold text-xs sm:text-sm">
                          {displayIndex + 1}
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex-1 flex items-center gap-2 sm:gap-4 ${textColor} font-medium text-xs sm:text-sm cursor-help overflow-hidden`}
                            >
                              <span className="min-w-0 truncate">{pair.trigger.name}</span>
                              <span className="text-amber-400 shrink-0">→</span>
                              <span className="min-w-0 truncate">{pair.action.name}</span>
                              <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="max-w-md bg-slate-900 border-amber-500/30 text-slate-200 z-[300]"
                          >
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-cyan-400 font-semibold">IF:</span>{" "}
                                <span className="text-slate-300">{pair.trigger.description}</span>
                              </div>
                              <div>
                                <span className="text-rose-400 font-semibold">THEN:</span>{" "}
                                <span className="text-slate-300">{pair.action.description}</span>
                              </div>
                              <div className="text-amber-400 pt-1 border-t border-slate-700">
                                Cooldown: {pair.action.cooldown}ms
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex items-center gap-0.5 sm:gap-1 pr-2 sm:pr-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 active:scale-90"
                            onClick={() => movePairUp(displayIndex)}
                            disabled={displayIndex === 0}
                          >
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 active:scale-90"
                            onClick={() => movePairDown(displayIndex)}
                            disabled={displayIndex === sortedPairsWithIndices.length - 1}
                          >
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 active:scale-90"
                            onClick={() => onRemovePair(originalIndex)}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-amber-600/30 bg-gradient-to-r from-slate-900/80 to-transparent flex justify-end">
            <Button
              onClick={onClose}
              size="lg"
              className="px-6 sm:px-8 h-10 sm:h-12 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold tracking-wide shadow-lg text-sm sm:text-base active:scale-95"
            >
              Done
            </Button>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  )
}
