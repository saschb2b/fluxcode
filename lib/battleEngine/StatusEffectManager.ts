import type { EnemyState } from "@/types/game";
import type { Projectile } from "@/types/game";

/**
 * Manages all status effect application, duration tracking, and cleanup.
 *
 * This singleton-style class centralizes all logic for status effects like burn,
 * viral infection, EMP disruption, lag, displacement, and corrosion. By centralizing
 * this logic, we ensure consistency and make it easy to balance or modify effects.
 *
 * @example
 * StatusEffectManager.tryApplyStatus(enemy, projectile, battleTime, true);
 * StatusEffectManager.cleanupExpiredEffects(enemy, battleTime);
 */
export class StatusEffectManager {
  /**
   * Configuration for each status effect type.
   * Defines stacking limits, durations, and specific parameters for each effect.
   *
   * @private
   */
  private static readonly STATUS_CONFIGS = {
    /** Burn: Damage over time from thermal damage */
    burn: { maxStacks: 5, duration: 4000, damagePerTick: 2 },

    /** Viral Infection: Amplifies all damage taken */
    viral: { maxStacks: 5, duration: 10000 },

    /** EMP: Disables shields and their regeneration */
    emp: { maxStacks: 5, duration: 5000, shieldDrainPercent: 0.08 },

    /** Lag: Increases cooldowns and causes action failures */
    lag: { maxStacks: 5, duration: 6000 },

    /** Displace: Pushes enemy back and corrupts movement */
    displace: { maxStacks: 3, duration: 5500, pushDistance: 1 },

    /** Corrosive: Permanently strips armor during battle */
    corrosive: { maxStacks: 999999, duration: 999999, armorStripPercent: 0.1 },
  };

  /**
   * Attempts to apply a status effect from a projectile to an enemy.
   *
   * Checks the projectile's status chance and damage type, then applies the
   * corresponding status effect if the chance succeeds. Respects the
   * `canApplyStatus` flag (for enemies immune to status effects).
   *
   * @param {EnemyState} enemy - The enemy that may receive the status effect
   * @param {Projectile} proj - The projectile carrying the status effect
   * @param {number} battleTime - Current battle time in milliseconds (for duration calculation)
   * @param {boolean} canApplyStatus - Whether status effects can be applied (false if enemy is immune)
   *
   * @example
   * StatusEffectManager.tryApplyStatus(enemy, projectile, 5000, true);
   */
  static tryApplyStatus(
    enemy: EnemyState,
    proj: Projectile,
    battleTime: number,
    canApplyStatus: boolean,
  ): void {
    if (
      !canApplyStatus ||
      !proj.statusChance ||
      Math.random() > proj.statusChance
    ) {
      return;
    }

    switch (proj.damageType) {
      case "thermal":
        this.applyBurn(enemy, battleTime);
        break;
      case "viral":
        this.applyViral(enemy, battleTime);
        break;
      case "energy":
        this.applyEMP(enemy, battleTime);
        break;
      case "glacial":
        this.applyLag(enemy, battleTime);
        break;
      case "concussion":
        this.applyDisplace(enemy, battleTime);
        break;
      case "corrosive":
        this.applyCorrosive(enemy, battleTime);
        break;
    }
  }

  /**
   * Applies the burn status effect to an enemy.
   *
   * Burn deals damage over time directly to HP, bypassing shields and armor.
   * Stacks up to a maximum, with each stack dealing damage independently.
   *
   * @private
   * @param {EnemyState} enemy - The enemy receiving the burn effect
   * @param {number} battleTime - Current battle time for calculating effect end time
   */
  private static applyBurn(enemy: EnemyState, battleTime: number): void {
    const config = this.STATUS_CONFIGS.burn;
    if (enemy.burnStacks.length < config.maxStacks) {
      enemy.burnStacks.push({
        damage: config.damagePerTick,
        endTime: battleTime + config.duration,
      });
    }
  }

  /**
   * Applies the viral infection status effect to an enemy.
   *
   * Viral infection amplifies all subsequent damage the enemy takes.
   * The amplification increases with each stack, up to 2x damage at max stacks.
   *
   * @private
   * @param {EnemyState} enemy - The enemy receiving the viral effect
   * @param {number} battleTime - Current battle time for calculating effect end time
   */
  private static applyViral(enemy: EnemyState, battleTime: number): void {
    const config = this.STATUS_CONFIGS.viral;
    if (enemy.viralStacks.length < config.maxStacks) {
      enemy.viralStacks.push({
        endTime: battleTime + config.duration,
      });
    }
  }

  /**
   * Applies the EMP (Electromagnetic Pulse) status effect to an enemy.
   *
   * EMP immediately drains a portion of current shields and disables
   * all shield regeneration for the duration. Multiple applications can stack.
   *
   * @private
   * @param {EnemyState} enemy - The enemy receiving the EMP effect
   * @param {number} battleTime - Current battle time for calculating effect end time
   */
  private static applyEMP(enemy: EnemyState, battleTime: number): void {
    const config = this.STATUS_CONFIGS.emp;
    if (enemy.empStacks.length < config.maxStacks) {
      if (enemy.shields > 0) {
        const drain = Math.floor(enemy.shields * config.shieldDrainPercent);
        enemy.shields = Math.max(0, enemy.shields - drain);
      }
      enemy.empStacks.push({
        endTime: battleTime + config.duration,
        shieldDrainPercent: config.shieldDrainPercent,
      });
    }
  }

