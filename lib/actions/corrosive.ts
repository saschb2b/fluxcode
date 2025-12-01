import { DamageType } from "@/types/game";
import type { Action } from "@/types/game";
import {
  createShootAction,
  createRapidFireAction,
  createWaveAction,
  createFieldAction,
} from "./factories";

export const CORROSIVE_ACTIONS: Action[] = [
  createShootAction(
    "acid-shot",
    "Acid Shot",
    10,
    DamageType.CORROSIVE,
    1500,
    0.5,
  ),
  createShootAction(
    "corrosive-armor-piercer",
    "Armor Piercer (Corrosive)",
    25,
    DamageType.CORROSIVE,
    2800,
    0.9,
  ),
  createRapidFireAction(
    "acid-rain",
    "Acid Rain",
    7,
    5,
    DamageType.CORROSIVE,
    3400,
    0.6,
  ),
  createWaveAction(
    "corrosion-wave",
    "Corrosion Wave",
    22,
    DamageType.CORROSIVE,
    2600,
    0.6,
  ),
  createShootAction(
    "meltdown",
    "Meltdown",
    38,
    DamageType.CORROSIVE,
    4000,
    1.0,
  ),
  createFieldAction(
    "toxic-cloud",
    "Toxic Cloud",
    12,
    DamageType.CORROSIVE,
    4000,
    4000,
    0.8,
  ),
];
