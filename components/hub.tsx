"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, User, Palette, ShoppingCart, BookOpen, Coins, Trophy, Target, Zap } from "lucide-react"
import type { CharacterPreset } from "@/lib/character-presets"
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts"
import type { PlayerProgress } from "@/lib/meta-progression"
import { Hub3DScene } from "./hub-3d-scene"

interface HubProps {
  selectedCharacter: CharacterPreset | null
  fighterCustomization: FighterCustomizationType
  playerProgress: PlayerProgress
  onStartRun: () => void
  onSelectCharacter: () => void
  onCustomizeFighter: () => void
  onOpenShop: () => void
  onOpenCodex: () => void
}

export function Hub({
  selectedCharacter,
  fighterCustomization,
  playerProgress,
  onStartRun,
  onSelectCharacter,
  onCustomizeFighter,
  onOpenShop,
  onOpenCodex,
}: HubProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#0a0015] overflow-y-auto h-dvh">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-magenta-500 to-transparent animate-pulse" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <Hub3DScene fighterCustomization={fighterCustomization} hasCharacter={!!selectedCharacter} />

      <div className="relative z-10 min-h-full flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1fr] lg:gap-6 p-3 sm:p-6 lg:p-8 pb-6">
        {/* Left Panel - Desktop only */}
        <div className="hidden lg:flex flex-col gap-6">
          {/* Header - Desktop left panel */}
          <div className="backdrop-blur-sm bg-black/30 px-6 py-4 rounded-lg border border-cyan-500/30">
            <h1 className="text-5xl font-bold text-cyan-400 tracking-wider" style={{ fontFamily: "monospace" }}>
              HUB
            </h1>
            <p className="text-base text-cyan-300/60 tracking-wider mt-2">Prepare for battle</p>
          </div>

          {/* Selected Character Info - Desktop */}
          {selectedCharacter && (
            <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 p-6 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Fighter Class</div>
                  <div className="text-3xl font-bold mb-4" style={{ color: selectedCharacter.color }}>
                    {selectedCharacter.name}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onSelectCharacter}
                  className="w-full border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95 bg-transparent"
                >
                  <User className="w-5 h-5 mr-2" />
                  Change Fighter
                </Button>
              </div>
            </Card>
          )}

          {/* No Character Selected - Desktop */}
          {!selectedCharacter && (
            <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 p-6 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <div className="text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-base text-muted-foreground mb-4">No fighter selected</p>
                <Button
                  onClick={onSelectCharacter}
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black active:scale-95 w-full"
                >
                  <User className="w-5 h-5 mr-2" />
                  Select Fighter
                </Button>
              </div>
            </Card>
          )}

          {/* Stats - Desktop */}
          {playerProgress.totalRuns > 0 && (
            <Card className="bg-card/90 backdrop-blur-md border-2 border-green-500/50 p-6 shadow-[0_0_15px_rgba(0,255,0,0.2)] hover:shadow-[0_0_25px_rgba(0,255,0,0.4)] transition-all">
              <h2 className="text-xl font-bold text-green-400 mb-4">Career Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Total Runs</span>
                  </div>
                  <div className="text-3xl font-bold text-cyan-400">{playerProgress.totalRuns}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    <span>Nodes Completed</span>
                  </div>
                  <div className="text-3xl font-bold text-green-400">{playerProgress.totalNodesCompleted}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Trophy className="w-4 h-4" />
                    <span>Deepest Reach</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">
                    L{playerProgress.bestLayerReached + 1}-N{playerProgress.bestNodeInBestLayer + 1}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Center Panel - 3D Scene spacer on desktop, content on mobile */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:justify-end lg:pb-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-6 lg:hidden">
            <div className="backdrop-blur-sm bg-black/30 px-3 py-2 rounded-lg border border-cyan-500/30">
              <h1
                className="text-xl sm:text-4xl font-bold text-cyan-400 tracking-wider"
                style={{ fontFamily: "monospace" }}
              >
                HUB
              </h1>
              <p className="text-xs sm:text-sm text-cyan-300/60 tracking-wider mt-1 hidden sm:block">
                Prepare for battle
              </p>
            </div>

            {/* Currency Display - Mobile */}
            <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 px-2 sm:px-4 py-1.5 sm:py-2 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <div className="text-base sm:text-xl font-bold text-yellow-400">{playerProgress.currency}</div>
              </div>
            </Card>
          </div>

          {/* Mobile Character Info */}
          {selectedCharacter && (
            <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 p-3 sm:p-4 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Fighter Class</div>
                  <div className="text-lg sm:text-xl font-bold" style={{ color: selectedCharacter.color }}>
                    {selectedCharacter.name}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectCharacter}
                  className="border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95 bg-transparent"
                >
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Change</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Mobile No Character */}
          {!selectedCharacter && (
            <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 p-4 shadow-[0_0_15px_rgba(0,255,255,0.2)] lg:hidden">
              <div className="text-center">
                <User className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No fighter selected</p>
                <Button
                  onClick={onSelectCharacter}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black active:scale-95 w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Select Fighter
                </Button>
              </div>
            </Card>
          )}

          {/* Mobile Actions */}
          <Card className="bg-card/90 backdrop-blur-md border-2 border-magenta-500/50 p-3 sm:p-4 shadow-[0_0_15px_rgba(255,0,255,0.2)] hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] transition-all lg:hidden">
            <h2 className="text-sm sm:text-lg font-bold text-magenta-400 mb-2 sm:mb-3">Actions</h2>
            <div className="flex flex-col gap-2">
              <Button
                onClick={onCustomizeFighter}
                variant="outline"
                className="justify-start border-magenta-500/50 hover:bg-magenta-500/20 active:scale-95 bg-transparent h-10 sm:h-12"
              >
                <Palette className="w-4 h-4 mr-2 text-magenta-400" />
                <span className="text-sm sm:text-base">Customize</span>
              </Button>

              {playerProgress.totalRuns > 0 && (
                <Button
                  onClick={onOpenShop}
                  variant="outline"
                  className="justify-start border-yellow-500/50 hover:bg-yellow-500/20 active:scale-95 bg-transparent h-10 sm:h-12"
                >
                  <ShoppingCart className="w-4 h-4 mr-2 text-yellow-400" />
                  <span className="text-sm sm:text-base">Upgrades</span>
                </Button>
              )}

              <Button
                onClick={onOpenCodex}
                variant="outline"
                className="justify-start border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95 bg-transparent h-10 sm:h-12"
              >
                <BookOpen className="w-4 h-4 mr-2 text-cyan-400" />
                <span className="text-sm sm:text-base">Codex</span>
              </Button>
            </div>
          </Card>

          {/* Mobile Stats */}
          {playerProgress.totalRuns > 0 && (
            <Card className="bg-card/90 backdrop-blur-md border-2 border-green-500/50 p-3 sm:p-4 shadow-[0_0_15px_rgba(0,255,0,0.2)] hover:shadow-[0_0_25px_rgba(0,255,0,0.4)] transition-all lg:hidden">
              <h2 className="text-sm sm:text-lg font-bold text-green-400 mb-2 sm:mb-3">Career Stats</h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <Zap className="w-3 h-3" />
                    <span>Runs</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-cyan-400">{playerProgress.totalRuns}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <Target className="w-3 h-3" />
                    <span>Nodes</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-green-400">
                    {playerProgress.totalNodesCompleted}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <Trophy className="w-3 h-3" />
                    <span>Best</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-yellow-400">
                    L{playerProgress.bestLayerReached + 1}-N{playerProgress.bestNodeInBestLayer + 1}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Start Run Button - Centered on desktop */}
          <Button
            onClick={onStartRun}
            disabled={!selectedCharacter}
            className="h-12 sm:h-16 lg:h-20 text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black border-2 border-green-300 shadow-[0_0_20px_rgba(0,255,0,0.5)] hover:shadow-[0_0_30px_rgba(0,255,0,0.8)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 sticky bottom-0 z-20 backdrop-blur-sm lg:relative"
          >
            <Play className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
            START RUN
          </Button>
        </div>

        {/* Right Panel - Desktop only */}
        <div className="hidden lg:flex flex-col gap-6">
          {/* Currency Display - Desktop */}
          <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 px-6 py-4 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Currency</div>
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-yellow-400" />
                <div className="text-3xl font-bold text-yellow-400">{playerProgress.currency}</div>
              </div>
            </div>
          </Card>

          {/* Actions - Desktop */}
          <Card className="bg-card/90 backdrop-blur-md border-2 border-magenta-500/50 p-6 shadow-[0_0_15px_rgba(255,0,255,0.2)] hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] transition-all">
            <h2 className="text-xl font-bold text-magenta-400 mb-4">Actions</h2>
            <div className="flex flex-col gap-3">
              <Button
                onClick={onCustomizeFighter}
                variant="outline"
                size="lg"
                className="justify-start border-magenta-500/50 hover:bg-magenta-500/20 active:scale-95 bg-transparent"
              >
                <Palette className="w-5 h-5 mr-3 text-magenta-400" />
                <span className="text-base">Customize Fighter</span>
              </Button>

              {playerProgress.totalRuns > 0 && (
                <Button
                  onClick={onOpenShop}
                  variant="outline"
                  size="lg"
                  className="justify-start border-yellow-500/50 hover:bg-yellow-500/20 active:scale-95 bg-transparent"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 text-yellow-400" />
                  <span className="text-base">Meta Upgrades</span>
                </Button>
              )}

              <Button
                onClick={onOpenCodex}
                variant="outline"
                size="lg"
                className="justify-start border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95 bg-transparent"
              >
                <BookOpen className="w-5 h-5 mr-3 text-cyan-400" />
                <span className="text-base">View Codex</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* CRT Effect */}
      <div className="crt-effect absolute inset-0 pointer-events-none" />
    </div>
  )
}
