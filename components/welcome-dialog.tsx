"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, User, Target, Shield } from "lucide-react"

interface WelcomeDialogProps {
  onOpenClassManager: () => void
}

export function WelcomeDialog({ onOpenClassManager }: WelcomeDialogProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-black/95 via-cyan-950/30 to-black/95 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(0,255,255,0.4)] overflow-hidden">
        {/* Animated corner brackets */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-cyan-400 animate-pulse" />
        <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-green-400 animate-pulse" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-green-400 animate-pulse" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-magenta-400 animate-pulse" />

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-magenta-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-wider"
              style={{ fontFamily: "monospace" }}
            >
              &gt; BREACH PROTOCOL
            </h1>
            <div className="text-green-400 text-sm" style={{ fontFamily: "monospace" }}>
              NEURAL LINK ESTABLISHED
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-4 text-cyan-100/90">
            <p className="text-center text-lg leading-relaxed">
              Welcome, Breacher. The network awaits infiltration. But first, you must{" "}
              <span className="text-cyan-400 font-bold">initialize your combat protocols</span>.
            </p>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-cyan-400 mb-1">SELECT YOUR FIGHTER CLASS</div>
                  <div className="text-sm text-cyan-100/70">
                    Choose from specialized combat classes, each with unique starting protocols and tactical advantages.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-yellow-400 mb-1">CONFIGURE BATTLE PROTOCOLS</div>
                  <div className="text-sm text-cyan-100/70">
                    Customize your AI behavior with IF-THEN protocols. Test in the Simulacrum before deployment.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-green-400 mb-1">BREACH THE NETWORK</div>
                  <div className="text-sm text-cyan-100/70">
                    Fight through hostile nodes, earn Cipher Fragments, and unlock permanent upgrades.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-magenta-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-magenta-400 mb-1">ADAPT AND EVOLVE</div>
                  <div className="text-sm text-cyan-100/70">
                    Gain rewards between battles, adjust your strategy, and push deeper into the breach.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="space-y-3">
            <div className="text-center text-sm text-cyan-400/70" style={{ fontFamily: "monospace" }}>
              &gt; SYSTEM READY. AWAITING CLASS INITIALIZATION...
            </div>
            <Button
              onClick={onOpenClassManager}
              size="lg"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black border-2 border-cyan-300 shadow-[0_0_25px_rgba(0,255,255,0.5)] hover:shadow-[0_0_35px_rgba(0,255,255,0.8)] active:scale-[0.98] transition-all"
              style={{ fontFamily: "monospace" }}
            >
              <User className="w-6 h-6 mr-3" />
              INITIALIZE FIGHTER CLASS
            </Button>
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-cyan-400/50 pt-2 border-t border-cyan-500/20">
            TIP: You can customize and test your protocols in the Simulacrum before starting a breach
          </div>
        </div>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scan" />
        </div>
      </Card>
    </div>
  )
}
