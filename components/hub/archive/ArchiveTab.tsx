import { Html } from "@react-three/drei";
import { Codex } from "@/components/hub/archive/Codex";

export function ArchiveTab() {
  return (
    <group>
      {/* LIGHTING */}
      <ambientLight intensity={0.2} color="#020617" />
      <spotLight
        position={[0, 10, 5]}
        angle={0.5}
        penumbra={0.5}
        intensity={10}
        color="#38bdf8"
      />
      <pointLight
        position={[-5, 2, 0]}
        intensity={5}
        color="#0ea5e9"
        distance={10}
      />
      <pointLight
        position={[5, 2, 0]}
        intensity={5}
        color="#0ea5e9"
        distance={10}
      />

      {/* THE CODEX UI */}
      {/*
          transform: Makes it part of the 3D world
          scale: 0.1 means 100px in HTML = 10 units in 3D (adjust for resolution)
          position: Centered and lifted up
      */}
      <Html
        transform
        position={[0, 2.5, 0]}
        scale={0.65}
        style={{ width: "1920px", height: "900px" }}
      >
        <div className="w-full h-full pointer-events-auto select-none shadow-[0_0_50px_rgba(14,165,233,0.3)]">
          <Codex isOpen={true} onClose={() => {}} embedded={true} />
        </div>
      </Html>
    </group>
  );
}
