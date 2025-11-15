"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Edit2 } from "lucide-react"
import { CONSTRUCTS } from "@/lib/constructs"
import type { CustomFighterClass } from "@/lib/meta-progression"
import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import { FighterClassEditor } from "./fighter-class-editor"

interface FighterClassManagerProps {
  customClasses: CustomFighterClass[]
  selectedClassId: string | null
  onSaveClasses: (classes: CustomFighterClass[]) => void
  onSelectClass: (classId: string) => void
  onClose: () => void
  skipSelection?: boolean
}

export function FighterClassManager({
  customClasses,
  selectedClassId,
  onSaveClasses,
  onSelectClass,
  onClose,
  skipSelection = false,
}: FighterClassManagerProps) {
  const [editingClass, setEditingClass] = useState<CustomFighterClass | null>(() => {
    if (skipSelection && customClasses.length > 0) {
      return customClasses[0]
    }
    return null
  })

  const activeClasses = useMemo(() => {
    if (customClasses.length > 0) {
      return customClasses
    }
    return CONSTRUCTS.map((construct) => ({
      id: construct.id,
      name: construct.name,
      color: construct.color,
      startingPairs: [],
      startingMovementPairs: [],
      startingTacticalPairs: [],
      customization: undefined,
    }))
  }, [customClasses])

  const handleEditClass = (classToEdit: CustomFighterClass) => {
    setEditingClass(classToEdit)
  }

  const handleSaveEdit = (updatedClass: CustomFighterClass) => {
    const updatedClasses = activeClasses.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    onSaveClasses(updatedClasses)
    setEditingClass(null)
  }

  const handleCancelEdit = () => {
    setEditingClass(null)
  }

  if (editingClass) {
    return <FighterClassEditor classData={editingClass} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black/90 to-gray-900/90 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-950/95 to-black/95 backdrop-blur-md border-b border-cyan-500/30 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-bold text-cyan-400" style={{ fontFamily: "monospace" }}>
              CONSTRUCTS
            </h2>
            <p className="text-sm text-cyan-300/70 mt-1">Deploy and program your combat frames</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-red-500/20 hover:border-red-500 border border-transparent"
          >
            <X className="w-6 h-6 text-red-400" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {activeClasses.map((classItem) => {
            const isSelected = classItem.id === selectedClassId

            return (
              <Card
                key={classItem.id}
                className={`p-6 border-2 transition-all ${
                  isSelected
                    ? "border-green-500/70 bg-green-950/20 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                    : "border-cyan-500/30 bg-black/40 hover:border-cyan-500/50"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-4 h-4 rounded-full border-2"
                          style={{
                            backgroundColor: classItem.color,
                            borderColor: classItem.color,
                          }}
                        />
                        <h3
                          className="text-2xl font-bold"
                          style={{
                            color: classItem.color,
                            fontFamily: "monospace",
                          }}
                        >
                          {classItem.name}
                        </h3>
                      </div>

                      <div className="mt-3">
                        {classItem.startingMovementPairs?.length > 0 || classItem.startingTacticalPairs?.length > 0 ? (
                          <>
                            {classItem.startingMovementPairs && classItem.startingMovementPairs.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs text-purple-400/90 mb-2 font-bold">
                                  MOVEMENT CORE ({classItem.startingMovementPairs.length})
                                </div>
                                <div className="space-y-1">
                                  {classItem.startingMovementPairs.slice(0, 2).map((pair, idx) => {
                                    const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === pair.triggerId)
                                    const action = AVAILABLE_ACTIONS.find((a) => a.id === pair.actionId)
                                    return (
                                      <div
                                        key={idx}
                                        className="text-sm text-purple-300/90 bg-purple-950/20 px-3 py-1.5 rounded border border-purple-500/30"
                                      >
                                        <span className="text-purple-400">IF</span> {trigger?.name || "Unknown"}{" "}
                                        <span className="text-green-400">THEN</span> {action?.name || "Unknown"}
                                      </div>
                                    )
                                  })}
                                  {classItem.startingMovementPairs.length > 2 && (
                                    <div className="text-xs text-purple-300/50 px-3 py-1">
                                      +{classItem.startingMovementPairs.length - 2} more...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {classItem.startingTacticalPairs && classItem.startingTacticalPairs.length > 0 && (
                              <div>
                                <div className="text-xs text-orange-400/90 mb-2 font-bold">
                                  TACTICAL CORE ({classItem.startingTacticalPairs.length})
                                </div>
                                <div className="space-y-1">
                                  {classItem.startingTacticalPairs.slice(0, 2).map((pair, idx) => {
                                    const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === pair.triggerId)
                                    const action = AVAILABLE_ACTIONS.find((a) => a.id === pair.actionId)
                                    return (
                                      <div
                                        key={idx}
                                        className="text-sm text-orange-300/90 bg-orange-950/20 px-3 py-1.5 rounded border border-orange-500/30"
                                      >
                                        <span className="text-orange-400">IF</span> {trigger?.name || "Unknown"}{" "}
                                        <span className="text-green-400">THEN</span> {action?.name || "Unknown"}
                                      </div>
                                    )
                                  })}
                                  {classItem.startingTacticalPairs.length > 2 && (
                                    <div className="text-xs text-orange-300/50 px-3 py-1">
                                      +{classItem.startingTacticalPairs.length - 2} more...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-cyan-300/70 mb-2">
                              STARTING PROTOCOLS ({classItem.startingPairs.length})
                            </div>
                            <div className="space-y-1">
                              {classItem.startingPairs.slice(0, 3).map((pair, idx) => {
                                const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === pair.triggerId)
                                const action = AVAILABLE_ACTIONS.find((a) => a.id === pair.actionId)
                                return (
                                  <div
                                    key={idx}
                                    className="text-sm text-cyan-300/90 bg-black/30 px-3 py-1.5 rounded border border-cyan-500/20"
                                  >
                                    <span className="text-cyan-400">IF</span> {trigger?.name || "Unknown"}{" "}
                                    <span className="text-green-400">THEN</span> {action?.name || "Unknown"}
                                  </div>
                                )
                              })}
                              {classItem.startingPairs.length > 3 && (
                                <div className="text-xs text-cyan-300/50 px-3 py-1">
                                  +{classItem.startingPairs.length - 3} more protocols...
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isSelected && (
                    <Button
                      onClick={() => onSelectClass(classItem.id)}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-black"
                    >
                      SELECT CLASS
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClass(classItem)}
                      className="w-full border-cyan-500/50 hover:bg-cyan-500/20"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
