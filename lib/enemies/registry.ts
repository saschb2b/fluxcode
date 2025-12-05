import { EnemyDefinition } from "./types";
import { SENTRY_VARIANTS } from "./definitions/sentry";
import { EnemyState } from "@/types/game";
import { FLOATER_VARIANTS } from "./definitions/floater";
import { SCRAPPER_VARIANTS } from "./definitions/scrapper";
import { WARDEN_VARIANTS } from "./definitions/warden";
import { PITCHER_VARIANTS } from "./definitions/pitcher";
import { REVENANT_VARIANTS } from "./definitions/revenant";
import { CYBERZILLA_VARIANTS } from "./definitions/cyberZilla";
import { HEISENBUG_VARIANTS } from "./definitions/heisebug";
import { GITHYDRA_VARIANTS } from "./definitions/gitHydra";
import { MOBILE_PHONE_VARIANTS } from "./definitions/mobilePhones";
import { COOLING_VARIANTS } from "./definitions/cooling";

const normalizeVariants = (variants: Record<string, EnemyDefinition>) => {
  return Object.values(variants).reduce(
    (acc, def) => {
      acc[def.id] = def; // Key by "sentry-alpha", NOT "alpha"
      return acc;
    },
    {} as Record<string, EnemyDefinition>,
  );
};

/**
 * Central Catalog
 */
export const ENEMY_REGISTRY: Record<string, EnemyDefinition> = {
  ...normalizeVariants(SENTRY_VARIANTS),
  ...normalizeVariants(FLOATER_VARIANTS),
  ...normalizeVariants(SCRAPPER_VARIANTS),
  ...normalizeVariants(PITCHER_VARIANTS),
  ...normalizeVariants(CYBERZILLA_VARIANTS),
  ...normalizeVariants(HEISENBUG_VARIANTS),
  ...normalizeVariants(MOBILE_PHONE_VARIANTS),
  ...normalizeVariants(COOLING_VARIANTS),
  // Bosses
  ...normalizeVariants(WARDEN_VARIANTS),
  ...normalizeVariants(REVENANT_VARIANTS),
  ...normalizeVariants(GITHYDRA_VARIANTS),
};

/**
 * Helper to find definitions
 */
export const getEnemyDefinition = (id: string): EnemyDefinition | undefined => {
  return ENEMY_REGISTRY[id];
};

/**
 * Helper to create enemy state
 */
export const createEnemyState = (
  definitionId: string,
  position: { x: number; y: number },
  instanceIndex: number,
): EnemyState => {
  const def = ENEMY_REGISTRY[definitionId];
  if (!def) throw new Error(`Enemy definition not found: ${definitionId}`);

  // 1. Get the ID of the starting phase (e.g., "patrol")
  const startPhaseId = def.ai.initialPhase;

  // 2. Retrieve the actual phase data
  const startPhase = def.ai.phases[startPhaseId];

  if (!startPhase) {
    throw new Error(
      `Enemy ${definitionId} missing initial phase '${startPhaseId}'`,
    );
  }

  return {
    // Identity
    id: `enemy-${instanceIndex}`,
    definitionId: def.id,
    name: def.name,
    isPawn: false,

    // Position
    position: { ...position },

    // Stats
    hp: def.baseHp,
    maxHp: def.baseHp,
    shields: def.baseShields,
    maxShields: def.baseShields,
    armor: def.baseArmor,
    maxArmor: def.baseArmor,
    resistances: def.resistances,

    // Logic: Load protocols from the initial phase
    triggerActionPairs: [...startPhase.movement, ...startPhase.tactical],

    // State Machine Tracking (Important for transitions later)
    currentPhaseId: startPhaseId,

    // Status State
    burnStacks: [],
    viralStacks: [],
    empStacks: [],
    lagStacks: [],
    displaceStacks: [],
    corrosiveStacks: [],
    shieldRegenDisabled: false,
  };
};
