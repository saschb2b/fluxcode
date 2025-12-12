"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Clock,
  Trophy,
  Zap,
  Target,
  Shield,
  Flame,
  Coins,
  Radio,
  ChevronRight,
} from "lucide-react";
import type { NetworkContractWithClaimed } from "@/lib/network-contracts";
import { useState } from "react";

interface NetworkContractsViewProps {
  dailyContracts: NetworkContractWithClaimed[];
  weeklyContracts: NetworkContractWithClaimed[];
  onClaimReward: (contractId: string, refreshType: "daily" | "weekly") => void;
  onForceRefresh?: () => void;
  onClose: () => void;
  embedded?: boolean;
}

export function NetworkContractsView({
  dailyContracts,
  weeklyContracts,
  onClose,
  onClaimReward,
  onForceRefresh,
  embedded = false,
}: NetworkContractsViewProps) {
  const [expandedContract, setExpandedContract] =
    useState<NetworkContractWithClaimed | null>(null);

  // ... (Keep helper functions like formatTimeRemaining, getDifficultyColor, etc.) ...

  // Re-paste helper functions here for completeness or keep existing imports if moved
  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = Math.max(0, expiresAt - now);
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === "standard")
      return "text-green-400 border-green-500/30 bg-green-500/10";
    if (diff === "advanced")
      return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

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

  const renderContract = (contract: NetworkContractWithClaimed) => {
    // ... (Keep render logic identical to before) ...
    // Just ensure styles match the new theme if needed
    const isClaimed = contract.claimed === true;
    if (isClaimed) return null;

    const progressPercent = (contract.progress / contract.maxProgress) * 100;
    const difficultyClass = getDifficultyColor(contract.difficulty);
    const canClaim = contract.progress >= contract.maxProgress;

    return (
      <div
        key={contract.id}
        className={`relative overflow-hidden bg-black/40 backdrop-blur-md border ${difficultyClass}
          hover:bg-white/5 transition-all hover:scale-[1.01] group cursor-pointer rounded-lg`}
        onClick={() => setExpandedContract(contract)}
      >
        <div className="relative p-4 flex items-center gap-4">
          {/* Icon Box */}
          <div
            className={`p-3 rounded-lg border bg-black/50 ${difficultyClass} shrink-0`}
          >
            {getTypeIcon(contract.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-amber-400 font-mono tracking-wide">
                  {contract.name}
                </h3>
                <p className="text-xs text-amber-200/60 line-clamp-1">
                  {contract.description}
                </p>
              </div>
              {/* Rewards */}
              <div className="flex items-center gap-1 text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-500/20">
                <Coins className="w-3 h-3" />
                <span className="font-mono font-bold text-sm">
                  {contract.rewards.cipherFragments}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] text-amber-200/50 uppercase font-mono">
                <span>Status</span>
                <span>
                  {contract.progress} / {contract.maxProgress}
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-500 ${canClaim ? "bg-green-400" : "bg-amber-500"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Arrow */}
          <div className="text-amber-500/50 group-hover:text-amber-400">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={
          embedded
            ? "w-full h-full flex flex-col bg-black/80 backdrop-blur-md overflow-hidden border-2 border-amber-500/50 shadow-2xl"
            : "fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        }
      >
        <div
          className={
            embedded
              ? "w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-amber-950/20 to-black"
              : "w-full max-w-5xl h-[85vh] flex flex-col bg-black border border-amber-500/50 rounded-xl overflow-hidden"
          }
        >
          {/* HEADER - Fixed Height */}
          <div className="p-6 border-b border-amber-500/30 bg-black/40 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/50">
                  <Radio className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-400 font-mono tracking-widest">
                    THE NEURAL EXCHANGE
                  </h2>
                  <p className="text-xs text-amber-200/50 uppercase tracking-widest">
                    Active Contracts // Bounty Board
                  </p>
                </div>
              </div>

              {!embedded && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-amber-400 hover:bg-amber-500/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>

          {/* SCROLLABLE CONTENT AREA */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="p-6 space-y-8 pb-20">
                {/* DAILY SECTION */}
                <section>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Zap className="w-4 h-4" />
                      <h3 className="font-bold font-mono tracking-wider">
                        DAILY DIRECTIVES
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-500/70 bg-amber-500/10 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">
                        {dailyContracts[0] &&
                          formatTimeRemaining(dailyContracts[0].expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dailyContracts.map(renderContract)}
                  </div>
                </section>

                {/* WEEKLY SECTION */}
                <section>
                  <div className="flex items-center justify-between mb-4 px-2 pt-4 border-t border-amber-500/10">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Trophy className="w-4 h-4" />
                      <h3 className="font-bold font-mono tracking-wider">
                        WEEKLY OPERATIONS
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-500/70 bg-amber-500/10 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">
                        {weeklyContracts[0] &&
                          formatTimeRemaining(weeklyContracts[0].expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {weeklyContracts.map(renderContract)}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {expandedContract && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
          onClick={() => setExpandedContract(null)}
        >
          <div
            className="w-full max-w-lg bg-black border border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-amber-500/50 font-mono mb-1 uppercase">
                  Contract Details
                </div>
                <h2 className="text-2xl font-bold text-amber-400 font-mono">
                  {expandedContract.name}
                </h2>
              </div>
              <Button
                onClick={() => setExpandedContract(null)}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-amber-500/50 hover:text-amber-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded text-sm text-amber-200/80 leading-relaxed">
                {expandedContract.description}
              </div>

              <div className="flex items-center justify-between p-4 bg-black border border-amber-500/30 rounded">
                <span className="text-amber-500/70 text-sm font-mono uppercase">
                  Reward
                </span>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xl">
                  <Coins className="w-5 h-5" />
                  {expandedContract.rewards.cipherFragments}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            {expandedContract.progress >= expandedContract.maxProgress ? (
              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono tracking-widest py-6"
                onClick={() => {
                  onClaimReward(
                    expandedContract.id,
                    expandedContract.refreshType,
                  );
                  setExpandedContract(null);
                }}
              >
                CLAIM BOUNTY
              </Button>
            ) : (
              <div className="w-full py-4 text-center border border-amber-500/30 text-amber-500/50 font-mono text-sm uppercase tracking-widest">
                Status: Incomplete
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
