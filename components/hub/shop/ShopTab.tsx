import { Html } from "@react-three/drei";
import { MetaShop } from "@/components/hub/shop/Shop"; // Adjust path

interface ShopTabProps {
  playerProgress: any;
  onPurchase: (p: any) => void;
}

// --- MAIN EXPORT ---
export default function ShopTab({ playerProgress, onPurchase }: ShopTabProps) {
  return (
    <group>
      {/* LIGHTING: Purple/Cyber Theme */}
      <ambientLight intensity={0.2} color="#1e1b4b" />
      <spotLight
        position={[0, 15, 10]}
        angle={0.6}
        penumbra={0.5}
        intensity={30}
        color="#d8b4fe"
      />
      <pointLight
        position={[-8, 5, 2]}
        intensity={8}
        color="#a855f7"
        distance={15}
      />
      <pointLight
        position={[8, 5, 2]}
        intensity={8}
        color="#a855f7"
        distance={15}
      />

      {/* THE SHOP UI */}
      {/*
          1200px width * 0.012 scale = 14.4 World Units wide
          Matches the scale used in ArchiveTab for consistency
      */}
      <Html
        transform
        position={[0, 2.5, 0]}
        scale={0.65}
        style={{ width: "1920px", height: "900px" }}
      >
        <div className="w-full h-full pointer-events-auto select-none shadow-[0_0_100px_rgba(168,85,247,0.3)]">
          <MetaShop
            progress={playerProgress}
            onClose={() => {}} // No close needed here
            onPurchase={onPurchase}
            embedded={true}
          />
        </div>
      </Html>
    </group>
  );
}
