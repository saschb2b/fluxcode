import type { Action, BattleContext, Position } from "@/types/game";

export const MOVEMENT_ACTIONS: Action[] = [
  {
    id: "move-forward",
    name: "Move Forward",
    description: "Move one tile toward the enemy",
    cooldown: 300,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newX = context.isPlayer
        ? Math.min(currentX + 1, 2)
        : Math.max(currentX - 1, 3);

      return {
        type: "move" as const,
        position: { x: newX, y: currentY } as Position,
      };
    },
  },
  {
    id: "move-backward",
    name: "Move Backward",
    description: "Move one tile away from the enemy",
    cooldown: 300,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newX = context.isPlayer
        ? Math.max(currentX - 1, 0)
        : Math.min(currentX + 1, 5);

      return {
        type: "move" as const,
        position: { x: newX, y: currentY } as Position,
      };
    },
  },
  {
    id: "move-up",
    name: "Move Up",
    description: "Move to the row above (or toward enemy row)",
    cooldown: 300,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const enemyY = context.isPlayer
        ? context.enemyPos.y
        : context.playerPos.y;
      let newY = currentY;

      if (currentY > enemyY) {
        newY = Math.max(currentY - 1, 0);
      } else if (currentY < enemyY) {
        newY = Math.min(currentY + 1, 2);
      } else {
        newY = Math.max(currentY - 1, 0);
      }

      return {
        type: "move" as const,
        position: { x: currentX, y: newY } as Position,
      };
    },
  },
  {
    id: "move-down",
    name: "Move Down",
    description: "Move to the row below",
    cooldown: 300,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newY = Math.min(currentY + 1, 2);

      return {
        type: "move" as const,
        position: { x: currentX, y: newY } as Position,
      };
    },
  },
  {
    id: "strafe-left",
    name: "Strafe Left",
    description: "Quick sideways movement to avoid attacks",
    cooldown: 400,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newY = Math.max(currentY - 1, 0);

      return {
        type: "move" as const,
        position: { x: currentX, y: newY } as Position,
      };
    },
  },
  {
    id: "strafe-right",
    name: "Strafe Right",
    description: "Quick sideways movement to reposition",
    cooldown: 400,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newY = Math.min(currentY + 1, 2);

      return {
        type: "move" as const,
        position: { x: currentX, y: newY } as Position,
      };
    },
  },
  {
    id: "dash-forward",
    name: "Dash Forward",
    description: "Quickly close distance (moves 1 tile forward)",
    cooldown: 2500,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;
      const newX = context.isPlayer
        ? Math.min(currentX + 1, 2)
        : Math.max(currentX - 1, 3);

      return {
        type: "move" as const,
        position: { x: newX, y: currentY } as Position,
      };
    },
  },
  {
    id: "jump",
    name: "Jump",
    description: "Leap to align with enemy row",
    cooldown: 500,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const enemyY = context.isPlayer
        ? context.enemyPos.y
        : context.playerPos.y;

      return {
        type: "move" as const,
        position: { x: currentX, y: enemyY } as Position,
      };
    },
  },
  {
    id: "dodge",
    name: "Dodge",
    description: "Quickly move to a random adjacent tile",
    cooldown: 600,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const minX = context.isPlayer ? 0 : 3;
      const maxX = context.isPlayer ? 2 : 5;
      const currentX = context.isPlayer
        ? context.playerPos.x
        : context.enemyPos.x;
      const currentY = context.isPlayer
        ? context.playerPos.y
        : context.enemyPos.y;

      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];
      const validMoves = directions
        .map((dir) => ({
          x: currentX + dir.x,
          y: currentY + dir.y,
        }))
        .filter(
          (pos) => pos.x >= minX && pos.x <= maxX && pos.y >= 0 && pos.y <= 2,
        );

      const randomMove = validMoves[
        Math.floor(Math.random() * validMoves.length)
      ] || { x: currentX, y: currentY };

      return {
        type: "move" as const,
        position: randomMove as Position,
      };
    },
  },
  {
    id: "teleport",
    name: "Teleport",
    description: "Instantly move to a random position",
    cooldown: 3000,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const minX = context.isPlayer ? 0 : 3;
      const maxX = context.isPlayer ? 2 : 5;
      const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      const randomY = Math.floor(Math.random() * 3);

      return {
        type: "move" as const,
        position: { x: randomX, y: randomY } as Position,
      };
    },
  },
];
