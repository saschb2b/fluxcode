export type PartShape = "cube" | "sphere" | "cylinder" | "cone" | "pyramid" | "torus"

export interface FighterPart {
  id: string
  name: string
  shape: PartShape
  position: [number, number, number]
  scale: [number, number, number]
  rotation?: [number, number, number]
}

export interface FighterCustomization {
  head: FighterPart
  body: FighterPart
  leftArm: FighterPart
  rightArm: FighterPart
  accessory?: FighterPart
  weapon?: FighterPart
  chassis?: FighterPart
  primaryColor: string
  secondaryColor: string
}

// Available shapes for each body part
export const HEAD_SHAPES: FighterPart[] = [
  { id: "cube-head", name: "CORE.UNIT_ALPHA", shape: "cube", position: [0, 0.8, 0], scale: [0.4, 0.4, 0.4] },
  { id: "sphere-head", name: "CORE.NEXUS_ORB", shape: "sphere", position: [0, 0.8, 0], scale: [0.35, 0.35, 0.35] },
  { id: "cylinder-head", name: "CORE.SIGNAL_RELAY", shape: "cylinder", position: [0, 0.8, 0], scale: [0.3, 0.3, 0.3] },
  { id: "cone-head", name: "CORE.SPIKE_PROTOCOL", shape: "cone", position: [0, 0.8, 0], scale: [0.35, 0.4, 0.35] },
  { id: "pyramid-head", name: "CORE.PRISM_NODE", shape: "pyramid", position: [0, 0.8, 0], scale: [0.4, 0.4, 0.4] },
  { id: "torus-head", name: "CORE.HALO_MATRIX", shape: "torus", position: [0, 0.8, 0], scale: [0.35, 0.35, 0.2] },
  { id: "cube-small-head", name: "CORE.MINI_PROC", shape: "cube", position: [0, 0.8, 0], scale: [0.3, 0.3, 0.3] },
  {
    id: "cylinder-tall-head",
    name: "CORE.TOWER_CPU",
    shape: "cylinder",
    position: [0, 0.8, 0],
    scale: [0.25, 0.4, 0.25],
  },
  { id: "sphere-large-head", name: "CORE.MEGA_ORB", shape: "sphere", position: [0, 0.8, 0], scale: [0.45, 0.45, 0.45] },
]

export const BODY_SHAPES: FighterPart[] = [
  { id: "cube-body", name: "HULL.BASTION_CUBE", shape: "cube", position: [0, 0, 0], scale: [0.6, 0.8, 0.6] },
  { id: "cylinder-body", name: "HULL.BARREL_CORE", shape: "cylinder", position: [0, 0, 0], scale: [0.5, 0.8, 0.5] },
  { id: "sphere-body", name: "HULL.SPHERE_VAULT", shape: "sphere", position: [0, 0, 0], scale: [0.6, 0.7, 0.6] },
  { id: "pyramid-body", name: "HULL.APEX_FRAME", shape: "pyramid", position: [0, 0, 0], scale: [0.6, 0.8, 0.6] },
  { id: "cube-wide-body", name: "HULL.FORTIFIED_BOX", shape: "cube", position: [0, 0, 0], scale: [0.7, 0.7, 0.7] },
  {
    id: "cylinder-slim-body",
    name: "HULL.STEALTH_CYLINDER",
    shape: "cylinder",
    position: [0, 0, 0],
    scale: [0.4, 0.9, 0.4],
  },
  { id: "torus-body", name: "HULL.RING_STRUCTURE", shape: "torus", position: [0, 0, 0], scale: [0.6, 0.6, 0.3] },
  { id: "cone-body", name: "HULL.DELTA_SHELL", shape: "cone", position: [0, 0, 0], scale: [0.5, 0.8, 0.5] },
  { id: "cube-compact-body", name: "HULL.COMPACT_UNIT", shape: "cube", position: [0, 0, 0], scale: [0.5, 0.6, 0.5] },
]

