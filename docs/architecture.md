# Architecture Overview

This document provides a high-level overview of Battle Protocol's system architecture.

## System Components

Battle Protocol uses a layered architecture with clear separation between game logic, rendering, and UI:

\`\`\`mermaid
graph TB
    subgraph "Presentation Layer"
        UI[Game UI Components]
        Arena[3D Battle Arena]
        HUD[HUD Overlay]
    end
    
    subgraph "State Management Layer"
        GameState[Game State Hook]
        WaveManager[Wave Manager]
        DDAEngine[DDA Engine]
        BattleManager[Battle Manager]
    end
    
    subgraph "Game Logic Layer"
        BattleEngine[Battle Engine]
        AIExecutor[AI Executor]
        Physics[Physics System]
        Collision[Collision Detection]
    end
    
    subgraph "Data Layer"
        Triggers[Trigger Definitions]
        Actions[Action Definitions]
        Characters[Character Presets]
    end
    
    UI --> GameState
    Arena --> GameState
    HUD --> GameState
    
    GameState --> WaveManager
    GameState --> DDAEngine
    GameState --> BattleManager
    
    WaveManager --> BattleEngine
    DDAEngine --> BattleEngine
    BattleManager --> BattleEngine
    
    BattleEngine --> AIExecutor
    BattleEngine --> Physics
    BattleEngine --> Collision
    
    AIExecutor --> Triggers
    AIExecutor --> Actions
    BattleManager --> Characters
\`\`\`

## Core Systems

### Game State Management

**Location**: `hooks/use-game-state.ts`

Central state manager that coordinates all game systems:
- Wave progression and enemy generation
- Protocol unlocking and rewards
- Battle lifecycle (start, end, victory, defeat)
- Performance tracking for DDA

### Battle Engine

**Location**: `lib/battle-engine.ts`

Core combat simulation running at 60 FPS:
- Protocol evaluation and action execution
- Fighter movement and physics
- Projectile simulation
- Collision detection and damage application

### DDA Engine

**Location**: `hooks/use-game-state.ts` (calculateDifficultyMultiplier)

Tracks player performance and adjusts difficulty:
- Win rate monitoring (last 5 battles)
- Kill speed tracking (target: 20-40s)
- HP retention analysis (target: 40-70%)
- Multiplier calculation (range: 0.6x - 1.5x)

## Data Flow

### Battle Start Sequence

\`\`\`mermaid
sequenceDiagram
    participant Player
    participant GameUI
    participant GameState
    participant BattleEngine
    
    Player->>GameUI: Click "Start Battle"
    GameUI->>GameState: startBattle()
    GameState->>GameState: Calculate Enemy HP
    GameState->>GameState: Apply DDA Multiplier
    GameState->>BattleEngine: new BattleEngine(config)
    BattleEngine->>GameState: Return engine instance
    GameState->>GameUI: Update state to "fighting"
    GameUI->>Player: Show battle arena
\`\`\`

### Wave Progression Sequence

\`\`\`mermaid
sequenceDiagram
    participant Player
    participant GameUI
    participant GameState
    participant DDA
    
    Player->>GameUI: Defeat Enemy
    GameUI->>GameState: Enemy HP reaches 0
    GameState->>DDA: Record performance metrics
    DDA->>DDA: Update win rate, kill time, HP retention
    DDA->>GameState: Return updated multiplier
    GameState->>GameUI: Show victory screen
    Player->>GameUI: Select reward
    GameUI->>GameState: Prepare next wave
    GameState->>GameState: Calculate new enemy HP
    GameState->>GameUI: Show enemy intro
    Player->>GameUI: Begin battle
    GameUI->>GameState: Start new battle
\`\`\`

## Component Hierarchy

\`\`\`
App (page.tsx)
├── Start Screen
├── Character Selection
└── Game UI
    ├── Battle Arena (3D)
    │   ├── Battle Grid
    │   ├── Player Fighter (3D)
    │   ├── Enemy Fighter (3D)
    │   └── Projectiles (3D)
    ├── HUD Overlay
    │   ├── HP Bars
    │   ├── Wave Counter
    │   └── Status Messages
    ├── Programming Panel
    │   ├── Protocol List
    │   ├── Trigger Selector
    │   └── Action Selector
    ├── Victory/Defeat Screen
    ├── Reward Selection
    └── Codex
\`\`\`

## State Machine

The game follows a clear state machine pattern:

\`\`\`mermaid
stateDiagram-v2
    [*] --> Start
    Start --> CharacterSelection
    CharacterSelection --> Programming
    Programming --> EnemyIntro
    EnemyIntro --> InBattle
    InBattle --> Victory: Player wins
    InBattle --> Defeat: Player loses
    Victory --> RewardSelection
    RewardSelection --> EnemyIntro: Next wave
    Defeat --> GameOver
    GameOver --> CharacterSelection: Restart
    Programming --> Codex: View abilities
    Codex --> Programming: Close codex
\`\`\`

## Performance Considerations

- **60 FPS Target**: Battle engine uses requestAnimationFrame with delta time
- **React Optimization**: useMemo and useCallback prevent unnecessary re-renders
- **3D Optimization**: Instanced meshes for projectiles, simple geometries
- **State Updates**: Batch state updates to minimize React reconciliation

## File Organization

\`\`\`
battle-protocol/
├── app/                    # Next.js app router
├── components/             # React components
│   ├── battle-*.tsx       # Battle-related components
│   ├── game-*.tsx         # Game UI components
│   └── ui/                # shadcn/ui primitives
├── hooks/                 # React hooks
│   └── use-game-state.ts  # Central state management
├── lib/                   # Game logic
│   ├── actions.ts         # Action definitions
│   ├── triggers.ts        # Trigger definitions
│   ├── battle-engine.ts   # Battle simulation
│   └── character-presets.ts
├── types/                 # TypeScript definitions
└── docs/                  # Documentation
