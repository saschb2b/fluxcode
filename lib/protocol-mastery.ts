export interface ProtocolMastery {
  id: string
  name: string
  description: string
  category: "combo" | "efficiency" | "specialization" | "adaptive"
  requirement: {
    type:
      | "use_trigger_count"
      | "use_action_count"
      | "trigger_action_combo"
      | "defeat_with_damage_type"
      | "defeat_low_hp"
      | "defeat_fast"
      | "use_specific_pairs"
    targetId?: string // trigger or action ID
    targetIds?: string[] // for combos
    count?: number
    damageType?: string
    timeLimit?: number // seconds
    hpThreshold?: number // percentage
  }
  reward: {
    cipherFragmentBonus: number // flat bonus
    cipherFragmentMultiplier?: number // percentage bonus on run completion
  }
  iconColor: string
}

export interface PlayerMasteryProgress {
  completedMasteries: string[] // mastery IDs
  inProgressMasteries: Record<
    string,
    {
      currentCount: number
      lastUpdated: number
    }
  >
  currentRunStats: {
    triggerUsage: Record<string, number> // trigger ID -> count
    actionUsage: Record<string, number> // action ID -> count
    damageByType: Record<string, number> // damage type -> total damage
    pairExecutions: Array<{ triggerId: string; actionId: string; timestamp: number }>
  }
}

export const PROTOCOL_MASTERIES: ProtocolMastery[] = [
  // Beginner Masteries - Easy to complete, low rewards
  {
    id: "first_combo",
    name: "Logic Initiate",
    description: "Execute any trigger-action pair 5 times in a single run",
    category: "combo",
    requirement: {
      type: "use_trigger_count",
      count: 5,
    },
    reward: {
      cipherFragmentBonus: 15,
    },
    iconColor: "#3b82f6",
  },
  {
    id: "trigger_master_basic",
    name: "Trigger Enthusiast",
    description: "Use 3 different triggers in a single run",
    category: "efficiency",
    requirement: {
      type: "use_trigger_count",
      count: 3,
    },
    reward: {
      cipherFragmentBonus: 20,
    },
    iconColor: "#8b5cf6",
  },
  {
    id: "action_master_basic",
    name: "Action Specialist",
    description: "Use 3 different actions in a single run",
    category: "efficiency",
    requirement: {
      type: "use_action_count",
      count: 3,
    },
    reward: {
      cipherFragmentBonus: 20,
    },
    iconColor: "#ec4899",
  },

  // Intermediate Masteries - Require some planning
  {
    id: "kinetic_specialist",
    name: "Ballistic Expert",
    description: "Defeat a Layer Guardian using primarily Kinetic damage (70%+ of total damage)",
    category: "specialization",
    requirement: {
      type: "defeat_with_damage_type",
      damageType: "kinetic",
      count: 70, // percentage
    },
    reward: {
      cipherFragmentBonus: 50,
      cipherFragmentMultiplier: 0.1, // +10% CF on completion
    },
    iconColor: "#fbbf24",
  },
  {
    id: "energy_specialist",
    name: "Energy Conduit",
    description: "Defeat a Layer Guardian using primarily Energy damage (70%+ of total damage)",
    category: "specialization",
    requirement: {
      type: "defeat_with_damage_type",
      damageType: "energy",
      count: 70,
    },
    reward: {
      cipherFragmentBonus: 50,
      cipherFragmentMultiplier: 0.1,
    },
    iconColor: "#3b82f6",
  },
  {
    id: "thermal_specialist",
    name: "Pyrotechnician",
    description: "Defeat a Layer Guardian using primarily Thermal damage (70%+ of total damage)",
    category: "specialization",
    requirement: {
      type: "defeat_with_damage_type",
      damageType: "thermal",
      count: 70,
    },
    reward: {
      cipherFragmentBonus: 50,
      cipherFragmentMultiplier: 0.1,
    },
    iconColor: "#ef4444",
  },
  {
    id: "corrosive_specialist",
    name: "Acid Master",
    description: "Defeat a Layer Guardian using primarily Corrosive damage (70%+ of total damage)",
    category: "specialization",
    requirement: {
      type: "defeat_with_damage_type",
      damageType: "corrosive",
      count: 70,
    },
    reward: {
      cipherFragmentBonus: 50,
      cipherFragmentMultiplier: 0.1,
    },
    iconColor: "#84cc16",
  },
  {
    id: "viral_specialist",
    name: "Bio-Weapon Expert",
    description: "Defeat a Layer Guardian using primarily Viral damage (70%+ of total damage)",
    category: "specialization",
    requirement: {
      type: "defeat_with_damage_type",
      damageType: "viral",
      count: 70,
    },
    reward: {
      cipherFragmentBonus: 50,
      cipherFragmentMultiplier: 0.1,
    },
    iconColor: "#22c55e",
  },

  // Advanced Masteries - Require careful optimization
  {
    id: "perfect_defense",
    name: "Flawless Execution",
    description: "Defeat a Layer Guardian with 90%+ HP remaining",
    category: "efficiency",
    requirement: {
      type: "defeat_low_hp",
      hpThreshold: 90,
    },
    reward: {
      cipherFragmentBonus: 100,
      cipherFragmentMultiplier: 0.15,
    },
    iconColor: "#10b981",
  },
  {
    id: "speed_demon",
    name: "Rapid Breach",
    description: "Defeat a Layer Guardian in under 20 seconds",
    category: "efficiency",
    requirement: {
      type: "defeat_fast",
      timeLimit: 20,
    },
    reward: {
      cipherFragmentBonus: 80,
      cipherFragmentMultiplier: 0.12,
    },
    iconColor: "#f59e0b",
  },
  {
    id: "adaptive_logic",
    name: "Adaptive Protocols",
    description: "Use at least 5 different trigger-action combinations in a single run",
    category: "adaptive",
    requirement: {
      type: "use_specific_pairs",
      count: 5,
    },
    reward: {
      cipherFragmentBonus: 75,
      cipherFragmentMultiplier: 0.15,
    },
    iconColor: "#8b5cf6",
  },
  {
    id: "master_programmer",
    name: "Master Programmer",
    description: "Complete a run using 6+ active trigger-action pairs",
    category: "combo",
    requirement: {
      type: "use_specific_pairs",
      count: 6,
    },
    reward: {
      cipherFragmentBonus: 120,
      cipherFragmentMultiplier: 0.2,
    },
    iconColor: "#06b6d4",
  },

  // Elite Masteries - Very challenging
  {
    id: "glass_cannon",
    name: "Glass Cannon",
    description: "Defeat a Layer Guardian with less than 20% HP remaining",
    category: "efficiency",
    requirement: {
      type: "defeat_low_hp",
      hpThreshold: 20,
    },
    reward: {
      cipherFragmentBonus: 150,
      cipherFragmentMultiplier: 0.25,
    },
    iconColor: "#dc2626",
  },
  {
    id: "multi_type_master",
    name: "Omni-Specialist",
    description: "Deal significant damage with 4+ different damage types in a single run",
    category: "adaptive",
    requirement: {
      type: "defeat_with_damage_type",
      count: 4, // 4 different types
    },
    reward: {
      cipherFragmentBonus: 200,
      cipherFragmentMultiplier: 0.3,
    },
    iconColor: "#a855f7",
  },
]

