import type { Position, DamageType, TriggerActionPair, FighterCustomization } from "@/types/game"

export interface EnemyStats {
  baseHp: number
  baseShields: number
  baseArmor: number
  // Resistances to damage types
  resistances?: Partial<Record<DamageType, number>>
  // Status immunity flags
  immuneToStatus?: boolean
}

export interface EnemyDefinition {
  id: string
  name: string
  title: string
  faction: "corrupted-network" | "rogue-ai" | "sentinel" | "void-anomaly" | "guardian"
  tier: "basic" | "advanced" | "elite" | "boss"
  classification: string // e.g., "Infantry", "Heavy", "Support", "Commander"
  lore: string
  appearance: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    glowColor: string
  }
  stats: EnemyStats
  protocols: TriggerActionPair[] // AI behavior protocols
  spawnWeight: number // Higher = more common (0 = never spawns randomly, boss only)
  minWave: number // Minimum wave before spawning
  
  // 3D Rendering function - returns customization for fighter display
  render: () => FighterCustomization
}

export interface EnemyEncounter {
  enemies: EnemyDefinition[]
  isGuardianBattle: boolean
  wave: number
}
