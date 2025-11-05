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
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            SELECT FIGHTER
          </h1>
          <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </div>

        {/* Character Display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Previous Button */}
          <Button
            onClick={handlePrevious}
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"
          >
            <ChevronLeft className="h-8 w-8 text-cyan-400" />
          </Button>

          {/* Character Card */}
          <div
            className="relative w-[500px] h-[600px] rounded-lg border-2 transition-all duration-300"
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
            <div className="relative h-full flex flex-col p-8">
              {/* Name */}
              <div className="text-center mb-6">
                <h2
                  className="text-6xl font-bold mb-2 tracking-wider"
                  style={{
                    color: selectedCharacter.color,
                    textShadow: `0 0 20px ${selectedCharacter.color}80`,
                  }}
                >
                  {selectedCharacter.name}
                </h2>
                <p className="text-gray-400 text-lg">{selectedCharacter.description}</p>
              </div>

              {/* Playstyle */}
              <div className="mb-6 p-4 rounded bg-black/40 border border-gray-700">
                <p className="text-sm text-gray-500 mb-1">PLAYSTYLE</p>
                <p className="text-cyan-300">{selectedCharacter.playstyle}</p>
              </div>

              {/* Starting Protocols */}
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-3">STARTING PROTOCOLS</p>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2 pr-4">
                    {selectedCharacter.startingPairs
                      .sort((a, b) => b.priority - a.priority)
                      .map((pair, index) => (
                        <div
                          key={index}
                          className="p-3 rounded bg-black/60 border border-gray-700/50 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{
                                backgroundColor: `${selectedCharacter.color}20`,
                                color: selectedCharacter.color,
                              }}
                            >
                              {pair.priority}
                            </span>
                            <span className="text-cyan-400">IF</span>
                            <span className="text-white font-medium">{pair.trigger.name}</span>
                            <span className="text-pink-400">THEN</span>
                            <span className="text-white font-medium">{pair.action.name}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="p-2 rounded bg-black/40 border border-gray-700">
                  <p className="text-gray-500 text-xs">TRIGGERS</p>
                  <p className="text-white font-bold">{selectedCharacter.startingTriggers.length}</p>
                </div>
                <div className="p-2 rounded bg-black/40 border border-gray-700">
                  <p className="text-gray-500 text-xs">ACTIONS</p>
                  <p className="text-white font-bold">{selectedCharacter.startingActions.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"
          >
            <ChevronRight className="h-8 w-8 text-cyan-400" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg border-2 border-gray-600 hover:border-gray-400 bg-black/40 hover:bg-black/60"
          >
            BACK
          </Button>
          <Button
            onClick={() => onSelect(selectedCharacter)}
            size="lg"
            className="px-12 py-6 text-xl font-bold border-2 transition-all"
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
        <div className="flex justify-center gap-2 mt-8">
          {CHARACTER_PRESETS.map((char, index) => (
            <button
              key={char.id}
              onClick={() => setSelectedIndex(index)}
              className="w-3 h-3 rounded-full border-2 transition-all"
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
