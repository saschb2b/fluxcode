import type { ContractProgress } from "./network-contracts"
import type { FighterCustomization } from "@/lib/fighter-parts"

export interface MetaUpgrade {
  id: string
  name: string
  description: string
  category: "stat" | "action" | "trigger" | "unlock"
  cost: number
  maxLevel: number
  effect: {
    type:
      | "hp"
      | "damage"
      | "cooldown"
      | "evasion"
      | "crit_chance"
      | "crit_damage"
      | "defense"
      | "lifesteal"
      | "unlock_action"
      | "unlock_trigger"
      | "kinetic_damage"
      | "energy_damage"
      | "thermal_damage"
      | "viral_damage"
      | "corrosive_damage"
      | "explosive_damage"
      | "glacial_damage"
      | "status_chance"
      | "status_duration"
      | "shield_capacity"
      | "shield_regen"
      | "armor_rating"
    value: number
    actionId?: string
    triggerId?: string
  }
}

export interface PlayerProgress {
  cipherFragments: number // Renamed from currency to cipherFragments
  upgrades: Record<string, number> // upgrade id -> level
  unlockedActions: string[]
  unlockedTriggers: string[]
  totalNodesCompleted: number
  totalRuns: number
  bestLayerReached: number // 0-3 (4 layers total)
  bestNodeInBestLayer: number // Track how far in that layer
  selectedCharacterId: string | null
  contractProgress?: ContractProgress
  customFighterClasses?: CustomFighterClass[]
  activeConstructSlots?: {
    [slotId: string]: {
      constructId: string | null
      movementProtocols: Array<{
        triggerId: string
        actionId: string
        priority: number
      }>
      tacticalProtocols: Array<{
        triggerId: string
        actionId: string
        priority: number
      }>
    }
  }
  selectedConstructSlot?: string // "slot-1", "slot-2", "slot-3"
}

export interface CustomFighterClass {
  id: string
  name: string
  color: string
  startingPairs: Array<{
    triggerId: string
    actionId: string
    priority: number
  }>
  startingMovementPairs?: Array<{
    triggerId: string
    actionId: string
    priority: number
    isDefault?: boolean
  }>
  startingTacticalPairs?: Array<{
    triggerId: string
    actionId: string
    priority: number
    isDefault?: boolean
  }>
  constructStats?: {
    maxHp: number
    maxShields: number
    maxArmor: number
  }
  customization?: FighterCustomization
}

