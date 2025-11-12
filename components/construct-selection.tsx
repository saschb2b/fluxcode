"use client"

import { useState } from "react"
import { AVAILABLE_CONSTRUCTS, isConstructUnlocked } from "@/lib/constructs"
import type { Construct } from "@/types/game"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Lock } from "lucide-react"

interface ConstructSelectionProps {
  onSelect: (construct: Construct, slotId: string) => void
  onBack: () => void
  currentSlotId?: string
}

export function ConstructSelection({ onSelect, onBack, currentSlotId = "slot-1" }: ConstructSelectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedConstruct = AVAILABLE_CONSTRUCTS[selectedIndex]
  const isUnlocked = isConstructUnlocked(selectedConstruct.id)

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? AVAILABLE_CONSTRUCTS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === AVAILABLE_CONSTRUCTS.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative w-full h-dvh flex items-center justify-center bg-[#0a0015] overflow-hidden">
      {/* CRT Effect */}
      <div className="crt-effect absolute inset-0 pointer-events-none" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-background" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-8 py-4 sm:py-0">
        {/* Title */}
        <div className="text-center mb-4 sm:mb-12">
          <h1 className="text-2xl sm:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            SELECT CONSTRUCT
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mb-2">
            ASSIGNING TO: <span className="text-cyan-400 font-bold">{currentSlotId.toUpperCase()}</span>
          </p>
          <div className="h-1 w-32 sm:w-64 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </div>

        {/* Construct Display */}
        <div className="flex items-center justify-center gap-2 sm:gap-8 mb-4 sm:mb-8">
          {/* Previous Button */}
          <Button
            onClick={handlePrevious}
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-16 sm:w-16 rounded-full border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all active:scale-90 shrink-0"
          >
            <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8 text-cyan-400" />
          </Button>

          {/* Construct Card */}
          <div
            className="relative w-full max-w-[500px] h-auto max-h-[55dvh] sm:max-h-[70dvh] rounded-lg border-2 transition-all duration-300"
            style={{
              borderColor: selectedConstruct.color,
              boxShadow: `0 0 30px ${selectedConstruct.color}40`,
            }}
          >
            {/* Locked Overlay */}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-lg font-bold">LOCKED</p>
                </div>
              </div>
            )}

            {/* Visual Effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-10"
              style={{
                background: `radial-gradient(circle at center, ${selectedConstruct.color}40 0%, transparent 70%)`,
              }}
            />

            {/* Construct Info */}
            <div className="relative h-full flex flex-col p-3 sm:p-8">
              {/* Name */}
              <div className="text-center mb-3 sm:mb-6">
                <h2
                  className="text-3xl sm:text-6xl font-bold mb-1 sm:mb-2 tracking-wider"
                  style={{
                    color: selectedConstruct.color,
                    textShadow: `0 0 20px ${selectedConstruct.color}80`,
                  }}
                >
                  {selectedConstruct.name}
                </h2>
                <p className="text-gray-400 text-xs sm:text-lg">{selectedConstruct.description}</p>
              </div>

              {/* Lore */}
              <div className="mb-3 sm:mb-6 p-2 sm:p-4 rounded bg-black/40 border border-gray-700">
                <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5 sm:mb-1">SPECIFICATION</p>
                <p className="text-cyan-300 text-xs sm:text-base">{selectedConstruct.lore}</p>
              </div>

              {/* Base Stats */}
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-sm text-gray-500 mb-2">BASE CONFIGURATION</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-red-700/50">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-400 text-xs font-medium">{selectedConstruct.baseHp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-blue-700/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-blue-400 text-xs font-medium">{selectedConstruct.baseShields}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-gray-600">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-gray-400 text-xs font-medium">{selectedConstruct.baseArmor}</span>
                  </div>
                  {selectedConstruct.resistances && Object.keys(selectedConstruct.resistances).length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-purple-700/50">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-purple-400 text-xs font-medium">
                        {Object.entries(selectedConstruct.resistances)
                          .map(([key, val]) => `${key.slice(0, 3).toUpperCase()}:${val}%`)
                          .join(" ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Protocol Slots */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-4 rounded bg-black/40 border border-cyan-700">
                <p className="text-[10px] sm:text-sm text-gray-500 mb-2">PROTOCOL CORE CAPACITY</p>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <p className="text-[10px] text-blue-400">MOVEMENT</p>
                    </div>
                    <p className="text-white font-bold text-2xl">{selectedConstruct.maxMovementSlots}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <p className="text-[10px] text-green-400">TACTICAL</p>
                    </div>
                    <p className="text-white font-bold text-2xl">{selectedConstruct.maxTacticalSlots}</p>
                  </div>
                </div>
              </div>

              {/* Warning */}
            </div>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-16 sm:w-16 rounded-full border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all active:scale-90 shrink-0"
          >
            <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8 text-cyan-400" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 px-4 sm:px-0 mb-3 sm:mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg border-2 border-gray-600 hover:border-gray-400 bg-black/40 hover:bg-black/60 active:scale-95"
          >
            BACK
          </Button>
          <Button
            onClick={() => isUnlocked && onSelect(selectedConstruct, currentSlotId)}
            disabled={!isUnlocked}
            size="lg"
            className="px-6 sm:px-12 py-4 sm:py-6 text-base sm:text-xl font-bold border-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: selectedConstruct.color,
              backgroundColor: `${selectedConstruct.color}20`,
              color: selectedConstruct.color,
              boxShadow: isUnlocked ? `0 0 20px ${selectedConstruct.color}40` : "none",
            }}
          >
            {isUnlocked ? "DEPLOY CONSTRUCT" : "LOCKED"}
          </Button>
        </div>

        {/* Construct Indicators */}
        <div className="flex justify-center gap-1.5 sm:gap-2 pb-2 sm:pb-0">
          {AVAILABLE_CONSTRUCTS.map((construct, index) => (
            <button
              key={construct.id}
              onClick={() => setSelectedIndex(index)}
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 transition-all active:scale-90"
              style={{
                borderColor: index === selectedIndex ? construct.color : "#444",
                backgroundColor: index === selectedIndex ? construct.color : "transparent",
                boxShadow: index === selectedIndex ? `0 0 10px ${construct.color}` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
