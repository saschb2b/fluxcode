import type { DamageType } from "@/types/game";

/**
 * Represents the damage modifiers for a specific elemental damage type.
 * Each modifier affects damage based on the target's defensive layer.
 */
export interface ElementalModifiers {
  /** Damage multiplier when target has shields */
  shieldBonus: number;
  /** Damage multiplier when target has armor */
  armorBonus: number;
  /** Damage multiplier when target has exposed HP */
  hpBonus: number;
  /** Base chance (0-1) for the status effect to apply on hit */
  statusProcChance: number;
}

/**
 * Manages elemental damage types and their modifiers.
 *
 * Encapsulates all logic related to how different damage types interact with
 * various defense layers (shields, armor, HP). This prevents damage calculation
 * logic from being scattered throughout the codebase.
 *
 * @example
 * const modifiers = ElementalModifier.getModifiers('energy');
 * const damage = ElementalModifier.calculateModifiedDamage(100, 'energy', 50, 0);
 */
export class ElementalModifier {
  /**
   * Lookup table for all elemental damage modifiers.
   * Defines how each damage type interacts with different defense layers.
   *
   * @private
   */
  private static readonly MODIFIERS: Record<DamageType, ElementalModifiers> = {
    /** Standard ballistic damage. Baseline for all modifiers. */
    kinetic: {
      shieldBonus: 1.0,
      armorBonus: 1.0,
      hpBonus: 1.0,
      statusProcChance: 0,
    },

    /** Plasma and directed energy. Excellent vs shields, weak vs armor. */
    energy: {
      shieldBonus: 2.0,
      armorBonus: 0.5,
      hpBonus: 1.0,
      statusProcChance: 0.15,
    },

    /** Heat and thermal damage. Good proc chance for burn status. */
    thermal: {
      shieldBonus: 0.9,
      armorBonus: 1.0,
      hpBonus: 1.0,
      statusProcChance: 0.2,
    },

    /** Malware and corruption. High proc chance for viral infection. */
    viral: {
      shieldBonus: 1.0,
      armorBonus: 0.8,
      hpBonus: 1.0,
      statusProcChance: 0.15,
    },

    /** Cryogenic slowing. Weak against both defenses but reliable proc. */
    glacial: {
      shieldBonus: 0.9,
      armorBonus: 1.0,
      hpBonus: 1.0,
      statusProcChance: 0.18,
    },

    /** Acidic degradation. Excellent vs armor, weak vs shields. */
    corrosive: {
      shieldBonus: 0.8,
      armorBonus: 0.5,
      hpBonus: 1.0,
      statusProcChance: 0.25,
    },

    /** Concussive impact. Excellent vs exposed HP, weak vs defenses. */
    concussion: {
      shieldBonus: 0.9,
      armorBonus: 1.0,
      hpBonus: 1.25,
      statusProcChance: 0.2,
    },
  };

  /**
   * Retrieves the damage modifiers for a given elemental type.
   *
   * @param {DamageType} damageType - The type of elemental damage to look up
   * @returns {ElementalModifiers} A copy of the modifiers for the damage type
   *
   * @example
   * const modifiers = ElementalModifier.getModifiers('thermal');
   * console.log(modifiers.statusProcChance); // 0.2
   */
  static getModifiers(damageType: DamageType): ElementalModifiers {
    return { ...this.MODIFIERS[damageType] };
  }

  /**
   * Calculates final damage based on elemental type and target defenses.
   *
   * Applies elemental modifiers to base damage depending on what defenses
   * the target currently has active. Shields take priority, then armor.
   *
   * @param {number} baseDamage - The unmodified damage value
   * @param {DamageType} damageType - The type of damage being dealt
   * @param {number} targetShields - Current shield points on target (>0 if active)
   * @param {number} targetArmor - Current armor value on target (>0 if active)
   * @returns {number} The final damage value after elemental modifiers are applied
   *
   * @example
   * const damage = ElementalModifier.calculateModifiedDamage(100, 'energy', 50, 0);
   * // Returns 200 (100 * 2.0 shield bonus)
   */
  static calculateModifiedDamage(
    baseDamage: number,
    damageType: DamageType,
    targetShields: number,
    targetArmor: number,
  ): number {
    const modifiers = this.getModifiers(damageType);
    let damage = baseDamage;

    if (targetShields > 0) {
      damage *= modifiers.shieldBonus;
    } else if (targetArmor > 0) {
      damage *= modifiers.armorBonus;
    }

    return damage;
  }
}
