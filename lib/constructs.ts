import type { Construct } from "@/types/game"

/**
 * Constructs are specialized combat frames that provide base stats and protocol slot configurations.
 * Unlike presets, Constructs come "naked" - they have no pre-programmed protocols.
 * Players must assign their own tactical and movement protocols within the slot limits.
 */

export const AVAILABLE_CONSTRUCTS: Construct[] = [
  {
    id: "vanguard",
    name: "VANGUARD CONSTRUCT",
    description: "Balanced defense platform",
    lore: "Military-grade assault construct designed for frontline operations. Equal focus on positioning and tactical execution.",
    color: "#00d4ff",
    baseHp: 120,
    baseShields: 30,
    baseArmor: 20,
    maxMovementSlots: 4,
    maxTacticalSlots: 4,
    passiveAbility: {
      name: "Fortified Core",
      description: "Reduced damage taken",
      effect: "defense",
      value: 0.05, // 5% damage reduction
    },
    resistances: {
      kinetic: 0.1,
    },
  },
  {
    id: "specter",
    name: "SPECTER CONSTRUCT",
    description: "High-mobility evasion frame",
    lore: "Lightweight reconnaissance construct built for rapid repositioning and adaptive maneuvers.",
    color: "#a855f7",
    baseHp: 90,
    baseShields: 40,
    baseArmor: 10,
    maxMovementSlots: 6,
    maxTacticalSlots: 4,
    passiveAbility: {
      name: "Phase Drift",
      description: "Chance to evade attacks",
      effect: "evasion_boost",
      value: 0.1, // 10% evasion
    },
    resistances: {},
  },
  {
    id: "breacher",
    name: "BREACHER CONSTRUCT",
    description: "Heavy offensive platform",
    lore: "Aggressive strike construct engineered for overwhelming firepower and tactical versatility.",
    color: "#ef4444",
    baseHp: 100,
    baseShields: 20,
    baseArmor: 15,
    maxMovementSlots: 3,
    maxTacticalSlots: 6,
    passiveAbility: {
      name: "Overcharge",
      description: "Increased damage output",
      effect: "damage_boost",
      value: 0.1, // 10% damage increase
    },
    resistances: {
      thermal: 0.15,
    },
  },
]

export function getConstructById(id: string): Construct | undefined {
  return AVAILABLE_CONSTRUCTS.find((c) => c.id === id)
}

/**
 * Check if a construct is unlocked for the player
 * For now, all starter constructs are unlocked by default
 */
export function isConstructUnlocked(constructId: string): boolean {
  // All starter constructs are unlocked
  const starterIds = ["vanguard", "specter", "breacher"]
  return starterIds.includes(constructId)
}
