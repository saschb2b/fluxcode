"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Trigger, Action, TriggerActionPair } from "@/types/game"
import { X, Plus, ChevronUp, ChevronDown, Trash2, Zap, Edit2, Check } from "lucide-react"

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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTrigger, setEditTrigger] = useState<Trigger | null>(null)
  const [editAction, setEditAction] = useState<Action | null>(null)
  const [formStep, setFormStep] = useState<"select-type" | "select-trigger" | "select-action" | "confirm">(
    "select-type",
  )

  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddPair = () => {
    if (selectedTrigger && selectedAction) {
      onAddPair(selectedTrigger, selectedAction)
      setSelectedTrigger(null)
      setSelectedAction(null)
      setFormStep("select-type")
      setShowAddForm(false)
    }
  }

  const handleSaveEdit = (originalIndex: number) => {
    if (editTrigger && editAction) {
      const oldPriority = pairs[originalIndex].priority
      onRemovePair(originalIndex)
      onAddPair(editTrigger, editAction)
      const newIndex = pairs.length - 1
      onUpdatePriority(newIndex, oldPriority)

      setEditingIndex(null)
      setEditTrigger(null)
      setEditAction(null)
      setExpandedIndex(null)
    }
  }

  const handleStartEdit = (originalIndex: number) => {
    const pair = pairs[originalIndex]
    setEditingIndex(originalIndex)
    setEditTrigger(pair.trigger)
    setEditAction(pair.action)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditTrigger(null)
    setEditAction(null)
  }

  const handleResetForm = () => {
    setSelectedTrigger(null)
    setSelectedAction(null)
    setFormStep("select-type")
    setShowAddForm(false)
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
      <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 my-4 sm:my-6">
          <Card className="bg-gradient-to-br from-black/90 to-gray-900/90 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,255,255,0.4)]">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-950/95 to-black/95 border-b border-cyan-500/30 p-3 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg sm:text-2xl font-bold border-2 border-cyan-500/50">
                    P1
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl sm:text-3xl font-bold text-cyan-400 truncate"
                      style={{ fontFamily: "monospace" }}
                    >
                      BATTLE PROTOCOLS
                    </h2>
                    <p className="text-xs sm:text-sm text-cyan-300/70 mt-1 hidden sm:block">
                      Configure your fighter's AI behavior
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-red-500/20 hover:border-red-500 border border-transparent flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row min-h-0">
              {/* Left Panel - Add Protocol Section */}
              <div className="sm:w-96 border-b sm:border-b-0 sm:border-r border-cyan-500/30 bg-black/40 shrink-0 p-3 sm:p-6">
                {!showAddForm && (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-bold sm:hidden"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="text-sm">Add Protocol</div>
                      <div className="text-xs opacity-70">Condition → Action</div>
                    </div>
                  </Button>
                )}

                {(showAddForm || window.innerWidth >= 640) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl sm:text-2xl font-bold text-cyan-400" style={{ fontFamily: "monospace" }}>
                        ADD PROTOCOL
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                        className="text-xs text-cyan-300 hover:text-cyan-100 sm:hidden"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-xs sm:text-sm text-cyan-300/70">
                      Create a new protocol by selecting a condition and action:
                    </p>

                    <div className="flex items-center gap-2">
                      <div
                        className={`flex-1 h-1 rounded ${formStep !== "select-type" ? "bg-cyan-500" : "bg-gray-700"}`}
                      />
                      <div
                        className={`flex-1 h-1 rounded ${selectedTrigger && selectedAction ? "bg-cyan-500" : "bg-gray-700"}`}
                      />
                    </div>

                    {formStep === "select-type" && (
                      <Button
                        className="w-full h-16 bg-cyan-500 hover:bg-cyan-400 text-black font-bold justify-start px-4"
                        onClick={() => setFormStep("select-trigger")}
                      >
                        <Zap className="w-6 h-6 mr-3" />
                        <div className="text-left">
                          <div className="text-sm">Select Condition</div>
                          <div className="text-xs opacity-70">When to trigger</div>
                        </div>
                      </Button>
                    )}

                    {formStep === "select-trigger" && (
                      <div className="space-y-2">
                        <div className="text-xs text-cyan-300/70">
                          Select a condition ({unlockedTriggers.length} available):
                        </div>
                        <div className="h-[200px] sm:h-[300px]">
                          <ScrollArea className="h-full">
                            <div className="space-y-2 pr-2">
                              {unlockedTriggers.map((trigger) => (
                                <Button
                                  key={trigger.id}
                                  onClick={() => {
                                    setSelectedTrigger(trigger)
                                    setFormStep("select-action")
                                  }}
                                  variant="outline"
                                  className="w-full h-auto p-3 bg-black/50 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10 text-left justify-start"
                                >
                                  <div>
                                    <div className="font-medium text-sm text-cyan-200">{trigger.name}</div>
                                    <div className="text-xs text-cyan-300/50 mt-1">{trigger.description}</div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetForm}
                          className="w-full bg-black/50 border-cyan-500/30"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {formStep === "select-action" && selectedTrigger && (
                      <div className="space-y-2">
                        <Card className="p-3 bg-cyan-500/10 border border-cyan-500/30">
                          <div className="text-xs text-cyan-400 mb-1">Condition:</div>
                          <div className="text-sm text-cyan-200 font-medium">{selectedTrigger.name}</div>
                        </Card>
                        <div className="text-xs text-cyan-300/70">
                          Select an action ({unlockedActions.length} available):
                        </div>
                        <div className="h-[200px] sm:h-[250px]">
                          <ScrollArea className="h-full">
                            <div className="space-y-2 pr-2">
                              {unlockedActions.map((action) => (
                                <Button
                                  key={action.id}
                                  onClick={() => {
                                    setSelectedAction(action)
                                    setFormStep("confirm")
                                  }}
                                  variant="outline"
                                  className="w-full h-auto p-3 bg-black/50 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10 text-left justify-start"
                                >
                                  <div className="w-full">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <div className="font-medium text-sm text-cyan-200">{action.name}</div>
                                      <div className="text-xs text-cyan-400 shrink-0">{action.cooldown}ms</div>
                                    </div>
                                    <div className="text-xs text-cyan-300/50">{action.description}</div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetForm}
                          className="w-full bg-black/50 border-cyan-500/30"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {formStep === "confirm" && selectedTrigger && selectedAction && (
                      <div className="space-y-3">
                        <div className="text-xs text-cyan-300/70">Review your protocol:</div>

                        <Card className="p-3 bg-cyan-500/10 border border-cyan-500/30">
                          <div className="text-xs text-cyan-400 mb-1">
                            <span className="font-bold">IF</span> Condition:
                          </div>
                          <div className="text-sm text-cyan-200 font-medium mb-1">{selectedTrigger.name}</div>
                          <div className="text-xs text-cyan-300/50">{selectedTrigger.description}</div>
                        </Card>

                        <div className="flex justify-center">
                          <div className="text-cyan-400 text-2xl">↓</div>
                        </div>

                        <Card className="p-3 bg-green-500/10 border border-green-500/30">
                          <div className="text-xs text-green-400 mb-1">
                            <span className="font-bold">THEN</span> Action:
                          </div>
                          <div className="text-sm text-green-200 font-medium mb-1">{selectedAction.name}</div>
                          <div className="text-xs text-green-300/50 mb-2">{selectedAction.description}</div>
                          <div className="text-xs text-cyan-400">Cooldown: {selectedAction.cooldown}ms</div>
                        </Card>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1 h-11 border-red-500/50 hover:bg-red-500/20 bg-transparent text-red-300"
                            onClick={handleResetForm}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 h-11 bg-green-500 hover:bg-green-400 text-black font-bold"
                            onClick={handleAddPair}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-cyan-500/30 hidden sm:block">
                      <div className="text-xs text-cyan-300/50 space-y-1">
                        <p>• Protocols execute top to bottom</p>
                        <p>• First matching condition wins</p>
                        <p>• Toggle ON/OFF to enable/disable</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Active Protocols */}
              <div className="flex-1 flex flex-col p-3 sm:p-6 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-cyan-400" style={{ fontFamily: "monospace" }}>
                      ACTIVE PROTOCOLS
                    </h3>
                    <p className="text-xs sm:text-sm text-cyan-300/70 mt-1">
                      {sortedPairsWithIndices.length}/12 protocols configured
                    </p>
                  </div>
                  <div className="text-xs text-cyan-300/50 hidden sm:block">
                    {unlockedTriggers.length} conditions • {unlockedActions.length} actions
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full pr-2">
                    {sortedPairsWithIndices.length === 0 ? (
                      <Card className="p-8 border-2 border-dashed border-cyan-500/30 bg-black/20 text-center">
                        <p className="text-cyan-300/50">No protocols configured. Add one to get started.</p>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {sortedPairsWithIndices.map(({ pair, originalIndex }, displayIndex) => {
                          const isEnabled = enabledStates[originalIndex] ?? true
                          const isExpanded = expandedIndex === originalIndex
                          const isEditing = editingIndex === originalIndex

                          return (
                            <Card
                              key={originalIndex}
                              className={`p-4 border-2 border-cyan-500/30 bg-black/40 hover:border-cyan-500/50 transition-all ${!isEnabled ? "opacity-40" : ""}`}
                            >
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => toggleEnabled(originalIndex)}
                                  className={`shrink-0 w-10 h-6 sm:w-12 sm:h-7 rounded-full transition-colors ${
                                    isEnabled ? "bg-cyan-500" : "bg-gray-700"
                                  } relative`}
                                >
                                  <div
                                    className={`absolute top-0.5 ${isEnabled ? "right-0.5" : "left-0.5"} w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white transition-all shadow-lg`}
                                  />
                                </button>

                                <span className="text-xs sm:text-sm text-cyan-300/70 font-bold">
                                  #{displayIndex + 1}
                                </span>

                                <button
                                  onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                                  className="flex-1 text-left text-sm text-cyan-100 font-medium min-w-0"
                                >
                                  <span className="truncate block">
                                    {pair.trigger.name} <span className="text-cyan-400 mx-2">→</span> {pair.action.name}
                                  </span>
                                </button>

                                <button
                                  onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                                  className="shrink-0 text-cyan-400 hover:text-cyan-300"
                                >
                                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="border-t border-cyan-500/30 mt-4 pt-4 space-y-3">
                                  {!isEditing ? (
                                    <>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs text-cyan-300/70 mb-2 block">
                                            <span className="text-cyan-400 font-bold">IF</span> Trigger
                                          </label>
                                          <Card className="p-3 bg-cyan-500/10 border border-cyan-500/30">
                                            <div className="text-sm text-cyan-200 font-medium mb-1">
                                              {pair.trigger.name}
                                            </div>
                                            <div className="text-xs text-cyan-300/50">{pair.trigger.description}</div>
                                          </Card>
                                        </div>
                                        <div>
                                          <label className="text-xs text-cyan-300/70 mb-2 block">
                                            <span className="text-green-400 font-bold">THEN</span> Action
                                          </label>
                                          <Card className="p-3 bg-green-500/10 border border-green-500/30">
                                            <div className="text-sm text-green-200 font-medium mb-1">
                                              {pair.action.name}
                                            </div>
                                            <div className="text-xs text-green-300/50">{pair.action.description}</div>
                                            <div className="text-xs text-cyan-400 mt-2">
                                              Cooldown: {pair.action.cooldown}ms
                                            </div>
                                          </Card>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-4 gap-2">
                                        <Button
                                          variant="outline"
                                          className="h-12 border-cyan-500/30 hover:bg-cyan-500/20 bg-transparent flex-col gap-1"
                                          onClick={() => movePairUp(displayIndex)}
                                          disabled={displayIndex === 0}
                                        >
                                          <ChevronUp className="w-5 h-5" />
                                          <span className="text-[10px]">Up</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="h-12 border-cyan-500/30 hover:bg-cyan-500/20 bg-transparent flex-col gap-1"
                                          onClick={() => movePairDown(displayIndex)}
                                          disabled={displayIndex === sortedPairsWithIndices.length - 1}
                                        >
                                          <ChevronDown className="w-5 h-5" />
                                          <span className="text-[10px]">Down</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="h-12 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 bg-transparent flex-col gap-1"
                                          onClick={() => handleStartEdit(originalIndex)}
                                        >
                                          <Edit2 className="w-5 h-5" />
                                          <span className="text-[10px]">Edit</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="h-12 border-red-500/30 text-red-400 hover:bg-red-500/20 bg-transparent flex-col gap-1"
                                          onClick={() => {
                                            onRemovePair(originalIndex)
                                            setExpandedIndex(null)
                                          }}
                                        >
                                          <Trash2 className="w-5 h-5" />
                                          <span className="text-[10px]">Delete</span>
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="space-y-3">
                                        <div className="text-xs text-cyan-400 font-semibold">EDIT PROTOCOL</div>

                                        <div className="space-y-2">
                                          <div className="text-xs text-cyan-300/70">Condition:</div>
                                          <ScrollArea className="h-32 rounded border border-cyan-500/30 bg-black/50">
                                            <div className="p-2 space-y-1">
                                              {unlockedTriggers.map((trigger) => (
                                                <button
                                                  key={trigger.id}
                                                  onClick={() => setEditTrigger(trigger)}
                                                  className={`w-full p-2 rounded text-left text-xs transition-all ${
                                                    editTrigger?.id === trigger.id
                                                      ? "bg-cyan-500/30 border border-cyan-500"
                                                      : "bg-black/60 hover:bg-cyan-500/10 border border-transparent"
                                                  }`}
                                                >
                                                  <div className="font-medium text-cyan-200">{trigger.name}</div>
                                                </button>
                                              ))}
                                            </div>
                                          </ScrollArea>
                                        </div>

                                        <div className="space-y-2">
                                          <div className="text-xs text-cyan-300/70">Action:</div>
                                          <ScrollArea className="h-32 rounded border border-cyan-500/30 bg-black/50">
                                            <div className="p-2 space-y-1">
                                              {unlockedActions.map((action) => (
                                                <button
                                                  key={action.id}
                                                  onClick={() => setEditAction(action)}
                                                  className={`w-full p-2 rounded text-left text-xs transition-all ${
                                                    editAction?.id === action.id
                                                      ? "bg-green-500/30 border border-green-500"
                                                      : "bg-black/60 hover:bg-green-500/10 border border-transparent"
                                                  }`}
                                                >
                                                  <div className="font-medium text-green-200">{action.name}</div>
                                                </button>
                                              ))}
                                            </div>
                                          </ScrollArea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                          <Button
                                            variant="outline"
                                            className="h-11 border-red-500/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                                            onClick={handleCancelEdit}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            className="h-11 bg-green-500 hover:bg-green-400 text-black font-bold"
                                            onClick={() => handleSaveEdit(originalIndex)}
                                            disabled={!editTrigger || !editAction}
                                          >
                                            <Check className="w-4 h-4 mr-2" />
                                            Save
                                          </Button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gradient-to-t from-black/95 to-transparent border-t border-cyan-500/30 p-3 sm:p-6 flex justify-end">
              <Button
                onClick={onClose}
                className="px-6 sm:px-8 h-10 sm:h-12 bg-green-500 hover:bg-green-400 text-black font-bold text-sm"
              >
                Done
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