export function checkMasteryCompletion(
  mastery: ProtocolMastery,
  runStats: PlayerMasteryProgress["currentRunStats"],
  battleStats: {
    playerHpPercent: number
    battleDuration: number // seconds
    isGuardianBattle: boolean
    activePairCount: number
  },
): boolean {
  const { requirement } = mastery

  switch (requirement.type) {
    case "use_trigger_count": {
      const totalTriggerUsage = Object.values(runStats.triggerUsage).reduce((sum, count) => sum + count, 0)
      const uniqueTriggers = Object.keys(runStats.triggerUsage).length
      return requirement.count ? totalTriggerUsage >= requirement.count || uniqueTriggers >= requirement.count : false
    }

    case "use_action_count": {
      const totalActionUsage = Object.values(runStats.actionUsage).reduce((sum, count) => sum + count, 0)
      const uniqueActions = Object.keys(runStats.actionUsage).length
      return requirement.count ? totalActionUsage >= requirement.count || uniqueActions >= requirement.count : false
    }

    case "defeat_with_damage_type": {
      if (!battleStats.isGuardianBattle) return false

      const totalDamage = Object.values(runStats.damageByType).reduce((sum, dmg) => sum + dmg, 0)
      if (totalDamage === 0) return false

      if (requirement.damageType && requirement.count) {
        // Single damage type specialization
        const typeDamage = runStats.damageByType[requirement.damageType] || 0
        const percentage = (typeDamage / totalDamage) * 100
        return percentage >= requirement.count
      } else if (requirement.count) {
        // Multi-type (count = number of different types needed)
        const typesUsed = Object.values(runStats.damageByType).filter((dmg) => dmg > totalDamage * 0.1).length
        return typesUsed >= requirement.count
      }
      return false
    }

    case "defeat_low_hp": {
      if (!battleStats.isGuardianBattle) return false
      if (!requirement.hpThreshold) return false

      // Glass cannon: less than threshold
      if (mastery.id === "glass_cannon") {
        return battleStats.playerHpPercent <= requirement.hpThreshold
      }
      // Perfect defense: more than threshold
      return battleStats.playerHpPercent >= requirement.hpThreshold
    }

    case "defeat_fast": {
      if (!battleStats.isGuardianBattle) return false
      return requirement.timeLimit ? battleStats.battleDuration <= requirement.timeLimit : false
    }

    case "use_specific_pairs": {
      // Count unique trigger-action combinations
      const uniquePairs = new Set(runStats.pairExecutions.map((p) => `${p.triggerId}:${p.actionId}`)).size
      return requirement.count ? uniquePairs >= requirement.count : false
    }

    case "trigger_action_combo": {
      // Check if specific trigger-action combo was used
      if (!requirement.targetIds || requirement.targetIds.length < 2) return false
      return runStats.pairExecutions.some(
        (p) => p.triggerId === requirement.targetIds![0] && p.actionId === requirement.targetIds![1],
      )
    }

    default:
      return false
  }
}

export function calculateMasteryRewards(
  completedMasteries: string[],
  baseCipherFragments: number,
): { bonusFragments: number; totalFragments: number; newMasteries: ProtocolMastery[] } {
  let bonusFragments = 0
  let multiplier = 1.0
  const newMasteries: ProtocolMastery[] = []

  for (const masteryId of completedMasteries) {
    const mastery = PROTOCOL_MASTERIES.find((m) => m.id === masteryId)
    if (mastery) {
      bonusFragments += mastery.reward.cipherFragmentBonus
      if (mastery.reward.cipherFragmentMultiplier) {
        multiplier += mastery.reward.cipherFragmentMultiplier
      }
      newMasteries.push(mastery)
    }
  }

  const totalFragments = Math.floor(baseCipherFragments * multiplier) + bonusFragments

  return { bonusFragments, totalFragments, newMasteries }
}
