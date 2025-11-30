export interface Position {
  x: number; // 0-5 (grid columns)
  y: number; // 0-2 (grid rows)
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
    | "displace";
  duration: number; // milliseconds remaining
  stacks?: number; // for stackable effects like slow/degrade
  value?: number; // damage per tick for burn, or percentage for degrade
  startTime?: number;
  endTime?: number;
  lastTickTime?: number;
}

export interface DefenseLayers {
  shields: number; // blue bar, regenerates
  maxShields: number;
  shieldRegenRate: number; // HP per second
  shieldRegenDelay: number; // ms after taking damage before regen starts
  lastShieldDamageTime: number;

  armor: number; // yellow bar, reduces damage
  maxArmor: number;
  armorReduction: number; // percentage of damage reduced (can be degraded)
}

export interface Fighter {
  id?: string; // Added id to identify individual enemies
  position: Position;
  hp: number;
  maxHp: number;
  shields?: number; // Moved from defense object to top level
  maxShields?: number;
  armor?: number;
  maxArmor?: number;
  defense?: DefenseLayers; // Optional for backwards compatibility
  statusEffects?: StatusEffect[]; // Optional for now
  resistances?: Partial<Record<DamageType, number>>; // Added resistances
  isPawn?: boolean; // Added flag for guardian pawns
}

export interface Projectile {
  id: string;
  position: Position;
  direction: "left" | "right";
  damage: number;
  damageType?: DamageType; // Optional damage type
  statusChance?: number; // chance to apply status effect (0-1)
}

export interface Trigger {
  id: string;
  name: string;
  description: string;
  check: (context: BattleContext) => boolean;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  damageType?: DamageType; // Optional damage type
  coreType: "movement" | "tactical"; // Added coreType field to classify actions into movement or tactical categories
  execute: (context: BattleContext) => ActionResult;
}

/**
 * Result of executing an action.
 * Uses discriminated unions to ensure type safety - each action type
 * has exactly the properties it needs with no optionals.
 */
export type ActionResult =
  | {
      /** Basic projectile attack */
      type: "shoot" | "homing" | "piercing-shot";
      /** Damage dealt by this attack */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
    }
  | {
      /** Fire multiple projectiles in quick succession */
      type: "rapid-fire";
      /** Damage per shot */
      damage: number;
      /** Number of shots fired */
      count: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
    }
  | {
      /** Attack that hits an entire row or spreads to all rows */
      type: "wave" | "spread";
      /** Damage dealt */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
    }
  | {
      /** Explosive projectile with delayed detonation */
      type: "bomb" | "cluster";
      /** Damage dealt on impact */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
      /** Milliseconds before detonation */
      delay: number;
      /** Number of projectiles (for cluster bombs) */
      count?: number;
    }
  | {
      /** Persistent area damage over time */
      type: "field";
      /** Damage per tick */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Total duration in milliseconds */
      duration: number;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
    }
  | {
      /** Close-range melee attack */
      type: "melee" | "wide-melee";
      /** Damage dealt */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Maximum range in tiles */
      range: number;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
    }
  | {
      /** Fire 3 projectiles in different rows */
      type: "triple-shot";
      /** Damage per projectile */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
    }
  | {
      /** Attack while moving forward simultaneously */
      type: "dash-attack";
      /** Damage dealt */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** New position after dash */
      position: Position;
    }
  | {
      /** Attack while moving backward simultaneously */
      type: "retreat-shot";
      /** Damage dealt */
      damage: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** New position after retreat */
      position: Position;
    }
  | {
      /** Vampiric attack that damages enemy and heals user */
      type: "drain";
      /** Damage dealt to enemy */
      damage: number;
      /** HP restored to user */
      heal: number;
      /** Type of damage for elemental calculations */
      damageType: DamageType;
      /** Chance (0-1) to apply a status effect */
      statusChance?: number;
    }
  | {
      /** Reposition without attacking */
      type: "move";
      /** Target position */
      position: Position;
    }
  | {
      /** Instant HP restoration */
      type: "heal";
      /** HP amount to restore */
      amount: number;
    }
  | {
      /** HP restoration over time */
      type: "heal-over-time";
      /** HP restored per tick */
      healPerTick: number;
      /** Total duration in milliseconds */
      duration: number;
    }
  | {
      /** Absorb the next incoming attack */
      type: "barrier";
      /** Duration in milliseconds */
      duration: number;
    }
  | {
      /** Reduce incoming damage for duration */
      type: "shield";
      /** Duration in milliseconds */
      duration: number;
      /** Percentage (0-100) of damage to reduce */
      reduction: number;
    }
  | {
      /** Reflect portion of damage back to attacker */
      type: "counter";
      /** Duration in milliseconds */
      duration: number;
      /** Percentage (0-100) of damage to reflect */
      reflectPercent: number;
    }
  | {
      /** Make user invulnerable for duration */
      type: "invincible";
      /** Duration in milliseconds */
      duration: number;
    }
  | {
      /** Temporarily modify a stat */
      type: "buff";
      /** Which stat to modify */
      stat: "damage" | "cooldown";
      /** Multiplier to apply (0.7 = 30% reduction, 1.5 = 50% increase) */
      multiplier: number;
      /** Duration in milliseconds */
      duration: number;
    };

