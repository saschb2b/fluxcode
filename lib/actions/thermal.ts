import { DamageType } from "@/types/game";
import type { Action } from "@/types/game";
import {
  createShootAction,
  createRapidFireAction,
  createWaveAction,
  createFieldAction,
} from "./factories";

export const THERMAL_ACTIONS: Action[] = [
  createShootAction(
    "flame-shot",
    "Flame Shot",
    10,
    DamageType.THERMAL,
    1400,
    0.5,
  ),
  createRapidFireAction(
    "flame-burst",
    "Flame Burst",
    6,
    5,
    DamageType.THERMAL,
    3500,
    0.4,
  ),
  createShootAction(
    "inferno-blast",
    "Inferno Blast",
    30,
    DamageType.THERMAL,
    3200,
    0.8,
  ),
  createWaveAction(
    "molten-wave",
    "Molten Wave",
    24,
    DamageType.THERMAL,
    3000,
    1.0,
  ),
  createFieldAction(
    "firewall",
    "Firewall",
    8,
    DamageType.THERMAL,
    4500,
    4000,
    0.9,
  ),
  {
    id: "dragon-breath",
    name: "Dragon Breath",
    description: "Devastating flame cone (40 damage, burns all rows)",
    cooldown: 4500,
    damageType: DamageType.THERMAL,
    coreType: "tactical",
    execute: () => ({
      type: "spread" as const,
      damage: 40,
      damageType: DamageType.THERMAL,
      statusChance: 0.85,
    }),
  },
];
