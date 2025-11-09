import type { PlayerProgress } from "./meta-progression"

export type ChallengeType = "damage-type" | "trigger-usage" | "action-usage" | "survival" | "efficiency" | "combo"

export type ChallengeDifficulty = "standard" | "advanced" | "elite"

export interface NetworkContract {
  id: string
  name: string
  description: string
  type: ChallengeType
  difficulty: ChallengeDifficulty
  refreshType: "daily" | "weekly"

  // Requirements
  requirement: {
    type:
      | "damage-type-percent"
      | "use-trigger"
      | "use-action"
      | "win-without"
      | "defeat-guardian"
      | "win-streak"
      | "combo-count"
    value: number | string
    target?: number
  }

  // Rewards
  rewards: {
    cipherFragments: number
    cosmetic?: string // Future cosmetic rewards
  }

  // Tracking
  progress: number
  maxProgress: number
  completed: boolean
  expiresAt: number // Timestamp when contract expires
}

export interface NetworkContractWithClaimed extends NetworkContract {
  claimed?: boolean
}

export interface ContractProgress {
  dailyContracts: NetworkContractWithClaimed[]
  weeklyContracts: NetworkContractWithClaimed[]
  lastDailyRefresh: number
  lastWeeklyRefresh: number
  completedContractIds: string[] // Permanent record
}

// Contract templates for generation
const DAILY_CONTRACT_TEMPLATES = [
  {
    id: "daily-kinetic-focus",
    name: "Kinetic Protocol Optimization",
    description: "Complete 3 breaches while dealing 80%+ Kinetic damage in each",
    type: "damage-type" as ChallengeType,
    difficulty: "standard" as ChallengeDifficulty,
    requirement: { type: "damage-type-percent" as const, value: "kinetic", target: 3 },
    rewards: { cipherFragments: 250 },
  },
  {
    id: "daily-energy-focus",
    name: "Energy Weapon Directive",
    description: "Complete 3 breaches while dealing 80%+ Energy damage in each",
    type: "damage-type" as ChallengeType,
    difficulty: "standard" as ChallengeDifficulty,
    requirement: { type: "damage-type-percent" as const, value: "energy", target: 3 },
    rewards: { cipherFragments: 250 },
  },
  {
    id: "daily-thermal-focus",
    name: "Thermal Systems Test",
    description: "Complete 3 breaches while dealing 80%+ Thermal damage in each",
    type: "damage-type" as ChallengeType,
    difficulty: "standard" as ChallengeDifficulty,
    requirement: { type: "damage-type-percent" as const, value: "thermal", target: 3 },
    rewards: { cipherFragments: 250 },
  },
  {
    id: "daily-trigger-mastery",
    name: "Conditional Logic Training",
    description: "Complete a breach using only Low HP and Enemy Close triggers",
    type: "trigger-usage" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "use-trigger" as const, value: "low-hp,enemy-close", target: 1 },
    rewards: { cipherFragments: 200 },
  },
  {
    id: "daily-minimal-actions",
    name: "Resource Efficiency Protocol",
    description: "Defeat Layer 1 Guardian using 3 or fewer protocol pairs",
    type: "efficiency" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "max-pairs", target: 3 },
    rewards: { cipherFragments: 250 },
  },
  {
    id: "daily-survival-expert",
    name: "Damage Mitigation Test",
    description: "Complete any breach without taking more than 30 damage",
    type: "survival" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "max-damage-taken", target: 30 },
    rewards: { cipherFragments: 220 },
  },
  {
    id: "daily-combo-master",
    name: "Rapid Execution Protocol",
    description: "Execute 15 protocol pairs within 20 seconds in any breach",
    type: "combo" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "combo-count" as const, value: 15, target: 20 },
    rewards: { cipherFragments: 300 },
  },
  {
    id: "daily-perfect-defense",
    name: "Zero Damage Challenge",
    description: "Complete a wave without taking any damage",
    type: "survival" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "max-damage-taken", target: 0 },
    rewards: { cipherFragments: 350 },
  },
  {
    id: "daily-burst-damage",
    name: "High Burst Protocol",
    description: "Deal 40+ damage in a single protocol execution",
    type: "efficiency" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "single-hit", target: 40 },
    rewards: { cipherFragments: 220 },
  },
  {
    id: "daily-multi-trigger",
    name: "Adaptive Response Training",
    description: "Use 5 different triggers in a single successful breach",
    type: "trigger-usage" as ChallengeType,
    difficulty: "standard" as ChallengeDifficulty,
    requirement: { type: "use-trigger" as const, value: "unique-single-run", target: 5 },
    rewards: { cipherFragments: 180 },
  },
  {
    id: "daily-action-variety",
    name: "Multi-Action Execution",
    description: "Use 6 different actions in a single successful breach",
    type: "action-usage" as ChallengeType,
    difficulty: "standard" as ChallengeDifficulty,
    requirement: { type: "use-action" as const, value: "unique-single-run", target: 6 },
    rewards: { cipherFragments: 180 },
  },
  {
    id: "daily-layer-2-clear",
    name: "Deep Network Penetration",
    description: "Reach and clear wave 4 (Layer 2 Guardian) in a single breach",
    type: "efficiency" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "defeat-guardian" as const, value: "layer-2", target: 1 },
    rewards: { cipherFragments: 280 },
  },
  {
    id: "daily-flawless-layer-1",
    name: "Layer 1 Perfection",
    description: "Defeat Layer 1 Guardian while taking less than 20 damage",
    type: "survival" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "guardian-low-damage", target: 20 },
    rewards: { cipherFragments: 250 },
  },
  {
    id: "daily-protocol-spam",
    name: "Rapid Fire Systems",
    description: "Execute 30 protocol pairs in a single breach",
    type: "combo" as ChallengeType,
    difficulty: "standard" as ChallengeDifficulty,
    requirement: { type: "combo-count" as const, value: 30, target: 60 },
    rewards: { cipherFragments: 200 },
  },
  {
    id: "daily-efficient-clear",
    name: "Speed Run Protocol",
    description: "Clear wave 2 in under 30 seconds",
    type: "efficiency" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "time-limit", target: 30 },
    rewards: { cipherFragments: 320 },
  },
]

