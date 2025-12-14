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
  WEAPON_SHAPES,
  CHASSIS_TYPES,
  COLOR_PRESETS,
  DEFAULT_CUSTOMIZATION,
  type FighterCustomization as FighterCustomizationType,
} from "@/lib/fighter-parts"
import { ChevronLeft, Cpu, Box, Zap, Shield, Palette, Crosshair } from "lucide-react"

interface FighterCustomizationProps {
  onConfirm: (customization: FighterCustomizationType) => void
  onBack: () => void
  currentCustomization?: FighterCustomizationType
}

export function FighterCustomization({ onConfirm, onBack, currentCustomization }: FighterCustomizationProps) {
  const [customization, setCustomization] = useState<FighterCustomizationType>(
    currentCustomization || DEFAULT_CUSTOMIZATION,
  )
  const [activeTab, setActiveTab] = useState<"head" | "body" | "arms" | "accessory" | "weapon" | "chassis" | "colors">(
    "head",
  )

  const tabs = [
    { id: "head" as const, label: "CORE", icon: Cpu },
    { id: "chassis" as const, label: "CHASSIS", icon: Shield },
    { id: "body" as const, label: "HULL", icon: Box },
    { id: "arms" as const, label: "MODULES", icon: Zap },
    { id: "weapon" as const, label: "WEAPON", icon: Crosshair },
    { id: "accessory" as const, label: "ARRAY", icon: Shield },
    { id: "colors" as const, label: "PAINT", icon: Palette },
  ]

  return (
    <div className="relative w-full h-dvh bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#0a0015] overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="scanline" />

      <div className="relative z-10 h-full flex flex-col p-3 sm:p-4 md:p-8">
        <div className="text-center mb-3 md:mb-6">
          <h1
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-cyan-400 mb-2 tracking-wider"
            style={{ fontFamily: "monospace" }}
          >
            LOADOUT CONFIGURATION
          </h1>
          <p
            className="text-xs sm:text-sm md:text-base text-cyan-300/60 tracking-wide"
            style={{ fontFamily: "monospace" }}
          >
            &gt; CUSTOMIZE YOUR COMBAT UNIT
          </p>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 min-h-0">
          <div className="bg-black/40 backdrop-blur border-2 border-cyan-500/50 rounded-lg p-3 md:p-4 relative overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.3)] flex items-center justify-center">
            <div className="absolute top-2 left-2 text-[10px] sm:text-xs text-cyan-400/70 font-mono">
              &gt; PREVIEW_RENDER
            </div>
            <div className="w-full h-full">
              <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
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

            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-400/50" />
            <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-green-400/50" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-magenta-400/50" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-yellow-400/50" />
          </div>

          <div className="bg-black/40 backdrop-blur border-2 border-magenta-500/50 rounded-lg p-3 md:p-4 flex flex-col overflow-hidden shadow-[0_0_20px_rgba(255,0,255,0.3)]">
            <div className="text-[10px] sm:text-xs text-magenta-400/70 font-mono mb-2 sm:mb-3">
              &gt; COMPONENT_SELECTOR
            </div>

            <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 scrollbar-thin">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    className={`text-[10px] sm:text-xs whitespace-nowrap px-2 sm:px-3 h-8 sm:h-9 flex items-center gap-1 sm:gap-2 transition-all ${
                      activeTab === tab.id
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                        : "bg-black/50 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
              {/* HEAD/CORE options */}
              {activeTab === "head" &&
                HEAD_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() => setCustomization({ ...customization, head: shape })}
                    variant={customization.head.id === shape.id ? "default" : "outline"}
                    className={`w-full justify-start text-xs sm:text-sm transition-all ${
                      customization.head.id === shape.id
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                        : "bg-black/30 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <Cpu className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {shape.name}
                  </Button>
                ))}

              {/* CHASSIS options */}
              {activeTab === "chassis" &&
                CHASSIS_TYPES.map((chassis) => (
                  <Button
                    key={chassis.id}
                    onClick={() => setCustomization({ ...customization, chassis })}
                    variant={customization.chassis?.id === chassis.id ? "default" : "outline"}
                    className={`w-full justify-start text-xs sm:text-sm transition-all ${
                      customization.chassis?.id === chassis.id
                        ? "bg-green-500 text-black border-green-400 shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                        : "bg-black/30 border-green-500/30 hover:border-green-500/60 hover:bg-green-500/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {chassis.name}
                  </Button>
                ))}

              {/* BODY/HULL options */}
              {activeTab === "body" &&
                BODY_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() => setCustomization({ ...customization, body: shape })}
                    variant={customization.body.id === shape.id ? "default" : "outline"}
                    className={`w-full justify-start text-xs sm:text-sm transition-all ${
                      customization.body.id === shape.id
                        ? "bg-magenta-500 text-black border-magenta-400 shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                        : "bg-black/30 border-magenta-500/30 hover:border-magenta-500/60 hover:bg-magenta-500/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {shape.name}
                  </Button>
                ))}

              {/* ARMS/MODULES options */}
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
                    className={`w-full justify-start text-xs sm:text-sm transition-all ${
                      customization.leftArm.id === shape.id
                        ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_10px_rgba(255,255,0,0.5)]"
                        : "bg-black/30 border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {shape.name}
                  </Button>
                ))}

              {/* WEAPON options */}
              {activeTab === "weapon" &&
                WEAPON_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() => setCustomization({ ...customization, weapon: shape })}
                    variant={customization.weapon?.id === shape.id ? "default" : "outline"}
                    className={`w-full justify-start text-xs sm:text-sm transition-all ${
                      customization.weapon?.id === shape.id
                        ? "bg-red-500 text-black border-red-400 shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                        : "bg-black/30 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <Crosshair className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {shape.name}
                  </Button>
                ))}

              {/* ACCESSORY/ARRAY options */}
              {activeTab === "accessory" &&
                ACCESSORY_SHAPES.map((shape) => (
                  <Button
                    key={shape.id}
                    onClick={() => setCustomization({ ...customization, accessory: shape })}
                    variant={customization.accessory?.id === shape.id ? "default" : "outline"}
                    className={`w-full justify-start text-xs sm:text-sm transition-all ${
                      customization.accessory?.id === shape.id
                        ? "bg-purple-500 text-black border-purple-400 shadow-[0_0_10px_rgba(128,0,255,0.5)]"
                        : "bg-black/30 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {shape.name}
                  </Button>
                ))}

              {/* COLOR/PAINT options */}
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
                    className={`w-full justify-start gap-2 sm:gap-3 text-xs sm:text-sm transition-all ${
                      customization.primaryColor === preset.primary
                        ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        : "bg-black/30 border-white/30 hover:border-white/60 hover:bg-white/10"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-white/30"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-white/30"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    {preset.name}
                  </Button>
                ))}
            </div>

            <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-cyan-500/30">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 bg-black/50 border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95 text-xs sm:text-sm h-10 sm:h-11"
                style={{ fontFamily: "monospace" }}
              >
                <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                CANCEL
              </Button>
              <Button
                onClick={() => onConfirm(customization)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-black border-2 border-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.8)] active:scale-95 text-xs sm:text-sm font-bold h-10 sm:h-11"
                style={{ fontFamily: "monospace" }}
              >
                INSTALL LOADOUT
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CRT Effect */}
      <div className="crt-effect absolute inset-0 pointer-events-none" />
    </div>
  )
}
