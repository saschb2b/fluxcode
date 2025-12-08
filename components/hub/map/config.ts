import * as THREE from "three";

export const HEX_RADIUS = 0.5;
export const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
export const HEX_HEIGHT = 2 * HEX_RADIUS;
export const GRID_SIZE = 18;
export const ISLAND_RADIUS = 4.0;

// Island Center Positions
export const POS_BREACH = new THREE.Vector2(0, -4.5);
export const POS_OVERLOAD = new THREE.Vector2(-5, 3.5);
export const POS_MIRROR = new THREE.Vector2(5, 3.5);

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

  // 1. BREACH: The Obsidian Fortress
  if (distBreach < ISLAND_RADIUS) {
    biome = "breach";
    const noise = pseudoNoise(x, z);
    if (distBreach < 1.5) {
      height = 1.2;
      color.set("#2a0a0a");
    } else if (distBreach < 3.0) {
      height = 1.5 + Math.abs(noise) * 0.8;
      color
        .set("#450a0a")
        .lerp(new THREE.Color("#7f1d1d"), Math.random() * 0.3);
    } else {
      height = Math.max(
        0.2,
        (1 - distBreach / ISLAND_RADIUS) * 2 + noise * 0.2,
      );
      color.set("#1a0505");
    }
  }
  // 2. OVERLOAD: The Scrap Dunes
  else if (distOverload < ISLAND_RADIUS) {
    biome = "overload";
    const noise = pseudoNoise(x * 2, z * 2);
    if (distOverload < 1.5) {
      height = 1.0;
      color.set("#451a03");
    } else {
      height = 0.5 + (noise + 1) * 0.4;
      if (Math.random() > 0.8) height += 0.5;
      color = new THREE.Color("#271a0c").lerp(
        new THREE.Color("#d97706"),
        height - 0.5,
      );
    }
  }
  // 3. MIRROR: The Data Terraces
  else if (distMirror < ISLAND_RADIUS) {
    biome = "mirror";
    const noise = pseudoNoise(x * 0.5, z * 0.5);
    if (distMirror < 1.5) {
      height = 1.5;
      color.set("#164e63");
    } else {
      const rawHeight = (1 - distMirror / ISLAND_RADIUS) * 2 + noise * 0.5;
      const stepSize = 0.4;
      height = Math.floor(Math.max(0.2, rawHeight) / stepSize) * stepSize + 0.2;
      const level = height / 1.5;
      color = new THREE.Color("#083344").lerp(
        new THREE.Color("#06b6d4"),
        level,
      );
    }
  }
  // 4. OCEAN
  else {
    if (pos.length() < 9.5) {
      biome = "ocean";
      height = 0;
      color = new THREE.Color("#020617");
    } else {
      return null; // Void
    }
  }

  return { position: [x, height / 2, z], height, color, biome };
}
