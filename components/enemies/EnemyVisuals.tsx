import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getEnemyDefinition } from "@/lib/enemies/registry";
import { EnemyRenderProps } from "@/lib/enemies/types";
import { gridToWorld } from "@/lib/grid-math";
import { Position } from "@/types/game";

interface EnemyVisualsProps extends EnemyRenderProps {
  definitionId: string;
  position: Position;
  children?: React.ReactNode;
}

export function EnemyVisuals({
  definitionId,
  position,
  children,
  ...props
}: EnemyVisualsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { x, y } = position;

  // 1. Calculate Target World Position
  // Now we reconstruct the object inside, or update gridToWorld to accept primitives
  const targetPos = useMemo(() => {
    return gridToWorld({ x, y });
  }, [x, y]);

  // 2. Smooth Movement Logic
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Linear Interpolation (Lerp) for smooth movement
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetPos[0],
      delta * 8,
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetPos[2],
      delta * 8,
    );

    // Y-position is fixed base
    groupRef.current.position.y = targetPos[1];
  });

  // 3. Definition Lookup
  const definition = useMemo(
    () => getEnemyDefinition(definitionId),
    [definitionId],
  );

  if (!definition || !definition.renderer) {
    return (
      <mesh position={new THREE.Vector3(...targetPos)}>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <mesh rotation={[0, -(Math.PI / 2), 0]}>
        {definition.renderer(props)}
      </mesh>
      {children}
    </group>
  );
}
