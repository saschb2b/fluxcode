# Project Structure

This document describes the organization of the Battle Protocol codebase.

## Directory Overview

\`\`\`
battle-protocol/
├── app/                    # Next.js App Router
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Game logic and utilities
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
└── docs/                   # Documentation
\`\`\`

## App Directory (`app/`)

Next.js 16 App Router configuration and root pages.

### `layout.tsx`
Root layout component with:
- SEO metadata and Open Graph tags
- Font loading (Geist, Geist Mono)
- Global CSS imports
- HTML structure

### `page.tsx`
Main game orchestrator component:
- Manages game flow (start → character → game)
- Coordinates all major screens
- Handles character selection state
- Integrates background music

### `globals.css`
Global styles and Tailwind CSS v4 configuration:
- CSS custom properties for theming
- Animation keyframes
- Utility classes
- Font configurations

## Components Directory (`components/`)

React components organized by functionality.

### Battle Components

**`battle-arena.tsx`**
- Main 3D battle scene container
- Manages Three.js Canvas
- Renders fighters and projectiles
- Handles camera positioning

**`battle-grid.tsx`**
- 3D grid floor visualization
- Shows tile positions
- Highlights occupied tiles

**`fighter.tsx`**
- 3D fighter model with animations
- Smooth movement interpolation
- Health bar rendering
- Position tracking

**`projectiles.tsx`**
- Renders active projectiles in 3D
- Handles projectile movement
- Visual effects for different projectile types

### UI Components

**`game-ui.tsx`**
- Main HUD overlay
- Battle status display
- Victory/defeat screens
- Protocol configuration access

**`programming-panel.tsx`**
- Protocol editor interface
- Trigger and action selection
- Priority management
- Drag-and-drop protocol ordering

**`reward-selection.tsx`**
- Post-battle reward screen
- Shows unlockable triggers and actions
- Handles reward selection

**`character-selection.tsx`**
- Character class selection screen
- Shows class stats and abilities
- Preview of starting protocols

**`codex.tsx`**
- Encyclopedia of all triggers and actions
- 3D visualizations
- Detailed descriptions
- Searchable and filterable

### Visual Components

**`cyberpunk-background.tsx`**
- Animated 3D background elements
- Data streams and particles
- Dynamic lighting effects

**`glitch-effect.tsx`**
- Cyberpunk glitch animations
- CRT scanline effects
- Applied to text and UI elements

**`start-screen.tsx`**
- Title screen with logo
- Animated background
- Start game button

### UI Primitives (`components/ui/`)

shadcn/ui components based on Radix UI:
- `button.tsx` - Button component
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialogs
- `select.tsx` - Dropdown select
- `tooltip.tsx` - Hover tooltips
- ... and more

## Hooks Directory (`hooks/`)

### `use-game-state.ts`

Central game state management hook:

**State Variables:**
- `gamePhase` - Current game phase (start, character, game)
- `selectedCharacter` - Chosen character class
- `wave` - Current wave number
- `battleState` - Battle status (idle, fighting, victory, defeat)
- `playerHP` / `enemyHP` - Current health values
- `unlockedTriggers` / `unlockedActions` - Available abilities
- `performanceHistory` - DDA tracking data

**Key Functions:**
- `startBattle()` - Initialize new battle
- `continueToNextWave()` - Progress to next wave
- `selectReward()` - Handle reward selection
- `calculateDifficultyMultiplier()` - DDA calculations

## Lib Directory (`lib/`)

Game logic and data definitions.

### `battle-engine.ts`

Core battle simulation engine:

**Class: BattleEngine**
\`\`\`typescript
class BattleEngine {
  // Main game loop
  update(deltaTime: number): void

  // AI evaluation and execution
  executeAI(isPlayer: boolean): void

  // Physics and movement
  updatePositions(deltaTime: number): void
  updateProjectiles(deltaTime: number): void

  // Collision detection
  checkCollisions(): void

  // State queries
  getState(): BattleState
  isGameOver(): boolean
}
\`\`\`

### `triggers.ts`

All trigger definitions:
- `AVAILABLE_TRIGGERS` - Array of 23 triggers
- Each trigger has id, name, description, and check function
- Organized by category (HP, Position, Distance, State)

### `actions.ts`

All action definitions:
- `AVAILABLE_ACTIONS` - Array of 37 actions
- Each action has id, name, description, cooldown, and execute function
- Organized by type (Attack, Movement, Defense, Support)

### `character-presets.ts`

Character class definitions:
- `CHARACTER_PRESETS` - Array of 8 character classes
- Each defines:
  - Starting protocols
  - Unlocked triggers and actions
  - Visual theme color
  - Playstyle description

### `utils.ts`

Utility functions:
- `cn()` - Tailwind class name merger
- Math helpers
- Position calculations
- Collision detection utilities

## Types Directory (`types/`)

### `game.ts`

TypeScript type definitions:

**Core Types:**
\`\`\`typescript
interface Position { x: number; y: number }

interface Projectile {
  position: Position
  velocity: Position
  damage: number
  isPlayerProjectile: boolean
}

interface Trigger {
  id: string
  name: string
  description: string
  check: (context: BattleContext) => boolean
}

interface Action {
  id: string
  name: string
  description: string
  cooldown: number
  execute: (context: BattleContext) => BattleUpdate
}

interface Protocol {
  trigger: Trigger
  action: Action
  priority: number
  id: string
}

interface BattleContext {
  playerPos: Position
  enemyPos: Position
  playerHP: number
  enemyHP: number
  maxPlayerHP: number
  maxEnemyHP: number
  projectiles: Projectile[]
  lastDamageTaken: number
  turnCount: number
}
\`\`\`

## Public Directory (`public/`)

Static assets served directly:
- Images and textures
- Audio files (BGM, SFX)
- Fonts (if any)
- favicon and metadata images

## Docs Directory (`docs/`)

Markdown documentation:
- `architecture.md` - System design
- `development.md` - Development guide
- `difficulty-system.md` - DDA documentation
- `project-structure.md` - This file
- `roadmap.md` - Future plans

## Data Flow

\`\`\`
User Interaction
      ↓
Components (game-ui.tsx)
      ↓
Game State Hook (use-game-state.ts)
      ↓
Battle Engine (battle-engine.ts)
      ↓
Triggers & Actions (triggers.ts, actions.ts)
      ↓
Battle Engine (updates)
      ↓
Game State Hook (state updates)
      ↓
Components (re-render)
\`\`\`

## Import Guidelines

**Component Imports:**
\`\`\`typescript
import { Button } from '@/components/ui/button'
import { BattleArena } from '@/components/battle-arena'
\`\`\`

**Hook Imports:**
\`\`\`typescript
import { useGameState } from '@/hooks/use-game-state'
\`\`\`

**Lib Imports:**
\`\`\`typescript
import { AVAILABLE_TRIGGERS } from '@/lib/triggers'
import { AVAILABLE_ACTIONS } from '@/lib/actions'
import { BattleEngine } from '@/lib/battle-engine'
\`\`\`

**Type Imports:**
\`\`\`typescript
import type { Position, Trigger, Action } from '@/types/game'
\`\`\`

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `battle-arena.tsx`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-game-state.ts`)
- **Types**: `kebab-case.ts` (e.g., `game.ts`)
- **Utils**: `kebab-case.ts` (e.g., `utils.ts`)

## Code Organization Best Practices

1. **Single Responsibility**: Each file should have one primary purpose
2. **Clear Imports**: Group imports by type (React, components, lib, types)
3. **Type Safety**: Use TypeScript interfaces for all data structures
4. **Comments**: Add JSDoc comments for complex functions
5. **Exports**: Use named exports for better tree-shaking
