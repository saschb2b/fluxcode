import { Position } from "@/types/game";

/**
 * Converts a logic grid position (0-5, 0-2) to 3D world coordinates.
 * Matches the logic historically used in CustomizableFighter.
 */
export const gridToWorld = (position: Position): [number, number, number] => {
  const x = (position.x - 2.5) * 1.1;
  const z = (position.y - 1) * 1.1;
  const y = 0.6; // Hover height

  return [x, y, z];
};
