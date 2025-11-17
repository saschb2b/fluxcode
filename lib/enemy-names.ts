export function generateEnemyName(wave: number, index = 0): { name: string; title: string } {
  const prefixes = [
    "Dark",
    "Shadow",
    "Cyber",
    "Neon",
    "Quantum",
    "Digital",
    "Plasma",
    "Chrome",
    "Void",
    "Glitch",
    "Binary",
    "Pixel",
    "Vector",
    "Matrix",
    "Neural",
  ]

  const names = [
    "Striker",
    "Reaper",
    "Phantom",
    "Sentinel",
    "Warden",
    "Hunter",
    "Enforcer",
    "Guardian",
    "Destroyer",
    "Assassin",
    "Warrior",
    "Champion",
    "Titan",
    "Colossus",
    "Juggernaut",
  ]

  const titles = [
    "the Unstoppable",
    "the Merciless",
    "the Corrupted",
    "the Relentless",
    "the Eternal",
    "the Infinite",
    "the Supreme",
    "the Ultimate",
    "the Legendary",
    "the Mythical",
    "the Immortal",
    "the Invincible",
    "the Undefeated",
    "the Fearless",
    "the Ruthless",
  ]

  const prefixIndex = ((wave + index) * 7) % prefixes.length
  const nameIndex = ((wave + index) * 13) % names.length
  const titleIndex = ((wave + index) * 17) % titles.length

  return {
    name: `${prefixes[prefixIndex]} ${names[nameIndex]}`,
    title: titles[titleIndex],
  }
}

export function generatePawnName(guardianWave: number, pawnIndex: number): { name: string; type: string } {
  const pawnTypes = [
    "Support Drone",
    "Shield Bot",
    "Repair Unit",
    "Buffer Node",
    "Healing Core",
    "Defense Turret",
    "Amplifier",
    "Guardian Minion",
  ]

  const typeIndex = (pawnIndex * 11) % pawnTypes.length

  return {
    name: `${pawnTypes[typeIndex]} ${String.fromCharCode(65 + pawnIndex)}`, // A, B, C, etc.
    type: pawnTypes[typeIndex],
  }
}

export const generateGuardianPawnName = generatePawnName
