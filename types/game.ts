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
  CONCUSSION = "concussion",
  GLACIAL = "glacial",
}

export interface StatusEffect {
  type:
    | "arc"
    | "disable"
    | "degrade"
    | "slow"
    | "burn"
    | "stagger"
    | "viral_infection"
    | "emp"
    | "stun"
    | "lag"
    | "displace"
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
  id?: string // Added id to identify individual enemies
  position: Position
  hp: number
  maxHp: number
  shields?: number // Moved from defense object to top level
  maxShields?: number
  armor?: number
  maxArmor?: number
  defense?: DefenseLayers // Optional for backwards compatibility
  statusEffects?: StatusEffect[] // Optional for now
  resistances?: Partial<Record<DamageType, number>> // Added resistances
  isPawn?: boolean // Added flag for guardian pawns
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
  coreType: "movement" | "tactical" // Added coreType field to classify actions into movement or tactical categories
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
  triggerId?: string // Added trigger and action IDs for tracking
  actionId?: string
}

export interface TriggerActionPair {
  trigger: Trigger
  action: Action
  priority: number
  lastExecuted?: number
  enabled?: boolean // Added enabled property to track if protocol is active
  coreType?: "movement" | "tactical" // Added coreType for backwards compatibility and migration
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

export interface Construct {
  id: string
  name: string
  description: string
  lore: string
  color: string
  // Base stats
  baseHp: number
  baseShields: number
  baseArmor: number
  // Slot configuration
  maxMovementSlots: number
  maxTacticalSlots: number
  // Optional passive ability
  passiveAbility?: {
    name: string
    description: string
    effect: string // e.g., "evasion_boost", "damage_boost", "cooldown_reduction"
    value: number
  }
  // Resistances
  resistances?: Partial<Record<DamageType, number>>
}

export interface ActiveConstructSlot {
  slotId: string // "slot-1", "slot-2", "slot-3"
  constructId: string | null // null = empty slot
  movementProtocols: TriggerActionPair[]
  tacticalProtocols: TriggerActionPair[]
}

export interface CharacterPreset {
  id: string
  name: string
  description: string
  playstyle: string
  color: string
  startingPairs: TriggerActionPair[] // Kept for backwards compatibility
  startingTriggers: any[]
  startingActions: any[]
  startingMovementPairs: TriggerActionPair[] // Added dual-core protocol arrays
  startingTacticalPairs: TriggerActionPair[]
}

export interface GameState {
  battleState: "idle" | "fighting" | "victory" | "defeat"
  wave: number
  player: Fighter
  enemy: Fighter // Keep for backwards compatibility, but will use enemies array
  enemies: Fighter[] // Added enemies array for multi-enemy support
  projectiles: Projectile[]
  triggerActionPairs: TriggerActionPair[]
  movementPairs?: TriggerActionPair[] // Added separate movement and tactical protocol arrays for dual-core system
  tacticalPairs?: TriggerActionPair[]
  unlockedTriggers: Trigger[]
  unlockedActions: Action[]
  startBattle: () => void
  nextWave: () => void
  resetGame: () => void
  addTriggerActionPair: (trigger: Trigger, action: Action) => void
  removeTriggerActionPair: (index: number) => void
  updatePairPriority: (index: number, priority: number) => void
  togglePair: (index: number, enabled: boolean) => void
  addMovementPair?: (trigger: Trigger, action: Action) => void // Added dual-core protocol management functions
  addTacticalPair?: (trigger: Trigger, action: Action) => void
  removeMovementPair?: (index: number) => void
  removeTacticalPair?: (index: number) => void
  updateMovementPriority?: (index: number, priority: number) => void
  updateTacticalPriority?: (index: number, priority: number) => void
  toggleMovementPair?: (index: number, enabled: boolean) => void
  toggleTacticalPair?: (index: number, enabled: boolean) => void
  showRewardSelection: boolean
  availableRewardTriggers: Trigger[]
  availableRewardActions: Action[]
  selectRewardTrigger: (trigger: Trigger) => void
  selectRewardAction: (action: Action) => void
  rerollsRemaining: number
  rerollRewards: () => void
  selectedCharacter: CharacterPreset | null
  selectedConstruct: Construct | null
  activeSlot: ActiveConstructSlot | null
  setConstruct: (construct: Construct, slotId: string) => void
  setCharacter: (character: CharacterPreset) => void
  fighterCustomization: FighterCustomization | null
  setCustomization: (customization: FighterCustomization) => void
  enemyCustomization: FighterCustomization
  enemyCustomizations: FighterCustomization[] // Added array for multiple enemy customizations
  battleHistory: any[] // Temporary fix for BattleHistoryPoint undeclared variable
  showEnemyIntro: boolean
  continueAfterIntro: () => void
  playerProgress: PlayerProgress
  updatePlayerProgress: (progress: PlayerProgress) => void
  networkLayers: NetworkLayer[]
  currentLayerIndex: number
  currentNodeIndex: number
  isGuardianBattle: boolean
  extractFromBreach: () => void
  justEarnedReward: { type: "trigger" | "action"; name: string } | null
}

import type { FighterCustomization } from "@/lib/fighter-parts"
import type { PlayerProgress } from "@/lib/meta-progression"
import type { NetworkLayer } from "@/lib/network-layers"
