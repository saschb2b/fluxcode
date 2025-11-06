"use client"

import { Card } from "@/components/ui/card"
import { type NetworkLayer, getNodeIcon, getNodeRewardDescription } from "@/lib/network-layers"
import { Check, Lock } from "lucide-react"

interface NetworkMapProps {
  layers: NetworkLayer[]
  currentLayerIndex: number
  currentNodeIndex: number
  isOpen: boolean
  onClose: () => void
}

export function NetworkMap({ layers, currentLayerIndex, currentNodeIndex, isOpen, onClose }: NetworkMapProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur p-4">
      <Card className="w-full max-w-4xl max-h-[80dvh] overflow-y-auto bg-card/95 border-2 border-primary p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Ciphernet Conduit</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Navigate through the Network Layers to reach the Core System
        </p>

        <div className="space-y-6">
          {layers.map((layer, layerIndex) => {
            const isCurrentLayer = layerIndex === currentLayerIndex
            const isCompletedLayer = layerIndex < currentLayerIndex
            const isLockedLayer = layerIndex > currentLayerIndex

            return (
              <div
                key={layer.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isCurrentLayer
                    ? "border-primary bg-primary/10"
                    : isCompletedLayer
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-muted bg-muted/5 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {isCompletedLayer && <Check className="w-5 h-5 text-green-500" />}
                  {isLockedLayer && <Lock className="w-5 h-5 text-muted-foreground" />}
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: isCurrentLayer ? layer.theme.primaryColor : undefined }}
                    >
                      {layer.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{layer.description}</p>
                  </div>
                </div>

                {/* Nodes */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {layer.nodes.map((node, nodeIndex) => {
                    const isCurrentNode = isCurrentLayer && nodeIndex === currentNodeIndex
                    const isCompletedNode = isCurrentLayer ? nodeIndex < currentNodeIndex : isCompletedLayer
                    const isLockedNode = isLockedLayer || (isCurrentLayer && nodeIndex > currentNodeIndex)

                    return (
                      <div
                        key={node.id}
                        className={`relative group flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all ${
                          isCurrentNode
                            ? "border-primary bg-primary text-primary-foreground scale-110 animate-pulse"
                            : isCompletedNode
                              ? "border-green-500 bg-green-500/20 text-green-500"
                              : isLockedNode
                                ? "border-muted bg-muted/10 text-muted-foreground opacity-50"
                                : "border-muted bg-muted/20 text-muted-foreground"
                        }`}
                        title={getNodeRewardDescription(node.type)}
                      >
                        <span className="text-lg">{getNodeIcon(node.type)}</span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                          <div className="bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                            {getNodeRewardDescription(node.type)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Guardian Info */}
                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                  <span className="font-bold" style={{ color: layer.theme.primaryColor }}>
                    Guardian:
                  </span>{" "}
                  {layer.guardianName} - {layer.guardianDescription}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors font-bold"
          >
            Close Map
          </button>
        </div>
      </Card>
    </div>
  )
}
