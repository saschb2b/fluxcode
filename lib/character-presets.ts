import type { TriggerActionPair } from "@/types/game"
import { buildTriggerActionPairs } from "./protocol-builder"

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

// Movement Core Protocols (positioning, evasion, movement)
const ASSAULT_MOVEMENT_PROTOCOLS = [
  { triggerId: "high-hp", actionId: "move-forward", priority: 4 },
  { triggerId: "different-row", actionId: "move-up", priority: 2 },
]

// Tactical Core Protocols (attacks, buffs, debuffs, healing)
const ASSAULT_TACTICAL_PROTOCOLS = [
  { triggerId: "same-row", actionId: "power-shot", priority: 3 },
  { triggerId: "always", actionId: "shoot", priority: 1 },
]

const GUARDIAN_MOVEMENT_PROTOCOLS = [
  { triggerId: "just-took-damage", actionId: "move-backward", priority: 3 },
  { triggerId: "different-row", actionId: "move-up", priority: 2 },
]

const GUARDIAN_TACTICAL_PROTOCOLS = [
  { triggerId: "low-hp", actionId: "heal", priority: 4 },
  { triggerId: "always", actionId: "shoot", priority: 1 },
]

const SNIPER_MOVEMENT_PROTOCOLS = [
  { triggerId: "enemy-close", actionId: "move-backward", priority: 3 },
  { triggerId: "different-row", actionId: "move-up", priority: 2 },
]

const SNIPER_TACTICAL_PROTOCOLS = [
  { triggerId: "enemy-far", actionId: "charge-shot", priority: 4 },
  { triggerId: "always", actionId: "shoot", priority: 1 },
]

const assaultMovementPairs = buildTriggerActionPairs(ASSAULT_MOVEMENT_PROTOCOLS)
const assaultTacticalPairs = buildTriggerActionPairs(ASSAULT_TACTICAL_PROTOCOLS)

const guardianMovementPairs = buildTriggerActionPairs(GUARDIAN_MOVEMENT_PROTOCOLS)
const guardianTacticalPairs = buildTriggerActionPairs(GUARDIAN_TACTICAL_PROTOCOLS)

const sniperMovementPairs = buildTriggerActionPairs(SNIPER_MOVEMENT_PROTOCOLS)
const sniperTacticalPairs = buildTriggerActionPairs(SNIPER_TACTICAL_PROTOCOLS)

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: "assault",
    name: "ASSAULT",
    description: "Aggressive close-range fighter",
    playstyle: "Pushes forward aggressively while maintaining tactical positioning",
    color: "#ff3366",
    startingPairs: [...assaultMovementPairs, ...assaultTacticalPairs], // Backwards compatibility
    startingTriggers: Array.from(
      new Set([...assaultMovementPairs.map((p) => p.trigger), ...assaultTacticalPairs.map((p) => p.trigger)]),
    ),
    startingActions: Array.from(
      new Set([...assaultMovementPairs.map((p) => p.action), ...assaultTacticalPairs.map((p) => p.action)]),
    ),
    startingMovementPairs: assaultMovementPairs, // Separate movement protocols
    startingTacticalPairs: assaultTacticalPairs, // Separate tactical protocols
  },
  {
    id: "guardian",
    name: "GUARDIAN",
    description: "Defensive healer",
    playstyle: "Maintains safe distance while providing self-healing and sustained fire",
    color: "#00ffcc",
    startingPairs: [...guardianMovementPairs, ...guardianTacticalPairs],
    startingTriggers: Array.from(
      new Set([...guardianMovementPairs.map((p) => p.trigger), ...guardianTacticalPairs.map((p) => p.trigger)]),
    ),
    startingActions: Array.from(
      new Set([...guardianMovementPairs.map((p) => p.action), ...guardianTacticalPairs.map((p) => p.action)]),
    ),
    startingMovementPairs: guardianMovementPairs,
    startingTacticalPairs: guardianTacticalPairs,
  },
  {
    id: "sniper",
    name: "SNIPER",
    description: "Long-range precision striker",
    playstyle: "Maintains maximum distance for powerful charged shots",
    color: "#9933ff",
    startingPairs: [...sniperMovementPairs, ...sniperTacticalPairs],
    startingTriggers: Array.from(
      new Set([...sniperMovementPairs.map((p) => p.trigger), ...sniperTacticalPairs.map((p) => p.trigger)]),
    ),
    startingActions: Array.from(
      new Set([...sniperMovementPairs.map((p) => p.action), ...sniperTacticalPairs.map((p) => p.action)]),
    ),
    startingMovementPairs: sniperMovementPairs,
    startingTacticalPairs: sniperTacticalPairs,
  },
]
