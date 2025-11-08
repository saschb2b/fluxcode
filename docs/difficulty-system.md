# Difficulty System & Dynamic Difficulty Adjustment

Battle Protocol implements a research-backed difficulty scaling system based on Flow Theory and modern DDA best practices.

## Research Foundations

The difficulty system is grounded in academic research:

1. **Flow Theory (Csikszentmihalyi)** - Players experience optimal engagement when challenge matches skill
2. **Difficulty Saw Pattern** - Difficulty should drop slightly when introducing new mechanics
3. **Engagement-Oriented DDA** - Real-time monitoring prevents player frustration and boredom
4. **Performance-Based Scaling** - Adjusts based on win rate, kill speed, and health retention

## Wave Scaling Formula

Enemy HP scales through distinct phases to maintain player engagement:

### Phase 1: Tutorial (Waves 1-3)

Fixed, predictable difficulty allows learning without punishment:

| Wave | Base HP | DDA Applied | Final HP |
|------|---------|-------------|----------|
| 1    | 40      | None (1.0x) | 40       |
| 2    | 50      | None (1.0x) | 50       |
| 3    | 60      | None (1.0x) | 60       |

### Phase 2: Early Game (Waves 4-6)

Gentle transition with gradual DDA introduction:

| Wave | Base HP | DDA Applied      | Example Final HP |
|------|---------|------------------|------------------|
| 4    | 80      | None (1.0x)      | 80               |
| 5    | 90      | 50% (0.5x + 0.5) | 85-95            |
| 6    | 100     | Full             | 60-150           |

**Wave 4 "Difficulty Saw"**: Intentional easier wave after tutorial gives breathing room.

### Phase 3: Mid Game (Waves 7-15)

Linear scaling provides steady progression:

