"use client"

import type React from "react"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Zap, Target, Atom } from "lucide-react"
import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import { DamageType } from "@/types/game"
import type { Trigger, Action } from "@/types/game"

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
    narrative:
      "Conventional ballistic weapons. Effective at penetrating physical armor but dispersed by energy shields.",
  },
  {
    type: DamageType.ENERGY,
    name: "Energy",
    color: "#22d3ee",
    description: "Plasma beams and directed energy weaponry",
    effect: "+100% damage vs shields, -50% damage vs armor. Best shield-breaker in the arsenal.",
    statusEffect:
      "EMP - Drains 8% of current shields instantly and disables shield regeneration for 5s (stacks up to 5x)",
    narrative:
      "Superheated plasma bursts designed for shield disruption. Each EMP proc cripples energy barriers and prevents recovery, leaving targets vulnerable. Ineffective against physical plating.",
  },
  {
    type: DamageType.THERMAL,
    name: "Thermal",
    color: "#f97316",
    description: "Incendiary and heat-based attacks",
    effect: "Applies burn stacks that deal 2 damage per 0.5s directly to HP, bypassing all defenses.",
    statusEffect:
      "Burn - Each stack inflicts persistent heat damage to core systems every 0.5s for 4 seconds (stacks up to 5x independently)",
    narrative:
      "Ignition-based weaponry that bypasses external defenses entirely. Multiple burn stacks create devastating damage-over-time, cooking core processing systems from the inside.",
  },
  {
    type: DamageType.VIRAL,
    name: "Viral",
    color: "#a855f7",
    description: "Malware injection and system corruption",
    effect:
      "Amplifies ALL damage to HP. Scales progressively: 1 stack = +20%, 2 = +35%, 3 = +50%, 4 = +75%, 5 = +100%.",
    statusEffect:
      "Viral Infection - Corrupts structural integrity, making target take massively increased HP damage. Each stack lasts 10s independently (max 5 stacks)",
    narrative:
      "Corrupted data payloads that compromise system integrity at the fundamental level. A fully infected target takes double damage from all sources, making Viral essential for high-HP enemies.",
  },
  {
    type: DamageType.CORROSIVE,
    name: "Corrosive",
    color: "#84cc16",
    description: "Armor degradation protocols",
    effect: "Each proc permanently strips 10% of current armor (minimum 1 point). Stacks until armor reaches 0.",
    statusEffect:
      "Degrade - Permanently dismantles armor plating. Each application strips more until defenses are completely eliminated (no stack limit)",
    narrative:
      "Nanite-based disassembly agents that systematically dissolve physical plating. Against heavily armored targets, Corrosive is essential—strip their defenses to expose vulnerable systems beneath.",
  },
  {
    type: DamageType.EXPLOSIVE,
    name: "Explosive",
    color: "#ef4444",
    description: "High-energy detonations",
    effect: "Balanced damage vs all defense layers.",
    statusEffect: "Stagger - Briefly disrupts enemy positioning and timing",
    narrative: "Omnidirectional kinetic force. Effective against all system types through sheer destructive power.",
  },
  {
    type: DamageType.GLACIAL,
    name: "Glacial",
    color: "#06b6d4",
    description: "Cryogenic system slowdown",
    effect: "Moderate damage. Slows enemy movement and attack speed.",
    statusEffect: "Slow - Reduces enemy movement speed and increases cooldowns by freezing processing cycles",
    narrative: "Sub-zero coolant injection. Slows computational processes and restricts mechanical movement.",
  },
]

