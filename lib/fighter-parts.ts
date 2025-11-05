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
  primaryColor: string
  secondaryColor: string
}

// Available shapes for each body part
export const HEAD_SHAPES: FighterPart[] = [
  { id: "cube-head", name: "Cube Head", shape: "cube", position: [0, 0.8, 0], scale: [0.4, 0.4, 0.4] },
  { id: "sphere-head", name: "Sphere Head", shape: "sphere", position: [0, 0.8, 0], scale: [0.35, 0.35, 0.35] },
  { id: "cylinder-head", name: "Cylinder Head", shape: "cylinder", position: [0, 0.8, 0], scale: [0.3, 0.3, 0.3] },
  { id: "cone-head", name: "Cone Head", shape: "cone", position: [0, 0.8, 0], scale: [0.35, 0.4, 0.35] },
]

export const BODY_SHAPES: FighterPart[] = [
  { id: "cube-body", name: "Cube Body", shape: "cube", position: [0, 0, 0], scale: [0.6, 0.8, 0.6] },
  { id: "cylinder-body", name: "Cylinder Body", shape: "cylinder", position: [0, 0, 0], scale: [0.5, 0.8, 0.5] },
  { id: "sphere-body", name: "Sphere Body", shape: "sphere", position: [0, 0, 0], scale: [0.6, 0.7, 0.6] },
  { id: "pyramid-body", name: "Pyramid Body", shape: "pyramid", position: [0, 0, 0], scale: [0.6, 0.8, 0.6] },
]

export const ARM_SHAPES: FighterPart[] = [
  { id: "cube-arm", name: "Cube Arms", shape: "cube", position: [0, 0, 0], scale: [0.15, 0.5, 0.15] },
  { id: "cylinder-arm", name: "Cylinder Arms", shape: "cylinder", position: [0, 0, 0], scale: [0.12, 0.5, 0.12] },
  { id: "sphere-arm", name: "Sphere Arms", shape: "sphere", position: [0, 0, 0], scale: [0.15, 0.15, 0.15] },
]

export const ACCESSORY_SHAPES: FighterPart[] = [
  { id: "none", name: "None", shape: "cube", position: [0, 0, 0], scale: [0, 0, 0] },
  { id: "antenna", name: "Antenna", shape: "cylinder", position: [0, 1.2, 0], scale: [0.05, 0.3, 0.05] },
  { id: "halo", name: "Halo", shape: "torus", position: [0, 1.3, 0], scale: [0.4, 0.4, 0.1] },
  { id: "horn", name: "Horns", shape: "cone", position: [0, 1.1, 0], scale: [0.1, 0.2, 0.1] },
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
  primaryColor: COLOR_PRESETS[0].primary,
  secondaryColor: COLOR_PRESETS[0].secondary,
}

export function generateRandomCustomization(): FighterCustomization {
  const randomHead = HEAD_SHAPES[Math.floor(Math.random() * HEAD_SHAPES.length)]
  const randomBody = BODY_SHAPES[Math.floor(Math.random() * BODY_SHAPES.length)]
  const randomArm = ARM_SHAPES[Math.floor(Math.random() * ARM_SHAPES.length)]
  const randomAccessory = ACCESSORY_SHAPES[Math.floor(Math.random() * ACCESSORY_SHAPES.length)]
  const randomColorPreset = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]

  return {
    head: randomHead,
    body: randomBody,
    leftArm: randomArm,
    rightArm: randomArm,
    accessory: randomAccessory,
    primaryColor: randomColorPreset.primary,
    secondaryColor: randomColorPreset.secondary,
  }
}
