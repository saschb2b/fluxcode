import { useState } from "react";
import { useCursor, Sparkles } from "@react-three/drei";
import { GameMode } from "../types";
import { Terrain } from "./Terrain";
import {
  BreachCastle,
  OverloadCastle,
  MirrorCastle,
  ArenaCastle,
} from "./Castles";

interface PlayMapProps {
  activeMode: GameMode;
  onSelectMode: (m: GameMode) => void;
}

export function PlayMap({ activeMode, onSelectMode }: PlayMapProps) {
  const [hoveredMode, setHoveredMode] = useState<GameMode>("NONE");
  useCursor(hoveredMode !== "NONE");

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. TERRAIN */}
      <Terrain
        activeMode={activeMode}
        hoveredMode={hoveredMode}
        onSelectMode={onSelectMode}
        onHoverMode={setHoveredMode}
      />

      {/* 3. GAME MODES */}
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
      <ArenaCastle
        isSelected={activeMode === "ARENA"}
        isHovered={hoveredMode === "ARENA"}
        onClick={() => onSelectMode("ARENA")}
        onHover={(h) => setHoveredMode(h ? "ARENA" : "NONE")}
      />

      {/* 5. ATMOSPHERIC DATA */}
      <Sparkles
        count={100}
        scale={[20, 10, 20]}
        size={2}
        speed={0.4}
        opacity={0.2}
        color="#10b981"
        position={[0, 5, 0]}
      />
    </group>
  );
}
