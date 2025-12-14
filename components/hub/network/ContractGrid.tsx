import { useMemo } from "react";
import { ContractSlate } from "./ContractSlate";
import type { NetworkContractWithClaimed } from "@/lib/network-contracts";
import { Text } from "@react-three/drei";

interface ContractGridProps {
  dailyContracts: NetworkContractWithClaimed[];
  weeklyContracts: NetworkContractWithClaimed[];
  onSelectContract: (c: NetworkContractWithClaimed) => void;
}

// Helper to layout grid items centered
function calculateGridPositions(
  items: any[],
  startY: number,
  itemsPerRow: number,
) {
  const rows = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  const layout: any[] = [];
  const ROW_HEIGHT = 4.2; // Vertical gap between rows
  const COL_WIDTH = 3.2; // Horizontal gap between cards

  rows.forEach((rowItems, rowIndex) => {
    const rowWidth = (rowItems.length - 1) * COL_WIDTH;
    const startX = -rowWidth / 2;

    rowItems.forEach((item: any, colIndex: number) => {
      layout.push({
        data: item,
        pos: [
          startX + colIndex * COL_WIDTH,
          startY - rowIndex * ROW_HEIGHT,
          0,
        ] as [number, number, number],
      });
    });
  });

  return { layout, totalHeight: rows.length * ROW_HEIGHT };
}

export function ContractGrid({
  dailyContracts,
  weeklyContracts,
  onSelectContract,
}: ContractGridProps) {
  // 1. Calculate Layouts
  const dailies = useMemo(
    () => calculateGridPositions(dailyContracts, 2.5, 4),
    [dailyContracts],
  );

  // Start Weeklies below the last Daily row
  const weeklyStartY = 2.5 - dailies.totalHeight - 1.5; // -1.5 is extra gap between sections
  const weeklies = useMemo(
    () => calculateGridPositions(weeklyContracts, weeklyStartY, 4),
    [weeklyContracts, weeklyStartY],
  );

  return (
    <group position={[0, 1, 0]}>
      {/* Shift whole grid up slightly */}
      {/* DAILY SECTION HEADER */}
      <group position={[0, 4.8, 0]}>
        <Text
          fontSize={0.3}
          color="#fbbf24"
          anchorX="center"
          letterSpacing={0.2}
        >
          DAILY DIRECTIVES
        </Text>
        <mesh position={[0, -0.3, 0]}>
          <planeGeometry args={[8, 0.02]} />
          <meshBasicMaterial color="#fbbf24" opacity={0.3} transparent />
        </mesh>
      </group>
      {/* DAILIES */}
      {dailies.layout.map((item, i) => (
        <ContractSlate
          key={item.data.id}
          contract={item.data}
          index={i}
          position={item.pos}
          onClick={onSelectContract}
        />
      ))}
      {/* WEEKLY SECTION HEADER */}
      {/* Position relative to where dailies ended */}
      <group position={[0, weeklyStartY + 2.3, 0]}>
        <Text
          fontSize={0.3}
          color="#d946ef"
          anchorX="center"
          letterSpacing={0.2}
        >
          WEEKLY OPERATIONS
        </Text>
        <mesh position={[0, -0.3, 0]}>
          <planeGeometry args={[8, 0.02]} />
          <meshBasicMaterial color="#d946ef" opacity={0.3} transparent />
        </mesh>
      </group>
      {/* WEEKLIES */}
      {weeklies.layout.map((item, i) => (
        <ContractSlate
          key={item.data.id}
          contract={item.data}
          index={i}
          position={item.pos}
          onClick={onSelectContract}
        />
      ))}
    </group>
  );
}
