import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { FloaterModel } from "@/components/enemies/models/FloaterModel";

export const FLOATER_VARIANTS: Record<string, EnemyDefinition> = {
  alpha: {
    id: "floater-alpha",
    name: "Floater",
    description:
      "Curious data-gathering unit. Harmless alone, annoying in groups.",
    logicCheck: "Obstruction. It drifts into your lane to block shots.",
    tier: "alpha",

    // Stats: High HP sponge (it's round and bouncy)
    baseHp: 80,
    baseShields: 0,
    baseArmor: 10,
    resistances: {},

    // Visuals: White body, Blue eyes (Innocent)
    renderer: (props) => <FloaterModel {...props} />,

    ai: {
      initialPhase: "curious",
      phases: {
        curious: {
          name: "Observation",
          movement: [
            // It tries to align with you to "watch" you
            createPair("different-row", "align-y", 2),
            // If you get too close, it panics and backs up
            createPair("enemy-close", "move-backward", 3),
          ],
          tactical: [
            // It doesn't shoot! It just drops fields (e.g. slowing fields)
            // "Accidentally" leaking data
            createPair("always", "cryo-field", 2),
          ],
          transitions: [],
        },
      },
    },
  },
};
