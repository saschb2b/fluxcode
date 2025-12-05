import { FlipBruteModel } from "@/components/enemies/models/MobilePhones/FlipBruteModel";
import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { NokiaBruteModel } from "@/components/enemies/models/MobilePhones/NokiaBruteModel";

export const MOBILE_PHONE_VARIANTS: Record<string, EnemyDefinition> = {
  alpha: {
    id: "mobilephone-nokia",
    name: "Nokia",
    description:
      "Ancient hardware with legendary durability. Attacks via violent haptic feedback.",
    logicCheck:
      "Legacy Hardware. Its chassis is impervious to impacts; use energy weapons.",
    tier: "alpha", // Mid-tier Heavy Unit

    // Stats: "The Indestructible Brick"
    baseHp: 350, // Very High HP for its tier
    baseShields: 0, // No shields, just raw plastic/metal
    baseArmor: 50, // Extremely high armor (reduces incoming damage)
    resistances: {
      kinetic: 0.8, // Bullets barely scratch it
      concussion: 0.5,
      energy: -0.2, // Weak to battery overload/energy surges
    },

    // Visuals
    renderer: (props) => <NokiaBruteModel {...props} />,

    ai: {
      initialPhase: "roaming",
      phases: {
        roaming: {
          name: "Signal Search",
          movement: [
            // Moves slowly but relentlessly forward (The Hop)
            createPair("enemy-far", "move-forward", 2),
            // Can switch lanes to block shots intended for weaker enemies
            createPair("ally-low-hp", "block-line", 4),
          ],
          tactical: [
            // Main Attack: Vibrates violently to cause area damage
            createPair("enemy-close", "sonic-quake", 5),
            // Ranged Attack: Blinds player with camera flash
            createPair("align-y", "flash-strobe", 3),
            // Self-Buff: "Ring Mode" (Defense up)
            createPair("low-hp", "defense-mode", 1),
          ],
          transitions: [],
        },
      },
    },
  },
  beta: {
    id: "mobilephone-flip-razor",
    name: "V3-Razor",
    description:
      "Sleek clamshell unit. Snaps shut to deliver high-velocity cutting attacks.",
    logicCheck:
      "Interruption. Attack it while open (Idle) to deal critical damage.",
    tier: "beta",

    baseHp: 200,
    baseShields: 50,
    baseArmor: 10,
    resistances: {
      kinetic: 0.5, // Metal shell
    },

    renderer: (props) => <FlipBruteModel {...props} />,

    ai: {
      initialPhase: "snapper",
      phases: {
        snapper: {
          name: "Snap Attack",
          movement: [
            createPair("always", "move-forward", 3), // Fast approach
          ],
          tactical: [
            // Close range snap bite
            createPair("enemy-close", "snap-bite", 5),
            // While closing distance, it might flash blind
            createPair("enemy-far", "flash-strobe", 1),
          ],
          transitions: [],
        },
      },
    },
  },
};
