"use client";

import type React from "react";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Terminal, Shield, Lock, ArrowLeft } from "lucide-react";
import { AVAILABLE_TRIGGERS } from "@/lib/triggers";
import { AVAILABLE_ACTIONS } from "@/lib/actions";
import { DamageType } from "@/types/game";
import type { Trigger, Action } from "@/types/game";
import { ElementalProjectileVisual } from "@/components/elemental-projectile-visual";

interface CodexProps {
  isOpen: boolean;
  onClose: () => void;
}

const ELEMENTAL_DATA = [
  {
    type: DamageType.KINETIC,
    name: "Kinetic",
    color: "#94a3b8",
    description: "Ballistic projectiles and physical impact",
    effect:
      "Standard damage type. Strong vs armor plating, weak vs energy shields.",
    statusEffect: "None",
    narrative:
      "Conventional ballistic weapons. Effective at penetrating physical armor but dispersed by energy shields.",
    threat: "STANDARD",
  },
  {
    type: DamageType.ENERGY,
    name: "Energy",
    color: "#22d3ee",
    description: "Plasma beams and directed energy weaponry",
    effect:
      "+100% damage vs shields, -50% damage vs armor. Best shield-breaker in the arsenal.",
    statusEffect:
      "EMP - Drains 8% of current shields instantly and disables shield regeneration for 5s (stacks up to 5x)",
    narrative:
      "Superheated plasma bursts designed for shield disruption. Each EMP proc cripples energy barriers and prevents recovery, leaving targets vulnerable. Ineffective against physical plating.",
    threat: "HIGH",
  },
  {
    type: DamageType.THERMAL,
    name: "Thermal",
    color: "#f97316",
    description: "Incendiary and heat-based attacks",
    effect:
      "Applies burn stacks that deal 2 damage per 0.5s directly to HP, bypassing all defenses.",
    statusEffect:
      "Burn - Each stack inflicts persistent heat damage to core systems every 0.5s for 4 seconds (stacks up to 5x independently)",
    narrative:
      "Ignition-based weaponry that bypasses external defenses entirely. Multiple burn stacks create devastating damage-over-time, cooking core processing systems from the inside.",
    threat: "CRITICAL",
  },
  {
    type: DamageType.VIRAL,
    name: "Viral",
    color: "#a855f7",
    description: "Malware injection and system corruption",
    effect:
      "Amplifies ALL damage to HP. Scales progressively: 1 stack = +20%, 2 = +35%, 3 = +50%, 4 = +75%, 5 = +100%.",
    statusEffect:
      "Viral Infection - Corrupts structural integrity, making target take massively increased HP damage. Each stack lasts 10s independently (max 5 stacks)",
    narrative:
      "Corrupted data payloads that compromise system integrity at the fundamental level. A fully infected target takes double damage from all sources, making Viral essential for high-HP enemies.",
    threat: "CRITICAL",
  },
  {
    type: DamageType.CORROSIVE,
    name: "Corrosive",
    color: "#84cc16",
    description: "Armor degradation protocols",
    effect:
      "Each proc permanently strips 10% of current armor (minimum 1 point). Stacks until armor reaches 0.",
    statusEffect:
      "Degrade - Permanently dismantles armor plating. Each application strips more until defenses are completely eliminated (no stack limit)",
    narrative:
      "Nanite-based disassembly agents that systematically dissolve physical plating. Against heavily armored targets, Corrosive is essential—strip their defenses to expose vulnerable systems beneath.",
    threat: "HIGH",
  },
  {
    type: DamageType.EXPLOSIVE,
    name: "Explosive",
    color: "#ef4444",
    description: "High-energy detonations",
    effect: "Balanced damage vs all defense layers.",
    statusEffect: "Stagger - Briefly disrupts enemy positioning and timing",
    narrative:
      "Omnidirectional kinetic force. Effective against all system types through sheer destructive power.",
    threat: "STANDARD",
  },
  {
    type: DamageType.GLACIAL,
    name: "Cryo-Flux",
    color: "#06b6d4",
    description: "Quantum-cooled time manipulation",
    effect:
      "-10% damage vs shields, moderate (100%) vs armor/HP. Impedes enemy processing cycles and creates tactical windows.",
    statusEffect:
      "Lag - Each stack increases enemy cooldowns by +15%, reduces movement by -10%, and adds 5% chance of action failure. Creates frame-drop stuttering (stacks up to 5x, 6s duration)",
    narrative:
      "Controlled injections of quantum-cooled Cryo-Flux agents. Doesn't directly disable protocols but critically destabilizes an enemy's internal clock cycles and processing environment, causing intermittent system hangs, cooldown delays, and movement restrictions. Synergizes with all elements by extending exposure windows.",
    threat: "HIGH",
  },
];

