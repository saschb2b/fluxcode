import { CyberGruntModel } from "@/components/enemies/models/humans/CyberGrundModel";
import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { MikuGruntModel } from "@/components/enemies/models/humans/MikuGruntModel";

export const HUMAN_VARIANTS: Record<string, EnemyDefinition> = {
  standard: {
    id: "human-grunt-std-01",
    name: "Cyber Grunt",
    description: "Standard infantry unit. Heavily armored but predictable.",
    logicCheck:
      "Ballistics. Sidestep their shots; their tracking speed is slow.",
    tier: "alpha",

    baseHp: 100,
    baseShields: 0,
    baseArmor: 20, // Takes a few hits
    resistances: {},

    renderer: (props) => <CyberGruntModel {...props} />,

    ai: {
      initialPhase: "advance",
      phases: {
        advance: {
          name: "Advance & Fire",
          movement: [
            // Walks forward slowly
            createPair("always", "move-forward", 2),
            // Strafes occasionally
            createPair("enemy-far", "strafing-sinewave", 1),
          ],
          tactical: [
            // Standard laser shot
            createPair("align-y", "beam-fire", 3),
          ],
          transitions: [],
        },
      },
    },
  },
  idol: {
    id: "human-grunt-idol-01",
    name: "Idol-Bot",
    description: "High-agility unit with sonic weaponry. Moves to the beat.",
    logicCheck: "Audio cues. Her attacks are rhythmic.",
    tier: "beta", // Stronger than standard grunt

    baseHp: 150,
    baseShields: 50,
    baseArmor: 10,
    resistances: {
      energy: 0.2,
    },

    renderer: (props) => <MikuGruntModel {...props} />,

    ai: {
      initialPhase: "perform",
      phases: {
        perform: {
          name: "Live Performance",
          movement: [
            createPair("always", "strafing-sinewave", 3), // Dancy movement
          ],
          tactical: [
            // Sonic Burst (AoE or wide shot)
            createPair("enemy-close", "sonic-quake", 4),
            // Standard Shot
            createPair("align-y", "beam-fire", 2),
          ],
          transitions: [],
        },
      },
    },
  },
};
