import { EnemyDefinition } from "../types";
import { createPair } from "../utils";
import { WardenModel } from "@/components/enemies/models/WardenModel";

export const WARDEN_VARIANTS: Record<string, EnemyDefinition> = {
  boss: {
    id: "warden-boss",
    name: "The Warden",
    description:
      "Sector Firewall. Heavily armored. Vulnerable during energy discharge.",
    logicCheck: "Patience Test. Wait for the shield to open.",
    tier: "omega", // BOSS TIER

    baseHp: 500, // Massive HP
    baseShields: 200,
    baseArmor: 100, // Very high armor (simulates the shield)
    resistances: {
      kinetic: 0.8, // Bullets bounce off
      energy: 0.5, // Lasers reflect
      // Weakness: None, except Timing
    },

    renderer: (props) => (
      <WardenModel {...props} primaryColor="#475569" accentColor="#ef4444" />
    ),

    ai: {
      initialPhase: "fortress",
      phases: {
        // PHASE 1: THE DOOR (Defensive)
        fortress: {
          name: "Lockdown",
          movement: [
            // Moves slowly to block your lane
            createPair("different-row", "align-y", 3),
            // If you get close, he pushes you back
            createPair("enemy-close", "shockwave-blast", 2),
          ],
          tactical: [
            // Occasionally drops a shield to self
            createPair("always", "shield", 1),
          ],
          transitions: [
            {
              targetPhase: "purge",
              // Switch to attack mode every 8 seconds (Simulated by HP trigger or random for now)
              // Ideally we'd use 'battleTime' in condition
              condition: (ctx) => ctx.battleTime % 10000 > 8000,
            },
          ],
        },

        // PHASE 2: THE TURRET (Offensive / Vulnerable)
        purge: {
          name: "System Purge",
          movement: [
            // Stands still to fire
            createPair("always", "move", 1), // Just hold position (dummy move)
          ],
          tactical: [
            // BIG BEAM (Railgun)
            createPair("same-row", "railgun", 3),
            createPair("always", "laser-shot", 2),
          ],
          onEnter: {
            glowColor: "#ef4444", // Turns red
          },
          transitions: [
            {
              targetPhase: "fortress",
              // Go back to defense after firing
              condition: (ctx) => ctx.battleTime % 10000 < 2000,
            },
          ],
        },
      },
    },
  },
};