// ... existing 3D visualization components remain the same ...
function TriggerVisualization({ trigger }: { trigger: Trigger }) {
  const isDistance =
    trigger.id.includes("enemy") &&
    (trigger.id.includes("range") ||
      trigger.id.includes("close") ||
      trigger.id.includes("far"));
  const isHP = trigger.id.includes("hp");
  const isPosition =
    trigger.id.includes("row") ||
    trigger.id.includes("front") ||
    trigger.id.includes("back") ||
    trigger.id.includes("top") ||
    trigger.id.includes("middle") ||
    trigger.id.includes("bottom");
  const isDamage = trigger.id.includes("damage");
  const isAlways = trigger.id === "always";

  return (
    <group>
      {isDistance && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.6, 32]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
          </mesh>
        </>
      )}
      {isHP && (
        <group>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.5, 0.3, 0.1]} />
            <meshStandardMaterial
              color="#ff0066"
              emissive="#ff0066"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[1.5, 0.3, 0.1]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}
      {isPosition && (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
        </group>
      )}
      {isDamage && (
        <group>
          <mesh>
            <octahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial
              color="#ff3333"
              emissive="#ff3333"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.8, 0]} />
            <meshBasicMaterial
              color="#ff3333"
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      )}
      {isAlways && (
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[-0.3, 0, 0]}>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      )}
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  );
}

