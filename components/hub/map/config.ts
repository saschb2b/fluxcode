import * as THREE from "three";

export const HEX_RADIUS = 0.5;
export const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
export const HEX_HEIGHT = 2 * HEX_RADIUS;
export const GRID_SIZE = 20;
export const ISLAND_RADIUS = 3.5;

// DIAMOND LAYOUT POSITIONS
export const POS_BREACH = new THREE.Vector2(0, -5);
export const POS_OVERLOAD = new THREE.Vector2(-6, 0);
export const POS_MIRROR = new THREE.Vector2(6, 0);
export const POS_ARENA = new THREE.Vector2(0, 4.5);

export function pseudoNoise(x: number, z: number) {
  return (
    Math.sin(x * 0.8) * Math.cos(z * 0.8) + Math.sin(x * 2.5 + z * 0.5) * 0.5
  );
}

export function getTerrainData(x: number, z: number) {
  const pos = new THREE.Vector2(x, z);

  let height = 0;
  let biome = "ocean";
  let color = new THREE.Color("#0f172a");

  const distBreach = pos.distanceTo(POS_BREACH);
  const distOverload = pos.distanceTo(POS_OVERLOAD);
  const distMirror = pos.distanceTo(POS_MIRROR);
  const distArena = pos.distanceTo(POS_ARENA);

  // 1. BREACH
  if (distBreach < ISLAND_RADIUS) {
    biome = "breach";
    const noise = pseudoNoise(x, z);
    if (distBreach < 1.5) {
      height = 1.2;
      color.set("#2a0a0a");
    } else if (distBreach < 3.0) {
      height = 1.5 + Math.abs(noise) * 0.8;
      color.set("#450a0a");
    } else {
      height = Math.max(0.2, (1 - distBreach / ISLAND_RADIUS) * 2);
      color.set("#1a0505");
    }
  }
  // 2. OVERLOAD
  else if (distOverload < ISLAND_RADIUS) {
    biome = "overload";
    const noise = pseudoNoise(x * 2, z * 2);
    if (distOverload < 1.5) {
      height = 1.0;
      color.set("#451a03");
    } else {
      height = 0.5 + (noise + 1) * 0.4;
      color = new THREE.Color("#271a0c").lerp(
        new THREE.Color("#d97706"),
        height - 0.5,
      );
    }
  }
  // 3. MIRROR
  else if (distMirror < ISLAND_RADIUS) {
    biome = "mirror";
    if (distMirror < 1.5) {
      height = 1.5;
      color.set("#164e63");
    } else {
      height = Math.floor((1 - distMirror / ISLAND_RADIUS) * 5) * 0.3 + 0.2;
      color = new THREE.Color("#083344").lerp(
        new THREE.Color("#06b6d4"),
        height / 2,
      );
    }
  }
  // 4. ARENA
  else if (distArena < ISLAND_RADIUS) {
    biome = "arena";
    if (distArena < 1.5) {
      height = 1.0;
      color.set("#2e1065");
    } else {
      height = 0.6;
      color = new THREE.Color("#1e1b4b");
      if ((Math.round(x) + Math.round(z)) % 2 === 0)
        color.offsetHSL(0, 0, 0.05);
    }
  }
  // 5. OCEAN
  else {
    if (pos.length() < 11) {
      biome = "ocean";
      height = 0;
      color = new THREE.Color("#020617");
    } else {
      return null;
    }
  }

  return { position: [x, height / 2, z], height, color, biome };
}
