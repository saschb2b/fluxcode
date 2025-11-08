import type { Action, BattleContext, Position } from "@/types/game"
import { DamageType } from "@/types/game"

export const AVAILABLE_ACTIONS: Action[] = [
  // Basic shooting actions
  {
    id: "shoot",
    name: "Shoot",
    description: "Fire a standard projectile (10 damage)",
    cooldown: 1000,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 10,
      }
    },
  },
  {
    id: "power-shot",
    name: "Power Shot",
    description: "Fire a powerful shot (25 damage)",
    cooldown: 2000,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 25,
      }
    },
  },
  {
    id: "charge-shot",
    name: "Charge Shot",
    description: "Devastating charged blast (40 damage)",
    cooldown: 3500,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 40,
      }
    },
  },
  {
    id: "rapid-fire",
    name: "Rapid Fire",
    description: "Fire 3 quick shots (5 damage each)",
    cooldown: 2500,
    execute: (context: BattleContext) => {
      return {
        type: "rapid-fire" as const,
        damage: 5,
        count: 3,
      }
    },
  },
  {
    id: "burst-fire",
    name: "Burst Fire",
    description: "Fire 5 rapid shots (4 damage each)",
    cooldown: 3000,
    execute: (context: BattleContext) => {
      return {
        type: "rapid-fire" as const,
        damage: 4,
        count: 5,
      }
    },
  },
  {
    id: "sniper-shot",
    name: "Sniper Shot",
    description: "Precise long-range shot (30 damage)",
    cooldown: 2500,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 30,
      }
    },
  },

  // Movement actions
  {
    id: "move-forward",
    name: "Move Forward",
    description: "Move one tile toward the enemy",
    cooldown: 800,
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer ? context.playerPos.x : context.enemyPos.x
      const currentY = context.isPlayer ? context.playerPos.y : context.enemyPos.y

      let newX: number
      if (context.isPlayer) {
        newX = Math.min(currentX + 1, 2)
      } else {
        newX = Math.max(currentX - 1, 3)
      }

      return {
        type: "move" as const,
        position: { x: newX, y: currentY } as Position,
      }
    },
  },
  {
    id: "move-backward",
    name: "Move Backward",
    description: "Move one tile away from the enemy",
    cooldown: 800,
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer ? context.playerPos.x : context.enemyPos.x
      const currentY = context.isPlayer ? context.playerPos.y : context.enemyPos.y

      let newX: number
      if (context.isPlayer) {
        newX = Math.max(currentX - 1, 0)
      } else {
        newX = Math.min(currentX + 1, 5)
      }

      return {
        type: "move" as const,
        position: { x: newX, y: currentY } as Position,
      }
    },
  },
  {
    id: "move-up",
    name: "Move Up",
    description: "Move to the row above (or toward enemy row)",
    cooldown: 800,
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer ? context.playerPos.x : context.enemyPos.x
      const currentY = context.isPlayer ? context.playerPos.y : context.enemyPos.y
      const enemyY = context.isPlayer ? context.enemyPos.y : context.playerPos.y
      let newY = currentY

      if (currentY > enemyY) {
        newY = Math.max(currentY - 1, 0)
      } else if (currentY < enemyY) {
        newY = Math.min(currentY + 1, 2)
      } else {
        newY = Math.max(currentY - 1, 0)
      }

      return {
        type: "move" as const,
        position: { x: currentX, y: newY } as Position,
      }
    },
  },
  {
    id: "move-down",
    name: "Move Down",
    description: "Move to the row below",
    cooldown: 800,
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer ? context.playerPos.x : context.enemyPos.x
      const currentY = context.isPlayer ? context.playerPos.y : context.enemyPos.y
      const newY = Math.min(currentY + 1, 2)
      return {
        type: "move" as const,
        position: { x: currentX, y: newY } as Position,
      }
    },
  },
  {
    id: "dodge",
    name: "Dodge",
    description: "Quickly move to a random adjacent tile",
    cooldown: 1500,
    execute: (context: BattleContext) => {
      const minX = context.isPlayer ? 0 : 3
      const maxX = context.isPlayer ? 2 : 5
      const currentX = context.isPlayer ? context.playerPos.x : context.enemyPos.x
      const currentY = context.isPlayer ? context.playerPos.y : context.enemyPos.y

      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ]
      const validMoves = directions
        .map((dir) => ({
          x: currentX + dir.x,
          y: currentY + dir.y,
        }))
        .filter((pos) => pos.x >= minX && pos.x <= maxX && pos.y >= 0 && pos.y <= 2)

      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)] || { x: currentX, y: currentY }
      return {
        type: "move" as const,
        position: randomMove as Position,
      }
    },
  },
  {
    id: "dash-attack",
    name: "Dash Attack",
    description: "Rush forward while attacking (15 damage)",
    cooldown: 2000,
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer ? context.playerPos.x : context.enemyPos.x
      const currentY = context.isPlayer ? context.playerPos.y : context.enemyPos.y

      let newX: number
      if (context.isPlayer) {
        newX = Math.min(currentX + 1, 2)
      } else {
        newX = Math.max(currentX - 1, 3)
      }

      return {
        type: "dash-attack" as const,
        position: { x: newX, y: currentY } as Position,
        damage: 15,
      }
    },
  },
  {
    id: "retreat-shot",
    name: "Retreat Shot",
    description: "Move back while shooting (12 damage)",
    cooldown: 1800,
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer ? context.playerPos.x : context.enemyPos.x
      const currentY = context.isPlayer ? context.playerPos.y : context.enemyPos.y

      let newX: number
      if (context.isPlayer) {
        newX = Math.max(currentX - 1, 0)
      } else {
        newX = Math.min(currentX + 1, 5)
      }

      return {
        type: "retreat-shot" as const,
        position: { x: newX, y: currentY } as Position,
        damage: 12,
      }
    },
  },
  {
    id: "teleport",
    name: "Teleport",
    description: "Instantly move to a random position",
    cooldown: 3000,
    execute: (context: BattleContext) => {
      const minX = context.isPlayer ? 0 : 3
      const maxX = context.isPlayer ? 2 : 5
      const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX
      const randomY = Math.floor(Math.random() * 3)

      return {
        type: "move" as const,
        position: { x: randomX, y: randomY } as Position,
      }
    },
  },

  // Healing actions
  {
    id: "heal",
    name: "Heal",
    description: "Restore 20 HP",
    cooldown: 5000,
    execute: (context: BattleContext) => {
      return {
        type: "heal" as const,
        amount: 20,
      }
    },
  },
  {
    id: "mega-heal",
    name: "Mega Heal",
    description: "Restore 40 HP",
    cooldown: 8000,
    execute: (context: BattleContext) => {
      return {
        type: "heal" as const,
        amount: 40,
      }
    },
  },
  {
    id: "drain-shot",
    name: "Drain Shot",
    description: "Damage enemy and heal yourself (15 damage, 10 HP)",
    cooldown: 3000,
    execute: (context: BattleContext) => {
      return {
        type: "drain" as const,
        damage: 15,
        heal: 10,
      }
    },
  },

  // Special attacks
  {
    id: "sword-slash",
    name: "Sword Slash",
    description: "Melee attack at close range (35 damage)",
    cooldown: 1500,
    execute: (context: BattleContext) => {
      return {
        type: "melee" as const,
        damage: 35,
        range: 1,
      }
    },
  },
  {
    id: "wide-slash",
    name: "Wide Slash",
    description: "Slash entire column at close range (30 damage)",
    cooldown: 2000,
    execute: (context: BattleContext) => {
      return {
        type: "wide-melee" as const,
        damage: 30,
        range: 1,
      }
    },
  },
  {
    id: "shockwave",
    name: "Shockwave",
    description: "Ground wave that pierces (20 damage)",
    cooldown: 2200,
    execute: (context: BattleContext) => {
      return {
        type: "piercing-shot" as const,
        damage: 20,
      }
    },
  },
  {
    id: "bomb",
    name: "Bomb",
    description: "Throw bomb with delayed explosion (35 damage)",
    cooldown: 3000,
    execute: (context: BattleContext) => {
      return {
        type: "bomb" as const,
        damage: 35,
        delay: 1000,
      }
    },
  },
  {
    id: "mega-bomb",
    name: "Mega Bomb",
    description: "Massive explosion (50 damage)",
    cooldown: 4000,
    execute: (context: BattleContext) => {
      return {
        type: "bomb" as const,
        damage: 50,
        delay: 1200,
      }
    },
  },
  {
    id: "cross-bomb",
    name: "Cross Bomb",
    description: "Explodes in + pattern (25 damage)",
    cooldown: 2800,
    execute: (context: BattleContext) => {
      return {
        type: "cross-bomb" as const,
        damage: 25,
      }
    },
  },
  {
    id: "wave-attack",
    name: "Wave Attack",
    description: "Hits entire row (18 damage)",
    cooldown: 2500,
    execute: (context: BattleContext) => {
      return {
        type: "wave" as const,
        damage: 18,
      }
    },
  },
  {
    id: "spread-shot",
    name: "Spread Shot",
    description: "Hits all 3 rows (12 damage each)",
    cooldown: 3000,
    execute: (context: BattleContext) => {
      return {
        type: "spread" as const,
        damage: 12,
      }
    },
  },
  {
    id: "homing-shot",
    name: "Homing Shot",
    description: "Tracks enemy position (20 damage)",
    cooldown: 2500,
    execute: (context: BattleContext) => {
      return {
        type: "homing" as const,
        damage: 20,
      }
    },
  },
  {
    id: "triple-shot",
    name: "Triple Shot",
    description: "Fire 3 shots in different rows (15 damage each)",
    cooldown: 2800,
    execute: (context: BattleContext) => {
      return {
        type: "triple-shot" as const,
        damage: 15,
      }
    },
  },
  {
    id: "cannon",
    name: "Cannon",
    description: "Heavy cannon blast (45 damage)",
    cooldown: 3500,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 45,
      }
    },
  },
  {
    id: "vulcan",
    name: "Vulcan",
    description: "Rapid machine gun (8 shots, 3 damage each)",
    cooldown: 4000,
    execute: (context: BattleContext) => {
      return {
        type: "rapid-fire" as const,
        damage: 3,
        count: 8,
      }
    },
  },

  // Defensive actions
  {
    id: "barrier",
    name: "Barrier",
    description: "Block the next incoming attack",
    cooldown: 4000,
    execute: (context: BattleContext) => {
      return {
        type: "barrier" as const,
        duration: 3000,
      }
    },
  },
  {
    id: "counter",
    name: "Counter",
    description: "Reflect 50% of next attack damage back",
    cooldown: 3500,
    execute: (context: BattleContext) => {
      return {
        type: "counter" as const,
        duration: 2000,
        reflectPercent: 50,
      }
    },
  },
  {
    id: "shield",
    name: "Shield",
    description: "Reduce incoming damage by 50% for 3 seconds",
    cooldown: 5000,
    execute: (context: BattleContext) => {
      return {
        type: "shield" as const,
        duration: 3000,
        reduction: 50,
      }
    },
  },
  {
    id: "invincibility",
    name: "Invincibility",
    description: "Become invulnerable for 2 seconds",
    cooldown: 10000,
    execute: (context: BattleContext) => {
      return {
        type: "invincible" as const,
        duration: 2000,
      }
    },
  },

  // Utility actions
  {
    id: "area-heal",
    name: "Area Heal",
    description: "Heal 5 HP per second for 4 seconds (20 HP total)",
    cooldown: 6000,
    execute: (context: BattleContext) => {
      return {
        type: "heal-over-time" as const,
        healPerTick: 5,
        duration: 4000,
      }
    },
  },
  {
    id: "regen",
    name: "Regen",
    description: "Heal 3 HP per second for 5 seconds (15 HP total)",
    cooldown: 5000,
    execute: (context: BattleContext) => {
      return {
        type: "heal-over-time" as const,
        healPerTick: 3,
        duration: 5000,
      }
    },
  },
  {
    id: "speed-boost",
    name: "Speed Boost",
    description: "Reduce all cooldowns by 30% for 4 seconds",
    cooldown: 7000,
    execute: (context: BattleContext) => {
      return {
        type: "buff" as const,
        stat: "cooldown",
        multiplier: 0.7,
        duration: 4000,
      }
    },
  },
  {
    id: "berserk",
    name: "Berserk",
    description: "Increase damage by 50% for 5 seconds",
    cooldown: 6000,
    execute: (context: BattleContext) => {
      return {
        type: "buff" as const,
        stat: "damage",
        multiplier: 1.5,
        duration: 5000,
      }
    },
  },

  // Kinetic damage actions (strong vs armor, weak vs shields)
  {
    id: "kinetic-shot",
    name: "Kinetic Shot",
    description: "Ballistic projectile (12 damage, strong vs armor)",
    cooldown: 1200,
    damageType: DamageType.KINETIC,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 12,
        damageType: DamageType.KINETIC,
      }
    },
  },
  {
    id: "railgun",
    name: "Railgun",
    description: "Armor-piercing shot (28 damage, very strong vs armor)",
    cooldown: 2800,
    damageType: DamageType.KINETIC,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 28,
        damageType: DamageType.KINETIC,
      }
    },
  },

  // Energy damage actions (strong vs shields, weak vs armor)
  {
    id: "laser-shot",
    name: "Laser Shot",
    description: "Energy beam (12 damage, strong vs shields, can EMP)",
    cooldown: 1200,
    damageType: DamageType.ENERGY,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 12,
        damageType: DamageType.ENERGY,
      }
    },
  },
  {
    id: "plasma-cannon",
    name: "Plasma Cannon",
    description: "Superheated plasma (35 damage, melts shields)",
    cooldown: 3000,
    damageType: DamageType.ENERGY,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 35,
        damageType: DamageType.ENERGY,
      }
    },
  },

  // Thermal damage actions (strong vs health, can burn)
  {
    id: "flame-shot",
    name: "Flame Shot",
    description: "Incendiary round (10 damage, can cause burning DOT)",
    cooldown: 1400,
    damageType: DamageType.THERMAL,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 10,
        damageType: DamageType.THERMAL,
      }
    },
  },
  {
    id: "inferno-blast",
    name: "Inferno Blast",
    description: "Devastating fire (30 damage, high burn chance)",
    cooldown: 3200,
    damageType: DamageType.THERMAL,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 30,
        damageType: DamageType.THERMAL,
      }
    },
  },

  // Viral damage actions (very strong vs health)
  {
    id: "viral-dart",
    name: "Viral Dart",
    description: "Bio-weapon (8 damage, infects target for 2x health damage)",
    cooldown: 1600,
    damageType: DamageType.VIRAL,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 8,
        damageType: DamageType.VIRAL,
      }
    },
  },
  {
    id: "plague-bomb",
    name: "Plague Bomb",
    description: "Viral payload (25 damage, spreads infection)",
    cooldown: 3500,
    damageType: DamageType.VIRAL,
    execute: (context: BattleContext) => {
      return {
        type: "bomb" as const,
        damage: 25,
        damageType: DamageType.VIRAL,
        delay: 1000,
      }
    },
  },

  // Corrosive damage actions (very strong vs armor)
  {
    id: "acid-shot",
    name: "Acid Shot",
    description: "Corrosive round (10 damage, strips armor)",
    cooldown: 1500,
    damageType: DamageType.CORROSIVE,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 10,
        damageType: DamageType.CORROSIVE,
      }
    },
  },
  {
    id: "corrosion-wave",
    name: "Corrosion Wave",
    description: "Acid spray (22 damage, melts armor)",
    cooldown: 2600,
    damageType: DamageType.CORROSIVE,
    execute: (context: BattleContext) => {
      return {
        type: "wave" as const,
        damage: 22,
        damageType: DamageType.CORROSIVE,
      }
    },
  },

  // Electromagnetic damage actions (magnetic from spec - renamed for clarity)
  {
    id: "emp-pulse",
    name: "EMP Pulse",
    description: "Electromagnetic pulse (15 damage, disables shields)",
    cooldown: 2500,
    damageType: DamageType.ELECTROMAGNETIC,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 15,
        damageType: DamageType.ELECTROMAGNETIC,
        statusChance: 0.8, // High chance to EMP
      }
    },
  },
  {
    id: "magnetic-disruption",
    name: "Magnetic Disruption",
    description: "Disrupt enemy protocols (10 damage, disables random logic)",
    cooldown: 3500,
    damageType: DamageType.ELECTROMAGNETIC,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 10,
        damageType: DamageType.ELECTROMAGNETIC,
        statusChance: 0.9, // Very high disable chance
      }
    },
  },

  // Explosive damage actions
  {
    id: "frag-grenade",
    name: "Frag Grenade",
    description: "Explosive grenade (40 damage, balanced vs all)",
    cooldown: 3000,
    damageType: DamageType.EXPLOSIVE,
    execute: (context: BattleContext) => {
      return {
        type: "bomb" as const,
        damage: 40,
        damageType: DamageType.EXPLOSIVE,
        delay: 800,
      }
    },
  },
  {
    id: "cluster-bomb",
    name: "Cluster Bomb",
    description: "Multiple explosions (25 damage x3)",
    cooldown: 4000,
    damageType: DamageType.EXPLOSIVE,
    execute: (context: BattleContext) => {
      return {
        type: "cluster" as const,
        damage: 25,
        damageType: DamageType.EXPLOSIVE,
        count: 3,
      }
    },
  },

  // Glacial damage actions
  {
    id: "cryo-shot",
    name: "Cryo Shot",
    description: "Freezing projectile (12 damage, slows enemy)",
    cooldown: 1600,
    damageType: DamageType.GLACIAL,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 12,
        damageType: DamageType.GLACIAL,
        statusChance: 0.7,
      }
    },
  },
  {
    id: "cryo-field",
    name: "Cryo Field",
    description: "Freezing area (5 damage, heavy slow, long duration)",
    cooldown: 4000,
    damageType: DamageType.GLACIAL,
    execute: (context: BattleContext) => {
      return {
        type: "field" as const,
        damage: 5,
        damageType: DamageType.GLACIAL,
        duration: 5000,
        statusChance: 1.0, // Guaranteed slow
      }
    },
  },
  {
    id: "blizzard",
    name: "Blizzard",
    description: "Freezing storm (18 damage, slows and chills)",
    cooldown: 3500,
    damageType: DamageType.GLACIAL,
    execute: (context: BattleContext) => {
      return {
        type: "wave" as const,
        damage: 18,
        damageType: DamageType.GLACIAL,
        statusChance: 0.8,
      }
    },
  },

  {
    id: "electrical-charge-shot",
    name: "Charge Shot (Electrical)",
    description: "Powerful electrical blast (30 damage, guaranteed arc)",
    cooldown: 3000,
    damageType: DamageType.ENERGY,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 30,
        damageType: DamageType.ENERGY,
        statusChance: 1.0, // Guaranteed arc effect
      }
    },
  },
  {
    id: "corrosive-armor-piercer",
    name: "Armor Piercer (Corrosive)",
    description: "Specialized armor-melting shot (25 damage, high degrade)",
    cooldown: 2800,
    damageType: DamageType.CORROSIVE,
    execute: (context: BattleContext) => {
      return {
        type: "shoot" as const,
        damage: 25,
        damageType: DamageType.CORROSIVE,
        statusChance: 0.9, // Very high degrade chance
      }
    },
  },
]
