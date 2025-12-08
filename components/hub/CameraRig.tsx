import { useEffect, useRef } from "react";
import { CameraControls, Environment } from "@react-three/drei";
import { VIEW_CONFIG, Tab, GameMode } from "./types";

interface CameraRigProps {
  activeTab: Tab;
  selectedMode: GameMode;
}

export function CameraRig({ activeTab, selectedMode }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    if (controlsRef.current) {
      let target = VIEW_CONFIG[activeTab] || VIEW_CONFIG.PLAY;

      // Override: If on PLAY tab and a Mode is selected, zoom to that mode
      if (activeTab === "PLAY" && selectedMode !== "NONE") {
        if (selectedMode === "BREACH") target = VIEW_CONFIG.BREACH_FOCUS;
        if (selectedMode === "OVERLOAD") target = VIEW_CONFIG.OVERLOAD_FOCUS;
        if (selectedMode === "MIRROR") target = VIEW_CONFIG.MIRROR_FOCUS;
      }

      controlsRef.current.setLookAt(
        target.pos[0],
        target.pos[1],
        target.pos[2], // Camera Position
        target.look[0],
        target.look[1],
        target.look[2], // Look At Target
        true, // Animate
      );
    }
  }, [activeTab, selectedMode]);

  return (
    <>
      <CameraControls
        ref={controlsRef}
        maxPolarAngle={Math.PI / 2.1} // Allow looking slightly lower
        minPolarAngle={0.1}
        minDistance={2}
        maxDistance={20}
        // Disable mouse interaction so the script controls the view
        mouseButtons={{ left: 0, right: 0, middle: 0, wheel: 0 }}
        touches={{ one: 0, two: 0, three: 0 }}
      />

      <Environment preset="city" environmentIntensity={0.3} />
      <ambientLight intensity={0.5} color="#475569" />
      <spotLight
        position={[10, 20, 10]}
        intensity={20}
        angle={0.5}
        penumbra={1}
        color="#60a5fa"
        castShadow
      />
    </>
  );
}
