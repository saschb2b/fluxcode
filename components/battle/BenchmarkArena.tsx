"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { X, Zap, Swords } from "lucide-react";
import { BattleGrid } from "../battle-grid";
import { CustomizableFighter } from "../customizable-fighter";
import { Projectiles } from "../projectiles";
import { EnemyVisuals } from "../enemies/EnemyVisuals";
import {
  FloatingGeometry,
  StarField,
  AmbientParticles,
} from "../cyberpunk-background";

import { BattleEngine } from "@/lib/battleEngine/BattleEngine";
import { createEnemyState } from "@/lib/enemies/registry";
import { buildTriggerActionPairs } from "@/lib/protocol-builder";
import type { Fighter, GameState } from "@/types/game";
import { UnifiedIntegrityBar } from "../unified-integrity-bar";

interface BattleArenaProps {
  classData: Fighter;
  onClose: () => void;
}

export function BenchmarkArena({ classData, onClose }: BattleArenaProps) {
  const [isRunning, setIsRunning] = useState(false);
  const battleEngineRef = useRef<BattleEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initial UI State
  const [gameState, setGameState] = useState<GameState>({
    player: {
      position: { x: 1, y: 1 },
      hp: classData.hp || 100,
      maxHp: classData.maxHp || 100,
      armor: classData.maxArmor || 0,
      maxArmor: classData.maxArmor || 0,
      shields: classData.maxShields || 0,
      maxShields: classData.maxShields || 0,
    },
    // We start with an empty array or a placeholder
    enemies: [],
    projectiles: [],
  });

  const startBattle = () => {
    // 1. Build Player Logic
    const playerMovement = buildTriggerActionPairs([]);
    const playerTactical = buildTriggerActionPairs([]);

    // 2. SPAWN THE SENTRY USING THE REGISTRY
    // This pulls HP, Shields, Visuals, and AI from sentry.tsx
    const sentryState = createEnemyState("sentry-alpha", { x: 4, y: 1 }, 0);

    // 3. Initialize Engine
    battleEngineRef.current = new BattleEngine(
      {
        playerPos: { x: 1, y: 1 },
        playerHP: classData.maxHp || 100,
        playerShields: classData.maxShields || 0,
        playerArmor: classData.maxArmor || 0,
        enemies: [sentryState], // Pass our new Sentry
        projectiles: [],
        justTookDamage: false,
        enemyImmuneToStatus: false,
      },
      playerMovement,
      playerTactical,
      // Extract protocols from the state we just created
      [sentryState.triggerActionPairs || []],
    );

    setIsRunning(true);
    lastTimeRef.current = Date.now();
  };

  const stopBattle = () => {
    setIsRunning(false);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
  };

  useEffect(() => {
    if (!isRunning || !battleEngineRef.current) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Tick Engine
      const update = battleEngineRef.current!.tick(deltaTime);
      const newState = battleEngineRef.current!.getState();

      // Sync React State
      setGameState({
        player: {
          position: newState.playerPos,
          hp: newState.playerHP,
          shields: newState.playerShields,
          armor: newState.playerArmor,
          maxArmor: classData.maxArmor ?? 0,
          maxHp: classData.maxHp ?? 100,
          maxShields: classData.maxShields ?? 0,
        },
        enemies: newState.enemies, // Syncs full enemy array
        projectiles: newState.projectiles,
      });

      if (update.battleOver) {
        setIsRunning(false);
      } else {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [classData.maxArmor, classData.maxHp, classData.maxShields, isRunning]);

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/50 bg-black/80">
        <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
          <Swords className="w-5 h-5" /> BATTLE ARENA
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5 text-red-400" />
        </Button>
      </div>

      {/* 3D Scene */}
      <div className="flex-1 relative min-h-0">
        <Canvas shadows className="crt-effect">
          <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
          <OrbitControls target={[0, 0, 0]} />

          <color attach="background" args={["#0a0015"]} />
          <StarField />
          <AmbientParticles />
          <FloatingGeometry />

          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

          <BattleGrid />

          {/* PLAYER RENDERER (Legacy) */}
          <CustomizableFighter
            position={gameState.player.position}
            isPlayer={true}
            hp={gameState.player.hp}
            maxHp={gameState.player.maxHp}
            shields={gameState.player.shields}
            maxShields={gameState.player.maxShields}
            armor={gameState.player.armor}
            maxArmor={gameState.player.maxArmor}
          />

          {/* NEW ENEMY RENDERER LOOP */}
          {gameState.enemies?.map((enemy) => {
            /**
             * Mocks isAttacking for 500ms and switches back and forth based on current date now
             */
            const isAttacking = Date.now() % 1000 < 500;

            return (
              <EnemyVisuals
                key={enemy.id}
                // The crucial link: ID tells us which renderer to use
                definitionId={"warden-boss"}
                position={enemy.position}
                // Runtime props for the renderer
                isAttacking={isAttacking} // Connect this to BattleEngine state later
                isHit={false} // Connect this later
                isDead={enemy.hp <= 0}
                hpPercentage={enemy.hp / enemy.maxHp}
              >
                <Html position={[0, 1.5, 0]} center zIndexRange={[0, 0]}>
                  <UnifiedIntegrityBar
                    entityName={"ENEMY"}
                    isPlayer={false}
                    hp={enemy.hp}
                    maxHp={enemy.maxHp}
                    shields={enemy.shields || 0}
                    maxShields={enemy.maxShields || 0}
                    armor={enemy.armor || 0}
                    maxArmor={enemy.maxArmor || 0}
                    compact={true}
                  />
                </Html>
              </EnemyVisuals>
            );
          })}

          <Projectiles projectiles={gameState.projectiles} />
        </Canvas>
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-gray-900 border-t border-cyan-500/50 flex gap-4 justify-center">
        {!isRunning ? (
          <Button
            onClick={startBattle}
            className="bg-green-500 hover:bg-green-400 text-black font-bold h-12 w-40"
          >
            <Zap className="w-4 h-4 mr-2" /> SPAWN & FIGHT
          </Button>
        ) : (
          <Button
            onClick={stopBattle}
            className="bg-red-500 hover:bg-red-400 text-black font-bold h-12 w-40"
          >
            STOP
          </Button>
        )}
      </div>
    </div>
  );
}
