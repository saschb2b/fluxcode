export interface Position {
  x: number // 0-5 (grid columns)
  y: number // 0-2 (grid rows)
}

export interface Fighter {
  position: Position
  hp: number
  maxHp: number
}

export interface Projectile {
  id: string
  position: Position
  direction: "left" | "right"
  damage: number
}

export interface Trigger {
  id: string
  name: string
  description: string
  check: (context: BattleContext) => boolean
}

export interface Action {
  id: string
  name: string
  description: string
  cooldown: number
  execute: (context: BattleContext) => ActionResult
}

export interface ActionResult {
  type: "shoot" | "move" | "rapid-fire" | "heal"
  damage?: number
  position?: Position
  count?: number
  amount?: number
}

export interface TriggerActionPair {
  trigger: Trigger
  action: Action
  priority: number
  lastExecuted?: number
}

export interface BattleContext {
  playerPos: Position
  enemyPos: Position
  playerHP: number
  enemyHP: number
  justTookDamage: boolean
  isPlayer: boolean
}

export interface CharacterPreset {
  id: string
  name: string
  description: string
  playstyle: string
  color: string
  startingPairs: TriggerActionPair[]
  startingTriggers: Trigger[]
  startingActions: Action[]
}

export interface GameState {
  battleState: "idle" | "fighting" | "victory" | "defeat"
  wave: number
  player: Fighter
  enemy: Fighter
  projectiles: Projectile[]
  triggerActionPairs: TriggerActionPair[]
  unlockedTriggers: Trigger[]
  unlockedActions: Action[]
  startBattle: () => void
  nextWave: () => void
  resetGame: () => void
  addTriggerActionPair: (trigger: Trigger, action: Action) => void
  removeTriggerActionPair: (index: number) => void
  updatePairPriority: (index: number, priority: number) => void
  showRewardSelection: boolean
  availableRewardTriggers: Trigger[]
  availableRewardActions: Action[]
  selectRewardTrigger: (trigger: Trigger) => void
  selectRewardAction: (action: Action) => void
  selectedCharacter: CharacterPreset | null
  setCharacter: (character: CharacterPreset) => void
}
