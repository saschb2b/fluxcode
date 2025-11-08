# Battle Protocol

A tactical combat game inspired by Megaman Battle Network and Final Fantasy XII's Gambit system. Program your fighter with custom AI protocols using trigger-action pairs, unlock new abilities, and battle through waves of increasingly difficult enemies in a cyberpunk 3D arena.

## 🎮 Game Concept

Battle Protocol combines strategic AI programming with real-time tactical combat. Instead of directly controlling your fighter, you create a set of "protocols" (IF-THEN rules) that determine how your fighter behaves in battle. The challenge lies in creating an optimal set of protocols that can handle various combat situations.

### Core Gameplay Loop

1. **Character Selection** - Choose from 8 unique fighter classes, each with different starting protocols and playstyles
2. **Protocol Programming** - Create trigger-action pairs that define your fighter's AI behavior
3. **Battle** - Watch your fighter execute your protocols in real-time 3D combat
4. **Progression** - Defeat enemies to unlock new triggers and actions, expanding your strategic options
5. **Wave Survival** - Battle through increasingly difficult waves with smarter enemies and higher HP

## ✨ Features

### Protocol System
- **23 Triggers** - Conditions that check game state (HP, position, distance, row alignment, etc.)
- **37 Actions** - Commands your fighter can execute (attacks, movement, healing, buffs, etc.)
- **Priority System** - Protocols are evaluated from highest to lowest priority
- **Cooldown Management** - Each action has a cooldown to balance power and frequency

### Character Classes
- **Assault** - Aggressive forward fighter with power shots
- **Guardian** - Defensive healer with barriers and regeneration
- **Sniper** - Long-range precision fighter with charge shots
- **Berserker** - High-risk glass cannon with rapid fire
- **Tactician** - Balanced adaptive fighter with positioning focus
- **Speedster** - Lightning-fast mobility with dodging
- **Bomber** - Area control with delayed explosives
- **Duelist** - Counter-based reactive melee fighter

### Visual Features
- **3D Battle Arena** - Real-time 3D combat with smooth animations
- **Cyberpunk Aesthetic** - Neon colors, data streams, CRT scanlines
- **Dynamic Camera** - Follows the action with smooth transitions
- **Particle Effects** - Projectiles, explosions, and visual feedback
- **Codex System** - Browse all triggers and actions with 3D visualizations

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **3D Graphics**: React Three Fiber (@react-three/fiber, @react-three/drei)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks (useState, useCallback, useRef)
- **Deployment**: Vercel

## 📁 Project Structure

