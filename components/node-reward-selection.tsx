"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Trigger, Action, TriggerActionPair } from "@/types/game"
import type { NodeType } from "@/lib/network-layers"
import { Coins, Heart, Zap, Sparkles } from "lucide-react"

interface NodeRewardSelectionProps {
  nodeType: NodeType
  availableTriggers: Trigger[]
  availableActions: Action[]
  currentPairs: TriggerActionPair[]
  currentHP: number
  maxHP: number
  onSelectTrigger: (trigger: Trigger) => void
  onSelectAction: (action: Action) => void
  onSelectUpgrade: (pairIndex: number) => void
  onSelectHeal: () => void
  onSelectFragments: () => void
  onSelectSpecial: (type: "perk" | "malware") => void
  isOpen: boolean
}

export function NodeRewardSelection({
  nodeType,
  availableTriggers,
  availableActions,
  currentPairs,
  currentHP,
  maxHP,
  onSelectTrigger,
  onSelectAction,
  onSelectUpgrade,
  onSelectHeal,
  onSelectFragments,
  onSelectSpecial,
  isOpen,
}: NodeRewardSelectionProps) {
  if (!isOpen) return null

  const renderModuleSelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-primary mb-2">Choose a New Module</h3>
        <p className="text-sm text-muted-foreground mb-4">Select a Trigger or Action to add to your arsenal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Triggers */}
        <div>
          <h4 className="text-sm font-bold text-cyan-400 mb-2">TRIGGERS</h4>
          <ScrollArea className="h-[40dvh]">
            <div className="space-y-2 pr-4">
              {availableTriggers.slice(0, 3).map((trigger) => (
                <Card
                  key={trigger.id}
                  className="p-3 cursor-pointer hover:border-cyan-400 transition-colors border-2"
                  onClick={() => onSelectTrigger(trigger)}
                >
                  <h5 className="font-bold text-sm text-cyan-400">{trigger.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{trigger.description}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div>
          <h4 className="text-sm font-bold text-magenta-400 mb-2">ACTIONS</h4>
          <ScrollArea className="h-[40dvh]">
            <div className="space-y-2 pr-4">
              {availableActions.slice(0, 3).map((action) => (
                <Card
                  key={action.id}
                  className="p-3 cursor-pointer hover:border-magenta-400 transition-colors border-2"
                  onClick={() => onSelectAction(action)}
                >
                  <h5 className="font-bold text-sm text-magenta-400">{action.name}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )

  const renderUpgradeSelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-primary mb-2">
          <Zap className="inline w-5 h-5 mr-2" />
          Upgrade Module
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Enhance one of your existing protocols</p>
      </div>

      <ScrollArea className="h-[50dvh]">
        <div className="space-y-2 pr-4">
          {currentPairs.map((pair, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:border-primary transition-colors border-2"
              onClick={() => onSelectUpgrade(index)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm">
                    {pair.trigger.name} → {pair.action.name}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">Reduce cooldown by 20%</p>
                </div>
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const renderFragmentReward = () => (
    <div className="space-y-4 text-center">
      <Coins className="w-16 h-16 text-yellow-400 mx-auto" />
      <h3 className="text-2xl font-bold text-yellow-400">Cipher Fragments!</h3>
      <p className="text-muted-foreground">Earn bonus currency for meta-progression</p>
      <Button onClick={onSelectFragments} className="bg-yellow-600 hover:bg-yellow-700 text-white">
        Collect +50 Fragments
      </Button>
    </div>
  )

  const renderHealReward = () => {
    const healAmount = Math.floor(maxHP * 0.3)
    const canHeal = currentHP < maxHP

    return (
      <div className="space-y-4 text-center">
        <Heart className="w-16 h-16 text-red-400 mx-auto" />
        <h3 className="text-2xl font-bold text-red-400">Restoration Node</h3>
        <p className="text-muted-foreground">
          Restore {healAmount} HP ({currentHP}/{maxHP})
        </p>
        <Button onClick={onSelectHeal} disabled={!canHeal} className="bg-red-600 hover:bg-red-700 text-white">
          {canHeal ? "Heal" : "Already at Max HP"}
        </Button>
      </div>
    )
  }

  const renderSpecialReward = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-2" />
        <h3 className="text-2xl font-bold text-purple-400">Special Node</h3>
        <p className="text-muted-foreground">Choose a unique reward</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="p-4 cursor-pointer hover:border-green-400 transition-colors border-2"
          onClick={() => onSelectSpecial("perk")}
        >
          <h5 className="font-bold text-green-400 mb-2">System Perk</h5>
          <p className="text-xs text-muted-foreground">Gain a powerful temporary buff for this run</p>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:border-orange-400 transition-colors border-2"
          onClick={() => onSelectSpecial("malware")}
        >
          <h5 className="font-bold text-orange-400 mb-2">Malware Injection</h5>
          <p className="text-xs text-muted-foreground">Powerful module with a drawback</p>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur p-4">
      <Card className="w-full max-w-3xl max-h-[85dvh] overflow-y-auto bg-card/95 border-2 border-primary p-4 sm:p-6">
        {nodeType === "battle" && renderModuleSelection()}
        {nodeType === "upgrade" && renderUpgradeSelection()}
        {nodeType === "fragment" && renderFragmentReward()}
        {nodeType === "heal" && renderHealReward()}
        {nodeType === "special" && renderSpecialReward()}
      </Card>
    </div>
  )
}
