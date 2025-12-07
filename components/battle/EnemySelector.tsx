import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENEMY_REGISTRY } from "@/lib/enemies/registry";
import { EnemyDefinition } from "@/lib/enemies/types";

interface EnemySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Helper to capitalize strings
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function EnemySelector({
  value,
  onChange,
  disabled,
}: EnemySelectorProps) {
  // 1. Group and sort the enemies from the registry
  const groupedEnemies = useMemo(() => {
    const groups: Record<string, EnemyDefinition[]> = {};
    const tierOrder: Record<string, number> = {
      alpha: 1,
      beta: 2,
      gamma: 3,
      omega: 4,
    };

    // Group by base name (e.g., "sentry" from "sentry-alpha")
    for (const enemy of Object.values(ENEMY_REGISTRY)) {
      const groupName = enemy.id.split("-")[0];
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(enemy);
    }

    // Sort variants within each group by tier
    for (const groupName in groups) {
      groups[groupName].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
    }

    return groups;
  }, []);

  // Get sorted group names for rendering order
  const sortedGroupNames = useMemo(
    () => Object.keys(groupedEnemies).sort(),
    [groupedEnemies],
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-cyan-500/70 uppercase">
        Target:
      </span>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[200px] h-8 bg-black/50 border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <SelectValue placeholder="Select Enemy" />
        </SelectTrigger>

        <SelectContent className="bg-black/90 border-cyan-500/50 text-cyan-400 z-[200]">
          {/* 2. Render each group */}
          {sortedGroupNames.map((groupName) => (
            <SelectGroup key={groupName}>
              {/* The Group Header (e.g., SENTRY) */}
              <SelectLabel className="px-2 py-1.5 font-bold text-xs uppercase text-cyan-500/60">
                {groupName}
              </SelectLabel>

              {/* The Items within the group */}
              {groupedEnemies[groupName].map((enemy) => (
                <SelectItem
                  key={enemy.id}
                  value={enemy.id}
                  className="font-mono text-xs focus:bg-cyan-500/20 focus:text-cyan-200 pl-4"
                >
                  {/* Show the variant name (e.g., Alpha) */}
                  {capitalize(enemy.tier)}

                  {/* Optional: Add a subtle description */}
                  <span className="text-cyan-500/50 ml-2 text-[10px]">
                    - {enemy.logicCheck}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
