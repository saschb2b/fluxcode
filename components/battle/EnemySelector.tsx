import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENEMY_REGISTRY } from "@/lib/enemies/registry";

interface EnemySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EnemySelector({
  value,
  onChange,
  disabled,
}: EnemySelectorProps) {
  const options = Object.values(ENEMY_REGISTRY).sort((a, b) => {
    if (a.tier !== b.tier) return a.tier.localeCompare(b.tier);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-cyan-500/70 uppercase">
        Target:
      </span>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[200px] h-8 bg-black/50 border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <SelectValue placeholder="Select Enemy" />
        </SelectTrigger>

        {/* FIX: Added z-[200] to ensure it renders ABOVE the BenchmarkArena overlay */}
        <SelectContent className="bg-black/90 border-cyan-500/50 text-cyan-400 z-[200]">
          {options.map((enemy) => (
            <SelectItem
              key={enemy.id}
              value={enemy.id}
              className="font-mono text-xs focus:bg-cyan-500/20 focus:text-cyan-200"
            >
              <span className="opacity-50 mr-2">
                [{enemy.tier.toUpperCase()}]
              </span>
              {enemy.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
