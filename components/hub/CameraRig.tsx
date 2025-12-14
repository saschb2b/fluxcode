import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { VIEW_CONFIG, Tab, GameMode } from "./types";

interface CameraRigProps {
  activeTab: Tab;
  selectedMode: GameMode;
}

export function CameraRig({ activeTab, selectedMode }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null);
  const { size } = useThree();

  useEffect(() => {
    if (controlsRef.current) {
      let config = VIEW_CONFIG[activeTab] || VIEW_CONFIG.PLAY;

      // Handle Game Mode overrides
      if (activeTab === "PLAY" && selectedMode !== "NONE") {
        if (selectedMode === "BREACH") config = VIEW_CONFIG.BREACH_FOCUS;
        if (selectedMode === "OVERLOAD") config = VIEW_CONFIG.OVERLOAD_FOCUS;
        if (selectedMode === "MIRROR") config = VIEW_CONFIG.MIRROR_FOCUS;
        if (selectedMode === "ARENA") config = VIEW_CONFIG.ARENA_FOCUS;
      }

      // --- RESPONSIVE LOGIC ---
      const targetAspect = 1.77;
      const currentAspect = size.width / size.height;
      const fitRatio =
        currentAspect < targetAspect ? targetAspect / currentAspect : 1;

      const lookAtVec = new THREE.Vector3(...config.look);
      const posVec = new THREE.Vector3(...config.pos);
      const direction = new THREE.Vector3().subVectors(posVec, lookAtVec);

      direction.multiplyScalar(fitRatio);

      const finalPos = new THREE.Vector3().addVectors(lookAtVec, direction);

      controlsRef.current.setLookAt(
        finalPos.x,
        finalPos.y,
        finalPos.z,
        lookAtVec.x,
        lookAtVec.y,
        lookAtVec.z,
        true, // Keep 'true' to enable transition, but we control speed via props below
      );
    }
  }, [activeTab, selectedMode, size.width, size.height]);

  return (
    <>
      <CameraControls
        ref={controlsRef}
        // SNAPPY MOVEMENT SETTINGS
        smoothTime={0.1} // Reduced from default (~0.25) for digital/robotic feel
        draggingSmoothTime={0.1} // Responsive if we allowed drag
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0.1}
        minDistance={2}
        maxDistance={50}
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
