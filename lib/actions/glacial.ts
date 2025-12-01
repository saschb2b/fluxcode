import { DamageType } from "@/types/game";
import type { Action } from "@/types/game";
import {
  createShootAction,
  createWaveAction,
  createFieldAction,
} from "./factories";

export const GLACIAL_ACTIONS: Action[] = [
  createShootAction(
    "cryo-shot",
    "Cryo Shot",
    12,
    DamageType.GLACIAL,
    1600,
    0.7,
  ),
  createShootAction(
    "absolute-zero",
    "Absolute Zero",
    35,
    DamageType.GLACIAL,
    4000,
    1.0,
  ),
  createWaveAction("blizzard", "Blizzard", 18, DamageType.GLACIAL, 3500, 0.8),
  createWaveAction(
    "glacial-spike",
    "Glacial Spike",
    26,
    DamageType.GLACIAL,
    2800,
    0.75,
  ),
  createFieldAction(
    "cryo-field",
    "Cryo Field",
    5,
    DamageType.GLACIAL,
    4000,
    5000,
    1.0,
  ),
  {
    id: "ice-shard-barrage",
    name: "Ice Shard Barrage",
    description: "Triple ice projectiles (14 damage each, freezes)",
    cooldown: 3000,
    damageType: DamageType.GLACIAL,
    coreType: "tactical",
    execute: () => ({
      type: "triple-shot" as const,
      damage: 14,
      damageType: DamageType.GLACIAL,
      statusChance: 0.7,
    }),
  },
];
