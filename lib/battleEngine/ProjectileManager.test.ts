import { ProjectileManager } from "./ProjectileManager";
import { type Position, type EnemyState, DamageType } from "@/types/game";

describe("ProjectileManager", () => {
  let manager: ProjectileManager;

  beforeEach(() => {
    manager = new ProjectileManager();
  });

  describe("createProjectile", () => {
    /**
     * Verifies that each new projectile receives a unique identifier
     * that increments sequentially. This is critical for tracking
     * projectiles through their lifecycle and identifying them in
     * collision results.
     */
    it("should create a projectile with unique ID", () => {
      const pos: Position = { x: 2, y: 1 };
      const proj1 = manager.createProjectile(
        pos,
        "right",
        50,
        DamageType.KINETIC,
      );
      const proj2 = manager.createProjectile(
        pos,
        "right",
        50,
        DamageType.KINETIC,
      );

      expect(proj1.id).toBe("proj-0");
      expect(proj2.id).toBe("proj-1");
      expect(proj1.id).not.toBe(proj2.id);
    });

    /**
     * Ensures that the projectile receives a copy of the position object,
     * not a reference to the original. This prevents external mutations
     * from affecting the projectile's stored position and maintains
     * data integrity.
     */
    it("should copy position to prevent mutation", () => {
      const pos: Position = { x: 2, y: 1 };
      const proj = manager.createProjectile(
        pos,
        "right",
        50,
        DamageType.KINETIC,
      );

      pos.x = 5;
      expect(proj.position.x).toBe(2);
    });

    /**
     * Verifies that statusChance defaults to 0 when not explicitly provided.
     * This ensures projectiles created without a status effect chance
     * don't accidentally apply unintended effects.
     */
    it("should set default statusChance to 0", () => {
      const proj = manager.createProjectile(
        { x: 2, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      expect(proj.statusChance).toBe(0);
    });

    /**
     * Validates that all input parameters are correctly stored in the
     * resulting projectile object. This is a regression test ensuring
     * that the factory method doesn't drop or mismap any properties.
     */
    it("should store all projectile properties correctly", () => {
      const proj = manager.createProjectile(
        { x: 2, y: 1 },
        "left",
        100,
        DamageType.THERMAL,
        0.3,
      );

      expect(proj).toEqual({
        id: "proj-0",
        position: { x: 2, y: 1 },
        direction: "left",
        damage: 100,
        damageType: "thermal",
        statusChance: 0.3,
      });
    });
  });

  describe("updateProjectiles", () => {
    /**
     * Confirms that projectiles moving right have their X coordinate
     * incremented during updates. This validates the core movement
     * mechanics for player-fired projectiles targeting enemies.
     */
    it("should move projectiles right when direction is right", () => {
      const proj = manager.createProjectile(
        { x: 2, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const updated = manager.updateProjectiles([proj], 16);

      expect(updated[0].position.x).toBeGreaterThan(proj.position.x);
      expect(updated[0].position.y).toBe(proj.position.y);
    });

    /**
     * Confirms that projectiles moving left have their X coordinate
     * decremented during updates. This validates the core movement
     * mechanics for enemy-fired projectiles targeting the player.
     */
    it("should move projectiles left when direction is left", () => {
      const proj = manager.createProjectile(
        { x: 2, y: 1 },
        "left",
        50,
        DamageType.KINETIC,
      );
      const updated = manager.updateProjectiles([proj], 16);

      expect(updated[0].position.x).toBeLessThan(proj.position.x);
      expect(updated[0].position.y).toBe(proj.position.y);
    });

    /**
     * Verifies that movement is frame-rate-independent by ensuring
     * that doubling deltaTime results in approximately double the
     * distance traveled. This prevents frame-rate-dependent physics
     * inconsistencies where slow machines would see slower projectiles.
     */
    it("should adjust speed based on deltaTime", () => {
      const proj1 = manager.createProjectile(
        { x: 2, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const proj2 = manager.createProjectile(
        { x: 2, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );

      const updated1 = manager.updateProjectiles([proj1], 16);
      const updated2 = manager.updateProjectiles([proj2], 32);

      const delta1 = updated1[0].position.x - proj1.position.x;
      const delta2 = updated2[0].position.x - proj2.position.x;

      expect(delta2).toBeCloseTo(delta1 * 2, 5);
    });

    /**
     * Ensures that projectiles traveling beyond grid boundaries (less than 0
     * or greater than 5 on the X axis) are automatically removed. This prevents
     * memory leaks from projectiles that can never hit anything and keeps the
     * projectile array clean.
     */
    it("should remove projectiles outside grid bounds", () => {
      const projLeft = manager.createProjectile(
        { x: 0.01, y: 1 },
        "left",
        50,
        DamageType.KINETIC,
      );
      const projRight = manager.createProjectile(
        { x: 4.99, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const projMiddle = manager.createProjectile(
        { x: 2.5, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );

      const updated = manager.updateProjectiles(
        [projLeft, projRight, projMiddle],
        16,
      );

      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe(projMiddle.id);
    });

    /**
     * Validates that projectiles remain within the valid grid range (0-5)
     * after movement. This test confirms the boundary filtering logic
     * works correctly for a projectile that should survive the update.
     */
    it("should keep projectiles within valid bounds (0-5)", () => {
      const proj = manager.createProjectile(
        { x: 0.1, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const updated = manager.updateProjectiles([proj], 16);

      expect(updated[0].position.x).toBeGreaterThanOrEqual(0);
      expect(updated[0].position.x).toBeLessThanOrEqual(5);
    });
  });

  describe("checkCollisions", () => {
    /**
     * Validates the primary collision case: a left-moving projectile from
     * an enemy colliding with the player. This is the most common hostile
     * interaction and must be detected accurately to maintain game balance.
     * The projectile should be removed from the active list after collision.
     */
    it("should detect collision between left projectile and player", () => {
      const proj = manager.createProjectile(
        { x: 2.3, y: 1 },
        "left",
        50,
        DamageType.KINETIC,
      );
      const playerPos: Position = { x: 2, y: 1 };
      const enemies: EnemyState[] = [];

      const { hits, remaining } = manager.checkCollisions(
        [proj],
        playerPos,
        enemies,
      );

      expect(hits).toHaveLength(1);
      expect(hits[0].target).toBe("player");
      expect(remaining).toHaveLength(0);
    });

    /**
     * Validates the primary collision case: a right-moving projectile from
     * the player colliding with an enemy. This is the core offensive mechanic
     * and must be detected accurately. The projectile should be removed and
     * the correct enemy target should be identified.
     */
    it("should detect collision between right projectile and enemy", () => {
      const proj = manager.createProjectile(
        { x: 2.3, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const playerPos: Position = { x: 0, y: 1 };
      const enemy: EnemyState = {
        id: "enemy-1",
        position: { x: 2, y: 1 },
        hp: 100,
        maxHp: 100,
        shields: 0,
        maxShields: 0,
        armor: 0,
        maxArmor: 0,
        burnStacks: [],
        viralStacks: [],
        empStacks: [],
        lagStacks: [],
        displaceStacks: [],
        corrosiveStacks: [],
        shieldRegenDisabled: false,
        isPawn: false,
      };

      const { hits, remaining } = manager.checkCollisions([proj], playerPos, [
        enemy,
      ]);

      expect(hits).toHaveLength(1);
      expect(hits[0].target).toBe(enemy);
      expect(remaining).toHaveLength(0);
    });

    /**
     * Ensures that projectiles only collide with targets on the same row.
     * This validates the Y-coordinate matching requirement, preventing false
     * positives where a projectile passing near but above/below a target
     * would incorrectly register as a hit.
     */
    it("should not collide if Y coordinates differ", () => {
      const proj = manager.createProjectile(
        { x: 2.3, y: 1 },
        "left",
        50,
        DamageType.KINETIC,
      );
      const playerPos: Position = { x: 2, y: 2 };

      const { hits, remaining } = manager.checkCollisions(
        [proj],
        playerPos,
        [],
      );

      expect(hits).toHaveLength(0);
      expect(remaining).toHaveLength(1);
    });

    /**
     * Validates the collision distance threshold (0.6 units). Projectiles
     * beyond this range should not collide even if on the same row. This
     * ensures a reasonable hit detection radius and prevents collisions
     * that feel unfair to the player.
     */
    it("should not collide if distance exceeds 0.6 threshold", () => {
      const proj = manager.createProjectile(
        { x: 2.7, y: 1 },
        "left",
        50,
        DamageType.KINETIC,
      );
      const playerPos: Position = { x: 2, y: 1 };

      const { hits, remaining } = manager.checkCollisions(
        [proj],
        playerPos,
        [],
      );

      expect(hits).toHaveLength(0);
      expect(remaining).toHaveLength(1);
    });

    /**
     * Ensures that direction matters for collision detection. A right-moving
     * projectile should never hit the player (who is on the left). This
     * prevents nonsensical scenarios where player projectiles would collide
     * with the player, or enemy projectiles would collide with enemies.
     */
    it("should not collide if direction is wrong", () => {
      const proj = manager.createProjectile(
        { x: 2.3, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const playerPos: Position = { x: 2, y: 1 };

      const { hits, remaining } = manager.checkCollisions(
        [proj],
        playerPos,
        [],
      );

      expect(hits).toHaveLength(0);
      expect(remaining).toHaveLength(1);
    });

    /**
     * Tests complex scenarios with multiple projectiles and targets.
     * Validates that the collision system correctly:
     * - Identifies which projectiles hit and which don't
     * - Routes hits to the correct targets (player vs. specific enemies)
     * - Maintains non-colliding projectiles for future updates
     * This prevents regressions when collision logic becomes more complex.
     */
    it("should handle multiple projectiles and collisions", () => {
      const proj1 = manager.createProjectile(
        { x: 2.3, y: 1 },
        "left",
        50,
        DamageType.KINETIC,
      );
      const proj2 = manager.createProjectile(
        { x: 3.2, y: 2 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const proj3 = manager.createProjectile(
        { x: 1.5, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );

      const playerPos: Position = { x: 2, y: 1 };
      const enemy: EnemyState = {
        id: "enemy-1",
        position: { x: 3, y: 2 },
        hp: 100,
        maxHp: 100,
        shields: 0,
        maxShields: 0,
        armor: 0,
        maxArmor: 0,
        burnStacks: [],
        viralStacks: [],
        empStacks: [],
        lagStacks: [],
        displaceStacks: [],
        corrosiveStacks: [],
        shieldRegenDisabled: false,
        isPawn: false,
      };

      const { hits, remaining } = manager.checkCollisions(
        [proj1, proj2, proj3],
        playerPos,
        [enemy],
      );

      expect(hits).toHaveLength(2);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(proj3.id);
    });

    /**
     * Ensures that a single projectile only registers one collision, even if
     * multiple targets are within range. This prevents a projectile from
     * hitting multiple enemies in a single frame, which could lead to
     * unexpected damage stacking and unfair gameplay.
     */
    it("should stop checking after first collision per projectile", () => {
      const proj = manager.createProjectile(
        { x: 2.3, y: 1 },
        "right",
        50,
        DamageType.KINETIC,
      );
      const playerPos: Position = { x: 2, y: 1 };
      const enemy1: EnemyState = {
        id: "enemy-1",
        position: { x: 2.2, y: 1 },
        hp: 100,
        maxHp: 100,
        shields: 0,
        maxShields: 0,
        armor: 0,
        maxArmor: 0,
        burnStacks: [],
        viralStacks: [],
        empStacks: [],
        lagStacks: [],
        displaceStacks: [],
        corrosiveStacks: [],
        shieldRegenDisabled: false,
        isPawn: false,
      };
      const enemy2: EnemyState = {
        id: "enemy-2",
        position: { x: 2.4, y: 1 },
        hp: 100,
        maxHp: 100,
        shields: 0,
        maxShields: 0,
        armor: 0,
        maxArmor: 0,
        burnStacks: [],
        viralStacks: [],
        empStacks: [],
        lagStacks: [],
        displaceStacks: [],
        corrosiveStacks: [],
        shieldRegenDisabled: false,
        isPawn: false,
      };

      const { hits } = manager.checkCollisions([proj], playerPos, [
        enemy1,
        enemy2,
      ]);

      expect(hits).toHaveLength(1);
      expect((hits[0].target as EnemyState).id).toBe("enemy-1");
    });
  });
});
