import { DamageType, ActionResult } from "@/types/game";
import type {
  BattleState,
  BattleUpdate,
  TriggerActionPair,
  BattleContext,
  EnemyState,
  Projectile,
} from "@/types/game";
import { AIExecutor } from "./AIExecutor";
import { ProjectileManager } from "./ProjectileManager";
import { DamageCalculator } from "./DamageCalculator";
import { StatusEffectManager } from "./StatusEffectManager";
import { ElementalModifier } from "./ElementalModifier";
import { FighterCustomization } from "../fighter-parts";

/**
 * Records a single point in battle history for graphs/statistics.
 */
interface BattleHistoryPoint {
  /** Time in seconds since battle start */
  time: number;
  /** Player's total HP at this point */
  playerHP: number;
  /** Sum of all enemies' HP at this point */
  enemyHP: number;
}

/**
 * Orchestrates the entire battle simulation.
 *
 * This is the main controller that coordinates all battle subsystems:
 * AI execution, projectile management, damage calculation, and status effects.
 * It manages the overall battle state and delegates specific concerns to
 * specialized classes following the Single Responsibility Principle.
 *
 * @example
 * const engine = new BattleEngine(
 *   initialState,
 *   playerMovement,
 *   playerTactical,
 *   enemyPairs
 * );
 *
 * let update = engine.tick(16); // 16ms per frame
 * while (!update.battleOver) {
 *   update = engine.tick(16);
 * }
 * console.log(update.playerWon ? 'Victory!' : 'Defeat!');
 */
export class BattleEngine {
  /** The current battle state */
  private state: BattleState;

  /** Player's movement core protocols */
  private playerMovementPairs: TriggerActionPair[];

  /** Player's tactical core protocols */
  private playerTacticalPairs: TriggerActionPair[];

  /** Enemy protocols, one array per enemy */
  private enemyPairs: TriggerActionPair[][];

  /** Handles protocol execution and cooldowns */
  private aiExecutor: AIExecutor;

  /** Handles projectile lifecycle */
  private projectileManager: ProjectileManager;

  /** Accumulated battle time in milliseconds */
  private battleTime = 0;

  /** Last time battle history was recorded */
  private lastHistoryRecord = 0;

  /** Last time burn damage was processed */
  private lastBurnTick = 0;

  /** History of battle state snapshots */
  private battleHistory: BattleHistoryPoint[] = [];

  /**
   * Initializes the battle engine with initial state and protocol pairs.
   *
   * @param {BattleState} initialState - The starting battle configuration
   * @param {TriggerActionPair[]} playerMovementPairs - Player's movement protocols
   * @param {TriggerActionPair[]} playerTacticalPairs - Player's tactical protocols
   * @param {TriggerActionPair[] | TriggerActionPair[][]} enemyPairs - Enemy protocols
   * @param {FighterCustomization} [playerCustomization] - Visual customization data for player
   * @param {FighterCustomization | FighterCustomization[]} [enemyCustomization] - Visual customization data for enemies
   */
  constructor(
    initialState: BattleState,
    playerMovementPairs: TriggerActionPair[],
    playerTacticalPairs: TriggerActionPair[],
    enemyPairs: TriggerActionPair[] | TriggerActionPair[][],
    playerCustomization?: FighterCustomization,
    enemyCustomization?: FighterCustomization | FighterCustomization[],
  ) {
    this.state = this.normalizeState(initialState);
    this.playerMovementPairs = [...playerMovementPairs].sort(
      (a, b) => b.priority - a.priority,
    );
    this.playerTacticalPairs = [...playerTacticalPairs].sort(
      (a, b) => b.priority - a.priority,
    );
    this.enemyPairs = this.normalizeEnemyPairs(enemyPairs, initialState);
    this.aiExecutor = new AIExecutor();
    this.projectileManager = new ProjectileManager();

    this.battleHistory.push({
      time: 0,
      playerHP: initialState.playerHP,
      enemyHP: this.state.enemies.reduce((sum, e) => sum + e.hp, 0),
    });
  }

