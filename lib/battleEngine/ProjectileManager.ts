import type { Projectile, Position, DamageType } from "@/types/game";
import type { EnemyState } from "@/types/game";

/**
 * Manages projectile creation, movement, and collision detection.
 *
 * Handles the lifecycle of projectiles from creation through movement
 * updates and collision checks. Keeps projectile logic separate from
 * damage calculations and status effects.
 *
 * @example
 * const manager = new ProjectileManager();
 * const proj = manager.createProjectile(pos, 'right', 100, 'kinetic', 0.2);
 */
export class ProjectileManager {
  /**
   * Counter for unique projectile IDs.
   * Incremented each time a new projectile is created.
   *
   * @private
   */
  private projectileIdCounter = 0;

  /**
   * Base movement speed for all projectiles per frame.
   * Adjusted by deltaTime to ensure frame-rate-independent movement.
   *
   * @private
   */
  private static readonly PROJECTILE_SPEED = 0.08;

  /**
   * Creates a new projectile with the given properties.
   *
   * Projectiles are the primary mechanic for dealing damage and applying
   * status effects. Each projectile carries damage type, damage value,
   * and status chance information.
   *
   * @param {Position} fromPos - The starting position of the projectile
   * @param {"left" | "right"} direction - The direction the projectile travels
   * @param {number} damage - Base damage this projectile deals on impact
   * @param {string} damageType - Type of damage (e.g., 'energy', 'thermal')
   * @param {number} [statusChance=0] - Probability (0-1) of applying a status effect
   * @returns {Projectile} A new projectile object ready to move
   *
   * @example
   * const proj = manager.createProjectile(
   *   { x: 1, y: 1 },
   *   'right',
   *   100,
   *   'thermal',
   *   0.2
   * );
   */
  createProjectile(
    fromPos: Position,
    direction: "left" | "right",
    damage: number,
    damageType: DamageType,
    statusChance: number = 0,
  ): Projectile {
    return {
      id: `proj-${this.projectileIdCounter++}`,
      position: { ...fromPos },
      direction,
      damage,
      damageType,
      statusChance,
    };
  }

  /**
   * Updates all projectile positions based on elapsed time.
   *
   * Moves projectiles in their specified direction at a constant speed.
   * Automatically removes projectiles that have traveled off the grid.
   * Uses deltaTime to ensure frame-rate-independent movement.
   *
   * @param {Projectile[]} projectiles - Array of projectiles to update
   * @param {number} deltaTime - Time elapsed since last frame (milliseconds)
   * @returns {Projectile[]} Updated projectile array with out-of-bounds projectiles removed
   *
   * @example
   * const updated = manager.updateProjectiles(projectiles, 16); // ~60fps
   */
  updateProjectiles(
    projectiles: Projectile[],
    deltaTime: number,
  ): Projectile[] {
    const speed = ProjectileManager.PROJECTILE_SPEED * (deltaTime / 16);

    return projectiles
      .map((proj) => ({
        ...proj,
        position: {
          ...proj.position,
          x:
            proj.direction === "right"
              ? proj.position.x + speed
              : proj.position.x - speed,
        },
      }))
      .filter((proj) => proj.position.x >= 0 && proj.position.x <= 5);
  }

  /**
   * Checks which projectiles have collided with targets.
   *
   * Performs collision detection between all projectiles and both the player
   * and all enemies. A projectile hits if it's within 0.6 units of the target
   * and on the same row (Y coordinate).
   *
   * @param {Projectile[]} projectiles - Array of projectiles to check
   * @param {Position} playerPos - Current position of the player
   * @param {EnemyState[]} enemies - Array of all active enemies
   * @returns {object} Object with `hits` array and `remaining` projectiles array
   *
   * @example
   * const { hits, remaining } = manager.checkCollisions(
   *   projectiles,
   *   playerPos,
   *   enemies
   * );
   * projectiles = remaining;
   * hits.forEach(({ projectile, target }) => {
   *   if (target === 'player') applyDamageToPlayer(projectile);
   *   else applyDamageToEnemy(projectile, target);
   * });
   */
  checkCollisions(
    projectiles: Projectile[],
    playerPos: Position,
    enemies: EnemyState[],
  ): {
    hits: { projectile: Projectile; target: "player" | EnemyState }[];
    remaining: Projectile[];
  } {
    const hits: { projectile: Projectile; target: "player" | EnemyState }[] =
      [];
    const remaining: Projectile[] = [];

    for (const proj of projectiles) {
      let hit = false;

      // Check player collision (projectiles traveling left hit player)
      if (
        proj.direction === "left" &&
        Math.abs(proj.position.x - playerPos.x) < 0.6 &&
        proj.position.y === playerPos.y
      ) {
        hits.push({ projectile: proj, target: "player" });
        hit = true;
      }

      // Check enemy collisions (projectiles traveling right hit enemies)
      if (!hit) {
        for (const enemy of enemies) {
          if (
            proj.direction === "right" &&
            Math.abs(proj.position.x - enemy.position.x) < 0.6 &&
            proj.position.y === enemy.position.y
          ) {
            hits.push({ projectile: proj, target: enemy });
            hit = true;
            break;
          }
        }
      }

      if (!hit) {
        remaining.push(proj);
      }
    }

    return { hits, remaining };
  }
}
