import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { CyberZillaModel } from "@/components/enemies/models/CyberZillaModel";

export const CYBERZILLA_VARIANTS: Record<string, EnemyDefinition> = {
  beta: {
    id: "cyberzilla-beta",
    name: "CyberZilla",
    description: "Compact fusion reactor with an attitude problem.",
    logicCheck: "Aggressor. It aligns with you to unleash atomic breath.",
    tier: "beta",

    // Stats: Tanky but slow
    baseHp: 250,
    baseShields: 50, // Dorsal plates provide some shielding
    baseArmor: 25,
    resistances: {
      thermal: 0.5, // He eats fire
    },

    // Visuals: passed directly
    renderer: (props) => <CyberZillaModel {...props} />,

    ai: {
      initialPhase: "rampage",
      phases: {
        rampage: {
          name: "Rampage",
          movement: [
            // Prioritize getting into shooting range/lane
            createPair("different-row", "align-y", 4),
            // March forward relentlessly
            createPair("enemy-far", "move-forward", 2),
          ],
          tactical: [
            // The signature move: Beam attack when aligned
            createPair("same-row", "beam-fire", 5),
            // Defensive roar if damaged heavily (simulated by shield gen or self-buff)
            createPair("low-hp", "shield-gen", 1),
          ],
          transitions: [],
        },
      },
    },
  },
};
