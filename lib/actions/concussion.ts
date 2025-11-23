import { DamageType } from "@/types/game";
import type { Action } from "@/types/game";
import {
  createBombAction,
  createWaveAction,
  createRapidFireAction,
  createFieldAction,
} from "./factories";

export const CONCUSSION_ACTIONS: Action[] = [
  createBombAction("bomb", "Bomb", 35, DamageType.CONCUSSION, 3000, 1000, 0.5),
  createBombAction(
    "frag-grenade",
    "Frag Grenade",
    40,
    DamageType.CONCUSSION,
    3000,
    800,
    0.6,
  ),
  createWaveAction(
    "shockwave-blast",
    "Shockwave Blast",
    28,
    DamageType.CONCUSSION,
    2800,
    0.7,
  ),
  createFieldAction(
    "resonance-field",
    "Resonance Field",
    10,
    DamageType.CONCUSSION,
    4200,
    4000,
    0.8,
  ),
  createRapidFireAction(
    "concussive-barrage",
    "Concussive Barrage",
    8,
    6,
    DamageType.CONCUSSION,
    3800,
    0.35,
  ),
  {
    id: "impact-hammer",
    name: "Impact Hammer",
    description: "Heavy melee strike (45 damage, knockback)",
    cooldown: 3200,
    damageType: DamageType.CONCUSSION,
    coreType: "tactical",
    execute: () => ({
      type: "melee" as const,
      damage: 45,
      range: 1,
      damageType: DamageType.CONCUSSION,
      statusChance: 0.85,
    }),
  },
  {
    id: "seismic-charge",
    name: "Seismic Charge",
    description: "Ground-shaking detonation (50 damage, displaces all rows)",
    cooldown: 4500,
    damageType: DamageType.CONCUSSION,
    coreType: "tactical",
    execute: () => ({
      type: "spread" as const,
      damage: 50,
      damageType: DamageType.CONCUSSION,
      statusChance: 0.9,
    }),
  },
];