// 3D Visualization components for different trigger/action types
function TriggerVisualization({ trigger }: { trigger: Trigger }) {
  // Categorize triggers by type for different visualizations
  const isDistance =
    trigger.id.includes("enemy") &&
    (trigger.id.includes("range") || trigger.id.includes("close") || trigger.id.includes("far"))
  const isHP = trigger.id.includes("hp")
  const isPosition =
    trigger.id.includes("row") ||
    trigger.id.includes("front") ||
    trigger.id.includes("back") ||
    trigger.id.includes("top") ||
    trigger.id.includes("middle") ||
    trigger.id.includes("bottom")
  const isDamage = trigger.id.includes("damage")
  const isAlways = trigger.id === "always"

  return (
    <group>
      {/* Distance triggers - radar rings */}
      {isDistance && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.6, 32]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
          </mesh>
        </>
      )}

      {/* HP triggers - health bar */}
      {isHP && (
        <group>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.5, 0.3, 0.1]} />
            <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[1.5, 0.3, 0.1]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Position triggers - grid */}
      {isPosition && (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
        </group>
      )}

      {/* Damage trigger - impact effect */}
      {isDamage && (
        <group>
          <mesh>
            <octahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={1} />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.8, 0]} />
            <meshBasicMaterial color="#ff3333" transparent opacity={0.3} wireframe />
          </mesh>
        </group>
      )}

      {/* Always trigger - infinity symbol */}
      {isAlways && (
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[-0.3, 0, 0]}>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  )
}

function ActionVisualization({ action }: { action: Action }) {
  // Categorize actions by type for different visualizations
  const isShoot =
    action.id.includes("shot") ||
    action.id.includes("shoot") ||
    action.id.includes("fire") ||
    action.id.includes("cannon") ||
    action.id.includes("vulcan")
  const isMove = action.id.includes("move") || action.id.includes("dodge") || action.id.includes("teleport")
  const isHeal = action.id.includes("heal") || action.id.includes("regen")
  const isMelee = action.id.includes("slash") || action.id.includes("sword")
  const isBomb = action.id.includes("bomb")
  const isDefensive =
    action.id.includes("barrier") ||
    action.id.includes("counter") ||
    action.id.includes("shield") ||
    action.id.includes("invincibility")
  const isBuff = action.id.includes("speed") || action.id.includes("berserk")

  return (
    <group>
      {/* Shooting actions - projectile */}
      {isShoot && (
        <group>
          <mesh position={[0.5, 0, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Movement actions - arrow */}
      {isMove && (
        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0.3, 0, 0]}>
            <coneGeometry args={[0.3, 0.5, 3]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.2]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* Healing actions - cross */}
      {isHeal && (
        <group>
          <mesh>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1} />
          </mesh>
        </group>
      )}

      {/* Melee actions - sword */}
      {isMelee && (
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.15, 1, 0.05]} />
            <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.25, 0.3, 0.1]} />
            <meshStandardMaterial color="#8800ff" />
          </mesh>
        </group>
      )}

      {/* Bomb actions - sphere with fuse */}
      {isBomb && (
        <group>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1} />
          </mesh>
        </group>
      )}

      {/* Defensive actions - shield */}
      {isDefensive && (
        <group>
          <mesh>
            <cylinderGeometry args={[0.6, 0.4, 0.1, 6]} />
            <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={0.8} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.5, 0.08, 8, 6]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
          </mesh>
        </group>
      )}

      {/* Buff actions - star */}
      {isBuff && (
        <group>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} rotation={[0, 0, (Math.PI * 2 * i) / 5]}>
              <coneGeometry args={[0.15, 0.6, 3]} />
              <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} />
            </mesh>
          ))}
        </group>
      )}

      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  )
}

