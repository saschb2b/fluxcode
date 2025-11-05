export function generateEnemyName(wave: number): { name: string; title: string } {
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

  // Use wave number as seed for consistent but varied names
  const prefixIndex = (wave * 7) % prefixes.length
  const nameIndex = (wave * 13) % names.length
  const titleIndex = (wave * 17) % titles.length

  return {
    name: `${prefixes[prefixIndex]} ${names[nameIndex]}`,
    title: titles[titleIndex],
  }
}
