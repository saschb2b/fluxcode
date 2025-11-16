import { BASIC_ENEMIES } from "./basic-enemies.js"
import { ADVANCED_ENEMIES } from "./advanced-enemies.js"
import { ELITE_ENEMIES } from "./elite-enemies.js"
import { BOSS_ENEMIES } from "./boss-enemies.js"
import type { EnemyDefinition, EnemyEncounter } from "./enemy-types.js"

export * from "./enemy-types.js"
export * from "./basic-enemies.js"
export * from "./advanced-enemies.js"
export * from "./elite-enemies.js"
export * from "./boss-enemies.js"

// Combined enemy codex
export const ALL_ENEMIES: EnemyDefinition[] = [
  ...BASIC_ENEMIES,
  ...ADVANCED_ENEMIES,
  ...ELITE_ENEMIES,
  ...BOSS_ENEMIES
]

// Get enemy by ID
export function getEnemyById(id: string): EnemyDefinition | undefined {
  return ALL_ENEMIES.find(enemy => enemy.id === id)
}

// Get enemies by tier
export function getEnemiesByTier(tier: EnemyDefinition["tier"]): EnemyDefinition[] {
  return ALL_ENEMIES.filter(enemy => enemy.tier === tier)
}

// Get enemies by faction
export function getEnemiesByFaction(faction: EnemyDefinition["faction"]): EnemyDefinition[] {
  return ALL_ENEMIES.filter(enemy => enemy.faction === faction)
}

// Generate random encounter based on wave
export function generateEncounter(wave: number, isGuardianBattle: boolean = false): EnemyEncounter {
  if (isGuardianBattle) {
    // Guardian battles feature a boss
    const availableBosses = BOSS_ENEMIES.filter(boss => wave >= boss.minWave)
    const boss = availableBosses[Math.floor(Math.random() * availableBosses.length)] || BOSS_ENEMIES[0]
    
    return {
      enemies: [boss],
      isGuardianBattle: true,
      wave
    }
  }
  
  // Normal encounters - select appropriate enemies for wave
  const availableEnemies = ALL_ENEMIES.filter(
    enemy => enemy.spawnWeight > 0 && wave >= enemy.minWave
  )
  
  // Weight-based random selection
  const totalWeight = availableEnemies.reduce((sum, enemy) => sum + enemy.spawnWeight, 0)
  const roll = Math.random() * totalWeight
  
  let currentWeight = 0
  let selectedEnemy = availableEnemies[0]
  
  for (const enemy of availableEnemies) {
    currentWeight += enemy.spawnWeight
    if (roll <= currentWeight) {
      selectedEnemy = enemy
      break
    }
  }
  
  return {
    enemies: [selectedEnemy],
    isGuardianBattle: false,
    wave
  }
}
