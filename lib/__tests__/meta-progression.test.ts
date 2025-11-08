import { describe, it, expect, beforeEach } from "@jest/globals"
import {
  getDefaultProgress,
  calculateCipherFragmentReward,
  canAffordUpgrade,
  purchaseUpgrade,
  getUpgradeLevel,
  getTotalStatBonus,
  getActionDamageBonus,
  META_UPGRADES,
  type PlayerProgress,
} from "../meta-progression"

describe("Meta Progression System", () => {
  let progress: PlayerProgress

  beforeEach(() => {
    progress = getDefaultProgress()
  })

  describe("Default Progress", () => {
    it("should initialize with correct defaults", () => {
      expect(progress.cipherFragments).toBe(0)
      expect(progress.upgrades).toEqual({})
      expect(progress.unlockedActions).toEqual([])
      expect(progress.unlockedTriggers).toEqual([])
      expect(progress.totalNodesCompleted).toBe(0)
      expect(progress.totalRuns).toBe(0)
      expect(progress.bestLayerReached).toBe(0)
      expect(progress.bestNodeInBestLayer).toBe(0)
    })
  })

  describe("Cipher Fragment Rewards", () => {
    it("should calculate base reward correctly", () => {
      expect(calculateCipherFragmentReward(1)).toBe(10)
      expect(calculateCipherFragmentReward(3)).toBe(30)
      expect(calculateCipherFragmentReward(10)).toBe(150) // 10*10 + 2*25
    })

    it("should include milestone bonuses", () => {
      expect(calculateCipherFragmentReward(5)).toBe(75) // 50 + 25 bonus
      expect(calculateCipherFragmentReward(10)).toBe(150) // 100 + 50 bonus
      expect(calculateCipherFragmentReward(15)).toBe(225) // 150 + 75 bonus
    })

    it("should handle zero nodes", () => {
      expect(calculateCipherFragmentReward(0)).toBe(0)
    })
  })

  describe("Upgrade Affordability", () => {
    it("should return false when insufficient funds", () => {
      const hpUpgrade = META_UPGRADES.find((u) => u.id === "hp_boost_1")!
      expect(canAffordUpgrade(progress, hpUpgrade)).toBe(false)
    })

    it("should return true when sufficient funds", () => {
      progress.cipherFragments = 100
      const hpUpgrade = META_UPGRADES.find((u) => u.id === "hp_boost_1")!
      expect(canAffordUpgrade(progress, hpUpgrade)).toBe(true)
    })

    it("should return false when max level reached", () => {
      const hpUpgrade = META_UPGRADES.find((u) => u.id === "hp_boost_1")!
      progress.cipherFragments = 1000
      progress.upgrades[hpUpgrade.id] = hpUpgrade.maxLevel

      expect(canAffordUpgrade(progress, hpUpgrade)).toBe(false)
    })
  })

  describe("Purchase Upgrade", () => {
    it("should deduct cipher fragments on purchase", () => {
      progress.cipherFragments = 100
      const hpUpgrade = META_UPGRADES.find((u) => u.id === "hp_boost_1")!

      const newProgress = purchaseUpgrade(progress, hpUpgrade.id)
      expect(newProgress.cipherFragments).toBe(50) // 100 - 50
    })

    it("should increment upgrade level", () => {
      progress.cipherFragments = 100
      const hpUpgrade = META_UPGRADES.find((u) => u.id === "hp_boost_1")!

      const newProgress = purchaseUpgrade(progress, hpUpgrade.id)
      expect(newProgress.upgrades[hpUpgrade.id]).toBe(1)
    })

    it("should not allow purchase without funds", () => {
      progress.cipherFragments = 10
      const hpUpgrade = META_UPGRADES.find((u) => u.id === "hp_boost_1")!

      const newProgress = purchaseUpgrade(progress, hpUpgrade.id)
      expect(newProgress.cipherFragments).toBe(10)
      expect(newProgress.upgrades[hpUpgrade.id]).toBeUndefined()
    })

    it("should unlock actions when purchasing unlock upgrades", () => {
      progress.cipherFragments = 200
      const rapidFireUnlock = META_UPGRADES.find((u) => u.id === "unlock_rapid_fire")!

      const newProgress = purchaseUpgrade(progress, rapidFireUnlock.id)
      expect(newProgress.unlockedActions).toContain("rapid-fire")
    })

    it("should unlock triggers when purchasing trigger upgrades", () => {
      progress.cipherFragments = 200
      const enemyCloseUnlock = META_UPGRADES.find((u) => u.id === "unlock_enemy_close")!

      const newProgress = purchaseUpgrade(progress, enemyCloseUnlock.id)
      expect(newProgress.unlockedTriggers).toContain("enemy-close")
    })
  })

  describe("Upgrade Level Tracking", () => {
    it("should return 0 for unpurchased upgrades", () => {
      expect(getUpgradeLevel(progress, "hp_boost_1")).toBe(0)
    })

    it("should return correct level for purchased upgrades", () => {
      progress.upgrades["hp_boost_1"] = 3
      expect(getUpgradeLevel(progress, "hp_boost_1")).toBe(3)
    })
  })

  describe("Stat Bonus Calculation", () => {
    it("should sum HP bonuses correctly", () => {
      progress.upgrades["hp_boost_1"] = 2 // 2 * 20 = 40
      progress.upgrades["hp_boost_2"] = 1 // 1 * 30 = 30

      expect(getTotalStatBonus(progress, "hp")).toBe(70)
    })

    it("should sum damage bonuses correctly", () => {
      progress.upgrades["damage_boost_1"] = 3 // 3 * 0.1 = 0.3
      progress.upgrades["damage_boost_2"] = 1 // 1 * 0.15 = 0.15

      expect(getTotalStatBonus(progress, "damage")).toBe(0.45)
    })

    it("should return 0 when no upgrades purchased", () => {
      expect(getTotalStatBonus(progress, "hp")).toBe(0)
      expect(getTotalStatBonus(progress, "damage")).toBe(0)
    })

    it("should handle defense stat correctly", () => {
      progress.upgrades["defense_1"] = 2 // 2 * 0.05 = 0.1

      expect(getTotalStatBonus(progress, "defense")).toBe(0.1)
    })

    it("should handle crit chance correctly", () => {
      progress.upgrades["crit_chance_1"] = 2 // 2 * 0.05 = 0.1

      expect(getTotalStatBonus(progress, "crit_chance")).toBe(0.1)
    })
  })

  describe("Action Damage Bonus", () => {
    it("should calculate action-specific damage bonuses", () => {
      progress.upgrades["power_shot_upgrade"] = 2 // 2 * 5 = 10

      expect(getActionDamageBonus(progress, "power-shot")).toBe(10)
    })

    it("should return 0 for actions without upgrades", () => {
      expect(getActionDamageBonus(progress, "some-action")).toBe(0)
    })

    it("should not include generic damage bonuses", () => {
      progress.upgrades["damage_boost_1"] = 3

      // Generic damage bonuses should not appear in action-specific calculation
      expect(getActionDamageBonus(progress, "power-shot")).toBe(0)
    })
  })

  describe("Multiple Upgrade Levels", () => {
    it("should allow upgrading to max level", () => {
      const hpUpgrade = META_UPGRADES.find((u) => u.id === "hp_boost_1")!
      progress.cipherFragments = 1000

      for (let i = 0; i < hpUpgrade.maxLevel; i++) {
        progress = purchaseUpgrade(progress, hpUpgrade.id)
      }

      expect(progress.upgrades[hpUpgrade.id]).toBe(hpUpgrade.maxLevel)
      expect(canAffordUpgrade(progress, hpUpgrade)).toBe(false)
    })
  })
})
