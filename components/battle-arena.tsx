"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useState, useEffect } from "react";
import { BattleGrid } from "./battle/BattleGrid";
import { CustomizableFighter } from "./customizable-fighter";
import { Projectiles } from "./projectiles";
import {
  FloatingGeometry,
  CircuitLayer,
  DataStreams,
  StarField,
  AmbientParticles,
} from "./cyberpunk-background";
import { GlitchOverlay } from "./glitch-effect";
import { EnemyDefeatEffect } from "./enemy-defeat-effect";
import type { GameState } from "@/types/game";
import type { FighterCustomization } from "@/lib/fighter-parts";

interface BattleArenaProps {
  gameState: GameState;
  fighterCustomization?: FighterCustomization;
  enemyCustomization?: FighterCustomization;
  enemyCustomizations?: FighterCustomization[];
}

export function BattleArena({
  gameState,
  fighterCustomization,
  enemyCustomization,
  enemyCustomizations,
}: BattleArenaProps) {
  const enemies =
    gameState.enemies && gameState.enemies.length > 0
      ? gameState.enemies
      : [gameState.enemy];
  const customizations =
    enemyCustomizations && enemyCustomizations.length > 0
      ? enemyCustomizations
      : [enemyCustomization];

  const isGuardianBattle = gameState.isGuardianBattle;

  const [defeatedEnemies, setDefeatedEnemies] = useState<Set<string>>(
    new Set(),
  );
  const [animatingDefeats, setAnimatingDefeats] = useState<
    Map<string, [number, number, number]>
  >(new Map());

  useEffect(() => {
    const newlyDefeated = enemies.filter(
      (enemy) =>
        enemy && enemy.hp <= 0 && !defeatedEnemies.has(enemy.id || "enemy-0"),
    );

    newlyDefeated.forEach((enemy) => {
      const enemyId = enemy.id || "enemy-0";
      const worldPos: [number, number, number] = [
        (enemy.position.x - 2.5) * 1.1,
        0.6,
        (enemy.position.y - 1) * 1.1,
      ];

      console.log(
        `[v0] Enemy ${enemyId} defeated! Playing defeat animation at position`,
        worldPos,
      );

      setAnimatingDefeats((prev) => new Map(prev).set(enemyId, worldPos));
      setDefeatedEnemies((prev) => new Set(prev).add(enemyId));
    });
  }, [enemies, defeatedEnemies]);

  const handleDefeatAnimationComplete = (enemyId: string) => {
    console.log(`[v0] Defeat animation complete for ${enemyId}`);
    setAnimatingDefeats((prev) => {
      const newMap = new Map(prev);
      newMap.delete(enemyId);
      return newMap;
    });
  };

  const aliveEnemies = enemies.filter((enemy) => enemy && enemy.hp > 0);

  return (
    <>
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

        {/* Background layers (furthest to nearest) */}
        <StarField />
        <FloatingGeometry />
        <CircuitLayer />
        <DataStreams />
        <AmbientParticles />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00ffff" />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#ff00ff" />

        {/* Battle Grid */}
        <BattleGrid />

        {/* Player Fighter */}
        <CustomizableFighter
          position={gameState.player.position}
          isPlayer={true}
          hp={gameState.player.hp}
          maxHp={gameState.player.maxHp}
          customization={fighterCustomization}
          shields={gameState.player.shields}
          maxShields={gameState.player.maxShields}
          armor={gameState.player.armor}
          maxArmor={gameState.player.maxArmor}
        />

        {aliveEnemies.map((enemy, index) => {
          const originalIndex = enemies.findIndex((e) => e.id === enemy.id);
          return (
            <CustomizableFighter
              key={enemy.id || `enemy-${index}`}
              position={enemy.position}
              isPlayer={false}
              hp={enemy.hp}
              maxHp={enemy.maxHp}
              customization={
                customizations[
                  Math.min(originalIndex, customizations.length - 1)
                ]
              }
              shields={enemy.shields}
              maxShields={enemy.maxShields}
              armor={enemy.armor}
              maxArmor={enemy.maxArmor}
              isPawn={enemy.isPawn}
              isGuardian={isGuardianBattle && originalIndex === 0}
            />
          );
        })}

        {Array.from(animatingDefeats.entries()).map(([enemyId, position]) => (
          <EnemyDefeatEffect
            key={`defeat-${enemyId}`}
            position={position}
            onComplete={() => handleDefeatAnimationComplete(enemyId)}
          />
        ))}

        {/* Projectiles */}
        <Projectiles projectiles={gameState.projectiles} />
      </Canvas>

      <GlitchOverlay />
    </>
  );
}
