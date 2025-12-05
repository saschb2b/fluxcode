import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { HeisenbugModel } from "@/components/enemies/models/HeisenbugModel";

export const HEISENBUG_VARIANTS: Record<string, EnemyDefinition> = {
  alpha: {
    id: "heisenbug-alpha",
    name: "Heisenbug",
    description:
      "Quantum anomaly. Exists in multiple states until observed (shot).",
    logicCheck:
      "Stability. Hits force it to materialize, stopping its evasion.",
    tier: "alpha",

    // Stats: Low HP, but annoying Evasion/Shields
    baseHp: 60,
    baseShields: 40,
    baseArmor: 0,
    resistances: {
      energy: 0.5, // Absorbs pure energy
      kinetic: -0.2, // Weak to solid projectiles
    },

    // Visuals
    renderer: (props) => <HeisenbugModel {...props} />,

    ai: {
      initialPhase: "quantum_jitter",
      phases: {
        quantum_jitter: {
          name: "Quantum Flux",
          movement: [
            // Moves erratically across rows
            createPair("always", "move-random-row", 3),
            // occasionally jumps forward
            createPair("enemy-far", "move-forward", 1),
          ],
          tactical: [
            // Doesn't shoot often, but when it does, it's a "Glitch Ray"
            createPair("align-y", "beam-fire", 2),
            // If damaged, it tries to run away (teleport back)
            createPair("low-hp", "move-backward", 4),
          ],
          transitions: [],
        },
      },
    },
  },
};
