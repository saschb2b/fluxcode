"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FighterPreview } from "@/components/fighter-preview";
import { AnimatedBackdrop } from "@/components/animated-backdrop";
import type { FighterCustomization } from "@/types/game";
import type { NetworkLayer } from "@/lib/network-layers";
import { generateEnemyName } from "@/lib/enemy-names";
import { getNodeIcon } from "@/lib/network-layers";
import { Crown, MapPin, Shield, Crosshair } from "lucide-react";

interface EnemyIntroductionProps {
  wave: number;
  enemyCustomization: FighterCustomization;
  enemyMaxHp: number;
  onBeginBattle: () => void;
  isOpen: boolean;
  currentLayer?: NetworkLayer;
  currentNodeIndex?: number;
  isGuardianBattle?: boolean;
  enemyShields?: number;
  enemyArmor?: number;
  enemyResistances?: Partial<Record<string, number>>;
}

export function EnemyIntroduction({
  wave,
  enemyCustomization,
  enemyMaxHp,
  onBeginBattle,
  isOpen,
  currentLayer,
  currentNodeIndex,
  isGuardianBattle,
  enemyShields = 0,
  enemyArmor = 0,
  enemyResistances = {},
}: EnemyIntroductionProps) {
  if (!isOpen) return null;

  const { name, title } = generateEnemyName(wave);

  const currentNode =
    currentLayer && typeof currentNodeIndex === "number"
      ? currentLayer.nodes[currentNodeIndex]
      : null;
  const nodeType = currentNode?.type || "battle";
  const totalNodes = currentLayer?.nodes.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl border-4 border-primary bg-card/95 backdrop-blur">
        <div className="p-4">
          {currentLayer && typeof currentNodeIndex === "number" && (
            <div className="mb-3 p-2 rounded-lg border-2 border-primary/30 bg-background/50">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {currentLayer.name}
                  </span>
                </div>
                {isGuardianBattle && (
                  <div className="flex items-center gap-1 text-yellow-400 animate-pulse">
                    <Crown className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">
                      Guardian
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Node {currentNodeIndex + 1} of {totalNodes}
                </span>
                <span className="text-primary">•</span>
                <span className="flex items-center gap-1">
                  <span>{getNodeIcon(nodeType)}</span>
                  <span className="capitalize">
                    {nodeType === "guardian"
                      ? "Layer Guardian"
                      : `${nodeType} Node`}
                  </span>
                </span>
              </div>

              <div className="mt-1.5 h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{
                    width: `${((currentNodeIndex + 1) / totalNodes) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="text-center mb-3">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
              {isGuardianBattle ? "Layer Guardian" : `Wave ${wave}`} - New
              Challenger
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary mb-1">
              {name}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-secondary italic">
              {title}
            </p>
          </div>

          <div className="relative w-full h-48 sm:h-64 mb-3 rounded-lg overflow-hidden border-2 border-primary/50 bg-background/50">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0.5, 4]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight
                position={[-10, -10, -10]}
                intensity={0.5}
                color="#06b6d4"
              />
              <pointLight
                position={[0, 5, 5]}
                intensity={0.8}
                color="#ec4899"
              />

              <AnimatedBackdrop />

              <group position={[0, 0.3, 0]}>
                <FighterPreview customization={enemyCustomization} autoRotate />
              </group>

              <Html position={[-1.5, 1.2, 0]} center>
                <div className="bg-background/90 backdrop-blur-sm border-2 border-destructive/50 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 text-center">
                    HP
                  </div>
                  <div className="text-xl font-bold text-destructive text-center">
                    {enemyMaxHp}
                  </div>
                </div>
              </Html>

              <Html position={[1.5, 1.2, 0]} center>
                <div className="bg-background/90 backdrop-blur-sm border-2 border-primary/50 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 text-center">
                    Threat
                  </div>
                  <div className="text-xl font-bold text-primary text-center">
                    {wave}
                  </div>
                </div>
              </Html>
            </Canvas>
          </div>

          {(enemyShields > 0 ||
            enemyArmor > 0 ||
            Object.keys(enemyResistances).length > 0) && (
            <div className="mb-3 p-3 rounded-lg border border-primary/30 bg-background/30">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Defense Profile
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                {enemyShields > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 font-mono">
                      {enemyShields}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Shields
                    </span>
                  </div>
                )}

                {enemyArmor > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-mono">
                      {enemyArmor}
                    </span>
                    <span className="text-xs text-muted-foreground">Armor</span>
                  </div>
                )}
              </div>

              {Object.keys(enemyResistances).length > 0 && (
                <div className="pt-2 border-t border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">
                    Resistances:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(enemyResistances).map(([type, value]) => (
                      <div
                        key={type}
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          value > 0
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-green-500/10 border-green-500/30 text-green-400"
                        }`}
                      >
                        {type.toUpperCase()}{" "}
                        {value > 0
                          ? `+${Math.round(value * 100)}%`
                          : `${Math.round(value * 100)}%`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full text-base sm:text-lg md:text-xl font-bold py-4 sm:py-5 bg-primary hover:bg-primary/80 border-2 border-primary-foreground shadow-lg active:scale-95"
              onClick={onBeginBattle}
            >
              FIGHT!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