export const META_UPGRADES: MetaUpgrade[] = [
  // Tier 1 Stat Upgrades
  {
    id: "hp_boost_1",
    name: "Reinforced Armor I",
    description: "Increase starting HP by 20",
    category: "stat",
    cost: 50,
    maxLevel: 5,
    effect: { type: "hp", value: 20 },
  },
  {
    id: "hp_boost_2",
    name: "Reinforced Armor II",
    description: "Increase starting HP by 30",
    category: "stat",
    cost: 150,
    maxLevel: 3,
    effect: { type: "hp", value: 30 },
  },
  {
    id: "hp_boost_3",
    name: "Reinforced Armor III",
    description: "Increase starting HP by 50",
    category: "stat",
    cost: 300,
    maxLevel: 2,
    effect: { type: "hp", value: 50 },
  },
  {
    id: "damage_boost_1",
    name: "Enhanced Weapons I",
    description: "Increase all damage by 10%",
    category: "stat",
    cost: 75,
    maxLevel: 5,
    effect: { type: "damage", value: 0.1 },
  },
  {
    id: "damage_boost_2",
    name: "Enhanced Weapons II",
    description: "Increase all damage by 15%",
    category: "stat",
    cost: 200,
    maxLevel: 3,
    effect: { type: "damage", value: 0.15 },
  },
  {
    id: "damage_boost_3",
    name: "Enhanced Weapons III",
    description: "Increase all damage by 25%",
    category: "stat",
    cost: 400,
    maxLevel: 2,
    effect: { type: "damage", value: 0.25 },
  },

  // Evasion Boosts (NEW)
  {
    id: "evasion_boost_1",
    name: "Agile Movement I",
    description: "5% chance to dodge incoming attacks",
    category: "stat",
    cost: 100,
    maxLevel: 4,
    effect: { type: "evasion", value: 0.05 },
  },
  {
    id: "evasion_boost_2",
    name: "Agile Movement II",
    description: "8% chance to dodge incoming attacks",
    category: "stat",
    cost: 250,
    maxLevel: 3,
    effect: { type: "evasion", value: 0.08 },
  },
  {
    id: "evasion_boost_3",
    name: "Agile Movement III",
    description: "12% chance to dodge incoming attacks",
    category: "stat",
    cost: 450,
    maxLevel: 2,
    effect: { type: "evasion", value: 0.12 },
  },

  // Critical Hit Chance (NEW)
  {
    id: "crit_chance_1",
    name: "Precision Targeting I",
    description: "5% chance to land critical hits",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "crit_chance", value: 0.05 },
  },
  {
    id: "crit_chance_2",
    name: "Precision Targeting II",
    description: "8% chance to land critical hits",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "crit_chance", value: 0.08 },
  },
  {
    id: "crit_chance_3",
    name: "Precision Targeting III",
    description: "12% chance to land critical hits",
    category: "stat",
    cost: 500,
    maxLevel: 2,
    effect: { type: "crit_chance", value: 0.12 },
  },

  // Critical Hit Damage (NEW)
  {
    id: "crit_damage_1",
    name: "Devastating Strikes I",
    description: "Critical hits deal 25% more damage",
    category: "stat",
    cost: 150,
    maxLevel: 4,
    effect: { type: "crit_damage", value: 0.25 },
  },
  {
    id: "crit_damage_2",
    name: "Devastating Strikes II",
    description: "Critical hits deal 40% more damage",
    category: "stat",
    cost: 320,
    maxLevel: 3,
    effect: { type: "crit_damage", value: 0.4 },
  },
  {
    id: "crit_damage_3",
    name: "Devastating Strikes III",
    description: "Critical hits deal 60% more damage",
    category: "stat",
    cost: 550,
    maxLevel: 2,
    effect: { type: "crit_damage", value: 0.6 },
  },

  // Cooldown Reduction (NEW)
  {
    id: "cooldown_reduction_1",
    name: "Rapid Systems I",
    description: "Reduce all cooldowns by 5%",
    category: "stat",
    cost: 130,
    maxLevel: 4,
    effect: { type: "cooldown", value: 0.05 },
  },
  {
    id: "cooldown_reduction_2",
    name: "Rapid Systems II",
    description: "Reduce all cooldowns by 8%",
    category: "stat",
    cost: 300,
    maxLevel: 3,
    effect: { type: "cooldown", value: 0.08 },
  },
  {
    id: "cooldown_reduction_3",
    name: "Rapid Systems III",
    description: "Reduce all cooldowns by 12%",
    category: "stat",
    cost: 520,
    maxLevel: 2,
    effect: { type: "cooldown", value: 0.12 },
  },

  // Defense/Armor (NEW)
  {
    id: "defense_1",
    name: "Hardened Plating I",
    description: "Reduce incoming damage by 5%",
    category: "stat",
    cost: 110,
    maxLevel: 4,
    effect: { type: "defense", value: 0.05 },
  },
  {
    id: "defense_2",
    name: "Hardened Plating II",
    description: "Reduce incoming damage by 8%",
    category: "stat",
    cost: 260,
    maxLevel: 3,
    effect: { type: "defense", value: 0.08 },
  },
  {
    id: "defense_3",
    name: "Hardened Plating III",
    description: "Reduce incoming damage by 12%",
    category: "stat",
    cost: 480,
    maxLevel: 2,
    effect: { type: "defense", value: 0.12 },
  },

  // Lifesteal (NEW)
  {
    id: "lifesteal_1",
    name: "Energy Drain I",
    description: "Heal for 5% of damage dealt",
    category: "stat",
    cost: 180,
    maxLevel: 3,
    effect: { type: "lifesteal", value: 0.05 },
  },
  {
    id: "lifesteal_2",
    name: "Energy Drain II",
    description: "Heal for 8% of damage dealt",
    category: "stat",
    cost: 350,
    maxLevel: 3,
    effect: { type: "lifesteal", value: 0.08 },
  },
  {
    id: "lifesteal_3",
    name: "Energy Drain III",
    description: "Heal for 12% of damage dealt",
    category: "stat",
    cost: 600,
    maxLevel: 2,
    effect: { type: "lifesteal", value: 0.12 },
  },

  // Basic Action Unlocks (Tier 1 - 100-150 cost)
  {
    id: "unlock_rapid_fire",
    name: "Unlock: Rapid Fire",
    description: "Fire 3 quick shots (5 damage each)",
    category: "unlock",
    cost: 100,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "rapid-fire" },
  },
  {
    id: "unlock_sniper_shot",
    name: "Unlock: Sniper Shot",
    description: "Precise long-range shot (30 damage)",
    category: "unlock",
    cost: 120,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "sniper-shot" },
  },
  {
    id: "unlock_dodge",
    name: "Unlock: Dodge",
    description: "Quickly move to a random adjacent tile",
    category: "unlock",
    cost: 100,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "dodge" },
  },
  {
    id: "unlock_dash_attack",
    name: "Unlock: Dash Attack",
    description: "Rush forward while attacking (15 damage)",
    category: "unlock",
    cost: 130,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "dash-attack" },
  },
  {
    id: "unlock_retreat_shot",
    name: "Unlock: Retreat Shot",
    description: "Move back while shooting (12 damage)",
    category: "unlock",
    cost: 110,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "retreat-shot" },
  },
  {
    id: "unlock_mega_heal",
    name: "Unlock: Mega Heal",
    description: "Restore 40 HP",
    category: "unlock",
    cost: 150,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "mega-heal" },
  },

  // Advanced Action Unlocks (Tier 2 - 150-250 cost)
  {
    id: "unlock_charge_shot",
    name: "Unlock: Charge Shot",
    description: "Devastating charged blast (40 damage)",
    category: "unlock",
    cost: 180,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "charge-shot" },
  },
  {
    id: "unlock_burst_fire",
    name: "Unlock: Burst Fire",
    description: "Fire 5 rapid shots (4 damage each)",
    category: "unlock",
    cost: 170,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "burst-fire" },
  },
  {
    id: "unlock_teleport",
    name: "Unlock: Teleport",
    description: "Instantly move to a random position",
    category: "unlock",
    cost: 200,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "teleport" },
  },
  {
    id: "unlock_drain_shot",
    name: "Unlock: Drain Shot",
    description: "Damage enemy and heal yourself (15 damage, 10 HP)",
    category: "unlock",
    cost: 190,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "drain-shot" },
  },
  {
    id: "unlock_sword_slash",
    name: "Unlock: Sword Slash",
    description: "Melee attack at close range (35 damage)",
    category: "unlock",
    cost: 160,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "sword-slash" },
  },
  {
    id: "unlock_wide_slash",
    name: "Unlock: Wide Slash",
    description: "Slash entire column at close range (30 damage)",
    category: "unlock",
    cost: 180,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "wide-slash" },
  },
  {
    id: "unlock_shockwave",
    name: "Unlock: Shockwave",
    description: "Ground wave that pierces (20 damage)",
    category: "unlock",
    cost: 170,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "shockwave" },
  },
  {
    id: "unlock_bomb",
    name: "Unlock: Bomb",
    description: "Throw bomb with delayed explosion (35 damage)",
    category: "unlock",
    cost: 200,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "bomb" },
  },
  {
    id: "unlock_wave_attack",
    name: "Unlock: Wave Attack",
    description: "Hits entire row (18 damage)",
    category: "unlock",
    cost: 190,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "wave-attack" },
  },
  {
    id: "unlock_homing_shot",
    name: "Unlock: Homing Shot",
    description: "Tracks enemy position (20 damage)",
    category: "unlock",
    cost: 180,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "homing-shot" },
  },
  {
    id: "unlock_barrier",
    name: "Unlock: Barrier",
    description: "Block the next incoming attack",
    category: "unlock",
    cost: 220,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "barrier" },
  },
  {
    id: "unlock_shield",
    name: "Unlock: Energy Shield",
    description: "Reduce incoming damage by 50% for 3 seconds",
    category: "unlock",
    cost: 250,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "shield" },
  },

  // Elite Action Unlocks (Tier 3 - 250-400 cost)
  {
    id: "unlock_mega_bomb",
    name: "Unlock: Mega Bomb",
    description: "Massive explosion (50 damage)",
    category: "unlock",
    cost: 300,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "mega-bomb" },
  },
  {
    id: "unlock_cross_bomb",
    name: "Unlock: Cross Bomb",
    description: "Explodes in + pattern (25 damage)",
    category: "unlock",
    cost: 280,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "cross-bomb" },
  },
  {
    id: "unlock_spread_shot",
    name: "Unlock: Spread Shot",
    description: "Hits all 3 rows (12 damage each)",
    category: "unlock",
    cost: 270,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "spread-shot" },
  },
  {
    id: "unlock_triple_shot",
    name: "Unlock: Triple Shot",
    description: "Fire 3 shots in different rows (15 damage each)",
    category: "unlock",
    cost: 260,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "triple-shot" },
  },
  {
    id: "unlock_cannon",
    name: "Unlock: Cannon",
    description: "Heavy cannon blast (45 damage)",
    category: "unlock",
    cost: 320,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "cannon" },
  },
  {
    id: "unlock_vulcan",
    name: "Unlock: Vulcan",
    description: "Rapid machine gun (8 shots, 3 damage each)",
    category: "unlock",
    cost: 350,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "vulcan" },
  },
  {
    id: "unlock_counter",
    name: "Unlock: Counter",
    description: "Reflect 50% of next attack damage back",
    category: "unlock",
    cost: 300,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "counter" },
  },
  {
    id: "unlock_invincibility",
    name: "Unlock: Invincibility",
    description: "Become invulnerable for 2 seconds",
    category: "unlock",
    cost: 500,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "invincibility" },
  },
  {
    id: "unlock_area_heal",
    name: "Unlock: Area Heal",
    description: "Heal 5 HP per second for 4 seconds (20 HP total)",
    category: "unlock",
    cost: 280,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "area-heal" },
  },
  {
    id: "unlock_regen",
    name: "Unlock: Regen",
    description: "Heal 3 HP per second for 5 seconds (15 HP total)",
    category: "unlock",
    cost: 250,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "regen" },
  },
  {
    id: "unlock_speed_boost",
    name: "Unlock: Speed Boost",
    description: "Reduce all cooldowns by 30% for 4 seconds",
    category: "unlock",
    cost: 350,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "speed-boost" },
  },
  {
    id: "unlock_berserk",
    name: "Unlock: Berserk",
    description: "Increase damage by 50% for 5 seconds",
    category: "unlock",
    cost: 320,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "berserk" },
  },

  // Basic Trigger Unlocks (100-150 cost)
  {
    id: "unlock_enemy_close",
    name: "Unlock: Enemy Close",
    description: "Triggers when enemy is within 1 tile",
    category: "unlock",
    cost: 100,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "enemy-close" },
  },
  {
    id: "unlock_enemy_far",
    name: "Unlock: Enemy Far",
    description: "Triggers when enemy is more than 2 tiles away",
    category: "unlock",
    cost: 100,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "enemy-far" },
  },
  {
    id: "unlock_low_hp",
    name: "Unlock: Low HP",
    description: "Triggers when your HP is below 30%",
    category: "unlock",
    cost: 120,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "low-hp" },
  },
  {
    id: "unlock_high_hp",
    name: "Unlock: High HP",
    description: "Triggers when your HP is above 70%",
    category: "unlock",
    cost: 100,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "high-hp" },
  },
  {
    id: "unlock_enemy_low_hp",
    name: "Unlock: Enemy Low HP",
    description: "Triggers when enemy HP is below 30%",
    category: "unlock",
    cost: 130,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "enemy-low-hp" },
  },
  {
    id: "unlock_same_row",
    name: "Unlock: Same Row",
    description: "Triggers when in same row as enemy",
    category: "unlock",
    cost: 110,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "same-row" },
  },

  // Advanced Trigger Unlocks (150-250 cost)
  {
    id: "unlock_critical_hp",
    name: "Unlock: Critical HP",
    description: "Triggers when your HP is below 15%",
    category: "unlock",
    cost: 180,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "critical-hp" },
  },
  {
    id: "unlock_enemy_critical_hp",
    name: "Unlock: Enemy Critical HP",
    description: "Triggers when enemy HP is below 15%",
    category: "unlock",
    cost: 200,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "enemy-critical-hp" },
  },
  {
    id: "unlock_took_damage",
    name: "Unlock: Just Took Damage",
    description: "Triggers immediately after taking damage",
    category: "unlock",
    cost: 170,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "took-damage" },
  },
  {
    id: "unlock_at_front",
    name: "Unlock: At Front Position",
    description: "Triggers when at the frontmost position",
    category: "unlock",
    cost: 150,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "at-front" },
  },
  {
    id: "unlock_at_back",
    name: "Unlock: At Back Position",
    description: "Triggers when at the backmost position",
    category: "unlock",
    cost: 150,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "at-back" },
  },
  {
    id: "unlock_enemy_very_far",
    name: "Unlock: Enemy Very Far",
    description: "Triggers when enemy is more than 3 tiles away",
    category: "unlock",
    cost: 160,
    maxLevel: 1,
    effect: { type: "unlock_trigger", value: 1, triggerId: "enemy-very-far" },
  },

  // Shooting Action Upgrades
  {
    id: "power_shot_upgrade",
    name: "Power Shot+",
    description: "Increase Power Shot damage by 5",
    category: "action",
    cost: 60,
    maxLevel: 3,
    effect: { type: "damage", value: 5, actionId: "power-shot" },
  },
  {
    id: "charge_shot_upgrade",
    name: "Charge Shot+",
    description: "Increase Charge Shot damage by 8",
    category: "action",
    cost: 80,
    maxLevel: 3,
    effect: { type: "damage", value: 8, actionId: "charge-shot" },
  },
  {
    id: "rapid_fire_upgrade",
    name: "Rapid Fire+",
    description: "Increase Rapid Fire damage by 2 per shot",
    category: "action",
    cost: 70,
    maxLevel: 3,
    effect: { type: "damage", value: 2, actionId: "rapid-fire" },
  },
  {
    id: "sniper_shot_upgrade",
    name: "Sniper Shot+",
    description: "Increase Sniper Shot damage by 6",
    category: "action",
    cost: 75,
    maxLevel: 3,
    effect: { type: "damage", value: 6, actionId: "sniper-shot" },
  },
  {
    id: "cannon_upgrade",
    name: "Cannon+",
    description: "Increase Cannon damage by 10",
    category: "action",
    cost: 100,
    maxLevel: 3,
    effect: { type: "damage", value: 10, actionId: "cannon" },
  },

  // Melee Action Upgrades
  {
    id: "sword_slash_upgrade",
    name: "Sword Slash+",
    description: "Increase Sword Slash damage by 7",
    category: "action",
    cost: 70,
    maxLevel: 3,
    effect: { type: "damage", value: 7, actionId: "sword-slash" },
  },
  {
    id: "dash_attack_upgrade",
    name: "Dash Attack+",
    description: "Increase Dash Attack damage by 5",
    category: "action",
    cost: 65,
    maxLevel: 3,
    effect: { type: "damage", value: 5, actionId: "dash-attack" },
  },

  // Bomb Action Upgrades
  {
    id: "bomb_upgrade",
    name: "Bomb+",
    description: "Increase Bomb damage by 8",
    category: "action",
    cost: 80,
    maxLevel: 3,
    effect: { type: "damage", value: 8, actionId: "bomb" },
  },
  {
    id: "mega_bomb_upgrade",
    name: "Mega Bomb+",
    description: "Increase Mega Bomb damage by 12",
    category: "action",
    cost: 120,
    maxLevel: 3,
    effect: { type: "damage", value: 12, actionId: "mega-bomb" },
  },

  // Healing Action Upgrades
  {
    id: "heal_upgrade",
    name: "Enhanced Healing",
    description: "Increase Heal amount by 5",
    category: "action",
    cost: 80,
    maxLevel: 3,
    effect: { type: "damage", value: 5, actionId: "heal" },
  },
  {
    id: "mega_heal_upgrade",
    name: "Mega Heal+",
    description: "Increase Mega Heal amount by 10",
    category: "action",
    cost: 100,
    maxLevel: 3,
    effect: { type: "damage", value: 10, actionId: "mega-heal" },
  },
  {
    id: "drain_shot_upgrade",
    name: "Drain Shot+",
    description: "Increase Drain Shot damage and heal by 3",
    category: "action",
    cost: 85,
    maxLevel: 3,
    effect: { type: "damage", value: 3, actionId: "drain-shot" },
  },

  // Special Action Upgrades
  {
    id: "wave_attack_upgrade",
    name: "Wave Attack+",
    description: "Increase Wave Attack damage by 4",
    category: "action",
    cost: 75,
    maxLevel: 3,
    effect: { type: "damage", value: 4, actionId: "wave-attack" },
  },
  {
    id: "spread_shot_upgrade",
    name: "Spread Shot+",
    description: "Increase Spread Shot damage by 3",
    category: "action",
    cost: 80,
    maxLevel: 3,
    effect: { type: "damage", value: 3, actionId: "spread-shot" },
  },
  {
    id: "homing_shot_upgrade",
    name: "Homing Shot+",
    description: "Increase Homing Shot damage by 5",
    category: "action",
    cost: 70,
    maxLevel: 3,
    effect: { type: "damage", value: 5, actionId: "homing-shot" },
  },

  // Damage Type-Specific Upgrades
  // Kinetic Damage Specialization
  {
    id: "kinetic_mastery_1",
    name: "Ballistic Expert I",
    description: "Increase all Kinetic damage by 15%",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "kinetic_damage", value: 0.15 },
  },
  {
    id: "kinetic_mastery_2",
    name: "Ballistic Expert II",
    description: "Increase all Kinetic damage by 25%",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "kinetic_damage", value: 0.25 },
  },

  // Energy Damage Specialization
  {
    id: "energy_mastery_1",
    name: "Energy Conduit I",
    description: "Increase all Energy damage by 15%",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "energy_damage", value: 0.15 },
  },
  {
    id: "energy_mastery_2",
    name: "Energy Conduit II",
    description: "Increase all Energy damage by 25%",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "energy_damage", value: 0.25 },
  },

  // Thermal Damage Specialization
  {
    id: "thermal_mastery_1",
    name: "Pyrotechnics I",
    description: "Increase all Thermal damage by 15%",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "thermal_damage", value: 0.15 },
  },
  {
    id: "thermal_mastery_2",
    name: "Pyrotechnics II",
    description: "Increase all Thermal damage by 25%",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "thermal_damage", value: 0.25 },
  },

  // Viral Damage Specialization
  {
    id: "viral_mastery_1",
    name: "Bio-Weapons Expert I",
    description: "Increase all Viral damage by 15%",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "viral_damage", value: 0.15 },
  },
  {
    id: "viral_mastery_2",
    name: "Bio-Weapons Expert II",
    description: "Increase all Viral damage by 25%",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "viral_damage", value: 0.25 },
  },

  // Corrosive Damage Specialization
  {
    id: "corrosive_mastery_1",
    name: "Acid Master I",
    description: "Increase all Corrosive damage by 15%",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "corrosive_damage", value: 0.15 },
  },
  {
    id: "corrosive_mastery_2",
    name: "Acid Master II",
    description: "Increase all Corrosive damage by 25%",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "corrosive_damage", value: 0.25 },
  },

  // Explosive Damage Specialization
  {
    id: "explosive_mastery_1",
    name: "Demolitions Expert I",
    description: "Increase all Explosive damage by 15%",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "explosive_damage", value: 0.15 },
  },
  {
    id: "explosive_mastery_2",
    name: "Demolitions Expert II",
    description: "Increase all Explosive damage by 25%",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "explosive_damage", value: 0.25 },
  },

  // Glacial Damage Specialization
  {
    id: "glacial_mastery_1",
    name: "Cryo Expert I",
    description: "Increase all Glacial damage by 15%",
    category: "stat",
    cost: 120,
    maxLevel: 4,
    effect: { type: "glacial_damage", value: 0.15 },
  },
  {
    id: "glacial_mastery_2",
    name: "Cryo Expert II",
    description: "Increase all Glacial damage by 25%",
    category: "stat",
    cost: 280,
    maxLevel: 3,
    effect: { type: "glacial_damage", value: 0.25 },
  },

  // Status Effect Upgrades
  {
    id: "status_chance_1",
    name: "Status Amplifier I",
    description: "Increase status effect chance by 10%",
    category: "stat",
    cost: 150,
    maxLevel: 4,
    effect: { type: "status_chance", value: 0.1 },
  },
  {
    id: "status_chance_2",
    name: "Status Amplifier II",
    description: "Increase status effect chance by 15%",
    category: "stat",
    cost: 320,
    maxLevel: 3,
    effect: { type: "status_chance", value: 0.15 },
  },
  {
    id: "status_duration_1",
    name: "Persistent Effects I",
    description: "Increase status effect duration by 25%",
    category: "stat",
    cost: 180,
    maxLevel: 4,
    effect: { type: "status_duration", value: 0.25 },
  },
  {
    id: "status_duration_2",
    name: "Persistent Effects II",
    description: "Increase status effect duration by 40%",
    category: "stat",
    cost: 350,
    maxLevel: 3,
    effect: { type: "status_duration", value: 0.4 },
  },

  // Shield Upgrades
  {
    id: "shield_capacity_1",
    name: "Shield Generator I",
    description: "Increase starting shields by 30",
    category: "stat",
    cost: 140,
    maxLevel: 5,
    effect: { type: "shield_capacity", value: 30 },
  },
  {
    id: "shield_capacity_2",
    name: "Shield Generator II",
    description: "Increase starting shields by 50",
    category: "stat",
    cost: 300,
    maxLevel: 3,
    effect: { type: "shield_capacity", value: 50 },
  },
  {
    id: "shield_regen_1",
    name: "Shield Recharger I",
    description: "Increase shield regeneration rate by 3 HP/s",
    category: "stat",
    cost: 160,
    maxLevel: 4,
    effect: { type: "shield_regen", value: 3 },
  },
  {
    id: "shield_regen_2",
    name: "Shield Recharger II",
    description: "Increase shield regeneration rate by 5 HP/s",
    category: "stat",
    cost: 340,
    maxLevel: 3,
    effect: { type: "shield_regen", value: 5 },
  },

  // Armor Upgrades
  {
    id: "armor_rating_1",
    name: "Armored Plating I",
    description: "Increase starting armor by 25",
    category: "stat",
    cost: 140,
    maxLevel: 5,
    effect: { type: "armor_rating", value: 25 },
  },
  {
    id: "armor_rating_2",
    name: "Armored Plating II",
    description: "Increase starting armor by 40",
    category: "stat",
    cost: 300,
    maxLevel: 3,
    effect: { type: "armor_rating", value: 40 },
  },

  // Unlock new damage type actions
  {
    id: "unlock_kinetic_shot",
    name: "Unlock: Kinetic Shot",
    description: "Ballistic projectile (12 damage, strong vs armor)",
    category: "unlock",
    cost: 120,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "kinetic-shot" },
  },
  {
    id: "unlock_railgun",
    name: "Unlock: Railgun",
    description: "Armor-piercing shot (28 damage, very strong vs armor)",
    category: "unlock",
    cost: 200,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "railgun" },
  },
  {
    id: "unlock_laser_shot",
    name: "Unlock: Laser Shot",
    description: "Energy beam (12 damage, strong vs shields)",
    category: "unlock",
    cost: 120,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "laser-shot" },
  },
  {
    id: "unlock_plasma_cannon",
    name: "Unlock: Plasma Cannon",
    description: "Superheated plasma (35 damage, melts shields)",
    category: "unlock",
    cost: 220,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "plasma-cannon" },
  },
  {
    id: "unlock_flame_shot",
    name: "Unlock: Flame Shot",
    description: "Incendiary round (10 damage, can cause burning DOT)",
    category: "unlock",
    cost: 130,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "flame-shot" },
  },
  {
    id: "unlock_inferno_blast",
    name: "Unlock: Inferno Blast",
    description: "Devastating fire (30 damage, high burn chance)",
    category: "unlock",
    cost: 210,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "inferno-blast" },
  },
  {
    id: "unlock_viral_dart",
    name: "Unlock: Viral Dart",
    description: "Bio-weapon (8 damage, infects target)",
    category: "unlock",
    cost: 140,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "viral-dart" },
  },
  {
    id: "unlock_plague_bomb",
    name: "Unlock: Plague Bomb",
    description: "Viral payload (25 damage, spreads infection)",
    category: "unlock",
    cost: 230,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "plague-bomb" },
  },
  {
    id: "unlock_acid_shot",
    name: "Unlock: Acid Shot",
    description: "Corrosive round (10 damage, strips armor)",
    category: "unlock",
    cost: 130,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "acid-shot" },
  },
  {
    id: "unlock_corrosion_wave",
    name: "Unlock: Corrosion Wave",
    description: "Acid spray (22 damage, melts armor)",
    category: "unlock",
    cost: 190,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "corrosion-wave" },
  },
  {
    id: "unlock_emp_pulse",
    name: "Unlock: EMP Pulse",
    description: "Electromagnetic pulse (15 damage, disables shields)",
    category: "unlock",
    cost: 170,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "emp-pulse" },
  },
  {
    id: "unlock_magnetic_disruption",
    name: "Unlock: Magnetic Disruption",
    description: "Disrupt enemy protocols (10 damage, disables logic)",
    category: "unlock",
    cost: 220,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "magnetic-disruption" },
  },
  {
    id: "unlock_frag_grenade",
    name: "Unlock: Frag Grenade",
    description: "Explosive grenade (40 damage, balanced vs all)",
    category: "unlock",
    cost: 200,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "frag-grenade" },
  },
  {
    id: "unlock_cluster_bomb",
    name: "Unlock: Cluster Bomb",
    description: "Multiple explosions (25 damage x3)",
    category: "unlock",
    cost: 280,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "cluster-bomb" },
  },
  {
    id: "unlock_cryo_shot",
    name: "Unlock: Cryo Shot",
    description: "Freezing projectile (12 damage, slows enemy)",
    category: "unlock",
    cost: 140,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "cryo-shot" },
  },
  {
    id: "unlock_cryo_field",
    name: "Unlock: Cryo Field",
    description: "Freezing area (5 damage, heavy slow)",
    category: "unlock",
    cost: 240,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "cryo-field" },
  },
  {
    id: "unlock_blizzard",
    name: "Unlock: Blizzard",
    description: "Freezing storm (18 damage, slows and chills)",
    category: "unlock",
    cost: 220,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "blizzard" },
  },
  {
    id: "unlock_armor_piercer",
    name: "Unlock: Armor Piercer",
    description: "Specialized armor-melting shot (25 damage)",
    category: "unlock",
    cost: 190,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "corrosive-armor-piercer" },
  },
  {
    id: "unlock_electrical_charge",
    name: "Unlock: Charge Shot (Electrical)",
    description: "Powerful electrical blast (30 damage, guaranteed arc)",
    category: "unlock",
    cost: 210,
    maxLevel: 1,
    effect: { type: "unlock_action", value: 1, actionId: "electrical-charge-shot" },
  },
]

