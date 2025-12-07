import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PitcherModelProps {
  isAttacking: boolean;
  isHit: boolean;
  hpPercentage: number;
  primaryColor?: string;
  accentColor?: string;
}

export function PitcherModel({
  isAttacking,
  isHit,
  hpPercentage,
  primaryColor = "#3f3f46", // Cast Iron / Dark Grey
  accentColor = "#f97316", // Ember Orange
}: PitcherModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Body Parts
  const bodyRef = useRef<THREE.Group>(null);
  const hatRef = useRef<THREE.Group>(null);

  // Face Parts
  const browRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const pipeRef = useRef<THREE.Group>(null);
  const pipeSmokeRef = useRef<THREE.Group>(null);

  // FX
  const smokeRef = useRef<THREE.Group>(null);

  const offset = useRef(Math.random() * 100).current;
  const lastPos = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const nextBlinkTime = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useFrame((state, delta) => {
    if (
      !groupRef.current ||
      !bodyRef.current ||
      !hatRef.current ||
      !browRef.current ||
      !leftEyeRef.current ||
      !rightEyeRef.current ||
      !pipeRef.current
    )
      return;

    const time = state.clock.elapsedTime + offset;

    // --- 1. MOVEMENT: THE DRAG ---
    const currentPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(currentPos);
    const dist = currentPos.distanceTo(lastPos.current);
    isMoving.current = dist > 0.001;
    lastPos.current.copy(currentPos);

    let bodyY = -0.6; // Sit on the floor (Parent Y=0.6, so -0.6 = 0)
    let bodyRoll = 0;
    let bodyPitch = 0;

    if (isMoving.current && !isHit) {
      // "Scooting" Motion
      const scootSpeed = 10;
      // Hops slightly
      bodyY = -0.6 + Math.abs(Math.sin(time * scootSpeed)) * 0.1;
      // Tips forward to drag
      bodyPitch = 0.15;
      // Waddle
      bodyRoll = Math.sin(time * scootSpeed) * 0.05;
    } else {
      // Idle Breathing
      bodyY = -0.6 + Math.sin(time * 1.5) * 0.01;
    }

    // --- 2. ATTACK: THE COUGH ---
    let targetScaleY = 1;
    let targetScaleX = 1;
    let lidAngle = 0;

    if (isAttacking) {
      // Squash down (Build pressure)
      const charge = Math.sin(time * 20) * 0.05;
      targetScaleY = 0.8 + charge;
      targetScaleX = 1.1 - charge;
      bodyY -= 0.05;

      // Hat pops up
      lidAngle = -0.5;
    } else if (isHit) {
      lidAngle = -0.8;
      bodyRoll = Math.sin(time * 30) * 0.1;
    } else {
      bodyRef.current.scale.set(1, 1, 1);
      lidAngle = 0.1 + Math.sin(time * 1.5) * 0.05;
    }

    // Apply Transforms
    bodyRef.current.position.y = THREE.MathUtils.lerp(
      bodyRef.current.position.y,
      bodyY,
      delta * 5,
    );
    bodyRef.current.rotation.z = THREE.MathUtils.lerp(
      bodyRef.current.rotation.z,
      bodyRoll,
      delta * 5,
    );
    bodyRef.current.rotation.x = THREE.MathUtils.lerp(
      bodyRef.current.rotation.x,
      bodyPitch,
      delta * 5,
    );

    bodyRef.current.scale.set(
      THREE.MathUtils.lerp(bodyRef.current.scale.x, targetScaleX, delta * 5),
      THREE.MathUtils.lerp(bodyRef.current.scale.y, targetScaleY, delta * 5),
      THREE.MathUtils.lerp(bodyRef.current.scale.z, targetScaleX, delta * 5),
    );

    hatRef.current.rotation.z = THREE.MathUtils.lerp(
      hatRef.current.rotation.z,
      lidAngle,
      delta * 8,
    );

    // --- 3. FACE EXPRESSION ---
    // Brow Angle (Angry V)
    let browAngle = 0.2;

    if (isAttacking) {
      browAngle = 0.5; // Very angry
    } else if (isHit) {
      browAngle = -0.2; // Sad
    } else {
      browAngle = 0.2 + Math.sin(time * 2) * 0.05;
    }
    browRef.current.rotation.z = THREE.MathUtils.lerp(
      browRef.current.rotation.z,
      browAngle,
      delta * 5,
    );

    // Blink Logic
    if (!isAttacking && !isHit) {
      if (state.clock.elapsedTime > nextBlinkTime.current) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
        nextBlinkTime.current = state.clock.elapsedTime + 2 + Math.random() * 4;
      }
    }

    // Eyes Glow
    const eyeIntensity = isBlinking ? 0.1 : isAttacking ? 3.0 : 1.0;
    const eyeColor = isAttacking ? "#ef4444" : accentColor;

    (
      leftEyeRef.current.material as THREE.MeshStandardMaterial
    ).emissiveIntensity = eyeIntensity;
    (leftEyeRef.current.material as THREE.MeshStandardMaterial).color.set(
      eyeColor,
    );
    (leftEyeRef.current.material as THREE.MeshStandardMaterial).emissive.set(
      eyeColor,
    );

    (
      rightEyeRef.current.material as THREE.MeshStandardMaterial
    ).emissiveIntensity = eyeIntensity;
    (rightEyeRef.current.material as THREE.MeshStandardMaterial).color.set(
      eyeColor,
    );
    (rightEyeRef.current.material as THREE.MeshStandardMaterial).emissive.set(
      eyeColor,
    );

    // --- 4. SMOKE FX ---
    if (pipeSmokeRef.current) {
      pipeSmokeRef.current.position.y += delta * 0.5;
      if (pipeSmokeRef.current.position.y > 0.5)
        pipeSmokeRef.current.position.y = 0;
      const scale = 1 - pipeSmokeRef.current.position.y * 2;
      pipeSmokeRef.current.scale.setScalar(Math.max(0, scale));
    }

    if (smokeRef.current) {
      smokeRef.current.rotation.y += delta * 0.2;
      smokeRef.current.children.forEach((puff, i) => {
        const speed = 1 + i * 0.1;
        puff.position.y = (time * speed + i) % 1.5;
        const scale = 1 - puff.position.y / 1.5;
        puff.scale.setScalar(scale * 0.4);
      });
    }
  });

  const ironColor = primaryColor;
  const pipeColor = "#78350f";

  return (
    <group ref={groupRef}>
      {/* --- BODY GROUP (Sits on floor) --- */}
      <group ref={bodyRef}>
        {/* Main Hull */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.38, 0.6, 8]} />
          <meshStandardMaterial
            color={isHit ? "white" : ironColor}
            roughness={0.8}
            metalness={0.4}
          />
        </mesh>

        {/* Heavy Base Ring (The "Feet") */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.4, 0.45, 0.1, 8]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>

        {/* Top Rim */}
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.05, 8, 16]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>

        {/* --- THE HAT / LID --- */}
        <group ref={hatRef} position={[-0.2, 0.65, 0]}>
          <group position={[0.2, 0, 0]}>
            {/* Lid */}
            <mesh>
              <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
              <meshStandardMaterial color="#27272a" />
            </mesh>
            {/* Stovepipe Chimney */}
            <mesh position={[0, 0.15, -0.1]} rotation={[-0.2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.18, 0.3]} />
              <meshStandardMaterial color={ironColor} />
            </mesh>
          </group>
        </group>

        {/* --- THE FACE --- */}
        <group position={[0, 0.25, 0.35]}>
          {/* Eyes (Gauges) */}
          <group position={[-0.15, 0.05, 0]} rotation={[0, 0, 0.1]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.02]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh
              ref={leftEyeRef}
              position={[0, 0, 0.02]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.07, 0.07, 0.01]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
              />
            </mesh>
          </group>

          <group position={[0.15, 0.05, 0]} rotation={[0, 0, -0.1]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.02]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh
              ref={rightEyeRef}
              position={[0, 0, 0.02]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.07, 0.07, 0.01]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
              />
            </mesh>
          </group>

          {/* Uni-Brow */}
          <group ref={browRef} position={[0, 0.18, 0.05]}>
            <mesh>
              <boxGeometry args={[0.45, 0.08, 0.05]} />
              <meshStandardMaterial color="#27272a" />
            </mesh>
            {/* Bolt details */}
            <mesh position={[-0.18, 0, 0.03]}>
              <sphereGeometry args={[0.02]} />
              <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.18, 0, 0.03]}>
              <sphereGeometry args={[0.02]} />
              <meshStandardMaterial color="black" />
            </mesh>
          </group>

          {/* The Moustache Grill */}
          <group position={[0, -0.15, 0.02]}>
            <mesh>
              {" "}
              <boxGeometry args={[0.3, 0.1, 0.02]} />{" "}
              <meshStandardMaterial color="#27272a" />{" "}
            </mesh>
            {[...Array(5)].map((_, i) => (
              <mesh key={i} position={[-0.1 + i * 0.05, 0, 0.02]}>
                <boxGeometry args={[0.01, 0.08, 0.01]} />
                <meshStandardMaterial color="#52525b" />
              </mesh>
            ))}
          </group>

          {/* The Pipe */}
          <group
            ref={pipeRef}
            position={[0.18, -0.1, 0.1]}
            rotation={[0, 0, 0.5]}
          >
            <mesh rotation={[0, 0, Math.PI / 2]}>
              {" "}
              <cylinderGeometry args={[0.02, 0.01, 0.15]} />{" "}
              <meshStandardMaterial color={pipeColor} />{" "}
            </mesh>
            <mesh position={[0.08, 0.05, 0]}>
              {" "}
              <cylinderGeometry args={[0.04, 0.02, 0.08]} />{" "}
              <meshStandardMaterial color={pipeColor} />{" "}
            </mesh>
            <group ref={pipeSmokeRef} position={[0.08, 0.1, 0]}>
              <mesh>
                {" "}
                <dodecahedronGeometry args={[0.05]} />{" "}
                <meshStandardMaterial
                  color="gray"
                  transparent
                  opacity={0.5}
                />{" "}
              </mesh>
            </group>
          </group>
        </group>

        {/* Shoulders (Just decoration now) */}
        <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.1, 0.3, 0.2]} />
          <meshStandardMaterial color="#52525b" />
        </mesh>
        <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.1, 0.3, 0.2]} />
          <meshStandardMaterial color="#52525b" />
        </mesh>

        {/* Main Smoke Stack */}
        <group ref={smokeRef} position={[0, 0.7, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <dodecahedronGeometry args={[0.15, 0]} />
              <meshStandardMaterial color="#333" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Low HP Smoke */}
      {hpPercentage < 0.3 && (
        <group position={[0, 0.8, 0]}>
          <mesh>
            {" "}
            <sphereGeometry args={[0.3, 8, 8]} />{" "}
            <meshBasicMaterial
              color="#333"
              wireframe
              transparent
              opacity={0.3}
            />{" "}
          </mesh>
        </group>
      )}
    </group>
  );
}
