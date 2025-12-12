import { motion, AnimatePresence } from "motion/react";
import { Tab, GameMode } from "./types";
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
      {/* 1. TOP NAV (Always Visible) */}
      <div className="absolute top-0 left-0 w-full flex justify-center pt-6 z-30 pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto bg-black/80 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-2xl">
          <div className="px-3 text-gray-600 font-bold text-[10px] font-mono">
            [Q]
          </div>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                props.onSwitchTab(tab);
                props.onCloseMode();
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-[0.15em] transition-all ${
                props.activeTab === tab
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="px-3 text-gray-600 font-bold text-[10px] font-mono">
            [E]
          </div>
        </div>
      </div>

      {/* 2. PLAY TAB STATUS (Center Screen) */}
      <AnimatePresence>
        {props.activeTab === "PLAY" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20"
          >
            <div className="text-[10px] text-emerald-500 font-mono tracking-widest mb-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm border border-emerald-900/50">
              ACTIVE LINK
            </div>
            <div className="text-sm text-white font-bold tracking-wider shadow-black drop-shadow-md">
              {props.selectedConstruct ? "VANGUARD" : "NO UNIT"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MODE DETAIL PANEL (Right Side Slide-in) */}
      <AnimatePresence>
        {details && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="absolute right-0 top-0 h-full w-[450px] bg-gradient-to-l from-black via-black/95 to-transparent p-12 flex flex-col justify-center z-20"
          >
            <div className="border-l-4 border-white/20 pl-8 flex flex-col gap-5">
              {/* Header */}
              <div>
                <div
                  className={`text-6xl font-black italic uppercase tracking-tighter ${details.color} drop-shadow-lg`}
                >
                  {props.selectedMode}
                </div>
                <div className="text-xl text-white font-bold tracking-widest uppercase opacity-80">
                  {details.title}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-4">
                {details.desc}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">
                    Difficulty
                  </div>
                  <div className="text-sm text-white font-mono">
                    {details.difficulty}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">
                    Rewards
                  </div>
                  <div className="text-sm text-white font-mono">
                    {details.reward}
                  </div>
                </div>
              </div>

              {/* Main Action Button */}
              <button
                onClick={() => props.onStartMode(props.selectedMode)}
                className={`mt-6 px-8 py-5 bg-white text-black font-black text-xl uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]`}
              >
                INITIATE
              </button>

              {/* Close Button */}
              <button
                onClick={props.onCloseMode}
                className="text-xs text-gray-600 hover:text-white mt-2 text-left uppercase tracking-widest"
              >
                [ Abort Selection ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
