"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  onClose: () => void;
  onClaimReward: (contractId: string, refreshType: "daily" | "weekly") => void;
  onForceRefresh?: () => void;
}

export function NetworkContractsView({
  dailyContracts,
  weeklyContracts,
  onClose,
  onClaimReward,
  onForceRefresh,
}: NetworkContractsViewProps) {
  const [expandedContract, setExpandedContract] =
    useState<NetworkContractWithClaimed | null>(null);

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = Math.max(0, expiresAt - now);
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "standard":
        return "text-green-400 border-green-500/50 bg-green-500/10";
      case "advanced":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
      case "elite":
        return "text-red-400 border-red-500/50 bg-red-500/10";
      default:
        return "text-cyan-400 border-cyan-500/50 bg-cyan-500/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "damage-type":
        return <Flame className="w-5 h-5" />;
      case "trigger-usage":
        return <Zap className="w-5 h-5" />;
      case "action-usage":
        return <Target className="w-5 h-5" />;
      case "survival":
        return <Shield className="w-5 h-5" />;
      case "efficiency":
        return <Trophy className="w-5 h-5" />;
      case "combo":
        return <Target className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const renderContract = (contract: NetworkContractWithClaimed) => {
    const isClaimed = contract.claimed === true;

    if (isClaimed) return null;

    const progressPercent = (contract.progress / contract.maxProgress) * 100;
    const difficultyClass = getDifficultyColor(contract.difficulty);
    const canClaim = contract.progress >= contract.maxProgress;

    return (
      <div
        key={contract.id}
        className={`relative overflow-hidden bg-black/80 backdrop-blur-md border-2 ${difficultyClass}
          shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]
          transition-all hover:scale-[1.02] group cursor-pointer`}
        onClick={() => setExpandedContract(contract)}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-magenta-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-4 md:p-6">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:flex items-center gap-4">
            {/* Icon & Difficulty Badge */}
            <div className="flex flex-col items-center gap-2 min-w-[70px]">
              <div className={`p-3 rounded-lg border-2 ${difficultyClass}`}>
                {getTypeIcon(contract.type)}
              </div>
              <span
                className={`text-xs font-bold uppercase px-2 py-1 rounded border ${difficultyClass}`}
              >
                {contract.difficulty}
              </span>
            </div>

            {/* Title & Description */}
            <div className="flex-1 space-y-2 min-w-0">
              <h3
                className="text-lg font-bold text-cyan-400"
                style={{ fontFamily: "monospace" }}
              >
                {contract.name}
              </h3>
              <p className="text-sm text-cyan-300/80 leading-relaxed max-h-[3.6em] overflow-hidden">
                {contract.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-300/70">PROGRESS</span>
                  <span
                    className="text-cyan-400 font-bold"
                    style={{ fontFamily: "monospace" }}
                  >
                    {contract.progress} / {contract.maxProgress}
                  </span>
                </div>
                <div className="w-full h-2 bg-black/50 border border-cyan-400/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r transition-all duration-500 ${
                      canClaim
                        ? "from-green-400 to-cyan-400"
                        : "from-cyan-400/50 to-magenta-400/50"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Rewards & Actions */}
            <div className="flex flex-col items-end gap-2 min-w-[130px]">
              <div className="flex items-center gap-2 text-yellow-400 bg-black/40 px-3 py-2 rounded-lg border border-yellow-500/30">
                <Coins className="w-4 h-4" />
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: "monospace" }}
                >
                  {contract.rewards.cipherFragments}
                </span>
                <span className="text-xs">CF</span>
              </div>

              {canClaim ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "[v0] Claim button clicked for contract:",
                      contract.id,
                      contract.name,
                    );
                    onClaimReward(contract.id, contract.refreshType);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(0,255,0,0.5)]"
                  size="sm"
                >
                  CLAIM
                </Button>
              ) : (
                <div className="w-full text-center text-xs text-cyan-400/50 font-bold py-2">
                  IN PROGRESS
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-cyan-400/70">
                <span>Details</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-lg border ${difficultyClass} shrink-0`}
                >
                  {getTypeIcon(contract.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-bold text-cyan-400"
                    style={{ fontFamily: "monospace" }}
                  >
                    {contract.name}
                  </h3>
                  <p className="text-xs text-cyan-300/80 mt-1 leading-relaxed max-h-[4.5em] overflow-hidden">
                    {contract.description}
                  </p>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-lg border ${difficultyClass} text-xs font-bold uppercase shrink-0`}
              >
                {contract.difficulty}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300/70">Progress</span>
                <span
                  className="text-cyan-400 font-bold"
                  style={{ fontFamily: "monospace" }}
                >
                  {contract.progress} / {contract.maxProgress}
                </span>
              </div>
              <div className="w-full h-2 bg-black/50 border border-cyan-400/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r transition-all duration-500 ${
                    canClaim
                      ? "from-green-400 to-cyan-400"
                      : "from-cyan-400/50 to-magenta-400/50"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/30">
              <div className="flex items-center gap-2 text-yellow-400">
                <Coins className="w-4 h-4" />
                <span className="font-bold" style={{ fontFamily: "monospace" }}>
                  {contract.rewards.cipherFragments} CF
                </span>
              </div>

              {canClaim ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "[v0] Claim button clicked (mobile) for contract:",
                      contract.id,
                      contract.name,
                    );
                    onClaimReward(contract.id, contract.refreshType);
                  }}
                  className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(0,255,0,0.5)] px-8"
                  size="sm"
                >
                  CLAIM
                </Button>
              ) : (
                <div className="text-center text-xs text-cyan-400/50 font-bold py-2">
                  IN PROGRESS
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="w-full max-w-7xl bg-gradient-to-br from-[#0a0015] via-[#1a0030] to-[#0a0015] border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(0,255,255,0.3)] max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-950/95 via-magenta-950/95 to-cyan-950/95 backdrop-blur-md border-b-2 border-cyan-500/50">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50 animate-pulse" />
                    <div className="relative p-3 rounded-lg bg-black border-2 border-cyan-500">
                      <Radio className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <h2
                      className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1"
                      style={{ fontFamily: "monospace" }}
                    >
                      NETWORK BROADCAST
                    </h2>
                    <p className="text-sm text-cyan-300/70">
                      Active Contracts // Protocol Directives
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onForceRefresh && (
                    <Button
                      onClick={onForceRefresh}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    >
                      Force Refresh (Dev)
                    </Button>
                  )}
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-500/20 active:scale-95"
                  >
                    <X className="w-6 h-6 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Daily Contracts */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-transparent border-l-4 border-cyan-500 rounded-r-lg">
                <Zap className="w-6 h-6 text-cyan-400" />
                <div className="flex-1">
                  <h3
                    className="text-xl md:text-2xl font-bold text-cyan-400"
                    style={{ fontFamily: "monospace" }}
                  >
                    DAILY DIRECTIVES
                  </h3>
                  <p className="text-xs text-cyan-300/70">
                    24-Hour Rotation // High Frequency Operations
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-cyan-300/70 text-sm">
                    <Clock className="w-5 h-5" />
                    <span style={{ fontFamily: "monospace" }}>
                      {dailyContracts[0] &&
                        formatTimeRemaining(dailyContracts[0].expiresAt)}
                    </span>
                  </div>
                  <div
                    className="text-right text-cyan-300/70 text-sm"
                    style={{ fontFamily: "monospace" }}
                  >
                    {dailyContracts.filter((c) => c.claimed).length} /{" "}
                    {dailyContracts.length} COMPLETE
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyContracts.map(renderContract)}
              </div>
            </div>

            {/* Weekly Contracts */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-magenta-500/20 to-transparent border-l-4 border-magenta-500 rounded-r-lg">
                <Trophy className="w-6 h-6 text-magenta-400" />
                <div className="flex-1">
                  <h3
                    className="text-xl md:text-2xl font-bold text-magenta-400"
                    style={{ fontFamily: "monospace" }}
                  >
                    WEEKLY OPERATIONS
                  </h3>
                  <p className="text-xs text-magenta-300/70">
                    7-Day Cycle // Strategic Campaigns
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-magenta-300/70 text-sm">
                    <Clock className="w-5 h-5" />
                    <span style={{ fontFamily: "monospace" }}>
                      {weeklyContracts[0] &&
                        formatTimeRemaining(weeklyContracts[0].expiresAt)}
                    </span>
                  </div>
                  <div
                    className="text-right text-magenta-300/70 text-sm"
                    style={{ fontFamily: "monospace" }}
                  >
                    {weeklyContracts.filter((c) => c.claimed).length} /{" "}
                    {weeklyContracts.length} COMPLETE
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyContracts.map(renderContract)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {expandedContract && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          onClick={() => setExpandedContract(null)}
        >
          <div
            className="w-full max-w-2xl bg-gradient-to-br from-[#0a0015] via-[#1a0030] to-[#0a0015] border-2 border-cyan-500/50 rounded-lg shadow-[0_0_40px_rgba(0,255,255,0.5)] p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`p-4 rounded-lg border-2 ${getDifficultyColor(expandedContract.difficulty)}`}
                >
                  {getTypeIcon(expandedContract.type)}
                </div>
                <div className="flex-1">
                  <h2
                    className="text-2xl font-bold text-cyan-400 mb-2"
                    style={{ fontFamily: "monospace" }}
                  >
                    {expandedContract.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold uppercase px-3 py-1 rounded border ${getDifficultyColor(expandedContract.difficulty)}`}
                    >
                      {expandedContract.difficulty}
                    </span>
                    <span className="text-sm text-cyan-300/70">
                      {expandedContract.refreshType === "daily"
                        ? "Daily Directive"
                        : "Weekly Operation"}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setExpandedContract(null)}
                variant="ghost"
                size="icon"
                className="hover:bg-red-500/20 shrink-0"
              >
                <X className="w-5 h-5 text-red-400" />
              </Button>
            </div>

            {/* Full Description */}
            <div className="space-y-2 p-4 bg-black/40 rounded-lg border border-cyan-500/30">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                Objective Brief
              </h3>
              <p className="text-base text-cyan-300 leading-relaxed">
                {expandedContract.description}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3 p-4 bg-black/40 rounded-lg border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                  Progress Status
                </h3>
                <span
                  className="text-cyan-400 font-bold text-lg"
                  style={{ fontFamily: "monospace" }}
                >
                  {expandedContract.progress} / {expandedContract.maxProgress}
                </span>
              </div>
              <div className="w-full h-4 bg-black/50 border border-cyan-400/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r transition-all duration-500 ${
                    expandedContract.progress >= expandedContract.maxProgress
                      ? "from-green-400 to-cyan-400"
                      : "from-cyan-400/50 to-magenta-400/50"
                  }`}
                  style={{
                    width: `${(expandedContract.progress / expandedContract.maxProgress) * 100}%`,
                  }}
                />
              </div>
              {expandedContract.progress >= expandedContract.maxProgress && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  OBJECTIVE COMPLETE
                </div>
              )}
            </div>

            {/* Rewards & Action */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-xs text-yellow-300/70 uppercase">
                    Contract Reward
                  </p>
                  <p
                    className="text-2xl font-bold text-yellow-400"
                    style={{ fontFamily: "monospace" }}
                  >
                    {expandedContract.rewards.cipherFragments} CF
                  </p>
                </div>
              </div>

              {expandedContract.progress >= expandedContract.maxProgress ? (
                <Button
                  onClick={() => {
                    console.log(
                      "[v0] Claim button clicked (expanded) for contract:",
                      expandedContract.id,
                      expandedContract.name,
                    );
                    onClaimReward(
                      expandedContract.id,
                      expandedContract.refreshType,
                    );
                    setExpandedContract(null);
                  }}
                  className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(0,255,0,0.5)] px-8"
                  size="lg"
                >
                  CLAIM REWARD
                </Button>
              ) : (
                <div className="text-cyan-400/50 font-bold text-lg">
                  IN PROGRESS
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
