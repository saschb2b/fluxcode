"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge" // Added Badge import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Added Select imports
import type { Trigger, Action, TriggerActionPair } from "@/types/game"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import { X, Plus, Trash2, Check, MoveUp, MoveDown } from "lucide-react" // Added MoveUp, MoveDown

interface ProgrammingPanelProps {
  pairs: TriggerActionPair[]
  movementPairs?: TriggerActionPair[]
  tacticalPairs?: TriggerActionPair[]
  maxMovementSlots?: number
  maxTacticalSlots?: number
  unlockedTriggers: Trigger[]
  unlockedActions: Action[]
  onAddPair: (trigger: Trigger, action: Action) => void
  onRemovePair: (index: number) => void
  onUpdatePriority: (index: number, priority: number) => void
  onTogglePair?: (index: number, enabled: boolean) => void
  onAddMovementPair?: (trigger: Trigger, action: Action) => void
  onAddTacticalPair?: (trigger: Trigger, action: Action) => void
  onRemoveMovementPair?: (index: number) => void
  onRemoveTacticalPair?: (index: number) => void
  isOpen: boolean
  onClose: () => void
}

export function ProgrammingPanel({
  pairs,
  movementPairs = [],
  tacticalPairs = [],
  maxMovementSlots = 6,
  maxTacticalSlots = 6,
  unlockedTriggers,
  unlockedActions,
  onAddPair,
  onRemovePair,
  onUpdatePriority,
  onTogglePair,
  onAddMovementPair,
  onAddTacticalPair,
  onRemoveMovementPair,
  onRemoveTacticalPair,
  isOpen,
  onClose,
}: ProgrammingPanelProps) {
  const safeTriggers = unlockedTriggers || []
  const safeActions = unlockedActions || []

  const movementActions = safeActions.filter((a) => {
    const actionDef = AVAILABLE_ACTIONS.find((def) => def.id === a.id)
    return actionDef?.coreType === "movement"
  })
  const tacticalActions = safeActions.filter((a) => {
    const actionDef = AVAILABLE_ACTIONS.find((def) => def.id === a.id)
    return actionDef?.coreType === "tactical"
  })

  const currentMovementPairs =
    movementPairs.length > 0
      ? movementPairs
      : pairs.filter((pair) => {
          const actionDef = AVAILABLE_ACTIONS.find((def) => def.id === pair.action.id)
          return actionDef?.coreType === "movement"
        })

  const currentTacticalPairs =
    tacticalPairs.length > 0
      ? tacticalPairs
      : pairs.filter((pair) => {
          const actionDef = AVAILABLE_ACTIONS.find((def) => def.id === pair.action.id)
          return actionDef?.coreType === "tactical"
        })

  const [editingMovementProtocols, setEditingMovementProtocols] = useState<
    Array<{ triggerId: string; actionId: string }>
  >([])
  const [editingTacticalProtocols, setEditingTacticalProtocols] = useState<
    Array<{ triggerId: string; actionId: string }>
  >([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const MAX_MOVEMENT_PROTOCOLS = maxMovementSlots
  const MAX_TACTICAL_PROTOCOLS = maxTacticalSlots

  useEffect(() => {
    console.log(
      "[v0] ProgrammingPanel initializing with movement pairs:",
      currentMovementPairs.length,
      "tactical pairs:",
      currentTacticalPairs.length,
    )
    setEditingMovementProtocols(
      currentMovementPairs.map((p) => ({
        triggerId: p.trigger.id,
        actionId: p.action.id,
      })),
    )
    setEditingTacticalProtocols(
      currentTacticalPairs.map((p) => ({
        triggerId: p.trigger.id,
        actionId: p.action.id,
      })),
    )
  }, [isOpen, movementPairs, tacticalPairs]) // Depend on the actual arrays, not just their lengths

  const addMovementProtocol = () => {
    if (editingMovementProtocols.length >= MAX_MOVEMENT_PROTOCOLS) return
    setEditingMovementProtocols([...editingMovementProtocols, { triggerId: "", actionId: "" }])
  }

  const addTacticalProtocol = () => {
    if (editingTacticalProtocols.length >= MAX_TACTICAL_PROTOCOLS) return
    setEditingTacticalProtocols([...editingTacticalProtocols, { triggerId: "", actionId: "" }])
  }

  const removeMovementProtocol = (index: number) => {
    setEditingMovementProtocols(editingMovementProtocols.filter((_, i) => i !== index))
    // Also remove from actual pairs
    const movementPairIndex = pairs.findIndex((p, i) => {
      const actionDef = AVAILABLE_ACTIONS.find((def) => def.id === p.action.id)
      return actionDef?.coreType === "movement" && currentMovementPairs.indexOf(p) === index
    })
    if (movementPairIndex !== -1) {
      onRemovePair(movementPairIndex)
    }
  }

  const removeTacticalProtocol = (index: number) => {
    setEditingTacticalProtocols(editingTacticalProtocols.filter((_, i) => i !== index))
    // Also remove from actual pairs
    const tacticalPairIndex = pairs.findIndex((p, i) => {
      const actionDef = AVAILABLE_ACTIONS.find((def) => def.id === p.action.id)
      return actionDef?.coreType === "tactical" && currentTacticalPairs.indexOf(p) === index
    })
    if (tacticalPairIndex !== -1) {
      onRemovePair(tacticalPairIndex)
    }
  }

  const updateMovementProtocolTrigger = (index: number, triggerId: string) => {
    const updated = [...editingMovementProtocols]
    updated[index] = { ...updated[index], triggerId }
    setEditingMovementProtocols(updated)
  }

  const updateMovementProtocolAction = (index: number, actionId: string) => {
    const updated = [...editingMovementProtocols]
    updated[index] = { ...updated[index], actionId }
    setEditingMovementProtocols(updated)
  }

  const updateTacticalProtocolTrigger = (index: number, triggerId: string) => {
    const updated = [...editingTacticalProtocols]
    updated[index] = { ...updated[index], triggerId }
    setEditingTacticalProtocols(updated)
  }

  const updateTacticalProtocolAction = (index: number, actionId: string) => {
    const updated = [...editingTacticalProtocols]
    updated[index] = { ...updated[index], actionId }
    setEditingTacticalProtocols(updated)
  }

  const moveMovementProtocol = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === editingMovementProtocols.length - 1))
      return

    const updated = [...editingMovementProtocols]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    setEditingMovementProtocols(updated)
  }

  const moveTacticalProtocol = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === editingTacticalProtocols.length - 1))
      return

    const updated = [...editingTacticalProtocols]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    setEditingTacticalProtocols(updated)
  }

  const handleSave = () => {
    // Validate all protocols are complete
    const hasIncompleteMovement = editingMovementProtocols.some((p) => !p.triggerId || !p.actionId)
    const hasIncompleteTactical = editingTacticalProtocols.some((p) => !p.triggerId || !p.actionId)

    if (hasIncompleteMovement || hasIncompleteTactical) {
      alert("Please complete all protocols before saving. Each protocol must have both a trigger and an action.")
      return
    }

    if (onRemoveMovementPair && onRemoveTacticalPair && onAddMovementPair && onAddTacticalPair) {
      // Clear existing movement pairs
      for (let i = currentMovementPairs.length - 1; i >= 0; i--) {
        onRemoveMovementPair(i)
      }

      // Clear existing tactical pairs
      for (let i = currentTacticalPairs.length - 1; i >= 0; i--) {
        onRemoveTacticalPair(i)
      }

      // Add new movement protocols
      editingMovementProtocols.forEach((protocol) => {
        const trigger = safeTriggers.find((t) => t.id === protocol.triggerId)
        const action = safeActions.find((a) => a.id === protocol.actionId)
        if (trigger && action) {
          onAddMovementPair(trigger, action)
        }
      })

      // Add new tactical protocols
      editingTacticalProtocols.forEach((protocol) => {
        const trigger = safeTriggers.find((t) => t.id === protocol.triggerId)
        const action = safeActions.find((a) => a.id === protocol.actionId)
        if (trigger && action) {
          onAddTacticalPair(trigger, action)
        }
      })
    } else {
      // Legacy fallback
      for (let i = pairs.length - 1; i >= 0; i--) {
        onRemovePair(i)
      }

      editingMovementProtocols.forEach((protocol) => {
        const trigger = safeTriggers.find((t) => t.id === protocol.triggerId)
        const action = safeActions.find((a) => a.id === protocol.actionId)
        if (trigger && action) {
          onAddPair(trigger, action)
        }
      })

      editingTacticalProtocols.forEach((protocol) => {
        const trigger = safeTriggers.find((t) => t.id === protocol.triggerId)
        const action = safeActions.find((a) => a.id === protocol.actionId)
        if (trigger && action) {
          onAddPair(trigger, action)
        }
      })
    }

    onClose()
  }

  const sortedTriggers = [...safeTriggers].sort((a, b) => a.name.localeCompare(b.name))
  const sortedMovementActions = [...movementActions].sort((a, b) => a.name.localeCompare(b.name))
  const sortedTacticalActions = [...tacticalActions].sort((a, b) => a.name.localeCompare(b.name))

  const getElementColor = (damageType?: string) => {
    const elementColors: Record<string, string> = {
      kinetic: "#94a3b8",
      energy: "#22d3ee",
      thermal: "#f97316",
      viral: "#a855f7",
      corrosive: "#84cc16",
      explosive: "#ef4444",
      concussion: "#ef4444",
      glacial: "#06b6d4",
    }
    return damageType ? elementColors[damageType.toLowerCase()] || "#ffffff" : null
  }

  if (!isOpen) return null

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 my-4 sm:my-6">
          <div className="bg-gradient-to-br from-black/90 to-gray-900/90 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,255,255,0.4)]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-950/95 to-black/95 border-b border-cyan-500/30 p-3 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-xl sm:text-3xl font-bold text-cyan-400 truncate"
                    style={{ fontFamily: "monospace" }}
                  >
                    BATTLE PROTOCOLS
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-300/70 mt-1">
                    {editingMovementProtocols.length}/{MAX_MOVEMENT_PROTOCOLS} Movement •{" "}
                    {editingTacticalProtocols.length}/{MAX_TACTICAL_PROTOCOLS} Tactical
                  </p>
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

            {/* Content */}
            <div className="p-3 sm:p-6 space-y-8">
              {/* Movement Core Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-purple-400" style={{ fontFamily: "monospace" }}>
                        // MOVEMENT CORE DIRECTIVES
                      </h3>
                      <Badge variant="outline" className="bg-purple-950/50 border-purple-500/50 text-purple-300">
                        POSITIONING
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
                      Controls movement, evasion, and positioning actions
                    </p>
                  </div>
                  <Button
                    onClick={addMovementProtocol}
                    className="bg-purple-500 hover:bg-purple-400 text-black disabled:opacity-50"
                    size="sm"
                    disabled={editingMovementProtocols.length >= MAX_MOVEMENT_PROTOCOLS}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Movement
                  </Button>
                </div>

                {editingMovementProtocols.length >= MAX_MOVEMENT_PROTOCOLS && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300">
                    ⚠ Maximum movement protocols reached.
                  </div>
                )}

                {editingMovementProtocols.length === 0 ? (
                  <Card className="p-8 border-2 border-dashed border-purple-500/30 bg-black/20 text-center">
                    <p className="text-purple-300/50">No movement protocols configured.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {editingMovementProtocols.map((protocol, index) => {
                      const trigger = safeTriggers.find((t) => t.id === protocol.triggerId)
                      const action = safeActions.find((a) => a.id === protocol.actionId)

                      return (
                        <Card
                          key={index}
                          className="p-4 border-2 border-purple-500/30 bg-purple-950/10 hover:border-purple-500/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveMovementProtocol(index, "up")}
                                disabled={index === 0}
                              >
                                <MoveUp className="w-3 h-3" />
                              </Button>
                              <span className="text-xs sm:text-sm text-purple-300/70 text-center">#{index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveMovementProtocol(index, "down")}
                                disabled={index === editingMovementProtocols.length - 1}
                              >
                                <MoveDown className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs sm:text-sm text-purple-300/70 mb-2 block">
                                  <span className="text-purple-400 font-bold">IF</span> Trigger
                                  {!protocol.triggerId && (
                                    <span className="ml-2 text-yellow-400 text-xs">⚠ Required</span>
                                  )}
                                </label>
                                <Select
                                  value={protocol.triggerId}
                                  onValueChange={(value) => updateMovementProtocolTrigger(index, value)}
                                >
                                  <SelectTrigger
                                    className={`w-full bg-black/50 ${!protocol.triggerId ? "border-yellow-500/70" : "border-purple-500/50"}`}
                                  >
                                    <SelectValue placeholder="Select trigger..." />
                                  </SelectTrigger>
                                  <SelectContent className="z-[150]">
                                    {sortedTriggers.map((t) => (
                                      <SelectItem key={t.id} value={t.id} className="font-mono">
                                        <div className="flex items-center justify-between gap-3 w-full">
                                          <span className="font-bold text-xs tracking-wide uppercase">{t.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs sm:text-sm text-purple-300/50 mt-1">
                                  {trigger?.description || "Choose when this protocol activates"}
                                </p>
                              </div>

                              <div>
                                <label className="text-xs sm:text-sm text-purple-300/70 mb-2 block">
                                  <span className="text-green-400 font-bold">THEN</span> Action
                                  {!protocol.actionId && (
                                    <span className="ml-2 text-yellow-400 text-xs">⚠ Required</span>
                                  )}
                                </label>
                                <Select
                                  value={protocol.actionId}
                                  onValueChange={(value) => updateMovementProtocolAction(index, value)}
                                >
                                  <SelectTrigger
                                    className={`w-full bg-black/50 ${!protocol.actionId ? "border-yellow-500/70" : "border-purple-500/50"}`}
                                  >
                                    <SelectValue placeholder="Select action..." />
                                  </SelectTrigger>
                                  <SelectContent className="z-[150]">
                                    {sortedMovementActions.map((a) => {
                                      const elementColor = getElementColor(a.damageType)
                                      return (
                                        <SelectItem key={a.id} value={a.id} className="font-mono">
                                          <div className="flex items-center justify-between gap-3 w-full">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              {elementColor && (
                                                <div
                                                  className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                                                  style={{ backgroundColor: elementColor }}
                                                />
                                              )}
                                              <span className="font-bold text-xs tracking-wide uppercase truncate">
                                                {a.name}
                                              </span>
                                            </div>
                                            <span className="text-[10px] text-cyan-400 shrink-0 ml-2">
                                              {a.cooldown}ms
                                            </span>
                                          </div>
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs sm:text-sm text-purple-300/50 mt-1">
                                  {action?.description || "Choose movement action"}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMovementProtocol(index)}
                              className="hover:bg-red-500/20 hover:border-red-500 border border-transparent"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Tactical Core Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-orange-400" style={{ fontFamily: "monospace" }}>
                        // TACTICAL CORE DIRECTIVES
                      </h3>
                      <Badge variant="outline" className="bg-orange-950/50 border-orange-500/50 text-orange-300">
                        COMBAT
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-orange-300/70 mt-1">
                      Controls attacks, buffs, debuffs, and healing
                    </p>
                  </div>
                  <Button
                    onClick={addTacticalProtocol}
                    className="bg-orange-500 hover:bg-orange-400 text-black disabled:opacity-50"
                    size="sm"
                    disabled={editingTacticalProtocols.length >= MAX_TACTICAL_PROTOCOLS}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tactical
                  </Button>
                </div>

                {editingTacticalProtocols.length >= MAX_TACTICAL_PROTOCOLS && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300">
                    ⚠ Maximum tactical protocols reached.
                  </div>
                )}

                {editingTacticalProtocols.length === 0 ? (
                  <Card className="p-8 border-2 border-dashed border-orange-500/30 bg-black/20 text-center">
                    <p className="text-orange-300/50">No tactical protocols configured.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {editingTacticalProtocols.map((protocol, index) => {
                      const trigger = safeTriggers.find((t) => t.id === protocol.triggerId)
                      const action = safeActions.find((a) => a.id === protocol.actionId)

                      return (
                        <Card
                          key={index}
                          className="p-4 border-2 border-orange-500/30 bg-orange-950/10 hover:border-orange-500/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveTacticalProtocol(index, "up")}
                                disabled={index === 0}
                              >
                                <MoveUp className="w-3 h-3" />
                              </Button>
                              <span className="text-xs sm:text-sm text-orange-300/70 text-center">#{index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveTacticalProtocol(index, "down")}
                                disabled={index === editingTacticalProtocols.length - 1}
                              >
                                <MoveDown className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs sm:text-sm text-orange-300/70 mb-2 block">
                                  <span className="text-orange-400 font-bold">IF</span> Trigger
                                  {!protocol.triggerId && (
                                    <span className="ml-2 text-yellow-400 text-xs">⚠ Required</span>
                                  )}
                                </label>
                                <Select
                                  value={protocol.triggerId}
                                  onValueChange={(value) => updateTacticalProtocolTrigger(index, value)}
                                >
                                  <SelectTrigger
                                    className={`w-full bg-black/50 ${!protocol.triggerId ? "border-yellow-500/70" : "border-orange-500/50"}`}
                                  >
                                    <SelectValue placeholder="Select trigger..." />
                                  </SelectTrigger>
                                  <SelectContent className="z-[150]">
                                    {sortedTriggers.map((t) => (
                                      <SelectItem key={t.id} value={t.id} className="font-mono">
                                        <div className="flex items-center justify-between gap-3 w-full">
                                          <span className="font-bold text-xs tracking-wide uppercase">{t.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs sm:text-sm text-orange-300/50 mt-1">
                                  {trigger?.description || "Choose when this protocol activates"}
                                </p>
                              </div>

                              <div>
                                <label className="text-xs sm:text-sm text-orange-300/70 mb-2 block">
                                  <span className="text-green-400 font-bold">THEN</span> Action
                                  {!protocol.actionId && (
                                    <span className="ml-2 text-yellow-400 text-xs">⚠ Required</span>
                                  )}
                                </label>
                                <Select
                                  value={protocol.actionId}
                                  onValueChange={(value) => updateTacticalProtocolAction(index, value)}
                                >
                                  <SelectTrigger
                                    className={`w-full bg-black/50 ${!protocol.actionId ? "border-yellow-500/70" : "border-orange-500/50"}`}
                                  >
                                    <SelectValue placeholder="Select action..." />
                                  </SelectTrigger>
                                  <SelectContent className="z-[150]">
                                    {sortedTacticalActions.map((a) => {
                                      const elementColor = getElementColor(a.damageType)
                                      return (
                                        <SelectItem key={a.id} value={a.id} className="font-mono">
                                          <div className="flex items-center justify-between gap-3 w-full">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              {elementColor && (
                                                <div
                                                  className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                                                  style={{ backgroundColor: elementColor }}
                                                />
                                              )}
                                              <span className="font-bold text-xs tracking-wide uppercase truncate">
                                                {a.name}
                                              </span>
                                            </div>
                                            <span className="text-[10px] text-cyan-400 shrink-0 ml-2">
                                              {a.cooldown}ms
                                            </span>
                                          </div>
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs sm:text-sm text-orange-300/50 mt-1">
                                  {action?.description || "Choose tactical action"}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTacticalProtocol(index)}
                              className="hover:bg-red-500/20 hover:border-red-500 border border-transparent"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-black/95 to-transparent border-t border-cyan-500/30 p-3 sm:p-6 flex gap-2 sm:gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-red-500/50 hover:bg-red-500/20 bg-transparent text-sm"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold text-sm"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
