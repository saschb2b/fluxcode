import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { GitHydraModel } from "@/components/enemies/models/GitHydraModel";

export const GITHYDRA_VARIANTS: Record<string, EnemyDefinition> = {
  omega: {
    id: "githydra-omega",
    name: "Git-Hydra",
    description:
      "Recursive serpentine anomaly. Spawns feature branches when damaged.",
    logicCheck: "Merge Conflict. Focus fire on the master head to resolve.",
    tier: "omega",

    baseHp: 400,
    baseShields: 100,
    baseArmor: 20,
    resistances: {
      kinetic: 0.2, // Hard scales
      thermal: -0.1, // Overheats easily
    },

    renderer: (props) => <GitHydraModel {...props} />,

    ai: {
      initialPhase: "main_branch",
      phases: {
        main_branch: {
          name: "Master Branch",
          movement: [
            // Slithers back and forth
            createPair("always", "strafing-sinewave", 3),
          ],
          tactical: [
            // Standard breath attack
            createPair("align-y", "beam-fire", 3),
            // Panic reaction: if low HP, aggressive burst
            createPair("low-hp", "rapid-fire", 5),
          ],
          transitions: [],
        },
      },
    },
  },
};