const STORAGE_KEY = "battle_game_progress"

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") {
    return getDefaultProgress()
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)

      if (parsed.currency !== undefined && parsed.cipherFragments === undefined) {
        parsed.cipherFragments = parsed.currency
        delete parsed.currency
      }

      // If old format exists (totalWavesCompleted, bestWave), migrate it
      if (parsed.totalWavesCompleted !== undefined && parsed.bestLayerReached === undefined) {
        // Estimate layer/node from old wave count (assuming ~7 nodes per layer)
        const bestWave = parsed.bestWave || 0
        parsed.bestLayerReached = Math.min(Math.floor(bestWave / 7), 3) // Max 4 layers (0-3)
        parsed.bestNodeInBestLayer = bestWave % 7
        parsed.totalNodesCompleted = parsed.totalWavesCompleted || 0

        // Remove old properties
        delete parsed.totalWavesCompleted
        delete parsed.bestWave

        // Save migrated data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }

      // Ensure all required properties exist with defaults
      return {
        ...getDefaultProgress(),
        ...parsed,
      }
    }
  } catch (e) {
    console.error("Failed to load progress:", e)
  }

  return getDefaultProgress()
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error("Failed to save progress:", e)
  }
}

export function getDefaultProgress(): PlayerProgress {
  return {
    cipherFragments: 0, // Renamed from currency
    upgrades: {},
    unlockedActions: [],
    unlockedTriggers: [],
    totalNodesCompleted: 0,
    totalRuns: 0,
    bestLayerReached: 0,
    bestNodeInBestLayer: 0,
    selectedCharacterId: null,
    contractProgress: undefined, // Will be initialized when first accessed
    customFighterClasses: undefined,
    activeConstructSlots: {
      "slot-1": {
        constructId: null,
        movementProtocols: [],
        tacticalProtocols: [],
      },
      "slot-2": {
        constructId: null,
        movementProtocols: [],
        tacticalProtocols: [],
      },
      "slot-3": {
        constructId: null,
        movementProtocols: [],
        tacticalProtocols: [],
      },
    },
    selectedConstructSlot: "slot-1",
  }
}

