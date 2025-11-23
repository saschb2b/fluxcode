"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  RotateCcw,
  TrendingUp,
  Zap,
  Target,
  Clock,
  Move,
} from "lucide-react";
import { BattleGrid } from "../battle-grid";
import { CustomizableFighter } from "../customizable-fighter";
import { Projectiles } from "../projectiles";
import {
  FloatingGeometry,
  CircuitLayer,
  DataStreams,
  StarField,
  AmbientParticles,
} from "../cyberpunk-background";
import { buildTriggerActionPairs } from "@/lib/protocol-builder";
import type { CustomFighterClass } from "@/lib/meta-progression";
import type { FighterCustomization } from "@/lib/fighter-parts";
import type { BattleState, GameState } from "@/types/game";
import {
  HEAD_SHAPES,
  BODY_SHAPES,
  ARM_SHAPES,
  CHASSIS_TYPES,
} from "@/lib/fighter-parts";
import { BattleEngine } from "@/lib/battleEngine/BattleEngine";

const TRAINING_DUMMY_CUSTOMIZATION: FighterCustomization = {
  head: HEAD_SHAPES.find((h) => h.id === "cylinder-head") || HEAD_SHAPES[0],
  body: BODY_SHAPES.find((b) => b.id === "cylinder-body") || BODY_SHAPES[0],
  leftArm: ARM_SHAPES.find((a) => a.id === "cylinder-arm") || ARM_SHAPES[0],
  rightArm: ARM_SHAPES.find((a) => a.id === "cylinder-arm") || ARM_SHAPES[0],
  chassis: CHASSIS_TYPES.find((c) => c.id === "standard") || CHASSIS_TYPES[0],
  primaryColor: "#fbbf24", // Yellow - like a target
  secondaryColor: "#dc2626", // Red - like bullseye rings
};

interface SimulacrumProps {
  classData: CustomFighterClass;
  customization: FighterCustomization;
  onClose: () => void;
}

