import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import {
  CallbackCarpModel,
  PromisePiranhaModel,
  ObservableOrcaModel,
} from "@/components/enemies/models/aquatic/StreamSpiritsModels";

export const AQUATIC_VARIANTS: Record<string, EnemyDefinition> = {
  carp: {
    id: "aquatic-carp",
    name: "Callback Carp",
    description:
      "Lag-inducing vermin. Damage registers late due to event loop congestion.",
    logicCheck:
      "Async Lag. Don't spam attacks; the death trigger stack might overflow.",
    tier: "alpha",
    baseHp: 50,
    baseShields: 0,
    baseArmor: 0,
    resistances: {},
    renderer: (props) => <CallbackCarpModel {...props} />,
    ai: {
      initialPhase: "lag_swim",
      phases: {
        lag_swim: {
          name: "Event Loop",
          movement: [createPair("always", "move-forward", 2)],
          tactical: [createPair("enemy-close", "lag-spike", 1)],
          transitions: [],
        },
      },
    },
  },

  piranha: {
    id: "aquatic-piranha",
    name: "Promise Piranha",
    description:
      "Awaiting resolution. Will hang indefinitely until Resolved or Rejected.",
    logicCheck:
      "Pending State. Yellow aura = Invulnerable. Hit 'Reject' to damage.",
    tier: "beta",
    baseHp: 120,
    baseShields: 50,
    baseArmor: 0,
    resistances: { energy: 0.5 },
    renderer: (props) => <PromisePiranhaModel {...props} />,
    ai: {
      initialPhase: "pending",
      phases: {
        pending: {
          name: "Awaiting",
          movement: [createPair("always", "latch-player", 4)], // Sticks to player
          tactical: [createPair("enemy-close", "timeout-bite", 5)],
          transitions: [],
        },
      },
    },
  },

  orca: {
    id: "aquatic-orca",
    name: "Observable Orca",
    description:
      "Massive data stream. Emits damaging events to all subscribers.",
    logicCheck:
      "Memory Leak. Find the unsubscribe token to dissipate the stream.",
    tier: "gamma",
    baseHp: 1000,
    baseShields: 200,
    baseArmor: 20,
    resistances: { kinetic: 0.8 }, // Needs logic/hacking to kill
    renderer: (props) => <ObservableOrcaModel {...props} />,
    ai: {
      initialPhase: "broadcast",
      phases: {
        broadcast: {
          name: "Multicast Stream",
          movement: [createPair("always", "slow-advance", 1)],
          tactical: [
            createPair("always", "pulse-nova", 3), // Constant AoE
            createPair("low-hp", "buffer-overflow", 5), // Enrage
          ],
          transitions: [],
        },
      },
    },
  },
};