export function calculateCipherFragmentReward(nodesCompleted: number): number {
  // Base reward: 10 Cipher Fragments per node
  // Bonus for reaching milestones (every 5 nodes)
  const baseReward = nodesCompleted * 10
  const milestoneBonus = Math.floor(nodesCompleted / 5) * 25
  return baseReward + milestoneBonus
}

export const calculateCurrencyReward = calculateCipherFragmentReward

export function canAffordUpgrade(progress: PlayerProgress, upgrade: MetaUpgrade): boolean {
  const currentLevel = progress.upgrades[upgrade.id] || 0
  return progress.cipherFragments >= upgrade.cost && currentLevel < upgrade.maxLevel // Changed currency to cipherFragments
}

export function purchaseUpgrade(progress: PlayerProgress, upgradeId: string): PlayerProgress {
  const upgrade = META_UPGRADES.find((u) => u.id === upgradeId)
  if (!upgrade) return progress

  if (!canAffordUpgrade(progress, upgrade)) return progress

  const currentLevel = progress.upgrades[upgradeId] || 0
  const newProgress = { ...progress }

  newProgress.cipherFragments -= upgrade.cost // Changed currency to cipherFragments
  newProgress.upgrades[upgradeId] = currentLevel + 1

  // Handle unlocks
  if (upgrade.effect.type === "unlock_action" && upgrade.effect.actionId) {
    if (!newProgress.unlockedActions.includes(upgrade.effect.actionId)) {
      newProgress.unlockedActions.push(upgrade.effect.actionId)
    }
  }

  if (upgrade.effect.type === "unlock_trigger" && upgrade.effect.triggerId) {
    if (!newProgress.unlockedTriggers.includes(upgrade.effect.triggerId)) {
      newProgress.unlockedTriggers.push(upgrade.effect.triggerId)
    }
  }

  saveProgress(newProgress)
  return newProgress
}

