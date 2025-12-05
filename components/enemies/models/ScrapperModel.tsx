import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ScrapperModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

export function ScrapperModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#eab308",
  accentColor = "#0ea5e9",
}: ScrapperModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Body Parts
  const bodyGroupRef = useRef<THREE.Group>(null);
  const legLeftRef = useRef<THREE.Group>(null);
  const legRightRef = useRef<THREE.Group>(null);
  const armLeftRef = useRef<THREE.Group>(null);
  const armRightRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Group>(null);

  const offset = useRef(Math.random() * 100).current;
  const [isBlinking, setIsBlinking] = useState(false);
  const nextBlinkTime = useRef(0);

  const lastPos = useRef(new THREE.Vector3());
  const isMoving = useRef(false);

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !bodyGroupRef.current ||
      !legLeftRef.current ||
      !legRightRef.current ||
      !armLeftRef.current ||
      !armRightRef.current ||
      !lidRef.current ||
      !exhaustRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. MOVEMENT DETECTION ---
    const currentPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(currentPos);
    const dist = currentPos.distanceTo(lastPos.current);
    isMoving.current = dist > 0.001;
    lastPos.current.copy(currentPos);

    // --- 2. WALK CYCLE ---
    if (isMoving.current && !isHit) {
      const walkSpeed = 18;
      legLeftRef.current.position.z = Math.sin(time * walkSpeed) * 0.15;
      legLeftRef.current.position.y =
        -0.6 + Math.max(0, Math.sin(time * walkSpeed)) * 0.1;
      legRightRef.current.position.z = Math.cos(time * walkSpeed) * 0.15;
      legRightRef.current.position.y =
        -0.6 + Math.max(0, Math.cos(time * walkSpeed)) * 0.1;

      bodyGroupRef.current.position.y =
        Math.abs(Math.sin(time * walkSpeed)) * 0.05;
      bodyGroupRef.current.rotation.z = Math.sin(time * (walkSpeed / 2)) * 0.15;

      armLeftRef.current.rotation.x = Math.cos(time * walkSpeed) * 0.5;
      armRightRef.current.rotation.x = Math.sin(time * walkSpeed) * 0.5;
    } else {
      const breathe = Math.sin(time * 2) * 0.02;
      bodyGroupRef.current.position.y = THREE.MathUtils.lerp(
        bodyGroupRef.current.position.y,
        breathe,
        delta * 5,
      );
      bodyGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        bodyGroupRef.current.rotation.z,
        0,
        delta * 5,
      );

      legLeftRef.current.position.y = -0.6;
      legLeftRef.current.position.z = THREE.MathUtils.lerp(
        legLeftRef.current.position.z,
        0.1,
        delta * 5,
      );
      legRightRef.current.position.y = -0.6;
      legRightRef.current.position.z = THREE.MathUtils.lerp(
        legRightRef.current.position.z,
        -0.1,
        delta * 5,
      );

      armLeftRef.current.rotation.x = THREE.MathUtils.lerp(
        armLeftRef.current.rotation.x,
        0,
        delta * 5,
      );
      armRightRef.current.rotation.x = THREE.MathUtils.lerp(
        armRightRef.current.rotation.x,
        0,
        delta * 5,
      );
    }

    // --- 3. EXPRESSIONS ---
    let targetLidRot = -0.1;
    if (isHit) {
      targetLidRot = -0.6;
      bodyGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyGroupRef.current.rotation.x,
        -0.4,
        delta * 10,
      );
      armLeftRef.current.rotation.z = 2.5;
      armRightRef.current.rotation.z = -2.5;
    } else if (isAttacking) {
      targetLidRot = 0.2;
      bodyGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyGroupRef.current.rotation.x,
        0.2,
        delta * 8,
      );
      armLeftRef.current.rotation.x = -1.5;
      armRightRef.current.rotation.x = -1.5;
    } else {
      targetLidRot = -0.1 + Math.sin(time) * 0.05;
      const leanForward = isMoving.current ? 0.15 : 0;
      bodyGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyGroupRef.current.rotation.x,
        leanForward,
        delta * 5,
      );
      armLeftRef.current.rotation.z = 0.2;
      armRightRef.current.rotation.z = -0.2;
    }

    lidRef.current.rotation.x = THREE.MathUtils.lerp(
      lidRef.current.rotation.x,
      targetLidRot,
      delta * 10,
    );

    // --- 4. DETAILS ---
    exhaustRef.current.scale.y = 1 + Math.sin(time * 15) * 0.2;
    exhaustRef.current.rotation.z = Math.sin(time * 20) * 0.1;

    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextBlinkTime.current) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        nextBlinkTime.current = state.clock.elapsedTime + 2 + Math.random() * 4;
      }
    }
  });

  const metalColor = "#334155";
  const rustColor = "#78350f";

  return (
    <group ref={groupRef}>
      {/* LEGS */}
      <group ref={legLeftRef} position={[-0.2, -0.6, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <meshStandardMaterial color={metalColor} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color={rustColor} />
        </mesh>
        <mesh position={[0, 0.05, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.25]} />
          <meshStandardMaterial color={metalColor} roughness={0.8} />
        </mesh>
      </group>

      <group ref={legRightRef} position={[0.2, -0.6, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <meshStandardMaterial color={metalColor} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color={rustColor} />
        </mesh>
        <mesh position={[0, 0.05, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.25]} />
          <meshStandardMaterial color={metalColor} roughness={0.8} />
        </mesh>
      </group>

      {/* BODY */}
      <group ref={bodyGroupRef}>
        <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[0.35, 0.25, 0.5, 4]} />
          <meshStandardMaterial
            color={isHit ? "white" : primaryColor}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>

        <mesh position={[0, -0.26, 0]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[0.24, 0.15, 0.1, 4]} />
          <meshStandardMaterial color={metalColor} />
        </mesh>

        {/* EYES */}
        <group position={[0, 0.05, 0.26]}>
          <mesh position={[0, 0, -0.01]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.05]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>

          {/* FIXED: Moved rotation to Mesh */}
          <mesh position={[-0.1, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={isBlinking ? 0 : isAttacking ? 3 : 1}
            />
          </mesh>

          {/* FIXED: Moved rotation to Mesh */}
          <mesh position={[0.12, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={isBlinking ? 0 : isAttacking ? 3 : 1}
            />
          </mesh>
        </group>

        {/* LID */}
        <group ref={lidRef} position={[0, 0.25, -0.2]}>
          <mesh position={[0, 0, 0.2]} rotation={[0, Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.1, 4]} />
            <meshStandardMaterial
              color={primaryColor}
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>

          {/* FIXED: Moved rotation to Mesh */}
          <mesh position={[0, 0.05, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color={metalColor} />
          </mesh>
        </group>

        {/* ARMS */}
        <group ref={armLeftRef} position={[-0.38, -0.05, 0]}>
          <mesh>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color={metalColor} />
          </mesh>
          <mesh position={[0, -0.15, 0.1]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.05, 0.2, 0.05]} />
            <meshStandardMaterial color={primaryColor} />
          </mesh>
          <mesh position={[0, -0.25, 0.15]}>
            <boxGeometry args={[0.02, 0.08, 0.08]} />
            <meshStandardMaterial color={metalColor} />
          </mesh>
        </group>

        <group ref={armRightRef} position={[0.38, -0.05, 0]}>
          <mesh>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color={metalColor} />
          </mesh>
          <mesh position={[0, -0.15, 0.1]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.05, 0.2, 0.05]} />
            <meshStandardMaterial color={primaryColor} />
          </mesh>
          <mesh position={[0, -0.25, 0.15]}>
            <boxGeometry args={[0.02, 0.08, 0.08]} />
            <meshStandardMaterial color={metalColor} />
          </mesh>
        </group>

        {/* BACKPACK */}
        <group position={[0, 0, -0.3]}>
          <mesh>
            <boxGeometry args={[0.3, 0.35, 0.15]} />
            <meshStandardMaterial color={metalColor} />
          </mesh>
          <group ref={exhaustRef} position={[0.08, 0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.2]} />
              <meshStandardMaterial color={rustColor} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <dodecahedronGeometry args={[0.03]} />
              <meshBasicMaterial color="gray" transparent opacity={0.5} />
            </mesh>
          </group>
        </group>
      </group>

      {/* SMOKE */}
      {hpPercentage < 0.3 && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.15, 4, 4]} />
          <meshBasicMaterial color="#333" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
