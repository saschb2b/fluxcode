import type { Trigger, Action, TriggerActionPair } from "@/types/game"
import { AVAILABLE_TRIGGERS } from "./triggers"
import { AVAILABLE_ACTIONS } from "./actions"

export interface CharacterPreset {
  id: string
  name: string
  color: string
  startingPairs: TriggerActionPair[]
  startingTriggers: Trigger[]
  startingActions: Action[]
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: "assault",
    name: "ASSAULT",
    color: "#ff3366",
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[4], // High HP
        action: AVAILABLE_ACTIONS[6], // Move Forward
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[19], // Same Row
        action: AVAILABLE_ACTIONS[1], // Power Shot
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [AVAILABLE_TRIGGERS[4], AVAILABLE_TRIGGERS[19], AVAILABLE_TRIGGERS[20], AVAILABLE_TRIGGERS[23]],
    startingActions: [AVAILABLE_ACTIONS[0], AVAILABLE_ACTIONS[1], AVAILABLE_ACTIONS[6], AVAILABLE_ACTIONS[8]],
  },
  {
    id: "guardian",
    name: "GUARDIAN",
    color: "#00ffcc",
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[5], // Low HP
        action: AVAILABLE_ACTIONS[14], // Heal
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[11], // Just Took Damage
        action: AVAILABLE_ACTIONS[7], // Move Backward
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [AVAILABLE_TRIGGERS[5], AVAILABLE_TRIGGERS[11], AVAILABLE_TRIGGERS[20], AVAILABLE_TRIGGERS[23]],
    startingActions: [AVAILABLE_ACTIONS[0], AVAILABLE_ACTIONS[7], AVAILABLE_ACTIONS[8], AVAILABLE_ACTIONS[14]],
  },
  {
    id: "sniper",
    name: "SNIPER",
    color: "#9933ff",
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[2], // Enemy Far
        action: AVAILABLE_ACTIONS[2], // Charge Shot
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[1], // Enemy Close
        action: AVAILABLE_ACTIONS[7], // Move Backward
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [AVAILABLE_TRIGGERS[1], AVAILABLE_TRIGGERS[2], AVAILABLE_TRIGGERS[20], AVAILABLE_TRIGGERS[23]],
    startingActions: [AVAILABLE_ACTIONS[0], AVAILABLE_ACTIONS[2], AVAILABLE_ACTIONS[7], AVAILABLE_ACTIONS[8]],
  },
]