function ActionVisualization({ action }: { action: Action }) {
  if (action.damageType) {
    return (
      <ElementalProjectileVisual damageType={action.damageType} scale={1.2} />
    );
  }

  const mockContext = {
    playerPos: { x: 0, y: 1 },
    enemyPos: { x: 2, y: 1 },
    playerHP: 100,
    playerMaxHP: 100,
    playerShield: 50,
    playerMaxShield: 100,
    enemyHP: 100,
    enemyMaxHP: 100,
    enemyShield: 0,
    enemyMaxShield: 0,
    lastDamageTaken: 0,
  };

  const actionType = action.execute(mockContext)?.type;

  const isWave = actionType === "wave";
  const isField = actionType === "field";
  const isSpread = actionType === "spread";
  const isRapidFire = actionType === "rapid-fire";
  const isPiercing = actionType === "piercing-shot";
  const isDrain = actionType === "drain";
  const isHoming = actionType === "homing";
  const isBomb = actionType === "bomb" || actionType === "cluster";
  const isDashAttack = actionType === "dash-attack";
  const isRetreatShot = actionType === "retreat-shot";
  const isTripleShot = actionType === "triple-shot";
  const isMelee = actionType === "melee" || actionType === "wide-melee";

  const isShoot =
    actionType === "shoot" ||
    action.id.includes("shot") ||
    action.id.includes("shoot") ||
    action.id.includes("fire") ||
    action.id.includes("cannon");
  const isMove =
    actionType === "move" ||
    action.id.includes("dodge") ||
    action.id.includes("teleport");
  const isHeal = actionType === "heal" || actionType === "heal-over-time";
  const isDefensive =
    actionType === "barrier" ||
    actionType === "counter" ||
    actionType === "shield" ||
    actionType === "invincible";
  const isBuff = actionType === "buff";

  return (
    <group>
      {isWave && (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[i * 0.4 - 0.4, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <torusGeometry args={[0.3 + i * 0.1, 0.1, 16, 32]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.8 - i * 0.2}
                transparent
                opacity={0.7 - i * 0.2}
              />
            </mesh>
          ))}
        </group>
      )}

      {isField && (
        <group>
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[0.8, 0.05, 16, 32]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      )}

      {isSpread && (
        <group rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.2, 1, 8]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh>
            <coneGeometry args={[0.15, 1, 8]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <coneGeometry args={[0.2, 1, 8]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}

      {isRapidFire && (
        <group>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0.5 + i * 0.15, 0, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color="#ff9900"
                emissive="#ff9900"
                emissiveIntensity={1}
              />
            </mesh>
          ))}
        </group>
      )}

      {isDrain && (
        <group>
          <mesh>
            <torusKnotGeometry args={[0.4, 0.12, 64, 8]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.7}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      )}

      {isHoming && (
        <group>
          <mesh>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={1}
            />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              rotation={[0, 0, (Math.PI * 2 * i) / 4]}
              position={[0.5, 0, 0]}
            >
              <coneGeometry args={[0.08, 0.2, 3]} />
              <meshStandardMaterial
                color="#ff00ff"
                emissive="#ff00ff"
                emissiveIntensity={0.7}
              />
            </mesh>
          ))}
        </group>
      )}

      {isTripleShot && (
        <group>
          <mesh position={[0.5, 0.3, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh position={[0.5, -0.3, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      )}

      {isPiercing && (
        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.08, 0.4, 6]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      )}

      {isShoot && !isRapidFire && !isTripleShot && (
        <group>
          <mesh position={[0.5, 0, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}
      {isMove && (
        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0.3, 0, 0]}>
            <coneGeometry args={[0.3, 0.5, 3]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      )}
      {isHeal && (
        <group>
          <mesh>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      )}
      {isMelee && (
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.15, 1, 0.05]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.25, 0.3, 0.1]} />
            <meshStandardMaterial color="#8800ff" />
          </mesh>
        </group>
      )}
      {isBomb && (
        <group>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff6600"
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      )}
      {isDefensive && (
        <group>
          <mesh>
            <cylinderGeometry args={[0.6, 0.4, 0.1, 6]} />
            <meshStandardMaterial
              color="#0088ff"
              emissive="#0088ff"
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[0.5, 0.08, 8, 6]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      )}
      {isBuff && (
        <group>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} rotation={[0, 0, (Math.PI * 2 * i) / 5]}>
              <coneGeometry args={[0.15, 0.6, 3]} />
              <meshStandardMaterial
                color="#ff00ff"
                emissive="#ff00ff"
                emissiveIntensity={1}
              />
            </mesh>
          ))}
        </group>
      )}
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  );
}

