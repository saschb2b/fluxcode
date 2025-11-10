import type {
  Position,
  Projectile,
  TriggerActionPair,
  BattleContext,
  ActionResult,
  DamageType,
} from "@/types/game";

interface BurnStack {
  damage: number;
  endTime: number;
}

interface ViralStack {
  endTime: number;
}

interface EMPStack {
  endTime: number;
  shieldDrainPercent: number;
}

export interface BattleState {
  playerPos: Position;
  playerHP: number;
  enemyPos: Position;
  enemyHP: number;
  enemyShields: number;
  enemyArmor: number;
  projectiles: Projectile[];
  justTookDamage: boolean;
  enemyBurnStacks: BurnStack[];
  enemyViralStacks: ViralStack[];
  enemyEMPStacks: EMPStack[];
  shieldRegenDisabled: boolean;
}

export interface BattleHistoryPoint {
  time: number;
  playerHP: number;
  enemyHP: number;
}

export interface BattleUpdate {
  playerPos?: Position;
  playerHP?: number;
  enemyPos?: Position;
  enemyHP?: number;
  enemyShields?: number;
  enemyArmor?: number;
  projectiles?: Projectile[];
  justTookDamage?: boolean;
  battleOver?: boolean;
  playerWon?: boolean;
  battleHistory?: BattleHistoryPoint[];
  damageDealt?: { type: string; amount: number };
  pairExecuted?: { triggerId: string; actionId: string };
  burnStacks?: number;
  viralStacks?: number;
  empStacks?: number;
}

export class BattleEngine {
  private state: BattleState;
  private playerPairs: TriggerActionPair[];
  private enemyPairs: TriggerActionPair[];
  private actionCooldowns: Map<string, number> = new Map();
  private projectileIdCounter = 0;
  private battleHistory: BattleHistoryPoint[] = [];
  private battleTime = 0;
  private lastHistoryRecord = 0;
  private playerCustomization: any;
  private enemyCustomization: any;
  private lastBurnTick = 0;

  constructor(
    initialState: BattleState,
    playerPairs: TriggerActionPair[],
    enemyPairs: TriggerActionPair[],
    playerCustomization?: any,
    enemyCustomization?: any,
  ) {
    this.state = {
      ...initialState,
      enemyBurnStacks: initialState.enemyBurnStacks || [],
      enemyViralStacks: initialState.enemyViralStacks || [],
      enemyEMPStacks: initialState.enemyEMPStacks || [],
      shieldRegenDisabled: initialState.shieldRegenDisabled || false,
    };
    this.playerPairs = [...playerPairs].sort((a, b) => b.priority - a.priority);
    this.enemyPairs = [...enemyPairs].sort((a, b) => b.priority - a.priority);
    this.playerCustomization = playerCustomization;
    this.enemyCustomization = enemyCustomization;
    this.battleHistory.push({
      time: 0,
      playerHP: initialState.playerHP,
      enemyHP: initialState.enemyHP,
    });
  }

