import { describe, it, expect, beforeEach } from "@jest/globals"
import { BattleEngine } from "../battle-engine"
import type { BattleState, TriggerActionPair } from "@/types/game"

describe("BattleEngine", () => {
  let initialState: BattleState
  let playerPairs: TriggerActionPair[]
  let enemyPairs: TriggerActionPair[]

  beforeEach(() => {
    initialState = {
      playerPos: { x: 1, y: 1 },
      playerHP: 100,
      enemyPos: { x: 4, y: 1 },
      enemyHP: 100,
      projectiles: [],
      justTookDamage: false,
    }

    playerPairs = []
    enemyPairs = []
  })

  describe("Initialization", () => {
    it("should initialize with correct state", () => {
      const engine = new BattleEngine(initialState, playerPairs, enemyPairs)
      const state = engine.getState()

      expect(state.playerHP).toBe(100)
      expect(state.enemyHP).toBe(100)
      expect(state.playerPos).toEqual({ x: 1, y: 1 })
      expect(state.enemyPos).toEqual({ x: 4, y: 1 })
      expect(state.projectiles).toHaveLength(0)
    })

    it("should sort trigger-action pairs by priority", () => {
      const lowPriorityPair: TriggerActionPair = {
        id: "low",
        trigger: {
          id: "always",
          name: "Always",
          description: "Always triggers",
          check: () => true,
        },
        action: {
          id: "shoot",
          name: "Shoot",
          description: "Fire projectile",
          cooldown: 1000,
          execute: () => ({ type: "shoot", damage: 10 }),
        },
        priority: 1,
      }

      const highPriorityPair: TriggerActionPair = {
        ...lowPriorityPair,
        id: "high",
        priority: 10,
      }

      const engine = new BattleEngine(initialState, [lowPriorityPair, highPriorityPair], [])
      // Engine should execute high priority first
      const update = engine.tick(16)
      expect(update.projectiles).toBeDefined()
    })
  })

  describe("Projectile System", () => {
    it("should create projectiles when shooting", () => {
      const shootPair: TriggerActionPair = {
        id: "shoot-pair",
        trigger: {
          id: "always",
          name: "Always",
          description: "Always triggers",
          check: () => true,
        },
        action: {
          id: "shoot",
          name: "Shoot",
          description: "Fire projectile",
          cooldown: 1000,
          execute: () => ({ type: "shoot", damage: 10 }),
        },
        priority: 1,
      }

      const engine = new BattleEngine(initialState, [shootPair], [])
      const update = engine.tick(16)

      expect(update.projectiles).toBeDefined()
      expect(update.projectiles!.length).toBeGreaterThan(0)
      expect(update.projectiles![0].direction).toBe("right")
    })

    it("should move projectiles correctly", () => {
      const engine = new BattleEngine(initialState, [], [])
      const projectile = {
        id: "test-proj",
        position: { x: 2, y: 1 },
        direction: "right" as const,
        damage: 10,
      }

      initialState.projectiles = [projectile]
      engine.tick(16)
      const state = engine.getState()

      expect(state.projectiles[0].position.x).toBeGreaterThan(2)
    })

    it("should remove projectiles that go off-grid", () => {
      const engine = new BattleEngine(initialState, [], [])
      const projectile = {
        id: "test-proj",
        position: { x: 5.5, y: 1 },
        direction: "right" as const,
        damage: 10,
      }

      initialState.projectiles = [projectile]
      engine.tick(100) // Large delta to move projectile far
      const state = engine.getState()

      expect(state.projectiles).toHaveLength(0)
    })
  })

  describe("Damage System", () => {
    it("should detect projectile hits on player", () => {
      const engine = new BattleEngine(initialState, [], [])
      const projectile = {
        id: "enemy-proj",
        position: { x: 1.1, y: 1 },
        direction: "left" as const,
        damage: 20,
      }

      initialState.projectiles = [projectile]
      const update = engine.tick(16)

      expect(update.playerHP).toBeLessThan(100)
      expect(update.playerHP).toBe(80)
    })

    it("should detect projectile hits on enemy", () => {
      const engine = new BattleEngine(initialState, [], [])
      const projectile = {
        id: "player-proj",
        position: { x: 3.9, y: 1 },
        direction: "right" as const,
        damage: 15,
      }

      initialState.projectiles = [projectile]
      const update = engine.tick(16)

      expect(update.enemyHP).toBeLessThan(100)
      expect(update.enemyHP).toBe(85)
    })

    it("should end battle when player HP reaches 0", () => {
      initialState.playerHP = 10
      const engine = new BattleEngine(initialState, [], [])
      const projectile = {
        id: "enemy-proj",
        position: { x: 1.1, y: 1 },
        direction: "left" as const,
        damage: 20,
      }

      initialState.projectiles = [projectile]
      const update = engine.tick(16)

      expect(update.battleOver).toBe(true)
      expect(update.playerWon).toBe(false)
      expect(update.battleHistory).toBeDefined()
    })

    it("should end battle when enemy HP reaches 0", () => {
      initialState.enemyHP = 10
      const engine = new BattleEngine(initialState, [], [])
      const projectile = {
        id: "player-proj",
        position: { x: 3.9, y: 1 },
        direction: "right" as const,
        damage: 20,
      }

      initialState.projectiles = [projectile]
      const update = engine.tick(16)

      expect(update.battleOver).toBe(true)
      expect(update.playerWon).toBe(true)
      expect(update.battleHistory).toBeDefined()
    })
  })

  describe("Action Execution", () => {
    it("should execute move action", () => {
      const movePair: TriggerActionPair = {
        id: "move-pair",
        trigger: {
          id: "always",
          name: "Always",
          description: "Always triggers",
          check: () => true,
        },
        action: {
          id: "move",
          name: "Move",
          description: "Move to position",
          cooldown: 1000,
          execute: () => ({ type: "move", position: { x: 2, y: 2 } }),
        },
        priority: 1,
      }

      const engine = new BattleEngine(initialState, [movePair], [])
      const update = engine.tick(16)

      expect(update.playerPos).toEqual({ x: 2, y: 2 })
    })

    it("should execute heal action", () => {
      initialState.playerHP = 50
      const healPair: TriggerActionPair = {
        id: "heal-pair",
        trigger: {
          id: "always",
          name: "Always",
          description: "Always triggers",
          check: () => true,
        },
        action: {
          id: "heal",
          name: "Heal",
          description: "Restore HP",
          cooldown: 1000,
          execute: () => ({ type: "heal", amount: 20 }),
        },
        priority: 1,
      }

      const engine = new BattleEngine(initialState, [healPair], [])
      const update = engine.tick(16)

      expect(update.playerHP).toBe(70)
    })

    it("should respect action cooldowns", () => {
      const shootPair: TriggerActionPair = {
        id: "shoot-pair",
        trigger: {
          id: "always",
          name: "Always",
          description: "Always triggers",
          check: () => true,
        },
        action: {
          id: "shoot",
          name: "Shoot",
          description: "Fire projectile",
          cooldown: 1000,
          execute: () => ({ type: "shoot", damage: 10 }),
        },
        priority: 1,
      }

      const engine = new BattleEngine(initialState, [shootPair], [])

      const update1 = engine.tick(16)
      expect(update1.projectiles?.length).toBeGreaterThan(0)

      const update2 = engine.tick(16)
      // Should not fire again due to cooldown
      expect(update2.projectiles?.length).toBe(update1.projectiles?.length)
    })
  })

  describe("Battle History", () => {
    it("should record battle history over time", () => {
      const engine = new BattleEngine(initialState, [], [])

      // Run for several seconds
      for (let i = 0; i < 100; i++) {
        engine.tick(100)
      }

      initialState.enemyHP = 0
      const update = engine.tick(16)

      expect(update.battleHistory).toBeDefined()
      expect(update.battleHistory!.length).toBeGreaterThan(1)
    })
  })
})