export interface TriggerActionPair {
  trigger: Trigger;
  action: Action;
  priority: number;
  lastExecuted?: number;
  enabled?: boolean; // Added enabled property to track if protocol is active
  coreType?: "movement" | "tactical"; // Added coreType for backwards compatibility and migration
  isDefault?: boolean; // Added flag to mark default protocols that have locked triggers
}

export interface BattleContext {
  playerPos: Position;
  enemyPos: Position;
  playerHP: number;
  enemyHP: number;
  playerShield?: number;
  playerArmor?: number;
  enemyShield?: number;
  enemyArmor?: number;
  playerDefense?: DefenseLayers; // Optional
  enemyDefense?: DefenseLayers; // Optional
  playerStatusEffects?: StatusEffect[]; // Renamed for consistency with triggers
  enemyStatusEffects?: StatusEffect[]; // Renamed for consistency with triggers
  playerStatus?: StatusEffect[]; // Optional - keeping both for backwards compatibility
  enemyStatus?: StatusEffect[]; // Optional - keeping both for backwards compatibility
  justTookDamage: boolean;
  isPlayer: boolean;
}

export interface BattleState {
  playerPos: Position;
  playerHP: number;
  playerShields?: number; // Added player shields
  playerArmor?: number; // Added player armor
  enemyPos: Position; // Keep for backwards compatibility
  enemyHP: number; // Keep for backwards compatibility
  enemies: EnemyState[]; // Added array of enemy states
  enemyShields: number; // Keep for backwards compatibility
  enemyArmor: number; // Keep for backwards compatibility
  projectiles: Projectile[];
  justTookDamage: boolean;
  enemyBurnStacks: BurnStack[]; // Keep for backwards compatibility
  enemyViralStacks: ViralStack[];
  enemyEMPStacks: EMPStack[];
  enemyLagStacks: LagStack[];
  enemyDisplaceStacks: DisplaceStack[];
  enemyCorrosiveStacks: CorrosiveStack[];
  shieldRegenDisabled: boolean;
  enemyImmuneToStatus?: boolean;
}

export interface BattleHistoryPoint {
  time: number;
  playerHP: number;
  enemyHP: number;
}

export interface BattleUpdate {
  playerPos?: Position;
  playerHP?: number;
  playerShields?: number; // Added player shields
  playerArmor?: number; // Added player armor
  enemyPos?: Position;
  enemyHP?: number;
  enemyShields?: number;
  enemyArmor?: number;
  projectiles?: Projectile[];
  justTookDamage?: boolean;
  battleOver?: boolean;
  playerWon?: boolean;
  battleHistory?: BattleHistoryPoint[];
  damageDealt?: { type: DamageType; amount: number };
  pairExecuted?: { triggerId: string; actionId: string };
}

export interface Construct {
  id: string;
  name: string;
  description: string;
  lore: string;
  color: string;
  // Base stats
  baseHp: number;
  baseShields: number;
  baseArmor: number;
  // Slot configuration
  maxMovementSlots: number;
  maxTacticalSlots: number;
  // Resistances
  resistances: Partial<Record<DamageType, number>>;
}

export interface ActiveConstructSlot {
  slotId: string; // "slot-1", "slot-2", "slot-3"
  constructId: string | null; // null = empty slot
  movementProtocols: TriggerActionPair[];
  tacticalProtocols: TriggerActionPair[];
}

export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  playstyle: string;
  color: string;
  startingPairs: TriggerActionPair[]; // Kept for backwards compatibility
  startingTriggers: any[];
  startingActions: any[];
  startingMovementPairs: TriggerActionPair[]; // Added dual-core protocol arrays
  startingTacticalPairs: TriggerActionPair[];
}

