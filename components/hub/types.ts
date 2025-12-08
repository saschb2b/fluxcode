export type Tab = "PLAY" | "CONSTRUCT" | "OPERATIONS" | "ARCHIVE";
export type GameMode = "NONE" | "BREACH" | "OVERLOAD" | "MIRROR";

export const VIEW_CONFIG = {
  // --- TABS ---
  // Main Map View (High up, centered)
  PLAY: { pos: [0, 8, 8], look: [0, 0, 1] },
  CONSTRUCT: { pos: [0, 1.5, 4.5], look: [0, 1, 0] },
  OPERATIONS: { pos: [-4, 1.5, 4.5], look: [-4, 1, 0] },
  ARCHIVE: { pos: [4, 1.5, 4.5], look: [4, 1, 0] },

  // --- GAME MODES (Zoomed In) ---

  // Breach Castle is at (0, -4.5)
  // We move camera to (0, 0, 0) to look down at it
  BREACH_FOCUS: {
    pos: [0, 3, 0.5],
    look: [0, 0, -4.5],
  },

  // Overload Castle is at (-5, 3.5)
  // We move camera to (-5, 8, 8.5)
  OVERLOAD_FOCUS: {
    pos: [-5, 5, 8],
    look: [-5, 0, 3.5],
  },

  // Mirror Castle is at (5, 3.5)
  // We move camera to (5, 8, 8.5)
  MIRROR_FOCUS: {
    pos: [5, 5, 8],
    look: [5, 0, 3.5],
  },
} as const;
