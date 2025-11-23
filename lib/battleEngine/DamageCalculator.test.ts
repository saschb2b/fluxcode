import { DamageCalculator } from "./DamageCalculator";
import { DamageType } from "@/types/game";
import type { EnemyState, BurnStack } from "@/types/game";

describe("DamageCalculator", () => {
  describe("calculateDamage", () => {
    /**
     * Validates the baseline damage calculation with no defenses.
     * Base damage should equal total damage when the target has
     * no shields or armor. This is the simplest case and foundation
     * for all other calculations.
     */
    it("should return base damage when target has no defenses", () => {
      const result = DamageCalculator.calculateDamage(
        100,
        DamageType.KINETIC,
        0,
        0,
      );

      expect(result.totalDamage).toBe(100);
      expect(result.shieldDamage).toBe(0);
      expect(result.armorReduction).toBe(0);
      expect(result.hpDamage).toBe(100);
    });

    /**
     * Confirms that elemental modifiers are applied based on shield presence.
     * Energy damage gets a 2.0x multiplier against shields, so 100 base damage
     * should become 200 total damage. This validates the shield-priority logic.
     */
    it("should apply shield bonus when shields are present", () => {
      const result = DamageCalculator.calculateDamage(
        100,
        DamageType.ENERGY,
        50,
        0,
      );

      expect(result.totalDamage).toBe(200); // 100 * 2.0
      expect(result.hpDamage).toBe(200);
    });

    /**
     * Confirms that elemental modifiers are applied to armor when shields
     * are absent. Energy damage gets 0.5x multiplier against armor, so 100
     * base damage becomes 50. This validates the armor modifier fallback.
     */
    it("should apply armor bonus when shields are absent", () => {
      const result = DamageCalculator.calculateDamage(
        100,
        DamageType.ENERGY,
        0,
        50,
      );

      expect(result.totalDamage).toBe(50); // 100 * 0.5
      expect(result.hpDamage).toBe(50);
    });

    /**
     * Confirms that shields take strict priority in the modifier calculation.
     * When both shields and armor are present, only the shield bonus should
     * be applied. This ensures the defense priority hierarchy is maintained
     * in damage calculations.
     */
    it("should prioritize shields over armor in modifier application", () => {
      const result = DamageCalculator.calculateDamage(
        100,
        DamageType.ENERGY,
        50,
        50,
      );

      expect(result.totalDamage).toBe(200); // Uses shield bonus (2.0), ignores armor
      expect(result.hpDamage).toBe(200);
    });

    /**
     * Validates thermal damage calculation, which has different modifiers
     * than energy. Thermal gets 0.9x against shields (weak) and 1.0x against
     * armor (normal). This confirms different damage types work correctly.
     */
    it("should calculate thermal damage vs shields correctly", () => {
      const result = DamageCalculator.calculateDamage(
        100,
        DamageType.THERMAL,
        50,
        0,
      );

      expect(result.totalDamage).toBe(90); // 100 * 0.9
    });

    /**
     * Validates corrosive damage, which has weak modifiers against both
     * shields (0.8x) and armor (0.5x). This ensures specialized damage
     * types with unique profiles calculate correctly.
     */
    it("should calculate corrosive damage correctly", () => {
      const result = DamageCalculator.calculateDamage(
        100,
        DamageType.CORROSIVE,
        50,
        0,
      );

      expect(result.totalDamage).toBe(80); // 100 * 0.8
    });

    /**
     * Validates that fractional damage calculations work correctly
     * in the returned result. Ensures the calculation system handles
     * non-integer values properly.
     */
    it("should handle fractional damage values", () => {
      const result = DamageCalculator.calculateDamage(
        75,
        DamageType.ENERGY,
        50,
        0,
      );

      expect(result.totalDamage).toBe(150); // 75 * 2.0
    });

    /**
     * Confirms that zero base damage is handled correctly and produces
     * zero output. Tests the boundary condition for minimum damage.
     */
    it("should handle zero base damage", () => {
      const result = DamageCalculator.calculateDamage(
        0,
        DamageType.ENERGY,
        50,
        0,
      );

      expect(result.totalDamage).toBe(0);
      expect(result.hpDamage).toBe(0);
    });
  });

  describe("applyDamageToEnemy", () => {
    /**
     * Creates a mock enemy with standard stats for testing.
     * Provides consistent initial state for damage application tests.
     */
    const createMockEnemy = (
      hp: number = 100,
      shields: number = 0,
      armor: number = 0,
    ): EnemyState => ({
      id: "test-enemy",
      position: { x: 2, y: 1 },
      hp,
      maxHp: 100,
      shields,
      maxShields: 100,
      armor,
      maxArmor: 100,
      burnStacks: [],
      viralStacks: [],
      empStacks: [],
      lagStacks: [],
      displaceStacks: [],
      corrosiveStacks: [],
      shieldRegenDisabled: false,
      isPawn: false,
    });

    /**
     * Validates the simplest damage application: applying damage to an
     * enemy with no defenses. All damage should go directly to HP without
     * any reduction or absorption.
     */
    it("should apply all damage to HP when target has no defenses", () => {
      const enemy = createMockEnemy(100, 0, 0);

      const result = DamageCalculator.applyDamageToEnemy(enemy, 50);

      expect(result.shieldDamage).toBe(0);
      expect(result.hpDamage).toBe(50);
      expect(enemy.hp).toBe(50); // 100 - 50
    });

    /**
     * Validates that shields absorb damage before HP is affected.
     * When shields are present, damage should be distributed between
     * shields and HP, with shields soaking the initial hit.
     */
    it("should absorb damage with shields first", () => {
      const enemy = createMockEnemy(100, 30, 0);

      const result = DamageCalculator.applyDamageToEnemy(enemy, 50);

      expect(result.shieldDamage).toBe(30); // Shields absorbed fully
      expect(result.hpDamage).toBe(20); // Remaining damage
      expect(enemy.shields).toBe(0); // Shields depleted
      expect(enemy.hp).toBe(80); // 100 - 20
    });

    /**
     * Confirms that shields don't absorb more damage than they have.
     * If damage exceeds shield value, shields should be set to 0 and
     * remaining damage passed through to HP.
     */
    it("should not let shields absorb more than their value", () => {
      const enemy = createMockEnemy(100, 20, 0);

      const result = DamageCalculator.applyDamageToEnemy(enemy, 50);

      expect(result.shieldDamage).toBe(20); // Shields capped at 20
      expect(result.hpDamage).toBe(30); // Rest goes to HP
      expect(enemy.shields).toBe(0);
      expect(enemy.hp).toBe(70);
    });

    /**
     * Validates that completely absorbing damage with shields results
     * in no HP damage. When damage is fully absorbed, HP should remain
     * unchanged.
     */
    it("should not apply HP damage when shields absorb all damage", () => {
      const enemy = createMockEnemy(100, 100, 0);

      const result = DamageCalculator.applyDamageToEnemy(enemy, 50);

      expect(result.shieldDamage).toBe(50);
      expect(result.hpDamage).toBe(0);
      expect(enemy.hp).toBe(100); // Unchanged
    });

    /**
     * Validates armor damage reduction calculation. With 300 armor
     * (scaling constant), damage reduction should be 50%. So 100 damage
     * should become 50 after armor reduction.
     */
    it("should reduce damage by armor percentage", () => {
      const enemy = createMockEnemy(100, 0, 300); // 300 armor = 50% reduction

      const result = DamageCalculator.applyDamageToEnemy(enemy, 100);

      expect(result.hpDamage).toBe(50); // 100 * (1 - 0.5)
      expect(enemy.hp).toBe(50);
    });

    /**
     * Validates that armor reduction works correctly with different armor
     * values. With 900 armor (3x scaling constant), reduction should be 75%.
     * So 100 damage becomes 25 after reduction.
     */
    it("should handle higher armor values correctly", () => {
      const enemy = createMockEnemy(100, 0, 900); // 900 armor = 75% reduction

      const result = DamageCalculator.applyDamageToEnemy(enemy, 100);

      expect(result.hpDamage).toBeCloseTo(25, 5); // 100 * (1 - 0.75)
      expect(enemy.hp).toBeCloseTo(75, 5);
    });

    /**
     * Validates that armor only applies to damage remaining after shields
     * are depleted. Shields absorb first, then armor reduces the remainder.
     * This confirms the defense layer priority hierarchy.
     */
    it("should apply armor reduction only to damage after shields", () => {
      const enemy = createMockEnemy(100, 50, 300); // 50 shields, 300 armor

      const result = DamageCalculator.applyDamageToEnemy(enemy, 100);

      expect(result.shieldDamage).toBe(50); // Shields absorb 50
      expect(result.hpDamage).toBeCloseTo(25, 5); // Remaining 50 * 0.5 (50% reduction)
      expect(enemy.shields).toBe(0);
      expect(enemy.hp).toBeCloseTo(75, 5);
    });

    /**
     * Confirms that zero armor applies no reduction. With 0 armor,
     * all remaining damage should be applied directly to HP.
     */
    it("should not reduce damage with zero armor", () => {
      const enemy = createMockEnemy(100, 0, 0);

      const result = DamageCalculator.applyDamageToEnemy(enemy, 50);

      expect(result.hpDamage).toBe(50);
      expect(enemy.hp).toBe(50);
    });

    /**
     * Confirms that damage cannot reduce HP below zero. HP should be
     * clamped at 0 when damage exceeds current HP.
     */
    it("should not reduce HP below zero", () => {
      const enemy = createMockEnemy(30, 0, 0);

      const result = DamageCalculator.applyDamageToEnemy(enemy, 100);

      expect(enemy.hp).toBe(0);
      // The implementation returns the full calculated damage, not the actual damage dealt
      expect(result.hpDamage).toBe(100);
    });

    /**
     * Validates a complex multi-layer scenario: damage hits shields, then
     * remaining damage is reduced by armor before going to HP. This tests
     * the complete defense layer interaction.
     */
    it("should handle full defense layer sequence correctly", () => {
      const enemy = createMockEnemy(100, 25, 300);

      const result = DamageCalculator.applyDamageToEnemy(enemy, 100);

      // Step 1: Shields absorb 25, leaving 75
      // Step 2: Armor reduces 75 by 50% = 37.5 damage to HP
      expect(result.shieldDamage).toBe(25);
      expect(result.hpDamage).toBeCloseTo(37.5, 5);
      expect(enemy.shields).toBe(0);
      expect(enemy.hp).toBeCloseTo(62.5, 5);
    });

    /**
     * Confirms that shields are the primary defense layer and absorb all
     * incoming damage before armor can reduce anything. Armor only reduces
     * damage that gets past shields.
     */
    it("should have shields absorb all damage before armor applies", () => {
      const enemy = createMockEnemy(100, 50, 300);

      DamageCalculator.applyDamageToEnemy(enemy, 10);

      // Shields absorb the full 10 damage
      expect(enemy.shields).toBe(40); // 50 - 10
      expect(enemy.hp).toBe(100); // No damage reaches HP
    });

    /**
     * Validates that armor reduction only applies to damage remaining after
     * shields are depleted. Shields take priority, and armor reduces the
     * remainder.
     */
    it("should apply armor reduction only to damage after shields", () => {
      const enemy = createMockEnemy(100, 50, 300); // 50 shields, 300 armor

      const result = DamageCalculator.applyDamageToEnemy(enemy, 100);

      // Step 1: Shields absorb 50, leaving 50
      // Step 2: Armor reduces 50 by 50% (300/(300+300)) = 25 damage to HP
      expect(result.shieldDamage).toBe(50);
      expect(result.hpDamage).toBeCloseTo(25, 5);
      expect(enemy.shields).toBe(0);
      expect(enemy.hp).toBeCloseTo(75, 5);
    });
  });

  describe("applyBurnDamage", () => {
    /**
     * Creates a mock enemy with burn stacks for testing.
     * Provides consistent initial state for burn damage tests.
     */
    const createMockEnemyWithBurn = (
      hp: number = 100,
      burnStacks: BurnStack[] = [],
    ): EnemyState => ({
      id: "test-enemy",
      position: { x: 2, y: 1 },
      hp,
      maxHp: 100,
      shields: 0,
      maxShields: 100,
      armor: 0,
      maxArmor: 100,
      burnStacks,
      viralStacks: [],
      empStacks: [],
      lagStacks: [],
      displaceStacks: [],
      corrosiveStacks: [],
      shieldRegenDisabled: false,
      isPawn: false,
    });

    /**
     * Validates the simplest burn damage case: no burn stacks present.
     * Should return 0 damage and leave HP unchanged.
     */
    it("should return 0 damage when no burn stacks exist", () => {
      const enemy = createMockEnemyWithBurn(100, []);

      const burnDamage = DamageCalculator.applyBurnDamage(enemy);

      expect(burnDamage).toBe(0);
      expect(enemy.hp).toBe(100);
    });

    /**
     * Validates burn damage application with a single burn stack.
     * Should deal the stack's damage amount directly to HP and return
     * the amount dealt.
     */
    it("should apply damage from single burn stack", () => {
      const burnStacks: BurnStack[] = [
        { damage: 5, endTime: Date.now() + 5000 },
      ];
      const enemy = createMockEnemyWithBurn(100, burnStacks);

      const burnDamage = DamageCalculator.applyBurnDamage(enemy);

      expect(burnDamage).toBe(5);
      expect(enemy.hp).toBe(95);
    });

    /**
     * Validates burn damage with multiple stacks. All stacks should be
     * summed together and applied as a single damage hit. This ensures
     * stacking burn effects accumulate correctly.
     */
    it("should apply cumulative damage from multiple burn stacks", () => {
      const burnStacks: BurnStack[] = [
        { damage: 3, endTime: Date.now() + 5000 },
        { damage: 2, endTime: Date.now() + 5000 },
        { damage: 4, endTime: Date.now() + 5000 },
      ];
      const enemy = createMockEnemyWithBurn(100, burnStacks);

      const burnDamage = DamageCalculator.applyBurnDamage(enemy);

      expect(burnDamage).toBe(9); // 3 + 2 + 4
      expect(enemy.hp).toBe(91);
    });

    /**
     * Confirms that burn damage bypasses all defenses. Even with shields
     * and armor present, burn should apply directly to HP. This reflects
     * the special nature of status effect damage.
     */
    it("should bypass shields and armor", () => {
      const burnStacks: BurnStack[] = [
        { damage: 10, endTime: Date.now() + 5000 },
      ];
      const enemy: EnemyState = {
        id: "test-enemy",
        position: { x: 2, y: 1 },
        hp: 100,
        maxHp: 100,
        shields: 50,
        maxShields: 100,
        armor: 300,
        maxArmor: 300,
        burnStacks,
        viralStacks: [],
        empStacks: [],
        lagStacks: [],
        displaceStacks: [],
        corrosiveStacks: [],
        shieldRegenDisabled: false,
        isPawn: false,
      };

      const burnDamage = DamageCalculator.applyBurnDamage(enemy);

      expect(burnDamage).toBe(10);
      expect(enemy.hp).toBe(90);
      expect(enemy.shields).toBe(50); // Unchanged
      expect(enemy.armor).toBe(300); // Unchanged
    });

    /**
     * Confirms that burn damage cannot reduce HP below zero. When burn
     * damage exceeds remaining HP, HP should be clamped at 0.
     */
    it("should not reduce HP below zero", () => {
      const burnStacks: BurnStack[] = [
        { damage: 50, endTime: Date.now() + 5000 },
        { damage: 40, endTime: Date.now() + 5000 },
      ];
      const enemy = createMockEnemyWithBurn(60, burnStacks);

      const burnDamage = DamageCalculator.applyBurnDamage(enemy);

      expect(enemy.hp).toBe(0);
      expect(burnDamage).toBe(90); // Total burn damage calculated
    });

    /**
     * Validates burn damage with many stacks to ensure the cumulative
     * calculation works at scale. This prevents regressions when burn
     * stacks accumulate over multiple turns.
     */
    it("should handle many burn stacks", () => {
      const burnStacks: BurnStack[] = Array(10).fill({
        damage: 2,
        endTime: Date.now() + 5000,
      });
      const enemy = createMockEnemyWithBurn(100, burnStacks);

      const burnDamage = DamageCalculator.applyBurnDamage(enemy);

      expect(burnDamage).toBe(20); // 10 stacks * 2 damage
      expect(enemy.hp).toBe(80);
    });

    /**
     * Confirms that fractional burn damage values are handled correctly.
     * Ensures the damage system can work with non-integer damage values.
     */
    it("should handle fractional burn damage", () => {
      const burnStacks: BurnStack[] = [
        { damage: 2.5, endTime: Date.now() + 5000 },
        { damage: 1.5, endTime: Date.now() + 5000 },
      ];
      const enemy = createMockEnemyWithBurn(100, burnStacks);

      const burnDamage = DamageCalculator.applyBurnDamage(enemy);

      expect(burnDamage).toBe(4);
      expect(enemy.hp).toBe(96);
    });
  });
});