  /**
   * Advances the battle by one frame.
   *
   * This is the main game loop update function. It processes projectiles,
   * checks collisions, executes AI for both player and enemies, and checks
   * for battle end conditions. Called once per frame with deltaTime.
   *
   * @param {number} deltaTime - Time elapsed since last frame in milliseconds
   * @returns {BattleUpdate} Update object containing new state and battle outcome
   *
   * @example
   * const update = engine.tick(16);
   * if (update.battleOver) {
   *   console.log(update.playerWon ? 'Won!' : 'Lost!');
   * }
   */
  tick(deltaTime: number): BattleUpdate {
    const update: BattleUpdate = {};

    this.battleTime += deltaTime;
    this.aiExecutor.updateCooldowns(deltaTime);
    this.recordBattleHistory();
    this.processBurnDamage();
    this.cleanupExpiredEffects();

    // Update projectile positions
    const projectiles = this.projectileManager.updateProjectiles(
      this.state.projectiles,
      deltaTime,
    );
    this.state.projectiles = projectiles;

    // Update projectile positions
    update.projectiles = [...projectiles];

    // Check projectile collisions
    const hitResult = this.projectileManager.checkCollisions(
      projectiles,
      this.state.playerPos,
      this.state.enemies,
    );
    this.state.projectiles = hitResult.remaining;

    // Apply damage from collisions
    for (const { projectile, target } of hitResult.hits) {
      if (target === "player") {
        this.applyDamageToPlayer(projectile, update);
      } else {
        this.applyDamageToEnemy(projectile, target, update);
      }
    }

    // Check battle end conditions
    if (this.state.playerHP <= 0) {
      update.battleOver = true;
      update.playerWon = false;
      update.battleHistory = this.battleHistory;
      return update;
    }

    // Check if all guardian enemies are defeated
    const guardians = this.state.enemies.filter((e) => !e.isPawn);
    const guardiansAlive = guardians.filter((e) => e.hp > 0);
    if (guardians.length > 0 && guardiansAlive.length === 0) {
      update.battleOver = true;
      update.playerWon = true;
      update.battleHistory = this.battleHistory;
      return update;
    }

    // Execute AI for player and enemies
    this.executePlayerAI(update, deltaTime);
    this.executeEnemyAI(update, deltaTime);

    return update;
  }

  /**
   * Executes player's protocol pairs for this frame.
   *
   * First evaluates movement core protocols. If one executes, the turn ends.
   * Otherwise, evaluates tactical core protocols. Updates the battle state
   * with any resulting actions.
   *
   * @private
   * @param {BattleUpdate} update - Update object to populate with results
   * @param {number} deltaTime - Time elapsed this frame (for cooldowns)
   */
  private executePlayerAI(update: BattleUpdate, deltaTime: number): void {
    const context = this.createPlayerContext();

    const movementAction = this.aiExecutor.execute(
      this.playerMovementPairs,
      context,
      deltaTime,
      "movement",
      "player-movement",
    );

    if (movementAction) {
      this.applyAction(movementAction, true, update);
      return;
    }

    const tacticalAction = this.aiExecutor.execute(
      this.playerTacticalPairs,
      context,
      deltaTime,
      "tactical",
      "player-tactical",
    );

    if (tacticalAction) {
      this.applyAction(tacticalAction, true, update);
    }
  }

