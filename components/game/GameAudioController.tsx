// components/game/GameAudioController.tsx
"use client";

import { useEffect, useRef } from "react";
import { useGameStore, GameView } from "@/lib/store/gameStore";
import { audioManager } from "@/lib/audio/AudioManager";
import { BGM_ASSETS } from "@/lib/audio/assets";

export function GameAudioController() {
  const currentView = useGameStore((state) => state.currentView);

  // Track the last requested view to handle race conditions
  const viewRef = useRef(currentView);

  useEffect(() => {
    viewRef.current = currentView;

    const playSequence = async () => {
      let track = BGM_ASSETS.HUB;

      switch (currentView) {
        case GameView.HUB:
          track = BGM_ASSETS.HUB;
          break;
        case GameView.TINKER:
          track = BGM_ASSETS.TINKER;
          break;
        case GameView.ARSENAL:
          track = BGM_ASSETS.SIMULACRUM;
          break;
      }

      console.log("Playing track:", track.id);

      try {
        // 2. Ensure Engine is initialized
        // (Safe to call repeatedly, it checks its own state)
        await audioManager.initialize();

        // 3. Load the asset
        // (Safe to call repeatedly, it caches loaded buffers)
        await audioManager.loadSound(track.id, track.url);

        if (viewRef.current === currentView) {
          audioManager.playBGM(track.id);
        }
      } catch (err) {
        console.warn("Audio loading failed", err);
      }
    };

    playSequence();
  }, [currentView]);

  return null;
}
