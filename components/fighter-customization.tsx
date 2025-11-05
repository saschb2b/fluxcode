"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { CustomizableFighter } from "@/components/customizable-fighter"
import {
  HEAD_SHAPES,
  BODY_SHAPES,
  ARM_SHAPES,
  ACCESSORY_SHAPES,
  COLOR_PRESETS,
  DEFAULT_CUSTOMIZATION,
  type FighterCustomization as FighterCustomizationType,
} from "@/lib/fighter-parts"

interface FighterCustomizationProps {
  onConfirm: (customization: FighterCustomizationType) => void
  onBack: () => void
}

export function FighterCustomization({ onConfirm, onBack }: FighterCustomizationProps) {
  const [customization, setCustomization] = useState<FighterCustomizationType>(DEFAULT_CUSTOMIZATION)
  const [activeTab, setActiveTab] = useState<"head" | "body" | "arms" | "accessory" | "colors">("head")

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-background opacity-20" />
      <div className="scanline" />

      <div className="relative z-10 h-full flex flex-col p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-cyan-400 mb-2 glitch-text">CUSTOMIZE FIGHTER</h1>
          <p className="text-sm md:text-base text-muted-foreground">Build your unique battle unit</p>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 min-h-0">
          {/* 3D Preview */}
          <div className="bg-card/50 backdrop-blur border-2 border-cyan-500/30 rounded-lg p-4 relative overflow-hidden">
            <div className="absolute inset-0">
              <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
                <CustomizableFighter
                  position={{ x: 3, y: 1 }}
                  isPlayer={true}
                  hp={100}
                  maxHp={100}
                  customization={customization}
                />
                <OrbitControls enableZoom={false} enablePan={false} />
                <gridHelper args={[10, 10, "#00ffff", "#ff00ff"]} position={[0, 0, 0]} />
              </Canvas>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="bg-card/50 backdrop-blur border-2 border-magenta-500/30 rounded-lg p-4 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {(["head", "body", "arms", "accessory", "colors"] as const).map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? "default" : "outline"}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  {tab.toUpperCase()}
                </Button>
              ))}
            </div>

            {/* Options */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {activeTab === "head" &&
                HEAD_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() => setCustomization({ ...customization, head: shape })}
                    variant={customization.head.id === shape.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    {shape.name}
                  </Button>
                ))}

              {activeTab === "body" &&
                BODY_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() => setCustomization({ ...customization, body: shape })}
                    variant={customization.body.id === shape.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    {shape.name}
                  </Button>
                ))}

              {activeTab === "arms" &&
                ARM_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        leftArm: shape,
                        rightArm: shape,
                      })
                    }
                    variant={customization.leftArm.id === shape.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    {shape.name}
                  </Button>
                ))}

              {activeTab === "accessory" &&
                ACCESSORY_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() => setCustomization({ ...customization, accessory: shape })}
                    variant={customization.accessory?.id === shape.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    {shape.name}
                  </Button>
                ))}

              {activeTab === "colors" &&
                COLOR_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        primaryColor: preset.primary,
                        secondaryColor: preset.secondary,
                      })
                    }
                    variant={customization.primaryColor === preset.primary ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                  >
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }} />
                    </div>
                    {preset.name}
                  </Button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button onClick={onBack} variant="outline" className="flex-1 bg-transparent">
                BACK
              </Button>
              <Button onClick={() => onConfirm(customization)} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                CONFIRM
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
