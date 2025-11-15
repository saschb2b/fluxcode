"use client"

import type React from "react"
import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { X, Terminal, Shield, Lock, ArrowLeft } from 'lucide-react'
import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import { DamageType } from "@/types/game"
import type { Trigger, Action } from "@/types/game"
import { ElementalProjectileVisual } from "@/components/elemental-projectile-visual"
import { EnemyCodex } from "@/components/enemy-codex"

interface CodexProps {
  isOpen: boolean
  onClose: () => void
}

const ELEMENTAL_DATA = [
  {
    type: DamageType.KINETIC,
    name: "Kinetic",
    color: "#94a3b8",
    description: "Ballistic projectiles and physical impact",
    effect: "Standard damage type. Strong vs armor plating, weak vs energy shields.",
    statusEffect: "None",
    narrative: "Conventional ballistic weapons. Effective at penetrating physical armor but dispersed by energy shields.",
    threat: "STANDARD",
  },
  {
    type: DamageType.ENERGY,
    name: "Energy",
    color: "#22d3ee",
    description: "Plasma beams and directed energy weaponry",
    effect: "+100% damage vs shields, -50% damage vs armor. Best shield-breaker in the arsenal.",
    statusEffect: "EMP - Drains 8% of current shields instantly and disables shield regeneration for 5s (stacks up to 5x)",
    narrative: "Superheated plasma bursts designed for shield disruption. Each EMP proc cripples energy barriers and prevents recovery, leaving targets vulnerable. Ineffective against physical plating.",
    threat: "HIGH",
  },
  {
    type: DamageType.THERMAL,
    name: "Thermal",
    color: "#f97316",
    description: "Incendiary and heat-based attacks",
    effect: "Applies burn stacks that deal 2 damage per 0.5s directly to HP, bypassing all defenses.",
    statusEffect: "Burn - Each stack inflicts persistent heat damage to core systems every 0.5s for 4 seconds (stacks up to 5x independently)",
    narrative: "Ignition-based weaponry that bypasses external defenses entirely. Multiple burn stacks create devastating damage-over-time, cooking core processing systems from the inside.",
    threat: "CRITICAL",
  },
  {
    type: DamageType.VIRAL,
    name: "Viral",
    color: "#a855f7",
    description: "Malware injection and system corruption",
    effect: "Amplifies ALL damage to HP. Scales progressively: 1 stack = +20%, 2 = +35%, 3 = +50%, 4 = +75%, 5 = +100%.",
    statusEffect: "Viral Infection - Corrupts structural integrity, making target take massively increased HP damage. Each stack lasts 10s independently (max 5 stacks)",
    narrative: "Corrupted data payloads that compromise system integrity at the fundamental level. A fully infected target takes double damage from all sources, making Viral essential for high-HP enemies.",
    threat: "CRITICAL",
  },
  {
    type: DamageType.CORROSIVE,
    name: "Corrosive",
    color: "#84cc16",
    description: "Armor degradation protocols",
    effect: "Each proc permanently strips 10% of current armor (minimum 1 point). Stacks until armor reaches 0.",
    statusEffect: "Degrade - Permanently dismantles armor plating. Each application strips more until defenses are completely eliminated (no stack limit)",
    narrative: "Nanite-based disassembly agents that systematically dissolve physical plating. Against heavily armored targets, Corrosive is essential—strip their defenses to expose vulnerable systems beneath.",
    threat: "HIGH",
  },
  {
    type: DamageType.EXPLOSIVE,
    name: "Explosive",
    color: "#ef4444",
    description: "High-energy detonations",
    effect: "Balanced damage vs all defense layers.",
    statusEffect: "Stagger - Briefly disrupts enemy positioning and timing",
    narrative: "Omnidirectional kinetic force. Effective against all system types through sheer destructive power.",
    threat: "STANDARD",
  },
  {
    type: DamageType.CONCUSSION,
    name: "Concussion",
    color: "#ef4444",
    description: "Resonant pressure waves and concussive fields",
    effect: "Weak vs shields (-10%), moderate vs armor (100%), strong vs exposed HP (+25%). Creates battlefield control through forceful spatial manipulation.",
    statusEffect: "Displace - Immediately pushes enemy backward 1 tile (2 tiles with 2+ stacks). Corrupts next Move action, forcing random movement or failure. Lasts 5.5s (max 3 stacks)",
    narrative: "Deployment of resonant pressure waves designed to overwhelm enemy physical stability and disrupt their positional strategy. Specializes in breaking formations and denying tactical movement through sheer concussive force.",
    threat: "HIGH",
  },
  {
    type: DamageType.GLACIAL,
    name: "Cryo-Flux",
    color: "#06b6d4",
    description: "Quantum-cooled time manipulation",
    effect: "-10% damage vs shields, moderate (100%) vs armor/HP. Impedes enemy processing cycles and creates tactical windows.",
    statusEffect: "Lag - Each stack increases enemy cooldowns by +15%, reduces movement by -10%, and adds 5% chance of action failure. Creates frame-drop stuttering (stacks up to 5x, 6s duration)",
    narrative: "Controlled injections of quantum-cooled Cryo-Flux agents. Doesn't directly disable protocols but critically destabilizes an enemy's internal clock cycles and processing environment.",
    threat: "HIGH",
  },
]