  /**
   * Applies the lag status effect to an enemy.
   *
   * Lag increases cooldowns, reduces movement speed, and causes random action
   * failures. Multiple stacks compound these effects.
   *
   * @private
   * @param {EnemyState} enemy - The enemy receiving the lag effect
   * @param {number} battleTime - Current battle time for calculating effect end time
   */
  private static applyLag(enemy: EnemyState, battleTime: number): void {
    const config = this.STATUS_CONFIGS.lag;
    if (enemy.lagStacks.length < config.maxStacks) {
      enemy.lagStacks.push({
        endTime: battleTime + config.duration,
        cooldownIncrease: 0.15,
        movementReduction: 0.1,
        actionFailureChance: 0.05,
      });
    }
  }

  /**
   * Applies the displace status effect to an enemy.
   *
   * Displace pushes the enemy back one or more tiles and corrupts their
   * next movement action. Multiple applications can push further.
   *
   * @private
   * @param {EnemyState} enemy - The enemy receiving the displace effect
   * @param {number} battleTime - Current battle time for calculating effect end time
   */
  private static applyDisplace(enemy: EnemyState, battleTime: number): void {
    const config = this.STATUS_CONFIGS.displace;
    if (enemy.displaceStacks.length < config.maxStacks) {
      const pushDistance = enemy.displaceStacks.length >= 2 ? 2 : 1;
      const newX = Math.min(5, enemy.position.x + pushDistance);
      if (newX !== enemy.position.x) {
        enemy.position = { ...enemy.position, x: newX };
      }
      enemy.displaceStacks.push({
        endTime: battleTime + config.duration,
        pushDistance,
        corruptMovement: true,
      });
    }
  }

  /**
   * Applies the corrosive status effect to an enemy.
   *
   * Corrosive permanently strips armor during the battle. Each application
   * removes a percentage of the current armor value. Unlike other effects,
   * corrosive damage is permanent until the battle ends.
   *
   * @private
   * @param {EnemyState} enemy - The enemy receiving the corrosive effect
   * @param {number} battleTime - Current battle time for calculating effect end time
   */
  private static applyCorrosive(enemy: EnemyState, battleTime: number): void {
    const config = this.STATUS_CONFIGS.corrosive;
    if (enemy.armor > 0) {
      const armorStrip = Math.max(
        1,
        Math.floor(enemy.armor * config.armorStripPercent),
      );
      enemy.armor = Math.max(0, enemy.armor - armorStrip);
      enemy.corrosiveStacks.push({
        endTime: battleTime + config.duration,
        armorStripped: armorStrip,
      });
    }
  }

  /**
   * Removes all expired status effects from an enemy.
   *
   * Iterates through all status effect arrays and removes any effects
   * whose end time has passed. Also updates shield regeneration status.
   * Should be called once per battle tick.
   *
   * @param {EnemyState} enemy - The enemy whose effects to clean up
   * @param {number} battleTime - Current battle time for expiration comparison
   *
   * @example
   * StatusEffectManager.cleanupExpiredEffects(enemy, battleTime);
   */
  static cleanupExpiredEffects(enemy: EnemyState, battleTime: number): void {
    enemy.burnStacks = enemy.burnStacks.filter((s) => s.endTime > battleTime);
    enemy.viralStacks = enemy.viralStacks.filter((s) => s.endTime > battleTime);
    enemy.empStacks = enemy.empStacks.filter((s) => s.endTime > battleTime);
    enemy.lagStacks = enemy.lagStacks.filter((s) => s.endTime > battleTime);
    enemy.displaceStacks = enemy.displaceStacks.filter(
      (s) => s.endTime > battleTime,
    );
    enemy.corrosiveStacks = enemy.corrosiveStacks.filter(
      (s) => s.endTime > battleTime,
    );

    // Update shield regeneration status based on active EMP effects
    enemy.shieldRegenDisabled = enemy.empStacks.length > 0;
  }

  /**
   * Calculates the current viral damage amplification multiplier.
   *
   * Accumulates all viral infection stacks across all enemies and returns
   * the corresponding damage multiplier. The multiplier scales from 1.0x (no stacks)
   * to 2.0x (5 or more stacks).
   *
   * @param {EnemyState[]} enemies - All active enemies in the battle
   * @returns {number} The damage multiplier (e.g., 1.2 for 20% increased damage)
   *
   * @example
   * const multiplier = StatusEffectManager.getViralDamageMultiplier(enemies);
   * const amplifiedDamage = damage * multiplier;
   */
  static getViralDamageMultiplier(enemies: EnemyState[]): number {
    const stackCount = enemies.reduce(
      (sum, e) => sum + e.viralStacks.length,
      0,
    );
    const multipliers = [1.0, 1.2, 1.35, 1.5, 1.75, 2.0];
    return multipliers[Math.min(stackCount, 5)];
  }

  /**
   * Calculates the cooldown multiplier for an enemy with lag status effects.
   *
   * Each lag stack increases cooldowns by 15%. Multiple stacks compound.
   * Returns 1.0 for no lag effects.
   *
   * @param {EnemyState} enemy - The enemy whose lag multiplier to calculate
   * @returns {number} The cooldown multiplier (e.g., 1.3 for 30% slower actions)
   *
   * @example
   * const multiplier = StatusEffectManager.getLagCooldownMultiplier(enemy);
   * const adjustedCooldown = baseCooldown * multiplier;
   */
  static getLagCooldownMultiplier(enemy: EnemyState): number {
    return 1.0 + enemy.lagStacks.length * 0.15;
  }
}
