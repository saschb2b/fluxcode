import type { Position, Projectile, TriggerActionPair, BattleContext, ActionResult } from "@/types/game"

export interface BattleState {
  playerPos: Position
  playerHP: number
  enemyPos: Position
  enemyHP: number
  enemyShields: number
  enemyArmor: number
  projectiles: Projectile[]
  justTookDamage: boolean
}

export interface BattleHistoryPoint {
  time: number
  playerHP: number
  enemyHP: number
}

export interface BattleUpdate {
  playerPos?: Position
  playerHP?: number
  enemyPos?: Position
  enemyHP?: number
  projectiles?: Projectile[]
  justTookDamage?: boolean
  battleOver?: boolean
  playerWon?: boolean
  battleHistory?: BattleHistoryPoint[]
  damageDealt?: { type: string; amount: number }
  pairExecuted?: { triggerId: string; actionId: string }
}

export class BattleEngine {
  private state: BattleState
  private playerPairs: TriggerActionPair[]
  private enemyPairs: TriggerActionPair[]
  private actionCooldowns: Map<string, number> = new Map()
  private projectileIdCounter = 0
  private battleHistory: BattleHistoryPoint[] = []
  private battleTime = 0
  private lastHistoryRecord = 0
  private playerCustomization: any
  private enemyCustomization: any

  constructor(
    initialState: BattleState,
    playerPairs: TriggerActionPair[],
    enemyPairs: TriggerActionPair[],
    playerCustomization?: any,
    enemyCustomization?: any,
  ) {
    this.state = { ...initialState }
    this.playerPairs = [...playerPairs].sort((a, b) => b.priority - a.priority)
    this.enemyPairs = [...enemyPairs].sort((a, b) => b.priority - a.priority)
    this.playerCustomization = playerCustomization
    this.enemyCustomization = enemyCustomization
    this.battleHistory.push({
      time: 0,
      playerHP: initialState.playerHP,
      enemyHP: initialState.enemyHP,
    })
  }