const WEEKLY_CONTRACT_TEMPLATES = [
  {
    id: "weekly-guardian-hunt",
    name: "Network Purge Directive",
    description: "Defeat 5 Layer Guardians using specialized damage protocols",
    type: "efficiency" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "defeat-guardian" as const, value: 5, target: 5 },
    rewards: { cipherFragments: 800 },
  },
  {
    id: "weekly-win-streak",
    name: "Domination Protocol",
    description: "Win 5 breaches in a row without extracting or failing",
    type: "efficiency" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "win-streak" as const, value: 5, target: 5 },
    rewards: { cipherFragments: 600 },
  },
  {
    id: "weekly-damage-specialist",
    name: "Multi-Vector Attack Training",
    description: "Complete breaches using 3 different damage type specializations (80%+ each)",
    type: "damage-type" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "damage-type-percent" as const, value: "multi", target: 3 },
    rewards: { cipherFragments: 700 },
  },
  {
    id: "weekly-trigger-diversity",
    name: "Adaptive Logic Challenge",
    description: "Use 10 different triggers in successful breaches throughout the week",
    type: "trigger-usage" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "use-trigger" as const, value: "unique", target: 10 },
    rewards: { cipherFragments: 550 },
  },
  {
    id: "weekly-deep-dive",
    name: "Core Network Infiltration",
    description: "Reach wave 6 or beyond in a single breach",
    type: "efficiency" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "reach-wave", target: 6 },
    rewards: { cipherFragments: 900 },
  },
  {
    id: "weekly-extraction-master",
    name: "Strategic Withdrawal Protocol",
    description: "Successfully extract from 3 breaches with 200+ cipher fragments earned",
    type: "efficiency" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "high-extraction", target: 3 },
    rewards: { cipherFragments: 650 },
  },
  {
    id: "weekly-total-damage",
    name: "Accumulated Firepower",
    description: "Deal 1000+ total damage across all breaches this week",
    type: "efficiency" as ChallengeType,
    difficulty: "advanced" as ChallengeDifficulty,
    requirement: { type: "win-without" as const, value: "cumulative-damage", target: 1000 },
    rewards: { cipherFragments: 700 },
  },
  {
    id: "weekly-protocol-master",
    name: "Complete Logic Chain",
    description: "Have 8 active protocol pairs configured and use all of them in a single breach",
    type: "combo" as ChallengeType,
    difficulty: "elite" as ChallengeDifficulty,
    requirement: { type: "combo-count" as const, value: 8, target: 8 },
    rewards: { cipherFragments: 850 },
  },
]

