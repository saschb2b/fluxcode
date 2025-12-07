import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { ScrapperModel } from "@/components/enemies/models/ScrapperModel";

export const SCRAPPER_VARIANTS: Record<string, EnemyDefinition> = {
  alpha: {
    id: "scrapper-alpha",
    name: "Scrapper Bot",
    description: "Labor unit. Rushes forward to headbutt intruders.",
    logicCheck: "Mob Control. Weak alone, dangerous when they swarm.",
    tier: "alpha",

    // Low HP, but usually spawn in packs
    baseHp: 50,
    baseShields: 0,
    baseArmor: 10,
    resistances: {},

    // Visuals: Construction Yellow
    renderer: (props) => (
      <ScrapperModel {...props} primaryColor="#eab308" accentColor="#0ea5e9" />
    ),

    ai: {
      initialPhase: "rush",
      phases: {
        rush: {
          name: "Work Rush",
          movement: [
            // Move forward aggressively
            createPair("enemy-far", "move-forward", 2),
            // If blocked, step aside (Smart-ish pathing)
            createPair("always", "random-step", 1),
          ],
          tactical: [
            // Melee attack ("Headbutt" via sword-slash logic)
            createPair("enemy-close", "sword-slash", 2),
          ],
          transitions: [],
        },
      },
    },
  },

  beta: {
    id: "scrapper-beta",
    name: "Heavy Loader",
    description: "Reinforced chassis. Needs armor stripping.",
    logicCheck: "Armor Check. Bring corrosive damage.",
    tier: "beta",

    baseHp: 100,
    baseShields: 0,
    baseArmor: 50,
    resistances: { kinetic: 0.3 },

    // Visuals: Hazard Orange
    renderer: (props) => (
      <ScrapperModel {...props} primaryColor="#f97316" accentColor="#ef4444" />
    ),

    ai: {
      initialPhase: "blockade",
      phases: {
        blockade: {
          name: "Blockade",
          movement: [
            // Advances slowly to the middle and holds
            createPair("enemy-far", "move-forward", 1),
          ],
          tactical: [
            // Pushes you back if you get close
            createPair("enemy-close", "shockwave", 2),
          ],
          transitions: [],
        },
      },
    },
  },
};
