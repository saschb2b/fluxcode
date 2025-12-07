import { TriggerActionPair, DamageType } from "@/types/game";
import { ReactNode } from "react";

/**
 * Difficulty classifications for enemies.
 * - `alpha`: Tutorial/fodder level. Simple logic checks.
 * - `beta`: Standard difficulty. Requires reaction and strategy.
 * - `gamma`: Elite/High difficulty. Punishes specific playstyles.
 * - `omega`: Boss level. Multiple logic checks or phases.
 */
export type EnemyTier = "alpha" | "beta" | "gamma" | "omega";

export interface EnemyBehavior {
  /** Protocols related to positioning and navigation. */
  movement: TriggerActionPair[];
  /** Protocols related to attacking, buffing, or disrupting. */
  tactical: TriggerActionPair[];
}

/**
 * Runtime state passed to the visual renderer.
 * Use these props to make the 3D model react to the battle state.
 */
export interface EnemyRenderProps {
  /** True if the enemy is currently executing an attack action. */
  isAttacking: boolean;
  /** True if the enemy took damage in the last ~100-300ms. */
  isHit: boolean;
  /** True if HP <= 0. Use this to play death animations/particles. */
  isDead: boolean;
  /** Current HP (0-1). Useful for dynamic damage modeling or health bars. */
  hpPercentage: number;
}

// Context passed to condition checkers
export interface EnemyAIContext {
  hp: number;
  maxHp: number;
  shields: number;
  armor: number;
  battleTime: number; // How long the fight has lasted
}

// A single "State" of the enemy
export interface EnemyPhase {
  name: string; // e.g., "Passive", "Aggressive", "Enraged"

  // The protocols active during this phase
  movement: TriggerActionPair[];
  tactical: TriggerActionPair[];

  // Rules to switch to OTHER phases
  transitions: Array<{
    targetPhase: string; // ID of the phase to switch to
    condition: (ctx: EnemyAIContext) => boolean;
  }>;

  // Optional: Visual cue when entering this phase (e.g. turn red)
  onEnter?: {
    glowColor?: string;
    scale?: number;
    // We could add sound/particles here later
  };
}

/**
 * The Blueprint for a specific Enemy Unit.
 *
 * This object functions like a "Prefab" in other engines. It contains everything
 * needed to spawn, simulate, and render an enemy.
 */
export interface EnemyDefinition {
  /**
   * Unique identifier for this definition (e.g., `sentry-beta`).
   * Must be unique across the entire game.
   */
  id: string;

  /** Display name shown to the player (e.g., "Sentry Mk.II"). */
  name: string;

  /** Flavor text or brief hint shown in inspection UI. */
  description: string;

  /**
   * Internal note explaining the gameplay puzzle this enemy represents.
   * Example: "Punishes stationary players; requires vertical movement."
   * Helpful for maintaining a balanced roster of mechanics.
   */
  logicCheck: string;

  // --- Stats ---

  /** The difficulty tier of this unit. Used for spawning logic. */
  tier: EnemyTier;

  /** Maximum Health Points. */
  baseHp: number;

  /**
   * Maximum Shield capacity (Blue bar).
   * Regenerates if not damaged for a duration. Good against chip damage.
   */
  baseShields: number;

  /**
   * Damage reduction value (Yellow bar).
   * Flat reduction or percentage mitigation depending on game logic.
   */
  baseArmor: number;

  /**
   * Elemental strengths/weaknesses.
   * Values > 0 reduce damage (0.5 = 50% resist).
   * Values < 0 increase damage (-0.5 = 50% weak).
   */
  resistances: Partial<Record<DamageType, number>>;

  // --- Visuals ---

  /**
   * The Visual Component Factory.
   * Returns a React Node (usually Three.js elements) to render the enemy in the scene.
   *
   * @example
   * renderer: (props) => (
   *   <mesh scale={props.isHit ? 1.1 : 1}>
   *     <boxGeometry />
   *     <meshStandardMaterial color="red" />
   *   </mesh>
   * )
   */
  renderer: (props: EnemyRenderProps) => ReactNode;

  // --- Logic ---

  /**
   * The AI Factory.
   * Returns a fresh set of Movement and Tactical protocols for a new instance.
   *
   * @returns An object containing `movement` and `tactical` arrays of TriggerActionPairs.
   * @example
   *   ai: {
     initialPhase: "patrol",
     phases: {
       // PHASE 1: Calm, calculated
       patrol: {
         name: "Patrol Mode",
         movement: [ createPair("different-row", "align-y", 2) ],
         tactical: [ createPair("same-row", "shoot", 2) ], // Single shot
         transitions: [
           {
             targetPhase: "panic",
             // Switch if HP drops below 50%
             condition: (ctx) => (ctx.hp / ctx.maxHp) <= 0.5
           }
         ]
       },

       // PHASE 2: Fast, aggressive, spammy
       panic: {
         name: "Panic Mode",
         movement: [
           createPair("always", "dodge", 2), // Jittery movement
           createPair("enemy-far", "move-forward", 1)
         ],
         tactical: [
           createPair("always", "rapid-fire", 2) // Spray and pray
         ],
         transitions: [], // No going back!
         onEnter: {
           glowColor: "#ff0000" // Eyes turn red
         }
       }
     }
   }
   */
  ai: {
    initialPhase: "default" | string;
    phases: Record<string, EnemyPhase>;
  };
}
