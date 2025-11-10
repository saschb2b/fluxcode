import type { TriggerActionPair } from "@/types/game"
import { buildTriggerActionPairs } from "./protocol-builder"

export interface CharacterPreset {
  id: string
  name: string
  color: string
  startingPairs: TriggerActionPair[]
}

// Protocol configurations using stable IDs instead of array indices
const ASSAULT_PROTOCOLS = [
  { triggerId: "high-hp", actionId: "move-forward", priority: 4 },
  { triggerId: "same-row", actionId: "power-shot", priority: 3 },
  { triggerId: "different-row", actionId: "move-up", priority: 2 },
  { triggerId: "always", actionId: "shoot", priority: 1 },
]

const GUARDIAN_PROTOCOLS = [
  { triggerId: "low-hp", actionId: "heal", priority: 4 },
  { triggerId: "just-took-damage", actionId: "move-backward", priority: 3 },
  { triggerId: "different-row", actionId: "move-up", priority: 2 },
  { triggerId: "always", actionId: "shoot", priority: 1 },
]

const SNIPER_PROTOCOLS = [
  { triggerId: "enemy-far", actionId: "charge-shot", priority: 4 },
  { triggerId: "enemy-close", actionId: "move-backward", priority: 3 },
  { triggerId: "different-row", actionId: "move-up", priority: 2 },
  { triggerId: "always", actionId: "shoot", priority: 1 },
]

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: "assault",
    name: "ASSAULT",
    color: "#ff3366",
    startingPairs: buildTriggerActionPairs(ASSAULT_PROTOCOLS),
  },
  {
    id: "guardian",
    name: "GUARDIAN",
    color: "#00ffcc",
    startingPairs: buildTriggerActionPairs(GUARDIAN_PROTOCOLS),
  },
  {
    id: "sniper",
    name: "SNIPER",
    color: "#9933ff",
    startingPairs: buildTriggerActionPairs(SNIPER_PROTOCOLS),
  },
]
