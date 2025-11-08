import type { Trigger, BattleContext } from "@/types/game"

export const AVAILABLE_TRIGGERS: Trigger[] = [
  // Distance-based triggers
  {
    id: "enemy-in-range",
    name: "Enemy in Range",
    description: "Triggers when enemy is within 2 tiles horizontally",
    check: (context: BattleContext) => {
      return Math.abs(context.playerPos.x - context.enemyPos.x) <= 2
    },
  },
  {
    id: "enemy-close",
    name: "Enemy Close",
    description: "Triggers when enemy is within 1 tile horizontally",
    check: (context: BattleContext) => {
      return Math.abs(context.playerPos.x - context.enemyPos.x) <= 1
    },
  },
  {
    id: "enemy-far",
    name: "Enemy Far",
    description: "Triggers when enemy is more than 2 tiles away",
    check: (context: BattleContext) => {
      return Math.abs(context.playerPos.x - context.enemyPos.x) > 2
    },
  },
  {
    id: "enemy-very-far",
    name: "Enemy Very Far",
    description: "Triggers when enemy is more than 3 tiles away",
    check: (context: BattleContext) => {
      return Math.abs(context.playerPos.x - context.enemyPos.x) > 3
    },
  },

  // HP-based triggers (Self)
  {
    id: "high-hp",
    name: "High HP",
    description: "Triggers when your HP is above 70%",
    check: (context: BattleContext) => {
      const myHP = context.isPlayer ? context.playerHP : context.enemyHP
      return myHP > 70
    },
  },
  {
    id: "low-hp",
    name: "Low HP",
    description: "Triggers when your HP is below 30%",
    check: (context: BattleContext) => {
      const myHP = context.isPlayer ? context.playerHP : context.enemyHP
      return myHP < 30
    },
  },
  {
    id: "critical-hp",
    name: "Critical HP",
    description: "Triggers when your HP is below 15%",
    check: (context: BattleContext) => {
      const myHP = context.isPlayer ? context.playerHP : context.enemyHP
      return myHP < 15
    },
  },
  {
    id: "full-hp",
    name: "Full HP",
    description: "Triggers when your HP is at maximum",
    check: (context: BattleContext) => {
      const myHP = context.isPlayer ? context.playerHP : context.enemyHP
      return myHP >= 100
    },
  },

  // HP-based triggers (Enemy)
  {
    id: "enemy-high-hp",
    name: "Enemy High HP",
    description: "Triggers when enemy HP is above 70%",
    check: (context: BattleContext) => {
      return context.enemyHP > 70
    },
  },
  {
    id: "enemy-low-hp",
    name: "Enemy Low HP",
    description: "Triggers when enemy HP is below 30%",
    check: (context: BattleContext) => {
      return context.enemyHP < 30
    },
  },
  {
    id: "enemy-critical-hp",
    name: "Enemy Critical HP",
    description: "Triggers when enemy HP is below 15%",
    check: (context: BattleContext) => {
      return context.enemyHP < 15
    },
  },

  // Damage triggers
  {
    id: "took-damage",
    name: "Just Took Damage",
    description: "Triggers immediately after taking damage",
    check: (context: BattleContext) => {
      return context.justTookDamage
    },
  },

  // Position-based triggers (Self)
  {
    id: "at-front",
    name: "At Front Position",
    description: "Triggers when at the frontmost position",
    check: (context: BattleContext) => {
      const pos = context.isPlayer ? context.playerPos : context.enemyPos
      return context.isPlayer ? pos.x === 2 : pos.x === 3
    },
  },
  {
    id: "at-back",
    name: "At Back Position",
    description: "Triggers when at the backmost position",
    check: (context: BattleContext) => {
      const pos = context.isPlayer ? context.playerPos : context.enemyPos
      return context.isPlayer ? pos.x === 0 : pos.x === 5
    },
  },
  {
    id: "top-row",
    name: "In Top Row",
    description: "Triggers when in the top row",
    check: (context: BattleContext) => {
      const pos = context.isPlayer ? context.playerPos : context.enemyPos
      return pos.y === 0
    },
  },
  {
    id: "middle-row",
    name: "In Middle Row",
    description: "Triggers when in the middle row",
    check: (context: BattleContext) => {
      const pos = context.isPlayer ? context.playerPos : context.enemyPos
      return pos.y === 1
    },
  },
  {
    id: "bottom-row",
    name: "In Bottom Row",
    description: "Triggers when in the bottom row",
    check: (context: BattleContext) => {
      const pos = context.isPlayer ? context.playerPos : context.enemyPos
      return pos.y === 2
    },
  },

  // Position-based triggers (Enemy)
  {
    id: "enemy-at-front",
    name: "Enemy at Front",
    description: "Triggers when enemy is at their frontmost position",
    check: (context: BattleContext) => {
      return context.isPlayer ? context.enemyPos.x === 3 : context.playerPos.x === 2
    },
  },
  {
    id: "enemy-at-back",
    name: "Enemy at Back",
    description: "Triggers when enemy is at their backmost position",
    check: (context: BattleContext) => {
      return context.isPlayer ? context.enemyPos.x === 5 : context.playerPos.x === 0
    },
  },

  // Row alignment triggers
  {
    id: "same-row",
    name: "Same Row as Enemy",
    description: "Triggers when player and enemy are in the same row",
    check: (context: BattleContext) => {
      return context.playerPos.y === context.enemyPos.y
    },
  },
  {
    id: "different-row",
    name: "Different Row",
    description: "Triggers when player and enemy are in different rows",
    check: (context: BattleContext) => {
      return context.playerPos.y !== context.enemyPos.y
    },
  },
  {
    id: "enemy-above",
    name: "Enemy Above",
    description: "Triggers when enemy is in a row above",
    check: (context: BattleContext) => {
      return context.enemyPos.y < context.playerPos.y
    },
  },
  {
    id: "enemy-below",
    name: "Enemy Below",
    description: "Triggers when enemy is in a row below",
    check: (context: BattleContext) => {
      return context.enemyPos.y > context.playerPos.y
    },
  },

  // Defense layer detection triggers for Warframe-inspired system
  // Enemy defense layer triggers
  {
    id: "enemy-has-shield",
    name: "Enemy Has Shield",
    description: "Triggers when enemy has active shields",
    check: (context: BattleContext) => {
      return !!context.enemyShield && context.enemyShield > 0
    },
  },
  {
    id: "enemy-shield-down",
    name: "Enemy Shield Down",
    description: "Triggers when enemy shields are depleted",
    check: (context: BattleContext) => {
      return !context.enemyShield || context.enemyShield <= 0
    },
  },
  {
    id: "enemy-has-armor",
    name: "Enemy Has Armor",
    description: "Triggers when enemy has armor",
    check: (context: BattleContext) => {
      return !!context.enemyArmor && context.enemyArmor > 0
    },
  },
  {
    id: "enemy-armor-down",
    name: "Enemy Armor Down",
    description: "Triggers when enemy armor is depleted",
    check: (context: BattleContext) => {
      return !context.enemyArmor || context.enemyArmor <= 0
    },
  },
  {
    id: "enemy-exposed",
    name: "Enemy Exposed",
    description: "Triggers when enemy has no shields or armor",
    check: (context: BattleContext) => {
      const noShield = !context.enemyShield || context.enemyShield <= 0
      const noArmor = !context.enemyArmor || context.enemyArmor <= 0
      return noShield && noArmor
    },
  },

  // Self defense layer triggers
  {
    id: "shield-active",
    name: "Shield Active",
    description: "Triggers when you have active shields",
    check: (context: BattleContext) => {
      const myShield = context.isPlayer ? context.playerShield : context.enemyShield
      return !!myShield && myShield > 0
    },
  },
  {
    id: "shield-depleted",
    name: "Shield Depleted",
    description: "Triggers when your shields are down",
    check: (context: BattleContext) => {
      const myShield = context.isPlayer ? context.playerShield : context.enemyShield
      return !myShield || myShield <= 0
    },
  },
  {
    id: "armor-active",
    name: "Armor Active",
    description: "Triggers when you have armor remaining",
    check: (context: BattleContext) => {
      const myArmor = context.isPlayer ? context.playerArmor : context.enemyArmor
      return !!myArmor && myArmor > 0
    },
  },

  // Status effect triggers
  {
    id: "enemy-burning",
    name: "Enemy Burning",
    description: "Triggers when enemy is affected by burn DOT",
    check: (context: BattleContext) => {
      return !!context.enemyStatusEffects?.some((e) => e.type === "burn")
    },
  },
  {
    id: "enemy-corroded",
    name: "Enemy Corroded",
    description: "Triggers when enemy armor is corroded",
    check: (context: BattleContext) => {
      return !!context.enemyStatusEffects?.some((e) => e.type === "corrode")
    },
  },
  {
    id: "enemy-infected",
    name: "Enemy Infected",
    description: "Triggers when enemy has viral infection",
    check: (context: BattleContext) => {
      return !!context.enemyStatusEffects?.some((e) => e.type === "viral_infection")
    },
  },
  {
    id: "enemy-emp",
    name: "Enemy EMP'd",
    description: "Triggers when enemy shields are disabled by EMP",
    check: (context: BattleContext) => {
      return !!context.enemyStatusEffects?.some((e) => e.type === "emp")
    },
  },
  {
    id: "enemy-stunned",
    name: "Enemy Stunned",
    description: "Triggers when enemy is stunned",
    check: (context: BattleContext) => {
      return !!context.enemyStatusEffects?.some((e) => e.type === "stun")
    },
  },
  {
    id: "enemy-slowed",
    name: "Enemy Slowed",
    description: "Triggers when enemy is slowed by glacial damage",
    check: (context: BattleContext) => {
      return !!context.enemyStatus?.some((e) => e.type === "slow")
    },
  },
  {
    id: "enemy-degraded",
    name: "Enemy Armor Degraded",
    description: "Triggers when enemy armor is being corroded",
    check: (context: BattleContext) => {
      return !!context.enemyStatus?.some((e) => e.type === "degrade")
    },
  },
  {
    id: "enemy-logic-disabled",
    name: "Enemy Logic Disabled",
    description: "Triggers when enemy protocol is disabled by magnetic",
    check: (context: BattleContext) => {
      return !!context.enemyStatus?.some((e) => e.type === "disable")
    },
  },
  {
    id: "enemy-arcing",
    name: "Enemy Arcing",
    description: "Triggers when enemy is being electrocuted",
    check: (context: BattleContext) => {
      return !!context.enemyStatus?.some((e) => e.type === "arc")
    },
  },

  // Universal trigger
  {
    id: "always",
    name: "Always",
    description: "Always triggers (use as fallback!)",
    check: () => true,
  },
]
