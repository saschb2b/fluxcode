import type { Trigger, Action, TriggerActionPair } from "@/types/game"
import { AVAILABLE_TRIGGERS } from "./triggers"
import { AVAILABLE_ACTIONS } from "./actions"

export interface CharacterPreset {
  id: string
  name: string
  description: string
  playstyle: string
  color: string // Hex color for visual distinction
  startingPairs: TriggerActionPair[]
  startingTriggers: Trigger[]
  startingActions: Action[]
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: "assault",
    name: "ASSAULT",
    description: "Aggressive forward fighter with high damage output",
    playstyle: "Rush down enemies with relentless offense",
    color: "#ff3366", // Red/Pink
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[4], // High HP
        action: AVAILABLE_ACTIONS[6], // Move Forward (pressure enemy)
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[19], // Same Row
        action: AVAILABLE_ACTIONS[1], // Power Shot
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up (reposition)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[4], // High HP
      AVAILABLE_TRIGGERS[19], // Same Row
      AVAILABLE_TRIGGERS[20], // Different Row
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[0], // Shoot
      AVAILABLE_ACTIONS[1], // Power Shot
      AVAILABLE_ACTIONS[6], // Move Forward
      AVAILABLE_ACTIONS[8], // Move Up
    ],
  },
  {
    id: "guardian",
    name: "GUARDIAN",
    description: "Defensive specialist with healing and positioning",
    playstyle: "Outlast enemies with superior defense and mobility",
    color: "#00ffcc", // Cyan
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[5], // Low HP
        action: AVAILABLE_ACTIONS[14], // Heal
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[11], // Just Took Damage
        action: AVAILABLE_ACTIONS[7], // Move Backward (retreat)
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up (reposition)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[5], // Low HP
      AVAILABLE_TRIGGERS[11], // Just Took Damage
      AVAILABLE_TRIGGERS[20], // Different Row
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[0], // Shoot
      AVAILABLE_ACTIONS[7], // Move Backward
      AVAILABLE_ACTIONS[8], // Move Up
      AVAILABLE_ACTIONS[14], // Heal
    ],
  },
  {
    id: "sniper",
    name: "SNIPER",
    description: "Long-range precision fighter with distance control",
    playstyle: "Control distance and strike from afar",
    color: "#9933ff", // Purple
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[2], // Enemy Far
        action: AVAILABLE_ACTIONS[2], // Charge Shot
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[1], // Enemy Close
        action: AVAILABLE_ACTIONS[7], // Move Backward (maintain distance)
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up (reposition)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[1], // Enemy Close
      AVAILABLE_TRIGGERS[2], // Enemy Far
      AVAILABLE_TRIGGERS[20], // Different Row
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[0], // Shoot
      AVAILABLE_ACTIONS[2], // Charge Shot
      AVAILABLE_ACTIONS[7], // Move Backward
      AVAILABLE_ACTIONS[8], // Move Up
    ],
  },
  {
    id: "berserker",
    name: "BERSERKER",
    description: "High-risk, high-reward aggressive fighter",
    playstyle: "Deal massive damage at low HP with aggressive movement",
    color: "#ff6600", // Orange
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[6], // Critical HP
        action: AVAILABLE_ACTIONS[3], // Rapid Fire (berserk mode)
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[5], // Low HP
        action: AVAILABLE_ACTIONS[6], // Move Forward (aggressive)
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[11], // Just Took Damage
        action: AVAILABLE_ACTIONS[1], // Power Shot (counter)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[5], // Low HP
      AVAILABLE_TRIGGERS[6], // Critical HP
      AVAILABLE_TRIGGERS[11], // Just Took Damage
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[0], // Shoot
      AVAILABLE_ACTIONS[1], // Power Shot
      AVAILABLE_ACTIONS[3], // Rapid Fire
      AVAILABLE_ACTIONS[6], // Move Forward
    ],
  },
  {
    id: "tactician",
    name: "TACTICIAN",
    description: "Balanced fighter with adaptive positioning",
    playstyle: "Adapt to any situation with versatile movement",
    color: "#00ff66", // Green
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[11], // Just Took Damage
        action: AVAILABLE_ACTIONS[10], // Dodge
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up (reposition)
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[1], // Enemy Close
        action: AVAILABLE_ACTIONS[7], // Move Backward (spacing)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[1], // Enemy Close
      AVAILABLE_TRIGGERS[11], // Just Took Damage
      AVAILABLE_TRIGGERS[20], // Different Row
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[0], // Shoot
      AVAILABLE_ACTIONS[7], // Move Backward
      AVAILABLE_ACTIONS[8], // Move Up
      AVAILABLE_ACTIONS[10], // Dodge
    ],
  },
  {
    id: "speedster",
    name: "SPEEDSTER",
    description: "Lightning-fast movement specialist",
    playstyle: "Never get hit with superior mobility and kiting",
    color: "#ffff00", // Yellow
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[11], // Just Took Damage
        action: AVAILABLE_ACTIONS[10], // Dodge
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up (reposition)
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[1], // Enemy Close
        action: AVAILABLE_ACTIONS[7], // Move Backward (kiting)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[3], // Rapid Fire
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[1], // Enemy Close
      AVAILABLE_TRIGGERS[11], // Just Took Damage
      AVAILABLE_TRIGGERS[20], // Different Row
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[3], // Rapid Fire
      AVAILABLE_ACTIONS[7], // Move Backward
      AVAILABLE_ACTIONS[8], // Move Up
      AVAILABLE_ACTIONS[10], // Dodge
    ],
  },
  {
    id: "bomber",
    name: "BOMBER",
    description: "Area damage specialist with explosive attacks",
    playstyle: "Control the battlefield with area attacks and spacing",
    color: "#ff9900", // Orange-Yellow
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[0], // Enemy in Range
        action: AVAILABLE_ACTIONS[22], // Cross Bomb
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up (reposition)
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[1], // Enemy Close
        action: AVAILABLE_ACTIONS[7], // Move Backward (spacing)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[20], // Bomb
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[0], // Enemy in Range
      AVAILABLE_TRIGGERS[1], // Enemy Close
      AVAILABLE_TRIGGERS[20], // Different Row
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[7], // Move Backward
      AVAILABLE_ACTIONS[8], // Move Up
      AVAILABLE_ACTIONS[20], // Bomb
      AVAILABLE_ACTIONS[22], // Cross Bomb
    ],
  },
  {
    id: "duelist",
    name: "DUELIST",
    description: "Counter-based reactive fighter with melee focus",
    playstyle: "Turn enemy attacks into opportunities with positioning",
    color: "#cc00ff", // Magenta
    startingPairs: [
      {
        trigger: AVAILABLE_TRIGGERS[11], // Just Took Damage
        action: AVAILABLE_ACTIONS[30], // Counter
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[1], // Enemy Close
        action: AVAILABLE_ACTIONS[17], // Sword Slash (melee)
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20], // Different Row
        action: AVAILABLE_ACTIONS[8], // Move Up (reposition)
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23], // Always
        action: AVAILABLE_ACTIONS[0], // Shoot
        priority: 1,
      },
    ],
    startingTriggers: [
      AVAILABLE_TRIGGERS[1], // Enemy Close
      AVAILABLE_TRIGGERS[11], // Just Took Damage
      AVAILABLE_TRIGGERS[20], // Different Row
      AVAILABLE_TRIGGERS[23], // Always
    ],
    startingActions: [
      AVAILABLE_ACTIONS[0], // Shoot
      AVAILABLE_ACTIONS[8], // Move Up
      AVAILABLE_ACTIONS[17], // Sword Slash
      AVAILABLE_ACTIONS[30], // Counter
    ],
  },
]
