"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Coins, TrendingUp, Zap, Unlock, Wrench, Filter, CheckCircle2 } from "lucide-react"
import { useState } from "react"
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

type FilterMode = "all" | "affordable" | "purchased"

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
  const isPurchased = currentLevel > 0

  const cardBorderClass = isMaxLevel
    ? "border-green-500/40 bg-green-900/10"
    : canAfford
      ? "border-cyan-500/60 bg-cyan-900/10 hover:border-cyan-400 hover:bg-cyan-900/20"
      : isPurchased
        ? "border-purple-500/30 bg-purple-900/5"
        : "border-gray-600/20 bg-black/20"

  const textOpacity = !canAfford && !isMaxLevel ? "opacity-50" : "opacity-100"

  return (
    <Card className={`p-3 transition-all ${cardBorderClass} ${textOpacity}`}>
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg flex-shrink-0 ${
            isMaxLevel
              ? "bg-green-500/20 text-green-400"
              : canAfford
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-gray-500/20 text-gray-500"
          }`}
        >
          <UpgradeIcon category={upgrade.category} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-cyan-400 leading-tight">{upgrade.name}</h3>
              {isPurchased && !isMaxLevel && <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0" />}
            </div>
            {upgrade.maxLevel > 1 && (
              <span
                className={`text-xs whitespace-nowrap flex-shrink-0 ${
                  isMaxLevel ? "text-green-400" : "text-cyan-400/60"
                }`}
              >
                Lv {currentLevel}/{upgrade.maxLevel}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-2 leading-relaxed">{upgrade.description}</p>

          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-1 ${canAfford ? "text-yellow-400" : "text-gray-500"}`}>
              <Coins className="w-4 h-4" />
              <span className="text-sm font-bold">{upgrade.cost}</span>
            </div>

            <Button
              size="sm"
              onClick={onPurchase}
              disabled={!canAfford || isMaxLevel}
              className={`h-8 px-3 font-bold ${
                isMaxLevel
                  ? "bg-green-500/50 text-green-900"
                  : canAfford
                    ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                    : "bg-gray-600 text-gray-400"
              } disabled:opacity-50`}
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
  const [filterMode, setFilterMode] = useState<FilterMode>("affordable")

  const handlePurchase = (upgradeId: string) => {
    const newProgress = purchaseUpgradeLib(progress, upgradeId)
    onPurchase(newProgress)
  }

  const filterAndSortUpgrades = (upgrades: MetaUpgrade[]) => {
    let filtered = upgrades

    // Apply filter
    if (filterMode === "affordable") {
      filtered = filtered.filter((u) => canAffordUpgrade(progress, u))
    } else if (filterMode === "purchased") {
      filtered = filtered.filter((u) => getUpgradeLevel(progress, u.id) > 0)
    }

    // Sort: affordable first, then by cost
    return filtered.sort((a, b) => {
      const aAffordable = canAffordUpgrade(progress, a)
      const bAffordable = canAffordUpgrade(progress, b)
      const aMaxed = getUpgradeLevel(progress, a.id) >= a.maxLevel
      const bMaxed = getUpgradeLevel(progress, b.id) >= b.maxLevel

      // Maxed items go to bottom
      if (aMaxed && !bMaxed) return 1
      if (!aMaxed && bMaxed) return -1

      // Affordable items first
      if (aAffordable && !bAffordable) return -1
      if (!aAffordable && bAffordable) return 1

      // Then by cost (cheaper first)
      return a.cost - b.cost
    })
  }

  const statBoosts = filterAndSortUpgrades(META_UPGRADES.filter((u) => u.category === "stat"))
  const actionUnlocks = filterAndSortUpgrades(
    META_UPGRADES.filter((u) => u.category === "unlock" && u.effect.type === "unlock_action"),
  )
  const triggerUnlocks = filterAndSortUpgrades(
    META_UPGRADES.filter((u) => u.category === "unlock" && u.effect.type === "unlock_trigger"),
  )
  const actionUpgrades = filterAndSortUpgrades(META_UPGRADES.filter((u) => u.category === "action"))

  const countAffordable = (upgrades: MetaUpgrade[]) => upgrades.filter((u) => canAffordUpgrade(progress, u)).length

  const affordableCounts = {
    stats: countAffordable(META_UPGRADES.filter((u) => u.category === "stat")),
    actions: countAffordable(META_UPGRADES.filter((u) => u.category === "unlock" && u.effect.type === "unlock_action")),
    triggers: countAffordable(
      META_UPGRADES.filter((u) => u.category === "unlock" && u.effect.type === "unlock_trigger"),
    ),
    upgrades: countAffordable(META_UPGRADES.filter((u) => u.category === "action")),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <Card className="w-full max-w-5xl h-[90dvh] bg-gradient-to-br from-purple-900/90 via-black/90 to-cyan-900/90 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-cyan-500/30 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 mb-3">
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

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterMode === "affordable" ? "default" : "outline"}
              onClick={() => setFilterMode("affordable")}
              className={`flex-1 ${
                filterMode === "affordable"
                  ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                  : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              }`}
            >
              <Filter className="w-4 h-4 mr-1" />
              Affordable
            </Button>
            <Button
              size="sm"
              variant={filterMode === "all" ? "default" : "outline"}
              onClick={() => setFilterMode("all")}
              className={`flex-1 ${
                filterMode === "all"
                  ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                  : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              }`}
            >
              Show All
            </Button>
            <Button
              size="sm"
              variant={filterMode === "purchased" ? "default" : "outline"}
              onClick={() => setFilterMode("purchased")}
              className={`flex-1 ${
                filterMode === "purchased"
                  ? "bg-cyan-500 hover:bg-cyan-600 text-black"
                  : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Owned
            </Button>
          </div>
        </div>

        <Tabs defaultValue="stats" className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs List with affordable counts */}
          <TabsList className="mx-2 sm:mx-6 mt-2 sm:mt-4 grid grid-cols-4 gap-1 bg-black/40 border border-cyan-500/30 h-12 sm:h-10 p-1">
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-2"
            >
              <div className="flex items-center gap-1">
                <TrendingUp className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Stats</span>
              </div>
              {filterMode === "affordable" && affordableCounts.stats > 0 && (
                <span className="text-[10px] sm:text-xs px-1 py-0.5 rounded bg-cyan-500 text-black font-bold">
                  {affordableCounts.stats}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-2"
            >
              <div className="flex items-center gap-1">
                <Unlock className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Actions</span>
              </div>
              {filterMode === "affordable" && affordableCounts.actions > 0 && (
                <span className="text-[10px] sm:text-xs px-1 py-0.5 rounded bg-cyan-500 text-black font-bold">
                  {affordableCounts.actions}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="triggers"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-2"
            >
              <div className="flex items-center gap-1">
                <Zap className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Triggers</span>
              </div>
              {filterMode === "affordable" && affordableCounts.triggers > 0 && (
                <span className="text-[10px] sm:text-xs px-1 py-0.5 rounded bg-cyan-500 text-black font-bold">
                  {affordableCounts.triggers}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="upgrades"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-xs sm:text-sm px-2 sm:px-3 h-full flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-2"
            >
              <div className="flex items-center gap-1">
                <Wrench className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Upgrades</span>
              </div>
              {filterMode === "affordable" && affordableCounts.upgrades > 0 && (
                <span className="text-[10px] sm:text-xs px-1 py-0.5 rounded bg-cyan-500 text-black font-bold">
                  {affordableCounts.upgrades}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tabs Content */}
          <TabsContent value="stats" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              {statBoosts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">
                    {filterMode === "affordable"
                      ? "No affordable stat upgrades. Complete more runs to earn currency!"
                      : filterMode === "purchased"
                        ? "You haven't purchased any stat upgrades yet."
                        : "No stat upgrades available."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 pb-4">
                  {filterMode === "all" && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">
                      Permanent stat boosts that apply to all runs. Affordable items shown first.
                    </p>
                  )}
                  {statBoosts.map((upgrade) => (
                    <UpgradeCard
                      key={upgrade.id}
                      upgrade={upgrade}
                      progress={progress}
                      onPurchase={() => handlePurchase(upgrade.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              {actionUnlocks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">
                    {filterMode === "affordable"
                      ? "No affordable action unlocks. Keep playing to earn more currency!"
                      : filterMode === "purchased"
                        ? "You haven't unlocked any actions yet."
                        : "No action unlocks available."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 pb-4">
                  {filterMode === "all" && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">
                      Unlock new actions to use in your protocols. Affordable items shown first.
                    </p>
                  )}
                  {actionUnlocks.map((upgrade) => (
                    <UpgradeCard
                      key={upgrade.id}
                      upgrade={upgrade}
                      progress={progress}
                      onPurchase={() => handlePurchase(upgrade.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="triggers" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              {triggerUnlocks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">
                    {filterMode === "affordable"
                      ? "No affordable trigger unlocks right now."
                      : filterMode === "purchased"
                        ? "You haven't unlocked any triggers yet."
                        : "No trigger unlocks available."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 pb-4">
                  {filterMode === "all" && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">
                      Unlock new triggers for your protocols. Affordable items shown first.
                    </p>
                  )}
                  {triggerUnlocks.map((upgrade) => (
                    <UpgradeCard
                      key={upgrade.id}
                      upgrade={upgrade}
                      progress={progress}
                      onPurchase={() => handlePurchase(upgrade.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upgrades" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 sm:p-6">
              {actionUpgrades.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">
                    {filterMode === "affordable"
                      ? "No affordable action upgrades available."
                      : filterMode === "purchased"
                        ? "You haven't upgraded any actions yet."
                        : "No action upgrades available."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 pb-4">
                  {filterMode === "all" && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-4">
                      Enhance specific actions to make them more powerful. Affordable items shown first.
                    </p>
                  )}
                  {actionUpgrades.map((upgrade) => (
                    <UpgradeCard
                      key={upgrade.id}
                      upgrade={upgrade}
                      progress={progress}
                      onPurchase={() => handlePurchase(upgrade.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="hidden sm:block p-4 border-t border-cyan-500/30 flex-shrink-0">
          <div className="text-xs text-gray-400 text-center">
            <p>Complete nodes to earn currency • Upgrades are permanent</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
