import type { Trigger } from "@/types/game";
import {
  createStatusEffectTrigger,
  createDamageTakenTrigger,
} from "./factories";

export const STATUS_EFFECT_TRIGGERS: Trigger[] = [
  createStatusEffectTrigger("enemy-burning", "Enemy Burning", "burn", "enemy"),
  createStatusEffectTrigger(
    "enemy-corroded",
    "Enemy Corroded",
    "corrode",
    "enemy",
  ),
  createStatusEffectTrigger(
    "enemy-infected",
    "Enemy Infected",
    "viral_infection",
    "enemy",
  ),
  createStatusEffectTrigger("enemy-emp", "Enemy EMP'd", "emp", "enemy"),
  createStatusEffectTrigger("enemy-stunned", "Enemy Stunned", "stun", "enemy"),
  createStatusEffectTrigger("enemy-slowed", "Enemy Slowed", "slow", "enemy"),
  createStatusEffectTrigger("enemy-lagged", "Enemy Lagged", "lag", "enemy"),
  createStatusEffectTrigger("enemy-arcing", "Enemy Arcing", "arc", "enemy"),
  createStatusEffectTrigger(
    "enemy-degraded",
    "Enemy Armor Degraded",
    "degrade",
    "enemy",
  ),
  createStatusEffectTrigger(
    "enemy-logic-disabled",
    "Enemy Logic Disabled",
    "disable",
    "enemy",
  ),
  createDamageTakenTrigger("took-damage", "Just Took Damage"),
  createDamageTakenTrigger("just-took-damage", "Just Damaged"),
];
