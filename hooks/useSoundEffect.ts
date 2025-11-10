"use client"; // This directive must be at the very top of the file

import { useCallback } from "react";
import { zzfx } from "zzfx";
import { DamageType } from "@/types/game"; // Assuming this path is correct

type ZzfxSoundParams = (number | undefined)[];

const soundParameters: Map<DamageType, ZzfxSoundParams> = new Map([
  [
    DamageType.ENERGY,
    [, , 925, 0.01, 0.01, 0.09, 1, 1.65, , , , , , , , 0.1, , 0.9, 0.01],
  ],
  [
    DamageType.THERMAL,
    [, , 315, 0.01, 0.02, 0.04, 4, 0.76, , , , , , 1.2, , 0.1, , 0.95, 0.02],
  ],
  [
    DamageType.VIRAL,
    [, , 182, 0.01, 0.01, 0.05, 4, 1.88, -7, , , , , 1.1, , 0.1, , 0.88, 0.01],
  ],
  [
    DamageType.CORROSIVE,
    [, , 218, 0.01, 0.01, 0.08, 4, 1.22, , , , , , 1.4, , 0.1, , 0.85, 0.01],
  ],
  [
    DamageType.EXPLOSIVE,
    [, , 568, 0.04, 0.01, 0.12, 4, 0.54, , , , , , , , 0.2, , 1.0, 0.02],
  ],
  [
    DamageType.GLACIAL,
    [, , 769, 0.01, 0.01, 0.06, 1, 2.18, , , , , , , , 0.1, , 0.86, 0.01],
  ],
  [
    DamageType.KINETIC,
    [, , 1e3, 0.01, , 0.03, 1, 1.94, , , , , , , , 0.1, , 0.9, 0.01],
  ],
]);

/**
 * Custom hook to play sound effects using zzfx based on damage type.
 *
 * @returns A function `playSound` that takes a `DamageType` and plays the corresponding sound.
 */
export function useSoundeffect() {
  // We use useCallback to memoize the playSound function, so it doesn't
  // change on every render, which is good for performance and stable references.
  const playSound = useCallback(
    (damageType?: DamageType | null): void => {
      const soundToPlay =
        damageType && soundParameters.has(damageType)
          ? soundParameters.get(damageType)!
          : null;

      if (!soundToPlay) {
        console.warn("No sound parameters found for the given damage type.");
        return;
      }

      try {
        zzfx(...soundToPlay);
      } catch (error) {
        console.error("Failed to play shoot sound:", error);
      }
    },
    [], // Empty dependency array means this function is created once
  );

  // Return the playSound function
  return playSound;
}
