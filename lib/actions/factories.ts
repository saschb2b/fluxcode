import type { Action, BattleContext, Position } from "@/types/game";
import { DamageType } from "@/types/game";

/**
 * Creates a simple shoot action.
 */
export const createShootAction = (
  id: string,
  name: string,
  damage: number,
  damageType: DamageType,
  cooldown: number,
  statusChance = 0,
): Action => ({
  id,
  name,
  description: `${name} (${damage} damage)`,
  cooldown,
  damageType,
  coreType: "tactical",
  execute: () => ({
    type: "shoot" as const,
    damage,
    damageType,
    statusChance,
  }),
});

/**
 * Creates a rapid-fire action.
 */
export const createRapidFireAction = (
  id: string,
  name: string,
  damage: number,
  count: number,
  damageType: DamageType,
  cooldown: number,
  statusChance = 0,
): Action => ({
  id,
  name,
  description: `${name} (${count} shots, ${damage} damage each)`,
  cooldown,
  damageType,
  coreType: "tactical",
  execute: () => ({
    type: "rapid-fire" as const,
    damage,
    count,
    damageType,
    statusChance,
  }),
});

/**
 * Creates a wave/spread action.
 */
export const createWaveAction = (
  id: string,
  name: string,
  damage: number,
  damageType: DamageType,
  cooldown: number,
  statusChance = 0,
): Action => ({
  id,
  name,
  description: `${name} (${damage} damage across row)`,
  cooldown,
  damageType,
  coreType: "tactical",
  execute: () => ({
    type: "wave" as const,
    damage,
    damageType,
    statusChance,
  }),
});

/**
 * Creates a bomb/grenade action.
 */
export const createBombAction = (
  id: string,
  name: string,
  damage: number,
  damageType: DamageType,
  cooldown: number,
  delay: number,
  statusChance = 0,
): Action => ({
  id,
  name,
  description: `${name} (${damage} damage, delayed)`,
  cooldown,
  damageType,
  coreType: "tactical",
  execute: () => ({
    type: "bomb" as const,
    damage,
    damageType,
    statusChance,
    delay,
  }),
});

/**
 * Creates a field/area action.
 */
export const createFieldAction = (
  id: string,
  name: string,
  damage: number,
  damageType: DamageType,
  cooldown: number,
  duration: number,
  statusChance = 0,
): Action => ({
  id,
  name,
  description: `${name} (${damage} damage/sec for ${duration / 1000}s)`,
  cooldown,
  damageType,
  coreType: "tactical",
  execute: () => ({
    type: "field" as const,
    damage,
    damageType,
    duration,
    statusChance,
  }),
});

/**
 * Creates a heal action.
 */
export const createHealAction = (
  id: string,
  name: string,
  amount: number,
  cooldown: number,
): Action => ({
  id,
  name,
  description: `Restore ${amount} HP`,
  cooldown,
  coreType: "tactical",
  execute: () => ({
    type: "heal" as const,
    amount,
  }),
});

/**
 * Creates a movement action.
 */
export const createMoveAction = (
  id: string,
  name: string,
  cooldown: number,
  execute: (context: BattleContext) => { type: "move"; position: Position },
): Action => ({
  id,
  name,
  description: `Move to new position`,
  cooldown,
  coreType: "movement",
  execute,
});