\`\`\`
battle-protocol/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Main game orchestrator (start → character → game)
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   ├── battle-arena.tsx    # 3D battle scene with fighters and projectiles
│   ├── battle-grid.tsx     # 3D grid floor visualization
│   ├── character-selection.tsx  # Character class selection screen
│   ├── codex.tsx           # Encyclopedia of triggers/actions
│   ├── cyberpunk-background.tsx # Animated 3D background elements
│   ├── fighter.tsx         # 3D fighter model with smooth movement
│   ├── game-ui.tsx         # Main game HUD and UI overlay
│   ├── programming-panel.tsx    # Protocol editor interface
│   ├── projectiles.tsx     # 3D projectile rendering
│   ├── reward-selection.tsx     # Post-battle reward screen
│   ├── start-screen.tsx    # Title screen with glitch effects
│   └── ui/                 # shadcn/ui components
├── hooks/
│   └── use-game-state.ts   # Central game state management
├── lib/
│   ├── actions.ts          # All 37 action definitions
│   ├── battle-engine.ts    # Core battle logic and AI execution
│   ├── character-presets.ts     # 8 character class definitions
│   ├── triggers.ts         # All 23 trigger definitions
│   └── utils.ts            # Utility functions
└── types/
    └── game.ts             # TypeScript interfaces and types
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd battle-protocol

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open browser to http://localhost:3000
\`\`\`

### Building for Production

\`\`\`bash
# Build the application
pnpm build

# Start production server
pnpm start
\`\`\`

## 🔧 Development Guide

### Adding New Triggers

1. Open `lib/triggers.ts`
2. Add your trigger to the `AVAILABLE_TRIGGERS` array:

\`\`\`typescript
{
  id: 'my-trigger',
  name: 'My Trigger',
  description: 'Detailed description of when this triggers',
  check: (context: BattleContext) => {
    // Return true when condition is met
    return context.playerHP < 50
  }
}
\`\`\`

3. The trigger will automatically appear in the programming panel

### Adding New Actions

1. Open `lib/actions.ts`
2. Add your action to the `AVAILABLE_ACTIONS` array:

\`\`\`typescript
{
  id: 'my-action',
  name: 'My Action',
  description: 'Detailed description of what this does',
  cooldown: 1000, // milliseconds
  execute: (context: BattleContext) => {
    // Return the changes to apply
    return {
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

3. The action will automatically appear in the programming panel

### Adding New Character Classes

1. Open `lib/character-presets.ts`
2. Add your character to the `CHARACTER_PRESETS` array:

\`\`\`typescript
{
  id: 'my-class',
  name: 'My Class',
  description: 'Playstyle description',
  color: '#ff00ff', // Hex color for UI theming
  startingPairs: [
    { 
      trigger: AVAILABLE_TRIGGERS[0], 
      action: AVAILABLE_ACTIONS[1], 
      priority: 3 
    },
    // Add 3-4 starting protocols
  ],
  startingTriggers: [0, 5, 11, 19, 23], // Indices of unlocked triggers
  startingActions: [0, 1, 6, 10] // Indices of unlocked actions
}
\`\`\`

3. The character will appear in the character selection screen

### Modifying Battle Logic

The core battle logic is in `lib/battle-engine.ts`. Key methods:

- `update(deltaTime)` - Main game loop, called every frame
- `executeAI(isPlayer)` - Evaluates protocols and executes actions
- `updatePositions(deltaTime)` - Moves fighters based on actions
- `updateProjectiles(deltaTime)` - Moves projectiles and checks collisions
- `checkCollisions()` - Handles projectile-fighter collisions

### Adjusting Game Balance

Key balance parameters:

- **Action cooldowns** - In `lib/actions.ts`, adjust the `cooldown` property
- **Action damage** - In action `execute` functions, adjust damage values
- **Fighter HP** - In `hooks/use-game-state.ts`, adjust `maxHp` values
- **Enemy AI** - In `hooks/use-game-state.ts`, modify `startBattle` enemy protocol generation
- **Wave scaling** - In `hooks/use-game-state.ts`, adjust enemy HP formula in `continueToNextWave`

## 🎓 Enemy Scaling & Dynamic Difficulty Adjustment (DDA)

Battle Protocol implements research-backed difficulty scaling based on Flow Theory and modern DDA best practices.

### Research Foundations

The game's difficulty system is grounded in academic research on player engagement:

1. **Flow Theory (Csikszentmihalyi)** - Players experience optimal engagement when challenge matches skill level
2. **Difficulty Saw Pattern** - Difficulty should drop slightly when introducing new mechanics, then ramp up
3. **Engagement-Oriented DDA** - Real-time monitoring and adjustment to prevent player churn
4. **Performance-Based Scaling** - Difficulty adjusts based on win rate, kill speed, and health retention

### Wave Scaling Formula

Enemy HP scales through distinct phases to maintain flow state:

\`\`\`typescript
// Tutorial Phase (Waves 1-3): Fixed, predictable difficulty
Wave 1: 40 HP  (no DDA)
Wave 2: 50 HP  (no DDA)
Wave 3: 60 HP  (no DDA)

// Early Game (Waves 4-6): Gentle transition with DDA ramp-up
Wave 4: 80 HP  (no DDA - "difficulty saw" drop after tutorial)
Wave 5: 90 HP  (50% DDA - gradual introduction)
Wave 6+: 100 HP base (full DDA)

// Mid Game (Waves 6-15): Linear scaling
HP = 40 + wave * 10

// Late Game (Waves 16+): Exponential scaling
HP = 40 + (15 * 10) + Math.pow(wave - 15, 1.5) * 15
\`\`\`

### Dynamic Difficulty Adjustment (DDA)

The DDA system monitors three performance metrics:

**1. Win Rate (40% weight)**
- Tracks last 5 battles
- Target: 60-80% win rate
- Adjustments: ±10% per 10% deviation

**2. Kill Speed (30% weight)**
- Measures time to defeat enemies
- Target: 20-40 seconds
- Adjustments: ±8% per 10s deviation

**3. HP Retention (30% weight)**
- Tracks ending HP percentage
- Target: 40-70% remaining
- Adjustments: ±8% per 10% deviation

**Multiplier Bounds**
- Minimum: 0.6x (struggling players)
- Maximum: 1.5x (expert players)
- Clamped to prevent extreme difficulty spikes

**Tutorial Protection**
- Waves 1-3: No DDA (1.0x multiplier)
- Wave 4: No DDA (difficulty saw pattern)
- Wave 5: 50% reduced DDA impact
- Wave 6+: Full DDA active

### Why This Works

**Early Game (Waves 1-4)**
- Consistent, predictable difficulty allows learning
- No punishment for experimentation
- "Difficulty saw" at wave 4 gives breathing room before DDA kicks in

**Mid Game (Waves 5-10)**
- DDA activates gradually to match improving player skill
- Linear scaling provides steady progression
- Performance feedback keeps players in flow zone

**Late Game (Waves 11+)**
- Exponential scaling provides long-term challenge
- DDA prevents insurmountable difficulty spikes
- Expert players get harder content, struggling players get relief

## 📐 System Architecture (C4 Diagrams)

### Component Diagram: Battle System

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Game State Hook                       │
│                   (hooks/use-game-state.ts)                  │
│                                                              │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐│
│  │ Wave Manager   │  │ DDA Engine   │  │ Battle Manager  ││
│  │                │  │              │  │                 ││
│  │ • Scaling      │←→│ • Win Rate   │←→│ • Start Battle  ││
│  │ • Progression  │  │ • Kill Speed │  │ • End Battle    ││
│  │ • Rewards      │  │ • HP Track   │  │ • Victory       ││
│  └────────────────┘  └──────────────┘  └─────────────────┘│
│           ↓                   ↓                   ↓         │
└───────────┼───────────────────┼───────────────────┼─────────┘
            │                   │                   │
            ↓                   ↓                   ↓
┌───────────────────────────────────────────────────────────────┐
│                      Battle Engine                            │
│                   (lib/battle-engine.ts)                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐│
│  │ AI Executor  │  │ Physics      │  │ Collision Detection││
│  │              │  │              │  │                    ││
│  │ • Protocol   │  │ • Movement   │  │ • Projectiles     ││
│  │   Evaluation │  │ • Velocity   │  │ • Hit Detection   ││
│  │ • Cooldowns  │  │ • Bounds     │  │ • Damage Apply    ││
│  └──────────────┘  └──────────────┘  └────────────────────┘│
└───────────────────────────────────────────────────────────────┘
\`\`\`

### Sequence Diagram: Wave Progression with DDA

\`\`\`
Player    GameUI    GameState         DDA Engine    BattleEngine
  │         │           │                 │              │
  │ Defeat Enemy        │                 │              │
  │─────────┼──────────→│                 │              │
  │         │           │ Calculate       │              │
  │         │           │ Performance     │              │
  │         │           │────────────────→│              │
  │         │           │                 │              │
  │         │           │←Win Rate: 80%───┤              │
  │         │           │←Kill Time: 25s──┤              │
  │         │           │←HP Left: 60%────┤              │
  │         │           │                 │              │
  │         │           │ Calculate DDA   │              │
  │         │           │ Multiplier      │              │
  │         │           │────────────────→│              │
  │         │           │←Multiplier: 1.3x┤              │
  │         │           │                 │              │
  │ Show Victory        │                 │              │
  │←────────┼───────────┤                 │              │
  │         │           │                 │              │
  │ Pick Reward         │                 │              │
  │─────────┼──────────→│                 │              │
  │         │           │ Prepare Wave    │              │
  │         │           │ (base: 60,      │              │
  │         │           │  DDA: 1.3x)     │              │
  │         │           │ = 78 HP         │              │
  │         │           │                 │              │
  │ Show Enemy Intro    │                 │              │
  │←────────┼───────────┤                 │              │
  │         │           │                 │              │
  │ Begin Battle        │                 │              │
  │─────────┼──────────→│                 │              │
  │         │           │ Reset Player    │              │
  │         │           │ Pos & HP        │              │
  │         │           │                 │              │
  │         │           │ Start Battle    │              │
  │         │           │─────────────────┼─────────────→│
  │         │           │                 │  Create      │
  │         │           │                 │  New Engine  │
  │         │           │                 │              │
  │ Battle Begins       │                 │              │
  │←────────┼───────────┴─────────────────┴──────────────┘
\`\`\`

### Data Flow: DDA Calculation

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Performance Metrics                       │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
         ┌────────▼────────┐    ┌────────▼────────┐    ┌──────▼──────┐
         │   Win Rate      │    │   Kill Speed    │    │  HP Retain  │
         │                 │    │                 │    │             │
         │ Last 5 battles  │    │ Time to kill    │    │ End HP %    │
         │ Target: 60-80%  │    │ Target: 20-40s  │    │ Target: 40% │
         │ Weight: 40%     │    │ Weight: 30%     │    │ Weight: 30% │
         └────────┬────────┘    └────────┬────────┘    └──────┬──────┘
                  │                      │                     │
                  └──────────┬───────────┴───────────┬─────────┘
                             ↓                       ↓
                    ┌────────────────────────────────────┐
                    │   Difficulty Multiplier Formula    │
                    │                                    │
                    │  multiplier = 1.0                  │
                    │  + (winRate - 0.7) * 0.4           │
                    │  + (killSpeed deviation) * 0.3     │
                    │  + (hpRetention deviation) * 0.3   │
                    │                                    │
                    │  Clamped: [0.6, 1.5]              │
                    └───────────────┬────────────────────┘
                                    ↓
                    ┌────────────────────────────────────┐
                    │   Tutorial Protection Applied      │
                    │                                    │
                    │  Wave 1-3: multiplier = 1.0        │
                    │  Wave 4:   multiplier = 1.0        │
                    │  Wave 5:   multiplier *= 0.5       │
                    │  Wave 6+:  full multiplier         │
                    └───────────────┬────────────────────┘
                                    ↓
                    ┌────────────────────────────────────┐
                    │      Final Enemy HP                │
                    │                                    │
                    │   baseHP * finalMultiplier         │
                    └────────────────────────────────────┘
\`\`\`

### State Machine: Game Flow

\`\`\`
     ┌──────────┐
     │  START   │
     └────┬─────┘
          │
          ↓
  ┌───────────────┐
  │  CHAR SELECT  │
  └───────┬───────┘
          │
          ↓
  ┌───────────────┐
  │  PROGRAMMING  │
  └───────┬───────┘
          │
          ↓
  ┌───────────────┐      ┌──────────┐
  │ ENEMY INTRO   │←─────┤ REWARD   │
  └───────┬───────┘      └────▲─────┘
          │                   │
          ↓                   │
  ┌───────────────┐           │
  │  IN BATTLE    │           │
  └───┬───────┬───┘           │
      │       │               │
      │       └───Victory─────┘
      │
      │
   Defeat
      │
      ↓
  ┌───────────────┐
  │  GAME OVER    │
  │  (Show Stats) │
  └───────┬───────┘
          │
          └─────────→ Back to CHAR SELECT or PROGRAMMING
\`\`\`

## 🔍 Key Implementation Details

### Battle State Management

Located in `hooks/use-game-state.ts`:

- **Wave Manager**: Handles progression, scaling formulas, and reward generation
- **DDA Engine**: Tracks performance metrics and calculates difficulty multipliers
- **Battle Manager**: Controls battle lifecycle (start, end, victory, defeat)

### Performance Tracking

The DDA system maintains a sliding window of performance data:

\`\`\`typescript
const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetric[]>([])

// After each battle
const metric = {
  won: playerAlive,
  killTime: battleDuration,
  hpRemaining: playerHP / maxHP,
  wave: currentWave
}
\`\`\`

### Scaling Implementation

\`\`\`typescript
function calculateEnemyHP(wave: number, ddaMultiplier: number): number {
  let baseHp: number
  
  // Tutorial: Fixed progression
  if (wave <= 3) {
    baseHp = 30 + wave * 10  // 40, 50, 60
  }
  // Early: Gentle scaling
  else if (wave <= 6) {
    baseHp = 40 + wave * 10  // 80, 90, 100
  }
  // Mid: Linear scaling
  else if (wave <= 15) {
    baseHp = 40 + wave * 10
  }
  // Late: Exponential scaling
  else {
    baseHp = 40 + (15 * 10) + Math.pow(wave - 15, 1.5) * 15
  }
  
  // Apply tutorial-protected DDA
  let finalMultiplier = 1.0
  if (wave >= 6) {
    finalMultiplier = ddaMultiplier
  } else if (wave === 5) {
    finalMultiplier = 1.0 + (ddaMultiplier - 1.0) * 0.5
  }
  
  return Math.round(baseHp * finalMultiplier)
}
\`\`\`

## 🎨 Design System

### Colors
- **Primary**: Cyan (#00ffff) - Player elements, highlights
- **Secondary**: Magenta (#ff00ff) - Enemy elements, accents
- **Accent**: Green (#00ff00) - Success states, healing
- **Background**: Dark purple/black gradient
- **Text**: White with cyan glow for headings

### Typography
- **Headings**: Geist font with uppercase, letter-spacing
- **Body**: Geist font, 14-16px
- **Monospace**: Geist Mono for code/technical elements

### Animation Principles
- **Smooth movement**: 60fps target with lerp interpolation
- **Responsive feedback**: Immediate visual response to actions
- **Subtle ambience**: Slow-moving background elements
- **Impactful actions**: Fast, snappy combat animations

## 🐛 Known Issues & Future Improvements

### Potential Enhancements
- [ ] Multiplayer support (PvP protocol battles)
- [ ] More character classes and abilities
- [ ] Boss battles with unique mechanics
- [ ] Protocol templates and sharing
- [ ] Replay system to review battles
- [ ] Advanced statistics and analytics
- [ ] Mobile touch controls
- [ ] Sound effects for actions
- [ ] Particle effect improvements
- [ ] Save/load protocol configurations

### Performance Considerations
- The 3D scene is optimized for 60fps on modern browsers
- Consider reducing particle counts on lower-end devices
- Battle engine runs at fixed timestep for consistency

## 📝 License

This project was created with v0.app. Feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Key areas for contribution:
- New triggers and actions
- Character class designs
- Visual effects and animations
- Balance adjustments
- Bug fixes and optimizations

## 🎯 Design Philosophy

Battle Protocol is inspired by:
- **Megaman Battle Network** - Grid-based tactical combat with chip system
- **Final Fantasy XII** - Gambit system for AI programming
- **Vampire Survivors** - Character class variety and progression
- **Cyberpunk aesthetics** - Neon colors, data streams, retro-futurism

The goal is to create a game where strategic thinking and planning are more important than reflexes, while still maintaining exciting real-time combat visuals.
