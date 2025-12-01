import type { Trigger } from "@/types/game";
import { POSITIONING_TRIGGERS } from "./positioning";
import { HEALTH_TRIGGERS } from "./health";
import { DEFENSE_TRIGGERS } from "./defenses";
import { STATUS_EFFECT_TRIGGERS } from "./status-effects";

export const AVAILABLE_TRIGGERS: Trigger[] = [
  {
    id: "always",
    name: "Always",
    description: "Always triggers (use as fallback!)",
    check: () => true,
  },
  ...POSITIONING_TRIGGERS,
  ...HEALTH_TRIGGERS,
  ...DEFENSE_TRIGGERS,
  ...STATUS_EFFECT_TRIGGERS,
];

export {
  POSITIONING_TRIGGERS,
  HEALTH_TRIGGERS,
  DEFENSE_TRIGGERS,
  STATUS_EFFECT_TRIGGERS,
};