export const ARM_SHAPES: FighterPart[] = [
  { id: "cube-arm", name: "MODULE.BLOCK_ARRAY", shape: "cube", position: [0, 0, 0], scale: [0.15, 0.5, 0.15] },
  { id: "cylinder-arm", name: "MODULE.SERVO_LIMB", shape: "cylinder", position: [0, 0, 0], scale: [0.12, 0.5, 0.12] },
  { id: "sphere-arm", name: "MODULE.NODE_LINK", shape: "sphere", position: [0, 0, 0], scale: [0.15, 0.15, 0.15] },
  { id: "cone-arm", name: "MODULE.SPIKE_EXTENSION", shape: "cone", position: [0, 0, 0], scale: [0.15, 0.5, 0.15] },
  {
    id: "cylinder-thick-arm",
    name: "MODULE.HEAVY_ACTUATOR",
    shape: "cylinder",
    position: [0, 0, 0],
    scale: [0.15, 0.5, 0.15],
  },
  { id: "cube-thin-arm", name: "MODULE.BLADE_ARM", shape: "cube", position: [0, 0, 0], scale: [0.1, 0.6, 0.1] },
  { id: "pyramid-arm", name: "MODULE.PRISM_LIMB", shape: "pyramid", position: [0, 0, 0], scale: [0.15, 0.5, 0.15] },
  {
    id: "cylinder-long-arm",
    name: "MODULE.REACH_EXTENSION",
    shape: "cylinder",
    position: [0, 0, 0],
    scale: [0.1, 0.65, 0.1],
  },
]

export const ACCESSORY_SHAPES: FighterPart[] = [
  { id: "none", name: "ARRAY.NONE", shape: "cube", position: [0, 0, 0], scale: [0, 0, 0] },
  { id: "antenna", name: "ARRAY.SIGNAL_SPIKE", shape: "cylinder", position: [0, 1.2, 0], scale: [0.05, 0.3, 0.05] },
  { id: "halo", name: "ARRAY.ORBIT_RING", shape: "torus", position: [0, 1.3, 0], scale: [0.4, 0.4, 0.1] },
  { id: "horn", name: "ARRAY.DUAL_HORNS", shape: "cone", position: [0, 1.1, 0], scale: [0.1, 0.2, 0.1] },
  { id: "crown", name: "ARRAY.CROWN_SPIKES", shape: "pyramid", position: [0, 1.2, 0], scale: [0.3, 0.2, 0.3] },
  { id: "dish", name: "ARRAY.RADAR_DISH", shape: "cylinder", position: [0, 1.2, 0.2], scale: [0.25, 0.05, 0.25] },
  { id: "wings", name: "ARRAY.SENSOR_WINGS", shape: "cube", position: [0, 0.8, -0.3], scale: [0.8, 0.1, 0.1] },
  { id: "spikes", name: "ARRAY.DEFENSE_SPIKES", shape: "cone", position: [0, 0.5, 0], scale: [0.15, 0.3, 0.15] },
]

// Added new WEAPON_SHAPES for cyberpunk weapons
export const WEAPON_SHAPES: FighterPart[] = [
  { id: "none-weapon", name: "WEAPON.UNARMED", shape: "cube", position: [0, 0, 0], scale: [0, 0, 0] },
  { id: "blaster", name: "WEAPON.PLASMA_BLASTER", shape: "cylinder", position: [0.5, 0, 0.2], scale: [0.1, 0.3, 0.1] },
  { id: "cannon", name: "WEAPON.RAIL_CANNON", shape: "cube", position: [0.5, 0, 0.2], scale: [0.15, 0.15, 0.4] },
  { id: "launcher", name: "WEAPON.MISSILE_POD", shape: "cube", position: [0.5, 0.2, 0], scale: [0.2, 0.2, 0.3] },
  { id: "beam", name: "WEAPON.BEAM_EMITTER", shape: "cylinder", position: [0.5, 0, 0], scale: [0.08, 0.4, 0.08] },
  { id: "rifle", name: "WEAPON.PULSE_RIFLE", shape: "cylinder", position: [0.5, 0, 0.3], scale: [0.12, 0.35, 0.12] },
  { id: "blade", name: "WEAPON.ENERGY_BLADE", shape: "cube", position: [0.5, 0, 0.1], scale: [0.08, 0.5, 0.08] },
  { id: "shotgun", name: "WEAPON.SCATTER_GUN", shape: "cube", position: [0.5, 0, 0.2], scale: [0.18, 0.12, 0.3] },
  {
    id: "sniper",
    name: "WEAPON.PRECISION_LASER",
    shape: "cylinder",
    position: [0.5, 0, 0.4],
    scale: [0.08, 0.5, 0.08],
  },
]

