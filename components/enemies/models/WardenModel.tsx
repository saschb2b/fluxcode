import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WardenModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

export function WardenModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#1e293b",
  accentColor = "#f59e0b",
}: WardenModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Body Parts
  const coreRef = useRef<THREE.Group>(null);
  const reactorRef = useRef<THREE.Mesh>(null);
  const headSensorRef = useRef<THREE.Group>(null);

  // Shield Arms
  const leftArmGroup = useRef<THREE.Group>(null);
  const rightArmGroup = useRef<THREE.Group>(null);
  const leftPistonRef = useRef<THREE.Mesh>(null);
  const rightPistonRef = useRef<THREE.Mesh>(null);

  // Face Elements
  const faceGroupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);

  const offset = useRef(Math.random() * 100).current;
  const lastPos = useRef(new THREE.Vector3());
  const shieldOpenAmount = useRef(0);
  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const nextScanTime = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const nextBlinkTime = useRef(0);

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !leftArmGroup.current ||
      !rightArmGroup.current ||
      !coreRef.current ||
      !reactorRef.current ||
      !faceGroupRef.current ||
      !leftEyeRef.current ||
      !rightEyeRef.current ||
      !leftBrowRef.current ||
      !rightBrowRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. PHYSICS ---
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;

    const currentPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(currentPos);
    const velocityX = (currentPos.x - lastPos.current.x) / delta;
    lastPos.current.copy(currentPos);

    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      -velocityX * 0.1,
      delta * 2,
    );

    // --- 2. SHIELD MECHANIC ---
    let targetOpen = 0.2;
    if (isAttacking) {
      targetOpen = 1.2;
    } else if (isHit) {
      targetOpen = -0.1;
    } else {
      targetOpen = 0.2 + Math.sin(time * 0.8) * 0.05;
    }

    shieldOpenAmount.current = THREE.MathUtils.lerp(
      shieldOpenAmount.current,
      targetOpen,
      delta * 3,
    );

    const armOffset = 0.6 + shieldOpenAmount.current * 0.4;
    const armRot = shieldOpenAmount.current * 0.4;

    leftArmGroup.current.position.x = THREE.MathUtils.lerp(
      leftArmGroup.current.position.x,
      -armOffset,
      delta * 5,
    );
    leftArmGroup.current.rotation.y = THREE.MathUtils.lerp(
      leftArmGroup.current.rotation.y,
      armRot,
      delta * 5,
    );
    rightArmGroup.current.position.x = THREE.MathUtils.lerp(
      rightArmGroup.current.position.x,
      armOffset,
      delta * 5,
    );
    rightArmGroup.current.rotation.y = THREE.MathUtils.lerp(
      rightArmGroup.current.rotation.y,
      -armRot,
      delta * 5,
    );

    // --- 3. REACTOR ---
    const reactorIntensity = isAttacking ? 5.0 : 0.5;
    const reactorColor = isAttacking ? "#ef4444" : accentColor;

    (
      reactorRef.current.material as THREE.MeshStandardMaterial
    ).emissiveIntensity = THREE.MathUtils.lerp(
      (reactorRef.current.material as THREE.MeshStandardMaterial)
        .emissiveIntensity,
      reactorIntensity + Math.sin(time * 10) * 0.5,
      delta * 5,
    );
    (reactorRef.current.material as THREE.MeshStandardMaterial).color.set(
      reactorColor,
    );
    (reactorRef.current.material as THREE.MeshStandardMaterial).emissive.set(
      reactorColor,
    );

    if (headSensorRef.current) {
      headSensorRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
    }

    // --- 4. THE FACE ---
    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextScanTime.current) {
        nextScanTime.current = state.clock.elapsedTime + 2 + Math.random() * 3;
        if (Math.random() > 0.4) {
          lookTarget.current.set(
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.01,
          );
        } else {
          lookTarget.current.set(0, 0);
        }
      }
    } else if (isAttacking) {
      lookTarget.current.set(0, 0);
    }

    leftEyeRef.current.position.x = THREE.MathUtils.lerp(
      leftEyeRef.current.position.x,
      -0.05 + lookTarget.current.x,
      delta * 2,
    );
    leftEyeRef.current.position.y = THREE.MathUtils.lerp(
      leftEyeRef.current.position.y,
      lookTarget.current.y,
      delta * 2,
    );
    rightEyeRef.current.position.x = THREE.MathUtils.lerp(
      rightEyeRef.current.position.x,
      0.05 + lookTarget.current.x,
      delta * 2,
    );
    rightEyeRef.current.position.y = THREE.MathUtils.lerp(
      rightEyeRef.current.position.y,
      lookTarget.current.y,
      delta * 2,
    );

    // Expression
    let eyeScaleY = 0.6;
    let browRot = 0;
    let browY = 0.04;

    if (isAttacking) {
      eyeScaleY = 1.2;
      browRot = 0.3;
      browY = 0.03;
    } else if (isHit) {
      eyeScaleY = 0.1;
      browRot = -0.2;
      browY = 0.06;
    } else {
      eyeScaleY = 0.6 + Math.sin(time * 2) * 0.05;
      if (Math.sin(time * 0.5) > 0.8) browY = 0.05;
    }

    leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
      leftEyeRef.current.scale.y,
      eyeScaleY,
      delta * 10,
    );
    rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
      rightEyeRef.current.scale.y,
      eyeScaleY,
      delta * 10,
    );

    leftBrowRef.current.rotation.z = THREE.MathUtils.lerp(
      leftBrowRef.current.rotation.z,
      -browRot,
      delta * 10,
    );
    rightBrowRef.current.rotation.z = THREE.MathUtils.lerp(
      rightBrowRef.current.rotation.z,
      browRot,
      delta * 10,
    );
    leftBrowRef.current.position.y = THREE.MathUtils.lerp(
      leftBrowRef.current.position.y,
      browY,
      delta * 10,
    );
    rightBrowRef.current.position.y = THREE.MathUtils.lerp(
      rightBrowRef.current.position.y,
      browY,
      delta * 10,
    );

    const eyeColor = isAttacking ? "#ef4444" : accentColor;
    (leftEyeRef.current.material as THREE.MeshStandardMaterial).color.set(
      eyeColor,
    );
    (rightEyeRef.current.material as THREE.MeshStandardMaterial).color.set(
      eyeColor,
    );
    (leftEyeRef.current.material as THREE.MeshStandardMaterial).emissive.set(
      eyeColor,
    );
    (rightEyeRef.current.material as THREE.MeshStandardMaterial).emissive.set(
      eyeColor,
    );

    // Blink
    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextBlinkTime.current) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
        nextBlinkTime.current = state.clock.elapsedTime + 3 + Math.random() * 4;
      }
    }
    if (isBlinking) {
      leftEyeRef.current.scale.y = 0.1;
      rightEyeRef.current.scale.y = 0.1;
    }
  });

  const armorColor = primaryColor;
  const darkMetal = "#0f172a";
  const pistonColor = "#94a3b8";

  return (
    <group ref={groupRef}>
      {/* CORE BODY */}
      <group ref={coreRef}>
        <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[0.4, 0.35, 0.9, 4]} />
          <meshStandardMaterial
            color={armorColor}
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        <mesh position={[0, 0, 0.28]} scale={[0.6, 0.8, 0.1]}>
          <planeGeometry />
          <meshStandardMaterial color={darkMetal} roughness={0.8} />
        </mesh>

        <mesh ref={reactorRef} position={[0, 0.1, 0.25]}>
          <capsuleGeometry args={[0.1, 0.2, 4, 8]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1}
          />
        </mesh>
        <mesh position={[0, 0.1, 0.3]}>
          <boxGeometry args={[0.25, 0.02, 0.05]} />
          <meshStandardMaterial color={darkMetal} />
        </mesh>
        <mesh position={[0, 0.1, 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.25, 0.02, 0.05]} />
          <meshStandardMaterial color={darkMetal} />
        </mesh>

        <group ref={headSensorRef} position={[0, 0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.3, 0.15, 6]} />
            <meshStandardMaterial color={darkMetal} />
          </mesh>
          <mesh position={[0, 0, 0.18]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.05, 0.3, 0.02]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3]} />
            <meshStandardMaterial color={pistonColor} />
          </mesh>
          <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3]} />
            <meshStandardMaterial color={pistonColor} />
          </mesh>
        </group>

        {/* FACE */}
        <group ref={faceGroupRef} position={[0, 0.2, 0.22]}>
          <mesh>
            <planeGeometry args={[0.22, 0.12]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh ref={leftEyeRef} position={[-0.05, 0, 0.01]}>
            <planeGeometry args={[0.04, 0.05]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} />
          </mesh>
          <mesh ref={rightEyeRef} position={[0.05, 0, 0.01]}>
            <planeGeometry args={[0.04, 0.05]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} />
          </mesh>
          <mesh ref={leftBrowRef} position={[-0.05, 0.04, 0.02]}>
            <boxGeometry args={[0.08, 0.015, 0.01]} />
            <meshStandardMaterial color={pistonColor} />
          </mesh>
          <mesh ref={rightBrowRef} position={[0.05, 0.04, 0.02]}>
            <boxGeometry args={[0.08, 0.015, 0.01]} />
            <meshStandardMaterial color={pistonColor} />
          </mesh>
        </group>
      </group>

      {/* SHIELDS */}
      <group ref={leftArmGroup} position={[-0.6, 0, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 1.1, 0.15]} />
          <meshStandardMaterial
            color={armorColor}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[-0.05, 0, 0.08]}>
          <boxGeometry args={[0.2, 0.9, 0.05]} />
          <meshStandardMaterial
            color={darkMetal}
            roughness={0.7}
            metalness={0.8}
          />
        </mesh>
        <group position={[0.2, 0, -0.1]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh ref={leftPistonRef} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4]} />
            <meshStandardMaterial color={pistonColor} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3]} />
            <meshStandardMaterial color={darkMetal} />
          </mesh>
        </group>
        <mesh position={[0, 0.2, 0.08]}>
          <boxGeometry args={[0.2, 0.05, 0.02]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      <group ref={rightArmGroup} position={[0.6, 0, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 1.1, 0.15]} />
          <meshStandardMaterial
            color={armorColor}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0.05, 0, 0.08]}>
          <boxGeometry args={[0.2, 0.9, 0.05]} />
          <meshStandardMaterial
            color={darkMetal}
            roughness={0.7}
            metalness={0.8}
          />
        </mesh>
        <group position={[-0.2, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
          <mesh ref={rightPistonRef} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4]} />
            <meshStandardMaterial color={pistonColor} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3]} />
            <meshStandardMaterial color={darkMetal} />
          </mesh>
        </group>
        <mesh position={[0, 0.2, 0.08]}>
          <boxGeometry args={[0.2, 0.05, 0.02]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* SMOKE */}
      {hpPercentage < 0.3 && (
        <group position={[0, 0.8, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.3, 0]} />
            <meshBasicMaterial
              color="#333"
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
