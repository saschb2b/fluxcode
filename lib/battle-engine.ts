import type { Position, Projectile, TriggerActionPair, BattleContext, ActionResult, DamageType } from "@/types/game"

interface BurnStack {
  damage: number
  endTime: number
}

interface ViralStack {
  endTime: number
}

interface CorrosiveStack {
  endTime: number
  armorStripped: number
}

interface EMPStack {
  endTime: number
  shieldDrainPercent: number
}

interface LagStack {
  endTime: number
  cooldownIncrease: number // 15% per stack
  movementReduction: number // 10% per stack
  actionFailureChance: number // 5% per stack
}

interface DisplaceStack {
  endTime: number
  pushDistance: number // number of tiles to push back
  corruptMovement: boolean // whether to corrupt next move action
}

export interface BattleState {
  playerPos: Position
  playerHP: number
  playerShields?: number // Added player shields
  playerArmor?: number // Added player armor
  enemyPos: Position // Keep for backwards compatibility
  enemyHP: number // Keep for backwards compatibility
  enemies: EnemyState[] // Added array of enemy states
  enemyShields: number // Keep for backwards compatibility
  enemyArmor: number // Keep for backwards compatibility
  projectiles: Projectile[]
  justTookDamage: boolean
  enemyBurnStacks: BurnStack[] // Keep for backwards compatibility
  enemyViralStacks: ViralStack[]
  enemyEMPStacks: EMPStack[]
  enemyLagStacks: LagStack[]
  enemyDisplaceStacks: DisplaceStack[]
  enemyCorrosiveStacks: CorrosiveStack[]
  shieldRegenDisabled: boolean
  enemyImmuneToStatus?: boolean
}

export interface EnemyState {
  id: string
  position: Position
  hp: number
  maxHp: number
  shields: number
  maxShields: number
  armor: number
  maxArmor: number
  burnStacks: BurnStack[]
  viralStacks: ViralStack[]
  empStacks: EMPStack[]
  lagStacks: LagStack[]
  displaceStacks: DisplaceStack[]
  corrosiveStacks: CorrosiveStack[]
  shieldRegenDisabled: boolean
  isPawn: boolean // Flag for guardian pawns
  triggerActionPairs?: TriggerActionPair[] // Added to potentially embed protocols in enemy object
}

export interface BattleHistoryPoint {
  time: number
  playerHP: number
  enemyHP: number
}

export interface BattleUpdate {
  playerPos?: Position
  playerHP?: number
  playerShields?: number // Added player shields
  playerArmor?: number // Added player armor
  enemyPos?: Position
  enemyHP?: number
  enemyShields?: number
  enemyArmor?: number
  projectiles?: Projectile[]
  justTookDamage?: boolean
  battleOver?: boolean
  playerWon?: boolean
  battleHistory?: BattleHistoryPoint[]
  damageDealt?: { type: string; amount: number }
  pairExecuted?: { triggerId: string; actionId: string }
  burnStacks?: number
  viralStacks?: number
  empStacks?: number
  lagStacks?: number
  displaceStacks?: number
  corrosiveStacks?: number
}

export class BattleEngine {
  private state: BattleState
  private playerMovementPairs: TriggerActionPair[]
  private playerTacticalPairs: TriggerActionPair[]
  private enemyPairs: TriggerActionPair[][]
  private actionCooldowns: Map<string, number> = new Map()
  private movementCooldowns: Map<string, number> = new Map()
  private tacticalCooldowns: Map<string, number> = new Map()
  private projectileIdCounter = 0
  private battleHistory: BattleHistoryPoint[] = []
  private battleTime = 0
  private lastHistoryRecord = 0
  private playerCustomization: any
  private enemyCustomization: any
  private enemyCustomizations: any[]
  private lastBurnTick = 0

