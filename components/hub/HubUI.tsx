import { motion, AnimatePresence } from "motion/react";
import { Tab, GameMode } from "./types";
import {
  Terminal,
  Cpu,
  Wifi,
  Activity,
  Battery,
  ChevronRight,
} from "lucide-react";
import { MODE_DETAILS } from "./map/modeData";

interface HubUIProps {
  activeTab: Tab;
  onSwitchTab: (t: Tab) => void;
  selectedMode: GameMode;
  onCloseMode: () => void;
  onStartMode: (mode: GameMode) => void;
  selectedConstruct: any;
}

const TABS: Tab[] = ["PLAY", "CONSTRUCT", "SHOP", "NETWORK", "ARCHIVE"];

export function HubUI(props: HubUIProps) {
  const details =
    props.selectedMode !== "NONE" ? MODE_DETAILS[props.selectedMode] : null;

  return (
    <>
      {/* 1. TOP SYSTEM BAR (The "Waybar" / Polybar style) */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-start p-4 z-30 pointer-events-none font-mono text-xs">
        {/* Left: System Status */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#050a05]/90 border border-green-500/30 px-3 py-2 text-green-500">
            <Terminal className="w-4 h-4" />
            <span className="font-bold tracking-widest">VEIL_OS::ROOT</span>
          </div>
          <div className="flex items-center gap-4 bg-black/80 border-l border-green-500/30 px-3 py-1 text-green-500/60">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" /> <span>14%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3" /> <span>SECURE</span>
            </div>
            <div className="flex items-center gap-1">
              <Battery className="w-3 h-3" /> <span>98%</span>
            </div>
          </div>
        </div>

        {/* Center: Tab Switcher (The "Workspace" switcher) */}
        <div className="flex gap-2 pointer-events-auto">
          {TABS.map((tab, i) => {
            const isActive = props.activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  props.onSwitchTab(tab);
                  props.onCloseMode();
                }}
                className={`relative group px-6 py-2 border transition-all duration-100 ease-linear
                    ${
                      isActive
                        ? "bg-green-500 text-black border-green-500 font-bold"
                        : "bg-black/80 text-green-500/70 border-green-500/30 hover:border-green-500 hover:text-green-400"
                    }`}
              >
                <div className="flex items-center gap-2">
                  <span className="opacity-50">0{i + 1}</span>
                  <span className="tracking-wider">{tab}</span>
                </div>
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Time/Date */}
        <div className="bg-[#050a05]/90 border border-green-500/30 px-3 py-2 text-green-500 pointer-events-auto">
          <span className="animate-pulse mr-2">●</span>
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* 2. CONTEXT INFO (Floating lower left) */}
      <AnimatePresence>
        {props.activeTab === "PLAY" && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 left-8 z-20 pointer-events-none"
          >
            <div className="bg-black/80 border-l-2 border-green-500 p-4 font-mono text-green-500">
              <div className="text-[10px] opacity-50 mb-1">CURRENT_DAEMON</div>
              <div className="text-xl font-bold flex items-center gap-2">
                {props.selectedConstruct ? "VANGUARD" : "NULL_PTR"}
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div className="h-px w-full bg-green-500/30 my-2" />
              <div className="text-xs opacity-70">
                STATUS: ONLINE // READY FOR INJECTION
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MODE DETAIL PANEL (Terminal Window Style) */}
      <AnimatePresence>
        {details && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="absolute right-8 top-24 bottom-8 w-[400px] z-20 flex flex-col font-mono"
          >
            {/* Window Bar */}
            <div className="bg-green-500 text-black px-3 py-1 flex justify-between items-center text-xs font-bold uppercase">
              <span>/bin/{props.selectedMode.toLowerCase()}</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-black/50" />
                <div className="w-2 h-2 bg-black/50" />
                <button
                  onClick={props.onCloseMode}
                  className="w-2 h-2 bg-black hover:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 bg-black/90 border-x border-b border-green-500/50 p-6 flex flex-col backdrop-blur-md">
              {/* Header Ascii-ish */}
              <div className="border-b border-green-500/30 pb-4 mb-4">
                <div
                  className={`text-4xl font-black uppercase tracking-tighter ${details.color} opacity-90`}
                >
                  {props.selectedMode}
                </div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-widest">
                  &gt;&gt; {details.title}
                </div>
              </div>

              {/* Body */}
              <div className="text-sm text-green-100/80 leading-relaxed mb-6">
                <span className="text-green-500 font-bold mr-2">DESC:</span>
                {details.desc}
              </div>

              {/* Stats Table style */}
              <div className="grid grid-rows-2 gap-px bg-green-500/30 border border-green-500/30 mb-8">
                <div className="bg-black/80 p-3 flex justify-between items-center">
                  <span className="text-[10px] text-green-500/70 uppercase">
                    DIFFICULTY_RATING
                  </span>
                  <span className="text-white font-bold">
                    {details.difficulty}
                  </span>
                </div>
                <div className="bg-black/80 p-3 flex justify-between items-center">
                  <span className="text-[10px] text-green-500/70 uppercase">
                    PROJECTED_YIELD
                  </span>
                  <span className="text-white font-bold">{details.reward}</span>
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <button
                  onClick={() => props.onStartMode(props.selectedMode)}
                  className="w-full group relative overflow-hidden bg-green-600 hover:bg-green-500 text-black py-4 font-bold uppercase tracking-widest text-lg transition-all"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span>EXECUTE</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {/* Scanline overlay on button */}
                  <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none" />
                </button>

                <button
                  onClick={props.onCloseMode}
                  className="w-full py-2 text-xs text-green-500/50 hover:text-green-500 hover:bg-green-500/10 transition-colors uppercase tracking-widest"
                >
                  [ ABORT PROCESS ]
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