export function initializeContracts(): ContractProgress {
  const now = Date.now()
  return {
    dailyContracts: generateDailyContracts(now),
    weeklyContracts: generateWeeklyContracts(now),
    lastDailyRefresh: now,
    lastWeeklyRefresh: now,
    completedContractIds: [],
  }
}

export function generateDailyContracts(timestamp: number): NetworkContractWithClaimed[] {
  // Shuffle and select 6 random daily contracts
  const shuffled = [...DAILY_CONTRACT_TEMPLATES].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 6)

  const expiresAt = getNextDailyReset(timestamp)

  return selected.map((template) => ({
    ...template,
    refreshType: "daily" as const,
    progress: 0,
    maxProgress: template.requirement.target || 1,
    completed: false,
    expiresAt,
    claimed: false,
  }))
}

export function generateWeeklyContracts(timestamp: number): NetworkContractWithClaimed[] {
  // Shuffle and select 4 random weekly contracts
  const shuffled = [...WEEKLY_CONTRACT_TEMPLATES].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 4)

  const expiresAt = getNextWeeklyReset(timestamp)

  return selected.map((template) => ({
    ...template,
    refreshType: "weekly" as const,
    progress: 0,
    maxProgress: template.requirement.target || 1,
    completed: false,
    expiresAt,
    claimed: false,
  }))
}

export function getNextDailyReset(now: number): number {
  const tomorrow = new Date(now)
  tomorrow.setUTCHours(0, 0, 0, 0)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  return tomorrow.getTime()
}

export function getNextWeeklyReset(now: number): number {
  const nextMonday = new Date(now)
  nextMonday.setUTCHours(0, 0, 0, 0)
  const dayOfWeek = nextMonday.getUTCDay()
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7
  nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday)
  return nextMonday.getTime()
}

export function shouldRefreshContracts(contractProgress: ContractProgress): { daily: boolean; weekly: boolean } {
  const now = Date.now()
  return {
    daily: now >= getNextDailyReset(contractProgress.lastDailyRefresh),
    weekly: now >= getNextWeeklyReset(contractProgress.lastWeeklyRefresh),
  }
}

export function refreshContracts(contractProgress: ContractProgress): ContractProgress {
  const now = Date.now()
  const refresh = shouldRefreshContracts(contractProgress)

  return {
    ...contractProgress,
    dailyContracts: refresh.daily ? generateDailyContracts(now) : contractProgress.dailyContracts,
    weeklyContracts: refresh.weekly ? generateWeeklyContracts(now) : contractProgress.weeklyContracts,
    lastDailyRefresh: refresh.daily ? now : contractProgress.lastDailyRefresh,
    lastWeeklyRefresh: refresh.weekly ? now : contractProgress.lastWeeklyRefresh,
  }
}

