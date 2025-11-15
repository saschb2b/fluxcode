import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import type { EnemyDefinition } from "./enemy-types"
import { DamageType } from "@/types/game"

const getTrigger = (id: string) => AVAILABLE_TRIGGERS.find(t => t.id === id)!
const getAction = (id: string) => AVAILABLE_ACTIONS.find(a => a.id === id)!

export const ENFORCER_MECH: EnemyDefinition = {
  id: "enforcer-mech",
  name: "Enforcer Mech",
  title: "Heavy Assault Platform",
  faction: "corrupted-network",
  tier: "advanced",
  classification: "Heavy",
  lore: "Heavy combat mechs deployed to breach-critical sectors. Armed with devastating thermal weapons and reinforced armor plating.",
  appearance: {
    primaryColor: "#dc2626",
    secondaryColor: "#7f1d1d",
    accentColor: "#f59e0b",
    glowColor: "#fbbf24"
  },
  stats: {
    baseHp: 250,
    baseShields: 120,
    baseArmor: 120,
    resistances: {
      [DamageType.KINETIC]: 0.2,
    }
  },
  protocols: [
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-thermal"), priority: 7, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-explosive"), priority: 9, enabled: true },
    { trigger: getTrigger("always"), action: getAction("advance-steady"), priority: 3, enabled: true },
  ],
  spawnWeight: 4,
  minWave: 4,
  render: () => ({
    headShape: "cube",
    headColor: "#dc2626",
    bodyShape: "cube",
    bodyColor: "#7f1d1d",
    limbShape: "cube",
    limbColor: "#f59e0b",
    hasGlow: true,
    glowColor: "#fbbf24",
    glowIntensity: 0.8
  })
}

export const NULLIFIER_PROTOCOL: EnemyDefinition = {
  id: "nullifier-protocol",
  name: "Nullifier Protocol",
  title: "System Suppression Unit",
  faction: "rogue-ai",
  tier: "advanced",
  classification: "Support",
  lore: "Advanced AI constructs that disrupt enemy systems. Their EMP fields drain shields and corrupt tactical protocols.",
  appearance: {
    primaryColor: "#06b6d4",
    secondaryColor: "#164e63",
    accentColor: "#67e8f9",
    glowColor: "#a5f3fc"
  },
  stats: {
    baseHp: 180,
    baseShields: 180,
    baseArmor: 60,
    resistances: {
      [DamageType.ENERGY]: 0.3,
    }
  },
  protocols: [
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-emp"), priority: 8, enabled: true },
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-glacial"), priority: 7, enabled: true },
    { trigger: getTrigger("hp-below-50"), action: getAction("teleport-back"), priority: 10, enabled: true },
  ],
  spawnWeight: 3,
  minWave: 5,
  render: () => ({
    headShape: "octahedron",
    headColor: "#06b6d4",
    bodyShape: "sphere",
    bodyColor: "#164e63",
    limbShape: "cylinder",
    limbColor: "#67e8f9",
    hasGlow: true,
    glowColor: "#a5f3fc",
    glowIntensity: 0.9
  })
}

export const CORRUPTOR_AGENT: EnemyDefinition = {
  id: "corruptor-agent",
  name: "Corruptor Agent",
  title: "Armor Dissolution Specialist",
  faction: "void-anomaly",
  tier: "advanced",
  classification: "Specialist",
  lore: "Void-touched entities that phase through reality, deploying corrosive nanites to dissolve physical defenses.",
  appearance: {
    primaryColor: "#10b981",
    secondaryColor: "#064e3b",
    accentColor: "#6ee7b7",
    glowColor: "#a7f3d0"
  },
  stats: {
    baseHp: 200,
    baseShields: 100,
    baseArmor: 70,
  },
  protocols: [
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-corrosive"), priority: 9, enabled: true },
    { trigger: getTrigger("enemy-far-range"), action: getAction("shoot-viral"), priority: 6, enabled: true },
    { trigger: getTrigger("always"), action: getAction("advance-steady"), priority: 2, enabled: true },
  ],
  spawnWeight: 3,
  minWave: 6,
  render: () => ({
    headShape: "sphere",
    headColor: "#10b981",
    bodyShape: "octahedron",
    bodyColor: "#064e3b",
    limbShape: "cylinder",
    limbColor: "#6ee7b7",
    hasGlow: true,
    glowColor: "#a7f3d0",
    glowIntensity: 0.7
  })
}

export const DISRUPTOR_CORE: EnemyDefinition = {
  id: "disruptor-core",
  name: "Disruptor Core",
  title: "Concussive Wave Generator",
  faction: "sentinel",
  tier: "advanced",
  classification: "Control",
  lore: "Sentinel cores that project resonant pressure waves, disrupting enemy positioning and corrupting movement protocols.",
  appearance: {
    primaryColor: "#f59e0b",
    secondaryColor: "#78350f",
    accentColor: "#fbbf24",
    glowColor: "#fde68a"
  },
  stats: {
    baseHp: 220,
    baseShields: 140,
    baseArmor: 90,
  },
  protocols: [
    { trigger: getTrigger("enemy-mid-range"), action: getAction("shoot-concussion"), priority: 8, enabled: true },
    { trigger: getTrigger("enemy-close-range"), action: getAction("shoot-wave"), priority: 9, enabled: true },
    { trigger: getTrigger("hp-below-60"), action: getAction("dodge-back"), priority: 7, enabled: true },
  ],
  spawnWeight: 3,
  minWave: 7,
  render: () => ({
    headShape: "sphere",
    headColor: "#f59e0b",
    bodyShape: "sphere",
    bodyColor: "#78350f",
    limbShape: "cylinder",
    limbColor: "#fbbf24",
    hasGlow: true,
    glowColor: "#fde68a",
    glowIntensity: 0.8
  })
}

export const ADVANCED_ENEMIES = [
  ENFORCER_MECH,
  NULLIFIER_PROTOCOL,
  CORRUPTOR_AGENT,
  DISRUPTOR_CORE
]