function DamageTypeVisualization({
  damageType,
}: {
  damageType: (typeof ELEMENTAL_DATA)[0];
}) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={damageType.color}
          emissive={damageType.color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {damageType.type === DamageType.KINETIC && (
        <>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color={damageType.color} />
          </mesh>
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color={damageType.color} />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.ENERGY && (
        <>
          <mesh position={[0, 0.8, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color={damageType.color}
              emissive={damageType.color}
              emissiveIntensity={1}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.6, 0.05, 16, 32]} />
            <meshBasicMaterial
              color={damageType.color}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.THERMAL && (
        <>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.5 + i * 0.2, 0]}>
              <sphereGeometry args={[0.15 - i * 0.03, 16, 16]} />
              <meshStandardMaterial
                color={damageType.color}
                emissive={damageType.color}
                emissiveIntensity={1 - i * 0.2}
                transparent
                opacity={0.8 - i * 0.2}
              />
            </mesh>
          ))}
        </>
      )}

      {damageType.type === DamageType.CORROSIVE && (
        <>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.5, 0.08, 8, 8]} />
            <meshStandardMaterial
              color={damageType.color}
              emissive={damageType.color}
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.6, 0.06, 8, 8]} />
            <meshStandardMaterial
              color={damageType.color}
              emissive={damageType.color}
              emissiveIntensity={0.4}
            />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.EXPLOSIVE && (
        <>
          <mesh>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshBasicMaterial
              color={damageType.color}
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
          <mesh>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color={damageType.color}
              emissive={damageType.color}
              emissiveIntensity={0.6}
            />
          </mesh>
        </>
      )}

      {damageType.type === DamageType.GLACIAL && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh
              key={i}
              rotation={[0, (Math.PI * 2 * i) / 8, Math.PI / 4]}
              position={[0.55, 0, 0]}
            >
              <coneGeometry args={[0.08, 0.25, 6]} />
              <meshStandardMaterial
                color={damageType.color}
                emissive={damageType.color}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </>
      )}

      {damageType.type === DamageType.VIRAL && (
        <group>
          <mesh position={[0, 0, 0]}>
            <torusKnotGeometry args={[0.4, 0.1, 64, 8]} />
            <meshStandardMaterial
              color={damageType.color}
              emissive={damageType.color}
              emissiveIntensity={0.7}
            />
          </mesh>
        </group>
      )}

      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  );
}

function RotatingVisualization({ children }: { children: React.ReactNode }) {
  return <group rotation={[0, Date.now() * 0.001, 0]}>{children}</group>;
}