\`\`\`
HP = 40 + (wave * 10)
\`\`\`

| Wave | Base HP | With DDA (0.6x-1.5x) |
|------|---------|----------------------|
| 7    | 110     | 66-165               |
| 10   | 140     | 84-210               |
| 15   | 190     | 114-285              |

### Phase 4: Late Game (Wave 16+)

Exponential scaling for long-term challenge:

\`\`\`
HP = 40 + (15 * 10) + Math.pow(wave - 15, 1.5) * 15
\`\`\`

| Wave | Base HP | With DDA (0.6x-1.5x) |
|------|---------|----------------------|
| 16   | 205     | 123-308              |
| 20   | 288     | 173-432              |
| 25   | 431     | 259-647              |

## Dynamic Difficulty Adjustment (DDA)

### Performance Metrics

The DDA system monitors three key metrics:

#### 1. Win Rate (40% weight)

\`\`\`mermaid
graph LR
    A[Last 5 Battles] --> B{Win Rate}
    B -->|< 60%| C[Easier -10%]
    B -->|60-80%| D[No Change]
    B -->|> 80%| E[Harder +10%]
\`\`\`

- **Target**: 60-80% win rate
- **Window**: Last 5 battles
- **Adjustment**: ±10% per 10% deviation

#### 2. Kill Speed (30% weight)

\`\`\`mermaid
graph LR
    A[Battle Duration] --> B{Kill Time}
    B -->|< 20s| C[Harder +8%]
    B -->|20-40s| D[No Change]
    B -->|> 40s| E[Easier -8%]
\`\`\`

- **Target**: 20-40 seconds per battle
- **Measurement**: Time from battle start to enemy defeat
- **Adjustment**: ±8% per 10s deviation

#### 3. HP Retention (30% weight)

\`\`\`mermaid
graph LR
    A[End Battle HP] --> B{HP Remaining}
    B -->|< 40%| C[Easier -8%]
    B -->|40-70%| D[No Change]
    B -->|> 70%| E[Harder +8%]
\`\`\`

- **Target**: 40-70% HP remaining
- **Measurement**: Player HP at battle end / max HP
- **Adjustment**: ±8% per 10% deviation

### Multiplier Calculation

\`\`\`typescript
function calculateDifficultyMultiplier(
  history: PerformanceMetric[]
): number {
  let multiplier = 1.0
  
  // Win Rate (40% weight)
  const winRate = history.filter(m => m.won).length / history.length
  const winRateTarget = 0.7
  multiplier += (winRate - winRateTarget) * 0.4
  
  // Kill Speed (30% weight)
  const avgKillTime = average(history.map(m => m.killTime))
  const killTimeTarget = 30 // seconds
  const killTimeDiff = (avgKillTime - killTimeTarget) / 10
  multiplier -= killTimeDiff * 0.08
  
  // HP Retention (30% weight)
  const avgHPRetention = average(history.map(m => m.hpRemaining))
  const hpTarget = 0.55
  multiplier -= (avgHPRetention - hpTarget) * 0.8
  
  // Clamp to reasonable bounds
  return Math.max(0.6, Math.min(1.5, multiplier))
}
\`\`\`

### Tutorial Protection

DDA is disabled or reduced during the learning phase:

\`\`\`mermaid
graph TB
    A[Wave Number] --> B{Tutorial Check}
    B -->|1-3| C[DDA = 1.0x<br/>No adjustment]
    B -->|4| D[DDA = 1.0x<br/>Difficulty saw]
    B -->|5| E[DDA * 0.5<br/>Gradual intro]
    B -->|6+| F[Full DDA<br/>0.6x - 1.5x]
\`\`\`

## Implementation Details

### Data Structure

\`\`\`typescript
interface PerformanceMetric {
  won: boolean          // Did player win?
  killTime: number      // Seconds to defeat enemy
  hpRemaining: number   // HP % at battle end (0-1)
  wave: number          // Wave number for context
}

interface DDAState {
  history: PerformanceMetric[]  // Last 5 battles
  currentMultiplier: number     // Current difficulty
  lastUpdate: number            // Timestamp of last calc
}
\`\`\`

### Performance Tracking

\`\`\`typescript
// After each battle
const metric: PerformanceMetric = {
  won: playerHP > 0,
  killTime: (Date.now() - battleStartTime) / 1000,
  hpRemaining: playerHP / maxPlayerHP,
  wave: currentWave
}

// Add to history (keep last 5)
setPerformanceHistory(prev => 
  [...prev, metric].slice(-5)
)

// Recalculate multiplier
const newMultiplier = calculateDifficultyMultiplier(
  performanceHistory
)
\`\`\`

### Enemy HP Calculation

\`\`\`typescript
function calculateEnemyHP(
  wave: number, 
  ddaMultiplier: number
): number {
  // 1. Calculate base HP from wave number
  let baseHp = getBaseHPForWave(wave)
  
  // 2. Apply tutorial protection
  let finalMultiplier = 1.0
  if (wave >= 6) {
    finalMultiplier = ddaMultiplier
  } else if (wave === 5) {
    // 50% DDA impact on wave 5
    finalMultiplier = 1.0 + (ddaMultiplier - 1.0) * 0.5
  }
  // Waves 1-4: No DDA (multiplier stays 1.0)
  
  // 3. Apply multiplier and round
  return Math.round(baseHp * finalMultiplier)
}
\`\`\`

## Why This Works

### For Struggling Players (Multiplier < 1.0)

**Symptom**: Low win rate, slow kills, low HP
- DDA reduces enemy HP by up to 40%
- Gives breathing room to improve protocols
- Maintains engagement without frustration

### For Expert Players (Multiplier > 1.0)

**Symptom**: High win rate, fast kills, high HP
- DDA increases enemy HP by up to 50%
- Maintains challenge and engagement
- Prevents game from becoming too easy

### For Average Players (Multiplier ≈ 1.0)

**Symptom**: Moderate performance across all metrics
- DDA makes minimal adjustments
- Base scaling curve provides steady progression
- Flow state maintained naturally

## Visualization

### DDA Response Curve

\`\`\`mermaid
graph LR
    A[Player Performance] --> B{DDA Analysis}
    B -->|Struggling| C[0.6x - 0.9x<br/>Easier Enemies]
    B -->|Balanced| D[0.9x - 1.1x<br/>Minimal Change]
    B -->|Dominating| E[1.1x - 1.5x<br/>Harder Enemies]
    
    C --> F[Maintain Engagement]
    D --> F
    E --> F
\`\`\`

### Wave Progression

\`\`\`mermaid
graph TD
    A[Wave 1: 40 HP] --> B[Wave 2: 50 HP]
    B --> C[Wave 3: 60 HP]
    C --> D[Wave 4: 80 HP<br/>Difficulty Saw]
    D --> E[Wave 5: 90 HP<br/>50% DDA]
    E --> F[Wave 6-15<br/>Linear + Full DDA]
    F --> G[Wave 16+<br/>Exponential + DDA]
\`\`\`

## Testing the System

### Expected Behavior

1. **New Players** should see:
   - Consistent HP in waves 1-4
   - Gradual difficulty increase
   - Enemies become easier if struggling

2. **Skilled Players** should see:
   - Consistent HP in waves 1-4
   - Steeper difficulty curve
   - Challenging late-game content

3. **All Players** should see:
   - Smooth progression without spikes
   - Fair challenge that matches skill
   - Meaningful progression feeling

### Debug Logging

Add these logs to track DDA:

\`\`\`typescript
console.log('[v0] Performance:', {
  winRate: history.filter(m => m.won).length / history.length,
  avgKillTime: average(history.map(m => m.killTime)),
  avgHPRetain: average(history.map(m => m.hpRemaining))
})

console.log('[v0] DDA Multiplier:', ddaMultiplier)
console.log('[v0] Enemy HP:', baseHP, '*', multiplier, '=', finalHP)