  /**
   * Executes all enemy protocol pairs for this frame.
   *
   * Iterates through all active enemies and executes their AI using the
   * same two-core system as the player (movement first, then tactical).
   *
   * @private
   * @param {BattleUpdate} update - Update object to populate with results
   * @param {number} deltaTime - Time elapsed this frame (for cooldowns)
   */
  private executeEnemyAI(update: BattleUpdate, deltaTime: number): void {
    this.state.enemies.forEach((enemy, index) => {
      if (enemy.hp <= 0) return;

      const enemyPairs =
        this.enemyPairs[Math.min(index, this.enemyPairs.length - 1)];
      const context = this.createEnemyContext(enemy);

      const movementAction = this.aiExecutor.execute(
        enemyPairs,
        context,
        deltaTime,
        "movement",
        enemy.id,
        enemy,
      );

      if (movementAction) {
        this.applyAction(movementAction, false, update, enemy);
        return;
      }

      const tacticalAction = this.aiExecutor.execute(
        enemyPairs,
        context,
        deltaTime,
        "tactical",
        enemy.id,
        enemy,
      );

      if (tacticalAction) {
        this.applyAction(tacticalAction, false, update, enemy);
      }
    });
  }

  /**
   * Applies damage from a projectile to the player.
   *
   * Calculates damage based on projectile properties and player defenses,
   * applies it through shields and armor layers, and updates the battle state.
   *
   * @private
   * @param {Projectile} proj - The projectile hitting the player
   * @param {BattleUpdate} update - Update object to populate with results
   */
  private applyDamageToPlayer(proj: Projectile, update: BattleUpdate): void {
    let damage = proj.damage;

    if (proj.damageType) {
      const modifiers = ElementalModifier.getModifiers(proj.damageType);

      if (this.state.playerShields && this.state.playerShields > 0) {
        damage *= modifiers.shieldBonus;
      } else if (this.state.playerArmor && this.state.playerArmor > 0) {
        damage *= modifiers.armorBonus;
      }
    }

    let remainingDamage = damage;

    if (this.state.playerShields && this.state.playerShields > 0) {
      const shieldDamage = Math.min(this.state.playerShields, remainingDamage);
      this.state.playerShields = Math.max(
        0,
        this.state.playerShields - shieldDamage,
      );
      remainingDamage -= shieldDamage;
      update.playerShields = this.state.playerShields;
    }

    if (
      remainingDamage > 0 &&
      this.state.playerArmor &&
      this.state.playerArmor > 0
    ) {
      const armorReduction =
        this.state.playerArmor / (this.state.playerArmor + 300);
      remainingDamage = remainingDamage * (1 - armorReduction);
    }

    if (remainingDamage > 0) {
      this.state.playerHP = Math.max(0, this.state.playerHP - remainingDamage);
      update.playerHP = this.state.playerHP;
    }

    update.justTookDamage = true;
    this.state.justTookDamage = true;
  }

  /**
   * Applies damage from a projectile to an enemy.
   *
   * Calculates damage based on projectile properties and enemy defenses,
   * applies status effects, and updates enemy state.
   *
   * @private
   * @param {Projectile} proj - The projectile hitting the enemy
   * @param {EnemyState} enemy - The enemy being hit
   * @param {BattleUpdate} update - Update object to populate with results
   */
  private applyDamageToEnemy(
    proj: Projectile,
    enemy: EnemyState,
    update: BattleUpdate,
  ): void {
    let damage = proj.damage;

    if (proj.damageType) {
      const modifiers = ElementalModifier.getModifiers(proj.damageType);

      if (enemy.shields > 0) {
        damage *= modifiers.shieldBonus;
      } else if (enemy.armor > 0) {
        damage *= modifiers.armorBonus;
      }
    }

    const result = DamageCalculator.applyDamageToEnemy(enemy, damage);
    const viralMultiplier = StatusEffectManager.getViralDamageMultiplier(
      this.state.enemies,
    );
    const amplifiedHpDamage = result.hpDamage * viralMultiplier;
    enemy.hp = Math.max(0, enemy.hp - (amplifiedHpDamage - result.hpDamage));

    StatusEffectManager.tryApplyStatus(
      enemy,
      proj,
      this.battleTime,
      !this.state.enemyImmuneToStatus,
    );

    update.enemyHP = this.state.enemies.reduce((sum, e) => sum + e.hp, 0);
    update.damageDealt = {
      type: proj.damageType || DamageType.KINETIC,
      amount: Math.round((result.shieldDamage + amplifiedHpDamage) * 10) / 10,
    };
  }

