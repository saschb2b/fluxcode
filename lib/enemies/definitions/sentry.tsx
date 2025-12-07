import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { SentryModel } from "@/components/enemies/models/SentryModel";

export const SENTRY_VARIANTS: Record<string, EnemyDefinition> = {
  alpha: {
    id: "sentry-alpha",
    name: "Sentry Alpha",
    description: "Standard security drone.",
    logicCheck: "Alignment Check",
    tier: "alpha",

    // Stats
    baseHp: 40,
    baseShields: 0,
    baseArmor: 0,
    resistances: {},

    // VISUALS: Directly returning the component
    renderer: (props) => <SentryModel {...props} />,

    // Logic
    ai: {
      initialPhase: "patrol",
      phases: {
        // PHASE 1: Calm, calculated
        patrol: {
          name: "Patrol Mode",
          movement: [createPair("different-row", "align-y", 2)],
          tactical: [createPair("same-row", "shoot", 2)], // Single shot
          transitions: [
            {
              targetPhase: "panic",
              // Switch if HP drops below 50%
              condition: (ctx) => ctx.hp / ctx.maxHp <= 0.5,
            },
          ],
        },

        // PHASE 2: Fast, aggressive, spammy
        panic: {
          name: "Panic Mode",
          movement: [
            createPair("always", "dodge", 2), // Jittery movement
            createPair("enemy-far", "move-forward", 1),
          ],
          tactical: [
            createPair("always", "rapid-fire", 2), // Spray and pray
          ],
          transitions: [], // No going back!
          onEnter: {
            glowColor: "#ff0000", // Eyes turn red
          },
        },
      },
    },
  },
};
