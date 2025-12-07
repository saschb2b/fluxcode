import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloaterModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

export function FloaterModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#f8fafc",
  accentColor = "#60a5fa",
}: FloaterModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const topGroupRef = useRef<THREE.Group>(null);
  const bottomGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const faceContainerRef = useRef<THREE.Group>(null);
  const faceGroupRef = useRef<THREE.Group>(null);
  const browLeftRef = useRef<THREE.Mesh>(null);
  const browRightRef = useRef<THREE.Mesh>(null);
  const armLeftRef = useRef<THREE.Group>(null);
  const armRightRef = useRef<THREE.Group>(null);
  const propellerRef = useRef<THREE.Group>(null);

  const offset = useRef(Math.random() * 100).current;
  const nextBlinkTime = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const nextScanTime = useRef(0);

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !torsoRef.current ||
      !topGroupRef.current ||
      !bottomGroupRef.current ||
      !coreRef.current ||
      !faceGroupRef.current ||
      !faceContainerRef.current ||
      !browLeftRef.current ||
      !browRightRef.current ||
      !armLeftRef.current ||
      !armRightRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- PHYSICS ---
    groupRef.current.position.y = Math.sin(time * 2.5) * 0.15;
    const bouncePhase = Math.sin(time * 2.5);
    const stretch = 1 + bouncePhase * 0.05;
    const squash = 1 - bouncePhase * 0.05;
    torsoRef.current.scale.set(squash, stretch, squash);

    // --- BREATHING ---
    let separation = 0.02;
    let coreSpinSpeed = 1;
    if (isAttacking) {
      separation = 0.09 + Math.sin(time * 20) * 0.01;
      coreSpinSpeed = 15;
    } else {
      separation = 0.03 + Math.sin(time * 3) * 0.015;
    }
    topGroupRef.current.position.y = THREE.MathUtils.lerp(
      topGroupRef.current.position.y,
      separation,
      delta * 5,
    );
    bottomGroupRef.current.position.y = THREE.MathUtils.lerp(
      bottomGroupRef.current.position.y,
      -separation,
      delta * 5,
    );

    coreRef.current.rotation.y += delta * coreSpinSpeed;
    const hpDimmer = Math.max(0.2, hpPercentage);
    const attackBoost = isAttacking ? 2.0 : 1.0;
    const mat = coreRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      hpDimmer * attackBoost * (1 + Math.sin(time * 5) * 0.3),
      delta * 5,
    );

    if (hpPercentage < 0.3) {
      coreRef.current.position.x = (Math.random() - 0.5) * 0.02;
    } else {
      coreRef.current.position.x = 0;
    }

    // --- EYEBROWS ---
    let targetBrowRot = 0;
    let targetBrowY = 0.08;
    if (isAttacking) {
      targetBrowRot = 0.4;
      targetBrowY = 0.06;
    } else if (isHit) {
      targetBrowRot = -0.3;
      targetBrowY = 0.1;
    } else {
      targetBrowRot = Math.sin(time * 2) * 0.05;
    }
    browLeftRef.current.rotation.z = THREE.MathUtils.lerp(
      browLeftRef.current.rotation.z,
      -targetBrowRot,
      delta * 10,
    );
    browRightRef.current.rotation.z = THREE.MathUtils.lerp(
      browRightRef.current.rotation.z,
      targetBrowRot,
      delta * 10,
    );
    browLeftRef.current.position.y = THREE.MathUtils.lerp(
      browLeftRef.current.position.y,
      targetBrowY,
      delta * 10,
    );
    browRightRef.current.position.y = THREE.MathUtils.lerp(
      browRightRef.current.position.y,
      targetBrowY,
      delta * 10,
    );

    // --- ARMS ---
    const armWave = Math.sin(time * 5) * 0.1;
    const armPanic = Math.sin(time * 20) * 0.3;
    let targetRotZ = 0;
    let targetRotX = 0;
    let targetY = -0.1;

    if (isHit) {
      targetRotZ = 2.5 + armPanic;
      targetY = 0.2;
    } else if (isAttacking) {
      targetRotZ = 0.5;
      targetRotX = 1.0;
      targetY = 0.1;
    } else {
      targetRotZ = 0.2 + armWave;
      targetRotX = Math.cos(time * 2.5) * 0.2;
    }
    armLeftRef.current.position.y = THREE.MathUtils.lerp(
      armLeftRef.current.position.y,
      targetY,
      delta * 5,
    );
    armLeftRef.current.rotation.z = THREE.MathUtils.lerp(
      armLeftRef.current.rotation.z,
      -targetRotZ,
      delta * 5,
    );
    armLeftRef.current.rotation.x = THREE.MathUtils.lerp(
      armLeftRef.current.rotation.x,
      targetRotX,
      delta * 5,
    );
    armRightRef.current.position.y = THREE.MathUtils.lerp(
      armRightRef.current.position.y,
      targetY,
      delta * 5,
    );
    armRightRef.current.rotation.z = THREE.MathUtils.lerp(
      armRightRef.current.rotation.z,
      targetRotZ,
      delta * 5,
    );
    armRightRef.current.rotation.x = THREE.MathUtils.lerp(
      armRightRef.current.rotation.x,
      targetRotX,
      delta * 5,
    );

    // --- BLINK & LOOK ---
    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextBlinkTime.current) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        nextBlinkTime.current = state.clock.elapsedTime + 2 + Math.random() * 3;
      }
      const eyeScaleY = isBlinking ? 0.1 : 1;
      faceGroupRef.current.scale.y = THREE.MathUtils.lerp(
        faceGroupRef.current.scale.y,
        eyeScaleY,
        delta * 20,
      );
    } else {
      faceGroupRef.current.scale.y = THREE.MathUtils.lerp(
        faceGroupRef.current.scale.y,
        1,
        delta * 20,
      );
    }

    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextScanTime.current) {
        nextScanTime.current = state.clock.elapsedTime + 1.5 + Math.random();
        if (Math.random() > 0.3) {
          lookTarget.current.set(
            (Math.random() + 0.5) * 6,
            (Math.random() + 0.5) * 4,
            5,
          );
        } else {
          lookTarget.current.set(0, 0, 0);
        }
      }
    } else if (isAttacking) {
      lookTarget.current.set(0, 0, 0);
    }

    const dummy = new THREE.Object3D();
    dummy.position.copy(groupRef.current.position);
    dummy.lookAt(lookTarget.current);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      dummy.rotation.y,
      delta * 3,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      dummy.rotation.x * 0.5,
      delta * 3,
    );

    // --- COLORS ---
    const glowIntensity = isAttacking ? 2.0 : 0.5;
    const eyeColor = isAttacking ? "#ef4444" : accentColor;
    faceGroupRef.current.children.forEach((child) => {
      if ((child as THREE.Mesh).geometry?.type === "CapsuleGeometry") {
        const mat = (child as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          glowIntensity,
          delta * 5,
        );
        mat.color.set(eyeColor);
        mat.emissive.set(eyeColor);
      }
      if ((child as THREE.Mesh).geometry?.type === "BoxGeometry") {
        const mat = (child as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        mat.color.set(isAttacking ? "#ef4444" : "#94a3b8");
      }
    });

    if (propellerRef.current) propellerRef.current.rotation.y += delta * 15;

    if (isHit) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        0.5,
        delta * 10,
      );
      groupRef.current.rotation.z = -0.5;
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
  });

  const faceColor = "#0f172a";
  const seamColor = "#334155";
  const armColor = "#e2e8f0";

  return (
    <group ref={groupRef}>
      <group ref={torsoRef}>
        {/* TOP PART */}
        <group ref={topGroupRef}>
          <mesh position={[0, 0.02, 0]} castShadow>
            <sphereGeometry
              args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color={isHit ? "white" : primaryColor}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.29, 32]} />
            <meshStandardMaterial color={seamColor} roughness={0.9} />
          </mesh>

          {/* FIX: Face Container LOWERED (y=0.1) and TILT REDUCED (rotX=-0.1) */}
          <group
            ref={faceContainerRef}
            position={[0, 0.1, 0]}
            rotation={[-0.1, 0, 0]}
          >
            {/* Visor: Flattened more (z scale 0.3) and pushed back slightly to conform */}
            <mesh position={[0, 0, 0.27]} scale={[1, 1, 0.3]}>
              <sphereGeometry args={[0.18, 32, 32]} />
              <meshStandardMaterial
                color={faceColor}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            <group ref={faceGroupRef} position={[0, 0, 0.35]}>
              <mesh position={[-0.08, 0, 0]}>
                <capsuleGeometry args={[0.035, 0.04, 4, 8]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={1}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0.08, 0, 0]}>
                <capsuleGeometry args={[0.035, 0.04, 4, 8]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={1}
                  toneMapped={false}
                />
              </mesh>
              <mesh ref={browLeftRef} position={[-0.08, 0.08, 0.02]}>
                <boxGeometry args={[0.08, 0.02, 0.01]} />
                <meshStandardMaterial color={seamColor} />
              </mesh>
              <mesh ref={browRightRef} position={[0.08, 0.08, 0.02]}>
                <boxGeometry args={[0.08, 0.02, 0.01]} />
                <meshStandardMaterial color={seamColor} />
              </mesh>
            </group>
          </group>
        </group>

        {/* CORE */}
        <mesh ref={coreRef} scale={[0.8, 0.8, 0.8]}>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1}
            wireframe={hpPercentage < 0.2}
          />
        </mesh>

        {/* BOTTOM PART */}
        <group ref={bottomGroupRef}>
          <mesh position={[0, -0.02, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <sphereGeometry
              args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color={isHit ? "white" : primaryColor}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.29, 32]} />
            <meshStandardMaterial color={seamColor} roughness={0.9} />
          </mesh>
          {/* Chest Light LOWERED further to avoid clip */}
          <mesh position={[0, -0.22, 0.21]} rotation={[0.8, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      </group>

      {/* ARMS & PROP */}
      <group ref={armLeftRef} position={[-0.35, -0.1, 0]}>
        <mesh rotation={[0, 0, 0.2]} castShadow>
          <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
          <meshStandardMaterial color={armColor} roughness={0.3} />
        </mesh>
        <mesh position={[0.06, 0.02, 0.02]} rotation={[0, 0, 0.5]}>
          <capsuleGeometry args={[0.025, 0.06, 4, 8]} />
          <meshStandardMaterial color={armColor} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.02, 0.045]} rotation={[0.2, 0, 0]}>
          <circleGeometry args={[0.025, 16]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
        </mesh>
      </group>
      <group ref={armRightRef} position={[0.35, -0.1, 0]}>
        <mesh rotation={[0, 0, -0.2]} castShadow>
          <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
          <meshStandardMaterial color={armColor} roughness={0.3} />
        </mesh>
        <mesh position={[-0.06, 0.02, 0.02]} rotation={[0, 0, -0.5]}>
          <capsuleGeometry args={[0.025, 0.06, 4, 8]} />
          <meshStandardMaterial color={armColor} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.02, 0.045]} rotation={[0.2, 0, 0]}>
          <circleGeometry args={[0.025, 16]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
        </mesh>
      </group>
      <group ref={propellerRef} position={[0, 0.35, 0]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.05]} />
          <meshStandardMaterial color="gray" />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.01, 0.3, 0.02]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>

      {/* SMOKE */}
      {hpPercentage < 0.3 && (
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="gray" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
