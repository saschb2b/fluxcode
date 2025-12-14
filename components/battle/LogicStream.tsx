"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Move, Sword } from "lucide-react";
import { ExecutedProtocol } from "@/types/game";

interface LogicStreamProps {
  logs: ExecutedProtocol[];
}

interface ActiveCard extends ExecutedProtocol {
  lastFiredAt: number;
}

export function LogicStream({ logs }: LogicStreamProps) {
  const [activeCards, setActiveCards] = useState<ActiveCard[]>([]);
  const processedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Safety check
    if (!logs || logs.length === 0) return;

    // 2. Filter duplicates
    const newLogs = logs.filter((log) => !processedIdsRef.current.has(log.id));
    if (newLogs.length === 0) return;

    // 3. Mark processed
    newLogs.forEach((log) => processedIdsRef.current.add(log.id));
    if (processedIdsRef.current.size > 100) {
      processedIdsRef.current.clear(); // Garbage collection
      newLogs.forEach((log) => processedIdsRef.current.add(log.id));
    }

    // 4. Update State
    setActiveCards((prev) => {
      const next = [...prev];
      const now = Date.now();

      newLogs.forEach((newLog) => {
        // Group by Action ID
        const existingIndex = next.findIndex(
          (c) => c.actionId === newLog.actionId,
        );

        if (existingIndex !== -1) {
          // Update Existing Card (Refresh cooldown visual)
          next[existingIndex] = {
            ...newLog,
            lastFiredAt: now,
          };
        } else {
          // Add New Card
          next.push({
            ...newLog,
            lastFiredAt: now,
          });
        }
      });

      // Remove cards older than 5 seconds
      return next.filter((c) => now - c.lastFiredAt < 5000);
    });
  }, [logs]);

  // Sort: Movement top, Tactical bottom
  const sortedCards = [...activeCards].sort((a, b) => {
    if (a.source !== b.source) return a.source === "movement" ? -1 : 1;
    return a.actionId.localeCompare(b.actionId);
  });

  return (
    <div className="absolute right-4 top-20 w-64 pointer-events-none flex flex-col gap-2 z-[200]">
      <div className="text-[10px] text-cyan-500/50 font-mono text-right border-b border-cyan-500/20 pb-1 mb-2 bg-black/40 backdrop-blur-sm px-2 rounded">
        PROTOCOL COOLDOWNS
      </div>

      <AnimatePresence mode="popLayout">
        {sortedCards.map((card) => (
          <LogicCard key={card.actionId} data={card} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Countdown({
  duration,
  startTime,
}: {
  duration: number;
  startTime: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frameId: number;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);

      if (ref.current) {
        // Format: "1.2s"
        ref.current.innerText = (remaining / 1000).toFixed(1) + "s";
      }

      if (remaining > 0) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [duration, startTime]);

  return <span ref={ref} className="font-mono text-[10px] tabular-nums" />;
}

function LogicCard({ data }: { data: ActiveCard }) {
  const isMove = data.source === "movement";
  const color = isMove
    ? "border-purple-500 bg-purple-950/80"
    : "border-orange-500 bg-orange-950/80";
  const icon = isMove ? (
    <Move className="w-3 h-3" />
  ) : (
    <Sword className="w-3 h-3" />
  );

  // Unique key forces animation restart on re-trigger
  const cooldownKey = `${data.actionId}-${data.lastFiredAt}`;

  return (
    <motion.div
      layout
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative p-2 rounded-l-md border-r-4 shadow-lg backdrop-blur-sm ${color} border-opacity-50 mb-1`}
    >
      <div className="flex justify-between items-center text-[9px] text-white/50 uppercase font-mono mb-1">
        <span className="flex items-center gap-1">
          <Zap className="w-2 h-2" />
          IF: <span className="text-white">{data.triggerName}</span>
        </span>

        {data.cooldown > 0 && (
          <div className="text-white/70 bg-black/40 px-1 rounded flex items-center">
            <Countdown duration={data.cooldown} startTime={data.lastFiredAt} />
          </div>
        )}
      </div>

      <div className={`flex items-center gap-2 font-bold text-sm text-white`}>
        {icon}
        <span className="uppercase tracking-wide">{data.actionName}</span>
      </div>

      {data.cooldown > 0 && (
        <div className="mt-1 h-0.5 w-full bg-black/50 rounded-full overflow-hidden">
          <motion.div
            key={cooldownKey}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: data.cooldown / 1000, ease: "linear" }}
            className={`h-full ${isMove ? "bg-purple-400" : "bg-orange-400"}`}
          />
        </div>
      )}
    </motion.div>
  );
}
