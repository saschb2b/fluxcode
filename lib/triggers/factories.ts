import type { Trigger, BattleContext } from "@/types/game";

/**
 * Creates a trigger that checks own HP threshold.
 */
export const createOwnHpTrigger = (
  id: string,
  name: string,
  threshold: number,
  comparison: "below" | "above" | "equals",
): Trigger => ({
  id,
  name,
  description: `Triggers when your HP is ${comparison} ${threshold}`,
  check: (context: BattleContext) => {
    const myHP = context.isPlayer ? context.playerHP : context.enemyHP;
    if (comparison === "below") return myHP < threshold;
    if (comparison === "above") return myHP > threshold;
    return myHP === threshold;
  },
});

/**
 * Creates a trigger that checks enemy HP threshold.
 */
export const createEnemyHpTrigger = (
  id: string,
  name: string,
  threshold: number,
  comparison: "below" | "above" | "equals",
): Trigger => ({
  id,
  name,
  description: `Triggers when enemy HP is ${comparison} ${threshold}`,
  check: (context: BattleContext) => {
    if (comparison === "below") return context.enemyHP < threshold;
    if (comparison === "above") return context.enemyHP > threshold;
    return context.enemyHP === threshold;
  },
});

/**
 * Creates a trigger that checks own defense status.
 */
export const createOwnDefenseTrigger = (
  id: string,
  name: string,
  defense: "shield" | "armor",
  hasIt: boolean,
): Trigger => ({
  id,
  name,
  description: `Triggers when you ${hasIt ? "have" : "lack"} ${defense}`,
  check: (context: BattleContext) => {
    const value =
      defense === "shield"
        ? context.isPlayer
          ? context.playerShield
          : context.enemyShield
        : context.isPlayer
          ? context.playerArmor
          : context.enemyArmor;

    const hasDefense = !!value && value > 0;
    return hasIt ? hasDefense : !hasDefense;
  },
});

/**
 * Creates a trigger that checks enemy defense status.
 */
export const createEnemyDefenseTrigger = (
  id: string,
  name: string,
  defense: "shield" | "armor",
  hasIt: boolean,
): Trigger => ({
  id,
  name,
  description: `Triggers when enemy ${hasIt ? "has" : "lacks"} ${defense}`,
  check: (context: BattleContext) => {
    const value =
      defense === "shield" ? context.enemyShield : context.enemyArmor;

    const hasDefense = !!value && value > 0;
    return hasIt ? hasDefense : !hasDefense;
  },
});

/**
 * Creates a trigger that checks own row position.
 */
export const createOwnRowTrigger = (
  id: string,
  name: string,
  row: number,
): Trigger => ({
  id,
  name,
  description: `Triggers when in row ${row}`,
  check: (context: BattleContext) => {
    const pos = context.isPlayer ? context.playerPos : context.enemyPos;
    return pos.y === row;
  },
});

/**
 * Creates a trigger that checks own X position.
 */
export const createOwnXPositionTrigger = (
  id: string,
  name: string,
  x: number,
): Trigger => ({
  id,
  name,
  description: `Triggers when at X position ${x}`,
  check: (context: BattleContext) => {
    const pos = context.isPlayer ? context.playerPos : context.enemyPos;
    return pos.x === x;
  },
});

/**
 * Creates a trigger that checks distance to enemy.
 */
export const createDistanceTrigger = (
  id: string,
  name: string,
  distance: number,
  comparison: "equals" | "lessThan" | "greaterThan",
): Trigger => ({
  id,
  name,
  description: `Triggers when distance is ${comparison} ${distance} tiles`,
  check: (context: BattleContext) => {
    const dist = Math.abs(context.playerPos.x - context.enemyPos.x);
    if (comparison === "equals") return dist === distance;
    if (comparison === "lessThan") return dist <= distance;
    return dist > distance;
  },
});

/**
 * Creates a trigger that checks enemy row relationship.
 */
export const createEnemyRowRelationTrigger = (
  id: string,
  name: string,
  relation: "above" | "below" | "same" | "different",
): Trigger => ({
  id,
  name,
  description: `Triggers when enemy is ${relation} your row`,
  check: (context: BattleContext) => {
    const diff = context.enemyPos.y - context.playerPos.y;
    if (relation === "above") return diff < 0;
    if (relation === "below") return diff > 0;
    if (relation === "same") return diff === 0;
    return diff !== 0;
  },
});

/**
 * Creates a trigger that checks for a specific status effect.
 */
export const createStatusEffectTrigger = (
  id: string,
  name: string,
  statusType: string,
  target: "enemy",
): Trigger => ({
  id,
  name,
  description: `Triggers when ${target} has ${statusType}`,
  check: (context: BattleContext) => {
    const effects =
      target === "enemy"
        ? context.enemyStatusEffects || context.enemyStatus
        : context.playerStatusEffects || context.playerStatus;

    return !!effects?.some((e) => e.type === statusType);
  },
});

/**
 * Creates a trigger that checks if damage was just taken.
 */
export const createDamageTakenTrigger = (
  id: string,
  name: string,
): Trigger => ({
  id,
  name,
  description: "Triggers immediately after taking damage",
  check: (context: BattleContext) => context.justTookDamage,
});
