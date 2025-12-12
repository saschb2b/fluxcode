import { useState } from "react";
import { Sparkles, Cylinder, Html } from "@react-three/drei";
import { ContractGrid } from "./ContractGrid";
import type { NetworkContractWithClaimed } from "@/lib/network-contracts";
import { ContractDetail } from "./ContractDetail";

interface NetworkTabProps {
  dailyContracts: NetworkContractWithClaimed[];
  weeklyContracts: NetworkContractWithClaimed[];
  onClose: () => void;
  onClaimReward: (contractId: string, refreshType: "daily" | "weekly") => void;
}

// --- 3D ENVIRONMENT (Background) ---
function CommsEnvironment() {
  return (
    <group position={[0, -5, -2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[15, 64]} />
        <meshStandardMaterial color="#1a1405" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Background Array */}
      <Cylinder
        args={[0.5, 2, 10]}
        position={[-8, 5, -5]}
        rotation={[0, 0, 0.2]}
      >
        <meshStandardMaterial color="#1c1917" />
      </Cylinder>
      <Cylinder
        args={[0.5, 2, 10]}
        position={[8, 5, -5]}
        rotation={[0, 0, -0.2]}
      >
        <meshStandardMaterial color="#1c1917" />
      </Cylinder>
      <Sparkles
        color="#fbbf24"
        count={80}
        scale={[25, 15, 10]}
        size={6}
        speed={0.5}
        opacity={0.3}
        position={[0, 5, 0]}
      />
    </group>
  );
}

// --- MAIN EXPORT ---
export default function NetworkTab({
  dailyContracts,
  weeklyContracts,
  onClaimReward,
}: NetworkTabProps) {
  const [selected, setSelected] = useState<NetworkContractWithClaimed | null>(
    null,
  );

  return (
    <group>
      <ambientLight intensity={0.2} color="#451a03" />
      <spotLight
        position={[0, 10, 15]}
        angle={0.5}
        intensity={30}
        color="#fbbf24"
      />
      <pointLight position={[-10, 5, 5]} intensity={10} color="#d97706" />

      <CommsEnvironment />

      {/* THE 3D BOARD */}
      <group position={[0, 5, 0]}>
        <ContractGrid
          dailyContracts={dailyContracts}
          weeklyContracts={weeklyContracts}
          onSelectContract={setSelected}
        />
      </group>

      {/* DETAIL OVERLAY (Only shows when card clicked) */}
      {selected && (
        <Html
          fullscreen
          style={{ pointerEvents: "auto" }} // Re-enable pointer events for the overlay layer
          zIndexRange={[100, 0]}
        >
          <div
            className="w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)} // CLICKING BACKGROUND CLOSES IT
          >
            {/* Prevent clicks on the card itself from closing */}
            <div onClick={(e) => e.stopPropagation()}>
              <ContractDetail
                contract={selected}
                onClose={() => setSelected(null)}
                onClaim={() => {
                  onClaimReward(selected.id, selected.refreshType);
                  setSelected(null);
                }}
              />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
