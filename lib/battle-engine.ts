import type { Position, Projectile, TriggerActionPair, BattleContext, ActionResult, DamageType } from "@/types/game"

interface BurnStack {
  damage: number
  endTime: number
}

interface ViralStack {
  endTime: number
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

export interface BattleState {
  playerPos: Position
  playerHP: number
  enemyPos: Position
  enemyHP: number
  enemyShields: number
  enemyArmor: number
  projectiles: Projectile[]
  justTookDamage: boolean
  enemyBurnStacks: BurnStack[]
  enemyViralStacks: ViralStack[]
  enemyEMPStacks: EMPStack[]
  enemyLagStacks: LagStack[]
  shieldRegenDisabled: boolean
  enemyImmuneToStatus?: boolean // Added status immunity flag for testing
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
  lagStacks?: number // Added lag stacks to battle updates
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
  private lastBurnTick = 0

  constructor(
    initialState: BattleState,
    playerPairs: TriggerActionPair[],
    enemyPairs: TriggerActionPair[],
    playerCustomization?: any,
    enemyCustomization?: any,
  ) {
    console.log("[v0] BattleEngine constructor - playerPairs count:", playerPairs.length)
    console.log(
      "[v0] BattleEngine constructor - playerPairs:",
      playerPairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
    )
    console.log("[v0] BattleEngine constructor - enemyPairs count:", enemyPairs.length)

    this.state = {
      ...initialState,
      enemyBurnStacks: initialState.enemyBurnStacks || [],
      enemyViralStacks: initialState.enemyViralStacks || [],
      enemyEMPStacks: initialState.enemyEMPStacks || [],
      enemyLagStacks: initialState.enemyLagStacks || [], // Initialize Lag stacks
      shieldRegenDisabled: initialState.shieldRegenDisabled || false,
      enemyImmuneToStatus: initialState.enemyImmuneToStatus || false, // Initialize status immunity flag
    }
    this.playerPairs = [...playerPairs].sort((a, b) => b.priority - a.priority)
    this.enemyPairs = [...enemyPairs].sort((a, b) => b.priority - a.priority)

    console.log(
      "[v0] BattleEngine constructor - sorted playerPairs:",
      this.playerPairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
    )

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
        time: Math.floor(this.battleTime / 1000),
        playerHP: this.state.playerHP,
        enemyHP: this.state.enemyHP,
      })
      this.lastHistoryRecord = this.battleTime
    }

    if (this.battleTime - this.lastBurnTick >= 500) {
      this.lastBurnTick = this.battleTime
      const burnDamage = this.processBurnDamage()
      if (burnDamage > 0) {
        update.enemyHP = this.state.enemyHP
        update.burnStacks = this.state.enemyBurnStacks.length
      }
    }

    this.state.enemyBurnStacks = this.state.enemyBurnStacks.filter((stack) => stack.endTime > this.battleTime)
    this.state.enemyViralStacks = this.state.enemyViralStacks.filter((stack) => stack.endTime > this.battleTime)
    this.state.enemyEMPStacks = this.state.enemyEMPStacks.filter((stack) => stack.endTime > this.battleTime)
    this.state.enemyLagStacks = this.state.enemyLagStacks.filter((stack) => stack.endTime > this.battleTime)

    this.state.shieldRegenDisabled = this.state.enemyEMPStacks.length > 0

    update.burnStacks = this.state.enemyBurnStacks.length
    update.viralStacks = this.state.enemyViralStacks.length
    update.empStacks = this.state.enemyEMPStacks.length
    update.lagStacks = this.state.enemyLagStacks.length // Update lag stack count

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

    const playerAction = this.executeAI(this.playerPairs, true, deltaTime)
    if (playerAction) {
      const actionUpdate = this.applyAction(playerAction, true)
      Object.assign(update, actionUpdate)
      update.pairExecuted = {
        triggerId: playerAction.triggerId,
        actionId: playerAction.actionId,
      }
    }

    const enemyAction = this.executeAI(this.enemyPairs, false, deltaTime)
    if (enemyAction) {
      const actionUpdate = this.applyAction(enemyAction, false)
      Object.assign(update, actionUpdate)
      update.pairExecuted = {
        triggerId: enemyAction.triggerId,
        actionId: enemyAction.actionId,
      }
    }

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

  private executeAI(pairs: TriggerActionPair[], isPlayer: boolean, deltaTime: number): ActionResult | null {
    const context: BattleContext = {
      playerPos: this.state.playerPos,
      enemyPos: this.state.enemyPos,
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

  private getLagCooldownMultiplier(isEnemy: boolean): number {
    if (!isEnemy || this.state.enemyLagStacks.length === 0) return 1.0

    const lagStacks = this.state.enemyLagStacks.length
    // Each stack adds 15% cooldown increase
    return 1.0 + lagStacks * 0.15
  }

  private applyAction(action: ActionResult, isPlayer: boolean): BattleUpdate {
    const update: BattleUpdate = {}

    switch (action.type) {
      case "shoot":
        const baseDamage = action.damage || 10
        const projectile = this.createProjectile(isPlayer, baseDamage, action.damageType, action.statusChance)
        this.state.projectiles.push(projectile)
        update.projectiles = [...this.state.projectiles]
        break

      case "rapid-fire":
        const count = action.count || 3
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const proj = this.createProjectile(isPlayer, action.damage || 5, action.damageType, action.statusChance)
            this.state.projectiles.push(proj)
          }, i * 200)
        }
        break

      case "cluster":
        const clusterCount = action.count || 3
        for (let i = 0; i < clusterCount; i++) {
          setTimeout(() => {
            const proj = this.createProjectile(isPlayer, action.damage || 25, action.damageType, action.statusChance)
            this.state.projectiles.push(proj)
          }, i * 300)
        }
        break

      case "bomb":
        setTimeout(() => {
          const proj = this.createProjectile(isPlayer, action.damage || 35, action.damageType, action.statusChance)
          this.state.projectiles.push(proj)
        }, action.delay || 1000)
        break

      case "wave":
        const waveProj = this.createProjectile(isPlayer, action.damage || 18, action.damageType, action.statusChance)
        this.state.projectiles.push(waveProj)
        break

      case "spread":
        const targetPos = isPlayer ? this.state.playerPos : this.state.enemyPos
        for (let y = 0; y < 3; y++) {
          const spreadProj = this.createProjectile(
            isPlayer,
            action.damage || 12,
            action.damageType,
            action.statusChance,
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
        )
        this.state.projectiles.push(piercingProj)
        break

      case "homing":
        const homingProj = this.createProjectile(isPlayer, action.damage || 20, action.damageType, action.statusChance)
        this.state.projectiles.push(homingProj)
        break

      case "drain":
        const drainProj = this.createProjectile(isPlayer, action.damage || 15, action.damageType, action.statusChance)
        this.state.projectiles.push(drainProj)
        if (isPlayer) {
          const newHP = Math.min(this.state.playerHP + (action.heal || 10), 100)
          this.state.playerHP = newHP
          update.playerHP = newHP
        }
        break

      case "melee":
      case "wide-melee":
        const attackerPos = isPlayer ? this.state.playerPos : this.state.enemyPos
        const targetPos2 = isPlayer ? this.state.enemyPos : this.state.playerPos
        const distance = Math.abs(attackerPos.x - targetPos2.x)
        if (distance <= (action.range || 1)) {
          const meleeProj = this.createProjectile(isPlayer, action.damage || 35, action.damageType, action.statusChance)
          this.state.projectiles.push(meleeProj)
        }
        break

      case "dash-attack":
        if (action.position) {
          if (isPlayer) {
            this.state.playerPos = action.position
            update.playerPos = action.position
          } else {
            this.state.enemyPos = action.position
            update.enemyPos = action.position
          }
        }
        const dashProj = this.createProjectile(isPlayer, action.damage || 15, action.damageType, action.statusChance)
        this.state.projectiles.push(dashProj)
        break

      case "retreat-shot":
        if (action.position) {
          if (isPlayer) {
            this.state.playerPos = action.position
            update.playerPos = action.position
          } else {
            this.state.enemyPos = action.position
            update.enemyPos = action.position
          }
        }
        const retreatProj = this.createProjectile(isPlayer, action.damage || 12, action.damageType, action.statusChance)
        this.state.projectiles.push(retreatProj)
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

      case "heal-over-time":
        const hotDuration = action.duration || 5000
        const hotTicks = Math.floor(hotDuration / 1000)
        for (let i = 0; i < hotTicks; i++) {
          setTimeout(() => {
            if (isPlayer) {
              const newHP = Math.min(this.state.playerHP + (action.healPerTick || 3), 100)
              this.state.playerHP = newHP
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
  ): Projectile {
    let adjustedDamage = damage

    if (!isPlayer) {
      const damageScale = Math.min(1.0, 0.6 + (this.battleTime / 60000) * 0.1)
      adjustedDamage = Math.floor(damage * damageScale)
    }

    const pos = isPlayer ? this.state.playerPos : this.state.enemyPos
    return {
      id: `proj-${this.projectileIdCounter++}`,
      position: { ...pos },
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
    enemyHP?: number
    enemyShields?: number
    enemyArmor?: number
    damageDealt?: { type: string; amount: number }
    burnStacks?: number
    viralStacks?: number
    empStacks?: number
    lagStacks?: number
  } {
    const update: {
      playerHP?: number
      enemyHP?: number
      enemyShields?: number
      enemyArmor?: number
      damageDealt?: { type: string; amount: number }
      burnStacks?: number
      viralStacks?: number
      empStacks?: number
      lagStacks?: number
    } = {}
    const remainingProjectiles: Projectile[] = []

    for (const proj of this.state.projectiles) {
      let hit = false

      if (
        proj.direction === "left" &&
        Math.abs(proj.position.x - this.state.playerPos.x) < 0.6 &&
        proj.position.y === this.state.playerPos.y
      ) {
        this.state.playerHP = Math.max(0, this.state.playerHP - proj.damage)
        update.playerHP = this.state.playerHP
        hit = true
      }

      if (
        proj.direction === "right" &&
        Math.abs(proj.position.x - this.state.enemyPos.x) < 0.6 &&
        proj.position.y === this.state.enemyPos.y
      ) {
        const canApplyStatus = !this.state.enemyImmuneToStatus

        if (
          canApplyStatus &&
          proj.damageType === "corrosive" &&
          proj.statusChance &&
          Math.random() < proj.statusChance
        ) {
          const armorStrip = Math.max(1, Math.floor(this.state.enemyArmor * 0.1))
          if (this.state.enemyArmor > 0) {
            this.state.enemyArmor = Math.max(0, this.state.enemyArmor - armorStrip)
            update.enemyArmor = this.state.enemyArmor
          }
        }

        if (canApplyStatus && proj.damageType === "thermal" && proj.statusChance && Math.random() < proj.statusChance) {
          const MAX_BURN_STACKS = 5
          const BURN_DURATION = 4000
          const BURN_DAMAGE_PER_TICK = 2

          if (this.state.enemyBurnStacks.length < MAX_BURN_STACKS) {
            this.state.enemyBurnStacks.push({
              damage: BURN_DAMAGE_PER_TICK,
              endTime: this.battleTime + BURN_DURATION,
            })
            update.burnStacks = this.state.enemyBurnStacks.length
          }
        }

        if (canApplyStatus && proj.damageType === "viral" && proj.statusChance && Math.random() < proj.statusChance) {
          const MAX_VIRAL_STACKS = 5
          const VIRAL_DURATION = 10000

          if (this.state.enemyViralStacks.length < MAX_VIRAL_STACKS) {
            this.state.enemyViralStacks.push({
              endTime: this.battleTime + VIRAL_DURATION,
            })
            update.viralStacks = this.state.enemyViralStacks.length
          }
        }

        if (canApplyStatus && proj.damageType === "energy" && proj.statusChance && Math.random() < proj.statusChance) {
          const MAX_EMP_STACKS = 5
          const EMP_DURATION = 5000 // 5 seconds
          const SHIELD_DRAIN_PERCENT = 0.08 // 8% of current shields per proc

          if (this.state.enemyEMPStacks.length < MAX_EMP_STACKS) {
            if (this.state.enemyShields > 0) {
              const shieldDrain = Math.floor(this.state.enemyShields * SHIELD_DRAIN_PERCENT)
              this.state.enemyShields = Math.max(0, this.state.enemyShields - shieldDrain)
              update.enemyShields = this.state.enemyShields
            }

            this.state.enemyEMPStacks.push({
              endTime: this.battleTime + EMP_DURATION,
              shieldDrainPercent: SHIELD_DRAIN_PERCENT,
            })
            update.empStacks = this.state.enemyEMPStacks.length
          }
        }

        if (canApplyStatus && proj.damageType === "glacial" && proj.statusChance && Math.random() < proj.statusChance) {
          const MAX_LAG_STACKS = 5
          const LAG_DURATION = 6000 // 6 seconds
          const COOLDOWN_INCREASE = 0.15 // 15% per stack
          const MOVEMENT_REDUCTION = 0.1 // 10% per stack (for future implementation)
          const ACTION_FAILURE_CHANCE = 0.05 // 5% per stack

          if (this.state.enemyLagStacks.length < MAX_LAG_STACKS) {
            this.state.enemyLagStacks.push({
              endTime: this.battleTime + LAG_DURATION,
              cooldownIncrease: COOLDOWN_INCREASE,
              movementReduction: MOVEMENT_REDUCTION,
              actionFailureChance: ACTION_FAILURE_CHANCE,
            })
            update.lagStacks = this.state.enemyLagStacks.length
            console.log(`[v0] Applied Lag stack (${this.state.enemyLagStacks.length}/${MAX_LAG_STACKS})`)
          }
        }

        let damage = proj.damage

        if (proj.damageType === "glacial") {
          if (this.state.enemyShields > 0) {
            damage = damage * 0.9 // 10% penalty against shields
          }
          // Moderate (100%) damage against armor and HP - no modification needed
        }

        if (proj.damageType === "energy") {
          if (this.state.enemyShields > 0) {
            damage = damage * 2.0
          } else if (this.state.enemyArmor > 0) {
            damage = damage * 0.5
          }
        }

        if (this.state.enemyArmor > 0) {
          const armorReduction = this.state.enemyArmor / (this.state.enemyArmor + 300)
          damage = damage * (1 - armorReduction)
        }

        let totalDamageDealt = 0
        let remainingDamage = damage

        if (this.state.enemyShields > 0) {
          const shieldDamage = Math.min(this.state.enemyShields, remainingDamage)
          this.state.enemyShields = Math.max(0, this.state.enemyShields - shieldDamage)
          totalDamageDealt += shieldDamage
          remainingDamage -= shieldDamage
          update.enemyShields = this.state.enemyShields
        }

        if (remainingDamage > 0) {
          const viralMultiplier = this.getViralDamageMultiplier()
          const amplifiedDamage = remainingDamage * viralMultiplier

          this.state.enemyHP = Math.max(0, this.state.enemyHP - amplifiedDamage)
          totalDamageDealt += amplifiedDamage
          update.enemyHP = this.state.enemyHP
        }

        update.damageDealt = {
          type: proj.damageType || "kinetic",
          amount: Math.round(totalDamageDealt * 10) / 10,
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

  private getViralDamageMultiplier(): number {
    const stackCount = this.state.enemyViralStacks.length
    if (stackCount === 0) return 1.0

    const amplificationMap = [1.0, 1.2, 1.35, 1.5, 1.75, 2.0]
    return amplificationMap[Math.min(stackCount, 5)]
  }

  getState(): BattleState {
    return { ...this.state }
  }
}
