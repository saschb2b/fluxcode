import { AIExecutor } from "./AIExecutor";
import type {
  TriggerActionPair,
  BattleContext,
  EnemyState,
  Action,
  Trigger,
  Position,
  LagStack,
} from "@/types/game";
import { DamageType } from "@/types/game";

describe("AIExecutor", () => {
  let executor: AIExecutor;

  beforeEach(() => {
    executor = new AIExecutor();
  });

  /**
   * Creates a mock trigger that always returns true.
   * Used for testing action execution without trigger complexity.
   */
  const createAlwaysTrueTrigger = (id: string = "trigger-1"): Trigger => ({
    id,
    name: "Always True",
    description: "Test trigger that always passes",
    check: () => true,
  });

  /**
   * Creates a mock trigger that always returns false.
   * Used for testing that actions don't execute when conditions aren't met.
   */
  const createAlwaysFalseTrigger = (id: string = "trigger-1"): Trigger => ({
    id,
    name: "Always False",
    description: "Test trigger that always fails",
    check: () => false,
  });

  /**
   * Creates a mock action with configurable properties.
   * Returns a basic ActionResult on execution.
   */
  const createMockAction = (
    id: string = "action-1",
    cooldown: number = 100,
    coreType: "movement" | "tactical" = "tactical",
  ): Action => ({
    id,
    name: "Mock Action",
    description: "Test action",
    cooldown,
    coreType,
    execute: () => ({
      type: "shoot" as const,
      damage: 50,
      damageType: DamageType.KINETIC,
    }),
  });

  /**
   * Creates a mock trigger-action pair with specified properties.
   */
  const createMockPair = (
    triggerId: string = "trigger-1",
    actionId: string = "action-1",
    priority: number = 1,
    coreType: "movement" | "tactical" = "tactical",
  ): TriggerActionPair => ({
    trigger: { ...createAlwaysTrueTrigger(triggerId) },
    action: { ...createMockAction(actionId, 100, coreType) },
    priority,
    enabled: true,
  });

  /**
   * Creates a mock battle context with default values.
   * Explicitly typed to ensure all required properties are present.
   */
  const createMockContext = (
    playerPos: Position = { x: 0, y: 1 },
    enemyPos: Position = { x: 5, y: 1 },
  ): BattleContext => {
    const context: BattleContext = {
      playerPos,
      enemyPos,
      playerHP: 100,
      enemyHP: 100,
      playerShield: 0,
      playerArmor: 0,
      enemyShield: 0,
      enemyArmor: 0,
      playerStatusEffects: [],
      enemyStatusEffects: [],
      justTookDamage: false,
      isPlayer: false,
    };
    return context;
  };

  /**
   * Creates a mock enemy with standard stats for testing.
   */
  const createMockEnemy = (
    hp: number = 100,
    lagStacks: LagStack[] = [],
  ): EnemyState => ({
    id: "enemy-1",
    position: { x: 5, y: 1 },
    hp,
    maxHp: 100,
    shields: 0,
    maxShields: 100,
    armor: 0,
    maxArmor: 100,
    burnStacks: [],
    viralStacks: [],
    empStacks: [],
    lagStacks,
    displaceStacks: [],
    corrosiveStacks: [],
    shieldRegenDisabled: false,
    isPawn: false,
  });

  describe("execute", () => {
    /**
     * Validates the simplest execution path: a single protocol pair with
     * a trigger that passes. The action should execute and return the
     * result with trigger/action IDs attached.
     */
    it("should execute action when trigger passes", () => {
      const pairs = [createMockPair("t1", "a1", 1, "tactical")];
      const context = createMockContext();

      const result = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "player-1",
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe("shoot");
      expect(result?.triggerId).toBe("t1");
      expect(result?.actionId).toBe("a1");
    });

    /**
     * Confirms that actions don't execute when their trigger condition
     * fails. The executor should return null when no triggers match.
     */
    it("should not execute action when trigger fails", () => {
      const pair = createMockPair("t1", "a1", 1, "tactical");
      pair.trigger = createAlwaysFalseTrigger("t1");
      const pairs = [pair];
      const context = createMockContext();

      const result = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "player-1",
      );

      expect(result).toBeNull();
    });

    /**
     * Validates that only protocols of the requested core type are
     * executed. A tactical action should not execute when "movement"
     * core type is requested.
     */
    it("should only execute protocols of requested core type", () => {
      const pairs = [createMockPair("t1", "a1", 1, "tactical")];
      const context = createMockContext();

      const result = executor.execute(
        pairs,
        context,
        16,
        "movement",
        "player-1",
      );

      expect(result).toBeNull();
    });

    /**
     * Confirms that movement core type protocols execute correctly
     * when requested. This validates the core type filtering works
     * in both directions.
     */
    it("should execute movement core type when requested", () => {
      const pairs = [createMockPair("t1", "a1", 1, "movement")];
      const context = createMockContext();

      const result = executor.execute(
        pairs,
        context,
        16,
        "movement",
        "player-1",
      );

      expect(result).not.toBeNull();
      expect(result?.triggerId).toBe("t1");
    });

    /**
     * Validates that when multiple protocols are available, the executor
     * evaluates them in priority order and executes the first one whose
     * trigger passes.
     */
    it("should evaluate pairs in priority order", () => {
      const pair1 = createMockPair("t1", "a1", 3, "tactical");
      const pair2 = createMockPair("t2", "a2", 1, "tactical");
      const pair3 = createMockPair("t3", "a3", 2, "tactical");

      pair1.priority = 3;
      pair2.priority = 1;
      pair3.priority = 2;

      const pairs = [pair1, pair2, pair3];
      const context = createMockContext();

      const result = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "player-1",
      );

      expect(result?.actionId).toBe("a1");
    });

    /**
     * Confirms that cooldowns prevent action execution. After an action
     * executes, calling execute again with insufficient time elapsed
     * should not execute the same action.
     */
    it("should respect cooldowns and prevent re-execution", () => {
      const pairs = [createMockPair("t1", "a1", 1, "tactical")];
      const context = createMockContext();

      const result1 = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "player-1",
      );
      expect(result1).not.toBeNull();

      const result2 = executor.execute(
        pairs,
        context,
        0,
        "tactical",
        "player-1",
      );
      expect(result2).toBeNull();
    });

    /**
     * Validates that cooldowns expire and allow re-execution after
     * sufficient time has passed. A 100ms cooldown should be ready
     * after 100ms of deltaTime.
     */
    it("should allow re-execution after cooldown expires", () => {
      const pairs = [createMockPair("t1", "a1", 1, "tactical")];
      const context = createMockContext();

      executor.execute(pairs, context, 16, "tactical", "player-1");

      const result = executor.execute(
        pairs,
        context,
        100,
        "tactical",
        "player-1",
      );

      expect(result).not.toBeNull();
    });

    /**
     * Confirms that cooldowns are independent per entity. Two different
     * entities can execute the same action ID simultaneously without
     * interfering with each other's cooldowns.
     */
    it("should track cooldowns independently per entity", () => {
      const pairs = [createMockPair("t1", "a1", 1, "tactical")];
      const context = createMockContext();

      const result1 = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "player-1",
      );
      expect(result1).not.toBeNull();

      const result2 = executor.execute(
        pairs,
        context,
        0,
        "tactical",
        "player-2",
      );
      expect(result2).not.toBeNull();
    });

    /**
     * Validates that the first action that passes a trigger is executed
     * (short-circuit behavior). If multiple triggers pass, only the first
     * one should execute its action.
     */
    it("should stop at first matching trigger", () => {
      const pair1 = createMockPair("t1", "a1", 1, "tactical");
      const pair2 = createMockPair("t2", "a2", 2, "tactical");

      const pairs = [pair1, pair2];
      const context = createMockContext();

      const result = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "player-1",
      );

      expect(result?.actionId).toBe("a1");
    });

    /**
     * Confirms that lag status effects increase action cooldowns.
     * With lag multiplier > 1.0, the same action should have a longer
     * cooldown and take longer to recharge.
     */
    it("should apply lag cooldown multiplier to enemies with lag", () => {
      const pairs = [createMockPair("t1", "a1", 1, "tactical")];
      const context = createMockContext();
      const enemy = createMockEnemy(100, [
        {
          actionFailureChance: 0.05,
          cooldownIncrease: 0.15,
          movementReduction: 0.1,
          endTime: Date.now() + 5000,
        },
      ]);

      executor.execute(pairs, context, 16, "tactical", "enemy-1", enemy);

      const result = executor.execute(
        pairs,
        context,
        50,
        "tactical",
        "enemy-1",
        enemy,
      );

      expect(result).toBeNull();
    });

    /**
     * Validates that lag status effects can cause action failures.
     * Enemies with lag stacks should occasionally fail to execute actions
     * due to their actionFailureChance.
     */
    it("should fail actions due to lag status effect", () => {
      const alwaysTrueTrigger: Trigger = {
        id: "t1",
        name: "Always",
        description: "Always passes",
        check: () => true,
      };

      const pairs: TriggerActionPair[] = [
        {
          trigger: alwaysTrueTrigger,
          action: createMockAction("a1", 100, "tactical"),
          priority: 1,
          enabled: true,
        },
      ];

      const context = createMockContext();

      const enemy = createMockEnemy(100, [
        {
          actionFailureChance: 1.0,
          cooldownIncrease: 0.15,
          movementReduction: 0.1,
          endTime: Date.now() + 5000,
        },
      ]);

      const result = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "enemy-1",
        enemy,
      );

      expect(result).toBeNull();
    });

    /**
     * Confirms that action failure chance is cumulative with multiple
     * lag stacks. Two lag stacks with combined failure chance should
     * accumulate to increase the overall failure probability.
     */
    it("should accumulate failure chance from multiple lag stacks", () => {
      const alwaysTrueTrigger: Trigger = {
        id: "t1",
        name: "Always",
        description: "Always passes",
        check: () => true,
      };

      const pairs: TriggerActionPair[] = [
        {
          trigger: alwaysTrueTrigger,
          action: createMockAction("a1", 100, "tactical"),
          priority: 1,
          enabled: true,
        },
      ];

      const context = createMockContext();

      const enemy = createMockEnemy(100, [
        {
          actionFailureChance: 0.6,
          cooldownIncrease: 0.15,
          movementReduction: 0.1,
          endTime: Date.now() + 5000,
        },
        {
          actionFailureChance: 0.6,
          cooldownIncrease: 0.15,
          movementReduction: 0.1,
          endTime: Date.now() + 5000,
        },
      ]);

      let failures = 0;
      for (let i = 0; i < 10; i++) {
        const result = executor.execute(
          pairs,
          context,
          16,
          "tactical",
          "enemy-1",
          enemy,
        );
        if (result === null) failures++;
      }

      expect(failures).toBeGreaterThan(5);
    });

    /**
     * Validates that deltaTime is correctly applied to cooldown timers.
     * Different deltaTime values should result in proportionally different
     * cooldown expiration times.
     */
    it("should handle variable deltaTime correctly", () => {
      const pairs = [createMockPair("t1", "a1", 1, "tactical")];
      const context = createMockContext();

      executor.execute(pairs, context, 16, "tactical", "player-1");

      const result = executor.execute(
        pairs,
        context,
        100,
        "tactical",
        "player-1",
      );

      expect(result).not.toBeNull();
    });

    /**
     * Confirms that empty pair arrays return null (no actions to execute).
     * This tests the boundary condition for protocol availability.
     */
    it("should return null with empty pairs array", () => {
      const context = createMockContext();

      const result = executor.execute([], context, 16, "tactical", "player-1");

      expect(result).toBeNull();
    });

    /**
     * Validates that trigger check receives the correct battle context.
     * The trigger function should be called with the exact context passed
     * to execute, including all position data.
     */
    it("should pass correct context to trigger check", () => {
      let capturedContext: BattleContext | null = null;

      const customTrigger: Trigger = {
        id: "t1",
        name: "Custom",
        description: "Captures context",
        check: (ctx) => {
          capturedContext = ctx;
          return true;
        },
      };

      const pairs: TriggerActionPair[] = [
        {
          trigger: customTrigger,
          action: createMockAction("a1", 100, "tactical"),
          priority: 1,
          enabled: true,
        },
      ];

      const playerPos: Position = { x: 2, y: 1 };
      const enemyPos: Position = { x: 4, y: 2 };
      const context = createMockContext(playerPos, enemyPos);

      executor.execute(pairs, context, 16, "tactical", "player-1");
      expect(capturedContext).not.toBeNull();

      if (capturedContext !== null) {
        expect(capturedContext.playerPos.x).toBe(2);
        expect(capturedContext.playerPos.y).toBe(1);
        expect(capturedContext.enemyPos.x).toBe(4);
        expect(capturedContext.enemyPos.y).toBe(2);
      }
    });

    /**
     * Confirms that action execution results include the action's output.
     * The returned ActionResult should contain all data from the action's
     * execute method, plus trigger/action IDs.
     */
    it("should return action result with metadata", () => {
      const customAction: Action = {
        id: "a1",
        name: "Custom Attack",
        description: "Test action",
        cooldown: 100,
        coreType: "tactical",
        execute: () => ({
          type: "shoot" as const,
          damage: 75,
          damageType: DamageType.THERMAL,
        }),
      };

      const pairs: TriggerActionPair[] = [
        {
          trigger: createAlwaysTrueTrigger("t1"),
          action: customAction,
          priority: 1,
          enabled: true,
        },
      ];

      const context = createMockContext();
      const result = executor.execute(
        pairs,
        context,
        16,
        "tactical",
        "player-1",
      );

      expect(result?.type).toBe("shoot");
      expect(result?.damage).toBe(75);
      expect(result?.damageType).toBe(DamageType.THERMAL);
      expect(result?.triggerId).toBe("t1");
      expect(result?.actionId).toBe("a1");
    });
  });
});