function DamageTypeVisualization({ damageType }: { damageType: (typeof ELEMENTAL_DATA)[0] }) {
  return (
    <group>
      {/* Central core */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={damageType.color} emissive={damageType.color} emissiveIntensity={0.8} />
      </mesh>

      {/* Orbiting particles based on damage type */}
      {damageType.type === DamageType.KINETIC && (
        <>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color={damageType.color} />
          </mesh>
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color={damageType.color} />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.ENERGY && (
        <>
          <mesh position={[0, 0.8, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color={damageType.color} emissive={damageType.color} emissiveIntensity={1} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.6, 0.05, 16, 32]} />
            <meshBasicMaterial color={damageType.color} transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.THERMAL && (
        <>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.5 + i * 0.2, 0]}>
              <sphereGeometry args={[0.15 - i * 0.03, 16, 16]} />
              <meshStandardMaterial
                color={damageType.color}
                emissive={damageType.color}
                emissiveIntensity={1 - i * 0.2}
                transparent
                opacity={0.8 - i * 0.2}
              />
            </mesh>
          ))}
        </>
      )}

      {damageType.type === DamageType.CORROSIVE && (
        <>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.5, 0.08, 8, 8]} />
            <meshStandardMaterial color={damageType.color} emissive={damageType.color} emissiveIntensity={0.6} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.6, 0.06, 8, 8]} />
            <meshStandardMaterial color={damageType.color} emissive={damageType.color} emissiveIntensity={0.4} />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.EXPLOSIVE && (
        <>
          <mesh>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshBasicMaterial color={damageType.color} transparent opacity={0.3} wireframe />
          </mesh>
          <mesh>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color={damageType.color} emissive={damageType.color} emissiveIntensity={0.6} />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.GLACIAL && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh key={i} rotation={[0, (Math.PI * 2 * i) / 8, Math.PI / 4]} position={[0.55, 0, 0]}>
              <coneGeometry args={[0.08, 0.25, 6]} />
              <meshStandardMaterial color={damageType.color} emissive={damageType.color} emissiveIntensity={0.5} />
            </mesh>
          ))}
        </>
      )}

      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  )
}

function RotatingVisualization({ children }: { children: React.ReactNode }) {
  return <group rotation={[0, Date.now() * 0.001, 0]}>{children}</group>
}