export function getUpgradeLevel(progress: PlayerProgress, upgradeId: string): number {
  return progress.upgrades[upgradeId] || 0
}

export function getTotalStatBonus(
  progress: PlayerProgress,
  type:
    | "hp"
    | "damage"
    | "cooldown"
    | "evasion"
    | "crit_chance"
    | "crit_damage"
    | "defense"
    | "lifesteal"
    | "kinetic_damage"
    | "energy_damage"
    | "thermal_damage"
    | "viral_damage"
    | "corrosive_damage"
    | "explosive_damage"
    | "glacial_damage"
    | "status_chance"
    | "status_duration"
    | "shield_capacity"
    | "shield_regen"
    | "armor_rating",
): number {
  let total = 0

  for (const upgrade of META_UPGRADES) {
    const level = getUpgradeLevel(progress, upgrade.id)
    if (level > 0 && upgrade.effect.type === type && !upgrade.effect.actionId) {
      total += upgrade.effect.value * level
    }
  }

  return total
}

export function getActionDamageBonus(progress: PlayerProgress, actionId: string): number {
  let total = 0

  for (const upgrade of META_UPGRADES) {
    const level = getUpgradeLevel(progress, upgrade.id)
    if (level > 0 && upgrade.effect.type === "damage" && upgrade.effect.actionId === actionId) {
      total += upgrade.effect.value * level
    }
  }

  return total
}
