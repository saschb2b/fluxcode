import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { PitcherModel } from "@/components/enemies/models/PitcherModel";

export const PITCHER_VARIANTS: Record<string, EnemyDefinition> = {
  alpha: {
    id: "pitcher-alpha",
    name: "Slag Pitcher",
    description: "Mobile artillery furnace. Loves bombing the back row.",
    logicCheck: "Positioning Check. Punishes turtling in the back.",
    tier: "alpha",

    baseHp: 120,
    baseShields: 0,
    baseArmor: 20,
    resistances: { thermal: 0.5 }, // Loves fire

    renderer: (props) => <PitcherModel {...props} />,

    ai: {
      initialPhase: "bombard",
      phases: {
        bombard: {
          name: "Slag Rain",
          movement: [
            // Tries to keep distance (Row 3-5)
            createPair("enemy-close", "move-backward", 2),
            // Tries to avoid alignment (to avoid sniper shots)
            createPair("same-row", "move-up", 1),
          ],
          tactical: [
            // THE GIMMICK: Bombing the back row
            // You need to create a 'mortar-shot' action if you haven't yet
            // or reuse 'bomb'
            createPair("always", "bomb", 2),

            // Defensive Steam
            createPair("enemy-close", "smoke-screen", 3),
          ],
          transitions: [],
        },
      },
    },
  },
};
