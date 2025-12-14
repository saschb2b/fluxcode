"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { X, Zap, Swords, RotateCcw } from "lucide-react";

// Logic Imports
import { BattleEngine } from "@/lib/battleEngine/BattleEngine";
import { createEnemyState } from "@/lib/enemies/registry";
import { buildTriggerActionPairs } from "@/lib/protocol-builder";
import type { Fighter, GameState } from "@/types/game";
import type { FighterCustomization } from "@/lib/fighter-parts";

// Component Imports
import { EnemySelector } from "./EnemySelector";
import { BattleScene } from "./BattleScene";

interface BenchmarkArenaProps {
  classData: Fighter;
  customization?: FighterCustomization;
  onClose: () => void;
}

export function BenchmarkArena({
  classData,
  customization,
  onClose,
}: BenchmarkArenaProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedEnemyId, setSelectedEnemyId] =
    useState<string>("sentry-alpha");

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
    enemies: [],
    projectiles: [],
  });

  const resetBattle = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);

    // Create a fresh preview state (Player + Selected Enemy at spawn)
    try {
      const previewEnemy = createEnemyState(selectedEnemyId, { x: 4, y: 1 }, 0);
      setGameState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          position: { x: 1, y: 1 },
          hp: prev.player.maxHp,
          shields: prev.player.maxShields,
          armor: prev.player.maxArmor,
        },
        enemies: [previewEnemy],
        projectiles: [],
      }));
    } catch (e) {
      console.error("Failed to preview enemy:", e);
    }
  }, [selectedEnemyId]);

  // Reset whenever enemy selection changes
  useEffect(() => {
    resetBattle();
  }, [resetBattle]);

  const startBattle = () => {
    // 1. Build Player Logic (In a real app, pass this in props)
    // For benchmark, we might use the class default protocols
    const playerMovement = buildTriggerActionPairs([]);
    const playerTactical = buildTriggerActionPairs([]);

    // 2. Spawn Logic
    const enemyState = createEnemyState(selectedEnemyId, { x: 4, y: 1 }, 0);

    // 3. Initialize Engine
    battleEngineRef.current = new BattleEngine(
      {
        playerPos: { x: 1, y: 1 },
        playerHP: classData.maxHp || 100,
        playerShields: classData.maxShields || 0,
        playerArmor: classData.maxArmor || 0,
        enemies: [enemyState],
        projectiles: [],
        justTookDamage: false,
        enemyImmuneToStatus: false,
      },
      playerMovement,
      playerTactical,
      [enemyState.triggerActionPairs || []], // Pass enemy logic
    );

    setIsRunning(true);
    lastTimeRef.current = Date.now();
  };

  const stopBattle = () => {
    setIsRunning(false);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
  };

  // The Game Loop
  useEffect(() => {
    if (!isRunning || !battleEngineRef.current) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const update = battleEngineRef.current!.tick(deltaTime);
      const newState = battleEngineRef.current!.getState();

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
        enemies: newState.enemies,
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
  }, [isRunning, classData]);

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
            <Swords className="w-5 h-5" /> BENCHMARK
          </h2>
          <div className="h-6 w-px bg-cyan-500/30" />

          {/* THE ENEMY SELECTOR */}
          <EnemySelector
            value={selectedEnemyId}
            onChange={setSelectedEnemyId}
            disabled={isRunning}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:text-red-400"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 relative min-h-0 bg-[#0a0015]">
        <Canvas
          shadows
          className="crt-effect"
          camera={{ position: [0, 3, 5], fov: 60 }}
        >
          <OrbitControls target={[0, 0, 0]} />

          <BattleScene
            gameState={gameState}
            playerCustomization={customization}
          />
        </Canvas>
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-gray-900 border-t border-cyan-500/50 flex gap-4 justify-center items-center">
        {!isRunning ? (
          <Button
            onClick={startBattle}
            className="bg-green-500 hover:bg-green-400 text-black font-bold h-12 w-48 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            <Zap className="w-4 h-4 mr-2" /> ENGAGE
          </Button>
        ) : (
          <Button
            onClick={stopBattle}
            className="bg-red-500 hover:bg-red-400 text-black font-bold h-12 w-48"
          >
            HALT SIMULATION
          </Button>
        )}

        <Button
          onClick={resetBattle}
          variant="outline"
          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 h-12 w-12 p-0"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
