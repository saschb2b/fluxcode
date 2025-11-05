"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Info, X } from "lucide-react"

interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)

  // Random glitch effect on title
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 100)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 z-[300] bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#0a0015] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-magenta-500 to-transparent animate-pulse" />
        <div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
        `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6">
        {/* Game Title */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="relative inline-block">
            <h1
              className={`text-5xl sm:text-7xl md:text-9xl font-black tracking-wider mb-2 sm:mb-4 transition-all duration-100 ${
                glitchActive ? "text-magenta-500 translate-x-1" : "text-cyan-400"
              }`}
              style={{
                textShadow: glitchActive
                  ? "2px 2px 0 #ff00ff, -2px -2px 0 #00ffff"
                  : "4px 4px 0 rgba(0, 255, 255, 0.3), -2px -2px 0 rgba(255, 0, 255, 0.3)",
                fontFamily: "monospace",
              }}
            >
              BATTLE
            </h1>
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-5xl font-bold text-magenta-400 tracking-widest"
            style={{ fontFamily: "monospace" }}
          >
            PROTOCOL
          </h2>
          <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-cyan-300/60 tracking-[0.3em] uppercase">
            Program • Fight • Evolve
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md px-4 sm:px-0">
          <Button
            size="lg"
            onClick={onStart}
            className="relative group h-14 sm:h-16 text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.8)] transition-all duration-300 active:scale-95"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            START GAME
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowHowToPlay(true)}
            className="h-12 sm:h-14 text-base sm:text-lg font-bold bg-transparent border-2 border-magenta-500 text-magenta-400 hover:bg-magenta-500/20 hover:text-magenta-300 shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] transition-all duration-300 active:scale-95"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            HOW TO PLAY
          </Button>
        </div>

        {/* Version/Credits */}
        <div className="absolute bottom-4 sm:bottom-8 text-center text-cyan-300/40 text-xs sm:text-sm tracking-wider px-4">
          <div>v1.0.0 • ALPHA BUILD</div>
          <div className="mt-1 text-[10px] sm:text-xs">Inspired by Megaman Battle Network</div>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <Card className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto bg-[#0a0015] border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.5)] p-4 sm:p-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <h2
              className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4 sm:mb-6 tracking-wider pr-8"
              style={{ fontFamily: "monospace" }}
            >
              HOW TO PLAY
            </h2>

            <div className="space-y-4 sm:space-y-6 text-cyan-100 text-sm sm:text-base">
              <section>
                <h3 className="text-xl font-bold text-magenta-400 mb-2">OBJECTIVE</h3>
                <p className="text-cyan-200/80">
                  Program your fighter with IF-THEN rules (Battle Protocols) to defeat waves of enemies. Each victory
                  unlocks new triggers and actions to build more powerful strategies.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-magenta-400 mb-2">BATTLE PROTOCOLS</h3>
                <p className="text-cyan-200/80 mb-2">
                  Click <span className="text-cyan-400 font-bold">PROGRAM</span> to create IF-THEN rules:
                </p>
                <ul className="list-disc list-inside space-y-1 text-cyan-200/80 ml-4">
                  <li>
                    <span className="text-cyan-400">IF</span> (Trigger) - Condition to check (e.g., "Same Row as Enemy")
                  </li>
                  <li>
                    <span className="text-magenta-400">THEN</span> (Action) - What to do (e.g., "Shoot")
                  </li>
                  <li>Higher priority protocols execute first</li>
                  <li>Use ↑↓ arrows to reorder priorities</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-magenta-400 mb-2">COMBAT</h3>
                <p className="text-cyan-200/80 mb-2">Fighters execute on a 6×3 grid (3×3 per side):</p>
                <ul className="list-disc list-inside space-y-1 text-cyan-200/80 ml-4">
                  <li>Blue side = Your fighter</li>
                  <li>Red side = Enemy fighter</li>
                  <li>Fighters can't cross to enemy territory</li>
                  <li>Battle ends when one fighter reaches 0 HP</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-magenta-400 mb-2">PROGRESSION</h3>
                <p className="text-cyan-200/80">
                  Win battles to unlock new triggers and actions. Lose and you restart from scratch. Build the ultimate
                  AI to survive as long as possible!
                </p>
              </section>
            </div>

            <Button
              onClick={() => setShowHowToPlay(false)}
              className="w-full mt-4 sm:mt-6 h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
            >
              GOT IT
            </Button>
          </Card>
        </div>
      )}

      {/* CRT Scanlines */}
      <div className="crt-effect absolute inset-0 pointer-events-none" />
    </div>
  )
}