export interface BurnStack {
  damage: number;
  endTime: number;
}

export interface ViralStack {
  endTime: number;
}

export interface CorrosiveStack {
  endTime: number;
  armorStripped: number;
}

export interface EMPStack {
  endTime: number;
  shieldDrainPercent: number;
}

export interface LagStack {
  endTime: number;
  cooldownIncrease: number; // 15% per stack
  movementReduction: number; // 10% per stack
  actionFailureChance: number; // 5% per stack
}

export interface DisplaceStack {
  endTime: number;
  pushDistance: number; // number of tiles to push back
  corruptMovement: boolean; // whether to corrupt next move action
}

export interface EnemyState {
  id: string;
  position: Position;
  hp: number;
  maxHp: number;
  shields: number;
  maxShields: number;
  armor: number;
  maxArmor: number;
  burnStacks: BurnStack[];
  viralStacks: ViralStack[];
  empStacks: EMPStack[];
  lagStacks: LagStack[];
  displaceStacks: DisplaceStack[];
  corrosiveStacks: CorrosiveStack[];
  shieldRegenDisabled: boolean;
  isPawn: boolean; // Flag for guardian pawns
  triggerActionPairs?: TriggerActionPair[]; // Added to potentially embed protocols in enemy object
}

export interface GameState {
  battleState: "idle" | "fighting" | "victory" | "defeat";
  wave: number;
  player: Fighter;
  enemy: Fighter; // Keep for backwards compatibility, but will use enemies array
  enemies: Fighter[]; // Added enemies array for multi-enemy support
  projectiles: Projectile[];
  triggerActionPairs: TriggerActionPair[];
  movementPairs?: TriggerActionPair[]; // Added separate movement and tactical protocol arrays for dual-core system
  tacticalPairs?: TriggerActionPair[];
  unlockedTriggers: Trigger[];
  unlockedActions: Action[];
  startBattle: () => void;
  nextWave: () => void;
  resetGame: () => void;
  addTriggerActionPair: (trigger: Trigger, action: Action) => void;
  removeTriggerActionPair: (index: number) => void;
  updatePairPriority: (index: number, priority: number) => void;
  togglePair: (index: number, enabled: boolean) => void;
  addMovementPair?: (trigger: Trigger, action: Action) => void; // Added dual-core protocol management functions
  addTacticalPair?: (trigger: Trigger, action: Action) => void;
  removeMovementPair?: (index: number) => void;
  removeTacticalPair?: (index: number) => void;
  updateMovementPriority?: (index: number, priority: number) => void;
  updateTacticalPriority?: (index: number, priority: number) => void;
  toggleMovementPair?: (index: number, enabled: boolean) => void;
  toggleTacticalPair?: (index: number, enabled: boolean) => void;
  showRewardSelection: boolean;
  availableRewardTriggers: Trigger[];
  availableRewardActions: Action[];
  selectRewardTrigger: (trigger: Trigger) => void;
  selectRewardAction: (action: Action) => void;
  rerollsRemaining: number;
  rerollRewards: () => void;
  selectedCharacter: CharacterPreset | null;
  selectedConstruct: Construct | null;
  activeSlot: ActiveConstructSlot | null;
  setConstruct: (construct: Construct, slotId: string) => void;
  setCharacter: (character: CharacterPreset) => void;
  fighterCustomization: FighterCustomization | null;
  setCustomization: (customization: FighterCustomization) => void;
  enemyCustomization: FighterCustomization;
  enemyCustomizations: FighterCustomization[]; // Added array for multiple enemy customizations
  battleHistory: any[]; // Temporary fix for BattleHistoryPoint undeclared variable
  showEnemyIntro: boolean;
  continueAfterIntro: () => void;
  playerProgress: PlayerProgress;
  updatePlayerProgress: (progress: PlayerProgress) => void;
  networkLayers: NetworkLayer[];
  currentLayerIndex: number;
  currentNodeIndex: number;
  isGuardianBattle: boolean;
  extractFromBreach: () => void;
  justEarnedReward: { type: "trigger" | "action"; name: string } | null;
}

import type { FighterCustomization } from "@/lib/fighter-parts";
import type { PlayerProgress } from "@/lib/meta-progression";
import type { NetworkLayer } from "@/lib/network-layers";
