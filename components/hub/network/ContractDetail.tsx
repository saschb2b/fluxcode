import { motion } from "motion/react";
import {
  X,
  Trophy,
  Shield,
  Flame,
  Target,
  Coins,
  AlertTriangle,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NetworkContractWithClaimed } from "@/lib/network-contracts";

interface ContractDetailProps {
  contract: NetworkContractWithClaimed;
  onClose: () => void;
  onClaim: () => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "damage-type":
      return <Flame className="w-5 h-5" />;
    case "survival":
      return <Shield className="w-5 h-5" />;
    case "efficiency":
      return <Trophy className="w-5 h-5" />;
    default:
      return <Target className="w-5 h-5" />;
  }
};

export function ContractDetail({
  contract,
  onClose,
  onClaim,
}: ContractDetailProps) {
  const isDaily = contract.refreshType === "daily";
  const themeColor = isDaily ? "text-amber-400" : "text-fuchsia-400";
  const borderColor = isDaily ? "border-amber-500/50" : "border-fuchsia-500/50";
  const glowColor = isDaily ? "shadow-amber-500/20" : "shadow-fuchsia-500/20";
  const bgGradient = isDaily
    ? "from-amber-950/90 via-black/95 to-amber-950/90"
    : "from-fuchsia-950/90 via-black/95 to-fuchsia-950/90";

  const isComplete = contract.progress >= contract.maxProgress;
  const progressPercent = Math.min(
    (contract.progress / contract.maxProgress) * 100,
    100,
  );

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`w-[450px] relative overflow-hidden rounded-xl border-2 ${borderColor} bg-gradient-to-br ${bgGradient} shadow-2xl ${glowColor} backdrop-blur-xl p-1`}
    >
      {/* Animated Scanline Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 50%, rgba(255, 255, 255, 0.05) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div
              className={`p-3 rounded-lg border bg-black/50 ${borderColor} ${themeColor}`}
            >
              {getTypeIcon(contract.type)}
            </div>
            <div>
              <div
                className={`text-[10px] font-mono uppercase tracking-widest opacity-70 ${themeColor}`}
              >
                {isDaily ? "Daily Directive" : "Weekly Operation"}
                {contract.difficulty}
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight italic leading-none mt-1">
                {contract.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY TEXT */}
        <div className="bg-black/40 border border-white/10 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2 opacity-50">
            <Terminal className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase">
              Mission Brief
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            {contract.description}
          </p>
        </div>

        {/* PROGRESS SECTION */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-mono mb-2 uppercase tracking-wider">
            <span className="text-gray-500">Completion Status</span>
            <span className={themeColor}>{Math.floor(progressPercent)}%</span>
          </div>
          <div className="h-4 w-full bg-black/60 rounded-full border border-white/10 overflow-hidden relative">
            {/* Grid Lines on bar */}
            <div className="absolute inset-0 z-10 flex justify-between px-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-px h-full bg-black/30" />
              ))}
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full ${isComplete ? "bg-emerald-500" : isDaily ? "bg-amber-500" : "bg-fuchsia-500"}`}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] font-mono text-gray-500">
            <span>0</span>
            <span>
              {contract.progress} / {contract.maxProgress}
            </span>
          </div>
        </div>

        {/* FOOTER / REWARDS */}
        <div
          className={`mt-auto border-t ${borderColor} pt-4 flex items-center justify-between`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              Bounty
            </span>
            <div
              className={`flex items-center gap-2 text-xl font-bold ${themeColor}`}
            >
              <Coins className="w-5 h-5" />
              <span>{contract.rewards.cipherFragments}</span>
            </div>
          </div>

          {isComplete ? (
            <Button
              onClick={onClaim}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              CLAIM REWARD
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded border border-white/10 text-gray-400 text-xs font-mono uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>In Progress</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
