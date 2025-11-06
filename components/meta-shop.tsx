"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Coins, TrendingUp, Zap, Unlock, Wrench } from "lucide-react"
import {
  META_UPGRADES,
  type PlayerProgress,
  type MetaUpgrade,
  canAffordUpgrade,
  getUpgradeLevel,
  purchaseUpgrade as purchaseUpgradeLib,
} from "@/lib/meta-progression"

interface MetaShopProps {
  progress: PlayerProgress
  onClose: () => void
  onPurchase: (progress: PlayerProgress) => void
}

function UpgradeIcon({ category }: { category: MetaUpgrade["category"] }) {
  switch (category) {
    case "stat":
      return <TrendingUp className="w-5 h-5" />
    case "action":
      return <Wrench className="w-5 h-5" />
    case "trigger":
      return <Zap className="w-5 h-5" />
    case "unlock":
      return <Unlock className="w-5 h-5" />
  }
}

function UpgradeCard({
  upgrade,
  progress,
  onPurchase,
}: {
  upgrade: MetaUpgrade
  progress: PlayerProgress
  onPurchase: () => void
}) {
  const currentLevel = getUpgradeLevel(progress, upgrade.id)
  const canAfford = canAffordUpgrade(progress, upgrade)
  const isMaxLevel = currentLevel >= upgrade.maxLevel

  return (
    <Card className="p-3 bg-black/40 border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 flex-shrink-0">
          <UpgradeIcon category={upgrade.category} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-cyan-400 leading-tight">{upgrade.name}</h3>
            {upgrade.maxLevel > 1 && (
              <span className="text-xs text-cyan-400/60 whitespace-nowrap flex-shrink-0">
                Lv {currentLevel}/{upgrade.maxLevel}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-2 leading-relaxed">{upgrade.description}</p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-yellow-400">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-bold">{upgrade.cost}</span>
            </div>

            <Button
              size="sm"
              onClick={onPurchase}
              disabled={!canAfford || isMaxLevel}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50 h-8 px-3"
            >
              {isMaxLevel ? "MAX" : "BUY"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function MetaShop({ progress, onClose, onPurchase }: MetaShopProps) {
  const handlePurchase = (upgradeId: string) => {
    const newProgress = purchaseUpgradeLib(progress, upgradeId)
    onPurchase(newProgress)
  }

  const statBoosts = META_UPGRADES.filter((u) => u.category === "stat")
  const actionUnlocks = META_UPGRADES.filter((u) => u.category === "unlock" && u.effect.type === "unlock_action")
  const triggerUnlocks = META_UPGRADES.filter((u) => u.category === "unlock" && u.effect.type === "unlock_trigger")
  const actionUpgrades = META_UPGRADES.filter((u) => u.category === "action")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <Card className="w-full max-w-5xl h-[90dvh] bg-gradient-to-br from-purple-900/90 via-black/90 to-cyan-900/90 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-cyan-500/30 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <h2 className="text-lg sm:text-3xl font-bold text-cyan-400 tracking-wider">META</h2>
              <div className="flex items-center gap-1 sm:gap-2 text-yellow-400">
                <Coins className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="text-base sm:text-2xl font-bold">{progress.currency}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="stats" className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs List */}
          <TabsList className="mx-2 sm:mx-6 mt-2 sm:mt-4 grid grid-cols-4 gap-1 bg-black/40 border border-cyan-500/30 h-12 sm:h-10 p-1">
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full"
            >
              <TrendingUp className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full"
            >
              <Unlock className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
            <TabsTrigger
              value="triggers"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full"
            >
              <Zap className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Triggers</span>
            </TabsTrigger>
            <TabsTrigger
              value="upgrades"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full"
            >
              <Wrench className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Upgrades</span>
            </TabsTrigger>
          </TabsList>

          {/* Tabs Content */}
          <TabsContent value="stats" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              <div className="space-y-2 sm:space-y-3 pb-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">
                  Permanent stat boosts that apply to all runs. Stack multiple levels for greater effect.
                </p>
                {statBoosts.map((upgrade) => (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    progress={progress}
                    onPurchase={() => handlePurchase(upgrade.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              <div className="space-y-2 sm:space-y-3 pb-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">
                  Unlock new actions to use in your protocols. Once unlocked, they become available in rewards.
                </p>
                {actionUnlocks.map((upgrade) => (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    progress={progress}
                    onPurchase={() => handlePurchase(upgrade.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="triggers" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              <div className="space-y-2 sm:space-y-3 pb-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">
                  Unlock new triggers for your protocols. Triggers determine when actions execute.
                </p>
                {triggerUnlocks.map((upgrade) => (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    progress={progress}
                    onPurchase={() => handlePurchase(upgrade.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upgrades" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              <div className="space-y-2 sm:space-y-3 pb-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-4">
                  Enhance specific actions to make them more powerful. Stack multiple levels for greater effect.
                </p>
                {actionUpgrades.map((upgrade) => (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    progress={progress}
                    onPurchase={() => handlePurchase(upgrade.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="hidden sm:block p-4 border-t border-cyan-500/30 flex-shrink-0">
          <div className="text-xs text-gray-400 text-center">
            <p>Complete waves to earn currency • Upgrades are permanent</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
