"use client"

import { useState } from "react"
import { CHARACTER_PRESETS, type CharacterPreset } from "@/lib/character-presets"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CharacterSelectionProps {
  onSelect: (character: CharacterPreset) => void
  onBack: () => void
}

export function CharacterSelection({ onSelect, onBack }: CharacterSelectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedCharacter = CHARACTER_PRESETS[selectedIndex]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? CHARACTER_PRESETS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === CHARACTER_PRESETS.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-[#0a0015] overflow-hidden">
      {/* CRT Effect */}
      <div className="crt-effect absolute inset-0 pointer-events-none" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-background" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8">
        {/* Title */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            SELECT FIGHTER
          </h1>
          <div className="h-1 w-48 sm:w-64 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </div>

        {/* Character Display */}
        <div className="flex items-center justify-center gap-2 sm:gap-8 mb-6 sm:mb-8">
          {/* Previous Button */}
          <Button
            onClick={handlePrevious}
            variant="ghost"
            size="icon"
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all active:scale-90"
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
          </Button>

          {/* Character Card */}
          <div
            className="relative w-full max-w-[500px] h-[500px] sm:h-[600px] rounded-lg border-2 transition-all duration-300"
            style={{
              borderColor: selectedCharacter.color,
              boxShadow: `0 0 30px ${selectedCharacter.color}40`,
            }}
          >
            {/* Character Visual */}
            <div
              className="absolute inset-0 rounded-lg opacity-10"
              style={{
                background: `radial-gradient(circle at center, ${selectedCharacter.color}40 0%, transparent 70%)`,
              }}
            />

            {/* Character Info */}
            <div className="relative h-full flex flex-col p-4 sm:p-8">
              {/* Name */}
              <div className="text-center mb-4 sm:mb-6">
                <h2
                  className="text-4xl sm:text-6xl font-bold mb-2 tracking-wider"
                  style={{
                    color: selectedCharacter.color,
                    textShadow: `0 0 20px ${selectedCharacter.color}80`,
                  }}
                >
                  {selectedCharacter.name}
                </h2>
                <p className="text-gray-400 text-sm sm:text-lg">{selectedCharacter.description}</p>
              </div>

              {/* Playstyle */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded bg-black/40 border border-gray-700">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">PLAYSTYLE</p>
                <p className="text-cyan-300 text-sm sm:text-base">{selectedCharacter.playstyle}</p>
              </div>

              {/* Starting Protocols */}
              <div className="flex-1 min-h-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">STARTING PROTOCOLS</p>
                <ScrollArea className="h-[180px] sm:h-[280px]">
                  <div className="space-y-2 pr-2 sm:pr-4">
                    {selectedCharacter.startingPairs
                      .sort((a, b) => b.priority - a.priority)
                      .map((pair, index) => (
                        <div
                          key={index}
                          className="p-2 sm:p-3 rounded bg-black/60 border border-gray-700/50 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-wrap">
                            <span
                              className="px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold shrink-0"
                              style={{
                                backgroundColor: `${selectedCharacter.color}20`,
                                color: selectedCharacter.color,
                              }}
                            >
                              {pair.priority}
                            </span>
                            <span className="text-cyan-400 shrink-0">IF</span>
                            <span className="text-white font-medium">{pair.trigger.name}</span>
                            <span className="text-pink-400 shrink-0">THEN</span>
                            <span className="text-white font-medium">{pair.action.name}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Stats */}
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                <div className="p-2 rounded bg-black/40 border border-gray-700">
                  <p className="text-gray-500 text-xs">TRIGGERS</p>
                  <p className="text-white font-bold text-lg sm:text-xl">{selectedCharacter.startingTriggers.length}</p>
                </div>
                <div className="p-2 rounded bg-black/40 border border-gray-700">
                  <p className="text-gray-500 text-xs">ACTIONS</p>
                  <p className="text-white font-bold text-lg sm:text-xl">{selectedCharacter.startingActions.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all active:scale-90"
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 px-4 sm:px-0">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg border-2 border-gray-600 hover:border-gray-400 bg-black/40 hover:bg-black/60 active:scale-95"
          >
            BACK
          </Button>
          <Button
            onClick={() => onSelect(selectedCharacter)}
            size="lg"
            className="px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-bold border-2 transition-all active:scale-95"
            style={{
              borderColor: selectedCharacter.color,
              backgroundColor: `${selectedCharacter.color}20`,
              color: selectedCharacter.color,
              boxShadow: `0 0 20px ${selectedCharacter.color}40`,
            }}
          >
            SELECT FIGHTER
          </Button>
        </div>

        {/* Character Indicators */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
          {CHARACTER_PRESETS.map((char, index) => (
            <button
              key={char.id}
              onClick={() => setSelectedIndex(index)}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all active:scale-90"
              style={{
                borderColor: index === selectedIndex ? char.color : "#444",
                backgroundColor: index === selectedIndex ? char.color : "transparent",
                boxShadow: index === selectedIndex ? `0 0 10px ${char.color}` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
