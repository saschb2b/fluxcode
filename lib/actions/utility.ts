import type { Action } from "@/types/game";
import { createHealAction } from "./factories";

export const UTILITY_ACTIONS: Action[] = [
  createHealAction("heal", "Heal", 20, 5000),
  createHealAction("mega-heal", "Mega Heal", 40, 8000),
  {
    id: "regen",
    name: "Regen",
    description: "Heal 3 HP per second for 5 seconds (15 HP total)",
    cooldown: 5000,
    coreType: "tactical",
    execute: () => ({
      type: "heal-over-time" as const,
      healPerTick: 3,
      duration: 5000,
    }),
  },
  {
    id: "area-heal",
    name: "Area Heal",
    description: "Heal 5 HP per second for 4 seconds (20 HP total)",
    cooldown: 6000,
    coreType: "tactical",
    execute: () => ({
      type: "heal-over-time" as const,
      healPerTick: 5,
      duration: 4000,
    }),
  },
  {
    id: "shield",
    name: "Shield",
    description: "Reduce incoming damage by 50% for 3 seconds",
    cooldown: 5000,
    coreType: "tactical",
    execute: () => ({
      type: "shield" as const,
      duration: 3000,
      reduction: 50,
    }),
  },
  {
    id: "barrier",
    name: "Barrier",
    description: "Block the next incoming attack",
    cooldown: 4000,
    coreType: "tactical",
    execute: () => ({
      type: "barrier" as const,
      duration: 3000,
    }),
  },
  {
    id: "counter",
    name: "Counter",
    description: "Reflect 50% of next attack damage back",
    cooldown: 3500,
    coreType: "tactical",
    execute: () => ({
      type: "counter" as const,
      duration: 2000,
      reflectPercent: 50,
    }),
  },
  {
    id: "berserk",
    name: "Berserk",
    description: "Increase damage by 50% for 5 seconds",
    cooldown: 6000,
    coreType: "tactical",
    execute: () => ({
      type: "buff" as const,
      stat: "damage",
      multiplier: 1.5,
      duration: 5000,
    }),
  },
  {
    id: "speed-boost",
    name: "Speed Boost",
    description: "Reduce all cooldowns by 30% for 4 seconds",
    cooldown: 7000,
    coreType: "tactical",
    execute: () => ({
      type: "buff" as const,
      stat: "cooldown",
      multiplier: 0.7,
      duration: 4000,
    }),
  },
  {
    id: "invincibility",
    name: "Invincibility",
    description: "Become invulnerable for 2 seconds",
    cooldown: 10000,
    coreType: "tactical",
    execute: () => ({
      type: "invincible" as const,
      duration: 2000,
    }),
  },
];
