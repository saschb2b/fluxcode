import { NoctuaFanModel } from "@/components/enemies/models/cooling/NoctuaFanModel";
import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { NoctuaRGBFanModel } from "@/components/enemies/models/cooling/NoctuaRGBFanModel";

export const COOLING_VARIANTS: Record<string, EnemyDefinition> = {
  noctua: {
    id: "cooling-fan-silent-120",
    name: "Aero-Spinner",
    description:
      "Premium cooling solution gone rogue. Creates wind tunnels to displace targets.",
    logicCheck: "Turbulence. Its wind push can knock you into other attacks.",
    tier: "alpha",

    baseHp: 120,
    baseShields: 0,
    baseArmor: 5,
    resistances: {
      thermal: -0.5, // Plastic melts
      glacial: 0.5, // It likes cold
    },

    renderer: (props) => <NoctuaFanModel {...props} />,

    ai: {
      initialPhase: "cooling",
      phases: {
        cooling: {
          name: "Cooling Loop",
          movement: [
            // Floats around trying to find a good spot
            createPair("always", "strafing-sinewave", 3),
          ],
          tactical: [
            // Pushes player back (Wind)
            createPair("align-y", "wind-push", 4),
            // Panic: Spins uncontrollably, moving randomly
            createPair("low-hp", "spin-dash", 2),
          ],
          transitions: [],
        },
      },
    },
  },
  chromax: {
    id: "cooling-fan-chromax-rgb",
    name: "RGB-Spinner",
    description:
      "High-performance black edition with gamer lighting. Faster spin, higher damage.",
    logicCheck: "Overclocked. The RGB glow indicates increased attack speed.",
    tier: "beta",

    baseHp: 180, // Higher HP
    baseShields: 50, // Added shielding
    baseArmor: 10,
    resistances: {
      energy: 0.2, // Resistant to lasers
      thermal: -0.2,
    },

    renderer: (props) => <NoctuaRGBFanModel {...props} />,

    ai: {
      initialPhase: "overclock",
      phases: {
        overclock: {
          name: "RGB Cycle",
          movement: [
            createPair("always", "strafing-sinewave", 4), // Faster movement
          ],
          tactical: [
            // Stronger push
            createPair("align-y", "wind-push", 3),
            // RGB Strobe Burst (Area Damage)
            createPair("enemy-close", "rgb-burst", 5),
          ],
          transitions: [],
        },
      },
    },
  },
};
