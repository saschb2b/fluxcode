export type Tab = "PLAY" | "CONSTRUCT" | "SHOP" | "ARCHIVE";
export type GameMode = "NONE" | "BREACH" | "OVERLOAD" | "MIRROR" | "ARENA";

export const VIEW_CONFIG = {
  // --- TABS ---
  // Main Map View (High up, centered)
  PLAY: { pos: [0, 8, 9], look: [0, 0, 0] },
  CONSTRUCT: { pos: [0, 2, 8], look: [0, 1, 0] },
  SHOP: { pos: [0, 2, 14], look: [0, 2, 0] },
  ARCHIVE: { pos: [0, 2, 14], look: [0, 2, 0] },

  // --- GAME MODES (Zoomed In) ---
  BREACH_FOCUS: {
    pos: [0, 4, 0.5],
    look: [0, 0, -5],
  },
  OVERLOAD_FOCUS: {
    pos: [-6, 5, 5],
    look: [-6, 0, 0],
  },
  MIRROR_FOCUS: {
    pos: [6, 5, 5],
    look: [6, 0, 0],
  },
  ARENA_FOCUS: {
    pos: [0, 5, 9],
    look: [0, 0, 4],
  },
} as const;
