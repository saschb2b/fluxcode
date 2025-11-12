"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Plus, Lock } from "lucide-react"
import { CONSTRUCTS } from "@/lib/constructs"
import type { Construct } from "@/types/game"
import type { PlayerProgress } from "@/lib/meta-progression"

interface ConstructSlotManagerProps {
  playerProgress: PlayerProgress
  currentSlotId: string | null
  onSelectSlot: (slotId: string) => void
  onAssignToSlot: (slotId: string) => void
  onClose: () => void
}

export function ConstructSlotManager({
  playerProgress,
  currentSlotId,
  onSelectSlot,
  onAssignToSlot,
  onClose,
}: ConstructSlotManagerProps) {
  const slots = ["slot-1", "slot-2", "slot-3"]
  const activeSlots = playerProgress.activeConstructSlots || {}

  const getSlotConstruct = (slotId: string): Construct | null => {
    const slotData = activeSlots[slotId]
    if (!slotData) return null
    return CONSTRUCTS.find((c) => c.id === slotData.constructId) || null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black/90 to-gray-900/90 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-950/95 to-black/95 backdrop-blur-md border-b border-cyan-500/30 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-bold text-cyan-400" style={{ fontFamily: "monospace" }}>
              CONSTRUCT SLOTS
            </h2>
            <p className="text-sm text-cyan-300/70 mt-1">Manage and switch between your deployed constructs</p>
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

        <div className="p-6 space-y-4">
          {slots.map((slotId) => {
            const construct = getSlotConstruct(slotId)
            const isActive = slotId === currentSlotId
            const slotData = activeSlots[slotId]
            const protocolCount =
              (slotData?.movementProtocols?.length || 0) + (slotData?.tacticalProtocols?.length || 0)

            return (
              <Card
                key={slotId}
                className={`p-6 border-2 transition-all ${
                  isActive
                    ? "border-green-500/70 bg-green-950/20 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                    : "border-cyan-500/30 bg-black/40 hover:border-cyan-500/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-sm text-gray-400 font-mono">{slotId.toUpperCase().replace("-", " ")}</div>
                      {isActive && (
                        <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-400 font-bold">
                          ACTIVE
                        </div>
                      )}
                    </div>

                    {construct ? (
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-4 h-4 rounded-full border-2"
                            style={{
                              backgroundColor: construct.color,
                              borderColor: construct.color,
                            }}
                          />
                          <h3
                            className="text-2xl font-bold"
                            style={{
                              color: construct.color,
                              fontFamily: "monospace",
                            }}
                          >
                            {construct.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-black/40 rounded p-2 border border-cyan-500/30">
                            <div className="text-xs text-cyan-400">PROTOCOLS</div>
                            <div className="text-lg font-bold text-white">{protocolCount}</div>
                          </div>
                          <div className="bg-black/40 rounded p-2 border border-purple-500/30">
                            <div className="text-xs text-purple-400">CAPACITY</div>
                            <div className="text-lg font-bold text-white">
                              {construct.maxMovementSlots + construct.maxTacticalSlots}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Lock className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400">EMPTY SLOT</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {construct && !isActive && (
                    <Button
                      onClick={() => onSelectSlot(slotId)}
                      className="flex-1 bg-green-500 hover:bg-green-400 text-black"
                    >
                      ACTIVATE SLOT
                    </Button>
                  )}
                  <Button
                    onClick={() => onAssignToSlot(slotId)}
                    variant="outline"
                    className="flex-1 border-cyan-500/50 hover:bg-cyan-500/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {construct ? "REASSIGN" : "ASSIGN CONSTRUCT"}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
