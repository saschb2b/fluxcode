"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Card } from "@/components/ui/card"
import { Play, User, Palette, ShoppingCart, BookOpen, Coins, Trophy, Target, Zap } from "lucide-react"
import type { CharacterPreset } from "@/lib/character-presets"
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts"
import type { PlayerProgress } from "@/lib/meta-progression"
import { Hub3DScene } from "./hub-3d-scene"
import { useState } from "react"

interface HubProps {
  selectedCharacter: CharacterPreset | null
  fighterCustomization: FighterCustomizationType
  playerProgress: PlayerProgress
  onStartRun: () => void
  onSelectCharacter: () => void
  onCustomizeFighter: () => void
  onOpenShop: () => void
  onOpenCodex: () => void
  bgmAudioRef?: React.RefObject<HTMLAudioElement | null>
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
  bgmAudioRef,
}: HubProps) {
  const [isBreaching, setIsBreaching] = useState(false)

  const handleBreach = () => {
    setIsBreaching(true)

    const originalVolume = bgmAudioRef?.current?.volume ?? 0.5
    if (bgmAudioRef?.current) {
      bgmAudioRef.current.volume = 0.2
    }

    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/corrupt-data-sound-379468-HQLEeA9R8HMMVTOvLhZb5N5Kvad81G.mp3")
    audio.volume = 0.7
    audio.play().catch((err) => console.error("[v0] Failed to play breach sound:", err))

    audio.addEventListener("ended", () => {
      if (bgmAudioRef?.current) {
        bgmAudioRef.current.volume = originalVolume
      }
    })

    // Animation sequence takes 3 seconds
    setTimeout(() => {
      onStartRun()
    }, 3000)
  }

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

      <div className="relative z-10 min-h-full flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1fr] lg:gap-6 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-6">
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
        <div className="flex flex-col gap-4 sm:gap-6 lg:justify-end lg:pb-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-2 lg:hidden">
            <div className="backdrop-blur-sm bg-black/40 px-4 py-2.5 rounded-lg border border-cyan-500/40 shadow-lg">
              <h1
                className="text-2xl sm:text-4xl font-bold text-cyan-400 tracking-wider"
                style={{ fontFamily: "monospace" }}
              >
                HUB
              </h1>
            </div>

            <Card className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md border-2 border-yellow-500/60 px-4 py-2.5 shadow-[0_0_20px_rgba(255,215,0,0.4)]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <div className="flex flex-col">
                  <span
                    className="text-[10px] text-yellow-400/70 leading-none mb-0.5"
                    style={{ fontFamily: "monospace" }}
                  >
                    CF
                  </span>
                  <span className="text-xl font-bold text-yellow-400 leading-none" style={{ fontFamily: "monospace" }}>
                    {playerProgress.cipherFragments}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="h-32 sm:h-48 lg:hidden" />

          {/* Mobile Character Info */}
          {selectedCharacter && (
            <Card className="bg-gradient-to-br from-cyan-950/40 to-black/60 backdrop-blur-md border-2 border-cyan-500/60 p-4 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-cyan-300/70 mb-1" style={{ fontFamily: "monospace" }}>
                    FIGHTER CLASS
                  </div>
                  <div
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: selectedCharacter.color, fontFamily: "monospace" }}
                  >
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
            <Card className="bg-gradient-to-br from-cyan-950/40 to-black/60 backdrop-blur-md border-2 border-cyan-500/60 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] lg:hidden">
              <div className="text-center">
                <User className="w-12 h-12 text-cyan-400/70 mx-auto mb-3" />
                <p className="text-sm text-cyan-300/70 mb-4" style={{ fontFamily: "monospace" }}>
                  NO FIGHTER SELECTED
                </p>
                <Button
                  onClick={onSelectCharacter}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black active:scale-95 w-full h-11"
                >
                  <User className="w-4 h-4 mr-2" />
                  Select Fighter
                </Button>
              </div>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-magenta-950/40 to-black/60 backdrop-blur-md border-2 border-magenta-500/60 p-4 shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] transition-all lg:hidden">
            <h2 className="text-base sm:text-lg font-bold text-magenta-400 mb-4" style={{ fontFamily: "monospace" }}>
              OPERATIONS
            </h2>
            <div className="flex flex-col gap-3">
              <Button
                onClick={onCustomizeFighter}
                variant="outline"
                className="justify-start border-magenta-500/60 hover:bg-magenta-500/20 active:scale-95 bg-black/40 h-12"
              >
                <Palette className="w-5 h-5 mr-3 text-magenta-400" />
                <span className="text-sm sm:text-base">Configure Loadout</span>
              </Button>

              {playerProgress.totalRuns > 0 && (
                <Button
                  onClick={onOpenShop}
                  variant="outline"
                  className="justify-start border-yellow-500/60 hover:bg-yellow-500/20 active:scale-95 bg-black/40 h-12"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 text-yellow-400" />
                  <span className="text-sm sm:text-base">Protocol Vault</span>
                </Button>
              )}

              <Button
                onClick={onOpenCodex}
                variant="outline"
                className="justify-start border-cyan-500/60 hover:bg-cyan-500/20 active:scale-95 bg-black/40 h-12"
              >
                <BookOpen className="w-5 h-5 mr-3 text-cyan-400" />
                <span className="text-sm sm:text-base">Data Archive</span>
              </Button>
            </div>
          </Card>

          {/* Mobile Stats */}
          {playerProgress.totalRuns > 0 && (
            <Card className="bg-gradient-to-br from-green-950/40 to-black/60 backdrop-blur-md border-2 border-green-500/60 p-4 shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] transition-all lg:hidden">
              <h2 className="text-base sm:text-lg font-bold text-green-400 mb-4" style={{ fontFamily: "monospace" }}>
                CAREER STATS
              </h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-black/30 rounded-lg p-3 border border-cyan-500/30">
                  <div className="flex items-center justify-center gap-1 text-xs text-cyan-300/70 mb-2">
                    <Zap className="w-3 h-3" />
                    <span>RUNS</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: "monospace" }}>
                    {playerProgress.totalRuns}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center justify-center gap-1 text-xs text-green-300/70 mb-2">
                    <Target className="w-3 h-3" />
                    <span>NODES</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400" style={{ fontFamily: "monospace" }}>
                    {playerProgress.totalNodesCompleted}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-yellow-500/30">
                  <div className="flex items-center justify-center gap-1 text-xs text-yellow-300/70 mb-2">
                    <Trophy className="w-3 h-3" />
                    <span>BEST</span>
                  </div>
                  <div className="text-xl font-bold text-yellow-400" style={{ fontFamily: "monospace" }}>
                    L{playerProgress.bestLayerReached + 1}-{playerProgress.bestNodeInBestLayer + 1}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="h-4 lg:hidden" />

          {/* Start Run Button - Desktop centered */}
          <Button
            onClick={handleBreach}
            disabled={!selectedCharacter}
            className="hidden lg:flex h-20 text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black border-2 border-green-300 shadow-[0_0_20px_rgba(0,255,0,0.5)] hover:shadow-[0_0_30px_rgba(0,255,0,0.8)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            style={{ fontFamily: "monospace" }}
          >
            <Play className="w-6 h-6 mr-2" />
            INITIATE BREACH
          </Button>
        </div>

        {/* Right Panel - Desktop only */}
        <div className="hidden lg:flex flex-col gap-6">
          {/* Currency Display - Desktop */}
          <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 px-6 py-4 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Cipher Fragments</div>
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-yellow-400" />
                <div className="text-3xl font-bold text-yellow-400">{playerProgress.cipherFragments}</div>
              </div>
            </div>
          </Card>

          {/* Actions - Desktop */}
          <Card className="bg-card/90 backdrop-blur-md border-2 border-magenta-500/50 p-6 shadow-[0_0_15px_rgba(255,0,255,0.2)] hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] transition-all">
            <h2 className="text-xl font-bold text-magenta-400 mb-4" style={{ fontFamily: "monospace" }}>
              OPERATIONS
            </h2>
            <div className="flex flex-col gap-3">
              <Button
                onClick={onCustomizeFighter}
                variant="outline"
                size="lg"
                className="justify-start border-magenta-500/50 hover:bg-magenta-500/20 active:scale-95 bg-transparent"
              >
                <Palette className="w-5 h-5 mr-3 text-magenta-400" />
                <span className="text-base">Configure Loadout</span>
              </Button>

              {playerProgress.totalRuns > 0 && (
                <Button
                  onClick={onOpenShop}
                  variant="outline"
                  size="lg"
                  className="justify-start border-yellow-500/50 hover:bg-yellow-500/20 active:scale-95 bg-transparent"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 text-yellow-400" />
                  <span className="text-base">Protocol Vault</span>
                </Button>
              )}

              <Button
                onClick={onOpenCodex}
                variant="outline"
                size="lg"
                className="justify-start border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95 bg-transparent"
              >
                <BookOpen className="w-5 h-5 mr-3 text-cyan-400" />
                <span className="text-base">Data Archive</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {isBreaching && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-cyan-400 rounded-full animate-spin" />
            <div
              className="absolute inset-8 border-4 border-transparent border-b-green-400 border-l-green-400 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            />
            <div
              className="absolute inset-16 border-4 border-transparent border-t-magenta-400 border-r-magenta-400 rounded-full animate-spin"
              style={{ animationDuration: "1.5s" }}
            />

            {/* Hexagonal pulse grid */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-6 gap-4 animate-pulse">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 border border-cyan-400/30"
                    style={{
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Binary code stream */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="binary-stream text-green-400 text-xs font-mono leading-tight whitespace-pre">
                {Array.from({ length: 30 })
                  .map(() =>
                    Array.from({ length: 40 })
                      .map(() => Math.round(Math.random()))
                      .join(""),
                  )
                  .join("\n")}
              </div>
            </div>

            {/* Center status display */}
            <div className="relative z-10 text-center space-y-6 px-8">
              <div className="text-6xl font-bold text-cyan-400 animate-pulse" style={{ fontFamily: "monospace" }}>
                BREACH
              </div>
              <div className="space-y-2">
                <div className="text-green-400 text-sm animate-typing" style={{ fontFamily: "monospace" }}>
                  &gt; CONNECTING TO NETWORK...
                </div>
                <div
                  className="text-yellow-400 text-sm animate-typing"
                  style={{ fontFamily: "monospace", animationDelay: "1s" }}
                >
                  &gt; BYPASSING FIREWALL...
                </div>
                <div
                  className="text-cyan-400 text-sm animate-typing"
                  style={{ fontFamily: "monospace", animationDelay: "2s" }}
                >
                  &gt; ACCESS GRANTED
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-black/50 border border-cyan-400/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 via-green-400 to-magenta-400 animate-progress" />
              </div>

              <div
                className="text-2xl font-bold text-magenta-400 animate-pulse"
                style={{ fontFamily: "monospace", animationDelay: "2.5s" }}
              >
                BREACH INITIATED
              </div>
            </div>

            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-cyan-400 animate-pulse" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-green-400 animate-pulse" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-green-400 animate-pulse" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-magenta-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* CRT Effect */}
      <div className="crt-effect absolute inset-0 pointer-events-none" />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-sm z-30 lg:hidden">
        <Button
          onClick={handleBreach}
          disabled={!selectedCharacter}
          className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black border-2 border-green-300 shadow-[0_0_25px_rgba(0,255,0,0.6)] hover:shadow-[0_0_35px_rgba(0,255,0,0.9)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          style={{ fontFamily: "monospace" }}
        >
          <Play className="w-6 h-6 mr-2" />
          INITIATE BREACH
        </Button>
      </div>
    </div>
  )
}
