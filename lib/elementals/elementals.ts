import { DamageType } from "@/types/game";

export const AVAILABLE_ELEMENTALS = [
  {
    type: DamageType.KINETIC,
    name: "Kinetic",
    color: "#94a3b8",
    description: "Ballistic projectiles and physical impact",
    effect:
      "Standard damage type. Strong vs armor plating, weak vs energy shields.",
    statusEffect: "None",
    narrative:
      "Conventional ballistic weapons. Effective at penetrating physical armor but dispersed by energy shields.",
    threat: "STANDARD",
  },
  {
    type: DamageType.ENERGY,
    name: "Energy",
    color: "#22d3ee",
    description: "Plasma beams and directed energy weaponry",
    effect:
      "+100% damage vs shields, -50% damage vs armor. Best shield-breaker in the arsenal.",
    statusEffect:
      "EMP - Drains 8% of current shields instantly and disables shield regeneration for 5s (stacks up to 5x)",
    narrative:
      "Superheated plasma bursts designed for shield disruption. Each EMP proc cripples energy barriers and prevents recovery, leaving targets vulnerable. Ineffective against physical plating.",
    threat: "HIGH",
  },
  {
    type: DamageType.THERMAL,
    name: "Thermal",
    color: "#f97316",
    description: "Incendiary and heat-based attacks",
    effect:
      "Applies burn stacks that deal 2 damage per 0.5s directly to HP, bypassing all defenses.",
    statusEffect:
      "Burn - Each stack inflicts persistent heat damage to core systems every 0.5s for 4 seconds (stacks up to 5x independently)",
    narrative:
      "Ignition-based weaponry that bypasses external defenses entirely. Multiple burn stacks create devastating damage-over-time, cooking core processing systems from the inside.",
    threat: "CRITICAL",
  },
  {
    type: DamageType.VIRAL,
    name: "Viral",
    color: "#a855f7",
    description: "Malware injection and system corruption",
    effect:
      "Amplifies ALL damage to HP. Scales progressively: 1 stack = +20%, 2 = +35%, 3 = +50%, 4 = +75%, 5 = +100%.",
    statusEffect:
      "Viral Infection - Corrupts structural integrity, making target take massively increased HP damage. Each stack lasts 10s independently (max 5 stacks)",
    narrative:
      "Corrupted data payloads that compromise system integrity at the fundamental level. A fully infected target takes double damage from all sources, making Viral essential for high-HP enemies.",
    threat: "CRITICAL",
  },
  {
    type: DamageType.CORROSIVE,
    name: "Corrosive",
    color: "#84cc16",
    description: "Armor degradation protocols",
    effect:
      "Each proc permanently strips 10% of current armor (minimum 1 point). Stacks until armor reaches 0.",
    statusEffect:
      "Degrade - Permanently dismantles armor plating. Each application strips more until defenses are completely eliminated (no stack limit)",
    narrative:
      "Nanite-based disassembly agents that systematically dissolve physical plating. Against heavily armored targets, Corrosive is essential—strip their defenses to expose vulnerable systems beneath.",
    threat: "HIGH",
  },
  {
    type: DamageType.CONCUSSION,
    name: "Concussion",
    color: "#ef4444",
    description: "Resonant pressure waves and concussive fields",
    effect:
      "Weak vs shields (-10%), moderate vs armor (100%), strong vs exposed HP (+25%). Creates battlefield control through forceful spatial manipulation.",
    statusEffect:
      "Displace - Immediately pushes enemy backward 1 tile (2 tiles with 2+ stacks). Corrupts next Move action, forcing random movement or failure. Lasts 5.5s (max 3 stacks)",
    narrative:
      "Deployment of resonant pressure waves designed to overwhelm enemy physical stability and disrupt their positional strategy. Specializes in breaking formations and denying tactical movement through sheer concussive force. Each Displace stack simultaneously repositions the target while corrupting their pathfinding protocols—forcing them to waste moves attempting random relocations or stranding them entirely if surrounded. Excellent for protecting allies, controlling engagement range, and creating tactical openings.",
    threat: "HIGH",
  },
  {
    type: DamageType.GLACIAL,
    name: "Cryo-Flux",
    color: "#06b6d4",
    description: "Quantum-cooled time manipulation",
    effect:
      "-10% damage vs shields, moderate (100%) vs armor/HP. Impedes enemy processing cycles and creates tactical windows.",
    statusEffect:
      "Lag - Each stack increases enemy cooldowns by +15%, reduces movement by -10%, and adds 5% chance of action failure. Creates frame-drop stuttering (stacks up to 5x, 6s duration)",
    narrative:
      "Controlled injections of quantum-cooled Cryo-Flux agents. Doesn't directly disable protocols but critically destabilizes an enemy's internal clock cycles and processing environment, causing intermittent system hangs, cooldown delays, and movement restrictions. Synergizes with all elements by extending exposure windows.",
    threat: "HIGH",
  },
];
