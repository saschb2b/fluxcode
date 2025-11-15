import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import type { EnemyDefinition } from "./enemy-types"
import { DamageType } from "@/types/game"

// Helper to find triggers/actions by ID
const getTrigger = (id: string) => AVAILABLE_TRIGGERS.find(t => t.id === id)!
const getAction = (id: string) => AVAILABLE_ACTIONS.find(a => a.id === id)!

export const SCOUT_DRONE: EnemyDefinition = {
  id: "scout-drone",
  name: "Scout Drone",
  title: "Network Patrol Unit",
  faction: "corrupted-network",
  tier: "basic",
  classification: "Scout",
  lore: "Low-level patrol drones that swarm through compromised network sectors. Fast but fragile, they rely on numbers and mobility to harass intruders.",
  appearance: {
    primaryColor: "#3b82f6",
    secondaryColor: "#1e3a8a",
    accentColor: "#60a5fa",
    glowColor: "#93c5fd"
  },
  stats: {
    baseHp: 80,
    baseShields: 40,
    baseArmor: 20,
  },
  protocols: [
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-basic"), priority: 3, enabled: true },
    { trigger: getTrigger("hp-below-30"), action: getAction("dodge-back"), priority: 10, enabled: true },
  ],
  spawnWeight: 10,
  minWave: 1,
  render: () => ({
    headShape: "sphere",
    headColor: "#3b82f6",
    bodyShape: "cube",
    bodyColor: "#1e3a8a",
    limbShape: "cylinder",
    limbColor: "#60a5fa",
    hasGlow: true,
    glowColor: "#93c5fd",
    glowIntensity: 0.5
  })
}

export const TROOPER_UNIT: EnemyDefinition = {
  id: "trooper-unit",
  name: "Trooper Unit",
  title: "Standard Combat Construct",
  faction: "corrupted-network",
  tier: "basic",
  classification: "Infantry",
  lore: "Mass-produced combat units forming the backbone of corrupted network defenses. Balanced offense and defense make them reliable frontline soldiers.",
  appearance: {
    primaryColor: "#ef4444",
    secondaryColor: "#991b1b",
    accentColor: "#f87171",
    glowColor: "#fca5a5"
  },
  stats: {
    baseHp: 120,
    baseShields: 60,
    baseArmor: 40,
  },
  protocols: [
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-basic"), priority: 5, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-thermal"), priority: 8, enabled: true },
    { trigger: getTrigger("hp-below-50"), action: getAction("dodge-sideways"), priority: 7, enabled: true },
  ],
  spawnWeight: 8,
  minWave: 1,
  render: () => ({
    headShape: "cube",
    headColor: "#ef4444",
    bodyShape: "cube",
    bodyColor: "#991b1b",
    limbShape: "cube",
    limbColor: "#f87171",
    hasGlow: true,
    glowColor: "#fca5a5",
    glowIntensity: 0.6
  })
}

export const SEEKER_CONSTRUCT: EnemyDefinition = {
  id: "seeker-construct",
  name: "Seeker Construct",
  title: "Aggressive Hunter Protocol",
  faction: "rogue-ai",
  tier: "basic",
  classification: "Assault",
  lore: "Rogue AI constructs programmed with relentless pursuit algorithms. They close distance rapidly and overwhelm with sustained fire.",
  appearance: {
    primaryColor: "#a855f7",
    secondaryColor: "#6b21a8",
    accentColor: "#c084fc",
    glowColor: "#e9d5ff"
  },
  stats: {
    baseHp: 100,
    baseShields: 80,
    baseArmor: 30,
  },
  protocols: [
    { trigger: getTrigger("always"), action: getAction("advance-aggressive"), priority: 2, enabled: true },
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-rapid"), priority: 6, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-viral"), priority: 9, enabled: true },
  ],
  spawnWeight: 6,
  minWave: 2,
  render: () => ({
    headShape: "octahedron",
    headColor: "#a855f7",
    bodyShape: "sphere",
    bodyColor: "#6b21a8",
    limbShape: "cylinder",
    limbColor: "#c084fc",
    hasGlow: true,
    glowColor: "#e9d5ff",
    glowIntensity: 0.7
  })
}

export const DEFENDER_FRAME: EnemyDefinition = {
  id: "defender-frame",
  name: "Defender Frame",
  title: "Fortified Sentinel",
  faction: "sentinel",
  tier: "basic",
  classification: "Heavy Infantry",
  lore: "Sentinel frames built for defense and suppression. High armor and shields make them difficult to breach, anchoring enemy formations.",
  appearance: {
    primaryColor: "#84cc16",
    secondaryColor: "#365314",
    accentColor: "#bef264",
    glowColor: "#d9f99d"
  },
  stats: {
    baseHp: 150,
    baseShields: 100,
    baseArmor: 80,
  },
  protocols: [
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-basic"), priority: 4, enabled: true },
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-concussion"), priority: 6, enabled: true },
    { trigger: getTrigger("hp-below-40"), action: getAction("self-repair"), priority: 10, enabled: true },
  ],
  spawnWeight: 5,
  minWave: 3,
  render: () => ({
    headShape: "cube",
    headColor: "#84cc16",
    bodyShape: "cube",
    bodyColor: "#365314",
    limbShape: "cube",
    limbColor: "#bef264",
    hasGlow: true,
    glowColor: "#d9f99d",
    glowIntensity: 0.4
  })
}

export const BASIC_ENEMIES = [
  SCOUT_DRONE,
  TROOPER_UNIT,
  SEEKER_CONSTRUCT,
  DEFENDER_FRAME
]
