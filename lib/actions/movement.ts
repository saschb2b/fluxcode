import { Action, BattleContext } from "@/types/game";

// Helper: Checks if a tile is occupied by the Opponent or any other Enemy
const isTileOccupied = (
  x: number,
  y: number,
  context: BattleContext,
): boolean => {
  // 1. Check against the TARGET (The opponent)
  // In the swapped context, 'enemyPos' is always the Other Guy.
  const targetPos = context.enemyPos;
  if (targetPos.x === x && targetPos.y === y) return true;

  // 2. Check against Global Enemy Array (Prevent stacking)
  // We need to filter out "Myself" if I am an enemy to avoid false positives
  // (though checking my CURRENT position vs TARGET position usually avoids this,
  // explicit is safer).
  return context.enemies.some((e) => {
    // If I am the one moving (stored in context.playerPos), don't check against myself
    // But context.enemies contains ME (with my old position).
    // However, we are checking if the TARGET tile (x,y) is occupied.
    // Unless I am moving to my own tile (stationary), this check is fine.
    if (e.hp <= 0) return false;
    return e.position.x === x && e.position.y === y;
  });
};

export const MOVEMENT_ACTIONS: Action[] = [
  {
    id: "move-forward",
    name: "Step Forward",
    description: "Move 1 tile towards the center",
    cooldown: 500,
    coreType: "movement",
    execute: (context: BattleContext) => {
      // Swapped Context: playerPos is ALWAYS Self
      const currentPos = context.playerPos;

      // Direction depends on who we really are
      const xDir = context.isPlayer ? 1 : -1;

      const targetX = currentPos.x + xDir;
      const targetY = currentPos.y;

      const minX = context.isPlayer ? 0 : 3;
      const maxX = context.isPlayer ? 2 : 5;

      if (
        targetX < minX ||
        targetX > maxX ||
        isTileOccupied(targetX, targetY, context)
      ) {
        return { type: "move" as const, position: currentPos };
      }

      return {
        type: "move" as const,
        position: { x: targetX, y: targetY },
      };
    },
  },
  {
    id: "move-backward",
    name: "Step Backward",
    description: "Move 1 tile away from the center",
    cooldown: 500,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentPos = context.playerPos; // Self
      const xDir = context.isPlayer ? -1 : 1;

      const targetX = currentPos.x + xDir;
      const targetY = currentPos.y;

      const minX = context.isPlayer ? 0 : 3;
      const maxX = context.isPlayer ? 2 : 5;

      if (
        targetX < minX ||
        targetX > maxX ||
        isTileOccupied(targetX, targetY, context)
      ) {
        return { type: "move" as const, position: currentPos };
      }

      return {
        type: "move" as const,
        position: { x: targetX, y: targetY },
      };
    },
  },
  {
    id: "move-up",
    name: "Step Up",
    description: "Move to the row above (Y-1)",
    cooldown: 500,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentPos = context.playerPos; // Self
      const targetY = currentPos.y - 1;

      if (targetY < 0 || isTileOccupied(currentPos.x, targetY, context)) {
        return { type: "move" as const, position: currentPos };
      }

      return {
        type: "move" as const,
        position: { x: currentPos.x, y: targetY },
      };
    },
  },
  {
    id: "move-down",
    name: "Step Down",
    description: "Move to the row below (Y+1)",
    cooldown: 500,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentPos = context.playerPos; // Self
      const targetY = currentPos.y + 1;

      if (targetY > 2 || isTileOccupied(currentPos.x, targetY, context)) {
        return { type: "move" as const, position: currentPos };
      }

      return {
        type: "move" as const,
        position: { x: currentPos.x, y: targetY },
      };
    },
  },
  {
    id: "align-y",
    name: "Align with Target",
    description: "Move up/down to match enemy's row",
    cooldown: 800,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentPos = context.playerPos; // Self
      const targetPos = context.enemyPos; // Target

      if (currentPos.y === targetPos.y) {
        return { type: "move" as const, position: currentPos };
      }

      const dir = targetPos.y > currentPos.y ? 1 : -1;
      const nextY = currentPos.y + dir;

      if (isTileOccupied(currentPos.x, nextY, context)) {
        return { type: "move" as const, position: currentPos };
      }

      return {
        type: "move" as const,
        position: { x: currentPos.x, y: nextY },
      };
    },
  },
  {
    id: "dash-forward",
    name: "Dash Forward",
    description: "Instantly move 2 tiles forward",
    cooldown: 2500,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentPos = context.playerPos; // Self
      const xDir = context.isPlayer ? 1 : -1;

      const minX = context.isPlayer ? 0 : 3;
      const maxX = context.isPlayer ? 2 : 5;

      let targetX = currentPos.x + xDir * 2;

      if (
        targetX < minX ||
        targetX > maxX ||
        isTileOccupied(targetX, currentPos.y, context)
      ) {
        // Fallback to 1 tile
        targetX = currentPos.x + xDir;
        if (
          targetX < minX ||
          targetX > maxX ||
          isTileOccupied(targetX, currentPos.y, context)
        ) {
          return { type: "move" as const, position: currentPos };
        }
      }

      return {
        type: "move" as const,
        position: { x: targetX, y: currentPos.y },
      };
    },
  },
  {
    id: "dodge",
    name: "Evasive Maneuver",
    description: "Randomly move to a safe adjacent tile",
    cooldown: 1000,
    coreType: "movement",
    execute: (context: BattleContext) => {
      const currentPos = context.playerPos; // Self!!

      const minX = context.isPlayer ? 0 : 3;
      const maxX = context.isPlayer ? 2 : 5;

      const candidates = [
        { x: currentPos.x, y: currentPos.y - 1 },
        { x: currentPos.x, y: currentPos.y + 1 },
        { x: currentPos.x - 1, y: currentPos.y },
        { x: currentPos.x + 1, y: currentPos.y },
      ];

      const validMoves = candidates.filter((pos) => {
        if (pos.y < 0 || pos.y > 2) return false;
        if (pos.x < minX || pos.x > maxX) return false;
        if (isTileOccupied(pos.x, pos.y, context)) return false;
        return true;
      });

      if (validMoves.length === 0) {
        return { type: "move" as const, position: currentPos };
      }

      const randomMove =
        validMoves[Math.floor(Math.random() * validMoves.length)];
      return {
        type: "move" as const,
        position: randomMove,
      };
    },
  },
];
