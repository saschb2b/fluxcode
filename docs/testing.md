# Testing Guide

This document describes the testing strategy and practices for the Battle Game project.

## Test Structure

Tests are organized alongside the code they test in `__tests__` directories:

\`\`\`
lib/
  battle-engine.ts
  __tests__/
    battle-engine.test.ts
  meta-progression.ts
  __tests__/
    meta-progression.test.ts
\`\`\`

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

## Test Coverage

We aim for the following minimum coverage thresholds:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Critical game logic in the `lib/` directory should have higher coverage (70%+).

## What We Test

### Battle Engine (`lib/battle-engine.ts`)
- State initialization and management
- Projectile creation, movement, and collision detection
- Damage calculation and HP management
- Action execution (shoot, move, heal)
- Cooldown system
- Battle end conditions
- Battle history recording
- Priority-based AI execution

### Meta Progression (`lib/meta-progression.ts`)
- Cipher Fragment reward calculation
- Upgrade purchase validation
- Upgrade affordability checks
- Stat bonus accumulation
- Action-specific damage bonuses
- Unlock system (actions/triggers)
- Progress persistence (localStorage)
- Migration from old currency system

### Network Layers (`lib/network-layers.ts`)
- Layer generation with correct node counts
- Node type distribution
- Guardian placement
- Run initialization
- Node reward descriptions
- Theme consistency

## Testing Patterns

### Unit Tests
Focus on isolated function behavior:

\`\`\`typescript
it('should calculate base reward correctly', () => {
  expect(calculateCipherFragmentReward(1)).toBe(10)
  expect(calculateCipherFragmentReward(3)).toBe(30)
})
\`\`\`

### Integration Tests
Test interactions between systems:

\`\`\`typescript
it('should execute move action and update state', () => {
  const engine = new BattleEngine(initialState, [movePair], [])
  const update = engine.tick(16)
  
  expect(update.playerPos).toEqual({ x: 2, y: 2 })
})
\`\`\`

### Edge Cases
Always test boundary conditions:

\`\`\`typescript
it('should handle zero nodes', () => {
  expect(calculateCipherFragmentReward(0)).toBe(0)
})

it('should not allow purchase without funds', () => {
  progress.cipherFragments = 10
  const newProgress = purchaseUpgrade(progress, expensiveUpgrade.id)
  
  expect(newProgress.cipherFragments).toBe(10)
})
\`\`\`

## Continuous Integration

GitHub Actions runs the test suite on:
- Every push to `main` or `develop`
- Every pull request targeting `main` or `develop`
- Multiple Node.js versions (18.x, 20.x)

The CI pipeline:
1. Runs linter (`npm run lint`)
2. Runs type checker (`npm run type-check`)
3. Runs test suite with coverage (`npm test -- --coverage`)
4. Uploads coverage to Codecov
5. Builds the project (`npm run build`)

## Best Practices

### Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Test suites: Use descriptive `describe` blocks
- Test cases: Start with "should" for clarity

### Test Organization
\`\`\`typescript
describe('ComponentName', () => {
  describe('Feature/Method', () => {
    it('should behave correctly in normal case', () => {})
    it('should handle edge case', () => {})
    it('should throw error on invalid input', () => {})
  })
})
\`\`\`

### Setup and Teardown
Use `beforeEach` to reset state:

\`\`\`typescript
let progress: PlayerProgress

beforeEach(() => {
  progress = getDefaultProgress()
})
\`\`\`

### Mocking
- Mock external dependencies
- Mock localStorage for persistence tests
- Keep mocks simple and focused

## Adding New Tests

When adding new game logic:

1. Create a test file in the same directory with `__tests__/` prefix
2. Import necessary types and functions
3. Write tests for happy path, edge cases, and error conditions
4. Ensure tests are fast (<100ms each)
5. Run locally before committing
6. Check coverage report

## Debugging Tests

\`\`\`bash
# Run specific test file
npm test battle-engine.test

# Run tests matching pattern
npm test -- --testNamePattern="projectile"

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
\`\`\`

## Future Improvements

- Add React component tests using React Testing Library
- Add E2E tests using Playwright
- Set up visual regression testing
- Add performance benchmarks for battle engine
- Implement mutation testing with Stryker
