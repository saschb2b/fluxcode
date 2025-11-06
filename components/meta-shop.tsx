"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Coins, TrendingUp, Zap, Unlock } from "lucide-react"
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
      return <Zap className="w-5 h-5" />
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
    <Card className="p-3 sm:p-4 bg-black/40 border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
          <UpgradeIcon category={upgrade.category} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm sm:text-base text-cyan-400 truncate">{upgrade.name}</h3>
            {upgrade.maxLevel > 1 && (
              <span className="text-xs text-cyan-400/60 whitespace-nowrap">
                Lv {currentLevel}/{upgrade.maxLevel}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-400 mb-3">{upgrade.description}</p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-yellow-400">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-bold">{upgrade.cost}</span>
            </div>

            <Button
              size="sm"
              onClick={onPurchase}
              disabled={!canAfford || isMaxLevel}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50"
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

  const categories = [
    { id: "stat", name: "Stat Boosts", upgrades: META_UPGRADES.filter((u) => u.category === "stat") },
    { id: "unlock", name: "Unlocks", upgrades: META_UPGRADES.filter((u) => u.category === "unlock") },
    { id: "action", name: "Action Upgrades", upgrades: META_UPGRADES.filter((u) => u.category === "action") },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <Card className="w-full max-w-4xl h-[90dvh] bg-gradient-to-br from-purple-900/90 via-black/90 to-cyan-900/90 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-cyan-500/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-wider">META UPGRADES</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-yellow-400">
            <Coins className="w-6 h-6" />
            <span className="text-xl sm:text-2xl font-bold">{progress.currency}</span>
            <span className="text-sm text-gray-400">Currency</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4 sm:p-6">
            <div className="space-y-6 pb-4">
              {categories.map((category) => (
                <div key={category.id}>
                  <h3 className="text-lg sm:text-xl font-bold text-magenta-400 mb-3 tracking-wide">{category.name}</h3>
                  <div className="grid gap-3 sm:gap-4">
                    {category.upgrades.map((upgrade) => (
                      <UpgradeCard
                        key={upgrade.id}
                        upgrade={upgrade}
                        progress={progress}
                        onPurchase={() => handlePurchase(upgrade.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/30 flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-400 text-center">
            <p>Complete waves to earn currency • Upgrades are permanent</p>
            <p className="mt-1">
              Total Runs: {progress.totalRuns} • Waves Completed: {progress.totalWavesCompleted}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
