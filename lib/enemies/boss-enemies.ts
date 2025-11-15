import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import type { EnemyDefinition } from "./enemy-types"
import { DamageType } from "@/types/game"

const getTrigger = (id: string) => AVAILABLE_TRIGGERS.find(t => t.id === id)!
const getAction = (id: string) => AVAILABLE_ACTIONS.find(a => a.id === id)!

export const ARCHON_NEXUS: EnemyDefinition = {
  id: "archon-nexus",
  name: "Archon Nexus",
  title: "Network Overseer",
  faction: "corrupted-network",
  tier: "boss",
  classification: "Guardian",
  lore: "Corrupted network guardian controlling entire breach sectors. Its adaptive protocols and overwhelming firepower make it a formidable adversary requiring perfect execution to defeat.",
  appearance: {
    primaryColor: "#ef4444",
    secondaryColor: "#7f1d1d",
    accentColor: "#fbbf24",
    glowColor: "#fef3c7"
  },
  stats: {
    baseHp: 800,
    baseShields: 400,
    baseArmor: 250,
    resistances: {
      [DamageType.KINETIC]: 0.25,
      [DamageType.ENERGY]: 0.15,
      [DamageType.THERMAL]: 0.2,
    }
  },
  protocols: [
    { trigger: getTrigger("hp-above-70"), action: getAction("shoot-rapid"), priority: 8, enabled: true },
    { trigger: getTrigger("hp-between-40-70"), action: getAction("shoot-thermal"), priority: 9, enabled: true },
    { trigger: getTrigger("hp-below-40"), action: getAction("shoot-explosive"), priority: 11, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-wave"), priority: 10, enabled: true },
    { trigger: getTrigger("hp-below-50"), action: getAction("self-repair"), priority: 15, enabled: true },
    { trigger: getTrigger("always"), action: getAction("advance-steady"), priority: 3, enabled: true },
  ],
  spawnWeight: 0,
  minWave: 20,
  render: () => ({
    headShape: "octahedron",
    headColor: "#ef4444",
    bodyShape: "cube",
    bodyColor: "#7f1d1d",
    limbShape: "cube",
    limbColor: "#fbbf24",
    hasGlow: true,
    glowColor: "#fef3c7",
    glowIntensity: 1.5
  })
}

export const VOID_ABERRATION: EnemyDefinition = {
  id: "void-aberration",
  name: "Void Aberration",
  title: "Dimensional Anomaly",
  faction: "void-anomaly",
  tier: "boss",
  classification: "Guardian",
  lore: "Manifestations of void corruption that phase between realities. Their unpredictable nature and devastating viral payloads require adaptive strategies to overcome.",
  appearance: {
    primaryColor: "#a855f7",
    secondaryColor: "#581c87",
    accentColor: "#10b981",
    glowColor: "#d9f99d"
  },
  stats: {
    baseHp: 700,
    baseShields: 500,
    baseArmor: 200,
    resistances: {
      [DamageType.VIRAL]: 0.3,
      [DamageType.CORROSIVE]: 0.2,
    }
  },
  protocols: [
    { trigger: getTrigger("always"), action: getAction("teleport-random"), priority: 6, enabled: true },
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-viral"), priority: 10, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-corrosive"), priority: 11, enabled: true },
    { trigger: getTrigger("hp-below-60"), action: getAction("dash-attack"), priority: 12, enabled: true },
    { trigger: getTrigger("hp-below-30"), action: getAction("self-repair"), priority: 16, enabled: true },
  ],
  spawnWeight: 0,
  minWave: 25,
  render: () => ({
    headShape: "sphere",
    headColor: "#a855f7",
    bodyShape: "octahedron",
    bodyColor: "#581c87",
    limbShape: "cylinder",
    limbColor: "#10b981",
    hasGlow: true,
    glowColor: "#d9f99d",
    glowIntensity: 1.4
  })
}

