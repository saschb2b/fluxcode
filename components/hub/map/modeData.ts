import { GameMode } from "../types";

export const MODE_DETAILS: Record<
  GameMode,
  {
    title: string;
    desc: string;
    difficulty: string;
    reward: string;
    color: string;
  }
> = {
  NONE: {
    title: "NONE",
    desc: "No mode selected",
    difficulty: "NONE",
    reward: "NONE",
    color: "text-gray-500",
  },
  BREACH: {
    title: "CORE CAMPAIGN",
    desc: "Navigate through 5 layers of increasing security density. Sustain your construct's integrity to reach the Boss Layer.",
    difficulty: "STANDARD",
    reward: "DATA FRAGMENTS",
    color: "text-red-500",
  },
  OVERLOAD: {
    title: "SYSTEM STRESS TEST",
    desc: "Endless swarms. System instability increases per second. Kill enemies rapidly to vent heat and prevent system crash.",
    difficulty: "HIGH INTENSITY",
    reward: "HIGH SCORE",
    color: "text-amber-500",
  },
  MIRROR: {
    title: "ASYNC PVP DUEL",
    desc: "Engage against a Ghost Construct from the network. Adapt to unknown enemy logic patterns and random environmental hazards.",
    difficulty: "VARIABLE",
    reward: "RANKING",
    color: "text-cyan-500",
  },
  ARENA: {
    title: "COMBAT SIMULATION",
    desc: "Re-engage defeated adversaries in a controlled environment. Configure custom parameters and attempt time-attack challenges.",
    difficulty: "CUSTOM",
    reward: "MASTERY XP",
    color: "text-purple-500",
  },
};
