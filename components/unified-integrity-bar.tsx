"use client";

import { Shield, Circle } from "lucide-react";
import { useMemo } from "react";

interface UnifiedIntegrityBarProps {
  // Entity identification
  entityName: string;
  isPlayer: boolean;

  // HP stats
  hp: number;
  maxHp: number;

  // Shield stats
  shields: number;
  maxShields: number;

  // Armor stats (shown as reduction percentage, not a bar)
  armor: number;
  maxArmor: number;

  // Status effect stacks (6 types)
  burnStacks?: number;
  viralStacks?: number;
  empStacks?: number;
  lagStacks?: number;
  displaceStacks?: number;
  corrosiveStacks?: number;

  // Display mode
  showStatusEffects?: boolean; // Show detailed status effects (on hover/target)
  compact?: boolean; // Compact mode for less space
}

export function UnifiedIntegrityBar({
  entityName,
  isPlayer,
  hp,
  maxHp,
  shields,
  maxShields,
  armor,
  maxArmor,
  burnStacks = 0,
  viralStacks = 0,
  empStacks = 0,
  lagStacks = 0,
  displaceStacks = 0,
  corrosiveStacks = 0,
  showStatusEffects = false,
  compact = false,
}: UnifiedIntegrityBarProps) {
  // Calculate percentages
  const hpPercent = (hp / maxHp) * 100;
  const shieldPercent = maxShields > 0 ? (shields / maxShields) * 100 : 0;
  const armorReduction = armor > 0 ? (armor / (armor + 300)) * 100 : 0;

  // Determine HP bar color based on health level
  const hpColor =
    hpPercent > 50 ? "#22c55e" : hpPercent > 25 ? "#eab308" : "#ef4444";

  // Calculate viral damage amplification
  const viralMultiplier = useMemo(() => {
    if (viralStacks === 0) return 0;
    const multipliers = [0.2, 0.35, 0.5, 0.75, 1.0];
    return multipliers[Math.min(viralStacks - 1, 4)];
  }, [viralStacks]);

  // Determine which value to show (top layer)
  const topLayerValue = shields > 0 ? shields : hp;
  const topLayerMax = shields > 0 ? maxShields : maxHp;

  return (
    <div className="flex flex-col items-center gap-1 pointer-events-none">
      {/* Entity name label */}
      <div className="text-xs font-bold text-foreground px-2 py-0.5 bg-card/80 rounded border border-border">
        {entityName}
      </div>

      {/* Main integrity section */}
      <div
        className={`flex flex-col ${compact ? "gap-0.5 w-28" : "gap-1 w-32"}`}
      >
        {/* Armor indicator (only if armor exists) */}
        {maxArmor > 0 && (
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-mono text-amber-400">
              (-{armorReduction.toFixed(1)}%)
            </span>
          </div>
        )}

        {/* Unified Integrity Bar (layered shields + HP) */}
        <div className="relative">
          {/* HP bar (base layer) */}
          <div
            className={`${compact ? "h-2" : "h-2.5"} bg-muted/50 rounded-sm border border-border overflow-hidden`}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${hpPercent}%`,
                backgroundColor: hpColor,
              }}
            />
          </div>

          {/* Shield bar (overlay layer) - only visible when shields exist */}
          {maxShields > 0 && shields > 0 && (
            <div
              className={`absolute top-0 left-0 ${compact ? "h-2" : "h-2.5"} bg-cyan-400/90 rounded-sm transition-all duration-300`}
              style={{
                width: `${shieldPercent}%`,
              }}
            />
          )}

          {/* Numerical readout (always shows top layer) */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <span
              className={`${compact ? "text-[10px]" : "text-xs"} font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}
            >
              {topLayerValue.toFixed(0)} / {topLayerMax}
            </span>
          </div>
        </div>
      </div>

      {/* Status Effects Row (conditional) */}
      {showStatusEffects && (
        <div className="flex items-center gap-1 mt-0.5">
          {/* Burn status */}
          {burnStacks > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-orange-500/20 border border-orange-500/50">
              <Circle className="w-2.5 h-2.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span className="text-[9px] font-mono text-orange-400">
                {burnStacks}
              </span>
            </div>
          )}

          {/* Viral status */}
          {viralStacks > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-500/20 border border-green-500/50">
              <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 animate-pulse" />
              <span className="text-[9px] font-mono text-green-400">
                {viralStacks} (+{(viralMultiplier * 100).toFixed(0)}%)
              </span>
            </div>
          )}

          {/* EMP status */}
          {empStacks > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-500/20 border border-blue-500/50">
              <Circle className="w-2.5 h-2.5 fill-blue-500 text-blue-500 animate-pulse" />
              <span className="text-[9px] font-mono text-blue-400">
                {empStacks}
              </span>
            </div>
          )}

          {/* Lag status */}
          {lagStacks > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/50">
              <Circle className="w-2.5 h-2.5 fill-cyan-500 text-cyan-500 animate-pulse" />
              <span className="text-[9px] font-mono text-cyan-400">
                {lagStacks} (+{lagStacks * 15}%)
              </span>
            </div>
          )}

          {/* Displace status */}
          {displaceStacks > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/50">
              <Circle className="w-2.5 h-2.5 fill-amber-500 text-amber-500 animate-bounce" />
              <span className="text-[9px] font-mono text-amber-400">
                {displaceStacks}
              </span>
            </div>
          )}

          {/* Corrosive status */}
          {corrosiveStacks > 0 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-lime-500/20 border border-lime-500/50">
              <Circle className="w-2.5 h-2.5 fill-lime-500 text-lime-500 animate-pulse" />
              <span className="text-[9px] font-mono text-lime-400">
                {corrosiveStacks}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