export function checkContractProgress(
  contract: NetworkContractWithClaimed,
  runStats: {
    damageByType: Record<string, number>
    triggersUsed: string[]
    actionsUsed: string[]
    pairsCount: number
    guardianDefeated: boolean
    damageTaken: number
    pairExecutions: Array<{ triggerId: string; actionId: string; timestamp: number }>
  },
): { progress: number; completed: boolean } {
  let progress = contract.progress

  console.log("[v0] Checking contract:", contract.name, "current progress:", progress)

  switch (contract.requirement.type) {
    case "damage-type-percent": {
      const damageType = contract.requirement.value as string
      const requiredBreaches = contract.requirement.target || 3
      const targetPercent = 80

      const totalDamage = Object.values(runStats.damageByType).reduce((sum, val) => sum + val, 0)
      const typeDamage = runStats.damageByType[damageType] || 0
      const percent = totalDamage > 0 ? (typeDamage / totalDamage) * 100 : 0

      console.log(
        "[v0] Damage type check - type:",
        damageType,
        "percent:",
        percent,
        "target:",
        targetPercent,
        "breaches:",
        progress,
        "/",
        requiredBreaches,
      )

      if (percent >= targetPercent) {
        progress = Math.min(progress + 1, requiredBreaches)
      }
      break
    }

    case "use-trigger": {
      const requiredTriggers = (contract.requirement.value as string).split(",")
      const hasAllTriggers = requiredTriggers.every((t) => runStats.triggersUsed.includes(t))

      console.log(
        "[v0] Trigger check - required:",
        requiredTriggers,
        "used:",
        runStats.triggersUsed,
        "has all:",
        hasAllTriggers,
      )

      if (hasAllTriggers) {
        progress = contract.maxProgress
      }
      break
    }

    case "use-action": {
      const requiredActions = (contract.requirement.value as string).split(",")
      const hasAllActions = requiredActions.every((a) => runStats.actionsUsed.includes(a))

      console.log(
        "[v0] Action check - required:",
        requiredActions,
        "used:",
        runStats.actionsUsed,
        "has all:",
        hasAllActions,
      )

      if (hasAllActions) {
        progress = contract.maxProgress
      }
      break
    }

    case "defeat-guardian": {
      console.log("[v0] Guardian check - defeated:", runStats.guardianDefeated, "current progress:", progress)

      if (runStats.guardianDefeated) {
        progress = Math.min(progress + 1, contract.maxProgress)
      }
      break
    }

    case "win-without": {
      const constraint = contract.requirement.value as string

      console.log("[v0] Win-without check - constraint:", constraint, "target:", contract.requirement.target)

      if (constraint === "max-pairs" && runStats.pairsCount <= (contract.requirement.target || 3)) {
        progress = contract.maxProgress
      } else if (constraint === "max-damage-taken" && runStats.damageTaken <= (contract.requirement.target || 30)) {
        progress = contract.maxProgress
      } else if (
        constraint === "guardian-low-damage" &&
        runStats.guardianDefeated &&
        runStats.damageTaken < (contract.requirement.target || 20)
      ) {
        progress = contract.maxProgress
      } else if (constraint === "reach-wave" && runStats.pairsCount >= (contract.requirement.target || 6)) {
        progress = contract.maxProgress
      } else if (constraint === "time-limit" && runStats.pairsCount < (contract.requirement.target || 30)) {
        progress = contract.maxProgress
      } else if (constraint === "cumulative-damage") {
        const totalDamage = Object.values(runStats.damageByType).reduce((sum, val) => sum + val, 0)
        progress = Math.min(progress + totalDamage, contract.maxProgress)

        console.log(
          "[v0] Cumulative damage - run damage:",
          totalDamage,
          "new progress:",
          progress,
          "target:",
          contract.maxProgress,
        )
      }
      break
    }

    case "combo-count": {
      const targetCount = contract.requirement.value as number
      const timeWindow = (contract.requirement.target || 20) * 1000 // Convert to ms

      console.log(
        "[v0] Combo check - target count:",
        targetCount,
        "time window:",
        timeWindow,
        "executions:",
        runStats.pairExecutions.length,
      )

      for (let i = 0; i <= runStats.pairExecutions.length - targetCount; i++) {
        const windowStart = runStats.pairExecutions[i].timestamp
        const windowEnd = runStats.pairExecutions[i + targetCount - 1]?.timestamp

        if (windowEnd && windowEnd - windowStart <= timeWindow) {
          progress = contract.maxProgress
          console.log("[v0] Combo achieved!")
          break
        }
      }
      break
    }
  }

  console.log("[v0] Contract check result - progress:", progress, "completed:", progress >= contract.maxProgress)

  return {
    progress,
    completed: progress >= contract.maxProgress,
  }
}

