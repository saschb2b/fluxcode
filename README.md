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
