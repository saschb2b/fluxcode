import { DamageType } from "@/types/game";
import type { Action } from "@/types/game";
import {
  createShootAction,
  createRapidFireAction,
  createWaveAction,
} from "./factories";

export const KINETIC_ACTIONS: Action[] = [
  createShootAction("shoot", "Shoot", 10, DamageType.KINETIC, 1000),
  createRapidFireAction(
    "rapid-fire",
    "Rapid Fire",
    5,
    3,
    DamageType.KINETIC,
    2500,
  ),
  createRapidFireAction(
    "burst-fire",
    "Burst Fire",
    4,
    5,
    DamageType.KINETIC,
    3000,
  ),
  createShootAction(
    "kinetic-shot",
    "Kinetic Shot",
    12,
    DamageType.KINETIC,
    1200,
  ),
  createShootAction("power-shot", "Power Shot", 25, DamageType.KINETIC, 2000),
  createShootAction("railgun", "Railgun", 28, DamageType.KINETIC, 2800),
  createShootAction("sniper-shot", "Sniper Shot", 30, DamageType.KINETIC, 2500),
  createShootAction(
    "shotgun-blast",
    "Shotgun Blast",
    32,
    DamageType.KINETIC,
    2200,
  ),
  createWaveAction("wave-attack", "Wave Attack", 18, DamageType.KINETIC, 2500),
  createWaveAction("shockwave", "Shockwave", 20, DamageType.KINETIC, 2200),
  createRapidFireAction("vulcan", "Vulcan", 3, 8, DamageType.KINETIC, 4000),
  {
    id: "dash-attack",
    name: "Dash Attack",
    description: "Rush forward while attacking (15 damage)",
    cooldown: 2000,
    damageType: DamageType.KINETIC,
    coreType: "tactical",
    execute: (context) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newX = context.isPlayer
        ? Math.min(currentX + 1, 2)
        : Math.max(currentX - 1, 3);

      return {
        type: "dash-attack" as const,
        position: { x: newX, y: currentY },
        damage: 15,
        damageType: DamageType.KINETIC,
      };
    },
  },
  {
    id: "retreat-shot",
    name: "Retreat Shot",
    description: "Move back while shooting (12 damage)",
    cooldown: 1800,
    damageType: DamageType.KINETIC,
    coreType: "tactical",
    execute: (context) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newX = context.isPlayer
        ? Math.max(currentX - 1, 0)
        : Math.min(currentX + 1, 5);

      return {
        type: "retreat-shot" as const,
        position: { x: newX, y: currentY },
        damage: 12,
        damageType: DamageType.KINETIC,
      };
    },
  },
  {
    id: "sword-slash",
    name: "Sword Slash",
    description: "Melee attack at close range (35 damage)",
    cooldown: 1500,
    damageType: DamageType.KINETIC,
    coreType: "tactical",
    execute: () => ({
      type: "melee" as const,
      damage: 35,
      range: 1,
      damageType: DamageType.KINETIC,
    }),
  },
  {
    id: "wide-slash",
    name: "Wide Slash",
    description: "Slash entire column at close range (30 damage)",
    cooldown: 2000,
    damageType: DamageType.KINETIC,
    coreType: "tactical",
    execute: () => ({
      type: "wide-melee" as const,
      damage: 30,
      range: 1,
      damageType: DamageType.KINETIC,
    }),
  },
  {
    id: "triple-shot",
    name: "Triple Shot",
    description: "Fire 3 shots in different rows (15 damage each)",
    cooldown: 2800,
    damageType: DamageType.KINETIC,
    coreType: "tactical",
    execute: () => ({
      type: "triple-shot" as const,
      damage: 15,
      damageType: DamageType.KINETIC,
    }),
  },
  {
    id: "spread-shot",
    name: "Spread Shot",
    description: "Hits all 3 rows (12 damage each)",
    cooldown: 3000,
    damageType: DamageType.KINETIC,
    coreType: "tactical",
    execute: () => ({
      type: "spread" as const,
      damage: 12,
      damageType: DamageType.KINETIC,
    }),
  },
];
