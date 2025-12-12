import * as THREE from "three";
import { DamageType } from "@/types/game";

const COLORS = {
  [DamageType.KINETIC]: new THREE.Color("#94a3b8"),
  [DamageType.ENERGY]: new THREE.Color("#22d3ee"),
  [DamageType.THERMAL]: new THREE.Color("#f97316"),
  [DamageType.VIRAL]: new THREE.Color("#a855f7"),
  [DamageType.CORROSIVE]: new THREE.Color("#84cc16"),
  [DamageType.GLACIAL]: new THREE.Color("#06b6d4"),
  [DamageType.CONCUSSION]: new THREE.Color("#ff0000"),
};

export const GEOMETRIES = {
  // Primitives
  box: new THREE.BoxGeometry(1, 1, 1),
  boxLarge: new THREE.BoxGeometry(1.15, 1.15, 1.15),
  sphere: new THREE.SphereGeometry(0.7, 16, 16),
  sphereSmall: new THREE.SphereGeometry(0.5, 16, 16),
  sphereTiny: new THREE.SphereGeometry(0.15, 8, 8),

  // Tech/Energy Shapes
  octahedron: new THREE.OctahedronGeometry(0.8, 0),
  dodecahedron: new THREE.DodecahedronGeometry(0.7, 0),
  icosahedron: new THREE.IcosahedronGeometry(1.1, 0),

  // Rings/Spikes
  torusMain: new THREE.TorusGeometry(1, 0.1, 16, 32),
  torusThin: new THREE.TorusGeometry(1.1, 0.08, 16, 32),
  torusFat: new THREE.TorusGeometry(0.8, 0.15, 8, 8),
  coneSpike: new THREE.ConeGeometry(0.12, 0.5, 6),
};

export const MATERIALS = {
  // KINETIC
  kineticMain: new THREE.MeshStandardMaterial({
    color: COLORS[DamageType.KINETIC],
    metalness: 0.9,
    roughness: 0.15,
  }),
  kineticGlow: new THREE.MeshStandardMaterial({
    color: "#64748b",
    metalness: 0.7,
    roughness: 0.3,
    transparent: true,
    opacity: 0.4,
  }),

  // ENERGY (High Emission)
  energyMain: new THREE.MeshStandardMaterial({
    color: COLORS[DamageType.ENERGY],
    emissive: COLORS[DamageType.ENERGY],
    emissiveIntensity: 1.5,
    toneMapped: false,
  }),
  energyRing: new THREE.MeshBasicMaterial({
    color: COLORS[DamageType.ENERGY],
    transparent: true,
    opacity: 0.6,
  }),

  // THERMAL (Fire)
  thermalMain: new THREE.MeshStandardMaterial({
    color: COLORS[DamageType.THERMAL],
    emissive: COLORS[DamageType.THERMAL],
    emissiveIntensity: 2,
  }),
  thermalCore: new THREE.MeshStandardMaterial({
    color: "#fff", // White hot center
    emissive: "#fff",
    emissiveIntensity: 1,
  }),

  // VIRAL (Purple/Organic)
  viralCore: new THREE.MeshStandardMaterial({
    color: COLORS[DamageType.VIRAL],
    roughness: 0.6,
    metalness: 0.6,
    emissive: COLORS[DamageType.VIRAL],
    emissiveIntensity: 0.5,
  }),
  viralParticle: new THREE.MeshBasicMaterial({
    color: "#d8b4fe",
  }),

  // CORROSIVE (Acid/Green)
  corrosiveCore: new THREE.MeshStandardMaterial({
    color: COLORS[DamageType.CORROSIVE],
    roughness: 0.2,
    metalness: 0.1,
    emissive: COLORS[DamageType.CORROSIVE],
    emissiveIntensity: 0.4,
  }),
  corrosiveShell: new THREE.MeshPhongMaterial({
    color: COLORS[DamageType.CORROSIVE],
    transparent: true,
    opacity: 0.5,
    shininess: 100,
  }),

  // GLACIAL (Ice/Crystal)
  glacialCore: new THREE.MeshStandardMaterial({
    color: COLORS[DamageType.GLACIAL],
    roughness: 0.1,
    metalness: 0.8,
    emissive: COLORS[DamageType.GLACIAL],
    emissiveIntensity: 0.6,
  }),
  glacialSpike: new THREE.MeshStandardMaterial({
    color: "#cffafe", // Ice white-blue
    emissive: COLORS[DamageType.GLACIAL],
    emissiveIntensity: 0.2,
  }),

  // CONCUSSION (Force/Red)
  concussionCore: new THREE.MeshStandardMaterial({
    color: COLORS[DamageType.CONCUSSION],
    roughness: 0.9,
    metalness: 0.1,
  }),
  concussionWave: new THREE.MeshBasicMaterial({
    color: COLORS[DamageType.CONCUSSION],
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  }),
};
