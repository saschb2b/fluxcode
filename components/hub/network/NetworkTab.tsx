import { Html } from "@react-three/drei";
import { NetworkContractsView } from "@/components/hub/network/NetworkPass";
import { NetworkContractWithClaimed } from "@/lib/network-contracts";

interface NetworkTabProps {
  dailyContracts: NetworkContractWithClaimed[];
  weeklyContracts: NetworkContractWithClaimed[];
  onClaimReward: (contractId: string, refreshType: "daily" | "weekly") => void;
  onForceRefresh?: () => void;
}

export default function NetworkTab({
  dailyContracts,
  weeklyContracts,
  onClaimReward,
  onForceRefresh,
}: NetworkTabProps) {
  return (
    <group>
      {/* LIGHTING: Amber/Gold Theme */}
      <ambientLight intensity={0.2} color="#451a03" />
      <spotLight
        position={[0, 15, 10]}
        angle={0.6}
        penumbra={0.5}
        intensity={25}
        color="#fbbf24"
      />
      <pointLight
        position={[-9, 8, 0]}
        intensity={5}
        color="#d97706"
        distance={15}
      />
      <pointLight
        position={[9, 8, 0]}
        intensity={5}
        color="#d97706"
        distance={15}
      />

      {/* THE UI */}
      <Html
        transform
        position={[0, 2.5, 0]}
        scale={0.65}
        style={{ width: "1920px", height: "900px" }}
      >
        <div className="w-full h-full pointer-events-auto select-none shadow-[0_0_100px_rgba(251,191,36,0.2)]">
          <NetworkContractsView
            dailyContracts={dailyContracts}
            weeklyContracts={weeklyContracts}
            onClose={() => {}}
            onClaimReward={onClaimReward}
            onForceRefresh={onForceRefresh}
            embedded={true}
          />
        </div>
      </Html>
    </group>
  );
}