  /**
   * Applies an action result to the battle state.
   *
   * Handles all action types (shoot, move, heal, wave, field, melee, etc.) and
   * modifies the battle state accordingly.
   *
   * @private
   * @param {ActionResult} action - The action result to apply
   * @param {boolean} isPlayer - Whether this action is from the player
   * @param {BattleUpdate} update - Update object to populate
   * @param {EnemyState} [enemy] - The enemy performing the action (if applicable)
   */
  private applyAction(
    action: ActionResult,
    isPlayer: boolean,
    update: BattleUpdate,
    enemy?: EnemyState,
  ): void {
    const sourcePos = isPlayer ? this.state.playerPos : enemy!.position;
    const targetPos = isPlayer ? enemy?.position : this.state.playerPos;

    switch (action.type) {
      case "shoot":
      case "homing":
      case "piercing-shot": {
        const proj = this.projectileManager.createProjectile(
          sourcePos,
          isPlayer ? "right" : "left",
          action.damage,
          action.damageType,
          action.statusChance || 0,
        );
        this.state.projectiles.push(proj);
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "rapid-fire": {
        for (let i = 0; i < action.count; i++) {
          const proj = this.projectileManager.createProjectile(
            sourcePos,
            isPlayer ? "right" : "left",
            action.damage,
            action.damageType,
            action.statusChance || 0,
          );
          this.state.projectiles.push(proj);
        }
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "triple-shot": {
        for (let row = 0; row <= 2; row++) {
          const proj = this.projectileManager.createProjectile(
            { ...sourcePos, y: row },
            isPlayer ? "right" : "left",
            action.damage,
            action.damageType,
            action.statusChance || 0,
          );
          this.state.projectiles.push(proj);
        }
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "wave":
      case "spread": {
        // Wave hits entire row, spread hits all rows from source position
        const rows = action.type === "spread" ? [0, 1, 2] : [sourcePos.y];
        rows.forEach((row) => {
          const proj = this.projectileManager.createProjectile(
            { ...sourcePos, y: row },
            isPlayer ? "right" : "left",
            action.damage,
            action.damageType,
            action.statusChance || 0,
          );
          this.state.projectiles.push(proj);
        });
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "bomb":
      case "cluster": {
        const projectileCount =
          action.type === "cluster" ? action.count || 3 : 1;
        for (let i = 0; i < projectileCount; i++) {
          const proj = this.projectileManager.createProjectile(
            sourcePos,
            isPlayer ? "right" : "left",
            action.damage,
            action.damageType,
            action.statusChance || 0,
          );
          this.state.projectiles.push(proj);
        }
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "field": {
        // Create persistent field damage over time
        // Field spawns multiple projectiles over duration
        const tickCount = Math.floor(action.duration / 500);
        for (let i = 0; i < tickCount; i++) {
          const proj = this.projectileManager.createProjectile(
            sourcePos,
            isPlayer ? "right" : "left",
            action.damage,
            action.damageType,
            action.statusChance || 0,
          );
          this.state.projectiles.push(proj);
        }
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "melee":
      case "wide-melee": {
        if (!targetPos) break;

        const distance =
          Math.abs(sourcePos.x - targetPos.x) +
          Math.abs(sourcePos.y - targetPos.y);

        if (distance <= action.range) {
          const sameRow = sourcePos.y === targetPos.y;
          const shouldHit = action.type === "wide-melee" || sameRow;

          if (shouldHit) {
            const proj = this.projectileManager.createProjectile(
              sourcePos,
              isPlayer ? "right" : "left",
              action.damage,
              action.damageType,
              action.statusChance || 0,
            );
            this.state.projectiles.push(proj);
            update.projectiles = [...this.state.projectiles];
          }
        }
        break;
      }

      case "dash-attack": {
        const proj = this.projectileManager.createProjectile(
          sourcePos,
          isPlayer ? "right" : "left",
          action.damage,
          action.damageType,
          0,
        );
        this.state.projectiles.push(proj);

        if (isPlayer) {
          this.state.playerPos = action.position;
          update.playerPos = action.position;
        } else if (enemy) {
          enemy.position = action.position;
          update.enemyPos = action.position;
        }
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "retreat-shot": {
        const proj = this.projectileManager.createProjectile(
          sourcePos,
          isPlayer ? "right" : "left",
          action.damage,
          action.damageType,
          0,
        );
        this.state.projectiles.push(proj);

        if (isPlayer) {
          this.state.playerPos = action.position;
          update.playerPos = action.position;
        } else if (enemy) {
          enemy.position = action.position;
          update.enemyPos = action.position;
        }
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "drain": {
        const proj = this.projectileManager.createProjectile(
          sourcePos,
          isPlayer ? "right" : "left",
          action.damage,
          action.damageType,
          action.statusChance || 0,
        );
        this.state.projectiles.push(proj);

        if (isPlayer) {
          this.state.playerHP = Math.min(
            this.state.playerHP + action.heal,
            100,
          );
          update.playerHP = this.state.playerHP;
        } else if (enemy) {
          enemy.hp = Math.min(enemy.hp + action.heal, enemy.maxHp);
          update.enemyHP = this.state.enemies.reduce((sum, e) => sum + e.hp, 0);
        }
        update.projectiles = [...this.state.projectiles];
        break;
      }

      case "move": {
        if (isPlayer) {
          this.state.playerPos = action.position;
          update.playerPos = action.position;
        } else if (enemy) {
          if (action.position.x < 3) break;

          const occupied = this.state.enemies.some(
            (e) =>
              e.id !== enemy.id &&
              e.hp > 0 &&
              e.position.x === action.position.x &&
              e.position.y === action.position.y,
          );

          if (!occupied) {
            enemy.position = action.position;
            update.enemyPos = action.position;
          }
        }
        break;
      }

      case "heal": {
        if (isPlayer) {
          this.state.playerHP = Math.min(
            this.state.playerHP + action.amount,
            100,
          );
          update.playerHP = this.state.playerHP;
        } else if (enemy) {
          enemy.hp = Math.min(enemy.hp + action.amount, enemy.maxHp);
          update.enemyHP = this.state.enemies.reduce((sum, e) => sum + e.hp, 0);
        }
        break;
      }

      case "heal-over-time": {
        // Apply immediate first tick, schedule rest
        const tickCount = Math.floor(action.duration / 500);
        const healAmount = action.healPerTick;

        if (isPlayer) {
          this.state.playerHP = Math.min(this.state.playerHP + healAmount, 100);
          update.playerHP = this.state.playerHP;
        } else if (enemy) {
          enemy.hp = Math.min(enemy.hp + healAmount, enemy.maxHp);
          update.enemyHP = this.state.enemies.reduce((sum, e) => sum + e.hp, 0);
        }
        break;
      }

      case "barrier":
      case "shield":
      case "counter":
      case "invincible": {
        // These require implementation of buff/status system on entities
        // Placeholder: add status effect to appropriate entity
        break;
      }

      case "buff": {
        // Requires buff system implementation on entities
        // Placeholder: add buff to appropriate entity
        break;
      }
    }
  }

  /**
   * Creates battle context for player AI evaluation.
   *
   * Determines which enemy is nearest and uses that for trigger evaluation.
   *
   * @private
   * @returns {BattleContext} Context object for trigger evaluation
   */
  private createPlayerContext(): BattleContext {
    const livingEnemies = this.state.enemies.filter((e) => e.hp > 0);
    const nearestEnemy =
      livingEnemies.length > 0
        ? livingEnemies.reduce((nearest, enemy) => {
            const distToEnemy =
              Math.abs(enemy.position.x - this.state.playerPos.x) +
              Math.abs(enemy.position.y - this.state.playerPos.y);
            const distToNearest =
              Math.abs(nearest.position.x - this.state.playerPos.x) +
              Math.abs(nearest.position.y - this.state.playerPos.y);
            return distToEnemy < distToNearest ? enemy : nearest;
          })
        : this.state.enemies[0];

    return {
      enemies: this.state.enemies,
      playerPos: this.state.playerPos,
      enemyPos: nearestEnemy?.position || this.state.playerPos,
      playerHP: this.state.playerHP,
      enemyHP: this.state.playerHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer: true,
    };
  }

  /**
   * Creates battle context for a specific enemy AI evaluation.
   *
   * @private
   * @param {EnemyState} enemy - The enemy to create context for
   * @returns {BattleContext} Context object for trigger evaluation
   */
  private createEnemyContext(enemy: EnemyState): BattleContext {
    return {
      enemies: this.state.enemies,
      playerPos: enemy.position,
      enemyPos: this.state.playerPos,
      playerHP: enemy.hp,
      enemyHP: this.state.playerHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer: false,
    };
  }

  /**
   * Processes burn damage for all enemies.
   *
   * Called once per 500ms to apply accumulated burn damage over time.
   *
   * @private
   */
  private processBurnDamage(): void {
    if (this.battleTime - this.lastBurnTick >= 500) {
      this.lastBurnTick = this.battleTime;
      this.state.enemies.forEach((enemy) => {
        DamageCalculator.applyBurnDamage(enemy);
      });
    }
  }

  /**
   * Removes all expired status effects from all enemies.
   *
   * Called once per frame to maintain clean status effect state.
   *
   * @private
   */
  private cleanupExpiredEffects(): void {
    this.state.enemies.forEach((enemy) => {
      StatusEffectManager.cleanupExpiredEffects(enemy, this.battleTime);
    });
  }

  /**
   * Records a snapshot of the current battle state for history/analytics.
   *
   * Called once per 500ms to create a history timeline.
   *
   * @private
   */
  private recordBattleHistory(): void {
    if (this.battleTime - this.lastHistoryRecord >= 500) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: this.state.playerHP,
        enemyHP: this.state.enemies.reduce((sum, e) => sum + e.hp, 0),
      });
      this.lastHistoryRecord = this.battleTime;
    }
  }

  /**
   * Normalizes and validates the initial battle state.
   *
   * @private
   * @param {BattleState} state - Raw state to normalize
   * @returns {BattleState} Validated and normalized state
   */
  private normalizeState(state: BattleState): BattleState {
    return state;
  }

  /**
   * Normalizes enemy protocol pairs into a consistent array format.
   *
   * @private
   * @param {TriggerActionPair[] | TriggerActionPair[][]} enemyPairs - Raw enemy pairs
   * @param {BattleState} initialState - Initial state for context
   * @returns {TriggerActionPair[][]} Normalized 2D array of protocol pairs
   */
  private normalizeEnemyPairs(
    enemyPairs: TriggerActionPair[] | TriggerActionPair[][],
    initialState: BattleState,
  ): TriggerActionPair[][] {
    return Array.isArray(enemyPairs) && Array.isArray(enemyPairs[0])
      ? (enemyPairs as TriggerActionPair[][])
      : [
          (enemyPairs as TriggerActionPair[]).sort(
            (a, b) => b.priority - a.priority,
          ),
        ];
  }

  /**
   * Returns a copy of the current battle state.
   *
   * @returns {BattleState} A shallow copy of the battle state
   */
  getState(): BattleState {
    return { ...this.state };
  }
}
