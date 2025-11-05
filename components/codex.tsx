"use client"

import type React from "react"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Zap, Target } from "lucide-react"
import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import type { Trigger, Action } from "@/types/game"

interface CodexProps {
  isOpen: boolean
  onClose: () => void
}

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

function RotatingVisualization({ children }: { children: React.ReactNode }) {
  return <group rotation={[0, Date.now() * 0.001, 0]}>{children}</group>
}

export function Codex({ isOpen, onClose }: CodexProps) {
  const [activeTab, setActiveTab] = useState<"triggers" | "actions">("triggers")
  const [selectedItem, setSelectedItem] = useState<Trigger | Action | null>(null)

  if (!isOpen) return null

  const items = activeTab === "triggers" ? AVAILABLE_TRIGGERS : AVAILABLE_ACTIONS

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
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">Battle Protocol Codex</h2>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Complete reference of all triggers and actions
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
            Triggers ({AVAILABLE_TRIGGERS.length})
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
            Actions ({AVAILABLE_ACTIONS.length})
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* List */}
          <ScrollArea className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-border max-h-[40vh] sm:max-h-none">
            <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-all active:scale-95 ${
                    selectedItem?.id === item.id
                      ? "bg-primary/20 border-primary"
                      : "bg-card/50 border-border hover:bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-foreground text-sm sm:text-base">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{item.description}</div>
                  {"cooldown" in item && (
                    <div className="text-xs text-secondary mt-0.5 sm:mt-1">Cooldown: {item.cooldown}ms</div>
                  )}
                </button>
              ))}
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
                      ) : (
                        <ActionVisualization action={selectedItem as Action} />
                      )}
                    </RotatingVisualization>
                    <OrbitControls enableZoom={false} enablePan={false} />
                  </Canvas>
                </div>

                {/* Details */}
                <ScrollArea className="flex-1 p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                        {selectedItem.name}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base">{selectedItem.description}</p>
                    </div>

                    {"cooldown" in selectedItem && (
                      <div className="p-3 sm:p-4 rounded-lg bg-secondary/20 border border-secondary">
                        <div className="text-xs sm:text-sm font-semibold text-secondary mb-1">Cooldown</div>
                        <div className="text-xl sm:text-2xl font-bold text-foreground">{selectedItem.cooldown}ms</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Time before this action can be used again
                        </div>
                      </div>
                    )}

                    <div className="p-3 sm:p-4 rounded-lg bg-card border border-border">
                      <div className="text-xs sm:text-sm font-semibold text-foreground mb-2">Type</div>
                      <div className="text-muted-foreground text-sm">
                        {activeTab === "triggers" ? "Condition Trigger" : "Battle Action"}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="text-xs sm:text-sm font-semibold text-primary mb-2">Usage Tip</div>
                      <div className="text-xs sm:text-sm text-foreground">
                        {activeTab === "triggers"
                          ? "Triggers determine WHEN an action should execute. Combine multiple triggers with different priorities to create complex AI behavior."
                          : "Actions define WHAT your fighter does. Balance offensive, defensive, and movement actions for optimal strategy."}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                  <Zap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">
                    Select a {activeTab === "triggers" ? "trigger" : "action"} to view details
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