export function Codex({ isOpen, onClose }: CodexProps) {
  const [activeTab, setActiveTab] = useState<
    "triggers" | "actions" | "damage-types"
  >("triggers");
  const [selectedItem, setSelectedItem] = useState<
    Trigger | Action | (typeof ELEMENTAL_DATA)[0] | null
  >(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  if (!isOpen) return null;

  const items =
    activeTab === "triggers"
      ? [...AVAILABLE_TRIGGERS].sort((a, b) => a.name.localeCompare(b.name))
      : activeTab === "actions"
        ? [...AVAILABLE_ACTIONS].sort((a, b) => a.name.localeCompare(b.name))
        : [...ELEMENTAL_DATA].sort((a, b) => a.name.localeCompare(b.name));

  const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false });

  const getClearanceColor = () => {
    switch (activeTab) {
      case "triggers":
        return "text-secondary";
      case "actions":
        return "text-accent";
      case "damage-types":
        return "text-primary";
      default:
        return "text-foreground";
    }
  };

  const getElementalData = (damageType: DamageType) => {
    return ELEMENTAL_DATA.find((el) => el.type === damageType);
  };

  const handleItemSelect = (item: typeof selectedItem) => {
    setSelectedItem(item);
    setShowMobileDetail(true);
  };

  const handleMobileBack = () => {
    setShowMobileDetail(false);
    setSelectedItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full h-full sm:w-[90vw] sm:h-[85vh] max-w-6xl bg-card/95 border-2 border-primary shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-primary/50 bg-background/80">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            {showMobileDetail && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMobileBack}
                className="md:hidden hover:bg-primary/20 h-8 w-8 border border-border flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-primary/20 flex items-center justify-center border border-primary/50 flex-shrink-0">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="text-sm sm:text-xl font-bold text-primary tracking-wider">
                  BREACH TERMINAL
                </h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1 text-[9px] sm:text-xs text-muted-foreground font-mono">
                <span>ACCESS: GRANTED</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">TIME: {currentTime}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/20 h-8 w-8 sm:h-10 sm:w-10 border border-border flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <div
          className={`flex gap-1 sm:gap-2 p-2 sm:p-3 border-b border-border/50 bg-background/50 ${showMobileDetail ? "hidden md:flex" : "flex"} overflow-x-auto`}
        >
          <Button
            variant={activeTab === "triggers" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("triggers");
              setSelectedItem(null);
              setShowMobileDetail(false);
            }}
            className={`flex-1 h-10 sm:h-11 text-[10px] sm:text-sm font-mono border-2 ${
              activeTab === "triggers"
                ? "border-secondary bg-secondary/20 text-secondary hover:bg-secondary/30"
                : "border-border/50 hover:border-secondary/50"
            }`}
          >
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">IF</span> CONDITIONALS
          </Button>
          <Button
            variant={activeTab === "actions" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("actions");
              setSelectedItem(null);
              setShowMobileDetail(false);
            }}
            className={`flex-1 h-10 sm:h-11 text-[10px] sm:text-sm font-mono border-2 ${
              activeTab === "actions"
                ? "border-accent bg-accent/20 text-accent hover:bg-accent/30"
                : "border-border/50 hover:border-accent/50"
            }`}
          >
            <Terminal className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">THEN</span> EXECUTIONS
          </Button>
          <Button
            variant={activeTab === "damage-types" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("damage-types");
              setSelectedItem(null);
              setShowMobileDetail(false);
            }}
            className={`flex-1 h-10 sm:h-11 text-[10px] sm:text-sm font-mono border-2 ${
              activeTab === "damage-types"
                ? "border-primary bg-primary/20 text-primary hover:bg-primary/30"
                : "border-border/50 hover:border-primary/50"
            }`}
          >
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">DMG</span> VECTORS
          </Button>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          <div
            className={`w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-border/50 bg-background/30 ${showMobileDetail ? "hidden md:block" : "block"} overflow-y-auto`}
          >
            {items.map((item) => {
              const isDamageType = "color" in item;
              const key = isDamageType
                ? (item as (typeof ELEMENTAL_DATA)[0]).type
                : (item as Trigger | Action).id;

              const actionItem = !isDamageType ? (item as Action) : null;
              const elementalData = actionItem?.damageType
                ? getElementalData(actionItem.damageType)
                : null;

              return (
                <button
                  key={key}
                  onClick={() => handleItemSelect(item)}
                  className={`w-full text-left p-2 sm:p-3 rounded border-2 transition-all active:scale-[0.98] font-mono ${
                    selectedItem === item
                      ? `${getClearanceColor()} bg-current/10 border-current`
                      : "border-border/30 hover:border-current/50 text-foreground/90 hover:bg-card/50"
                  }`}
                >
                  {isDamageType ? (
                    <>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{
                              backgroundColor: (
                                item as (typeof ELEMENTAL_DATA)[0]
                              ).color,
                            }}
                          />
                          <div className="font-bold text-xs sm:text-sm tracking-wide uppercase">
                            {(item as (typeof ELEMENTAL_DATA)[0]).name}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                        {(item as (typeof ELEMENTAL_DATA)[0]).description}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {elementalData && (
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                              style={{ backgroundColor: elementalData.color }}
                              title={elementalData.name}
                            />
                          )}
                          <div className="font-bold text-xs sm:text-sm tracking-wide uppercase line-clamp-1">
                            {(item as Trigger | Action).name}
                          </div>
                        </div>
                        {"cooldown" in item && (
                          <span className="text-[9px] sm:text-xs text-muted-foreground whitespace-nowrap">
                            {(item as Action).cooldown}ms
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
                        {(item as Trigger | Action).description}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div
            className={`flex-1 flex flex-col min-h-0 bg-background/20 ${!showMobileDetail ? "hidden md:flex" : "flex"}`}
          >
            {selectedItem ? (
              <>
                <div className="h-[200px] sm:h-[280px] flex-shrink-0 bg-background/80 border-b border-border/50 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(${getClearanceColor().replace("text-", "#")} 1px, transparent 1px), linear-gradient(90deg, ${getClearanceColor().replace("text-", "#")} 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                    <RotatingVisualization>
                      {activeTab === "triggers" ? (
                        <TriggerVisualization
                          trigger={selectedItem as Trigger}
                        />
                      ) : activeTab === "actions" ? (
                        <ActionVisualization action={selectedItem as Action} />
                      ) : (
                        <DamageTypeVisualization
                          damageType={
                            selectedItem as (typeof ELEMENTAL_DATA)[0]
                          }
                        />
                      )}
                    </RotatingVisualization>
                    <OrbitControls enableZoom={false} enablePan={false} />
                  </Canvas>
                  <div className="absolute bottom-2 right-2 text-[9px] sm:text-xs font-mono text-muted-foreground/70 bg-background/80 px-2 py-1 rounded border border-border/30">
                    HOLOGRAPHIC PROJECTION
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <div className="p-3 sm:p-5">
                    {activeTab === "damage-types" ? (
                      <div className="space-y-3 sm:space-y-4 font-mono">
                        <div
                          className="border-l-4 pl-3 sm:pl-4"
                          style={{
                            borderColor: (
                              selectedItem as (typeof ELEMENTAL_DATA)[0]
                            ).color,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                                DAMAGE CLASSIFICATION
                              </div>
                              <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider">
                                {
                                  (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                    .name
                                }
                              </h3>
                            </div>
                            <span
                              className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded border-2 font-bold ${
                                (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                  .threat === "CRITICAL"
                                  ? "border-destructive text-destructive bg-destructive/10"
                                  : (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                        .threat === "HIGH"
                                    ? "border-accent text-accent bg-accent/10"
                                    : "border-muted-foreground text-muted-foreground bg-muted/20"
                              }`}
                            >
                              {
                                (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                  .threat
                              }
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {
                              (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                .description
                            }
                          </p>
                        </div>

                        <div className="p-3 sm:p-4 rounded border-2 border-border/50 bg-card/30 space-y-2">
                          <div className="text-[10px] sm:text-xs font-bold tracking-wider text-primary mb-2">
                            [TACTICAL ANALYSIS]
                          </div>
                          <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                            {
                              (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                .effect
                            }
                          </div>
                        </div>

                        <div
                          className="p-3 sm:p-4 rounded border-2"
                          style={{
                            backgroundColor: `${(selectedItem as (typeof ELEMENTAL_DATA)[0]).color}10`,
                            borderColor: `${(selectedItem as (typeof ELEMENTAL_DATA)[0]).color}40`,
                          }}
                        >
                          <div className="text-[10px] sm:text-xs font-bold tracking-wider mb-2">
                            <span
                              style={{
                                color: (
                                  selectedItem as (typeof ELEMENTAL_DATA)[0]
                                ).color,
                              }}
                            >
                              [STATUS EFFECT]
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-foreground leading-relaxed">
                            {
                              (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                .statusEffect
                            }
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded border-2 border-primary/30 bg-primary/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            <div className="text-[10px] sm:text-xs font-bold tracking-wider text-primary">
                              [CLASSIFIED INTEL]
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                            {
                              (selectedItem as (typeof ELEMENTAL_DATA)[0])
                                .narrative
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4 font-mono">
                        <div
                          className={`border-l-4 ${getClearanceColor()} pl-3 sm:pl-4`}
                          style={{ borderColor: "currentColor" }}
                        >
                          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                            {activeTab === "triggers"
                              ? "CONDITIONAL PROTOCOL"
                              : "EXECUTION PROTOCOL"}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider">
                              {(selectedItem as Trigger | Action).name}
                            </h3>
                            {"damageType" in selectedItem &&
                              (selectedItem as Action).damageType && (
                                <div
                                  className="flex items-center gap-1.5 px-2 py-1 rounded border-2 text-xs font-bold"
                                  style={{
                                    backgroundColor: `${getElementalData((selectedItem as Action).damageType!)?.color}15`,
                                    borderColor: getElementalData(
                                      (selectedItem as Action).damageType!,
                                    )?.color,
                                    color: getElementalData(
                                      (selectedItem as Action).damageType!,
                                    )?.color,
                                  }}
                                >
                                  <div
                                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                                    style={{
                                      backgroundColor: getElementalData(
                                        (selectedItem as Action).damageType!,
                                      )?.color,
                                    }}
                                  />
                                  {getElementalData(
                                    (selectedItem as Action).damageType!,
                                  )?.name.toUpperCase()}
                                </div>
                              )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                            {(selectedItem as Trigger | Action).description}
                          </p>
                        </div>

                        {"damageType" in selectedItem &&
                          (selectedItem as Action).damageType && (
                            <div
                              className="p-3 sm:p-4 rounded border-2"
                              style={{
                                backgroundColor: `${getElementalData((selectedItem as Action).damageType!)?.color}10`,
                                borderColor: `${getElementalData((selectedItem as Action).damageType!)?.color}40`,
                              }}
                            >
                              <div className="text-[10px] sm:text-xs font-bold tracking-wider mb-2">
                                <span
                                  style={{
                                    color: getElementalData(
                                      (selectedItem as Action).damageType!,
                                    )?.color,
                                  }}
                                >
                                  [ELEMENTAL DAMAGE:{" "}
                                  {getElementalData(
                                    (selectedItem as Action).damageType!,
                                  )?.name.toUpperCase()}
                                  ]
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-foreground leading-relaxed mb-2">
                                {
                                  getElementalData(
                                    (selectedItem as Action).damageType!,
                                  )?.effect
                                }
                              </div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground pt-2 border-t border-current/20">
                                <span className="font-bold">
                                  Status Effect:
                                </span>{" "}
                                {
                                  getElementalData(
                                    (selectedItem as Action).damageType!,
                                  )?.statusEffect
                                }
                              </div>
                            </div>
                          )}

                        {"cooldown" in selectedItem && (
                          <div className="p-3 sm:p-4 rounded border-2 border-secondary/30 bg-secondary/10">
                            <div className="text-[10px] sm:text-xs font-bold tracking-wider text-secondary mb-2">
                              [EXECUTION COOLDOWN]
                            </div>
                            <div className="flex items-baseline gap-2">
                              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                                {(selectedItem as Action).cooldown}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                MILLISECONDS
                              </div>
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                              Minimum interval between protocol executions
                            </div>
                          </div>
                        )}

                        <div className="p-3 sm:p-4 rounded border-2 border-border/50 bg-card/30">
                          <div className="text-[10px] sm:text-xs font-bold tracking-wider text-primary mb-2">
                            [CLASSIFICATION]
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {activeTab === "triggers"
                              ? "IF-CONDITIONAL: Evaluates combat state to determine execution priority"
                              : "THEN-EXECUTION: Combat action triggered by matching conditional protocols"}
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded border-2 border-primary/30 bg-primary/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            <div className="text-[10px] sm:text-xs font-bold tracking-wider text-primary">
                              [BREACH OPERATOR NOTES]
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                            {activeTab === "triggers"
                              ? "Conditionals establish priority chains in your breach protocol. Higher priority conditionals override lower ones when multiple match simultaneously. Design protocols that adapt to dynamic combat scenarios."
                              : "Executions define your breacher's combat capabilities. Manage cooldowns strategically - offensive protocols typically have shorter intervals while defensive systems require longer recovery periods. Coordinate execution timing with conditional triggers for optimal combat efficiency."}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center font-mono">
                  <div className="w-16 h-16 mx-auto mb-4 rounded border-2 border-dashed border-border/50 flex items-center justify-center">
                    {activeTab === "damage-types" ? (
                      <Shield className="w-8 h-8 opacity-30" />
                    ) : (
                      <Terminal className="w-8 h-8 opacity-30" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm uppercase tracking-wider">
                    [SELECT{" "}
                    {activeTab === "triggers"
                      ? "CONDITIONAL"
                      : activeTab === "actions"
                        ? "EXECUTION"
                        : "DAMAGE VECTOR"}
                    ]
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1">
                    Access clearance: ALPHA
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
