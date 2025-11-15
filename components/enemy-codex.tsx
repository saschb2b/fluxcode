"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { X, Shield, Zap, Activity, ArrowLeft } from 'lucide-react'
import { ALL_ENEMIES, getEnemiesByTier, getEnemiesByFaction } from "@/lib/enemies"
import type { EnemyDefinition } from "@/lib/enemies"
import { CustomizableFighter } from "@/components/customizable-fighter"

interface EnemyCodexProps {
  isOpen: boolean
  onClose: () => void
}

export function EnemyCodex({ isOpen, onClose }: EnemyCodexProps) {
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyDefinition | null>(null)
  const [filterTier, setFilterTier] = useState<string>("all")
  const [filterFaction, setFilterFaction] = useState<string>("all")
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  if (!isOpen) return null

  const filteredEnemies = ALL_ENEMIES.filter(enemy => {
    if (filterTier !== "all" && enemy.tier !== filterTier) return false
    if (filterFaction !== "all" && enemy.faction !== filterFaction) return false
    return true
  }).sort((a, b) => a.name.localeCompare(b.name))

  const handleEnemySelect = (enemy: EnemyDefinition) => {
    setSelectedEnemy(enemy)
    setShowMobileDetail(true)
  }

  const handleMobileBack = () => {
    setShowMobileDetail(false)
    setSelectedEnemy(null)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "basic": return "#94a3b8"
      case "advanced": return "#60a5fa"
      case "elite": return "#a855f7"
      case "boss": return "#ef4444"
      default: return "#94a3b8"
    }
  }

  const getFactionColor = (faction: string) => {
    switch (faction) {
      case "corrupted-network": return "#ef4444"
      case "rogue-ai": return "#a855f7"
      case "sentinel": return "#06b6d4"
      case "void-anomaly": return "#10b981"
      case "guardian": return "#fbbf24"
      default: return "#94a3b8"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full h-full sm:w-[90vw] sm:h-[85vh] max-w-6xl bg-card/95 border-2 border-primary shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-primary/50 bg-background/80">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            {showMobileDetail && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMobileBack}
                className="md:hidden hover:bg-primary/20 h-8 w-8 border border-border flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-destructive/20 flex items-center justify-center border border-destructive/50 flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-xl font-bold text-destructive tracking-wider">ENEMY CODEX</h2>
              <div className="text-[9px] sm:text-xs text-muted-foreground font-mono mt-0.5">
                THREAT DATABASE: {filteredEnemies.length} ENTRIES
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/20 h-8 w-8 sm:h-10 sm:w-10 border border-border flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className={`flex gap-2 p-2 sm:p-3 border-b border-border/50 bg-background/50 ${showMobileDetail ? "hidden md:flex" : "flex"} overflow-x-auto flex-wrap`}>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="flex-1 min-w-[120px] px-2 py-1.5 text-xs font-mono bg-background border-2 border-border rounded"
          >
            <option value="all">ALL TIERS</option>
            <option value="basic">BASIC</option>
            <option value="advanced">ADVANCED</option>
            <option value="elite">ELITE</option>
            <option value="boss">BOSS</option>
          </select>
          <select
            value={filterFaction}
            onChange={(e) => setFilterFaction(e.target.value)}
            className="flex-1 min-w-[120px] px-2 py-1.5 text-xs font-mono bg-background border-2 border-border rounded"
          >
            <option value="all">ALL FACTIONS</option>
            <option value="corrupted-network">CORRUPTED NETWORK</option>
            <option value="rogue-ai">ROGUE AI</option>
            <option value="sentinel">SENTINEL</option>
            <option value="void-anomaly">VOID ANOMALY</option>
            <option value="guardian">GUARDIAN</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Enemy List */}
          <div className={`w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-border/50 bg-background/30 ${showMobileDetail ? "hidden md:block" : "block"} overflow-y-auto`}>
            {filteredEnemies.map((enemy) => (
              <button
                key={enemy.id}
                onClick={() => handleEnemySelect(enemy)}
                className={`w-full text-left p-2 sm:p-3 rounded border-2 transition-all active:scale-[0.98] font-mono ${
                  selectedEnemy === enemy
                    ? "bg-destructive/10 border-destructive text-destructive"
                    : "border-border/30 hover:border-destructive/50 text-foreground/90 hover:bg-card/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                      style={{ backgroundColor: getTierColor(enemy.tier) }}
                    />
                    <div className="font-bold text-xs sm:text-sm tracking-wide uppercase line-clamp-1">
                      {enemy.name}
                    </div>
                  </div>
                  <div
                    className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded border font-bold tracking-wider flex-shrink-0"
                    style={{
                      backgroundColor: `${getTierColor(enemy.tier)}20`,
                      borderColor: `${getTierColor(enemy.tier)}60`,
                      color: getTierColor(enemy.tier)
                    }}
                  >
                    {enemy.tier.toUpperCase()}
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                  {enemy.title}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className="text-[8px] px-1 py-0.5 rounded font-mono"
                    style={{
                      backgroundColor: `${getFactionColor(enemy.faction)}15`,
                      color: getFactionColor(enemy.faction)
                    }}
                  >
                    {enemy.classification}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Enemy Detail */}
          <div className={`flex-1 flex flex-col min-h-0 bg-background/20 ${!showMobileDetail ? "hidden md:flex" : "flex"}`}>
            {selectedEnemy ? (
              <>
                {/* 3D Preview */}
                <div className="h-[200px] sm:h-[280px] flex-shrink-0 bg-background/80 border-b border-border/50 relative overflow-hidden">
                  <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <CustomizableFighter customization={selectedEnemy.render()} />
                    <OrbitControls enableZoom={false} enablePan={false} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[5, 5, 5]} intensity={1} />
                  </Canvas>
                  <div className="absolute bottom-2 right-2 text-[9px] sm:text-xs font-mono text-muted-foreground/70 bg-background/80 px-2 py-1 rounded border border-border/30">
                    THREAT PROFILE
                  </div>
                </div>

                {/* Enemy Info */}
                <div className="flex-1 overflow-auto p-3 sm:p-5 space-y-3 sm:space-y-4 font-mono">
                  {/* Name and Title */}
                  <div
                    className="border-l-4 pl-3 sm:pl-4"
                    style={{ borderColor: getTierColor(selectedEnemy.tier) }}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">THREAT DESIGNATION</div>
                        <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider">{selectedEnemy.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{selectedEnemy.title}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border-2 font-bold text-center"
                          style={{
                            borderColor: getTierColor(selectedEnemy.tier),
                            color: getTierColor(selectedEnemy.tier),
                            backgroundColor: `${getTierColor(selectedEnemy.tier)}15`
                          }}
                        >
                          {selectedEnemy.tier.toUpperCase()}
                        </span>
                        <span
                          className="text-[10px] sm:text-xs px-2 py-0.5 rounded border font-mono text-center"
                          style={{
                            borderColor: getFactionColor(selectedEnemy.faction),
                            color: getFactionColor(selectedEnemy.faction),
                            backgroundColor: `${getFactionColor(selectedEnemy.faction)}10`
                          }}
                        >
                          {selectedEnemy.classification}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 sm:p-3 rounded border-2 border-destructive/30 bg-destructive/5">
                      <div className="flex items-center gap-1 mb-1">
                        <Activity className="w-3 h-3 text-destructive" />
                        <div className="text-[9px] sm:text-xs text-destructive font-bold">HP</div>
                      </div>
                      <div className="text-lg sm:text-2xl font-bold">{selectedEnemy.stats.baseHp}</div>
                    </div>
                    <div className="p-2 sm:p-3 rounded border-2 border-primary/30 bg-primary/5">
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="w-3 h-3 text-primary" />
                        <div className="text-[9px] sm:text-xs text-primary font-bold">SHIELD</div>
                      </div>
                      <div className="text-lg sm:text-2xl font-bold">{selectedEnemy.stats.baseShields}</div>
                    </div>
                    <div className="p-2 sm:p-3 rounded border-2 border-accent/30 bg-accent/5">
                      <div className="flex items-center gap-1 mb-1">
                        <Zap className="w-3 h-3 text-accent" />
                        <div className="text-[9px] sm:text-xs text-accent font-bold">ARMOR</div>
                      </div>
                      <div className="text-lg sm:text-2xl font-bold">{selectedEnemy.stats.baseArmor}</div>
                    </div>
                  </div>

                  {/* Resistances */}
                  {selectedEnemy.stats.resistances && Object.keys(selectedEnemy.stats.resistances).length > 0 && (
                    <div className="p-3 sm:p-4 rounded border-2 border-accent/30 bg-accent/5">
                      <div className="text-[10px] sm:text-xs font-bold tracking-wider text-accent mb-2">[RESISTANCES]</div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        {Object.entries(selectedEnemy.stats.resistances).map(([type, value]) => (
                          <div key={type} className="flex justify-between">
                            <span className="text-muted-foreground">{type.toUpperCase()}:</span>
                            <span className="font-bold">{(value! * 100).toFixed(0)}% Reduction</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lore */}
                  <div className="p-3 sm:p-4 rounded border-2 border-border/50 bg-card/30">
                    <div className="text-[10px] sm:text-xs font-bold tracking-wider text-primary mb-2">[THREAT ASSESSMENT]</div>
                    <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      {selectedEnemy.lore}
                    </div>
                  </div>

                  {/* Faction */}
                  <div
                    className="p-3 sm:p-4 rounded border-2"
                    style={{
                      backgroundColor: `${getFactionColor(selectedEnemy.faction)}10`,
                      borderColor: `${getFactionColor(selectedEnemy.faction)}40`
                    }}
                  >
                    <div className="text-[10px] sm:text-xs font-bold tracking-wider mb-2"
                      style={{ color: getFactionColor(selectedEnemy.faction) }}>
                      [FACTION: {selectedEnemy.faction.toUpperCase().replace(/-/g, " ")}]
                    </div>
                    <div className="text-xs sm:text-sm text-foreground/90">
                      Wave Availability: {selectedEnemy.minWave}+
                    </div>
                  </div>

                  {/* Protocols */}
                  <div className="p-3 sm:p-4 rounded border-2 border-secondary/30 bg-secondary/5">
                    <div className="text-[10px] sm:text-xs font-bold tracking-wider text-secondary mb-2">
                      [COMBAT PROTOCOLS: {selectedEnemy.protocols.length}]
                    </div>
                    <div className="space-y-1 text-[10px] sm:text-xs text-muted-foreground">
                      {selectedEnemy.protocols.map((protocol, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-secondary font-bold">•</span>
                          <span>{protocol.trigger.name} → {protocol.action.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center font-mono">
                  <div className="w-16 h-16 mx-auto mb-4 rounded border-2 border-dashed border-border/50 flex items-center justify-center">
                    <Shield className="w-8 h-8 opacity-30" />
                  </div>
                  <p className="text-xs sm:text-sm uppercase tracking-wider">[SELECT THREAT PROFILE]</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1">Clearance: OPERATOR</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
