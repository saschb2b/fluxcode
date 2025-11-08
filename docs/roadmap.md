# Roadmap & Known Issues

This document tracks known issues, limitations, and planned future improvements for Battle Protocol.

## Known Issues

### High Priority

- [ ] **Battle engine performance** - Can drop below 60fps with many projectiles
- [ ] **Mobile responsiveness** - Touch controls need optimization
- [ ] **Protocol priority bugs** - Sometimes protocols execute out of order

### Medium Priority

- [ ] **Enemy AI variety** - All enemies use same random protocol generation
- [ ] **Visual feedback** - Some actions lack clear visual indicators
- [ ] **Tutorial** - No in-game tutorial for new players
- [ ] **Balance** - Some triggers/actions significantly stronger than others

### Low Priority

- [ ] **Audio** - No sound effects for individual actions
- [ ] **Accessibility** - Missing screen reader support and keyboard navigation
- [ ] **Save system** - No cloud save or cross-device sync

## Planned Features

### Version 1.1 - Enhanced Combat

- [ ] **Boss Battles** - Special enemies with unique mechanics every 5 waves
- [ ] **New Character Classes** - Add 2-3 additional character archetypes
- [ ] **Advanced Triggers** - Combo triggers that require multiple conditions
- [ ] **Status Effects** - Buffs, debuffs, DoT effects
- [ ] **Particle Effects** - Enhanced visual effects for abilities

### Version 1.2 - Meta Progression

- [ ] **Persistent Unlocks** - Unlock new triggers/actions permanently
- [ ] **Character Upgrades** - Enhance character stats between runs
- [ ] **Achievement System** - Track accomplishments and milestones
- [ ] **Daily Challenges** - Randomized daily runs with leaderboards

### Version 1.3 - Social Features

- [ ] **Protocol Sharing** - Share protocol configurations with others
- [ ] **PvP Mode** - Battle against other players' programmed fighters
- [ ] **Replay System** - Watch and analyze past battles
- [ ] **Community Hub** - Browse top protocols and strategies

### Version 2.0 - Major Expansion

- [ ] **Story Mode** - Campaign with narrative and progression
- [ ] **Multiple Arenas** - Different battlefield types with unique mechanics
- [ ] **Team Battles** - Control multiple fighters simultaneously
- [ ] **Protocol Templates** - Pre-built strategies for common situations
- [ ] **Advanced Editor** - Visual protocol flow editor

## Performance Improvements

### Optimization Targets

- [ ] **Reduce re-renders** - Optimize React component updates
- [ ] **Projectile pooling** - Reuse projectile objects instead of creating new ones
- [ ] **Instanced meshes** - Use Three.js instancing for identical objects
- [ ] **LOD system** - Reduce detail for distant or background elements
- [ ] **Web Workers** - Move battle calculations off main thread

### Mobile Optimizations

- [ ] **Touch controls** - Redesign UI for touch input
- [ ] **Reduced effects** - Lower quality mode for mobile devices
- [ ] **Responsive layout** - Optimize layout for portrait mode
- [ ] **Performance mode** - Toggle for reduced visual quality

## Balance Adjustments

### Trigger Rebalancing

Triggers that need adjustment:
- **"Always"** - Too strong, triggers every frame
- **"Random"** - Too unpredictable, frustrating for players
- **"Enemy Far"** - Rarely triggers, needs threshold adjustment

### Action Rebalancing

Actions that need adjustment:
- **"Mega Blast"** - Too powerful for its cooldown
- **"Teleport"** - Can break game flow, needs restrictions
- **"Rapid Fire"** - Dominates other attack options

### Character Rebalancing

- **Berserker** - Too fragile, needs HP buff
- **Guardian** - Too defensive, matches drag on
- **Sniper** - Charge mechanic feels clunky

## Technical Debt

- [ ] Refactor `use-game-state.ts` - Too large, needs splitting
- [ ] Add unit tests - Currently no test coverage
- [ ] Improve TypeScript strictness - Enable stricter compiler options
- [ ] Document all components - Missing JSDoc comments
- [ ] Reduce bundle size - Code splitting and lazy loading

## Community Requests

Most requested features from players:

1. **Undo/Redo in editor** - Ability to undo protocol changes
2. **Protocol export/import** - Save and share configurations as JSON
3. **Battle speed controls** - Fast forward or slow motion
4. **Detailed statistics** - Track win rates per character and protocol
5. **Custom color themes** - Personalize the UI colors