  constructor(
    initialState: BattleState,
    playerMovementPairs: TriggerActionPair[], // Split player pairs into movement and tactical
    playerTacticalPairs: TriggerActionPair[],
    enemyPairs: TriggerActionPair[] | TriggerActionPair[][],
    playerCustomization?: any,
    enemyCustomization?: any | any[],
  ) {
    const playerPairs = [...playerMovementPairs, ...playerTacticalPairs]

    console.log("[v0] BattleEngine constructor - playerMovementPairs count:", playerMovementPairs.length)
    console.log("[v0] BattleEngine constructor - playerTacticalPairs count:", playerTacticalPairs.length)
    console.log(
      "[v0] BattleEngine constructor - playerMovementPairs:",
      playerMovementPairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
    )
    console.log(
      "[v0] BattleEngine constructor - playerTacticalPairs:",
      playerTacticalPairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
    )
    console.log(
      "[v0] BattleEngine constructor - player shields:",
      initialState.playerShields,
      "armor:",
      initialState.playerArmor,
    )

    const ensureArray = (value: any): any[] => {
      if (Array.isArray(value)) return value
      return []
    }

    const enemies: EnemyState[] =
      initialState.enemies && initialState.enemies.length > 0
        ? initialState.enemies.map((e) => ({
            ...e,
            burnStacks: ensureArray(e.burnStacks),
            viralStacks: ensureArray(e.viralStacks),
            empStacks: ensureArray(e.empStacks),
            lagStacks: ensureArray(e.lagStacks),
            displaceStacks: ensureArray(e.displaceStacks),
            corrosiveStacks: ensureArray((e as any).corrosiveStacks),
          }))
        : [
            {
              id: "enemy-0",
              position: initialState.enemyPos,
              hp: initialState.enemyHP,
              maxHp: initialState.enemyHP,
              shields: initialState.enemyShields || 0,
              maxShields: initialState.enemyShields || 0,
              armor: initialState.enemyArmor || 0,
              maxArmor: initialState.enemyArmor || 0,
              burnStacks: ensureArray(initialState.enemyBurnStacks),
              viralStacks: ensureArray(initialState.enemyViralStacks),
              empStacks: ensureArray(initialState.enemyEMPStacks),
              lagStacks: ensureArray(initialState.enemyLagStacks),
              displaceStacks: ensureArray(initialState.enemyDisplaceStacks),
              corrosiveStacks: ensureArray((initialState as any).enemyCorrosiveStacks),
              shieldRegenDisabled: initialState.shieldRegenDisabled || false,
              isPawn: false,
            },
          ]

    this.state = {
      ...initialState,
      enemies,
      enemyBurnStacks: ensureArray(initialState.enemyBurnStacks),
      enemyViralStacks: ensureArray(initialState.enemyViralStacks),
      enemyEMPStacks: ensureArray(initialState.enemyEMPStacks),
      enemyLagStacks: ensureArray(initialState.enemyLagStacks),
      enemyDisplaceStacks: ensureArray(initialState.enemyDisplaceStacks),
      enemyCorrosiveStacks: ensureArray((initialState as any).enemyCorrosiveStacks) || [],
      shieldRegenDisabled: initialState.shieldRegenDisabled || false,
      enemyImmuneToStatus: initialState.enemyImmuneToStatus || false,
    }

    this.playerMovementPairs = [...playerMovementPairs].sort((a, b) => b.priority - a.priority)
    this.playerTacticalPairs = [...playerTacticalPairs].sort((a, b) => b.priority - a.priority)

    if (initialState.enemies && initialState.enemies.length > 0) {
      // Check if enemies have triggerActionPairs embedded in them
      const hasEmbeddedPairs = initialState.enemies.some(
        (e: any) => e.triggerActionPairs && e.triggerActionPairs.length > 0,
      )

      if (hasEmbeddedPairs) {
        // Use the triggerActionPairs from each enemy
        this.enemyPairs = initialState.enemies.map((e: any) => {
          const pairs = e.triggerActionPairs || []
          console.log(`[v0] BattleEngine constructor - Enemy ${e.id} has ${pairs.length} protocols from enemy object`)
          return [...pairs].sort((a, b) => b.priority - a.priority)
        })
      } else if (Array.isArray(enemyPairs) && enemyPairs.length > 0) {
        // Fall back to enemyPairs parameter
        const firstElement = enemyPairs[0]
        if (firstElement && typeof firstElement === "object" && "trigger" in firstElement && "action" in firstElement) {
          this.enemyPairs = [(enemyPairs as TriggerActionPair[]).sort((a, b) => b.priority - a.priority)]
        } else if (Array.isArray(firstElement)) {
          this.enemyPairs = (enemyPairs as TriggerActionPair[][]).map((pairs) =>
            [...pairs].sort((a, b) => b.priority - a.priority),
          )
        } else {
          this.enemyPairs = [(enemyPairs as TriggerActionPair[]).sort((a, b) => b.priority - a.priority)]
        }
      } else {
        // No protocols provided
        this.enemyPairs = this.state.enemies.map(() => [])
      }
    } else if (Array.isArray(enemyPairs) && enemyPairs.length > 0) {
      // Backwards compatibility: single enemy with enemyPairs parameter
      const firstElement = enemyPairs[0]
      if (firstElement && typeof firstElement === "object" && "trigger" in firstElement && "action" in firstElement) {
        this.enemyPairs = [(enemyPairs as TriggerActionPair[]).sort((a, b) => b.priority - a.priority)]
      } else if (Array.isArray(firstElement)) {
        this.enemyPairs = (enemyPairs as TriggerActionPair[][]).map((pairs) =>
          [...pairs].sort((a, b) => b.priority - a.priority),
        )
      } else {
        this.enemyPairs = [(enemyPairs as TriggerActionPair[]).sort((a, b) => b.priority - a.priority)]
      }
    } else {
      this.enemyPairs = this.state.enemies.map(() => [])
    }

    console.log("[v0] BattleEngine constructor - enemy count:", this.state.enemies.length)
    console.log("[v0] BattleEngine constructor - enemyPairs arrays:", this.enemyPairs.length)
    this.enemyPairs.forEach((pairs, index) => {
      console.log(
        `[v0] BattleEngine constructor - Enemy ${index} has ${pairs.length} protocols:`,
        pairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
      )
    })

    this.playerCustomization = playerCustomization

    if (Array.isArray(enemyCustomization)) {
      this.enemyCustomizations = enemyCustomization
      this.enemyCustomization = enemyCustomization[0]
    } else {
      this.enemyCustomization = enemyCustomization
      this.enemyCustomizations = [enemyCustomization]
    }

    this.battleHistory.push({
      time: 0,
      playerHP: initialState.playerHP,
      enemyHP: this.state.enemies.reduce((sum, e) => sum + e.hp, 0), // Sum all enemy HP for history
    })
  }

