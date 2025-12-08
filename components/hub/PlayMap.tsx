import { useState } from "react";
import { useCursor } from "@react-three/drei";
import { GameMode } from "./types";
import { Terrain } from "./map/Terrain";
import { BreachCastle, OverloadCastle, MirrorCastle } from "./map/Castles";
import { DataCable } from "./map/MapUtils";
import { POS_BREACH, POS_OVERLOAD, POS_MIRROR } from "./map/config";

interface PlayMapProps {
  activeMode: GameMode;
  onSelectMode: (m: GameMode) => void;
}

export function PlayMap({ activeMode, onSelectMode }: PlayMapProps) {
  const [hoveredMode, setHoveredMode] = useState<GameMode>("NONE");

  // Logic to determine if a mode is "Lit Up"
  // It lights up if hovered OR if it's the currently active selected mode
  const getHighlightState = (mode: GameMode) => {
    return hoveredMode === mode || activeMode === mode;
  };

  useCursor(hoveredMode !== "NONE");

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. TERRAIN (Now receives active/hover state) */}
      <Terrain
        activeMode={activeMode}
        hoveredMode={hoveredMode}
        onSelectMode={onSelectMode}
        onHoverMode={setHoveredMode}
      />

      {/* 2. CASTLES */}
      <BreachCastle
        isSelected={activeMode === "BREACH"}
        isHovered={hoveredMode === "BREACH"}
        onClick={() => onSelectMode("BREACH")}
        onHover={(h) => setHoveredMode(h ? "BREACH" : "NONE")}
      />

      <OverloadCastle
        isSelected={activeMode === "OVERLOAD"}
        isHovered={hoveredMode === "OVERLOAD"}
        onClick={() => onSelectMode("OVERLOAD")}
        onHover={(h) => setHoveredMode(h ? "OVERLOAD" : "NONE")}
      />

      <MirrorCastle
        isSelected={activeMode === "MIRROR"}
        isHovered={hoveredMode === "MIRROR"}
        onClick={() => onSelectMode("MIRROR")}
        onHover={(h) => setHoveredMode(h ? "MIRROR" : "NONE")}
      />

      {/* 3. CABLES (We can also make these glow if needed) */}
      <DataCable
        start={[POS_BREACH.x, 0.5, POS_BREACH.y]}
        end={[POS_OVERLOAD.x, 0.5, POS_OVERLOAD.y]}
        color={
          getHighlightState("BREACH") || getHighlightState("OVERLOAD")
            ? "#fbbf24"
            : "#451a03"
        }
      />
      <DataCable
        start={[POS_BREACH.x, 0.5, POS_BREACH.y]}
        end={[POS_MIRROR.x, 1.0, POS_MIRROR.y]}
        color={
          getHighlightState("BREACH") || getHighlightState("MIRROR")
            ? "#22d3ee"
            : "#0e7490"
        }
      />
      <DataCable
        start={[POS_OVERLOAD.x, 0.5, POS_OVERLOAD.y]}
        end={[POS_MIRROR.x, 1.0, POS_MIRROR.y]}
        color={
          getHighlightState("OVERLOAD") || getHighlightState("MIRROR")
            ? "#ef4444"
            : "#450a0a"
        }
      />
    </group>
  );
}