export function Codex({ isOpen, onClose }: CodexProps) {
  const [activeTab, setActiveTab] = useState<"triggers" | "actions" | "damage-types">("triggers")
  const [selectedItem, setSelectedItem] = useState<Trigger | Action | (typeof ELEMENTAL_DATA)[0] | null>(null)

  if (!isOpen) return null

  const items =
    activeTab === "triggers" ? AVAILABLE_TRIGGERS : activeTab === "actions" ? AVAILABLE_ACTIONS : ELEMENTAL_DATA

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-2 sm:p-4">
      <Card className="w-full h-full sm:w-[90vw] sm:h-[85vh] max-w-6xl bg-card/95 border-2 border-primary shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">Protocol Database</h2>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Breacher combat systems reference
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 sm:p-4 border-b border-border">
          <Button
            variant={activeTab === "triggers" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("triggers")
              setSelectedItem(null)
            }}
            className="flex-1 h-10 sm:h-12 text-xs sm:text-base active:scale-95"
          >
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Conditionals
          </Button>
          <Button
            variant={activeTab === "actions" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("actions")
              setSelectedItem(null)
            }}
            className="flex-1 h-10 sm:h-12 text-xs sm:text-base active:scale-95"
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Executions
          </Button>
          <Button
            variant={activeTab === "damage-types" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("damage-types")
              setSelectedItem(null)
            }}
            className="flex-1 h-10 sm:h-12 text-xs sm:text-base active:scale-95"
          >
            <Atom className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Damage Vectors
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* List */}
          <ScrollArea className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-border max-h-[40vh] sm:max-h-none">
            <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2">
              {items.map((item) => {
                const isDamageType = "color" in item
                const key = isDamageType ? (item as (typeof ELEMENTAL_DATA)[0]).type : (item as Trigger | Action).id

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-all active:scale-95 ${
                      selectedItem === item
                        ? "bg-primary/20 border-primary"
                        : "bg-card/50 border-border hover:bg-card hover:border-primary/50"
                    }`}
                  >
                    {isDamageType ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: (item as (typeof ELEMENTAL_DATA)[0]).color }}
                          />
                          <div className="font-semibold text-foreground text-sm sm:text-base">
                            {(item as (typeof ELEMENTAL_DATA)[0]).name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
                          {(item as (typeof ELEMENTAL_DATA)[0]).description}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-foreground text-sm sm:text-base">
                          {(item as Trigger | Action).name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
                          {(item as Trigger | Action).description}
                        </div>
                        {"cooldown" in item && (
                          <div className="text-xs text-secondary mt-0.5 sm:mt-1">
                            Cooldown: {(item as Action).cooldown}ms
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>

          {/* Detail View */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedItem ? (
              <>
                {/* 3D Visualization */}
                <div className="h-40 sm:h-64 bg-background/50 border-b border-border">
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

                {/* Details */}
                <ScrollArea className="flex-1 p-3 sm:p-6">
                  {activeTab === "damage-types" ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: (selectedItem as (typeof ELEMENTAL_DATA)[0]).color }}
                          />
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                            {(selectedItem as (typeof ELEMENTAL_DATA)[0]).name} Damage
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {(selectedItem as (typeof ELEMENTAL_DATA)[0]).description}
                        </p>
                      </div>

                      <div className="p-3 sm:p-4 rounded-lg bg-card border border-border space-y-2">
                        <div className="text-xs sm:text-sm font-semibold text-foreground mb-1">Tactical Analysis</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {(selectedItem as (typeof ELEMENTAL_DATA)[0]).effect}
                        </div>
                      </div>

                      <div
                        className="p-3 sm:p-4 rounded-lg border"
                        style={{
                          backgroundColor: `${(selectedItem as (typeof ELEMENTAL_DATA)[0]).color}15`,
                          borderColor: `${(selectedItem as (typeof ELEMENTAL_DATA)[0]).color}50`,
                        }}
                      >
                        <div className="text-xs sm:text-sm font-semibold mb-2">
                          <span style={{ color: (selectedItem as (typeof ELEMENTAL_DATA)[0]).color }}>
                            Status Effect
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-foreground">
                          {(selectedItem as (typeof ELEMENTAL_DATA)[0]).statusEffect}
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/30">
                        <div className="text-xs sm:text-sm font-semibold text-primary mb-2">System Notes</div>
                        <div className="text-xs sm:text-sm text-foreground leading-relaxed">
                          {(selectedItem as (typeof ELEMENTAL_DATA)[0]).narrative}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                          {(selectedItem as Trigger | Action).name}
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {(selectedItem as Trigger | Action).description}
                        </p>
                      </div>

                      {"cooldown" in selectedItem && (
                        <div className="p-3 sm:p-4 rounded-lg bg-secondary/20 border border-secondary">
                          <div className="text-xs sm:text-sm font-semibold text-secondary mb-1">Cooldown</div>
                          <div className="text-xl sm:text-2xl font-bold text-foreground">
                            {(selectedItem as Action).cooldown}ms
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Time before protocol can execute again
                          </div>
                        </div>
                      )}

                      <div className="p-3 sm:p-4 rounded-lg bg-card border border-border">
                        <div className="text-xs sm:text-sm font-semibold text-foreground mb-2">Classification</div>
                        <div className="text-muted-foreground text-sm">
                          {activeTab === "triggers" ? "Conditional Logic" : "Execution Command"}
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/30">
                        <div className="text-xs sm:text-sm font-semibold text-primary mb-2">Tactical Notes</div>
                        <div className="text-xs sm:text-sm text-foreground">
                          {activeTab === "triggers"
                            ? "Conditionals determine WHEN an execution should fire. Chain multiple conditionals with different priorities to create adaptive combat behavior."
                            : "Execution commands define WHAT your breacher does in combat. Balance offensive, defensive, and mobility executions for optimal strategy."}
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                  {activeTab === "damage-types" ? (
                    <Atom className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                  ) : (
                    <Zap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                  )}
                  <p className="text-sm sm:text-base">
                    Select a{" "}
                    {activeTab === "triggers" ? "conditional" : activeTab === "actions" ? "execution" : "damage vector"}{" "}
                    to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