  // Main battle tick - called every frame
  tick(deltaTime: number): BattleUpdate {
    const update: BattleUpdate = {};

    this.battleTime += deltaTime;
    if (this.battleTime - this.lastHistoryRecord >= 500) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: this.state.playerHP,
        enemyHP: this.state.enemyHP,
      });
      this.lastHistoryRecord = this.battleTime;
    }

    if (this.battleTime - this.lastBurnTick >= 500) {
      this.lastBurnTick = this.battleTime;
      const burnDamage = this.processBurnDamage();
      if (burnDamage > 0) {
        update.enemyHP = this.state.enemyHP;
        update.burnStacks = this.state.enemyBurnStacks.length;
      }
    }

    this.state.enemyBurnStacks = this.state.enemyBurnStacks.filter(
      (stack) => stack.endTime > this.battleTime,
    );
    this.state.enemyViralStacks = this.state.enemyViralStacks.filter(
      (stack) => stack.endTime > this.battleTime,
    );
    this.state.enemyEMPStacks = this.state.enemyEMPStacks.filter(
      (stack) => stack.endTime > this.battleTime,
    );

    this.state.shieldRegenDisabled = this.state.enemyEMPStacks.length > 0;

    update.burnStacks = this.state.enemyBurnStacks.length;
    update.viralStacks = this.state.enemyViralStacks.length;
    update.empStacks = this.state.enemyEMPStacks.length;

    const newProjectiles = this.updateProjectiles(deltaTime);
    update.projectiles = newProjectiles;
    this.state.projectiles = newProjectiles;

    const hitUpdate = this.checkProjectileHits();
    if (hitUpdate.playerHP !== undefined) {
      update.playerHP = hitUpdate.playerHP;
      this.state.playerHP = hitUpdate.playerHP;
      update.justTookDamage = true;
      this.state.justTookDamage = true;
    }
    if (hitUpdate.enemyHP !== undefined) {
      update.enemyHP = hitUpdate.enemyHP;
      this.state.enemyHP = hitUpdate.enemyHP;
    }
    if (hitUpdate.enemyShields !== undefined) {
      update.enemyShields = hitUpdate.enemyShields;
      this.state.enemyShields = hitUpdate.enemyShields;
    }
    if (hitUpdate.enemyArmor !== undefined) {
      update.enemyArmor = hitUpdate.enemyArmor;
      this.state.enemyArmor = hitUpdate.enemyArmor;
    }
    if (hitUpdate.damageDealt !== undefined) {
      update.damageDealt = hitUpdate.damageDealt;
    }
    if (hitUpdate.burnStacks !== undefined) {
      update.burnStacks = hitUpdate.burnStacks;
    }
    if (hitUpdate.viralStacks !== undefined) {
      update.viralStacks = hitUpdate.viralStacks;
    }
    if (hitUpdate.empStacks !== undefined) {
      update.empStacks = hitUpdate.empStacks;
    }

    if (this.state.playerHP <= 0) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: 0,
        enemyHP: this.state.enemyHP,
      });
      update.battleOver = true;
      update.playerWon = false;
      update.battleHistory = this.battleHistory;
      return update;
    }
    if (this.state.enemyHP <= 0) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: this.state.playerHP,
        enemyHP: 0,
      });
      update.battleOver = true;
      update.playerWon = true;
      update.battleHistory = this.battleHistory;
      return update;
    }

    const playerAction = this.executeAI(this.playerPairs, true, deltaTime);
    if (playerAction) {
      const actionUpdate = this.applyAction(playerAction, true);
      Object.assign(update, actionUpdate);
      update.pairExecuted = {
        triggerId: playerAction.triggerId,
        actionId: playerAction.actionId,
      };
    }

    const enemyAction = this.executeAI(this.enemyPairs, false, deltaTime);
    if (enemyAction) {
      const actionUpdate = this.applyAction(enemyAction, false);
      Object.assign(update, actionUpdate);
      update.pairExecuted = {
        triggerId: enemyAction.triggerId,
        actionId: enemyAction.actionId,
      };
    }

    if (this.state.justTookDamage) {
      this.state.justTookDamage = false;
      update.justTookDamage = false;
    }

    return update;
  }

  private processBurnDamage(): number {
    if (this.state.enemyBurnStacks.length === 0) return 0;

    let totalDamage = 0;
    this.state.enemyBurnStacks.forEach((stack) => {
      totalDamage += stack.damage;
    });

    // Burn damage bypasses shields and armor, goes directly to HP
    this.state.enemyHP = Math.max(0, this.state.enemyHP - totalDamage);

    return totalDamage;
  }

  private executeAI(
    pairs: TriggerActionPair[],
    isPlayer: boolean,
    deltaTime: number,
  ): ActionResult | null {
    const context: BattleContext = {
      playerPos: this.state.playerPos,
      enemyPos: this.state.enemyPos,
      playerHP: this.state.playerHP,
      enemyHP: this.state.enemyHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer,
    };

    this.actionCooldowns.forEach((time, key) => {
      const newTime = time - deltaTime;
      if (newTime <= 0) {
        this.actionCooldowns.delete(key);
      } else {
        this.actionCooldowns.set(key, newTime);
      }
    });

    for (const pair of pairs) {
      const cooldownKey = `${isPlayer ? "player" : "enemy"}-${pair.action.id}`;

      if (this.actionCooldowns.has(cooldownKey)) {
        continue;
      }

      if (pair.trigger.check(context)) {
        this.actionCooldowns.set(cooldownKey, pair.action.cooldown);
        return {
          ...pair.action.execute(context),
          triggerId: pair.trigger.id,
          actionId: pair.action.id,
        };
      }
    }

    return null;
  }

  private applyAction(action: ActionResult, isPlayer: boolean): BattleUpdate {
    const update: BattleUpdate = {};

    switch (action.type) {
      case "shoot":
        const baseDamage = action.damage || 10;
        const projectile = this.createProjectile(
          isPlayer,
          baseDamage,
          action.damageType,
          action.statusChance,
        );
        this.state.projectiles.push(projectile);
        update.projectiles = [...this.state.projectiles];
        break;

      case "rapid-fire":
        const count = action.count || 3;
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const proj = this.createProjectile(isPlayer, action.damage || 5);
            this.state.projectiles.push(proj);
          }, i * 200);
        }
        break;

      case "move":
        if (action.position) {
          if (isPlayer) {
            this.state.playerPos = action.position;
            update.playerPos = action.position;
          } else {
            this.state.enemyPos = action.position;
            update.enemyPos = action.position;
          }
        }
        break;

      case "heal":
        if (isPlayer) {
          const newHP = Math.min(
            this.state.playerHP + (action.amount || 20),
            100,
          );
          this.state.playerHP = newHP;
          update.playerHP = newHP;
        } else {
          const newHP = Math.min(
            this.state.enemyHP + (action.amount || 20),
            100,
          );
          this.state.enemyHP = newHP;
          update.enemyHP = newHP;
        }
        break;
    }

    return update;
  }

  private createProjectile(
    isPlayer: boolean,
    damage: number,
    damageType?: DamageType,
    statusChance?: number,
  ): Projectile {
    let adjustedDamage = damage;

    if (!isPlayer) {
      const damageScale = Math.min(1.0, 0.6 + (this.battleTime / 60000) * 0.1);
      adjustedDamage = Math.floor(damage * damageScale);
    }

    const pos = isPlayer ? this.state.playerPos : this.state.enemyPos;
    return {
      id: `proj-${this.projectileIdCounter++}`,
      position: { ...pos },
      direction: isPlayer ? "right" : "left",
      damage: adjustedDamage,
      damageType: damageType || "kinetic",
      statusChance: statusChance || 0,
    };
  }

  private updateProjectiles(deltaTime: number): Projectile[] {
    const speed = 0.08 * (deltaTime / 16);

    return this.state.projectiles
      .map((proj) => {
        const newX =
          proj.direction === "right"
            ? proj.position.x + speed
            : proj.position.x - speed;
        return {
          ...proj,
          position: { ...proj.position, x: newX },
        };
      })
      .filter((proj) => proj.position.x >= 0 && proj.position.x <= 5);
  }

  private checkProjectileHits(): {
    playerHP?: number;
    enemyHP?: number;
    enemyShields?: number;
    enemyArmor?: number;
    damageDealt?: { type: string; amount: number };
    burnStacks?: number;
    viralStacks?: number;
    empStacks?: number;
  } {
    const update: {
      playerHP?: number;
      enemyHP?: number;
      enemyShields?: number;
      enemyArmor?: number;
      damageDealt?: { type: string; amount: number };
      burnStacks?: number;
      viralStacks?: number;
      empStacks?: number;
    } = {};
    const remainingProjectiles: Projectile[] = [];

    for (const proj of this.state.projectiles) {
      let hit = false;

      if (
        proj.direction === "left" &&
        Math.abs(proj.position.x - this.state.playerPos.x) < 0.6 &&
        proj.position.y === this.state.playerPos.y
      ) {
        this.state.playerHP = Math.max(0, this.state.playerHP - proj.damage);
        update.playerHP = this.state.playerHP;
        hit = true;
      }

      if (
        proj.direction === "right" &&
        Math.abs(proj.position.x - this.state.enemyPos.x) < 0.6 &&
        proj.position.y === this.state.enemyPos.y
      ) {
        if (
          proj.damageType === "corrosive" &&
          proj.statusChance &&
          Math.random() < proj.statusChance
        ) {
          const armorStrip = Math.max(
            1,
            Math.floor(this.state.enemyArmor * 0.1),
          );
          if (this.state.enemyArmor > 0) {
            this.state.enemyArmor = Math.max(
              0,
              this.state.enemyArmor - armorStrip,
            );
            update.enemyArmor = this.state.enemyArmor;
          }
        }

        if (
          proj.damageType === "thermal" &&
          proj.statusChance &&
          Math.random() < proj.statusChance
        ) {
          const MAX_BURN_STACKS = 5;
          const BURN_DURATION = 4000;
          const BURN_DAMAGE_PER_TICK = 2;

          if (this.state.enemyBurnStacks.length < MAX_BURN_STACKS) {
            this.state.enemyBurnStacks.push({
              damage: BURN_DAMAGE_PER_TICK,
              endTime: this.battleTime + BURN_DURATION,
            });
            update.burnStacks = this.state.enemyBurnStacks.length;
          }
        }

        if (
          proj.damageType === "viral" &&
          proj.statusChance &&
          Math.random() < proj.statusChance
        ) {
          const MAX_VIRAL_STACKS = 5;
          const VIRAL_DURATION = 10000;

          if (this.state.enemyViralStacks.length < MAX_VIRAL_STACKS) {
            this.state.enemyViralStacks.push({
              endTime: this.battleTime + VIRAL_DURATION,
            });
            update.viralStacks = this.state.enemyViralStacks.length;
          }
        }

        if (
          proj.damageType === "energy" &&
          proj.statusChance &&
          Math.random() < proj.statusChance
        ) {
          const MAX_EMP_STACKS = 5;
          const EMP_DURATION = 5000; // 5 seconds
          const SHIELD_DRAIN_PERCENT = 0.08; // 8% of current shields per proc

          if (this.state.enemyEMPStacks.length < MAX_EMP_STACKS) {
            // Instant shield drain
            if (this.state.enemyShields > 0) {
              const shieldDrain = Math.floor(
                this.state.enemyShields * SHIELD_DRAIN_PERCENT,
              );
              this.state.enemyShields = Math.max(
                0,
                this.state.enemyShields - shieldDrain,
              );
              update.enemyShields = this.state.enemyShields;
            }

            this.state.enemyEMPStacks.push({
              endTime: this.battleTime + EMP_DURATION,
              shieldDrainPercent: SHIELD_DRAIN_PERCENT,
            });
            update.empStacks = this.state.enemyEMPStacks.length;
          }
        }

        let damage = proj.damage;

        if (proj.damageType === "energy") {
          if (this.state.enemyShields > 0) {
            // Energy damage gets +100% bonus against shields
            damage = damage * 2.0;
          } else if (this.state.enemyArmor > 0) {
            // Energy damage gets -50% penalty against armor
            damage = damage * 0.5;
          }
        }

        if (this.state.enemyArmor > 0) {
          const armorReduction =
            this.state.enemyArmor / (this.state.enemyArmor + 300);
          damage = damage * (1 - armorReduction);
        }

        let totalDamageDealt = 0;
        let remainingDamage = damage;

        if (this.state.enemyShields > 0) {
          const shieldDamage = Math.min(
            this.state.enemyShields,
            remainingDamage,
          );
          this.state.enemyShields = Math.max(
            0,
            this.state.enemyShields - shieldDamage,
          );
          totalDamageDealt += shieldDamage;
          remainingDamage -= shieldDamage;
          update.enemyShields = this.state.enemyShields;
        }

        if (remainingDamage > 0) {
          const viralMultiplier = this.getViralDamageMultiplier();
          const amplifiedDamage = remainingDamage * viralMultiplier;

          this.state.enemyHP = Math.max(
            0,
            this.state.enemyHP - amplifiedDamage,
          );
          totalDamageDealt += amplifiedDamage;
          update.enemyHP = this.state.enemyHP;
        }

        update.damageDealt = {
          type: proj.damageType || "kinetic",
          amount: Math.round(totalDamageDealt * 10) / 10,
        };
        hit = true;
      }

      if (!hit) {
        remainingProjectiles.push(proj);
      }
    }

    this.state.projectiles = remainingProjectiles;
    return update;
  }

  private getViralDamageMultiplier(): number {
    const stackCount = this.state.enemyViralStacks.length;
    if (stackCount === 0) return 1.0;

    const amplificationMap = [1.0, 1.2, 1.35, 1.5, 1.75, 2.0];
    return amplificationMap[Math.min(stackCount, 5)];
  }

  getState(): BattleState {
    return { ...this.state };
  }
}
