import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import type { EnemyDefinition } from "./enemy-types.js"
import { DamageType } from "@/types/game"

const getTrigger = (id: string) => AVAILABLE_TRIGGERS.find(t => t.id === id)!
const getAction = (id: string) => AVAILABLE_ACTIONS.find(a => a.id === id)!

export const EXIMUS_STRIKER: EnemyDefinition = {
  id: "eximus-striker",
  name: "Eximus Striker",
  title: "Elite Combat Variant",
  faction: "corrupted-network",
  tier: "elite",
  classification: "Elite Infantry",
  lore: "Enhanced combat units with superior protocols and reinforced systems. Elite variants lead standard forces with devastating tactical precision.",
  appearance: {
    primaryColor: "#8b5cf6",
    secondaryColor: "#4c1d95",
    accentColor: "#c4b5fd",
    glowColor: "#ddd6fe"
  },
  stats: {
    baseHp: 400,
    baseShields: 250,
    baseArmor: 150,
    resistances: {
      [DamageType.KINETIC]: 0.15,
      [DamageType.THERMAL]: 0.15,
    }
  },
  protocols: [
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-rapid"), priority: 6, enabled: true },
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-viral"), priority: 8, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("dash-attack"), priority: 10, enabled: true },
    { trigger: getTrigger("hp-below-40"), action: getAction("self-repair"), priority: 12, enabled: true },
  ],
  spawnWeight: 2,
  minWave: 8,
  render: () => ({
    headShape: "octahedron",
    headColor: "#8b5cf6",
    bodyShape: "cube",
    bodyColor: "#4c1d95",
    limbShape: "cube",
    limbColor: "#c4b5fd",
    hasGlow: true,
    glowColor: "#ddd6fe",
    glowIntensity: 1.0
  })
}

export const BOMBARDIER_TITAN: EnemyDefinition = {
  id: "bombardier-titan",
  name: "Bombardier Titan",
  title: "Artillery Platform",
  faction: "rogue-ai",
  tier: "elite",
  classification: "Heavy Artillery",
  lore: "Massive artillery platforms that rain explosive death from range. Their armor is nearly impenetrable, requiring sustained focus fire to breach.",
  appearance: {
    primaryColor: "#dc2626",
    secondaryColor: "#450a0a",
    accentColor: "#fca5a5",
    glowColor: "#fee2e2"
  },
  stats: {
    baseHp: 500,
    baseShields: 200,
    baseArmor: 200,
    resistances: {
      [DamageType.EXPLOSIVE]: 0.25,
      [DamageType.KINETIC]: 0.2,
    }
  },
  protocols: [
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-bomb"), priority: 9, enabled: true },
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-explosive"), priority: 8, enabled: true },
    { trigger: getTrigger("hp-below-50"), action: getAction("shoot-cluster"), priority: 11, enabled: true },
  ],
  spawnWeight: 1,
  minWave: 10,
  render: () => ({
    headShape: "cube",
    headColor: "#dc2626",
    bodyShape: "cube",
    bodyColor: "#450a0a",
    limbShape: "cube",
    limbColor: "#fca5a5",
    hasGlow: true,
    glowColor: "#fee2e2",
    glowIntensity: 0.9
  })
}

export const PHASE_ASSASSIN: EnemyDefinition = {
  id: "phase-assassin",
  name: "Phase Assassin",
  title: "Void Hunter",
  faction: "void-anomaly",
  tier: "elite",
  classification: "Assassin",
  lore: "Void-touched assassins that flicker between dimensions. Nearly impossible to predict, they strike with lethal precision before vanishing.",
  appearance: {
    primaryColor: "#a855f7",
    secondaryColor: "#581c87",
    accentColor: "#e9d5ff",
    glowColor: "#f3e8ff"
  },
  stats: {
    baseHp: 300,
    baseShields: 300,
    baseArmor: 100,
  },
  protocols: [
    { trigger: getTrigger("always"), action: getAction("teleport-random"), priority: 5, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("dash-attack"), priority: 12, enabled: true },
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-viral"), priority: 9, enabled: true },
    { trigger: getTrigger("hp-below-30"), action: getAction("teleport-back"), priority: 15, enabled: true },
  ],
  spawnWeight: 1,
  minWave: 12,
  render: () => ({
    headShape: "sphere",
    headColor: "#a855f7",
    bodyShape: "octahedron",
    bodyColor: "#581c87",
    limbShape: "cylinder",
    limbColor: "#e9d5ff",
    hasGlow: true,
    glowColor: "#f3e8ff",
    glowIntensity: 1.2
  })
}

export const SENTINEL_WARDEN: EnemyDefinition = {
  id: "sentinel-warden",
  name: "Sentinel Warden",
  title: "Fortress Commander",
  faction: "sentinel",
  tier: "elite",
  classification: "Commander",
  lore: "Ancient sentinel commanders that coordinate defensive formations. Their presence bolsters nearby units while suppressing enemy advances.",
  appearance: {
    primaryColor: "#0ea5e9",
    secondaryColor: "#0c4a6e",
    accentColor: "#7dd3fc",
    glowColor: "#bae6fd"
  },
  stats: {
    baseHp: 450,
    baseShields: 300,
    baseArmor: 180,
    resistances: {
      [DamageType.ENERGY]: 0.2,
      [DamageType.GLACIAL]: 0.2,
    }
  },
  protocols: [
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-emp"), priority: 8, enabled: true },
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-glacial"), priority: 7, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-concussion"), priority: 10, enabled: true },
    { trigger: getTrigger("hp-below-50"), action: getAction("self-repair"), priority: 13, enabled: true },
  ],
  spawnWeight: 1,
  minWave: 14,
  render: () => ({
    headShape: "cube",
    headColor: "#0ea5e9",
    bodyShape: "cube",
    bodyColor: "#0c4a6e",
    limbShape: "cube",
    limbColor: "#7dd3fc",
    hasGlow: true,
    glowColor: "#bae6fd",
    glowIntensity: 1.1
  })
}

export const ELITE_ENEMIES = [
  EXIMUS_STRIKER,
  BOMBARDIER_TITAN,
  PHASE_ASSASSIN,
  SENTINEL_WARDEN
]
