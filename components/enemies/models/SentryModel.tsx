"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

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

  // -- PARTS --
  const chassisRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const innerEyeRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Mesh>(null);
  const pupilRef = useRef<THREE.Mesh>(null); // New Pupil Ref
  const upperLidRef = useRef<THREE.Group>(null);
  const lowerLidRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);
  const holoGridRef = useRef<THREE.Mesh>(null);

  // -- STATE --
  const offset = useRef(Math.random() * 100).current;
  const lookTarget = useRef(new THREE.Vector3(0, 0, 10));
  const nextScanTime = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !chassisRef.current ||
      !coreRef.current ||
      !innerEyeRef.current ||
      !lensRef.current ||
      !pupilRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. PHYSICS ---
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.1;
    groupRef.current.rotation.z = Math.cos(time * 0.5) * 0.03;

    // --- 2. CHASSIS ---
    const spinSpeed = isAttacking ? 5 : 0.5;
    chassisRef.current.rotation.z += delta * spinSpeed;

    // Expansion logic
    const expansion = isAttacking ? 0.1 : 0;
    chassisRef.current.children.forEach((fin, i) => {
      const angle = (i / 3) * Math.PI * 2;
      const baseDist = 0.45;
      const dist = baseDist + expansion + (isHit ? 0.1 : 0);
      fin.position.x = THREE.MathUtils.lerp(
        fin.position.x,
        Math.cos(angle) * dist,
        delta * 5,
      );
      fin.position.y = THREE.MathUtils.lerp(
        fin.position.y,
        Math.sin(angle) * dist,
        delta * 5,
      );
      fin.lookAt(0, 0, 0);
    });

    // --- 3. TRACKING ---
    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextScanTime.current) {
        nextScanTime.current =
          state.clock.elapsedTime + 0.5 + Math.random() * 2;
        lookTarget.current.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          10,
        );
      }
    } else if (isAttacking) {
      lookTarget.current.set(0, 0, 10);
      // Violent Shaking
      coreRef.current.position.x = (Math.random() - 0.5) * 0.03;
      coreRef.current.position.y = (Math.random() - 0.5) * 0.03;
    } else {
      coreRef.current.position.set(0, 0, 0);
    }

    // Look Interpolation
    coreRef.current.rotation.y = THREE.MathUtils.lerp(
      coreRef.current.rotation.y,
      lookTarget.current.x * 0.05,
      delta * 3,
    );
    coreRef.current.rotation.x = THREE.MathUtils.lerp(
      coreRef.current.rotation.x,
      -lookTarget.current.y * 0.05,
      delta * 3,
    );
    innerEyeRef.current.rotation.y = THREE.MathUtils.lerp(
      innerEyeRef.current.rotation.y,
      lookTarget.current.x * 0.1,
      delta * 10,
    );
    innerEyeRef.current.rotation.x = THREE.MathUtils.lerp(
      innerEyeRef.current.rotation.x,
      -lookTarget.current.y * 0.1,
      delta * 10,
    );

    // --- 4. EXPRESSION LOGIC (Lids + Pupil + Squint) ---
    let targetLidAngle = 0; // 0 = Neutral
    let targetPupilScale = 1; // 1 = Normal
    let targetEyeSquash = 1; // 1 = Round Sphere

    if (isHit) {
      // SURPRISE
      targetLidAngle = -0.3; // Wide Open
      targetPupilScale = 0.4; // Tiny pinprick (Shock)
      targetEyeSquash = 1.1; // Stretch vertically (Popping out)
    } else if (isAttacking) {
      // ANGRY SQUINT
      targetLidAngle = 0.4; // Lids closing
      targetPupilScale = 0.6; // Focused/Constricted
      targetEyeSquash = 0.6; // FLATTEN the eyeball vertically (Squinting hard)
    } else {
      // IDLE
      if (Math.random() > 0.99 && !isBlinking) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
      targetLidAngle = isBlinking ? 0.7 : 0;
      targetPupilScale = 0.9 + Math.sin(time * 2) * 0.1; // Breathing pupil
      targetEyeSquash = 1;
    }

    // Apply Lids
    if (upperLidRef.current && lowerLidRef.current) {
      upperLidRef.current.rotation.x = THREE.MathUtils.lerp(
        upperLidRef.current.rotation.x,
        targetLidAngle,
        delta * 15,
      );
      lowerLidRef.current.rotation.x = THREE.MathUtils.lerp(
        lowerLidRef.current.rotation.x,
        -targetLidAngle,
        delta * 15,
      );
    }

    // Apply Pupil Size
    pupilRef.current.scale.lerp(
      new THREE.Vector3(targetPupilScale, targetPupilScale, 1),
      delta * 10,
    );

    // Apply Eye Squashing (The physical lens deforms)
    lensRef.current.scale.y = THREE.MathUtils.lerp(
      lensRef.current.scale.y,
      targetEyeSquash,
      delta * 10,
    );

    // --- 5. VISUAL FX ---
    if (holoGridRef.current) {
      holoGridRef.current.rotation.y -= delta * 0.2;
      (holoGridRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.1 + Math.sin(time * 3) * 0.05;
    }

    const mat = lensRef.current.material as THREE.MeshStandardMaterial;
    if (isAttacking) {
      mat.color.set("#ef4444");
      mat.emissive.set("#ef4444");
      mat.emissiveIntensity = 4 + Math.sin(time * 30);
      if (laserRef.current) laserRef.current.visible = true;
    } else {
      mat.color.set(isHit ? "white" : "#0ea5e9");
      mat.emissive.set(isHit ? "white" : "#0ea5e9");
      mat.emissiveIntensity = 2;
      if (laserRef.current) laserRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- 1. CHASSIS --- */}
      <group ref={chassisRef}>
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <mesh>
              <boxGeometry args={[0.08, 0.4, 0.02]} />
              <meshStandardMaterial
                color="#020617"
                roughness={0.4}
                metalness={0.8}
              />
            </mesh>
            <mesh position={[0, 0.18, 0.02]}>
              <boxGeometry args={[0.04, 0.02, 0.01]} />
              <meshBasicMaterial color={isAttacking ? "#ef4444" : "#22c55e"} />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- 2. CORE --- */}
      <group ref={coreRef}>
        {/* SHELLS */}
        <mesh position={[0, 0.02, 0]} rotation={[-0.2, 0, 0]}>
          <sphereGeometry
            args={[0.33, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.4]}
          />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI + 0.2, 0, 0]}>
          <sphereGeometry
            args={[0.33, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.4]}
          />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.31, 32, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
        <mesh ref={holoGridRef} scale={1.05}>
          <sphereGeometry args={[0.33, 16, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.1}
          />
        </mesh>
        <mesh position={[0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
        </mesh>
        <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
        </mesh>

        {/* --- EYE ASSEMBLY --- */}
        <group position={[0, 0, 0.25]}>
          {/* MOVING EYE */}
          <group ref={innerEyeRef}>
            {/* 1. LENS (Blue glowing part) */}
            <mesh ref={lensRef} position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.1, 32, 16]} />
              <meshStandardMaterial color="#0ea5e9" toneMapped={false} />
            </mesh>

            {/* 2. PUPIL (New: Black center that constricts) */}
            <mesh ref={pupilRef} position={[0, 0, 0.135]}>
              <circleGeometry args={[0.045, 32]} />
              <meshBasicMaterial color="black" />
            </mesh>

            {/* Aperture Ring */}
            <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.11, 0.01, 4, 32]} />
              <meshStandardMaterial color="#333" roughness={0.2} />
            </mesh>
            {/* Shine */}
            <mesh position={[0.04, 0.04, 0.136]}>
              <circleGeometry args={[0.015, 8]} />
              <meshBasicMaterial color="white" opacity={0.8} transparent />
            </mesh>
          </group>

          {/* EYELIDS */}
          <group ref={upperLidRef} position={[0, 0.05, 0]}>
            <mesh position={[0, 0.15, 0.1]} rotation={[0.3, 0, 0]}>
              <RoundedBox args={[0.35, 0.1, 0.05]} radius={0.02} smoothness={2}>
                <meshStandardMaterial color="#94a3b8" metalness={0.6} />
              </RoundedBox>
            </mesh>
          </group>
          <group ref={lowerLidRef} position={[0, -0.05, 0]}>
            <mesh position={[0, -0.15, 0.1]} rotation={[-0.3, 0, 0]}>
              <RoundedBox args={[0.35, 0.1, 0.05]} radius={0.02} smoothness={2}>
                <meshStandardMaterial color="#94a3b8" metalness={0.6} />
              </RoundedBox>
            </mesh>
          </group>
        </group>
      </group>

      {/* LASER */}
      <mesh ref={laserRef} position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 4]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