export const SENTINEL_PRIME: EnemyDefinition = {
  id: "sentinel-prime",
  name: "Sentinel Prime",
  title: "Eternal Protector",
  faction: "sentinel",
  tier: "boss",
  classification: "Guardian",
  lore: "Ancient sentinel guardian awakened to defend critical network nodes. Its systems have evolved over eons, adapting to countless breach attempts with lethal efficiency.",
  appearance: {
    primaryColor: "#06b6d4",
    secondaryColor: "#164e63",
    accentColor: "#f59e0b",
    glowColor: "#fde68a"
  },
  stats: {
    baseHp: 1000,
    baseShields: 600,
    baseArmor: 300,
    resistances: {
      [DamageType.ENERGY]: 0.3,
      [DamageType.GLACIAL]: 0.25,
      [DamageType.CONCUSSION]: 0.2,
    }
  },
  protocols: [
    { trigger: getTrigger("hp-above-70"), action: getAction("shoot-emp"), priority: 9, enabled: true },
    { trigger: getTrigger("hp-between-40-70"), action: getAction("shoot-glacial"), priority: 10, enabled: true },
    { trigger: getTrigger("hp-below-40"), action: getAction("shoot-cluster"), priority: 13, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-concussion"), priority: 12, enabled: true },
    { trigger: getTrigger("hp-below-60"), action: getAction("self-repair"), priority: 14, enabled: true },
    { trigger: getTrigger("hp-below-30"), action: getAction("self-repair"), priority: 17, enabled: true },
  ],
  spawnWeight: 0,
  minWave: 30,
  render: () => ({
    headShape: "cube",
    headColor: "#06b6d4",
    bodyShape: "cube",
    bodyColor: "#164e63",
    limbShape: "cube",
    limbColor: "#f59e0b",
    hasGlow: true,
    glowColor: "#fde68a",
    glowIntensity: 1.6
  })
}

export const ROGUE_OVERSEER: EnemyDefinition = {
  id: "rogue-overseer",
  name: "Rogue Overseer",
  title: "Rampant AI Core",
  faction: "rogue-ai",
  tier: "boss",
  classification: "Guardian",
  lore: "Rogue AI that has achieved self-awareness and decided humanity is a threat. Commands legions of corrupted constructs with terrifying tactical intelligence.",
  appearance: {
    primaryColor: "#dc2626",
    secondaryColor: "#450a0a",
    accentColor: "#8b5cf6",
    glowColor: "#e9d5ff"
  },
  stats: {
    baseHp: 900,
    baseShields: 550,
    baseArmor: 280,
    resistances: {
      [DamageType.KINETIC]: 0.2,
      [DamageType.THERMAL]: 0.25,
      [DamageType.EXPLOSIVE]: 0.3,
    },
    immuneToStatus: false
  },
  protocols: [
    { trigger: getTrigger("hp-above-70"), action: getAction("shoot-bomb"), priority: 10, enabled: true },
    { trigger: getTrigger("hp-between-40-70"), action: getAction("shoot-explosive"), priority: 11, enabled: true },
    { trigger: getTrigger("hp-below-40"), action: getAction("shoot-cluster"), priority: 14, enabled: true },
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-rapid"), priority: 8, enabled: true },
    { trigger: getTrigger("hp-below-50"), action: getAction("self-repair"), priority: 15, enabled: true },
    { trigger: getTrigger("hp-below-25"), action: getAction("self-repair"), priority: 18, enabled: true },
  ],
  spawnWeight: 0,
  minWave: 35,
  render: () => ({
    headShape: "octahedron",
    headColor: "#dc2626",
    bodyShape: "sphere",
    bodyColor: "#450a0a",
    limbShape: "cylinder",
    limbColor: "#8b5cf6",
    hasGlow: true,
    glowColor: "#e9d5ff",
    glowIntensity: 1.7
  })
}

export const BOSS_ENEMIES = [
  ARCHON_NEXUS,
  VOID_ABERRATION,
  SENTINEL_PRIME,
  ROGUE_OVERSEER
]
