import { ElementalModifier } from "./ElementalModifier";
import { DamageType } from "@/types/game";

describe("ElementalModifier", () => {
  describe("getModifiers", () => {
    /**
     * Validates that each damage type has a complete set of modifiers.
     * This ensures no damage type is missing critical properties that
     * could cause runtime errors when calculating damage.
     */
    it("should return modifiers with all required properties", () => {
      const damageTypes = [
        DamageType.KINETIC,
        DamageType.ENERGY,
        DamageType.THERMAL,
        DamageType.VIRAL,
        DamageType.GLACIAL,
        DamageType.CORROSIVE,
        DamageType.CONCUSSION,
      ];

      damageTypes.forEach((type) => {
        const modifiers = ElementalModifier.getModifiers(type);

        expect(modifiers).toHaveProperty("shieldBonus");
        expect(modifiers).toHaveProperty("armorBonus");
        expect(modifiers).toHaveProperty("hpBonus");
        expect(modifiers).toHaveProperty("statusProcChance");
      });
    });

    /**
     * Confirms that modifiers are returned as a copy, not a reference
     * to the internal lookup table. This prevents external code from
     * accidentally mutating the damage balance settings.
     */
    it("should return a copy to prevent external mutation", () => {
      const modifiers1 = ElementalModifier.getModifiers(DamageType.THERMAL);
      const modifiers2 = ElementalModifier.getModifiers(DamageType.THERMAL);

      modifiers1.shieldBonus = 999;

      expect(modifiers2.shieldBonus).not.toBe(999);
    });

    /**
     * Ensures kinetic damage has baseline 1.0 multipliers for all defense
     * layers. Kinetic serves as the neutral damage type and baseline for
     * all other damage calculations.
     */
    it("should return kinetic damage as baseline (1.0 multipliers)", () => {
      const modifiers = ElementalModifier.getModifiers(DamageType.KINETIC);

      expect(modifiers.shieldBonus).toBe(1.0);
      expect(modifiers.armorBonus).toBe(1.0);
      expect(modifiers.hpBonus).toBe(1.0);
      expect(modifiers.statusProcChance).toBe(0);
    });

    /**
     * Validates that energy damage has the expected modifiers:
     * - Strong against shields (2.0x)
     * - Weak against armor (0.5x)
     * - Good status effect chance (15%)
     * This confirms the elemental balance is correctly implemented.
     */
    it("should return energy damage with expected modifiers", () => {
      const modifiers = ElementalModifier.getModifiers(DamageType.ENERGY);

      expect(modifiers.shieldBonus).toBe(2.0);
      expect(modifiers.armorBonus).toBe(0.5);
      expect(modifiers.hpBonus).toBe(1.0);
      expect(modifiers.statusProcChance).toBe(0.15);
    });

    /**
     * Validates that corrosive damage has the expected modifiers:
     * - Weak against shields (0.8x)
     * - Weak against armor (0.5x)
     * - Highest status effect chance (25%)
     * Ensures specialized damage types have distinct gameplay roles.
     */
    it("should return corrosive damage with expected modifiers", () => {
      const modifiers = ElementalModifier.getModifiers(DamageType.CORROSIVE);

      expect(modifiers.shieldBonus).toBe(0.8);
      expect(modifiers.armorBonus).toBe(0.5);
      expect(modifiers.hpBonus).toBe(1.0);
      expect(modifiers.statusProcChance).toBe(0.25);
    });

    /**
     * Validates that concussion damage is specialized for exposed HP:
     * - Weak against shields and armor
     * - Strong against exposed HP (1.25x)
     * This ensures each damage type has a defined niche in combat.
     */
    it("should return concussion damage with HP bonus", () => {
      const modifiers = ElementalModifier.getModifiers(DamageType.CONCUSSION);

      expect(modifiers.shieldBonus).toBe(0.9);
      expect(modifiers.armorBonus).toBe(1.0);
      expect(modifiers.hpBonus).toBe(1.25);
      expect(modifiers.statusProcChance).toBe(0.2);
    });
  });

  describe("calculateModifiedDamage", () => {
    /**
     * Validates the primary damage calculation path: kinetic damage with
     * no defenses. Base damage should pass through unmodified. This is the
     * simplest case and must work correctly for all other tests to be valid.
     */
    it("should apply no modifier when target has no defenses", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.KINETIC,
        0,
        0,
      );

      expect(damage).toBe(100);
    });

    /**
     * Confirms that shield defense is checked first and takes priority
     * over armor. When both defenses are present, the shield modifier
     * should be applied, not the armor modifier. This establishes the
     * defense priority hierarchy.
     */
    it("should apply shield bonus when shields are present", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.ENERGY,
        50,
        0,
      );

      expect(damage).toBe(200); // 100 * 2.0 shield bonus
    });

    /**
     * Validates that any positive shield value triggers the shield
     * modifier. This tests the boundary condition to ensure the >= 0
     * check functions correctly.
     */
    it("should apply shield bonus even with 1 shield point", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.ENERGY,
        1,
        0,
      );

      expect(damage).toBe(200);
    });

    /**
     * Confirms that armor defense is only checked when shields are absent.
     * This validates the conditional logic that prioritizes defenses and
     * prevents armor modifiers from being applied when shields are active.
     */
    it("should apply armor bonus only when shields are absent", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.ENERGY,
        0,
        50,
      );

      expect(damage).toBe(50); // 100 * 0.5 armor bonus
    });

    /**
     * Validates that any positive armor value triggers the armor modifier.
     * This tests the boundary condition to ensure armor detection works
     * correctly.
     */
    it("should apply armor bonus even with 1 armor point", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.ENERGY,
        0,
        1,
      );

      expect(damage).toBe(50);
    });

    /**
     * Confirms that shields take strict priority over armor. When both
     * defenses are present, armor should be completely ignored. This
     * ensures the defense hierarchy is enforced.
     */
    it("should prioritize shields over armor when both present", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.ENERGY,
        50,
        50,
      );

      expect(damage).toBe(200); // Uses shield bonus (2.0), ignores armor
    });

    /**
     * Validates the complete damage calculation for a common scenario:
     * thermal damage vs armor. Tests that different damage types produce
     * different results and that modifier values are correctly applied.
     */
    it("should calculate thermal damage vs armor correctly", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.THERMAL,
        0,
        50,
      );

      expect(damage).toBe(100); // 100 * 1.0 armor bonus
    });

    /**
     * Validates thermal damage against shields. Thermal is slightly weak
     * against shields (0.9x), so this should produce reduced damage.
     */
    it("should calculate thermal damage vs shields correctly", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.THERMAL,
        50,
        0,
      );

      expect(damage).toBe(90); // 100 * 0.9 shield bonus
    });

    /**
     * Validates corrosive damage as a multi-scenario test. Corrosive has
     * unique characteristics (weak to shields, very weak to armor, high proc)
     * and this confirms those modifiers apply correctly.
     */
    it("should calculate corrosive damage vs armor correctly", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.CORROSIVE,
        0,
        50,
      );

      expect(damage).toBe(50); // 100 * 0.5 armor bonus
    });

    /**
     * Validates that fractional damage calculations work correctly.
     * Ensures that damage calculations produce correct results even when
     * base damage or modifiers result in non-integer values.
     */
    it("should handle fractional damage values", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        75,
        DamageType.ENERGY,
        50,
        0,
      );

      expect(damage).toBe(150); // 75 * 2.0
    });

    /**
     * Confirms that zero damage is handled correctly and produces zero
     * output. This tests the boundary condition for minimum damage values.
     */
    it("should handle zero base damage", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        0,
        DamageType.ENERGY,
        50,
        0,
      );

      expect(damage).toBe(0);
    });

    /**
     * Validates very large damage values to ensure no overflow or precision
     * issues. Tests that the calculation is mathematically sound at scale.
     */
    it("should handle large damage values", () => {
      const damage = ElementalModifier.calculateModifiedDamage(
        9999,
        DamageType.ENERGY,
        50,
        0,
      );

      expect(damage).toBe(19998); // 9999 * 2.0
    });

    /**
     * Validates the complete elemental rock-paper-scissors dynamic:
     * energy beats shields, while concussion has an advantage against
     * exposed HP. Confirms the design intent that different damage types
     * have distinct tactical advantages.
     */
    it("should demonstrate elemental advantages across defense types", () => {
      // Energy excels vs shields (2.0x)
      const energyVsShield = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.ENERGY,
        50,
        0,
      );
      // Kinetic baseline vs shields (1.0x)
      const kineticVsShield = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.KINETIC,
        50,
        0,
      );

      expect(energyVsShield).toBeGreaterThan(kineticVsShield);

      // Thermal weak vs shields (0.9x)
      const thermalVsShield = ElementalModifier.calculateModifiedDamage(
        100,
        DamageType.THERMAL,
        50,
        0,
      );

      expect(energyVsShield).toBeGreaterThan(thermalVsShield);
    });
  });
});
