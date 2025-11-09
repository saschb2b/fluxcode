"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Card } from "@/components/ui/card"
import { Play, User, ShoppingCart, BookOpen, Coins, Trophy, Target, Zap, FileText } from "lucide-react"
import type { CharacterPreset } from "@/lib/character-presets"
import type { FighterCustomization as FighterCustomizationType } from "@/lib/fighter-parts"
import type { PlayerProgress } from "@/lib/meta-progression"
import { META_UPGRADES, canAffordUpgrade } from "@/lib/meta-progression"
import { Hub3DScene } from "./hub-3d-scene"
import { useState, useMemo } from "react"

interface HubProps {
  selectedCharacter: CharacterPreset | null
  fighterCustomization: FighterCustomizationType
  playerProgress: PlayerProgress
  onStartRun: () => void
  onSelectCharacter: () => void
  onCustomizeFighter: () => void
  onOpenShop: () => void
  onOpenCodex: () => void
  onOpenContracts: () => void
  onOpenClassManager: () => void
  bgmAudioRef?: React.RefObject<HTMLAudioElement | null>
  isInHub?: boolean
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
  onOpenContracts,
  onOpenClassManager,
  bgmAudioRef,
  isInHub = true,
}: HubProps) {
  const [isBreaching, setIsBreaching] = useState(false)

  const shopBadgeCount = useMemo(() => {
    return META_UPGRADES.filter((upgrade) => canAffordUpgrade(playerProgress, upgrade)).length
  }, [playerProgress])

  const contractsBadgeCount = useMemo(() => {
    if (!playerProgress.contractProgress) return 0
    const dailyClaimable = playerProgress.contractProgress.dailyContracts.filter(
      (c) => c.progress >= c.maxProgress && !c.claimed,
    ).length
    const weeklyClaimable = playerProgress.contractProgress.weeklyContracts.filter(
      (c) => c.progress >= c.maxProgress && !c.claimed,
    ).length
    return dailyClaimable + weeklyClaimable
  }, [playerProgress])

  const handleBreach = () => {
    setIsBreaching(true)
    const originalVolume = bgmAudioRef?.current?.volume ?? 0.5
    if (bgmAudioRef?.current) {
      bgmAudioRef.current.volume = 0.2
    }
    const audio = new Audio(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/corrupt-data-sound-379468-HQLEeA9R8HMMVTOvLhZb5N5Kvad81G.mp3",
    )
    audio.volume = 0.7
    audio.play().catch((err) => console.error("[v0] Failed to play breach sound:", err))
    audio.addEventListener("ended", () => {
      if (bgmAudioRef?.current) {
        bgmAudioRef.current.volume = originalVolume
      }
    })
    setTimeout(() => {
      onStartRun()
    }, 3000)
  }

  const NotificationBadge = ({ count }: { count: number }) => {
    if (count === 0) return null
    return (
      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black shadow-[0_0_10px_rgba(255,215,0,0.6)]">
        {count > 9 ? "9+" : count}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#0a0015] overflow-y-auto h-dvh">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-magenta-500 to-transparent animate-pulse" />
      </div>
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />
      <Hub3DScene fighterCustomization={fighterCustomization} hasCharacter={!!selectedCharacter} />
      <div className="relative z-10 min-h-full flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1fr] lg:gap-6 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-6">
        <div className="hidden lg:flex flex-col gap-6">
          <div className="backdrop-blur-sm bg-black/30 px-6 py-4 rounded-lg border border-cyan-500/30">
            <h1 className="text-5xl font-bold text-cyan-400 tracking-wider" style={{ fontFamily: "monospace" }}>
              HUB
            </h1>
          </div>
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
                  onClick={onOpenClassManager}
                  className="w-full border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95 bg-transparent"
                >
                  <User className="w-5 h-5 mr-2" />
                  Manage Classes
                </Button>
              </div>
            </Card>
          )}
          {!selectedCharacter && (
            <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 p-6 shadow-[0_0_15px_rgba(0,255,0,0.2)]">
              <div className="text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-base text-muted-foreground mb-4">No fighter selected</p>
                <Button
                  onClick={onOpenClassManager}
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black active:scale-95 w-full"
                >
                  <User className="w-5 h-5 mr-2" />
                  Select Class
                </Button>
              </div>
            </Card>
          )}
          {playerProgress.totalRuns > 0 && (
            <Card className="bg-gradient-to-br from-green-950/60 to-black/80 backdrop-blur-md border-2 border-green-500/60 p-4 shadow-[0_0_20px_rgba(0,255,0,0.4)]">
              <h2 className="text-lg font-bold text-green-400 mb-4" style={{ fontFamily: "monospace" }}>
                CAREER STATS
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-black/40 rounded p-3 border border-cyan-500/30">
                  <div className="flex items-center gap-2 text-xs text-cyan-300/70 mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Total Runs</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: "monospace" }}>
                    {playerProgress.totalRuns}
                  </div>
                </div>
                <div className="bg-black/40 rounded p-3 border border-green-500/30">
                  <div className="flex items-center gap-2 text-xs text-green-300/70 mb-1">
                    <Target className="w-4 h-4" />
                    <span>Nodes Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400" style={{ fontFamily: "monospace" }}>
                    {playerProgress.totalNodesCompleted}
                  </div>
                </div>
                <div className="bg-black/40 rounded p-3 border border-yellow-500/30">
                  <div className="flex items-center gap-2 text-xs text-yellow-300/70 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span>Best Layer</span>
                  </div>
                  <div className="text-xl font-bold text-yellow-400" style={{ fontFamily: "monospace" }}>
                    L{playerProgress.bestLayerReached + 1}-{playerProgress.bestNodeInBestLayer + 1}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:gap-6 lg:justify-end lg:pb-8">
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
          <div className="h-80 sm:h-96 lg:hidden" />
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
        <div className="hidden lg:flex flex-col gap-6">
          <Card className="bg-card/90 backdrop-blur-md border-2 border-cyan-500/50 px-6 py-4 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Cipher Fragments</div>
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-yellow-400" />
                <div className="text-3xl font-bold text-yellow-400">{playerProgress.cipherFragments}</div>
              </div>
            </div>
          </Card>
          <Card className="bg-card/90 backdrop-blur-md border-2 border-magenta-500/50 p-6 shadow-[0_0_15px_rgba(255,0,255,0.2)] hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] transition-all">
            <h2 className="text-xl font-bold text-magenta-400 mb-4" style={{ fontFamily: "monospace" }}>
              OPERATIONS
            </h2>
            <div className="flex flex-col gap-3">
              {playerProgress.totalRuns > 0 && (
                <div className="flex flex-col gap-3 pb-3 border-b border-magenta-500/30">
                  <Button
                    onClick={onOpenShop}
                    size="lg"
                    className="relative justify-start bg-gradient-to-r from-yellow-600/20 to-yellow-700/10 border-2 border-yellow-500/60 hover:bg-yellow-500/30 hover:border-yellow-400 active:scale-95 h-16 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                  >
                    <ShoppingCart className="w-6 h-6 mr-3 text-yellow-400" />
                    <span className="text-lg font-bold">Protocol Vault</span>
                    <NotificationBadge count={shopBadgeCount} />
                  </Button>
                  <Button
                    onClick={onOpenContracts}
                    size="lg"
                    className="relative justify-start bg-gradient-to-r from-green-600/20 to-green-700/10 border-2 border-green-500/60 hover:bg-green-500/30 hover:border-green-400 active:scale-95 h-16 shadow-[0_0_15px_rgba(0,255,0,0.2)]"
                  >
                    <FileText className="w-6 h-6 mr-3 text-green-400" />
                    <span className="text-lg font-bold">Network Contracts</span>
                    <NotificationBadge count={contractsBadgeCount} />
                  </Button>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onOpenCodex}
                  variant="ghost"
                  size="default"
                  className="justify-start border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 active:scale-95 h-10 opacity-80"
                >
                  <BookOpen className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>Data Archive</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {isBreaching && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-cyan-400 rounded-full animate-spin" />
            <div
              className="absolute inset-8 border-4 border-transparent border-b-green-400 border-l-green-400 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            />
            <div
              className="absolute inset-16 border-4 border-transparent border-t-magenta-400 border-r-magenta-400 rounded-full animate-spin"
              style={{ animationDuration: "1.5s" }}
            />
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
            <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-cyan-400 animate-pulse" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-green-400 animate-pulse" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-green-400 animate-pulse" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-magenta-400 animate-pulse" />
          </div>
        </div>
      )}
      <div className="crt-effect absolute inset-0 pointer-events-none" />
      {isInHub && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/98 to-transparent backdrop-blur-md border-t border-cyan-500/30 z-40 lg:hidden">
          <div className="grid grid-cols-4 gap-1 p-2 max-w-2xl mx-auto">
            <Button
              onClick={onOpenClassManager}
              variant="ghost"
              className="flex-col h-16 gap-1 hover:bg-cyan-500/20 active:scale-95"
            >
              <User className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-bold">CLASS</span>
            </Button>
            {playerProgress.totalRuns > 0 && (
              <>
                <Button
                  onClick={onOpenShop}
                  variant="ghost"
                  className="relative flex-col h-16 gap-1 hover:bg-yellow-500/20 active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5 text-yellow-400" />
                  <span className="text-[10px] text-yellow-400 font-bold">VAULT</span>
                  <NotificationBadge count={shopBadgeCount} />
                </Button>
                <Button
                  onClick={onOpenContracts}
                  variant="ghost"
                  className="relative flex-col h-16 gap-1 hover:bg-green-500/20 active:scale-95"
                >
                  <FileText className="w-5 h-5 text-green-400" />
                  <span className="text-[10px] text-green-400 font-bold">CONTRACTS</span>
                  <NotificationBadge count={contractsBadgeCount} />
                </Button>
              </>
            )}
            <Button
              onClick={onOpenCodex}
              variant="ghost"
              className="flex-col h-16 gap-1 hover:bg-cyan-500/20 active:scale-95 opacity-70"
            >
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-bold">ARCHIVE</span>
            </Button>
          </div>
        </div>
      )}
      <div className="fixed bottom-20 left-0 right-0 z-30 lg:hidden pointer-events-none">
        <div className="p-3 space-y-2">
          {playerProgress.totalRuns > 0 && (
            <Card className="bg-gradient-to-br from-green-950/60 to-black/80 backdrop-blur-md border-2 border-green-500/60 p-2.5 shadow-[0_0_20px_rgba(0,255,0,0.4)] pointer-events-auto">
              <h2 className="text-xs font-bold text-green-400 mb-2 px-1" style={{ fontFamily: "monospace" }}>
                CAREER STATS
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-black/40 rounded p-1.5 border border-cyan-500/30">
                  <div className="flex items-center justify-center gap-0.5 text-[9px] text-cyan-300/70 mb-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    <span>RUNS</span>
                  </div>
                  <div className="text-lg font-bold text-cyan-400 text-center" style={{ fontFamily: "monospace" }}>
                    {playerProgress.totalRuns}
                  </div>
                </div>
                <div className="bg-black/40 rounded p-1.5 border border-green-500/30">
                  <div className="flex items-center justify-center gap-0.5 text-[9px] text-green-300/70 mb-0.5">
                    <Target className="w-2.5 h-2.5" />
                    <span>NODES</span>
                  </div>
                  <div className="text-lg font-bold text-green-400 text-center" style={{ fontFamily: "monospace" }}>
                    {playerProgress.totalNodesCompleted}
                  </div>
                </div>
                <div className="bg-black/40 rounded p-1.5 border border-yellow-500/30">
                  <div className="flex items-center justify-center gap-0.5 text-[9px] text-yellow-300/70 mb-0.5">
                    <Trophy className="w-2.5 h-2.5" />
                    <span>BEST</span>
                  </div>
                  <div className="text-sm font-bold text-yellow-400 text-center" style={{ fontFamily: "monospace" }}>
                    L{playerProgress.bestLayerReached + 1}-{playerProgress.bestNodeInBestLayer + 1}
                  </div>
                </div>
              </div>
            </Card>
          )}
          {selectedCharacter && (
            <div className="text-center mb-1 pointer-events-auto">
              <div className="text-xs text-cyan-400/60 mb-0.5" style={{ fontFamily: "monospace" }}>
                ACTIVE FIGHTER
              </div>
              <div
                className="text-lg font-bold tracking-wider"
                style={{ color: selectedCharacter.color, fontFamily: "monospace" }}
              >
                {selectedCharacter.name.toUpperCase()}
              </div>
            </div>
          )}
          <Button
            onClick={handleBreach}
            disabled={!selectedCharacter}
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black border-2 border-green-300 shadow-[0_0_25px_rgba(0,255,0,0.6)] hover:shadow-[0_0_35px_rgba(0,255,0,0.9)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all pointer-events-auto"
            style={{ fontFamily: "monospace" }}
          >
            <Play className="w-6 h-6 mr-2" />
            INITIATE BREACH
          </Button>
        </div>
      </div>
    </div>
  )
}
