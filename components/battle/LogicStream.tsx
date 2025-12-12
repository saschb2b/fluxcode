"use client";

import { motion, AnimatePresence } from "motion/react";
import { Zap, Move, Sword } from "lucide-react";

// Types for the log entries
export interface LogicLogEntry {
  id: string;
  timestamp: number;
  type: "movement" | "tactical";
  name: string;
  triggerName: string;
  cooldown?: number;
}

interface LogicStreamProps {
  logs: LogicLogEntry[]; // Stream of recent activations
}

export function LogicStream({ logs }: LogicStreamProps) {
  const recentLogs = logs.slice(-1).reverse();

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-64 pointer-events-none select-none flex flex-col gap-2">
      <div className="text-[10px] text-cyan-500/50 font-mono text-right border-b border-cyan-500/20 pb-1 mb-2">
        NEURAL THREAD :: ACTIVE
      </div>

      <AnimatePresence mode="popLayout">
        {recentLogs.map((log) => (
          <LogicCard key={log.id} log={log} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function LogicCard({ log }: { log: LogicLogEntry }) {
  const isMove = log.type === "movement";
  const color = isMove
    ? "border-purple-500 bg-purple-950/80"
    : "border-orange-500 bg-orange-950/80";
  const textColor = isMove ? "text-purple-300" : "text-orange-300";
  const icon = isMove ? (
    <Move className="w-3 h-3" />
  ) : (
    <Sword className="w-3 h-3" />
  );

  return (
    <motion.div
      layout
      initial={{ x: 50, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`relative flex flex-col p-2 rounded-l-md border-r-4 shadow-lg backdrop-blur-sm ${color} border-opacity-50`}
    >
      {/* Connector Line to "brain" */}
      <div
        className={`absolute -right-1 top-1/2 w-2 h-[2px] ${isMove ? "bg-purple-500" : "bg-orange-500"}`}
      />

      {/* Header: Trigger Condition */}
      <div className="flex justify-between items-center text-[9px] text-white/50 uppercase font-mono mb-1">
        <span className="flex items-center gap-1">
          <Zap className="w-2 h-2" />
          IF: <span className="text-white">{log.triggerName}</span>
        </span>
        <span>{log.type.substring(0, 3)}</span>
      </div>

      {/* Main Action */}
      <div className={`flex items-center gap-2 font-bold text-sm ${textColor}`}>
        {icon}
        <span className="uppercase tracking-wide">{log.name}</span>
      </div>

      {/* Cooldown Visual (if applicable) */}
      {log.cooldown && log.cooldown > 0 && (
        <div className="mt-1 h-0.5 w-full bg-black/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: log.cooldown / 1000, ease: "linear" }}
            className={`h-full ${isMove ? "bg-purple-400" : "bg-orange-400"}`}
          />
        </div>
      )}
    </motion.div>
  );
}
