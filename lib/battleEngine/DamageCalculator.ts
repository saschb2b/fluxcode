import type { DamageType, EnemyState } from "@/types/game";
import { ElementalModifier } from "./ElementalModifier";

/**
 * Represents the breakdown of damage applied to a target.
 * Tracks how much damage was absorbed by shields, reduced by armor, etc.
 */
export interface DamageResult {
  /** Total damage calculated before any defense reduction */
  totalDamage: number;
  /** Amount of damage absorbed by shields */
  shieldDamage: number;
  /** Amount of damage reduced by armor */
  armorReduction: number;
  /** Amount of damage applied to HP after all reductions */
  hpDamage: number;
}

/**
 * Handles all damage calculation and application logic.
 *
 * This class encapsulates the complex rules for how damage interacts with
 * defense layers (shields, armor), elemental modifiers, and status effects.
 * By centralizing this logic, we ensure consistency and make balancing easier.
 *
 * The damage flow is: Base Damage → Elemental Modifiers → Shields → Armor → HP
 *
 * @example
 * const damage = DamageCalculator.calculateDamage(100, 'energy', 50, 0);
 * const result = DamageCalculator.applyDamageToEnemy(enemy, damage);
 */
export class DamageCalculator {
  /**
   * Scaling constant for armor damage reduction calculation.
   * Determines how much armor is needed to reach 50% damage reduction.
   *
   * Formula: reduction = armor / (armor + CONSTANT)
   * With CONSTANT=300, 300 armor = 50% reduction, 900 armor = 75% reduction
   *
   * @private
   */
  private static readonly ARMOR_SCALING_CONSTANT = 300;

  /**
   * Calculates final damage after applying elemental modifiers.
   *
   * Takes base damage and applies multipliers based on the damage type
   * and the target's current defensive layers (shields vs. armor).
   * Shields are prioritized in the calculation.
   *
   * @param {number} baseDamage - The unmodified damage value
   * @param {string} damageType - The type of damage (e.g., 'energy', 'thermal')
   * @param {number} targetShields - Current shield points on target
   * @param {number} targetArmor - Current armor value on target
   * @returns {DamageResult} Breakdown of calculated damage
   *
   * @example
   * const result = DamageCalculator.calculateDamage(100, 'energy', 50, 20);
   * console.log(result.totalDamage); // 200 (100 * 2.0 energy vs shields)
   */
  static calculateDamage(
    baseDamage: number,
    damageType: DamageType,
    targetShields: number,
    targetArmor: number,
  ): DamageResult {
    let damage = baseDamage;
    const modifiers = ElementalModifier.getModifiers(damageType);

    // Apply elemental modifiers based on which defense layer is active
    if (targetShields > 0) {
      damage *= modifiers.shieldBonus;
    } else if (targetArmor > 0) {
      damage *= modifiers.armorBonus;
    }

    return {
      totalDamage: damage,
      shieldDamage: 0,
      armorReduction: 0,
      hpDamage: damage,
    };
  }

  /**
   * Applies calculated damage to an enemy, respecting all defense layers.
   *
   * The damage application follows this priority:
   * 1. Shields absorb damage first (up to their current value)
   * 2. Remaining damage is reduced by armor percentage
   * 3. Final remainder is applied to HP
   *
   * Modifies the enemy object directly (shields, armor, hp properties).
   *
   * @param {EnemyState} enemy - The enemy receiving damage (will be modified)
   * @param {number} damage - The calculated damage to apply
   * @returns {object} Object with `shieldDamage` and `hpDamage` properties showing distribution
   *
   * @example
   * const result = DamageCalculator.applyDamageToEnemy(enemy, 150);
   * console.log(result.shieldDamage); // 50 (shields absorbed first)
   * console.log(result.hpDamage);     // 75 (remaining after armor reduction)
   */
  static applyDamageToEnemy(
    enemy: EnemyState,
    damage: number,
  ): { shieldDamage: number; hpDamage: number } {
    const result = { shieldDamage: 0, hpDamage: 0 };
    let remainingDamage = damage;

    // Step 1: Shields absorb damage first
    if (enemy.shields > 0) {
      const shieldDamage = Math.min(enemy.shields, remainingDamage);
      enemy.shields = Math.max(0, enemy.shields - shieldDamage);
      result.shieldDamage = shieldDamage;
      remainingDamage -= shieldDamage;
    }

    // Step 2: Armor reduces remaining damage
    if (remainingDamage > 0 && enemy.armor > 0) {
      const armorReduction =
        enemy.armor / (enemy.armor + this.ARMOR_SCALING_CONSTANT);
      remainingDamage = remainingDamage * (1 - armorReduction);
    }

    // Step 3: HP takes remaining damage
    if (remainingDamage > 0) {
      enemy.hp = Math.max(0, enemy.hp - remainingDamage);
      result.hpDamage = remainingDamage;
    }

    return result;
  }

  /**
   * Applies burn damage to an enemy over time.
   *
   * Calculates total burn damage from all active burn stacks and applies it
   * directly to the enemy's HP. Burn damage bypasses shields and armor.
   *
   * @param {EnemyState} enemy - The enemy taking burn damage (will be modified)
   * @returns {number} Total burn damage dealt
   *
   * @example
   * const burnDamage = DamageCalculator.applyBurnDamage(enemy);
   * console.log(burnDamage); // 6 (3 stacks * 2 damage each)
   */
  static applyBurnDamage(enemy: EnemyState): number {
    if (enemy.burnStacks.length === 0) return 0;

    let totalDamage = 0;
    enemy.burnStacks.forEach((stack) => {
      totalDamage += stack.damage;
    });

    enemy.hp = Math.max(0, enemy.hp - totalDamage);
    return totalDamage;
  }
}