  // Main battle tick - called every frame
  tick(deltaTime: number): BattleUpdate {
    const update: BattleUpdate = {}

    this.battleTime += deltaTime
    if (this.battleTime - this.lastHistoryRecord >= 500) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: this.state.playerHP,
        enemyHP: this.state.enemies.reduce((sum, e) => sum + e.hp, 0),
      })
      this.lastHistoryRecord = this.battleTime
    }

    if (this.battleTime - this.lastBurnTick >= 500) {
      this.lastBurnTick = this.battleTime
      this.state.enemies.forEach((enemy) => {
        const burnDamage = this.processEnemyBurnDamage(enemy)
        if (burnDamage > 0) {
          update.enemyHP = this.state.enemies.reduce((sum, e) => sum + e.hp, 0)
        }
      })
    }

    this.state.enemies.forEach((enemy) => {
      enemy.burnStacks = enemy.burnStacks.filter((stack) => stack.endTime > this.battleTime)
      enemy.viralStacks = enemy.viralStacks.filter((stack) => stack.endTime > this.battleTime)
      enemy.empStacks = enemy.empStacks.filter((stack) => stack.endTime > this.battleTime)
      enemy.lagStacks = enemy.lagStacks.filter((stack) => stack.endTime > this.battleTime)
      enemy.displaceStacks = enemy.displaceStacks.filter((stack) => stack.endTime > this.battleTime)
      enemy.corrosiveStacks = enemy.corrosiveStacks.filter((stack) => stack.endTime > this.battleTime)
      enemy.shieldRegenDisabled = enemy.empStacks.length > 0
    })

    update.enemyHP = this.state.enemies.reduce((sum, e) => sum + e.hp, 0)
    update.enemyShields = this.state.enemies.reduce((sum, e) => sum + e.shields, 0)
    update.enemyArmor = this.state.enemies.reduce((sum, e) => sum + e.armor, 0)
    update.burnStacks = this.state.enemies.reduce((sum, e) => sum + e.burnStacks.length, 0)
    update.viralStacks = this.state.enemies.reduce((sum, e) => sum + e.viralStacks.length, 0)
    update.empStacks = this.state.enemies.reduce((sum, e) => sum + e.empStacks.length, 0)
    update.lagStacks = this.state.enemies.reduce((sum, e) => sum + e.lagStacks.length, 0)
    update.displaceStacks = this.state.enemies.reduce((sum, e) => sum + e.displaceStacks.length, 0)
    update.corrosiveStacks = this.state.enemies.reduce((sum, e) => sum + e.corrosiveStacks.length, 0)

    const newProjectiles = this.updateProjectiles(deltaTime)
    update.projectiles = newProjectiles
    this.state.projectiles = newProjectiles

    const hitUpdate = this.checkProjectileHits()
    if (hitUpdate.playerHP !== undefined) {
      update.playerHP = hitUpdate.playerHP
      this.state.playerHP = hitUpdate.playerHP
      update.justTookDamage = true
      this.state.justTookDamage = true
    }
    if (hitUpdate.playerShields !== undefined) {
      update.playerShields = hitUpdate.playerShields
      this.state.playerShields = hitUpdate.playerShields
    }
    if (hitUpdate.playerArmor !== undefined) {
      update.playerArmor = hitUpdate.playerArmor
      this.state.playerArmor = hitUpdate.playerArmor
    }
    if (hitUpdate.enemyHP !== undefined) {
      update.enemyHP = hitUpdate.enemyHP
    }
    if (hitUpdate.enemyShields !== undefined) {
      update.enemyShields = hitUpdate.enemyShields
    }
    if (hitUpdate.enemyArmor !== undefined) {
      update.enemyArmor = hitUpdate.enemyArmor
    }
    if (hitUpdate.damageDealt !== undefined) {
      update.damageDealt = hitUpdate.damageDealt
    }
    if (hitUpdate.burnStacks !== undefined) {
      update.burnStacks = hitUpdate.burnStacks
    }
    if (hitUpdate.viralStacks !== undefined) {
      update.viralStacks = hitUpdate.viralStacks
    }
    if (hitUpdate.empStacks !== undefined) {
      update.empStacks = hitUpdate.empStacks
    }
    if (hitUpdate.lagStacks !== undefined) {
      update.lagStacks = hitUpdate.lagStacks
    }
    if (hitUpdate.displaceStacks !== undefined) {
      update.displaceStacks = hitUpdate.displaceStacks
    }
    if (hitUpdate.corrosiveStacks !== undefined) {
      update.corrosiveStacks = hitUpdate.corrosiveStacks
    }

    if (this.state.playerHP <= 0) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: 0,
        enemyHP: this.state.enemies.reduce((sum, e) => sum + e.hp, 0),
      })
      update.battleOver = true
      update.playerWon = false
      update.battleHistory = this.battleHistory
      return update
    }

    const guardiansInBattle = this.state.enemies.filter((e) => !e.isPawn)
    const guardiansAlive = guardiansInBattle.filter((e) => e.hp > 0)
    const guardiansDefeated = guardiansInBattle.length > 0 && guardiansAlive.length === 0

    const allEnemiesDefeated = this.state.enemies.every((e) => e.hp <= 0)
    const aliveEnemiesCount = this.state.enemies.filter((e) => e.hp > 0).length

    console.log(
      `[v0] Victory check - Total: ${this.state.enemies.length}, Defeated: ${this.state.enemies.length - aliveEnemiesCount}, Alive: ${aliveEnemiesCount}, Guardian defeated: ${guardiansDefeated}`,
    )

    this.state.enemies.forEach((enemy, i) => {
      console.log(`[v0] Enemy ${i} (${enemy.isPawn ? "pawn" : "guardian"}): HP=${enemy.hp}/${enemy.maxHp}`)
    })

    if (guardiansDefeated || allEnemiesDefeated) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: this.state.playerHP,
        enemyHP: 0,
      })
      update.battleOver = true
      update.playerWon = true
      update.battleHistory = this.battleHistory
      console.log(`[v0] Victory! ${guardiansDefeated ? "Guardian(s) defeated" : "All enemies defeated"}`)
      return update
    }

    const playerMovementAction = this.executeMovementCore(this.playerMovementPairs, true, deltaTime)
    if (playerMovementAction) {
      const actionUpdate = this.applyAction(playerMovementAction, true)
      Object.assign(update, actionUpdate)
      update.pairExecuted = {
        triggerId: playerMovementAction.triggerId,
        actionId: playerMovementAction.actionId,
      }
    }

    if (!playerMovementAction) {
      const playerTacticalAction = this.executeTacticalCore(this.playerTacticalPairs, true, deltaTime)
      if (playerTacticalAction) {
        const actionUpdate = this.applyAction(playerTacticalAction, true)
        Object.assign(update, actionUpdate)
        update.pairExecuted = {
          triggerId: playerTacticalAction.triggerId,
          actionId: playerTacticalAction.actionId,
        }
      }
    }

    this.state.enemies.forEach((enemy, index) => {
      if (enemy.hp > 0) {
        const enemyPairs = this.enemyPairs[Math.min(index, this.enemyPairs.length - 1)]

        const enemyMovementAction = this.executeEnemyMovementCore(enemyPairs, enemy, deltaTime)
        if (enemyMovementAction) {
          const actionUpdate = this.applyAction(enemyMovementAction, false, enemy)
          Object.assign(update, actionUpdate)
        }

        if (!enemyMovementAction) {
          const enemyTacticalAction = this.executeEnemyTacticalCore(enemyPairs, enemy, deltaTime)
          if (enemyTacticalAction) {
            const actionUpdate = this.applyAction(enemyTacticalAction, false, enemy)
            Object.assign(update, actionUpdate)
          }
        }
      }
    })

    if (this.state.justTookDamage) {
      this.state.justTookDamage = false
      update.justTookDamage = false
    }

    return update
  }

  private processBurnDamage(): number {
    if (this.state.enemyBurnStacks.length === 0) return 0

    let totalDamage = 0
    this.state.enemyBurnStacks.forEach((stack) => {
      totalDamage += stack.damage
    })

    // Burn damage bypasses shields and armor, goes directly to HP
    this.state.enemyHP = Math.max(0, this.state.enemyHP - totalDamage)

    return totalDamage
  }

  private processEnemyBurnDamage(enemy: EnemyState): number {
    if (enemy.burnStacks.length === 0) return 0

    let totalDamage = 0
    enemy.burnStacks.forEach((stack) => {
      totalDamage += stack.damage
    })

    enemy.hp = Math.max(0, enemy.hp - totalDamage)
    return totalDamage
  }

  private executeMovementCore(pairs: TriggerActionPair[], isPlayer: boolean, deltaTime: number): ActionResult | null {
    const movementPairs = pairs.filter((pair) => pair.action.coreType === "movement")

    let enemyPosForContext = this.state.enemyPos

    if (isPlayer && this.state.enemies.length > 0) {
      const livingEnemies = this.state.enemies.filter((e) => e.hp > 0)
      if (livingEnemies.length > 0) {
        const nearestEnemy = livingEnemies.reduce((nearest, enemy) => {
          const distToEnemy =
            Math.abs(enemy.position.x - this.state.playerPos.x) + Math.abs(enemy.position.y - this.state.playerPos.y)
          const distToNearest =
            Math.abs(nearest.position.x - this.state.playerPos.x) +
            Math.abs(nearest.position.y - this.state.playerPos.y)
          return distToEnemy < distToNearest ? enemy : nearest
        })
        enemyPosForContext = nearestEnemy.position
      }
    }

    const context: BattleContext = {
      playerPos: this.state.playerPos,
      enemyPos: enemyPosForContext,
      playerHP: this.state.playerHP,
      enemyHP: this.state.enemyHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer,
    }

    const lagCooldownMultiplier = this.getLagCooldownMultiplier(!isPlayer)

    this.movementCooldowns.forEach((time, key) => {
      const newTime = time - deltaTime
      if (newTime <= 0) {
        this.movementCooldowns.delete(key)
      } else {
        this.movementCooldowns.set(key, newTime)
      }
    })

    for (const pair of movementPairs) {
      const cooldownKey = `${isPlayer ? "player" : "enemy"}-${pair.action.id}`

      if (this.movementCooldowns.has(cooldownKey)) {
        continue
      }

      const triggerResult = pair.trigger.check(context)

      if (triggerResult) {
        console.log(
          `[v0] ${isPlayer ? "Player" : "Enemy"} Movement Core executing: ${pair.trigger.id} -> ${pair.action.id}`,
        )
        const adjustedCooldown = pair.action.cooldown * lagCooldownMultiplier
        this.movementCooldowns.set(cooldownKey, adjustedCooldown)
        return {
          ...pair.action.execute(context),
          triggerId: pair.trigger.id,
          actionId: pair.action.id,
        }
      }
    }

    return null
  }

  private executeTacticalCore(pairs: TriggerActionPair[], isPlayer: boolean, deltaTime: number): ActionResult | null {
    const tacticalPairs = pairs.filter((pair) => pair.action.coreType === "tactical")

    let enemyPosForContext = this.state.enemyPos

    if (isPlayer && this.state.enemies.length > 0) {
      const livingEnemies = this.state.enemies.filter((e) => e.hp > 0)
      if (livingEnemies.length > 0) {
        const nearestEnemy = livingEnemies.reduce((nearest, enemy) => {
          const distToEnemy =
            Math.abs(enemy.position.x - this.state.playerPos.x) + Math.abs(enemy.position.y - this.state.playerPos.y)
          const distToNearest =
            Math.abs(nearest.position.x - this.state.playerPos.x) +
            Math.abs(nearest.position.y - this.state.playerPos.y)
          return distToEnemy < distToNearest ? enemy : nearest
        })
        enemyPosForContext = nearestEnemy.position
      }
    }

    const context: BattleContext = {
      playerPos: this.state.playerPos,
      enemyPos: enemyPosForContext,
      playerHP: this.state.playerHP,
      enemyHP: this.state.enemyHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer,
    }

    const lagCooldownMultiplier = this.getLagCooldownMultiplier(!isPlayer)

    this.tacticalCooldowns.forEach((time, key) => {
      const newTime = time - deltaTime
      if (newTime <= 0) {
        this.tacticalCooldowns.delete(key)
      } else {
        this.tacticalCooldowns.set(key, newTime)
      }
    })

    for (const pair of tacticalPairs) {
      const cooldownKey = `${isPlayer ? "player" : "enemy"}-${pair.action.id}`

      if (this.tacticalCooldowns.has(cooldownKey)) {
        continue
      }

      const triggerResult = pair.trigger.check(context)

      if (triggerResult) {
        console.log(
          `[v0] ${isPlayer ? "Player" : "Enemy"} Tactical Core executing: ${pair.trigger.id} -> ${pair.action.id}`,
        )
        const adjustedCooldown = pair.action.cooldown * lagCooldownMultiplier
        this.tacticalCooldowns.set(cooldownKey, adjustedCooldown)
        return {
          ...pair.action.execute(context),
          triggerId: pair.trigger.id,
          actionId: pair.action.id,
        }
      }
    }

    return null
  }

  private executeEnemyMovementCore(
    pairs: TriggerActionPair[],
    enemy: EnemyState,
    deltaTime: number,
  ): ActionResult | null {
    const movementPairs = pairs.filter((pair) => pair.action.coreType === "movement")

    if (!enemy.position) {
      console.error("[v0] Enemy position is undefined, skipping Movement Core execution")
      return null
    }

    const context: BattleContext = {
      playerPos: enemy.position,
      enemyPos: this.state.playerPos,
      playerHP: enemy.hp,
      enemyHP: this.state.playerHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer: false,
    }

    const lagCooldownMultiplier = this.getEnemyLagCooldownMultiplier(enemy)

    for (const pair of movementPairs) {
      const cooldownKey = `${enemy.id}-movement-${pair.action.id}`

      if (this.movementCooldowns.has(cooldownKey)) {
        continue
      }

      if (enemy.lagStacks.length > 0) {
        const failureChance = enemy.lagStacks.reduce((acc, stack) => acc + stack.actionFailureChance, 0)
        if (Math.random() < failureChance) {
          console.log(`[v0] Enemy ${enemy.id} movement stuttered due to Lag`)
          continue
        }
      }

      const triggerResult = pair.trigger.check(context)

      if (triggerResult) {
        console.log(`[v0] Enemy ${enemy.id} Movement Core executing: ${pair.trigger.id} -> ${pair.action.id}`)
        const adjustedCooldown = pair.action.cooldown * lagCooldownMultiplier
        this.movementCooldowns.set(cooldownKey, adjustedCooldown)
        return {
          ...pair.action.execute(context),
          triggerId: pair.trigger.id,
          actionId: pair.action.id,
        }
      }
    }

    return null
  }

  private executeEnemyTacticalCore(
    pairs: TriggerActionPair[],
    enemy: EnemyState,
    deltaTime: number,
  ): ActionResult | null {
    const tacticalPairs = pairs.filter((pair) => pair.action.coreType === "tactical")

    if (!enemy.position) {
      console.error("[v0] Enemy position is undefined, skipping Tactical Core execution")
      return null
    }

    const context: BattleContext = {
      playerPos: enemy.position,
      enemyPos: this.state.playerPos,
      playerHP: enemy.hp,
      enemyHP: this.state.playerHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer: false,
    }

    const lagCooldownMultiplier = this.getEnemyLagCooldownMultiplier(enemy)

    for (const pair of tacticalPairs) {
      const cooldownKey = `${enemy.id}-tactical-${pair.action.id}`

      if (this.tacticalCooldowns.has(cooldownKey)) {
        continue
      }

      if (enemy.lagStacks.length > 0) {
        const failureChance = enemy.lagStacks.reduce((acc, stack) => acc + stack.actionFailureChance, 0)
        if (Math.random() < failureChance) {
          console.log(`[v0] Enemy ${enemy.id} tactical action stuttered due to Lag`)
          continue
        }
      }

      const triggerResult = pair.trigger.check(context)

      if (triggerResult) {
        console.log(`[v0] Enemy ${enemy.id} Tactical Core executing: ${pair.trigger.id} -> ${pair.action.id}`)
        const adjustedCooldown = pair.action.cooldown * lagCooldownMultiplier
        this.tacticalCooldowns.set(cooldownKey, adjustedCooldown)
        return {
          ...pair.action.execute(context),
          triggerId: pair.trigger.id,
          actionId: pair.action.id,
        }
      }
    }

    return null
  }

  private executeAI(pairs: TriggerActionPair[], isPlayer: boolean, deltaTime: number): ActionResult | null {
    let enemyPosForContext = this.state.enemyPos // backwards compat default

    if (isPlayer && this.state.enemies.length > 0) {
      // Find nearest living enemy to use for trigger checks
      const livingEnemies = this.state.enemies.filter((e) => e.hp > 0)
      if (livingEnemies.length > 0) {
        const nearestEnemy = livingEnemies.reduce((nearest, enemy) => {
          const distToEnemy =
            Math.abs(enemy.position.x - this.state.playerPos.x) + Math.abs(enemy.position.y - this.state.playerPos.y)
          const distToNearest =
            Math.abs(nearest.position.x - this.state.playerPos.x) +
            Math.abs(nearest.position.y - this.state.playerPos.y)
          return distToEnemy < distToNearest ? enemy : nearest
        })
        enemyPosForContext = nearestEnemy.position
      }
    }

    const context: BattleContext = {
      playerPos: this.state.playerPos,
      enemyPos: enemyPosForContext, // Use nearest living enemy position
      playerHP: this.state.playerHP,
      enemyHP: this.state.enemyHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer,
    }

    const lagCooldownMultiplier = this.getLagCooldownMultiplier(!isPlayer)

    this.actionCooldowns.forEach((time, key) => {
      const newTime = time - deltaTime
      if (newTime <= 0) {
        this.actionCooldowns.delete(key)
      } else {
        this.actionCooldowns.set(key, newTime)
      }
    })

    for (const pair of pairs) {
      const cooldownKey = `${isPlayer ? "player" : "enemy"}-${pair.action.id}`

      if (this.actionCooldowns.has(cooldownKey)) {
        const remainingCooldown = this.actionCooldowns.get(cooldownKey)!
        if (!isPlayer && remainingCooldown > 100) {
          // Only log if significant cooldown remains
          console.log(`[v0] Enemy action ${pair.action.id} on cooldown: ${Math.round(remainingCooldown)}ms remaining`)
        }
        continue
      }

      if (!isPlayer && this.state.enemyLagStacks.length > 0) {
        const failureChance = this.state.enemyLagStacks.reduce((acc, stack) => acc + stack.actionFailureChance, 0)
        if (Math.random() < failureChance) {
          console.log(`[v0] Enemy action stuttered due to Lag (${Math.round(failureChance * 100)}% chance)`)
          // Action fails, skip to next pair
          continue
        }
      }

      const triggerResult = pair.trigger.check(context)

      if (triggerResult) {
        console.log(`[v0] ${isPlayer ? "Player" : "Enemy"} executing: ${pair.trigger.id} -> ${pair.action.id}`)
        const adjustedCooldown = pair.action.cooldown * lagCooldownMultiplier
        if (!isPlayer && lagCooldownMultiplier > 1.0 && pair.action.cooldown > 0) {
          console.log(
            `[v0] Lag increased cooldown: ${pair.action.cooldown}ms -> ${Math.round(adjustedCooldown)}ms (+${Math.round((lagCooldownMultiplier - 1) * 100)}%)`,
          )
        }
        this.actionCooldowns.set(cooldownKey, adjustedCooldown)
        return {
          ...pair.action.execute(context),
          triggerId: pair.trigger.id,
          actionId: pair.action.id,
        }
      }
    }

    return null
  }

  private executeEnemyAI(pairs: TriggerActionPair[], enemy: EnemyState, deltaTime: number): ActionResult | null {
    if (!enemy.position) {
      console.error("[v0] Enemy position is undefined, skipping AI execution")
      return null
    }

    console.log(`[v0] Enemy ${enemy.id} executing AI with ${pairs.length} protocols`)
    console.log(
      `[v0] Enemy ${enemy.id} protocols:`,
      pairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
    )

    const context: BattleContext = {
      playerPos: enemy.position,
      enemyPos: this.state.playerPos,
      playerHP: enemy.hp,
      enemyHP: this.state.playerHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer: false,
    }

    console.log(
      `[v0] Enemy ${enemy.id} context - enemyPos (player): x=${context.enemyPos.x}, y=${context.enemyPos.y}, enemyHP=${context.enemyHP}`,
    )
    console.log(
      `[v0] Enemy ${enemy.id} context - playerPos (self): x=${context.playerPos.x}, y=${context.playerPos.y}, playerHP=${context.playerHP}`,
    )

    const lagCooldownMultiplier = this.getEnemyLagCooldownMultiplier(enemy)

    for (const pair of pairs) {
      const cooldownKey = `${enemy.id}-${pair.action.id}`

      if (this.actionCooldowns.has(cooldownKey)) {
        console.log(`[v0] Enemy ${enemy.id} skipping ${pair.trigger.id}->${pair.action.id} (on cooldown)`)
        continue
      }

      if (enemy.lagStacks.length > 0) {
        const failureChance = enemy.lagStacks.reduce((acc, stack) => acc + stack.actionFailureChance, 0)
        if (Math.random() < failureChance) {
          console.log(`[v0] Enemy ${enemy.id} action stuttered due to Lag (${Math.round(failureChance * 100)}% chance)`)
          continue
        }
      }

      const triggerResult = pair.trigger.check(context)
      console.log(`[v0] Enemy ${enemy.id} trigger ${pair.trigger.id} result: ${triggerResult}`)

      if (triggerResult) {
        console.log(`[v0] Enemy ${enemy.id} executing: ${pair.trigger.id} -> ${pair.action.id}`)
        const adjustedCooldown = pair.action.cooldown * lagCooldownMultiplier
        this.actionCooldowns.set(cooldownKey, adjustedCooldown)
        return {
          ...pair.action.execute(context),
          triggerId: pair.trigger.id,
          actionId: pair.action.id,
        }
      }
    }

    console.log(`[v0] Enemy ${enemy.id} no protocols triggered`)
    return null
  }

  private getLagCooldownMultiplier(isEnemy: boolean): number {
    if (!isEnemy || this.state.enemyLagStacks.length === 0) return 1.0

    const lagStacks = this.state.enemyLagStacks.length
    // Each stack adds 15% cooldown increase
    return 1.0 + lagStacks * 0.15
  }

  private getEnemyLagCooldownMultiplier(enemy: EnemyState): number {
    if (enemy.lagStacks.length === 0) return 1.0
    return 1.0 + enemy.lagStacks.length * 0.15
  }

  private applyAction(action: ActionResult, isPlayer: boolean, enemy?: EnemyState): BattleUpdate {
    const update: BattleUpdate = {}

    switch (action.type) {
      case "shoot":
        const baseDamage = action.damage || 10
        const projectile = this.createProjectile(isPlayer, baseDamage, action.damageType, action.statusChance, enemy)
        this.state.projectiles.push(projectile)
        update.projectiles = [...this.state.projectiles]
        break

      case "rapid-fire":
        const count = action.count || 3
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const proj = this.createProjectile(
              isPlayer,
              action.damage || 5,
              action.damageType,
              action.statusChance,
              enemy,
            )
            this.state.projectiles.push(proj)
          }, i * 200)
        }
        break

      case "cluster":
        const clusterCount = action.count || 3
        for (let i = 0; i < clusterCount; i++) {
          setTimeout(() => {
            const proj = this.createProjectile(
              isPlayer,
              action.damage || 25,
              action.damageType,
              action.statusChance,
              enemy,
            )
            this.state.projectiles.push(proj)
          }, i * 300)
        }
        break

      case "bomb":
        setTimeout(() => {
          const proj = this.createProjectile(
            isPlayer,
            action.damage || 35,
            action.damageType,
            action.statusChance,
            enemy,
          )
          this.state.projectiles.push(proj)
        }, action.delay || 1000)
        break

      case "wave":
        const waveProj = this.createProjectile(
          isPlayer,
          action.damage || 18,
          action.damageType,
          action.statusChance,
          enemy,
        )
        this.state.projectiles.push(waveProj)
        break

      case "spread":
        const targetPos = isPlayer ? this.state.playerPos : enemy!.position
        for (let y = 0; y < 3; y++) {
          const spreadProj = this.createProjectile(
            isPlayer,
            action.damage || 12,
            action.damageType,
            action.statusChance,
            enemy,
          )
          spreadProj.position.y = y
          this.state.projectiles.push(spreadProj)
        }
        break

      case "triple-shot":
        for (let y = 0; y < 3; y++) {
          const tripleProj = this.createProjectile(
            isPlayer,
            action.damage || 15,
            action.damageType,
            action.statusChance,
            enemy,
          )
          tripleProj.position.y = y
          this.state.projectiles.push(tripleProj)
        }
        break

      case "field":
        const fieldDuration = action.duration || 4000
        const fieldTicks = Math.floor(fieldDuration / 500)
        for (let i = 0; i < fieldTicks; i++) {
          setTimeout(() => {
            const fieldProj = this.createProjectile(
              isPlayer,
              action.damage || 8,
              action.damageType,
              action.statusChance,
              enemy,
            )
            this.state.projectiles.push(fieldProj)
          }, i * 500)
        }
        break

      case "piercing-shot":
        const piercingProj = this.createProjectile(
          isPlayer,
          action.damage || 20,
          action.damageType,
          action.statusChance,
          enemy,
        )
        this.state.projectiles.push(piercingProj)
        break

      case "homing":
        const homingProj = this.createProjectile(
          isPlayer,
          action.damage || 20,
          action.damageType,
          action.statusChance,
          enemy,
        )
        this.state.projectiles.push(homingProj)
        break

      case "drain":
        const drainProj = this.createProjectile(
          isPlayer,
          action.damage || 15,
          action.damageType,
          action.statusChance,
          enemy,
        )
        this.state.projectiles.push(drainProj)
        if (isPlayer) {
          const newHP = Math.min(this.state.playerHP + (action.heal || 10), 100)
          this.state.playerHP = newHP
          update.playerHP = newHP
        }
        break

      case "melee":
      case "wide-melee":
        const attackerPos = isPlayer ? this.state.playerPos : enemy!.position
        const targetPos2 = isPlayer ? enemy!.position : this.state.playerPos
        const distance = Math.abs(attackerPos.x - targetPos2.x)
        if (distance <= (action.range || 1)) {
          const meleeProj = this.createProjectile(
            isPlayer,
            action.damage || 35,
            action.damageType,
            action.statusChance,
            enemy,
          )
          this.state.projectiles.push(meleeProj)
        }
        break

      case "move":
        if (action.position) {
          if (!isPlayer && enemy) {
            if (action.position.x < 3) {
              console.log(`[v0] Enemy ${enemy.id} blocked from entering player territory at x=${action.position.x}`)
              return update
            }

            // Check if any other enemy is already at the target position
            const isOccupied = this.state.enemies.some(
              (otherEnemy) =>
                otherEnemy.id !== enemy.id &&
                otherEnemy.hp > 0 &&
                otherEnemy.position.x === action.position!.x &&
                otherEnemy.position.y === action.position!.y,
            )

            if (isOccupied) {
              console.log(
                `[v0] Enemy ${enemy.id} blocked from moving to occupied tile (${action.position.x}, ${action.position.y})`,
              )
              // Movement blocked, return without updating position
              return update
            }
          }

          // Position is free, apply movement
          if (isPlayer) {
            this.state.playerPos = action.position
            update.playerPos = action.position
          } else {
            enemy!.position = action.position
            update.enemyPos = action.position
          }
        }
        break

      case "dash-attack":
        if (action.position) {
          if (!isPlayer && enemy) {
            if (action.position.x < 3) {
              console.log(`[v0] Enemy ${enemy.id} blocked from dash-attacking into player territory`)
              // Still fire the projectile, but don't move
              const dashProj = this.createProjectile(
                isPlayer,
                action.damage || 15,
                action.damageType,
                action.statusChance,
                enemy,
              )
              this.state.projectiles.push(dashProj)
              return update
            }

            const isOccupied = this.state.enemies.some(
              (otherEnemy) =>
                otherEnemy.id !== enemy.id &&
                otherEnemy.hp > 0 &&
                otherEnemy.position.x === action.position!.x &&
                otherEnemy.position.y === action.position!.y,
            )

            if (isOccupied) {
              console.log(`[v0] Enemy ${enemy.id} blocked from dash-attacking to occupied tile`)
              const dashProj = this.createProjectile(
                isPlayer,
                action.damage || 15,
                action.damageType,
                action.statusChance,
                enemy,
              )
              this.state.projectiles.push(dashProj)
              return update
            }
          }

          if (isPlayer) {
            this.state.playerPos = action.position
            update.playerPos = action.position
          } else {
            enemy!.position = action.position
            update.enemyPos = action.position
          }
        }
        const dashProj = this.createProjectile(
          isPlayer,
          action.damage || 15,
          action.damageType,
          action.statusChance,
          enemy,
        )
        this.state.projectiles.push(dashProj)
        break

      case "retreat-shot":
        if (action.position) {
          if (!isPlayer && enemy) {
            if (action.position.x < 3) {
              console.log(`[v0] Enemy ${enemy.id} blocked from retreating into player territory`)
              // Still fire the projectile, but don't move
              const retreatProj = this.createProjectile(
                isPlayer,
                action.damage || 12,
                action.damageType,
                action.statusChance,
                enemy,
              )
              this.state.projectiles.push(retreatProj)
              return update
            }

            const isOccupied = this.state.enemies.some(
              (otherEnemy) =>
                otherEnemy.id !== enemy.id &&
                otherEnemy.hp > 0 &&
                otherEnemy.position.x === action.position!.x &&
                otherEnemy.position.y === action.position!.y,
            )

            if (isOccupied) {
              console.log(`[v0] Enemy ${enemy.id} blocked from retreat-shot to occupied tile`)
              const retreatProj = this.createProjectile(
                isPlayer,
                action.damage || 12,
                action.damageType,
                action.statusChance,
                enemy,
              )
              this.state.projectiles.push(retreatProj)
              return update
            }
          }

          if (isPlayer) {
            this.state.playerPos = action.position
            update.playerPos = action.position
          } else {
            enemy!.position = action.position
            update.enemyPos = action.position
          }
        }
        const retreatProj = this.createProjectile(
          isPlayer,
          action.damage || 12,
          action.damageType,
          action.statusChance,
          enemy,
        )
        this.state.projectiles.push(retreatProj)
        break

      case "heal":
        if (isPlayer) {
          const newHP = Math.min(this.state.playerHP + (action.amount || 20), 100)
          this.state.playerHP = newHP
          update.playerHP = newHP
        } else {
          const newHP = Math.min(enemy!.hp + (action.amount || 20), enemy!.maxHp)
          enemy!.hp = newHP
          update.enemyHP = newHP
        }
        break

      case "heal-over-time":
        const hotDuration = action.duration || 5000
        const hotTicks = Math.floor(hotDuration / 1000)
        for (let i = 0; i < hotTicks; i++) {
          setTimeout(() => {
            if (isPlayer) {
              const newHP = Math.min(this.state.playerHP + (action.healPerTick || 3), 100)
              this.state.playerHP = newHP
            } else {
              const newHP = Math.min(enemy!.hp + (action.healPerTick || 3), enemy!.maxHp)
              enemy!.hp = newHP
            }
          }, i * 1000)
        }
        break

      default:
        console.log(`[v0] Unhandled action type: ${action.type}`)
    }

    return update
  }

  private createProjectile(
    isPlayer: boolean,
    damage: number,
    damageType?: DamageType,
    statusChance?: number,
    enemy?: EnemyState, // Add enemy parameter for non-player projectiles
  ): Projectile {
    let adjustedDamage = damage

    if (!isPlayer) {
      const damageScale = Math.min(1.0, 0.6 + (this.battleTime / 60000) * 0.1)
      adjustedDamage = Math.floor(damage * damageScale)
    }

    let startPos: Position
    if (isPlayer) {
      startPos = { x: this.state.playerPos.x, y: this.state.playerPos.y }
    } else if (enemy && enemy.position) {
      // Use the actual enemy's current position
      startPos = { x: enemy.position.x, y: enemy.position.y }
    } else {
      // Fallback to backwards compatibility position
      startPos = { x: this.state.enemyPos.x, y: this.state.enemyPos.y }
    }

    return {
      id: `proj-${this.projectileIdCounter++}`,
      position: startPos,
      direction: isPlayer ? "right" : "left",
      damage: adjustedDamage,
      damageType: damageType || "kinetic",
      statusChance: statusChance || 0,
    }
  }

  private updateProjectiles(deltaTime: number): Projectile[] {
    const speed = 0.08 * (deltaTime / 16)

    return this.state.projectiles
      .map((proj) => {
        const newX = proj.direction === "right" ? proj.position.x + speed : proj.position.x - speed
        return {
          ...proj,
          position: { ...proj.position, x: newX },
        }
      })
      .filter((proj) => proj.position.x >= 0 && proj.position.x <= 5)
  }

  private checkProjectileHits(): {
    playerHP?: number
    playerShields?: number // Add player shields tracking
    playerArmor?: number // Add player armor tracking
    enemyHP?: number
    enemyShields?: number
    enemyArmor?: number
    damageDealt?: { type: string; amount: number }
    burnStacks?: number
    viralStacks?: number
    empStacks?: number
    lagStacks?: number
    displaceStacks?: number
    corrosiveStacks?: number
  } {
    const update: {
      playerHP?: number
      playerShields?: number // Add player shields to update
      playerArmor?: number // Add player armor to update
      enemyHP?: number
      enemyShields?: number
      enemyArmor?: number
      damageDealt?: { type: string; amount: number }
      burnStacks?: number
      viralStacks?: number
      empStacks?: number
      lagStacks?: number
      displaceStacks?: number
      corrosiveStacks?: number
    } = {}
    const remainingProjectiles: Projectile[] = []

    for (const proj of this.state.projectiles) {
      let hit = false

      if (
        proj.direction === "left" &&
        Math.abs(proj.position.x - this.state.playerPos.x) < 0.6 &&
        proj.position.y === this.state.playerPos.y
      ) {
        const damageResult = this.applyDamageToPlayer(proj)
        Object.assign(update, damageResult)
        hit = true
      }

      this.state.enemies.forEach((enemy) => {
        if (
          proj.direction === "right" &&
          Math.abs(proj.position.x - enemy.position.x) < 0.6 &&
          proj.position.y === enemy.position.y
        ) {
          const damageResult = this.applyDamageToEnemy(proj, enemy)
          Object.assign(update, damageResult)
          hit = true
        }
      })

      if (!hit) {
        remainingProjectiles.push(proj)
      }
    }

    this.state.projectiles = remainingProjectiles
    return update
  }

  private applyDamageToPlayer(proj: Projectile): {
    playerHP?: number
    playerShields?: number
    playerArmor?: number
  } {
    const update: {
      playerHP?: number
      playerShields?: number
      playerArmor?: number
    } = {}

    // Apply elemental modifiers
    let damage = proj.damage

    if (proj.damageType === "energy" && this.state.playerShields && this.state.playerShields > 0) {
      damage = damage * 2.0 // Energy bonus vs shields
    } else if (proj.damageType === "energy" && this.state.playerArmor && this.state.playerArmor > 0) {
      damage = damage * 0.5 // Energy penalty vs armor
    }

    if (proj.damageType === "glacial" && this.state.playerShields && this.state.playerShields > 0) {
      damage = damage * 0.9 // Glacial penalty vs shields
    }

    if (proj.damageType === "concussion") {
      if (this.state.playerShields && this.state.playerShields > 0) {
        damage = damage * 0.9 // Concussion weak vs shields
      } else if (
        (!this.state.playerShields || this.state.playerShields === 0) &&
        (!this.state.playerArmor || this.state.playerArmor === 0)
      ) {
        damage = damage * 1.25 // Concussion bonus vs exposed HP
      }
    }

    let remainingDamage = damage

    // Step 1: Shields absorb damage first
    if (this.state.playerShields && this.state.playerShields > 0) {
      const shieldDamage = Math.min(this.state.playerShields, remainingDamage)
      this.state.playerShields = Math.max(0, this.state.playerShields - shieldDamage)
      remainingDamage -= shieldDamage
      update.playerShields = this.state.playerShields
      console.log(
        `[v0] Player shields absorbed ${Math.round(shieldDamage)} damage (${this.state.playerShields} remaining)`,
      )
    }

    // Step 2: Armor reduces remaining damage
    if (remainingDamage > 0 && this.state.playerArmor && this.state.playerArmor > 0) {
      const armorReduction = this.state.playerArmor / (this.state.playerArmor + 300)
      const reducedDamage = remainingDamage * (1 - armorReduction)
      console.log(
        `[v0] Player armor reduced ${Math.round(remainingDamage - reducedDamage)} damage (${Math.round(armorReduction * 100)}% reduction)`,
      )
      remainingDamage = reducedDamage
    }

    // Step 3: Apply remaining damage to HP
    if (remainingDamage > 0) {
      this.state.playerHP = Math.max(0, this.state.playerHP - remainingDamage)
      update.playerHP = this.state.playerHP
      console.log(`[v0] Player took ${Math.round(remainingDamage)} HP damage (${this.state.playerHP} HP remaining)`)
    }

    // TODO: Apply status effects to player (burn, viral, EMP, lag, corrosive, displace)
    // This would require adding player status effect tracking to BattleState

    return update
  }

  private applyDamageToEnemy(
    proj: Projectile,
    enemy: EnemyState,
  ): {
    enemyHP?: number
    enemyShields?: number
    enemyArmor?: number
    damageDealt?: { type: string; amount: number }
    burnStacks?: number
    viralStacks?: number
    empStacks?: number
    lagStacks?: number
    displaceStacks?: number
    corrosiveStacks?: number
  } {
    const update: {
      enemyHP?: number
      enemyShields?: number
      enemyArmor?: number
      damageDealt?: { type: string; amount: number }
      burnStacks?: number
      viralStacks?: number
      empStacks?: number
      lagStacks?: number
      displaceStacks?: number
      corrosiveStacks?: number
    } = {}

    const canApplyStatus = !this.state.enemyImmuneToStatus

    if (canApplyStatus && proj.damageType === "corrosive" && proj.statusChance && Math.random() < proj.statusChance) {
      const MAX_CORROSIVE_STACKS = 10 // Allow up to 10 stacks
      const CORROSIVE_DURATION = 999999 // Permanent during battle

      if (enemy.corrosiveStacks.length < MAX_CORROSIVE_STACKS && enemy.armor > 0) {
        // Strip 10% of CURRENT armor value (minimum 1 point)
        const armorStrip = Math.max(1, Math.floor(enemy.armor * 0.1))
        enemy.armor = Math.max(0, enemy.armor - armorStrip)

        console.log(
          `[v0] Corrosive proc! Stripped ${armorStrip} armor. Enemy armor now: ${enemy.armor}/${enemy.maxArmor}`,
        )

        enemy.corrosiveStacks.push({
          endTime: this.battleTime + CORROSIVE_DURATION,
          armorStripped: armorStrip,
        })

        update.enemyArmor = enemy.armor
        update.corrosiveStacks = enemy.corrosiveStacks.length
      }
    }

    // Apply status effects based on damage type
    if (canApplyStatus && proj.damageType === "thermal" && proj.statusChance && Math.random() < proj.statusChance) {
      const MAX_BURN_STACKS = 5
      const BURN_DURATION = 4000
      const BURN_DAMAGE_PER_TICK = 2

      if (enemy.burnStacks.length < MAX_BURN_STACKS) {
        enemy.burnStacks.push({
          damage: BURN_DAMAGE_PER_TICK,
          endTime: this.battleTime + BURN_DURATION,
        })
        update.burnStacks = enemy.burnStacks.length
      }
    }

    if (canApplyStatus && proj.damageType === "viral" && proj.statusChance && Math.random() < proj.statusChance) {
      const MAX_VIRAL_STACKS = 5
      const VIRAL_DURATION = 10000

      if (enemy.viralStacks.length < MAX_VIRAL_STACKS) {
        enemy.viralStacks.push({
          endTime: this.battleTime + VIRAL_DURATION,
        })
        update.viralStacks = enemy.viralStacks.length
      }
    }

    if (canApplyStatus && proj.damageType === "energy" && proj.statusChance && Math.random() < proj.statusChance) {
      const MAX_EMP_STACKS = 5
      const EMP_DURATION = 5000
      const SHIELD_DRAIN_PERCENT = 0.08

      if (enemy.empStacks.length < MAX_EMP_STACKS) {
        if (enemy.shields > 0) {
          const shieldDrain = Math.floor(enemy.shields * SHIELD_DRAIN_PERCENT)
          enemy.shields = Math.max(0, enemy.shields - shieldDrain)
          update.enemyShields = enemy.shields
        }

        enemy.empStacks.push({
          endTime: this.battleTime + EMP_DURATION,
          shieldDrainPercent: SHIELD_DRAIN_PERCENT,
        })
        update.empStacks = enemy.empStacks.length
      }
    }

    if (canApplyStatus && proj.damageType === "glacial" && proj.statusChance && Math.random() < proj.statusChance) {
      const MAX_LAG_STACKS = 5
      const LAG_DURATION = 6000
      const COOLDOWN_INCREASE = 0.15
      const MOVEMENT_REDUCTION = 0.1
      const ACTION_FAILURE_CHANCE = 0.05

      if (enemy.lagStacks.length < MAX_LAG_STACKS) {
        enemy.lagStacks.push({
          endTime: this.battleTime + LAG_DURATION,
          cooldownIncrease: COOLDOWN_INCREASE,
          movementReduction: MOVEMENT_REDUCTION,
          actionFailureChance: ACTION_FAILURE_CHANCE,
        })
        update.lagStacks = enemy.lagStacks.length
      }
    }

    if (canApplyStatus && proj.damageType === "concussion" && proj.statusChance && Math.random() < proj.statusChance) {
      const MAX_DISPLACE_STACKS = 3
      const DISPLACE_DURATION = 5500

      if (enemy.displaceStacks.length < MAX_DISPLACE_STACKS) {
        const stackCount = enemy.displaceStacks.length + 1
        const pushDistance = stackCount >= 2 ? 2 : 1
        const newX = Math.min(5, enemy.position.x + pushDistance)

        if (newX !== enemy.position.x) {
          enemy.position = { ...enemy.position, x: newX }
        }

        enemy.displaceStacks.push({
          endTime: this.battleTime + DISPLACE_DURATION,
          pushDistance: pushDistance,
          corruptMovement: true,
        })
        update.displaceStacks = enemy.displaceStacks.length
      }
    }

    // Apply elemental damage modifiers
    let damage = proj.damage

    if (proj.damageType === "glacial" && enemy.shields > 0) {
      damage = damage * 0.9
    }

    if (proj.damageType === "energy") {
      if (enemy.shields > 0) {
        damage = damage * 2.0
      } else if (enemy.armor > 0) {
        damage = damage * 0.5
      }
    }

    if (proj.damageType === "concussion") {
      if (enemy.shields > 0) {
        damage = damage * 0.9
      } else if (enemy.shields === 0 && enemy.armor === 0) {
        damage = damage * 1.25
      }
    }

    if (enemy.armor > 0) {
      const armorReduction = enemy.armor / (enemy.armor + 300)
      const damageBeforeArmor = damage
      damage = damage * (1 - armorReduction)
      console.log(
        `[v0] Armor reduced damage: ${damageBeforeArmor.toFixed(2)} -> ${damage.toFixed(2)} (${Math.round(armorReduction * 100)}% reduction from ${enemy.armor} armor)`,
      )
    }

    let totalDamageDealt = 0
    let remainingDamage = damage

    // Shields absorb first
    if (enemy.shields > 0) {
      const shieldDamage = Math.min(enemy.shields, remainingDamage)
      enemy.shields = Math.max(0, enemy.shields - shieldDamage)
      totalDamageDealt += shieldDamage
      remainingDamage -= shieldDamage
      update.enemyShields = enemy.shields
    }

    // HP takes remaining damage (amplified by viral)
    if (remainingDamage > 0) {
      const viralMultiplier = this.getViralDamageMultiplier()
      const amplifiedDamage = remainingDamage * viralMultiplier

      enemy.hp = Math.max(0, enemy.hp - amplifiedDamage)
      totalDamageDealt += amplifiedDamage
      update.enemyHP = enemy.hp
    }

    update.damageDealt = {
      type: proj.damageType || "kinetic",
      amount: Math.round(totalDamageDealt * 10) / 10,
    }

    return update
  }

  private getViralDamageMultiplier(): number {
    const amplificationMap = [1.0, 1.2, 1.35, 1.5, 1.75, 2.0]
    const stackCount = this.state.enemies.reduce((sum, e) => sum + e.viralStacks.length, 0)
    return amplificationMap[Math.min(stackCount, 5)]
  }

  getState(): BattleState {
    return { ...this.state }
  }
}