export function Simulacrum({
  classData,
  customization,
  onClose,
}: SimulacrumProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [enableMovement, setEnableMovement] = useState(false);
  const [enableShield, setEnableShield] = useState(false);
  const [enableArmor, setEnableArmor] = useState(false);
  const [enableAttacking, setEnableAttacking] = useState(false);
  const [immuneToStatus, setImmuneToStatus] = useState(false);
  const [armorStrips, setArmorStrips] = useState(0);
  const [totalArmorStripped, setTotalArmorStripped] = useState(0);
  const [burnStacks, setBurnStacks] = useState(0);
  const [viralStacks, setViralStacks] = useState(0);
  const [empStacks, setEmpStacks] = useState(0);
  const [lagStacks, setLagStacks] = useState(0);
  const [displaceStacks, setDisplaceStacks] = useState(0);
  const [corrosiveStacks, setCorrosiveStacks] = useState(0);

  const battleEngineRef = useRef<BattleEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const damageTrackingRef = useRef({ total: 0, hits: 0, executions: 0 });
  const recentDamageRef = useRef<Array<{ timestamp: number; damage: number }>>(
    [],
  );
  const peakDpsRef = useRef<number>(0);

  const [metrics, setMetrics] = useState({
    totalDamage: 0,
    dps: 0,
    peakDps: 0,
    hits: 0,
    protocolExecutions: 0,
    testDuration: 0,
  });
  const [gameState, setGameState] = useState<GameState>({
    player: {
      position: { x: 1, y: 1 },
      hp: classData.constructStats?.maxHp || 100,
      maxHp: classData.constructStats?.maxHp || 100,
      armor: classData.constructStats?.maxArmor || 0,
      maxArmor: classData.constructStats?.maxArmor || 0,
      shields: classData.constructStats?.maxShields || 0,
      maxShields: classData.constructStats?.maxShields || 0,
    },
    enemy: { position: { x: 4, y: 1 }, hp: 999999, maxHp: 999999 },
    projectiles: [],
  });

  const startTest = () => {
    damageTrackingRef.current = { total: 0, hits: 0, executions: 0 };
    recentDamageRef.current = [];
    peakDpsRef.current = 0;
    startTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
    setArmorStrips(0);
    setTotalArmorStripped(0);
    setBurnStacks(0);
    setViralStacks(0);
    setEmpStacks(0);
    setLagStacks(0);
    setDisplaceStacks(0);
    setCorrosiveStacks(0);

    const playerMovementPairs = buildTriggerActionPairs(
      classData.startingMovementPairs || [],
    );
    const playerTacticalPairs = buildTriggerActionPairs(
      classData.startingTacticalPairs || [],
    );

    const enemyMovementPairs = [];
    const enemyTacticalPairs = [];

    if (enableMovement) {
      enemyMovementPairs.push(
        ...buildTriggerActionPairs([
          // Constant repositioning - strafe every opportunity
          {
            triggerId: "always",
            actionId: "strafe-right",
            priority: 10,
          },
          // Align rows quickly with jump
          {
            triggerId: "different-row",
            actionId: "jump",
            priority: 9,
          },
          // Strafe opposite direction after cooldown
          {
            triggerId: "same-row",
            actionId: "strafe-left",
            priority: 8,
          },
          // Advance when far back
          {
            triggerId: "at-back",
            actionId: "dash-forward",
            priority: 7,
          },
          // Move forward when enemy is far
          {
            triggerId: "enemy-far",
            actionId: "move-forward",
            priority: 6,
          },
          // Retreat when too close
          {
            triggerId: "enemy-close",
            actionId: "move-backward",
            priority: 5,
          },
          // Emergency retreat at low HP
          {
            triggerId: "low-hp",
            actionId: "retreat-shot",
            priority: 4,
          },
          // Dodge as fallback
          {
            triggerId: "always",
            actionId: "dodge",
            priority: 3,
          },
          // Vertical movement variety
          {
            triggerId: "always",
            actionId: "move-up",
            priority: 2,
          },
          {
            triggerId: "always",
            actionId: "move-down",
            priority: 1,
          },
        ]),
      );
    }
    if (enableAttacking) {
      enemyTacticalPairs.push(
        ...buildTriggerActionPairs([
          {
            triggerId: "same-row",
            actionId: "shoot",
            priority: 1,
          },
        ]),
      );
    }

    console.log(
      "[v0] Simulacrum: Built enemy protocols - Movement:",
      enemyMovementPairs.length,
      "Tactical:",
      enemyTacticalPairs.length,
    );

    const shieldAmount = enableShield ? 200 : 0;
    const armorAmount = enableArmor ? 150 : 0;

    const initialState: BattleState = {
      playerPos: { x: 1, y: 1 },
      playerHP: classData.constructStats?.maxHp || 100,
      playerArmor: classData.constructStats?.maxArmor || 0,
      playerShields: classData.constructStats?.maxShields || 0,
      enemyPos: { x: 4, y: 1 },
      enemyHP: 999999,
      enemyShields: shieldAmount,
      enemyArmor: armorAmount,
      projectiles: [],
      justTookDamage: false,
      enemyImmuneToStatus: immuneToStatus,
      enemies: [
        {
          id: "enemy-0", // Added enemy ID
          position: { x: 4, y: 1 },
          hp: 999999,
          maxHp: 999999,
          shields: shieldAmount,
          maxShields: shieldAmount,
          armor: armorAmount,
          maxArmor: armorAmount,
          isPawn: false,
          burnStacks: [],
          viralStacks: [],
          empStacks: [],
          lagStacks: [],
          displaceStacks: [],
          corrosiveStacks: [],
          shieldRegenDisabled: false,
          triggerActionPairs: [...enemyMovementPairs, ...enemyTacticalPairs],
        },
      ],
      enemyBurnStacks: [],
      enemyViralStacks: [],
      enemyEMPStacks: [],
      enemyLagStacks: [],
      enemyDisplaceStacks: [],
      enemyCorrosiveStacks: [],
      shieldRegenDisabled: false,
    };

    battleEngineRef.current = new BattleEngine(
      initialState,
      playerMovementPairs,
      playerTacticalPairs,
      [[...enemyMovementPairs, ...enemyTacticalPairs]],
      customization,
      undefined,
    );

    setGameState({
      player: {
        position: { x: 1, y: 1 },
        hp: classData.constructStats?.maxHp || 100,
        maxHp: classData.constructStats?.maxHp || 100,
        armor: classData.constructStats?.maxArmor || 0,
        maxArmor: classData.constructStats?.maxArmor || 0,
        shields: classData.constructStats?.maxShields || 0,
        maxShields: classData.constructStats?.maxShields || 0,
      },
      enemy: {
        position: { x: 4, y: 1 },
        hp: 999999,
        maxHp: 999999,
        shields: shieldAmount,
        maxShields: enableShield ? 200 : 0,
        armor: armorAmount,
        maxArmor: enableArmor ? 150 : 0,
      },
      projectiles: [],
    });

    setIsRunning(true);
  };

  const stopTest = () => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const resetTest = () => {
    stopTest();
    damageTrackingRef.current = { total: 0, hits: 0, executions: 0 };
    recentDamageRef.current = [];
    peakDpsRef.current = 0;
    setArmorStrips(0);
    setTotalArmorStripped(0);
    setBurnStacks(0);
    setViralStacks(0);
    setEmpStacks(0);
    setLagStacks(0);
    setDisplaceStacks(0);
    setCorrosiveStacks(0);
    setMetrics({
      totalDamage: 0,
      dps: 0,
      peakDps: 0,
      hits: 0,
      protocolExecutions: 0,
      testDuration: 0,
    });
    setGameState({
      player: {
        position: { x: 1, y: 1 },
        hp: classData.constructStats?.maxHp || 100,
        maxHp: classData.constructStats?.maxHp || 100,
        armor: classData.constructStats?.maxArmor || 0,
        maxArmor: classData.constructStats?.maxArmor || 0,
        shields: classData.constructStats?.maxShields || 0,
        maxShields: classData.constructStats?.maxShields || 0,
      },
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
    });
  };

  useEffect(() => {
    if (!isRunning || !battleEngineRef.current) return;

    let previousArmor = enableArmor ? 150 : 0;
    const damageTrackingStartTime = Date.now();

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const update = battleEngineRef.current!.tick(deltaTime);

      if (update.damageDealt && update.damageDealt.amount > 0) {
        console.log("[v0] Damage dealt:", update.damageDealt);
        damageTrackingRef.current.total += update.damageDealt.amount;
        damageTrackingRef.current.hits += 1;
        recentDamageRef.current.push({
          timestamp: now,
          damage: update.damageDealt.amount,
        });
      }

      if (update.pairExecuted) {
        damageTrackingRef.current.executions += 1;
      }

      const newState = battleEngineRef.current!.getState();

      const enemy = newState.enemies && newState.enemies[0];

      if (enemy) {
        const currentArmor = enemy.armor;
        if (currentArmor < previousArmor) {
          const armorStrippedAmount = previousArmor - currentArmor;
          setTotalArmorStripped((prev) => prev + armorStrippedAmount);
          console.log(
            `[v0] Simulacrum: Armor stripped from ${previousArmor} to ${currentArmor} (-${armorStrippedAmount})`,
          );
          previousArmor = currentArmor;
        }
      }

      if (update.burnStacks !== undefined) {
        setBurnStacks(update.burnStacks);
      }

      if (update.viralStacks !== undefined) {
        setViralStacks(update.viralStacks);
      }

      if (update.empStacks !== undefined) {
        setEmpStacks(update.empStacks);
      }

      if (update.lagStacks !== undefined) {
        setLagStacks(update.lagStacks);
      }

      if (update.displaceStacks !== undefined) {
        setDisplaceStacks(update.displaceStacks);
      }

      if (update.corrosiveStacks !== undefined) {
        setCorrosiveStacks(update.corrosiveStacks);
      }

      setGameState({
        player: {
          position: newState.playerPos,
          hp: newState.playerHP,
          shields: newState.playerShields,
          armor: newState.playerArmor,
          maxArmor: classData.constructStats?.maxArmor ?? 0,
          maxHp: classData.constructStats?.maxHp ?? 20,
          maxShields: classData.constructStats?.maxShields ?? 0,
        },
        enemy: {
          position: enemy?.position ?? newState.enemyPos,
          hp: enemy?.hp ?? newState.enemyHP,
          maxHp: 999999,
          shields: enemy?.shields ?? newState.enemyShields,
          maxShields: enableShield ? 200 : 0,
          armor: enemy?.armor ?? newState.enemyArmor,
          maxArmor: enableArmor ? 150 : 0,
        },
        projectiles: newState.projectiles,
      });

      const twoSecondsAgo = now - 2000;
      recentDamageRef.current = recentDamageRef.current.filter(
        (d) => d.timestamp > twoSecondsAgo,
      );

      const elapsedSinceStart = (now - damageTrackingStartTime) / 1000;
      const recentTotalDamage = recentDamageRef.current.reduce(
        (sum, d) => sum + d.damage,
        0,
      );

      const minTimespanForDps = 2.0;
      const currentDps =
        elapsedSinceStart >= minTimespanForDps && recentTotalDamage > 0
          ? recentTotalDamage / Math.min(elapsedSinceStart, 2.0)
          : 0;

      if (
        currentDps > peakDpsRef.current &&
        elapsedSinceStart >= minTimespanForDps
      ) {
        peakDpsRef.current = currentDps;
      }

      const elapsedSeconds = (now - startTimeRef.current) / 1000;

      setMetrics({
        totalDamage: damageTrackingRef.current.total,
        dps: currentDps,
        peakDps: peakDpsRef.current,
        hits: damageTrackingRef.current.hits,
        protocolExecutions: damageTrackingRef.current.executions,
        testDuration: Math.round(elapsedSeconds * 10) / 10,
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isRunning,
    enableShield,
    enableArmor,
    enableAttacking,
    immuneToStatus,
    classData,
  ]);

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/50 bg-black/80 backdrop-blur-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-cyan-400 font-mono">
            SIMULACRUM
          </h2>
          <p className="text-xs text-cyan-300/70 hidden md:block">
            Test against invincible dummy
          </p>
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

      <div className="flex flex-row overflow-x-auto flex-nowrap gap-2 p-3 bg-black/50 border-b border-cyan-500/30">
        <Card className="shrink-0 min-w-40 bg-gradient-to-br from-cyan-950/50 to-black/50 border border-cyan-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
            <h3 className="text-xs text-cyan-300/70 font-mono">CURRENT DPS</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-cyan-400 font-mono">
            {metrics.dps.toFixed(2)}
          </p>
          <p className="text-[10px] text-cyan-300/50">2s window</p>
        </Card>

        <Card className="shrink-0 min-w-40 bg-gradient-to-br from-pink-950/50 to-black/50 border-2 border-pink-500/70 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
            <h3 className="text-xs text-pink-300/70 font-mono">PEAK DPS</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-pink-400 font-mono">
            {metrics.peakDps.toFixed(2)}
          </p>
          <p className="text-[10px] text-pink-300/50">max burst</p>
        </Card>

        <Card className="shrink-0 min-w-40 bg-gradient-to-br from-green-950/50 to-black/50 border border-green-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
            <h3 className="text-xs text-green-300/70 font-mono">TOTAL DMG</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-green-400 font-mono">
            {metrics.totalDamage.toFixed(2)}
          </p>
          <p className="text-[10px] text-green-300/50">{metrics.hits} hits</p>
        </Card>

        <Card className="shrink-0 min-w-40 bg-gradient-to-br from-purple-950/50 to-black/50 border border-purple-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            <h3 className="text-xs text-purple-300/70 font-mono">PROTOCOLS</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-purple-400 font-mono">
            {metrics.protocolExecutions}
          </p>
        </Card>

        <Card className="shrink-0 min-w-40 bg-gradient-to-br from-yellow-950/50 to-black/50 border border-yellow-500/50 p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
            <h3 className="text-xs text-yellow-300/70 font-mono">TIME</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-yellow-400 font-mono">
            {metrics.testDuration}s
          </p>
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
            shields={gameState.player.shields}
            maxShields={gameState.player.maxShields}
            armor={gameState.player.armor}
            maxArmor={gameState.player.maxArmor}
            customization={customization}
          />

          <CustomizableFighter
            position={gameState.enemy.position}
            isPlayer={false}
            hp={gameState.enemy.hp}
            maxHp={gameState.enemy.maxHp}
            customization={TRAINING_DUMMY_CUSTOMIZATION}
            shields={
              isRunning ? gameState.enemy.shields : enableShield ? 200 : 0
            }
            maxShields={enableShield ? 200 : 0}
            armor={isRunning ? gameState.enemy.armor : enableArmor ? 150 : 0}
            maxArmor={enableArmor ? 150 : 0}
            corrosiveStacks={corrosiveStacks}
            lagStacks={lagStacks}
            burnStacks={burnStacks}
            viralStacks={viralStacks}
            empStacks={empStacks}
          />

          <Projectiles projectiles={gameState.projectiles} />
        </Canvas>

        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/80 border border-yellow-500/50 px-2 py-1 md:px-4 md:py-2 rounded">
          <p className="text-yellow-400 text-xs md:text-sm font-mono">
            ⚠ DUMMY - INVINCIBLE
          </p>
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
              {armorStrips}x Corrosive (-{Math.round(totalArmorStripped)} Armor)
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
          {lagStacks > 0 && (
            <p className="text-cyan-400 text-xs font-mono mt-1 flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"
                style={{ animationDuration: "2s" }}
              />
              {lagStacks}x Lag (+{lagStacks * 15}% CD, {lagStacks * 5}% Stutter)
            </p>
          )}
          {displaceStacks > 0 && (
            <p className="text-amber-400 text-xs font-mono mt-1 flex items-center gap-1">
              <div
                className="w-3 h-3 rounded bg-amber-500 animate-bounce"
                style={{ animationDuration: "1s" }}
              />
              {displaceStacks}x Displace (Knockback, Move Corruption)
            </p>
          )}
          {corrosiveStacks > 0 && (
            <p className="text-lime-400 text-xs font-mono mt-1 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-lime-500 animate-pulse" />
              {corrosiveStacks}x Corrosive (-{Math.round(totalArmorStripped)}{" "}
              Armor)
            </p>
          )}
        </div>

        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black/80 border border-cyan-500/50 px-2 py-1 md:px-3 md:py-2 rounded">
          <p className="text-xs text-cyan-300/50 font-mono">CLASS</p>
          <p className="text-sm md:text-base font-bold text-cyan-400 font-mono">
            {classData.name}
          </p>
          <p className="text-xs text-cyan-300/50">
            {(classData.startingMovementPairs?.length || 0) +
              (classData.startingTacticalPairs?.length || 0)}{" "}
            protocols
          </p>
        </div>
      </div>

      <div className="p-3 md:p-4 bg-gradient-to-t from-black to-gray-900 border-t border-cyan-500/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row overflow-x-auto flex-nowrap gap-2 mb-3">
            <button
              onClick={() => !isRunning && setEnableMovement(!enableMovement)}
              disabled={isRunning}
              className={`flex flex-col min-w-20 shrink-0 items-center justify-center p-3 rounded border transition-all ${
                enableMovement
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                  : "bg-black/50 border-cyan-500/30 text-cyan-500/50 hover:border-cyan-500/50"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Move className="w-5 h-5 mb-1" />
              <span className="text-xs font-mono">Movement</span>
              <span className="text-[10px] font-mono mt-0.5">
                {enableMovement ? "ON" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => !isRunning && setEnableAttacking(!enableAttacking)}
              disabled={isRunning}
              className={`flex flex-col min-w-20 shrink-0 items-center justify-center p-3 rounded border transition-all ${
                enableAttacking
                  ? "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-black/50 border-red-500/30 text-red-500/50 hover:border-red-500/50"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Target className="w-5 h-5 mb-1" />
              <span className="text-xs font-mono">Attacking</span>
              <span className="text-[10px] font-mono mt-0.5">
                {enableAttacking ? "ON" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => !isRunning && setEnableShield(!enableShield)}
              disabled={isRunning}
              className={`flex flex-col min-w-20 shrink-0 items-center justify-center p-3 rounded border transition-all ${
                enableShield
                  ? "bg-blue-500/20 border-blue-500 text-blue-300"
                  : "bg-black/50 border-blue-500/30 text-blue-500/50 hover:border-blue-500/50"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="w-5 h-5 mb-1 rounded-full border-2 border-current flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-current opacity-30" />
              </div>
              <span className="text-xs font-mono">Shield</span>
              <span className="text-[10px] font-mono mt-0.5">
                {enableShield ? "ON" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => !isRunning && setEnableArmor(!enableArmor)}
              disabled={isRunning}
              className={`flex flex-col min-w-20 shrink-0 items-center justify-center p-3 rounded border transition-all ${
                enableArmor
                  ? "bg-orange-500/20 border-orange-500 text-orange-300"
                  : "bg-black/50 border-orange-500/30 text-orange-500/50 hover:border-orange-500/50"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="w-5 h-5 mb-1 rounded border-2 border-current flex items-center justify-center">
                <div className="w-2 h-2 rounded bg-current opacity-30" />
              </div>
              <span className="text-xs font-mono">Armor</span>
              <span className="text-[10px] font-mono mt-0.5">
                {enableArmor ? "ON" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => !isRunning && setImmuneToStatus(!immuneToStatus)}
              disabled={isRunning}
              className={`flex flex-col min-w-20 shrink-0 items-center justify-center p-3 rounded border transition-all ${
                immuneToStatus
                  ? "bg-purple-500/20 border-purple-500 text-purple-300"
                  : "bg-black/50 border-purple-500/30 text-purple-500/50 hover:border-purple-500/50"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="w-5 h-5 mb-1 rounded-full border-2 border-current flex items-center justify-center">
                <Zap className="w-3 h-3" />
              </div>
              <span className="text-xs font-mono">Immunity</span>
              <span className="text-[10px] font-mono mt-0.5">
                {immuneToStatus ? "ON" : "OFF"}
              </span>
            </button>
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
              <Button
                onClick={stopTest}
                className="bg-red-500 hover:bg-red-400 text-black font-bold h-12"
                size="lg"
              >
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
  );
}
