// actions/index.ts
import { KINETIC_ACTIONS } from "./kinetic";
import { THERMAL_ACTIONS } from "./thermal";
import { ENERGY_ACTIONS } from "./energy";
import { CORROSIVE_ACTIONS } from "./corrosive";
import { VIRAL_ACTIONS } from "./viral";
import { GLACIAL_ACTIONS } from "./glacial";
import { CONCUSSION_ACTIONS } from "./concussion";
import { UTILITY_ACTIONS } from "./utility";
import { MOVEMENT_ACTIONS } from "./movement";
import type { Action } from "@/types/game";

export const AVAILABLE_ACTIONS: Action[] = [
  ...MOVEMENT_ACTIONS,
  ...KINETIC_ACTIONS,
  ...THERMAL_ACTIONS,
  ...ENERGY_ACTIONS,
  ...CORROSIVE_ACTIONS,
  ...VIRAL_ACTIONS,
  ...GLACIAL_ACTIONS,
  ...CONCUSSION_ACTIONS,
  ...UTILITY_ACTIONS,
];

export {
  KINETIC_ACTIONS,
  THERMAL_ACTIONS,
  ENERGY_ACTIONS,
  CORROSIVE_ACTIONS,
  VIRAL_ACTIONS,
  GLACIAL_ACTIONS,
  CONCUSSION_ACTIONS,
  UTILITY_ACTIONS,
  MOVEMENT_ACTIONS,
};
