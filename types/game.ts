export interface Position {
  x: number // 0-5 (grid columns)
  y: number // 0-2 (grid rows)
}

export enum DamageType {
  KINETIC = "kinetic",
  ENERGY = "energy",
  THERMAL = "thermal",
  VIRAL = "viral",
  CORROSIVE = "corrosive",
  EXPLOSIVE = "explosive",
  ELECTROMAGNETIC = "electromagnetic", // renamed from MAGNETIC for clarity
  GLACIAL = "glacial",
}

export interface StatusEffect {
  type: "arc" | "disable" | "degrade" | "slow" | "burn" | "stagger" | "viral_infection" | "emp" | "stun"
  duration: number // milliseconds remaining
  stacks?: number // for stackable effects like slow/degrade
  value?: number // damage per tick for burn, or percentage for degrade
  startTime?: number
  endTime?: number
  lastTickTime?: number
}

export interface DefenseLayers {
  shields: number // blue bar, regenerates
  maxShields: number
  shieldRegenRate: number // HP per second
  shieldRegenDelay: number // ms after taking damage before regen starts
  lastShieldDamageTime: number

  armor: number // yellow bar, reduces damage
  maxArmor: number
  armorReduction: number // percentage of damage reduced (can be degraded)
}

export interface Fighter {
  position: Position
  hp: number
  maxHp: number
  defense?: DefenseLayers // Optional for now
  statusEffects?: StatusEffect[] // Optional for now
}

export interface Projectile {
  id: string
  position: Position
  direction: "left" | "right"
  damage: number
  damageType?: DamageType // Optional damage type
  statusChance?: number // chance to apply status effect (0-1)
}

export interface Trigger {
  id: string
  name: string
  description: string
  check: (context: BattleContext) => boolean
}

export interface Action {
  id: string
  name: string
  description: string
  cooldown: number
  damageType?: DamageType // Optional damage type
  execute: (context: BattleContext) => ActionResult
}

export interface ActionResult {
  type: "shoot" | "move" | "rapid-fire" | "heal"
  damage?: number
  damageType?: DamageType // Optional damage type
  position?: Position
  count?: number
  amount?: number
  statusChance?: number // chance to apply the damage type's status effect
}

export interface TriggerActionPair {
  trigger: Trigger
  action: Action
  priority: number
  lastExecuted?: number
}

export interface BattleContext {
  playerPos: Position
  enemyPos: Position
  playerHP: number
  enemyHP: number
  playerShield?: number
  playerArmor?: number
  enemyShield?: number
  enemyArmor?: number
  playerDefense?: DefenseLayers // Optional
  enemyDefense?: DefenseLayers // Optional
  playerStatusEffects?: StatusEffect[] // Renamed for consistency with triggers
  enemyStatusEffects?: StatusEffect[] // Renamed for consistency with triggers
  playerStatus?: StatusEffect[] // Optional - keeping both for backwards compatibility
  enemyStatus?: StatusEffect[] // Optional - keeping both for backwards compatibility
  justTookDamage: boolean
  isPlayer: boolean
}

export interface CharacterPreset {
  id: string
  name: string
  description: string
  playstyle: string
  color: string
  startingPairs: TriggerActionPair[]
  startingTriggers: Trigger[]
  startingActions: Action[]
}

export interface BattleHistoryPoint {
  time: number
  playerHP: number
  enemyHP: number
}

import type { FighterCustomization } from "@/lib/fighter-parts"
import type { PlayerProgress } from "@/lib/meta-progression"
import type { NetworkLayer } from "@/lib/network-layers"

export interface GameState {
  battleState: "idle" | "fighting" | "victory" | "defeat"
  wave: number
  player: Fighter
  enemy: Fighter
  projectiles: Projectile[]
  triggerActionPairs: TriggerActionPair[]
  unlockedTriggers: Trigger[]
  unlockedActions: Action[]
  startBattle: () => void
  nextWave: () => void
  resetGame: () => void
  addTriggerActionPair: (trigger: Trigger, action: Action) => void
  removeTriggerActionPair: (index: number) => void
  updatePairPriority: (index: number, priority: number) => void
  showRewardSelection: boolean
  availableRewardTriggers: Trigger[]
  availableRewardActions: Action[]
  selectRewardTrigger: (trigger: Trigger) => void
  selectRewardAction: (action: Action) => void
  rerollsRemaining: number
  rerollRewards: () => void
  selectedCharacter: CharacterPreset | null
  setCharacter: (character: CharacterPreset) => void
  fighterCustomization: FighterCustomization | null
  setCustomization: (customization: FighterCustomization) => void
  enemyCustomization: FighterCustomization
  battleHistory: BattleHistoryPoint[]
  showEnemyIntro: boolean
  continueAfterIntro: () => void
  playerProgress: PlayerProgress
  updatePlayerProgress: (progress: PlayerProgress) => void
  networkLayers: NetworkLayer[]
  currentLayerIndex: number
  currentNodeIndex: number
  isGuardianBattle: boolean
  extractFromBreach: () => void // Added extract function
  justEarnedReward: { type: "trigger" | "action"; name: string } | null // Added justEarnedReward to track newly acquired protocols
}