  // Main battle tick - called every frame
  tick(deltaTime: number): BattleUpdate {
    const update: BattleUpdate = {}

    this.battleTime += deltaTime
    if (this.battleTime - this.lastHistoryRecord >= 500) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000), // Convert to seconds
        playerHP: this.state.playerHP,
        enemyHP: this.state.enemyHP,
      })
      this.lastHistoryRecord = this.battleTime
    }

    const newProjectiles = this.updateProjectiles(deltaTime)
    update.projectiles = newProjectiles
    this.state.projectiles = newProjectiles

    // Check for hits
    const hitUpdate = this.checkProjectileHits()
    if (hitUpdate.playerHP !== undefined) {
      update.playerHP = hitUpdate.playerHP
      this.state.playerHP = hitUpdate.playerHP
      update.justTookDamage = true
      this.state.justTookDamage = true
    }
    if (hitUpdate.enemyHP !== undefined) {
      update.enemyHP = hitUpdate.enemyHP
      this.state.enemyHP = hitUpdate.enemyHP
    }
    if (hitUpdate.enemyShields !== undefined) {
      update.enemyShields = hitUpdate.enemyShields
      this.state.enemyShields = hitUpdate.enemyShields
    }
    if (hitUpdate.enemyArmor !== undefined) {
      update.enemyArmor = hitUpdate.enemyArmor
      this.state.enemyArmor = hitUpdate.enemyArmor
    }
    if (hitUpdate.damageDealt !== undefined) {
      update.damageDealt = hitUpdate.damageDealt
    }

    // Check for battle end
    if (this.state.playerHP <= 0) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: 0,
        enemyHP: this.state.enemyHP,
      })
      update.battleOver = true
      update.playerWon = false
      update.battleHistory = this.battleHistory
      return update
    }
    if (this.state.enemyHP <= 0) {
      this.battleHistory.push({
        time: Math.floor(this.battleTime / 1000),
        playerHP: this.state.playerHP,
        enemyHP: 0,
      })
      update.battleOver = true
      update.playerWon = true
      update.battleHistory = this.battleHistory
      return update
    }

    // Execute player AI
    const playerAction = this.executeAI(this.playerPairs, true, deltaTime)
    if (playerAction) {
      const actionUpdate = this.applyAction(playerAction, true)
      Object.assign(update, actionUpdate)
      update.pairExecuted = {
        triggerId: playerAction.triggerId,
        actionId: playerAction.actionId,
      }
    }

    // Execute enemy AI
    const enemyAction = this.executeAI(this.enemyPairs, false, deltaTime)
    if (enemyAction) {
      const actionUpdate = this.applyAction(enemyAction, false)
      Object.assign(update, actionUpdate)
      update.pairExecuted = {
        triggerId: enemyAction.triggerId,
        actionId: enemyAction.actionId,
      }
    }

    // Reset damage flag after processing
    if (this.state.justTookDamage) {
      this.state.justTookDamage = false
      update.justTookDamage = false
    }

    return update
  }

  private executeAI(pairs: TriggerActionPair[], isPlayer: boolean, deltaTime: number): ActionResult | null {
    const context: BattleContext = {
      playerPos: this.state.playerPos,
      enemyPos: this.state.enemyPos,
      playerHP: this.state.playerHP,
      enemyHP: this.state.enemyHP,
      justTookDamage: this.state.justTookDamage,
      isPlayer,
    }

    // Update cooldowns
    this.actionCooldowns.forEach((time, key) => {
      const newTime = time - deltaTime
      if (newTime <= 0) {
        this.actionCooldowns.delete(key)
      } else {
        this.actionCooldowns.set(key, newTime)
      }
    })

    // Find first matching trigger-action pair that's not on cooldown
    for (const pair of pairs) {
      const cooldownKey = `${isPlayer ? "player" : "enemy"}-${pair.action.id}`

      if (this.actionCooldowns.has(cooldownKey)) {
        continue // Action is on cooldown
      }

      if (pair.trigger.check(context)) {
        // Trigger matched! Execute action
        this.actionCooldowns.set(cooldownKey, pair.action.cooldown)
        return { ...pair.action.execute(context), triggerId: pair.trigger.id, actionId: pair.action.id }
      }
    }

    return null
  }

  private applyAction(action: ActionResult, isPlayer: boolean): BattleUpdate {
    const update: BattleUpdate = {}

    switch (action.type) {
      case "shoot":
        const baseDamage = action.damage || 10
        const projectile = this.createProjectile(isPlayer, baseDamage)
        this.state.projectiles.push(projectile)
        update.projectiles = [...this.state.projectiles]
        break

      case "rapid-fire":
        const count = action.count || 3
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const proj = this.createProjectile(isPlayer, action.damage || 5)
            this.state.projectiles.push(proj)
          }, i * 200)
        }
        break

      case "move":
        if (action.position) {
          if (isPlayer) {
            this.state.playerPos = action.position
            update.playerPos = action.position
          } else {
            this.state.enemyPos = action.position
            update.enemyPos = action.position
          }
        }
        break

      case "heal":
        if (isPlayer) {
          const newHP = Math.min(this.state.playerHP + (action.amount || 20), 100)
          this.state.playerHP = newHP
          update.playerHP = newHP
        } else {
          const newHP = Math.min(this.state.enemyHP + (action.amount || 20), 100)
          this.state.enemyHP = newHP
          update.enemyHP = newHP
        }
        break
    }

    return update
  }

  private createProjectile(isPlayer: boolean, damage: number): Projectile {
    // Player damage stays the same, but enemy damage scales down early
    let adjustedDamage = damage

    if (!isPlayer) {
      // Enemy projectiles: start at 60% damage, scale up to 100% by wave 5
      // This gives players breathing room to learn
      const damageScale = Math.min(1.0, 0.6 + (this.battleTime / 60000) * 0.1) // 0.6 to 1.0 over time
      adjustedDamage = Math.floor(damage * damageScale)
    }

    const pos = isPlayer ? this.state.playerPos : this.state.enemyPos
    return {
      id: `proj-${this.projectileIdCounter++}`,
      position: { ...pos },
      direction: isPlayer ? "right" : "left",
      damage: adjustedDamage,
      damageType: "kinetic", // Default damage type
    }
  }

  private updateProjectiles(deltaTime: number): Projectile[] {
    const speed = 0.08 * (deltaTime / 16) // Much faster projectiles

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
    enemyHP?: number
    enemyShields?: number
    enemyArmor?: number
    damageDealt?: { type: string; amount: number }
  } {
    const update: {
      playerHP?: number
      enemyHP?: number
      enemyShields?: number
      enemyArmor?: number
      damageDealt?: { type: string; amount: number }
    } = {}
    const remainingProjectiles: Projectile[] = []

    for (const proj of this.state.projectiles) {
      let hit = false

      // Check player hit
      if (
        proj.direction === "left" &&
        Math.abs(proj.position.x - this.state.playerPos.x) < 0.6 &&
        proj.position.y === this.state.playerPos.y
      ) {
        this.state.playerHP = Math.max(0, this.state.playerHP - proj.damage)
        update.playerHP = this.state.playerHP
        hit = true
      }

      // Check enemy hit
      if (
        proj.direction === "right" &&
        Math.abs(proj.position.x - this.state.enemyPos.x) < 0.6 &&
        proj.position.y === this.state.enemyPos.y
      ) {
        let remainingDamage = proj.damage

        // Apply to shields first
        if (this.state.enemyShields > 0) {
          const shieldDamage = Math.min(this.state.enemyShields, remainingDamage)
          this.state.enemyShields = Math.max(0, this.state.enemyShields - shieldDamage)
          remainingDamage -= shieldDamage
          update.enemyShields = this.state.enemyShields
        }

        // Apply remaining damage to armor
        if (remainingDamage > 0 && this.state.enemyArmor > 0) {
          const armorDamage = Math.min(this.state.enemyArmor, remainingDamage)
          this.state.enemyArmor = Math.max(0, this.state.enemyArmor - armorDamage)
          remainingDamage -= armorDamage
          update.enemyArmor = this.state.enemyArmor
        }

        // Apply remaining damage to HP
        if (remainingDamage > 0) {
          this.state.enemyHP = Math.max(0, this.state.enemyHP - remainingDamage)
          update.enemyHP = this.state.enemyHP
        }

        update.damageDealt = {
          type: proj.damageType || "kinetic",
          amount: proj.damage,
        }
        hit = true
      }

      if (!hit) {
        remainingProjectiles.push(proj)
      }
    }

    this.state.projectiles = remainingProjectiles
    return update
  }

  getState(): BattleState {
    return { ...this.state }
  }
}