// Added new CHASSIS_TYPES for different body types
export const CHASSIS_TYPES: FighterPart[] = [
  { id: "standard", name: "CHASSIS.STANDARD_FRAME", shape: "cube", position: [0, -0.2, 0], scale: [0.7, 0.3, 0.7] },
  { id: "heavy", name: "CHASSIS.TANK_PLATFORM", shape: "cube", position: [0, -0.2, 0], scale: [0.9, 0.4, 0.9] },
  { id: "light", name: "CHASSIS.SCOUT_FRAME", shape: "cylinder", position: [0, -0.2, 0], scale: [0.5, 0.3, 0.5] },
  { id: "stealth", name: "CHASSIS.GHOST_UNIT", shape: "pyramid", position: [0, -0.2, 0], scale: [0.6, 0.3, 0.6] },
  { id: "assault", name: "CHASSIS.ASSAULT_RIG", shape: "cube", position: [0, -0.2, 0], scale: [0.8, 0.35, 0.8] },
  { id: "support", name: "CHASSIS.SUPPORT_BASE", shape: "cylinder", position: [0, -0.2, 0], scale: [0.65, 0.3, 0.65] },
  { id: "recon", name: "CHASSIS.RECON_UNIT", shape: "cone", position: [0, -0.2, 0], scale: [0.55, 0.3, 0.55] },
  { id: "fortress", name: "CHASSIS.FORTRESS_CORE", shape: "cube", position: [0, -0.2, 0], scale: [1.0, 0.45, 1.0] },
]

export const COLOR_PRESETS = [
  { name: "Blue", primary: "#3b82f6", secondary: "#1e40af" },
  { name: "Red", primary: "#ef4444", secondary: "#991b1b" },
  { name: "Green", primary: "#22c55e", secondary: "#15803d" },
  { name: "Purple", primary: "#a855f7", secondary: "#6b21a8" },
  { name: "Orange", primary: "#f97316", secondary: "#c2410c" },
  { name: "Cyan", primary: "#06b6d4", secondary: "#0e7490" },
  { name: "Pink", primary: "#ec4899", secondary: "#be185d" },
  { name: "Yellow", primary: "#eab308", secondary: "#a16207" },
]

export const DEFAULT_CUSTOMIZATION: FighterCustomization = {
  head: HEAD_SHAPES[0],
  body: BODY_SHAPES[0],
  leftArm: ARM_SHAPES[0],
  rightArm: ARM_SHAPES[0],
  accessory: ACCESSORY_SHAPES[0],
  weapon: WEAPON_SHAPES[0],
  chassis: CHASSIS_TYPES[0],
  primaryColor: COLOR_PRESETS[0].primary,
  secondaryColor: COLOR_PRESETS[0].secondary,
}

export function generateRandomCustomization(): FighterCustomization {
  const randomHead = HEAD_SHAPES[Math.floor(Math.random() * HEAD_SHAPES.length)]
  const randomBody = BODY_SHAPES[Math.floor(Math.random() * BODY_SHAPES.length)]
  const randomArm = ARM_SHAPES[Math.floor(Math.random() * ARM_SHAPES.length)]
  const randomAccessory = ACCESSORY_SHAPES[Math.floor(Math.random() * ACCESSORY_SHAPES.length)]
  const randomWeapon = WEAPON_SHAPES[Math.floor(Math.random() * WEAPON_SHAPES.length)]
  const randomChassis = CHASSIS_TYPES[Math.floor(Math.random() * CHASSIS_TYPES.length)]
  const randomColorPreset = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]

  return {
    head: randomHead,
    body: randomBody,
    leftArm: randomArm,
    rightArm: randomArm,
    accessory: randomAccessory,
    weapon: randomWeapon,
    chassis: randomChassis,
    primaryColor: randomColorPreset.primary,
    secondaryColor: randomColorPreset.secondary,
  }
}
