# Battle Protocol

A tactical combat game inspired by Megaman Battle Network and Final Fantasy XII's Gambit system. Program your **Constructs** (combat frames) with custom protocols using trigger-action pairs, unlock new abilities, and battle through waves of increasingly difficult enemies in a cyberpunk 3D arena.

## 🎮 Game Concept

Battle Protocol combines strategic protocol programming with real-time tactical combat. Instead of directly controlling a fighter, you deploy **Constructs** - specialized combat frames that come "naked" with NO pre-programmed behavior. You must manually assign protocols (IF-THEN rules) within the Construct's slot limits to define how it fights. The challenge lies in creating an optimal protocol configuration that maximizes your Construct's unique capabilities.

### Core Gameplay Loop

1. **Construct Deployment** - Choose from specialized combat frames with unique stats and slot configurations
2. **Protocol Programming** - Assign trigger-action pairs within Movement and Tactical core slot limits
3. **Battle** - Watch your Construct execute protocols in real-time 3D combat
4. **Progression** - Unlock new triggers and actions by defeating enemies
5. **Wave Survival** - Battle through increasingly difficult waves with your programmed Construct

## ✨ Features

- **Construct System** - Deploy specialized combat frames with unique base stats and capabilities
- **Naked Deployment** - Constructs start with ZERO protocols - you build everything from scratch
- **Slot-Based Configuration** - Respect Movement Core and Tactical Core capacity limits
- **Protocol System** - 23 triggers and 37 actions to create complex combat behaviors
- **3 Starter Constructs** - Vanguard (balanced), Specter (agile), Breacher (offensive)
- **3D Battle Arena** - Real-time combat with smooth animations
- **Cyberpunk Aesthetic** - Neon colors, data streams, CRT effects
- **Dynamic Difficulty** - Research-backed DDA system maintains optimal challenge
- **Codex System** - Browse all abilities with 3D visualizations

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **3D Graphics**: React Three Fiber
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4

## 🏗️ Architecture

### Construct System

The game uses a **Construct-based deployment model** inspired by Warframe's frame system:

#### **What are Constructs?**
Constructs are specialized combat frames that provide:
- **Base Stats**: HP, Shields, Armor values unique to each frame
- **Slot Configuration**: Maximum number of Movement and Tactical protocol slots
- **Passive Abilities**: Optional unique effects (evasion boost, damage increase, etc.)
- **Resistances**: Damage type modifiers specific to the frame

#### **Available Constructs**
- **VANGUARD CONSTRUCT** - Balanced defense platform
  - 120 HP, 30 Shields, 20 Armor
  - 4 Movement / 4 Tactical slots
  - Passive: 5% damage reduction

- **SPECTER CONSTRUCT** - High-mobility evasion frame
  - 90 HP, 40 Shields, 10 Armor
  - 6 Movement / 4 Tactical slots
  - Passive: 10% evasion chance

- **BREACHER CONSTRUCT** - Heavy offensive platform
  - 100 HP, 20 Shields, 15 Armor
  - 3 Movement / 6 Tactical slots
  - Passive: 10% damage increase

#### **Naked Deployment**
Unlike preset characters, Constructs come with:
- ❌ NO pre-programmed protocols
- ❌ NO default behaviors
- ✅ Only base stats and slot capacities
- ✅ Complete customization freedom

Players must manually assign ALL protocols before battle within the Construct's slot limits.

### Dual-Core Protocol System

The battle AI uses a **dual-core protocol system** that separates movement from tactical actions to prevent conflicts:

#### **Movement Core Directives**
- Handles positioning, evasion, and movement actions
- Fast-cooldown actions (dodge, strafe, move)
- Evaluates **first** on every battle tick
- Independent cooldown tracking

**Movement Actions**: `dodge`, `move-forward`, `move-backward`, `move-up`, `move-down`, `strafe-left`, `strafe-right`, `dash-forward`, `jump`, `teleport`, `dash-attack`, `retreat-shot`

#### **Tactical Core Directives**
- Handles attacks, buffs, debuffs, healing, and status effects
- Standard and slow-cooldown actions
- Evaluates **second** (only if no movement action was taken)
- Independent cooldown tracking

**Tactical Actions**: All shoot variants, heals, buffs, debuffs, status effects, field effects

#### **Execution Flow**
1. **Movement Core** evaluates all movement protocols in priority order
2. If a movement action triggers, it executes and **blocks** tactical core for that tick
3. If no movement action triggers, **Tactical Core** evaluates
4. Only one action executes per tick per fighter

**Why This Architecture?** Previously, fast-cooldown movement actions could perpetually trigger and block slow-cooldown tactical actions, resulting in passive fighters that never attacked. The dual-core system ensures fighters remain aggressive while maintaining evasion capabilities.

## 🚀 Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
\`\`\`

## 📚 Documentation

- **[Architecture Overview](docs/architecture.md)** - System design and component structure
- **[Development Guide](docs/development.md)** - Adding triggers, actions, and character classes
- **[Difficulty System](docs/difficulty-system.md)** - Enemy scaling and DDA implementation
- **[Project Structure](docs/project-structure.md)** - File organization and module descriptions

## 🎯 Design Philosophy

Battle Protocol is inspired by Megaman Battle Network's grid-based tactical combat and Final Fantasy XII's Gambit system for AI programming. The goal is to create a game where strategic thinking and planning are more important than reflexes, while still maintaining exciting real-time combat visuals.

## 🐛 Known Issues & Future Improvements

See [docs/roadmap.md](docs/roadmap.md) for planned features and known issues.

## 📝 License

This project was created with v0.app. Feel free to use and modify as needed.
