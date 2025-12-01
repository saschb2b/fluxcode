import { DamageType } from "@/types/game";
import type { Action } from "@/types/game";
import {
  createShootAction,
  createRapidFireAction,
  createWaveAction,
  createBombAction,
} from "./factories";

export const VIRAL_ACTIONS: Action[] = [
  createShootAction("viral-dart", "Viral Dart", 8, DamageType.VIRAL, 1600, 0.6),
  createRapidFireAction(
    "parasitic-swarm",
    "Parasitic Swarm",
    4,
    7,
    DamageType.VIRAL,
    3600,
    0.5,
  ),
  createWaveAction("contagion", "Contagion", 22, DamageType.VIRAL, 3000, 0.85),
  createBombAction(
    "plague-bomb",
    "Plague Bomb",
    25,
    DamageType.VIRAL,
    3500,
    1000,
    0.8,
  ),
  {
    id: "drain-shot",
    name: "Drain Shot",
    description: "Damage enemy and heal yourself (15 damage, 10 HP)",
    cooldown: 3000,
    damageType: DamageType.VIRAL,
    coreType: "tactical",
    execute: () => ({
      type: "drain" as const,
      damage: 15,
      heal: 10,
      damageType: DamageType.VIRAL,
    }),
  },
  {
    id: "necrotic-strike",
    name: "Necrotic Strike",
    description: "Life-draining attack (20 damage, heal 15 HP, weakens)",
    cooldown: 3500,
    damageType: DamageType.VIRAL,
    coreType: "tactical",
    execute: () => ({
      type: "drain" as const,
      damage: 20,
      heal: 15,
      damageType: DamageType.VIRAL,
      statusChance: 0.7,
    }),
  },
];
