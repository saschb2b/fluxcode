"use client"

import { useEffect, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, RotateCcw, TrendingUp, Zap, Target, Clock, Move } from "lucide-react"
import { BattleGrid } from "./battle-grid"
import { CustomizableFighter } from "./customizable-fighter"
import { Projectiles } from "./projectiles"
import { FloatingGeometry, CircuitLayer, DataStreams, StarField, AmbientParticles } from "./cyberpunk-background"
import { BattleEngine, type BattleState } from "@/lib/battle-engine"
import { buildTriggerActionPairs } from "@/lib/protocol-builder"
import type { CustomFighterClass } from "@/lib/meta-progression"
import type { FighterCustomization } from "@/lib/fighter-parts"
import type { GameState } from "@/types/game"
import { HEAD_SHAPES, BODY_SHAPES, ARM_SHAPES, CHASSIS_TYPES } from "@/lib/fighter-parts"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const TRAINING_DUMMY_CUSTOMIZATION: FighterCustomization = {
  head: HEAD_SHAPES.find((h) => h.id === "cylinder-head") || HEAD_SHAPES[0],
  body: BODY_SHAPES.find((b) => b.id === "cylinder-body") || BODY_SHAPES[0],
  leftArm: ARM_SHAPES.find((a) => a.id === "cylinder-arm") || ARM_SHAPES[0],
  rightArm: ARM_SHAPES.find((a) => a.id === "cylinder-arm") || ARM_SHAPES[0],
  chassis: CHASSIS_TYPES.find((c) => c.id === "standard") || CHASSIS_TYPES[0],
  primaryColor: "#fbbf24", // Yellow - like a target
  secondaryColor: "#dc2626", // Red - like bullseye rings
}

interface ClassTestSimulatorProps {
  classData: CustomFighterClass
  customization: FighterCustomization
  onClose: () => void
}

