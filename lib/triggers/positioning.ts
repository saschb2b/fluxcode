import type { Trigger } from "@/types/game";
import {
  createOwnRowTrigger,
  createOwnXPositionTrigger,
  createDistanceTrigger,
  createEnemyRowRelationTrigger,
} from "./factories";

export const POSITIONING_TRIGGERS: Trigger[] = [
  createOwnXPositionTrigger("at-back", "At Back Position", 0),
  createOwnXPositionTrigger("at-front", "At Front Position", 2),
  createOwnRowTrigger("top-row", "In Top Row", 0),
  createOwnRowTrigger("middle-row", "In Middle Row", 1),
  createOwnRowTrigger("bottom-row", "In Bottom Row", 2),
  createDistanceTrigger(
    "enemy-at-min-distance",
    "Enemy at Minimum Distance",
    1,
    "equals",
  ),
  createDistanceTrigger("enemy-close", "Enemy Close", 1, "lessThan"),
  createDistanceTrigger("in-range", "In Attack Range", 2, "lessThan"),
  createDistanceTrigger("enemy-in-range", "Enemy in Range", 2, "lessThan"),
  createDistanceTrigger("enemy-far", "Enemy Far", 2, "greaterThan"),
  createDistanceTrigger("enemy-very-far", "Enemy Very Far", 3, "greaterThan"),
  createEnemyRowRelationTrigger("same-row", "Same Row as Enemy", "same"),
  createEnemyRowRelationTrigger("different-row", "Different Row", "different"),
  createEnemyRowRelationTrigger("enemy-above", "Enemy Above", "above"),
  createEnemyRowRelationTrigger("enemy-below", "Enemy Below", "below"),
  {
    id: "enemy-at-back",
    name: "Enemy at Back",
    description: "Triggers when enemy is at their backmost position",
    check: (context) =>
      context.isPlayer ? context.enemyPos.x === 5 : context.playerPos.x === 0,
  },
  {
    id: "enemy-at-front",
    name: "Enemy at Front",
    description: "Triggers when enemy is at their frontmost position",
    check: (context) =>
      context.isPlayer ? context.enemyPos.x === 3 : context.playerPos.x === 2,
  },
];
