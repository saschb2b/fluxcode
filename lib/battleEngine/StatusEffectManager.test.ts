import { StatusEffectManager } from "./StatusEffectManager";
import type { EnemyState, Projectile } from "@/types/game";
import { DamageType } from "@/types/game";

/**
 * Test suite for StatusEffectManager
 *
 * Verifies that status effects are applied correctly, respect stack limits,
 * expire properly, and calculate multipliers accurately.
 */
describe("StatusEffectManager", () => {
  let mockEnemy: EnemyState;
  let mockProjectile: Projectile;

  /**
   * Set up a mock enemy with default properties before each test.
   * This ensures test isolation and prevents state leakage between tests.
   */
  beforeEach(() => {
    mockEnemy = {
      id: "test-enemy",
      position: { x: 3, y: 1 },
      hp: 100,
      maxHp: 100,
      shields: 100,
      maxShields: 100,
      armor: 50,
      maxArmor: 50,
      burnStacks: [],
      viralStacks: [],
      empStacks: [],
      lagStacks: [],
      displaceStacks: [],
      corrosiveStacks: [],
      shieldRegenDisabled: false,
      isPawn: false,
    };

    mockProjectile = {
      id: "test-proj",
      position: { x: 0, y: 0 },
      direction: "right",
      damage: 10,
      damageType: DamageType.KINETIC,
      statusChance: 1.0, // 100% for predictable testing
    };
  });

  // ============================================================================
  // BURN STATUS EFFECT TESTS
  // ============================================================================

  describe("Burn Status Effect", () => {
    /**
     * Test that burn is applied when conditions are met.
     * Burn should add a stack with the correct damage per tick and end time.
     */
    it("should apply burn when thermal projectile hits with valid status chance", () => {
      const battleTime = 1000;
      mockProjectile.damageType = DamageType.THERMAL;
      mockProjectile.statusChance = 1.0;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.burnStacks).toHaveLength(1);
      expect(mockEnemy.burnStacks[0].damage).toBe(2);
      expect(mockEnemy.burnStacks[0].endTime).toBe(battleTime + 4000);
    });

    /**
     * Test that burn respects the maximum stack limit.
     * After reaching max stacks (5), additional applications should be ignored.
     */
    it("should not exceed maximum burn stacks", () => {
      const battleTime = 1000;
      mockProjectile.damageType = DamageType.THERMAL;
      mockProjectile.statusChance = 1.0;

      // Apply burn 6 times
      for (let i = 0; i < 6; i++) {
        StatusEffectManager.tryApplyStatus(
          mockEnemy,
          mockProjectile,
          battleTime,
          true,
        );
      }

      // Should only have 5 stacks (max)
      expect(mockEnemy.burnStacks).toHaveLength(5);
    });

    /**
     * Test that burn is not applied when status chance fails.
     * A 0% status chance should never apply the effect.
     */
    it("should not apply burn if status chance fails", () => {
      const battleTime = 1000;
      mockProjectile.damageType = DamageType.THERMAL;
      mockProjectile.statusChance = 0.0; // 0% chance

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.burnStacks).toHaveLength(0);
    });

    /**
     * Test that burn is not applied when canApplyStatus is false.
     * This simulates an enemy immune to status effects.
     */
    it("should not apply burn if canApplyStatus is false", () => {
      const battleTime = 1000;
      mockProjectile.damageType = DamageType.THERMAL;
      mockProjectile.statusChance = 1.0;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        false, // immune to status effects
      );

      expect(mockEnemy.burnStacks).toHaveLength(0);
    });
  });

  // ============================================================================
  // VIRAL STATUS EFFECT TESTS
  // ============================================================================

  describe("Viral Status Effect", () => {
    /**
     * Test that viral infection is applied when conditions are met.
     */
    it("should apply viral infection when viral projectile hits", () => {
      const battleTime = 2000;
      mockProjectile.damageType = DamageType.VIRAL;
      mockProjectile.statusChance = 1.0;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.viralStacks).toHaveLength(1);
      expect(mockEnemy.viralStacks[0].endTime).toBe(battleTime + 10000);
    });

    /**
     * Test that viral respects the maximum stack limit (5 stacks).
     */
    it("should not exceed maximum viral stacks", () => {
      const battleTime = 2000;
      mockProjectile.damageType = DamageType.VIRAL;
      mockProjectile.statusChance = 1.0;

      for (let i = 0; i < 6; i++) {
        StatusEffectManager.tryApplyStatus(
          mockEnemy,
          mockProjectile,
          battleTime,
          true,
        );
      }

      expect(mockEnemy.viralStacks).toHaveLength(5);
    });
  });

  // ============================================================================
  // EMP STATUS EFFECT TESTS
  // ============================================================================

  describe("EMP Status Effect", () => {
    /**
     * Test that EMP is applied and immediately drains shields.
     */
    it("should apply EMP and drain shields", () => {
      const battleTime = 3000;
      mockProjectile.damageType = DamageType.ENERGY;
      mockProjectile.statusChance = 1.0;
      mockEnemy.shields = 100;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      // Shield drain: 100 * 0.08 = 8
      expect(mockEnemy.shields).toBe(92);
      expect(mockEnemy.empStacks).toHaveLength(1);
      expect(mockEnemy.empStacks[0].endTime).toBe(battleTime + 5000);
    });

    /**
     * Test that EMP does not drain shields if shields are at 0.
     */
    it("should not drain shields if enemy has no shields", () => {
      const battleTime = 3000;
      mockProjectile.damageType = DamageType.ENERGY;
      mockProjectile.statusChance = 1.0;
      mockEnemy.shields = 0;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.shields).toBe(0);
      expect(mockEnemy.empStacks).toHaveLength(1);
    });

    /**
     * Test that EMP respects the maximum stack limit (5 stacks).
     */
    it("should not exceed maximum EMP stacks", () => {
      const battleTime = 3000;
      mockProjectile.damageType = DamageType.ENERGY;
      mockProjectile.statusChance = 1.0;

      for (let i = 0; i < 6; i++) {
        StatusEffectManager.tryApplyStatus(
          mockEnemy,
          mockProjectile,
          battleTime,
          true,
        );
      }

      expect(mockEnemy.empStacks).toHaveLength(5);
    });
  });

  // ============================================================================
  // LAG STATUS EFFECT TESTS
  // ============================================================================

  describe("Lag Status Effect", () => {
    /**
     * Test that lag is applied with correct properties.
     */
    it("should apply lag with correct cooldown increase values", () => {
      const battleTime = 4000;
      mockProjectile.damageType = DamageType.GLACIAL;
      mockProjectile.statusChance = 1.0;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.lagStacks).toHaveLength(1);
      expect(mockEnemy.lagStacks[0].cooldownIncrease).toBe(0.15);
      expect(mockEnemy.lagStacks[0].movementReduction).toBe(0.1);
      expect(mockEnemy.lagStacks[0].actionFailureChance).toBe(0.05);
      expect(mockEnemy.lagStacks[0].endTime).toBe(battleTime + 6000);
    });

    /**
     * Test that lag respects the maximum stack limit (5 stacks).
     */
    it("should not exceed maximum lag stacks", () => {
      const battleTime = 4000;
      mockProjectile.damageType = DamageType.GLACIAL;
      mockProjectile.statusChance = 1.0;

      for (let i = 0; i < 6; i++) {
        StatusEffectManager.tryApplyStatus(
          mockEnemy,
          mockProjectile,
          battleTime,
          true,
        );
      }

      expect(mockEnemy.lagStacks).toHaveLength(5);
    });
  });

  // ============================================================================
  // DISPLACE STATUS EFFECT TESTS
  // ============================================================================

  describe("Displace Status Effect", () => {
    /**
     * Test that displace pushes the enemy back by 1 tile on first application.
     */
    it("should push enemy back by 1 tile on first displace", () => {
      const battleTime = 5000;
      mockProjectile.damageType = DamageType.CONCUSSION;
      mockProjectile.statusChance = 1.0;
      mockEnemy.position = { x: 3, y: 1 };

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.position.x).toBe(4);
      expect(mockEnemy.displaceStacks).toHaveLength(1);
    });

    /**
     * Test that displace pushes by 2 tiles on second application.
     */
    it("should push enemy back by 2 tiles on second displace", () => {
      const battleTime = 5000;
      mockProjectile.damageType = DamageType.CONCUSSION;
      mockProjectile.statusChance = 1.0;
      mockEnemy.position = { x: 2, y: 1 };

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime + 100,
        true,
      );

      expect(mockEnemy.position.x).toBe(4); // 2 + 1 + 1 (each displace adds 1 on first two stacks)
      expect(mockEnemy.displaceStacks).toHaveLength(2);
    });

    /**
     * Test that displace does not push beyond grid boundary (max x = 5).
     */
    it("should not push enemy beyond grid boundary", () => {
      const battleTime = 5000;
      mockProjectile.damageType = DamageType.CONCUSSION;
      mockProjectile.statusChance = 1.0;
      mockEnemy.position = { x: 4, y: 1 };

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.position.x).toBe(5); // Capped at 5
      expect(mockEnemy.displaceStacks).toHaveLength(1);
    });

    /**
     * Test that displace respects the maximum stack limit (3 stacks).
     */
    it("should not exceed maximum displace stacks", () => {
      const battleTime = 5000;
      mockProjectile.damageType = DamageType.CONCUSSION;
      mockProjectile.statusChance = 1.0;

      for (let i = 0; i < 4; i++) {
        StatusEffectManager.tryApplyStatus(
          mockEnemy,
          mockProjectile,
          battleTime,
          true,
        );
      }

      expect(mockEnemy.displaceStacks).toHaveLength(3);
    });
  });

  // ============================================================================
  // CORROSIVE STATUS EFFECT TESTS
  // ============================================================================

  describe("Corrosive Status Effect", () => {
    /**
     * Test that corrosive strips armor based on a percentage.
     * 10% of 50 armor = 5 armor stripped.
     */
    it("should strip armor by percentage", () => {
      const battleTime = 6000;
      mockProjectile.damageType = DamageType.CORROSIVE;
      mockProjectile.statusChance = 1.0;
      mockEnemy.armor = 50;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      // 10% of 50 = 5
      expect(mockEnemy.armor).toBe(45);
      expect(mockEnemy.corrosiveStacks).toHaveLength(1);
      expect(mockEnemy.corrosiveStacks[0].armorStripped).toBe(5);
    });

    /**
     * Test that corrosive strips a minimum of 1 armor, even on low armor values.
     */
    it("should strip at least 1 armor even on low values", () => {
      const battleTime = 6000;
      mockProjectile.damageType = DamageType.CORROSIVE;
      mockProjectile.statusChance = 1.0;
      mockEnemy.armor = 5; // 10% of 5 = 0.5, should be at least 1

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.armor).toBe(4);
      expect(mockEnemy.corrosiveStacks[0].armorStripped).toBe(1);
    });

    /**
     * Test that corrosive does not strip armor if enemy has no armor.
     */
    it("should not apply corrosive if enemy has no armor", () => {
      const battleTime = 6000;
      mockProjectile.damageType = DamageType.CORROSIVE;
      mockProjectile.statusChance = 1.0;
      mockEnemy.armor = 0;

      StatusEffectManager.tryApplyStatus(
        mockEnemy,
        mockProjectile,
        battleTime,
        true,
      );

      expect(mockEnemy.corrosiveStacks).toHaveLength(0);
    });

    /**
     * Test that corrosive can stack infinitely (max 999999 stacks).
     */
    it("should allow virtually unlimited corrosive stacks", () => {
      const battleTime = 6000;
      mockProjectile.damageType = DamageType.CORROSIVE;
      mockProjectile.statusChance = 1.0;
      mockEnemy.armor = 9999999; // Large armor pool

      for (let i = 0; i < 100; i++) {
        StatusEffectManager.tryApplyStatus(
          mockEnemy,
          mockProjectile,
          battleTime,
          true,
        );
      }

      expect(mockEnemy.corrosiveStacks).toHaveLength(100);
    });
  });

  // ============================================================================
  // CLEANUP & EXPIRATION TESTS
  // ============================================================================

  describe("cleanupExpiredEffects", () => {
    /**
     * Test that expired effects are removed and non-expired ones remain.
     */
    it("should remove expired status effects and keep active ones", () => {
      mockEnemy.burnStacks = [
        { damage: 2, endTime: 500 }, // Expired
        { damage: 2, endTime: 2000 }, // Still active
      ];

      StatusEffectManager.cleanupExpiredEffects(mockEnemy, 1000);

      expect(mockEnemy.burnStacks).toHaveLength(1);
      expect(mockEnemy.burnStacks[0].endTime).toBe(2000);
    });

    /**
     * Test that all effect types are cleaned up properly.
     */
    it("should cleanup all effect types", () => {
      mockEnemy.burnStacks = [{ damage: 2, endTime: 500 }];
      mockEnemy.viralStacks = [{ endTime: 500 }];
      mockEnemy.empStacks = [{ endTime: 500, shieldDrainPercent: 0.08 }];
      mockEnemy.lagStacks = [
        {
          endTime: 500,
          cooldownIncrease: 0.15,
          movementReduction: 0.1,
          actionFailureChance: 0.05,
        },
      ];
      mockEnemy.displaceStacks = [
        { endTime: 500, pushDistance: 1, corruptMovement: true },
      ];
      mockEnemy.corrosiveStacks = [{ endTime: 500, armorStripped: 5 }];

      const battleTime = 1000;
      StatusEffectManager.cleanupExpiredEffects(mockEnemy, battleTime);

      expect(mockEnemy.burnStacks).toHaveLength(0);
      expect(mockEnemy.viralStacks).toHaveLength(0);
      expect(mockEnemy.empStacks).toHaveLength(0);
      expect(mockEnemy.lagStacks).toHaveLength(0);
      expect(mockEnemy.displaceStacks).toHaveLength(0);
      expect(mockEnemy.corrosiveStacks).toHaveLength(0);
    });

    /**
     * Test that shield regen disabled flag is properly managed.
     * It should be true if any EMP stacks exist, false otherwise.
     */
    it("should set shieldRegenDisabled to true when EMP stacks exist", () => {
      mockEnemy.empStacks = [{ endTime: 2000, shieldDrainPercent: 0.08 }];

      StatusEffectManager.cleanupExpiredEffects(mockEnemy, 1000);

      expect(mockEnemy.shieldRegenDisabled).toBe(true);
    });

    /**
     * Test that shield regen disabled flag is false when EMP expires.
     */
    it("should set shieldRegenDisabled to false when all EMP stacks expire", () => {
      mockEnemy.empStacks = [{ endTime: 500, shieldDrainPercent: 0.08 }];

      StatusEffectManager.cleanupExpiredEffects(mockEnemy, 1000);

      expect(mockEnemy.empStacks).toHaveLength(0);
      expect(mockEnemy.shieldRegenDisabled).toBe(false);
    });
  });

  // ============================================================================
  // MULTIPLIER CALCULATION TESTS
  // ============================================================================

  describe("getViralDamageMultiplier", () => {
    /**
     * Test that no viral stacks result in 1.0x multiplier (no increase).
     */
    it("should return 1.0x with no viral stacks", () => {
      const enemies: EnemyState[] = [mockEnemy];
      const multiplier = StatusEffectManager.getViralDamageMultiplier(enemies);

      expect(multiplier).toBe(1.0);
    });

    /**
     * Test that viral multiplier scales correctly with stacks.
     * 1 stack = 1.2x, 2 stacks = 1.35x, 5+ stacks = 2.0x.
     */
    it("should scale viral multiplier correctly with stack count", () => {
      const enemies: EnemyState[] = [];

      // Test each stack count
      for (let i = 0; i <= 5; i++) {
        const enemy = {
          ...mockEnemy,
          viralStacks: Array(i).fill({ endTime: 999999 }),
        };
        enemies[0] = enemy;

        const multiplier = StatusEffectManager.getViralDamageMultiplier([
          enemy,
        ]);
        const expectedValues = [1.0, 1.2, 1.35, 1.5, 1.75, 2.0];
        expect(multiplier).toBe(expectedValues[i]);
      }
    });

    /**
     * Test that viral multiplier caps at 2.0x even with excessive stacks.
     */
    it("should cap viral multiplier at 2.0x", () => {
      mockEnemy.viralStacks = Array(10).fill({ endTime: 999999 });

      const multiplier = StatusEffectManager.getViralDamageMultiplier([
        mockEnemy,
      ]);

      expect(multiplier).toBe(2.0);
    });

    /**
     * Test that multiplier accumulates across multiple enemies.
     */
    it("should accumulate viral stacks across multiple enemies", () => {
      const enemy1 = {
        ...mockEnemy,
        viralStacks: Array(2).fill({
          endTime: 999999,
        }),
      };
      const enemy2 = {
        ...mockEnemy,
        viralStacks: Array(3).fill({
          endTime: 999999,
        }),
      };

      // Total: 5 stacks = 2.0x multiplier
      const multiplier = StatusEffectManager.getViralDamageMultiplier([
        enemy1,
        enemy2,
      ]);

      expect(multiplier).toBe(2.0);
    });
  });

  describe("getLagCooldownMultiplier", () => {
    /**
     * Test that no lag stacks result in 1.0x multiplier (no slowdown).
     */
    it("should return 1.0x with no lag stacks", () => {
      const multiplier =
        StatusEffectManager.getLagCooldownMultiplier(mockEnemy);

      expect(multiplier).toBe(1.0);
    });

    /**
     * Test that lag multiplier scales linearly with stacks.
     * Each stack adds +0.15x (15% slowdown).
     */
    it("should increase cooldown by 15% per lag stack", () => {
      mockEnemy.lagStacks = Array(3).fill({
        endTime: 999999,
        cooldownIncrease: 0.15,
        movementReduction: 0.1,
        actionFailureChance: 0.05,
      });

      const multiplier =
        StatusEffectManager.getLagCooldownMultiplier(mockEnemy);

      // 1.0 + (3 * 0.15) = 1.45
      expect(multiplier).toBe(1.45);
    });

    /**
     * Test that lag multiplier scales with maximum stack count (5 stacks).
     */
    it("should calculate multiplier for maximum lag stacks", () => {
      mockEnemy.lagStacks = Array(5).fill({
        endTime: 999999,
        cooldownIncrease: 0.15,
        movementReduction: 0.1,
        actionFailureChance: 0.05,
      });

      const multiplier =
        StatusEffectManager.getLagCooldownMultiplier(mockEnemy);

      // 1.0 + (5 * 0.15) = 1.75
      expect(multiplier).toBe(1.75);
    });
  });
});
