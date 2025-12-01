import type { Trigger } from "@/types/game";
import {
  createOwnDefenseTrigger,
  createEnemyDefenseTrigger,
} from "./factories";

export const DEFENSE_TRIGGERS: Trigger[] = [
  createOwnDefenseTrigger("shield-active", "Shield Active", "shield", true),
  createOwnDefenseTrigger(
    "shield-depleted",
    "Shield Depleted",
    "shield",
    false,
  ),
  createOwnDefenseTrigger("shields-up", "Shields Active", "shield", true),
  createOwnDefenseTrigger("armor-active", "Armor Active", "armor", true),
  createEnemyDefenseTrigger(
    "enemy-has-shield",
    "Enemy Has Shield",
    "shield",
    true,
  ),
  createEnemyDefenseTrigger(
    "enemy-shield-down",
    "Enemy Shield Down",
    "shield",
    false,
  ),
  createEnemyDefenseTrigger(
    "enemy-has-armor",
    "Enemy Has Armor",
    "armor",
    true,
  ),
  createEnemyDefenseTrigger(
    "enemy-armor-down",
    "Enemy Armor Down",
    "armor",
    false,
  ),
  {
    id: "enemy-exposed",
    name: "Enemy Exposed",
    description: "Triggers when enemy has no shields or armor",
    check: (context) => {
      const noShield = !context.enemyShield || context.enemyShield <= 0;
      const noArmor = !context.enemyArmor || context.enemyArmor <= 0;
      return noShield && noArmor;
    },
  },
];
