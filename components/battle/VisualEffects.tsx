"use client";

import { Environment, Sparkles } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";

export function VisualEffects() {
  return (
    <>
      {/* 1. REFLECTIONS */}
      <Environment preset="night" environmentIntensity={0.5} />

      {/* 2. POST-PROCESSING */}
      <EffectComposer disableNormalPass>
        {/* Increased threshold so only the lasers/grid-lines glow, not the floor */}
        <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.8} />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
        <Noise opacity={0.05} />
      </EffectComposer>

      {/* 3. UNDER-GLOW PARTICLES (Replaces the Cone) */}
      {/* Subtle blue energy rising from the void */}
      <Sparkles
        count={60}
        scale={[8, 4, 6]} // Width, Height, Depth
        position={[0, -2, 0]}
        size={4}
        speed={0.4}
        opacity={0.5}
        color="#3b82f6"
        noise={0.2}
      />

      {/* 4. POINT LIGHT (Kept for lighting the bottom of the hull) */}
      <pointLight
        position={[0, -2, 0]}
        intensity={5}
        color="#60a5fa"
        distance={8}
        decay={2}
      />
    </>
  );
}
