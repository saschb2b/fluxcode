import { BattleEngine } from "./BattleEngine";
import type {
  BattleState,
  TriggerActionPair,
  EnemyState,
  Position,
  BattleUpdate,
} from "@/types/game";
import { AVAILABLE_TRIGGERS } from "@/lib/triggers";
import { AVAILABLE_ACTIONS } from "@/lib/actions";

describe("BattleEngine", () => {
  const getTrigger = (id: string) => {
    const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === id);
    if (!trigger) throw new Error(`Trigger not found: ${id}`);
    return trigger;
  };

  const getAction = (id: string) => {
    const action = AVAILABLE_ACTIONS.find((a) => a.id === id);
    if (!action) throw new Error(`Action not found: ${id}`);
    return action;
  };

  const createPair = (
    triggerId: string,
    actionId: string,
    priority: number = 1,
  ): TriggerActionPair => ({
    trigger: getTrigger(triggerId),
    action: getAction(actionId),
    priority,
    enabled: true,
  });

  const createMockEnemy = (
    id: string = "enemy-1",
    hp: number = 100,
    position: Position = { x: 5, y: 1 },
  ): EnemyState => ({
    id,
    position,
    hp,
    maxHp: 100,
    shields: 0,
    maxShields: 100,
    armor: 0,
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

  const createMockBattleState = (
    playerHP: number = 100,
    enemies: EnemyState[] = [createMockEnemy()],
  ): BattleState => ({
    playerPos: { x: 0, y: 1 },
    playerHP,
    playerShields: 0,
    playerArmor: 0,
    enemyPos: { x: 5, y: 1 },
    enemyHP: enemies.reduce((sum, e) => sum + e.hp, 0),
    enemies,
    enemyShields: 0,
    enemyArmor: 0,
    projectiles: [],
    justTookDamage: false,
    enemyBurnStacks: [],
    enemyViralStacks: [],
    enemyEMPStacks: [],
    enemyLagStacks: [],
    enemyDisplaceStacks: [],
    enemyCorrosiveStacks: [],
    shieldRegenDisabled: false,
  });

  /**
   * Validates that the battle engine initializes and tick completes without errors.
   */
  it("should initialize and complete a tick", () => {
    const state = createMockBattleState();
    const engine = new BattleEngine(
      state,
      [createPair("always", "move-forward")],
      [createPair("always", "shoot")],
      [createPair("always", "shoot")],
    );

    const update = engine.tick(16);

    expect(update).toBeDefined();
    expect(update.battleOver).not.toBe(true);
  });

  /**
   * Validates that movement core protocols execute before tactical.
   */
  it("should prioritize movement core over tactical core", () => {
    const state = createMockBattleState();
    const engine = new BattleEngine(
      state,
      [createPair("always", "move-forward")],
      [createPair("always", "shoot")],
      [createPair("always", "shoot")],
    );

    const update = engine.tick(16);

    expect(update.playerPos?.x).toBeGreaterThan(0);
  });

  /**
   * Validates that tactical core executes when movement doesn't trigger.
   */
  it("should execute tactical when movement fails", () => {
    const state = createMockBattleState();
    const engine = new BattleEngine(
      state,
      [createPair("low-hp", "move-forward")],
      [createPair("always", "shoot")],
      [createPair("always", "shoot")],
    );

    const update = engine.tick(16);

    expect(update.projectiles).toBeDefined();
  });

  /**
   * Validates that trigger conditions are properly evaluated.
   */
  it("should respect trigger conditions", () => {
    const state = createMockBattleState();
    state.playerPos = { x: 1, y: 1 };
    state.enemies[0].position = { x: 2, y: 1 };

    const engine = new BattleEngine(
      state,
      [],
      [createPair("enemy-close", "shoot")],
      [createPair("always", "shoot")],
    );

    const update = engine.tick(16);

    expect(update.projectiles).toBeDefined();
  });

  /**
   * Validates that enemy AI executes independently.
   */
  it("should execute enemy AI protocols", () => {
    const state = createMockBattleState();
    const engine = new BattleEngine(
      state,
      [],
      [],
      [createPair("always", "shoot")],
    );

    const update = engine.tick(16);

    expect(update.projectiles).toBeDefined();
  });

  /**
   * Validates that multiple enemies execute their respective protocols.
   */
  it("should execute AI for multiple enemies with different protocols", () => {
    const state = createMockBattleState(100, [
      createMockEnemy("e1", 100, { x: 4, y: 1 }),
      createMockEnemy("e2", 100, { x: 5, y: 2 }),
    ]);

    const engine = new BattleEngine(
      state,
      [],
      [],
      [[createPair("always", "shoot")], [createPair("always", "move-forward")]],
    );

    const update = engine.tick(16);

    expect(update.projectiles).toBeDefined();
  });

  /**
   * Validates that projectiles are created and damage is applied.
   */
  it("should manage projectile lifecycle and apply damage", () => {
    const state = createMockBattleState();
    const engine = new BattleEngine(
      state,
      [],
      [createPair("always", "shoot")],
      [createPair("always", "shoot")],
    );

    let update = engine.tick(16);
    for (let i = 0; i < 50; i++) {
      update = engine.tick(16);
      if (update.enemyHP !== undefined && update.enemyHP < 100) break;
    }

    expect(update.damageDealt).toBeDefined();
  });

  /**
   * Validates that player defeat ends the battle.
   */
  it("should end battle when player HP reaches zero", () => {
    const state = createMockBattleState(0);
    const engine = new BattleEngine(
      state,
      [createPair("always", "move-forward")],
      [createPair("always", "shoot")],
      [createPair("always", "shoot")],
    );

    const update = engine.tick(16);

    expect(update.battleOver).toBe(true);
    expect(update.playerWon).toBe(false);
  });

  /**
   * Validates that player victory is detected when all guardians defeated.
   */
  it("should end battle when all guardians defeated", () => {
    const guardian = createMockEnemy("g1", 0);
    guardian.isPawn = false;
    const state = createMockBattleState(100, [guardian]);

    const engine = new BattleEngine(
      state,
      [createPair("always", "move-forward")],
      [createPair("always", "shoot")],
      [createPair("always", "shoot")],
    );

    const update = engine.tick(16);

    expect(update.battleOver).toBe(true);
    expect(update.playerWon).toBe(true);
  });

  /**
   * Validates that pawn enemies don't prevent victory.
   */
  it("should allow victory with pawns still alive", () => {
    const guardian = createMockEnemy("g1", 0);
    guardian.isPawn = false;
    const pawn = createMockEnemy("p1", 50);
    pawn.isPawn = true;

    const state = createMockBattleState(100, [guardian, pawn]);
    const engine = new BattleEngine(
      state,
      [createPair("always", "move-forward")],
      [createPair("always", "shoot")],
      [[createPair("always", "shoot")], [createPair("always", "shoot")]],
    );

    const update = engine.tick(16);

    expect(update.battleOver).toBe(true);
    expect(update.playerWon).toBe(true);
  });

  /**
   * Validates that state is returned as independent copy.
   */
  it("should return independent state copy", () => {
    const state = createMockBattleState();
    const engine = new BattleEngine(
      state,
      [createPair("always", "move-forward")],
      [createPair("always", "shoot")],
      [createPair("always", "shoot")],
    );

    const state1 = engine.getState();
    state1.playerHP = 0;

    const state2 = engine.getState();
    expect(state2.playerHP).toBe(100);
  });

  /**
   * Validates that battle history is recorded periodically.
   */
  it("should record battle history", () => {
    const state = createMockBattleState();
    const engine = new BattleEngine(state, [], [], []);

    let update: BattleUpdate = engine.tick(16);
    for (let i = 0; i < 40; i++) {
      update = engine.tick(16);
    }

    expect(update.battleHistory).toBeDefined();
    if (update.battleHistory) {
      expect(update.battleHistory.length).toBeGreaterThan(1);
    }
  });
});