function TriggerVisualization({ trigger }: { trigger: Trigger }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
      </mesh>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  )
}

function ActionVisualization({ action }: { action: Action }) {
  if (action.damageType) {
    return <ElementalProjectileVisual damageType={action.damageType} scale={1.2} />
  }

  return (
    <group>
      <mesh>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  )
}

function DamageTypeVisualization({ damageType }: { damageType: (typeof ELEMENTAL_DATA)[0] }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={damageType.color} emissive={damageType.color} emissiveIntensity={0.8} />
      </mesh>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  )
}

function RotatingVisualization({ children }: { children: React.ReactNode }) {
  return <group rotation={[0, Date.now() * 0.001, 0]}>{children}</group>
}

export function Codex({ isOpen, onClose }: CodexProps) {
  const [activeTab, setActiveTab] = useState<"triggers" | "actions" | "damage-types" | "enemies">("triggers")
  const [selectedItem, setSelectedItem] = useState<Trigger | Action | (typeof ELEMENTAL_DATA)[0] | null>(null)
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  if (!isOpen) return null

  const items =
    activeTab === "triggers"
      ? [...AVAILABLE_TRIGGERS].sort((a, b) => a.name.localeCompare(b.name))
      : activeTab === "actions"
        ? [...AVAILABLE_ACTIONS].sort((a, b) => a.name.localeCompare(b.name))
        : activeTab === "damage-types"
          ? [...ELEMENTAL_DATA].sort((a, b) => a.name.localeCompare(b.name))
          : []

  const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false })

  const getClearanceColor = () => {
    switch (activeTab) {
      case "triggers":
        return "text-secondary"
      case "actions":
        return "text-accent"
      case "damage-types":
        return "text-primary"
      case "enemies":
        return "text-destructive"
      default:
        return "text-foreground"
    }
  }

  const getElementalData = (damageType: DamageType) => {
    return ELEMENTAL_DATA.find((el) => el.type === damageType)
  }

  const getCoreTypeInfo = (action: Action) => {
    if (action.coreType === "movement") {
      return { label: "MOVEMENT CORE", color: "#a855f7", bgColor: "#a855f710", borderColor: "#a855f730" }
    } else {
      return { label: "TACTICAL CORE", color: "#f97316", bgColor: "#f9731610", borderColor: "#f9731630" }
    }
  }

  const handleItemSelect = (item: typeof selectedItem) => {
    setSelectedItem(item)
    setShowMobileDetail(true)
  }

  const handleMobileBack = () => {
    setShowMobileDetail(false)
    setSelectedItem(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-2 sm:p-4">
      {activeTab === "enemies" ? (
        <EnemyCodex isOpen={true} onClose={() => setActiveTab("triggers")} />
      ) : (
        <div className="w-full h-full sm:w-[90vw] sm:h-[85vh] max-w-6xl bg-card/95 border-2 border-primary shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-primary/50 bg-background/80">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              {showMobileDetail && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMobileBack}
                  className="md:hidden hover:bg-primary/20 h-8 w-8 border border-border flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-primary/20 flex items-center justify-center border border-primary/50 flex-shrink-0">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h2 className="text-sm sm:text-xl font-bold text-primary tracking-wider">BREACH TERMINAL</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1 text-[9px] sm:text-xs text-muted-foreground font-mono">
                  <span>ACCESS: GRANTED</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">TIME: {currentTime}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/20 h-8 w-8 sm:h-10 sm:w-10 border border-border flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className={`flex gap-1 sm:gap-2 p-2 sm:p-3 border-b border-border/50 bg-background/50 ${showMobileDetail ? "hidden md:flex" : "flex"} overflow-x-auto`}>
            <Button
              variant={activeTab === "triggers" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("triggers")
                setSelectedItem(null)
                setShowMobileDetail(false)
              }}
              className={`flex-1 h-10 sm:h-11 text-[10px] sm:text-sm font-mono border-2 ${
                activeTab === "triggers"
                  ? "border-secondary bg-secondary/20 text-secondary hover:bg-secondary/30"
                  : "border-border/50 hover:border-secondary/50"
              }`}
            >
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">IF</span> CONDITIONALS
            </Button>
            <Button
              variant={activeTab === "actions" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("actions")
                setSelectedItem(null)
                setShowMobileDetail(false)
              }}
              className={`flex-1 h-10 sm:h-11 text-[10px] sm:text-sm font-mono border-2 ${
                activeTab === "actions"
                  ? "border-accent bg-accent/20 text-accent hover:bg-accent/30"
                  : "border-border/50 hover:border-accent/50"
              }`}
            >
              <Terminal className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">THEN</span> EXECUTIONS
            </Button>
            <Button
              variant={activeTab === "damage-types" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("damage-types")
                setSelectedItem(null)
                setShowMobileDetail(false)
              }}
              className={`flex-1 h-10 sm:h-11 text-[10px] sm:text-sm font-mono border-2 ${
                activeTab === "damage-types"
                  ? "border-primary bg-primary/20 text-primary hover:bg-primary/30"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">DMG</span> VECTORS
            </Button>
            <Button
              variant={activeTab === "enemies" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("enemies")
                setSelectedItem(null)
                setShowMobileDetail(false)
              }}
              className={`flex-1 h-10 sm:h-11 text-[10px] sm:text-sm font-mono border-2 ${
                activeTab === "enemies"
                  ? "border-destructive bg-destructive/20 text-destructive hover:bg-destructive/30"
                  : "border-border/50 hover:border-destructive/50"
              }`}
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              ENEMIES
            </Button>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            <div className={`w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-border/50 bg-background/30 ${showMobileDetail ? "hidden md:block" : "block"} overflow-y-auto`}>
              {items.map((item) => {
                const isDamageType = "color" in item
                const key = isDamageType ? (item as (typeof ELEMENTAL_DATA)[0]).type : (item as Trigger | Action).id

                return (
                  <button
                    key={key}
                    onClick={() => handleItemSelect(item)}
                    className={`w-full text-left p-2 sm:p-3 rounded border-2 transition-all font-mono ${
                      selectedItem === item
                        ? `${getClearanceColor()} bg-current/10 border-current`
                        : "border-border/30 hover:border-current/50 text-foreground/90 hover:bg-card/50"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm tracking-wide uppercase">
                      {isDamageType ? (item as (typeof ELEMENTAL_DATA)[0]).name : (item as Trigger | Action).name}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {isDamageType ? (item as (typeof ELEMENTAL_DATA)[0]).description : (item as Trigger | Action).description}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className={`flex-1 flex flex-col min-h-0 bg-background/20 ${!showMobileDetail ? "hidden md:flex" : "flex"}`}>
              {selectedItem ? (
                <>
                  <div className="h-[200px] sm:h-[280px] flex-shrink-0 bg-background/80 border-b border-border/50 relative overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                      <RotatingVisualization>
                        {activeTab === "triggers" ? (
                          <TriggerVisualization trigger={selectedItem as Trigger} />
                        ) : activeTab === "actions" ? (
                          <ActionVisualization action={selectedItem as Action} />
                        ) : (
                          <DamageTypeVisualization damageType={selectedItem as (typeof ELEMENTAL_DATA)[0]} />
                        )}
                      </RotatingVisualization>
                      <OrbitControls enableZoom={false} enablePan={false} />
                    </Canvas>
                  </div>

                  <div className="flex-1 overflow-auto p-4">
                    <h3 className="text-xl font-bold mb-2">
                      {activeTab === "triggers" || activeTab === "actions"
                        ? (selectedItem as Trigger | Action).name
                        : (selectedItem as (typeof ELEMENTAL_DATA)[0]).name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "triggers" || activeTab === "actions"
                        ? (selectedItem as Trigger | Action).description
                        : (selectedItem as (typeof ELEMENTAL_DATA)[0]).description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">Select an item to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
