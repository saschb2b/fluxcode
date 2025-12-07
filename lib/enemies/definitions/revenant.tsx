// lib/enemies/definitions/revenant.ts
import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { RevenantModel } from "@/components/enemies/models/RevenantModel";

export const REVENANT_VARIANTS: Record<string, EnemyDefinition> = {
  omega: {
    id: "revenant-omega",
    name: "The Revenant",
    description: "A rogue program. Warps the arena with dark energy.",
    logicCheck: "Phase Transition. Requires adaptability and burst damage.", // More descriptive
    tier: "omega",

    // Core Stats
    baseHp: 800,
    baseShields: 300,
    baseArmor: 150,
    // Resistances and Weaknesses to define strategic choices
    resistances: {
      kinetic: 0.5, // Halves kinetic damage (hard to hit physically)
      energy: 0.5, // Halves energy damage (absorbs energy)
      concussion: 0.8, // Strong resistance to stun/displace effects
      viral: -0.2, // Slight weakness to viral (corruption)
    },

    // --- VISUALS ---
    renderer: (props) => (
      <RevenantModel
        {...props}
        primaryColor="#0f172a" // Deep, dark body color
        accentColor="#a855f7" // Signature purple energy/eye color
      />
    ),

    // --- AI STATE MACHINE ---
    ai: {
      initialPhase: "guard", // Boss starts in a defensive/observational state
      phases: {
        // PHASE 1: DIGITAL GUARD - The "Observational" Phase
        guard: {
          name: "Digital Guard",
          movement: [
            // Sentinel is largely stationary, with subtle shifts to avoid easy targeting
            createPair("enemy-far", "move-forward", 2), // Rarely moves forward
            createPair("always", "random-step", 1), // Drifts slightly
          ],
          tactical: [
            // Primary attack: Launches bombs (Dark Bombardment)
            createPair("always", "bomb", 3),
            // Secondary attack: Creates an area denial/status effect
            createPair("always", "cryo-field", 2), // Placeholder for "Code Corruption" field
          ],
          transitions: [
            {
              targetPhase: "enraged",
              // Transitions when HP drops below 50%
              condition: (ctx) => ctx.hp / ctx.maxHp <= 0.5,
            },
          ],
        },

        // PHASE 2: OVERLOAD - The "Aggressive" Phase (triggered by low HP)
        enraged: {
          name: "Overload",
          // Movement becomes more unpredictable and aggressive
          movement: [
            createPair("always", "dodge", 2), // Frequent, erratic dodging (Phase Shift)
          ],
          tactical: [
            // Unlocks powerful, wide-area attacks
            createPair("always", "spread-shot", 3), // Simulates "Shadow Surge" hitting all rows
            createPair("always", "plasma-cannon", 2), // Heavy single-target attack
          ],
          onEnter: {
            // Visual cue: Accent color changes to an aggressive red
            glowColor: "#dc2626",
          },
          transitions: [], // No further transitions (fight to the death)
        },
      },
    },
  },
};
