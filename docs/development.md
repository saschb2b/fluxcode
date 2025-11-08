# Development Guide

This guide covers how to extend Battle Protocol with new triggers, actions, and character classes.

## Adding New Triggers

Triggers are conditions that determine when a protocol should activate.

### 1. Define the Trigger

Open `lib/triggers.ts` and add your trigger to the `AVAILABLE_TRIGGERS` array:

\`\`\`typescript
{
  id: 'my-custom-trigger',
  name: 'My Custom Trigger',
  description: 'Activates when [specific condition] is met',
  check: (context: BattleContext) => {
    // Return true when the condition is met
    return context.playerHP < 50
  }
}
\`\`\`

### 2. Battle Context

The `context` parameter provides access to all battle state:

\`\`\`typescript
interface BattleContext {
  playerPos: Position        // Player position {x, y}
  enemyPos: Position         // Enemy position {x, y}
  playerHP: number           // Current player HP
  enemyHP: number            // Current enemy HP
  maxPlayerHP: number        // Maximum player HP
  maxEnemyHP: number         // Maximum enemy HP
  projectiles: Projectile[]  // Active projectiles
  lastDamageTaken: number    // Damage from last hit
  turnCount: number          // Number of turns elapsed
}
\`\`\`

### 3. Example Triggers

**Position-based:**
\`\`\`typescript
{
  id: 'in-same-row',
  name: 'In Same Row',
  description: 'Triggers when player and enemy are in the same row',
  check: (context) => context.playerPos.y === context.enemyPos.y
}
\`\`\`

**HP-based:**
\`\`\`typescript
{
  id: 'low-health',
  name: 'Low Health',
  description: 'Triggers when HP is below 30%',
  check: (context) => context.playerHP / context.maxPlayerHP < 0.3
}
\`\`\`

**Distance-based:**
\`\`\`typescript
{
  id: 'enemy-close',
  name: 'Enemy Close',
  description: 'Triggers when enemy is within 2 tiles',
  check: (context) => {
    const dx = Math.abs(context.playerPos.x - context.enemyPos.x)
    const dy = Math.abs(context.playerPos.y - context.enemyPos.y)
    return dx + dy <= 2
  }
}
\`\`\`

## Adding New Actions

Actions define what your fighter does when a protocol activates.

### 1. Define the Action

Open `lib/actions.ts` and add your action to the `AVAILABLE_ACTIONS` array:

\`\`\`typescript
{
  id: 'my-custom-action',
  name: 'My Custom Action',
  description: 'Does something awesome',
  cooldown: 1000, // Milliseconds between uses
  execute: (context: BattleContext) => {
    // Return the changes to apply to game state
    return {
      playerPos: { x: context.playerPos.x + 1, y: context.playerPos.y },
      projectiles: [{
        position: context.playerPos,
        velocity: { x: 1, y: 0 },
        damage: 15,
        isPlayerProjectile: true
      }]
    }
  }
}
\`\`\`

### 2. Return Values

Actions can modify:
- `playerPos` - New player position
- `enemyPos` - New enemy position
- `projectiles` - Array of new projectiles to spawn
- `playerHP` - Heal/damage player
- `enemyHP` - Damage enemy directly
- `statusEffects` - Apply buffs/debuffs

### 3. Example Actions

**Movement:**
\`\`\`typescript
{
  id: 'move-forward',
  name: 'Move Forward',
  description: 'Move one tile toward enemy',
  cooldown: 500,
  execute: (context) => ({
    playerPos: {
      x: Math.min(context.playerPos.x + 1, 4),
      y: context.playerPos.y
    }
  })
}
\`\`\`

**Attack:**
\`\`\`typescript
{
  id: 'fire-projectile',
  name: 'Fire Projectile',
  description: 'Shoot a projectile at enemy',
  cooldown: 1000,
  execute: (context) => ({
    projectiles: [{
      position: { ...context.playerPos },
      velocity: { x: 1, y: 0 },
      damage: 20,
      isPlayerProjectile: true
    }]
  })
}
\`\`\`

**Healing:**
\`\`\`typescript
{
  id: 'heal',
  name: 'Heal',
  description: 'Restore 20 HP',
  cooldown: 3000,
  execute: (context) => ({
    playerHP: Math.min(context.playerHP + 20, context.maxPlayerHP)
  })
}
\`\`\`

## Adding New Character Classes

Character classes define starting protocols and unlocked abilities.

### 1. Define the Character

Open `lib/character-presets.ts` and add your character to the `CHARACTER_PRESETS` array:

\`\`\`typescript
{
  id: 'my-class',
  name: 'My Class',
  description: 'Brief description of playstyle and strategy',
  color: '#ff00ff', // Primary color for UI theming
  startingPairs: [
    {
      trigger: AVAILABLE_TRIGGERS[0],
      action: AVAILABLE_ACTIONS[5],
      priority: 3
    },
    // Add 3-4 starting protocols
  ],
  startingTriggers: [0, 5, 11, 19], // Indices of unlocked triggers
  startingActions: [0, 1, 6, 10, 15] // Indices of unlocked actions
}
\`\`\`

### 2. Design Considerations

**Starting Protocols:**
- Should create a functional, playable fighter
- Demonstrate the character's core strategy
- 3-4 protocols is optimal (not too complex)

**Unlocked Abilities:**
- 4-5 triggers and 5-6 actions is a good starting point
- Should support the character's intended playstyle
- Leave room for progression and unlocks

### 3. Example Character

\`\`\`typescript
{
  id: 'tank',
  name: 'Fortress',
  description: 'Defensive powerhouse with high HP and barriers',
  color: '#4a9eff',
  startingPairs: [
    {
      trigger: AVAILABLE_TRIGGERS.find(t => t.id === 'low-health'),
      action: AVAILABLE_ACTIONS.find(a => a.id === 'heal'),
      priority: 3
    },
    {
      trigger: AVAILABLE_TRIGGERS.find(t => t.id === 'enemy-close'),
      action: AVAILABLE_ACTIONS.find(a => a.id === 'move-back'),
      priority: 2
    },
    {
      trigger: AVAILABLE_TRIGGERS.find(t => t.id === 'in-same-row'),
      action: AVAILABLE_ACTIONS.find(a => a.id === 'fire-projectile'),
      priority: 1
    }
  ],
  startingTriggers: [0, 5, 8, 11],
  startingActions: [0, 1, 6, 10, 15]
}
\`\`\`

## Modifying Battle Logic

### Battle Engine

**Location**: `lib/battle-engine.ts`

Key methods to understand:

\`\`\`typescript
class BattleEngine {
  // Main game loop - called every frame
  update(deltaTime: number): void

  // Evaluates protocols and executes actions
  executeAI(isPlayer: boolean): void

  // Moves fighters based on actions
  updatePositions(deltaTime: number): void

  // Updates projectile positions
  updateProjectiles(deltaTime: number): void

  // Checks for projectile hits
  checkCollisions(): void
}
\`\`\`

### Game Balance

Key balance parameters and where to find them:

**Action Cooldowns**
- Location: `lib/actions.ts`
- Adjust the `cooldown` property (in milliseconds)
- Typical range: 500ms (spam) to 5000ms (ultimate)

**Action Damage**
- Location: `lib/actions.ts`
- In the action's `execute` function
- Typical range: 5 (weak) to 50 (strong)

**Fighter HP**
- Location: `hooks/use-game-state.ts`
- Player max HP: Line ~130
- Enemy HP scaling: `continueToNextWave` function

**Movement Speed**
- Location: `lib/battle-engine.ts`
- Adjust `movementSpeed` constant
- Default: 2 units per second

## Testing Your Changes

### Quick Test Checklist

1. **Trigger Testing**
   - Create a protocol with your trigger
   - Verify it activates at the right time
   - Check it doesn't activate when it shouldn't

2. **Action Testing**
   - Assign action to a protocol
   - Verify visual effect appears
   - Check cooldown works correctly
   - Confirm damage/effect values

3. **Character Testing**
   - Select the character
   - Verify starting protocols work
   - Check unlocked abilities appear
   - Test through 5+ waves

### Debug Tools

Add console logs with the `[v0]` prefix:

\`\`\`typescript
console.log('[v0] Trigger activated:', triggerId)
console.log('[v0] Action executed:', actionId, 'Cooldown:', cooldown)
console.log('[v0] Battle state:', battleEngine.getState())
\`\`\`

## Best Practices

1. **Trigger Design**
   - Keep checks simple and fast
   - Avoid complex calculations
   - Use clear, descriptive names

2. **Action Design**
   - Balance cooldown with power
   - Provide visual feedback
   - Consider counterplay options

3. **Character Design**
   - Give each class a clear identity
   - Ensure starting protocols are functional
   - Support multiple viable strategies

4. **Performance**
   - Avoid creating too many projectiles
   - Keep trigger checks O(1) when possible
   - Batch state updates
