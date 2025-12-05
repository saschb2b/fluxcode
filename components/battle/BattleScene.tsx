import { Html } from "@react-three/drei";
import { BattleGrid } from "./BattleGrid";
import { CustomizableFighter } from "../customizable-fighter";
import { Projectiles } from "../projectiles";
import { EnemyVisuals } from "../enemies/EnemyVisuals";
import { UnifiedIntegrityBar } from "../unified-integrity-bar";
import type { GameState } from "@/types/game";
import type { FighterCustomization } from "@/lib/fighter-parts";
import { ArenaEnvironment } from "./ArenaEnvironment";
import {
  AmbientParticles,
  FloatingGeometry,
  StarField,
} from "../cyberpunk-background";
import { VisualEffects } from "./VisualEffects";

interface BattleSceneProps {
  gameState: GameState;
  playerCustomization?: FighterCustomization;
}

export function BattleScene({
  gameState,
  playerCustomization,
}: BattleSceneProps) {
  return (
    <>
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      <StarField />
      <FloatingGeometry />

      <VisualEffects />
      <ArenaEnvironment />
      <BattleGrid />

      {/* PLAYER RENDERER */}
      <CustomizableFighter
        position={gameState.player.position}
        isPlayer={true}
        hp={gameState.player.hp}
        maxHp={gameState.player.maxHp}
        shields={gameState.player.shields}
        maxShields={gameState.player.maxShields}
        armor={gameState.player.armor}
        maxArmor={gameState.player.maxArmor}
        customization={playerCustomization}
      />

      {/* ENEMY RENDERER LOOP */}
      {gameState.enemies?.map((enemy) => {
        // Calculate Attacking State based on Engine data
        /**
        const isAttacking =
          !!enemy.lastAttackTime &&
          !!enemy.attackDuration &&
          Date.now() < enemy.lastAttackTime + enemy.attackDuration;
        */

        const isAttacking = Date.now() % 1000 < 500;

        return (
          <EnemyVisuals
            key={enemy.id}
            definitionId={enemy.definitionId || "misingNo"} // Uses real ID from state
            position={enemy.position}
            isAttacking={isAttacking}
            //isHit={enemy.justTookDamage}
            isHit={false}
            isDead={enemy.hp <= 0}
            hpPercentage={enemy.hp / enemy.maxHp}
          >
            {/* Health Bar Overlay */}
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
    </>
  );
}
