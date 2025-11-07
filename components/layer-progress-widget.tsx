"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { NetworkLayer } from "@/lib/network-layers"
import { Crown, Layers, Map, Shield, Zap, Sparkles } from "lucide-react"

interface LayerProgressWidgetProps {
  layers: NetworkLayer[]
  currentLayerIndex: number
  currentNodeIndex: number
  isGuardianBattle: boolean
  onOpenMap?: () => void
}

function getNodeIcon(type: string) {
  switch (type) {
    case "battle":
      return Zap
    case "upgrade":
      return Sparkles
    case "guardian":
      return Crown
    default:
      return Shield
  }
}

export function LayerProgressWidget({
  layers,
  currentLayerIndex,
  currentNodeIndex,
  isGuardianBattle,
  onOpenMap,
}: LayerProgressWidgetProps) {
  const currentLayer = layers[currentLayerIndex]
  const totalNodes = currentLayer?.nodes.length || 0
  const currentNode = currentLayer?.nodes[currentNodeIndex]
  const progressPercent = totalNodes > 0 ? ((currentNodeIndex + 1) / totalNodes) * 100 : 0

  if (!currentLayer) return null

  const NodeIcon = currentNode ? getNodeIcon(currentNode.type) : Zap

  return (
    <Card
      className="bg-card/95 backdrop-blur border-2 shadow-lg hover:shadow-xl py-1.5 transition-shadow"
      style={{ borderColor: `${currentLayer.theme.primaryColor}80` }}
    >
      <div className="px-1.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          {/* Layer info */}
          <div className="flex items-center gap-2 flex-1">
            <Layers className="w-5 h-5" style={{ color: currentLayer.theme.primaryColor }} />
            <div>
              <div className="text-xs font-bold leading-tight" style={{ color: currentLayer.theme.primaryColor }}>
                {currentLayer.name}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                Layer {currentLayerIndex + 1} of {layers.length}
              </div>
            </div>
          </div>

          {onOpenMap && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs border-2 hover:scale-105 transition-transform active:scale-95 bg-transparent"
              style={{
                borderColor: `${currentLayer.theme.primaryColor}60`,
                color: currentLayer.theme.primaryColor,
              }}
              onClick={onOpenMap}
            >
              <Map className="w-3.5 h-3.5 mr-1" />
              MAP
            </Button>
          )}
        </div>

        <div className="mb-1">
          <Progress
            value={progressPercent}
            className="h-2 bg-muted/50"
            style={{
              ["--progress-background" as any]: currentLayer.theme.primaryColor,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Current node info */}
          <div className="flex items-center gap-2">
            <NodeIcon className="w-4 h-4" style={{ color: currentLayer.theme.primaryColor }} />
            <div className="text-xs">
              <span className="font-bold text-foreground">Node {currentNodeIndex + 1}</span>
              <span className="text-muted-foreground"> / {totalNodes}</span>
            </div>
          </div>

          {isGuardianBattle && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/50">
              <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Guardian</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
