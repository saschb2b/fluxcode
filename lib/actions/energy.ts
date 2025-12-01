import { DamageType } from "@/types/game";
import type { Action } from "@/types/game";
import {
  createShootAction,
  createRapidFireAction,
  createWaveAction,
  createFieldAction,
} from "./factories";

export const ENERGY_ACTIONS: Action[] = [
  createShootAction(
    "laser-shot",
    "Laser Shot",
    12,
    DamageType.ENERGY,
    1200,
    0.5,
  ),
  createShootAction(
    "plasma-cannon",
    "Plasma Cannon",
    35,
    DamageType.ENERGY,
    3000,
    0.7,
  ),
  createRapidFireAction(
    "overcharge-beam",
    "Overcharge Beam",
    7,
    6,
    DamageType.ENERGY,
    3800,
    0.6,
  ),
  createWaveAction("emp-pulse", "EMP Pulse", 20, DamageType.ENERGY, 3500, 1.0),
  createFieldAction(
    "tesla-coil",
    "Tesla Coil",
    10,
    DamageType.ENERGY,
    4200,
    4000,
    0.85,
  ),
  {
    id: "chain-lightning",
    name: "Chain Lightning",
    description: "Arc jumps through targets (18 damage, cascading EMP)",
    cooldown: 3200,
    damageType: DamageType.ENERGY,
    coreType: "tactical",
    execute: () => ({
      type: "spread" as const,
      damage: 18,
      damageType: DamageType.ENERGY,
      statusChance: 0.8,
    }),
  },
];