export function claimContractReward(
  contractId: string,
  refreshType: "daily" | "weekly",
  contractProgress: ContractProgress,
  playerProgress: PlayerProgress,
): { contractProgress: ContractProgress; playerProgress: PlayerProgress } {
  console.log("[v0] claimContractReward called - contractId:", contractId, "refreshType:", refreshType)

  const contracts = refreshType === "daily" ? contractProgress.dailyContracts : contractProgress.weeklyContracts
  const contractIndex = contracts.findIndex((c) => c.id === contractId)

  console.log("[v0] Found contract at index:", contractIndex)

  if (contractIndex === -1) {
    console.log("[v0] Contract not found!")
    return { contractProgress, playerProgress }
  }

  const contract = contracts[contractIndex]
  console.log("[v0] Contract details:", {
    name: contract.name,
    progress: contract.progress,
    maxProgress: contract.maxProgress,
    completed: contract.completed,
    claimed: contract.claimed,
  })

  if (contract.progress < contract.maxProgress) {
    console.log("[v0] Contract not completed yet!")
    return { contractProgress, playerProgress }
  }

  if (contract.claimed === true) {
    console.log("[v0] Contract already claimed!")
    return { contractProgress, playerProgress }
  }

  console.log("[v0] Claiming contract reward:", contract.rewards.cipherFragments, "CF")

  const updatedPlayerProgress = {
    ...playerProgress,
    cipherFragments: playerProgress.cipherFragments + contract.rewards.cipherFragments,
  }

  const updatedContracts = [...contracts]
  updatedContracts[contractIndex] = {
    ...updatedContracts[contractIndex],
    claimed: true,
    completed: true,
  }

  const updatedContractProgress = {
    ...contractProgress,
    completedContractIds: [...contractProgress.completedContractIds, contractId],
    ...(refreshType === "daily" ? { dailyContracts: updatedContracts } : { weeklyContracts: updatedContracts }),
  }

  console.log("[v0] Claim successful! New CF total:", updatedPlayerProgress.cipherFragments)
  console.log("[v0] Updated completed IDs:", updatedContractProgress.completedContractIds)

  return {
    contractProgress: updatedContractProgress,
    playerProgress: updatedPlayerProgress,
  }
}

export function forceRefreshContracts(contractProgress: ContractProgress): ContractProgress {
  const now = Date.now()
  return {
    ...contractProgress,
    dailyContracts: generateDailyContracts(now),
    weeklyContracts: generateWeeklyContracts(now),
    lastDailyRefresh: now,
    lastWeeklyRefresh: now,
  }
}

export function cleanupContractProgress(contractProgress: ContractProgress): ContractProgress {
  const cleanedDailies = contractProgress.dailyContracts.map((contract) => {
    if (contractProgress.completedContractIds.includes(contract.id)) {
      return { ...contract, claimed: true, completed: true }
    }
    return contract
  })

  const cleanedWeeklies = contractProgress.weeklyContracts.map((contract) => {
    if (contractProgress.completedContractIds.includes(contract.id)) {
      return { ...contract, claimed: true, completed: true }
    }
    return contract
  })

  return {
    ...contractProgress,
    dailyContracts: cleanedDailies,
    weeklyContracts: cleanedWeeklies,
  }
}
