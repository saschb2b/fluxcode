import { create } from "zustand";

export enum GameView {
  HUB = "HUB",
  ARSENAL = "ARSENAL",
  TINKER = "TINKER",
}

interface GameStore {
  currentView: GameView;
  setView: (view: GameView) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentView: GameView.HUB,
  setView: (view) => set({ currentView: view }),
}));
