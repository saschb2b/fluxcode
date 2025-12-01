import type {
  TriggerActionPair,
  BattleContext,
  ActionResult,
  EnemyState,
} from "@/types/game";
import { StatusEffectManager } from "./StatusEffectManager";

/**
 * Executes protocol trigger-action pairs and manages their cooldowns.
 *
 * Evaluates triggers to determine which action should fire, respects cooldown
 * windows, and accounts for status effects like lag that can cause action failures.
 * This separation allows AI execution logic to be tested and reused independently.
 *
 * @example
 * const executor = new AIExecutor();
 * const action = executor.execute(
 *   protocolPairs,
 *   context,
 *   deltaTime,
 *   'tactical',
 *   'player-1',
 *   enemy
 * );
 */
export class AIExecutor {
  /**
   * Tracks cooldown timers for all actions across all entities.
   * Maps cooldown keys to remaining cooldown time in milliseconds.
   *
   * Format: `${entityId}-${actionId}` -> remaining time
   *
   * @private
   */
  private cooldowns: Map<string, number> = new Map();

  /**
   * Executes protocol pairs for a given entity.
   *
   * Evaluates all protocol pairs of the specified core type, checking triggers
   * in priority order. The first trigger that returns true executes its action.
   * Respects cooldowns and accounts for lag-induced action failures.
   *
   * @param {TriggerActionPair[]} pairs - All available protocol pairs for this entity
   * @param {BattleContext} context - The current battle state context
   * @param {number} deltaTime - Time elapsed since last frame (milliseconds)
   * @param {"movement" | "tactical"} coreType - Which protocol core to execute from
   * @param {string} entityId - Unique identifier for this entity (for cooldown tracking)
   * @param {EnemyState} [enemy] - The enemy entity (if executing enemy AI)
   * @returns {ActionResult | null} The executed action, or null if no triggers matched
   *
   * @example
   * const action = executor.execute(
   *   pairs,
   *   context,
   *   16,
   *   'movement',
   *   'player-1'
   * );
   * if (action) applyAction(action);
   */
  execute(
    pairs: TriggerActionPair[],
    context: BattleContext,
    deltaTime: number,
    coreType: "movement" | "tactical",
    entityId: string,
    enemy?: EnemyState,
  ): ActionResult | null {
    // Filter to only the requested core type
    const corePairs = pairs.filter((p) => p.action.coreType === coreType);

    // Calculate lag cooldown multiplier if this is an enemy with lag status
    const lagMultiplier = enemy
      ? StatusEffectManager.getLagCooldownMultiplier(enemy)
      : 1.0;

    // Evaluate pairs in priority order
    for (const pair of corePairs) {
      const cooldownKey = `${entityId}-${pair.action.id}`;

      // Skip if action is on cooldown
      if (this.cooldowns.has(cooldownKey)) {
        continue;
      }

      // Check for lag-induced action failure
      if (enemy && enemy.lagStacks.length > 0) {
        const failureChance = enemy.lagStacks.reduce(
          (acc, s) => acc + s.actionFailureChance,
          0,
        );
        if (Math.random() < failureChance) {
          continue; // Action stutters and doesn't execute
        }
      }

      // Evaluate trigger
      if (pair.trigger.check(context)) {
        // Apply lag multiplier to cooldown and set it
        const adjustedCooldown = pair.action.cooldown * lagMultiplier;
        this.cooldowns.set(cooldownKey, adjustedCooldown);

        // Return the executed action
        return {
          ...pair.action.execute(context),
        };
      }
    }

    return null; // No triggers matched
  }

  /**
   * Updates all cooldown timers by subtracting deltaTime.
   *
   * Removes cooldowns that have expired (reached zero or below).
   * Called once per frame to ensure frame-rate-independent timing.
   *
   * @public
   * @param {number} deltaTime - Time elapsed since last frame (milliseconds)
   */
  public updateCooldowns(deltaTime: number): void {
    for (const [key, time] of this.cooldowns.entries()) {
      const newTime = time - deltaTime;
      if (newTime <= 0) {
        this.cooldowns.delete(key);
      } else {
        this.cooldowns.set(key, newTime);
      }
    }
  }
}