export function ClassTestSimulator({ classData, customization, onClose }: ClassTestSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [enableMovement, setEnableMovement] = useState(false)
  const [enableShield, setEnableShield] = useState(false)
  const [enableArmor, setEnableArmor] = useState(false)
  const [armorStrips, setArmorStrips] = useState(0)
  const [burnStacks, setBurnStacks] = useState(0)
  const [viralStacks, setViralStacks] = useState(0)
  const [empStacks, setEmpStacks] = useState(0)

  const battleEngineRef = useRef<BattleEngine | null>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(Date.now())
  const startTimeRef = useRef<number>(Date.now())
  const damageTrackingRef = useRef({ total: 0, hits: 0, executions: 0 })
  const recentDamageRef = useRef<Array<{ timestamp: number; damage: number }>>([])
  const peakDpsRef = useRef<number>(0)

  const startTest = () => {
    damageTrackingRef.current = { total: 0, hits: 0, executions: 0 }
    recentDamageRef.current = []
    peakDpsRef.current = 0
    startTimeRef.current = Date.now()
    lastTimeRef.current = Date.now()
    setArmorStrips(0)
    setBurnStacks(0)
    setViralStacks(0)
    setEmpStacks(0)

    const playerPairs = buildTriggerActionPairs(classData.startingPairs)

    const enemyPairs = enableMovement
      ? buildTriggerActionPairs([
          {
            triggerId: "always",
            actionId: "dodge",
            priority: 5,
          },
          {
            triggerId: "timer-3s",
            actionId: "teleport",
            priority: 4,
          },
        ])
      : []

    const shieldAmount = enableShield ? 200 : 0
    const armorAmount = enableArmor ? 150 : 0

    const initialState: BattleState = {
      playerPos: { x: 1, y: 1 },
      playerHP: 100,
      enemyPos: { x: 4, y: 1 },
      enemyHP: 999999,
      enemyShields: shieldAmount,
      enemyArmor: armorAmount,
      projectiles: [],
      justTookDamage: false,
    }

    battleEngineRef.current = new BattleEngine(initialState, playerPairs, enemyPairs, customization, undefined)

    setGameState({
      player: { position: { x: 1, y: 1 }, hp: 100, maxHp: 100 },
      enemy: {
        position: { x: 4, y: 1 },
        hp: 999999,
        maxHp: 999999,
        shields: shieldAmount,
        maxShields: shieldAmount,
        armor: armorAmount,
        maxArmor: armorAmount,
      },
      projectiles: [],
    })

    setIsRunning(true)
  }

  const stopTest = () => {
    setIsRunning(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const resetTest = () => {
    stopTest()
    damageTrackingRef.current = { total: 0, hits: 0, executions: 0 }
    recentDamageRef.current = []
    peakDpsRef.current = 0
    setArmorStrips(0)
    setBurnStacks(0)
    setViralStacks(0)
    setEmpStacks(0)
    setMetrics({
      totalDamage: 0,
      dps: 0,
      peakDps: 0,
      hits: 0,
      protocolExecutions: 0,
      testDuration: 0,
    })
    setGameState({
      player: { position: { x: 1, y: 1 }, hp: 100, maxHp: 100 },
      enemy: {
        position: { x: 4, y: 1 },
        hp: 999999,
        maxHp: 999999,
        shields: enableShield ? 200 : 0,
        maxShields: enableShield ? 200 : 0,
        armor: enableArmor ? 150 : 0,
        maxArmor: enableArmor ? 150 : 0,
      },
      projectiles: [],
    })
  }

  useEffect(() => {
    if (!isRunning || !battleEngineRef.current) return

    let previousArmor = enableArmor ? 150 : 0
    const damageTrackingStartTime = Date.now()

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = now - lastTimeRef.current
      lastTimeRef.current = now

      const update = battleEngineRef.current!.tick(deltaTime)

      if (update.damageDealt && update.damageDealt.amount > 0) {
        console.log("[v0] Damage dealt:", update.damageDealt)
        damageTrackingRef.current.total += update.damageDealt.amount
        damageTrackingRef.current.hits += 1
        recentDamageRef.current.push({
          timestamp: now,
          damage: update.damageDealt.amount,
        })
      }

      if (update.pairExecuted) {
        damageTrackingRef.current.executions += 1
      }

      const newState = battleEngineRef.current!.getState()

      if (newState.enemyArmor < previousArmor) {
        setArmorStrips((prev) => prev + 1)
        previousArmor = newState.enemyArmor
      }

      if (update.burnStacks !== undefined) {
        setBurnStacks(update.burnStacks)
      }

      if (update.viralStacks !== undefined) {
        setViralStacks(update.viralStacks)
      }

      if (update.empStacks !== undefined) {
        setEmpStacks(update.empStacks)
      }

      setGameState({
        player: {
          position: newState.playerPos,
          hp: newState.playerHP,
          maxHp: 100,
        },
        enemy: {
          position: newState.enemyPos,
          hp: newState.enemyHP,
          maxHp: 999999,
          shields: newState.enemyShields,
          maxShields: enableShield ? 200 : 0,
          armor: newState.enemyArmor,
          maxArmor: enableArmor ? 150 : 0,
        },
        projectiles: newState.projectiles,
      })

      const twoSecondsAgo = now - 2000
      recentDamageRef.current = recentDamageRef.current.filter((d) => d.timestamp > twoSecondsAgo)

      const elapsedSinceStart = (now - damageTrackingStartTime) / 1000
      const recentTotalDamage = recentDamageRef.current.reduce((sum, d) => sum + d.damage, 0)

      const minTimespanForDps = 2.0
      const currentDps =
        elapsedSinceStart >= minTimespanForDps && recentTotalDamage > 0
          ? recentTotalDamage / Math.min(elapsedSinceStart, 2.0)
          : 0

      if (currentDps > peakDpsRef.current && elapsedSinceStart >= minTimespanForDps) {
        peakDpsRef.current = currentDps
      }

      const elapsedSeconds = (now - startTimeRef.current) / 1000

      setMetrics({
        totalDamage: damageTrackingRef.current.total,
        dps: currentDps,
        peakDps: peakDpsRef.current,
        hits: damageTrackingRef.current.hits,
        protocolExecutions: damageTrackingRef.current.executions,
        testDuration: Math.round(elapsedSeconds * 10) / 10,
      })

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, enableShield, enableArmor])

  const [metrics, setMetrics] = useState({
    totalDamage: 0,
    dps: 0,
    peakDps: 0,
    hits: 0,
    protocolExecutions: 0,
    testDuration: 0,
  })
  const [gameState, setGameState] = useState<GameState>({
    player: { position: { x: 1, y: 1 }, hp: 100, maxHp: 100 },
    enemy: { position: { x: 4, y: 1 }, hp: 999999, maxHp: 999999 },
    projectiles: [],
  })

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/50 bg-black/80 backdrop-blur-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-cyan-400 font-mono">SIMULACRUM</h2>
          <p className="text-xs text-cyan-300/70 hidden md:block">Test against invincible dummy</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-red-500/20 hover:border-red-500 border border-transparent"
        >
          <X className="w-5 h-5 text-red-400" />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 p-3 bg-black/50 border-b border-cyan-500/30">
        <Card className="bg-gradient-to-br from-cyan-950/50 to-black/50 border border-cyan-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
            <h3 className="text-xs text-cyan-300/70 font-mono">CURRENT DPS</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-cyan-400 font-mono">{metrics.dps.toFixed(2)}</p>
          <p className="text-[10px] text-cyan-300/50">2s window</p>
        </Card>

        <Card className="bg-gradient-to-br from-pink-950/50 to-black/50 border-2 border-pink-500/70 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
            <h3 className="text-xs text-pink-300/70 font-mono">PEAK DPS</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-pink-400 font-mono">{metrics.peakDps.toFixed(2)}</p>
          <p className="text-[10px] text-pink-300/50">max burst</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-950/50 to-black/50 border border-green-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
            <h3 className="text-xs text-green-300/70 font-mono">TOTAL DMG</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-green-400 font-mono">{metrics.totalDamage.toFixed(2)}</p>
          <p className="text-[10px] text-green-300/50">{metrics.hits} hits</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950/50 to-black/50 border border-purple-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            <h3 className="text-xs text-purple-300/70 font-mono">PROTOCOLS</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-purple-400 font-mono">{metrics.protocolExecutions}</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-950/50 to-black/50 border border-yellow-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
            <h3 className="text-xs text-yellow-300/70 font-mono">TIME</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-yellow-400 font-mono">{metrics.testDuration}s</p>
        </Card>
      </div>

      <div className="flex-1 relative min-h-0">
        <Canvas shadows className="crt-effect">
          <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.5}
            target={[0, 0, 0]}
          />

          <color attach="background" args={["#0a0015"]} />
          <fog attach="fog" args={["#0a0015", 20, 60]} />

          <StarField />
          <FloatingGeometry />
          <CircuitLayer />
          <DataStreams />
          <AmbientParticles />

          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00ffff" />
          <pointLight position={[5, 5, 5]} intensity={0.5} color="#ff00ff" />

          <BattleGrid />

          <CustomizableFighter
            position={gameState.player.position}
            isPlayer={true}
            hp={gameState.player.hp}
            maxHp={gameState.player.maxHp}
            customization={customization}
          />

          <CustomizableFighter
            position={gameState.enemy.position}
            isPlayer={false}
            hp={gameState.enemy.hp}
            maxHp={gameState.enemy.maxHp}
            customization={TRAINING_DUMMY_CUSTOMIZATION}
            shields={isRunning ? gameState.enemy.shields : enableShield ? 200 : 0}
            maxShields={enableShield ? 200 : 0}
            armor={isRunning ? gameState.enemy.armor : enableArmor ? 150 : 0}
            maxArmor={enableArmor ? 150 : 0}
          />

          <Projectiles projectiles={gameState.projectiles} />
        </Canvas>

        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/80 border border-yellow-500/50 px-2 py-1 md:px-4 md:py-2 rounded">
          <p className="text-yellow-400 text-xs md:text-sm font-mono">⚠ DUMMY - INVINCIBLE</p>
          {enableMovement && (
            <p className="text-cyan-400 text-xs font-mono mt-1 flex items-center gap-1">
              <Move className="w-3 h-3" />
              Moving
            </p>
          )}
          {enableShield && (
            <p className="text-blue-400 text-xs font-mono mt-1 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-blue-400/20" />
              Shield Active
            </p>
          )}
          {enableArmor && (
            <p className="text-orange-400 text-xs font-mono mt-1 flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-orange-400 bg-orange-400/20" />
              Armor Active
            </p>
          )}
          {enableArmor && armorStrips > 0 && (
            <p className="text-green-400 text-xs font-mono mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {armorStrips}x Corrosive Strips
            </p>
          )}
          {burnStacks > 0 && (
            <p className="text-orange-400 text-xs font-mono mt-1 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              {burnStacks}x Burn (DoT)
            </p>
          )}
          {viralStacks > 0 && (
            <p className="text-green-400 text-xs font-mono mt-1 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              {viralStacks}x Viral Infection (+
              {(1.0 +
                (viralStacks === 1
                  ? 0.2
                  : viralStacks === 2
                    ? 0.35
                    : viralStacks === 3
                      ? 0.5
                      : viralStacks === 4
                        ? 0.75
                        : 1.0) -
                1.0) *
                100}
              % DMG)
            </p>
          )}
          {empStacks > 0 && (
            <p className="text-blue-400 text-xs font-mono mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
              {empStacks}x EMP (Shield Disabled)
            </p>
          )}
        </div>

        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black/80 border border-cyan-500/50 px-2 py-1 md:px-3 md:py-2 rounded">
          <p className="text-xs text-cyan-300/50 font-mono">CLASS</p>
          <p className="text-sm md:text-base font-bold text-cyan-400 font-mono">{classData.name}</p>
          <p className="text-xs text-cyan-300/50">{classData.startingPairs.length} protocols</p>
        </div>
      </div>

      <div className="p-3 md:p-4 bg-gradient-to-t from-black to-gray-900 border-t border-cyan-500/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3 bg-black/50 border border-cyan-500/30 p-3 rounded">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-cyan-400" />
              <Label htmlFor="movement-toggle" className="text-sm text-cyan-300 font-mono cursor-pointer">
                Enable Movement
              </Label>
            </div>
            <Switch
              id="movement-toggle"
              checked={enableMovement}
              onCheckedChange={setEnableMovement}
              disabled={isRunning}
            />
          </div>

          <div className="flex items-center justify-between mb-3 bg-black/50 border border-blue-500/30 p-3 rounded">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 bg-blue-400/20" />
              <Label htmlFor="shield-toggle" className="text-sm text-blue-300 font-mono cursor-pointer">
                Enable Shield (200)
              </Label>
            </div>
            <Switch id="shield-toggle" checked={enableShield} onCheckedChange={setEnableShield} disabled={isRunning} />
          </div>

          <div className="flex items-center justify-between mb-3 bg-black/50 border border-orange-500/30 p-3 rounded">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-orange-400 bg-orange-400/20" />
              <Label htmlFor="armor-toggle" className="text-sm text-orange-300 font-mono cursor-pointer">
                Enable Armor (150)
              </Label>
            </div>
            <Switch id="armor-toggle" checked={enableArmor} onCheckedChange={setEnableArmor} disabled={isRunning} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {!isRunning ? (
              <Button
                onClick={startTest}
                className="bg-green-500 hover:bg-green-400 text-black font-bold h-12"
                size="lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Test
              </Button>
            ) : (
              <Button onClick={stopTest} className="bg-red-500 hover:bg-red-400 text-black font-bold h-12" size="lg">
                Stop Test
              </Button>
            )}
            <Button
              onClick={resetTest}
              variant="outline"
              className="border-cyan-500/50 hover:bg-cyan-500/20 bg-transparent h-12"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
