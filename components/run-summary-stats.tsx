"use client"

import { Card } from "@/components/ui/card"
import { Trophy, TrendingUp, Shield } from "lucide-react"

interface RunSummaryStatsProps {
  wavesCompleted: number
  layerReached: number
  nodeReached: number
  totalNodes: number
}

export function RunSummaryStats({ wavesCompleted, layerReached, nodeReached, totalNodes }: RunSummaryStatsProps) {
  const layerNames = ["Data Stream", "Firewall", "Archive", "Core Approach"]
  const layerName = layerNames[layerReached] || "Unknown Layer"

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-center mb-3">
        Breach Summary
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground uppercase">Waves</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{wavesCompleted}</div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-muted-foreground uppercase">Nodes</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{totalNodes}</div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground uppercase">Deepest Layer</span>
          </div>
          <div className="text-lg font-bold text-green-400">
            {layerName} • Node {nodeReached + 1}
          </div>
        </Card>
      </div>
    </div>
  )
}
