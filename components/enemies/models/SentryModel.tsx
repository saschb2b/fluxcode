import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Scouting leveating eye that attacks on sight.
 */
interface SentryModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
}

export function SentryModel({
  isAttacking,
  isHit,
  hpPercentage,
}: SentryModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Animation Refs
  const headRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const irisRef = useRef<THREE.Mesh>(null);
  const chassisRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  // Instance Variation
  const offset = useRef(Math.random() * 100).current;

  // Mind State
  const lookTarget = useRef(new THREE.Vector3(-10, 0, 0));
  const nextScanTime = useRef(0);

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !chassisRef.current ||
      !headRef.current ||
      !pupilRef.current ||
      !irisRef.current ||
      !laserRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. HOVER PHYSICS ---
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.15;

    // --- 2. AI SCANNING ---
    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextScanTime.current) {
        nextScanTime.current = state.clock.elapsedTime + 2 + Math.random() * 2;
        if (Math.random() > 0.4) {
          lookTarget.current.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 3,
            5,
          );
        } else {
          lookTarget.current.set(-10, 0, 0);
        }
      }
    } else if (isAttacking) {
      lookTarget.current.set(-20, 0, 0);
    }

    const dummy = new THREE.Object3D();
    dummy.position.copy(headRef.current.position);
    dummy.lookAt(lookTarget.current);
    headRef.current.quaternion.slerp(dummy.quaternion, delta * 4);

    // --- 3. CYBORG EYE ANIMATION ---
    const idlePupil = 0.6 + Math.sin(time * 3) * 0.05;
    const targetPupilScale = isHit ? 1.4 : isAttacking ? 0.2 : idlePupil;
    pupilRef.current.scale.lerp(
      new THREE.Vector3(targetPupilScale, targetPupilScale, 1),
      delta * 8,
    );

    (irisRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      THREE.MathUtils.lerp(
        (irisRef.current.material as THREE.MeshStandardMaterial)
          .emissiveIntensity,
        isAttacking ? 3.0 : 0.5,
        delta * 5,
      );

    // --- 4. CHASSIS ANIMATION ---
    const breathing = Math.sin(time * 2.5) * 0.05;
    let targetSpinSpeed = 0.5;
    let targetExpansion = 0;

    if (isAttacking) {
      targetSpinSpeed = 12;
      targetExpansion = 0.35;
      // Vibration
      headRef.current.position.x = (Math.random() - 0.5) * 0.02;
      headRef.current.position.y = (Math.random() - 0.5) * 0.02;
    } else {
      headRef.current.position.set(0, 0, 0);
    }

    chassisRef.current.rotation.z += delta * targetSpinSpeed;

    chassisRef.current.children.forEach((fin, i) => {
      const angle = (i / 3) * Math.PI * 2;
      const baseDist = 0.38;
      const dist = THREE.MathUtils.lerp(
        Math.sqrt(fin.position.x ** 2 + fin.position.y ** 2),
        baseDist + targetExpansion + (isHit ? 0.2 : breathing),
        delta * 5,
      );
      fin.position.x = Math.cos(angle) * dist;
      fin.position.y = Math.sin(angle) * dist;
      fin.lookAt(0, 0, 0);
    });

    // --- 5. DAMAGE REACTION ---
    if (isHit) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        0.5,
        delta * 15,
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        -0.4,
        delta * 15,
      );
    } else {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        0,
        delta * 5,
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        0,
        delta * 5,
      );
    }

    // --- 6. LASER ---
    if (isAttacking) {
      (laserRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.4 + Math.random() * 0.3;
      (laserRef.current.material as THREE.MeshBasicMaterial).color.set(
        isAttacking ? "#ef4444" : "#4ade80",
      );
    } else {
      const scan = (Math.sin(time * 8) + 1) / 2;
      (laserRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.05 + scan * 0.05;
    }
  });

  const chassisColor = "#1e293b";
  const eyeColor = isAttacking ? "#ef4444" : "#4ade80";
  const scleraColor = "#f1f5f9";
  const hitColor = "white";

  return (
    <group ref={groupRef}>
      {/* HEAD */}
      <group ref={headRef}>
        <mesh castShadow>
          <dodecahedronGeometry args={[0.26, 1]} />
          <meshStandardMaterial
            color={isHit ? hitColor : chassisColor}
            roughness={0.5}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial
            color={scleraColor}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
        <mesh ref={irisRef} position={[0, 0, 0.31]}>
          <ringGeometry args={[0.06, 0.12, 32]} />
          <meshStandardMaterial
            color={eyeColor}
            emissive={eyeColor}
            emissiveIntensity={0.5}
            roughness={0}
          />
        </mesh>
        <mesh ref={pupilRef} position={[0, 0, 0.32]}>
          <circleGeometry args={[0.06, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0.18, 0.25]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial color={isHit ? hitColor : "#0f172a"} />
        </mesh>
      </group>

      {/* BODY */}
      <group ref={chassisRef}>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, 0]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.1, 0.35, 0.05]} />
              <meshStandardMaterial
                color={isHit ? hitColor : "#334155"}
                roughness={0.5}
                metalness={0.5}
              />
              <mesh position={[0, 0.15, 0.03]}>
                <boxGeometry args={[0.04, 0.04, 0.01]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
            </mesh>
          );
        })}
      </group>

      {/* LASER */}
      <mesh ref={laserRef} position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 4, 8]} />
        <meshBasicMaterial
          color={eyeColor}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* LOW HP SMOKE */}
      {hpPercentage < 0.3 && (
        <mesh position={[0, 0.1, 0]} scale={0.5}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshBasicMaterial color="gray" wireframe transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  );
}
