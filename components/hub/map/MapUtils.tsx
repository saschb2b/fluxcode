import { Html } from "@react-three/drei";
import * as THREE from "three";

export function FloatingLabel({ label, sub, color, hovered }: any) {
  if (!hovered) return null;
  return (
    <Html
      position={[0, 3, 0]}
      center
      distanceFactor={10}
      style={{ pointerEvents: "none" }}
    >
      <div className="flex flex-col items-center">
        <div className="bg-black/90 backdrop-blur-md border border-white/20 px-3 py-1 mb-1 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          <span
            className={`text-sm font-bold tracking-widest ${color === "#ef4444" ? "text-red-500" : color === "#f59e0b" ? "text-amber-500" : "text-cyan-500"}`}
          >
            {label}
          </span>
        </div>
        <div className="text-[8px] font-mono text-gray-400 bg-black/50 px-2 rounded">
          {sub}
        </div>
      </div>
    </Html>
  );
}

export function DataCable({
  start,
  end,
  color,
}: {
  start: number[];
  end: number[];
  color: string;
}) {
  const mid = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
    0.5,
  );
  mid.y = 1.5;
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    mid,
    new THREE.Vector3(...end),
  );
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={mid}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
