import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import {
  RollerRodentModel,
  OptiSqueakModel,
  MacroMarsupialModel,
} from "@/components/enemies/models/MouseEnemyModels";

export const MICE_VARIANTS: Record<string, EnemyDefinition> = {
  roller: {
    id: "mouse-roller",
    name: "Roller Rodent",
    description:
      "Dust-caked mechanical relic. Moves erratically and resists damage until cleaned.",
    logicCheck:
      "Friction Error. Flip gravity or clean environment to expose the weak trackball.",
    tier: "alpha",
    baseHp: 80,
    baseShields: 0,
    baseArmor: 20, // Lint armor
    resistances: { kinetic: 0.5 },
    renderer: (props) => <RollerRodentModel {...props} />,
    ai: {
      initialPhase: "drift",
      phases: {
        drift: {
          name: "Lint Drift",
          movement: [createPair("always", "random-drift", 2)], // Moves diagonally randomly
          tactical: [createPair("enemy-close", "dust-cloud", 3)], // Blinds player
          transitions: [],
        },
      },
    },
  },

  optical: {
    id: "mouse-optical",
    name: "Opti-Squeak",
    description:
      "High-precision tracker. Suffering from double-click hardware faults.",
    logicCheck: "Reflection. Change floor to 'Glass' to break its tracking.",
    tier: "beta",
    baseHp: 120,
    baseShields: 30,
    baseArmor: 5,
    resistances: { energy: 0.3 },
    renderer: (props) => <OptiSqueakModel {...props} />,
    ai: {
      initialPhase: "track",
      phases: {
        track: {
          name: "Laser Track",
          movement: [createPair("always", "align-y", 5)], // Perfectly tracks Y
          tactical: [
            // Double click: Attacks twice in rapid succession
            createPair("align-y", "phantom-click", 4),
          ],
          transitions: [],
        },
      },
    },
  },

  macro: {
    id: "mouse-macro",
    name: "Macro Marsupial",
    description:
      "eSports-grade menace. Records your moves and replays them back.",
    logicCheck:
      "Input Overflow. Overload its buffer with 'Sleep' commands to crash it.",
    tier: "gamma",
    baseHp: 250,
    baseShields: 100,
    baseArmor: 15,
    resistances: {},
    renderer: (props) => <MacroMarsupialModel {...props} />,
    ai: {
      initialPhase: "record",
      phases: {
        record: {
          name: "Input Recording",
          movement: [createPair("always", "teleport-dodge", 3)],
          tactical: [createPair("timer-3s", "replay-macro", 5)], // Big burst after delay
          transitions: [],
        },
      },
    },
  },
};
