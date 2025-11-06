"use client"

import { Canvas } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FighterPreview } from "@/components/fighter-preview"
import { AnimatedBackdrop } from "@/components/animated-backdrop"
import type { FighterCustomization } from "@/types/game"
import { generateEnemyName } from "@/lib/enemy-names"

interface EnemyIntroductionProps {
  wave: number
  enemyCustomization: FighterCustomization
  enemyMaxHp: number
  onBeginBattle: () => void
  isOpen: boolean
}

export function EnemyIntroduction({
  wave,
  enemyCustomization,
  enemyMaxHp,
  onBeginBattle,
  isOpen,
}: EnemyIntroductionProps) {
  if (!isOpen) return null

  const { name, title } = generateEnemyName(wave)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl border-4 border-primary bg-card/95 backdrop-blur">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-sm sm:text-base text-muted-foreground uppercase tracking-wider mb-2">
              Wave {wave} - New Challenger
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-2">{name}</h2>
            <p className="text-lg sm:text-xl text-secondary italic">{title}</p>
          </div>

          <div className="relative w-full h-64 sm:h-80 mb-6 rounded-lg overflow-hidden border-2 border-primary/50 bg-background/50">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0.5, 4]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
              <pointLight position={[0, 5, 5]} intensity={0.8} color="#ec4899" />

              <AnimatedBackdrop />

              <group position={[0, 0.3, 0]}>
                <FighterPreview customization={enemyCustomization} autoRotate />
              </group>
            </Canvas>
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur px-3 py-1 rounded border border-primary/50 text-xs text-muted-foreground">
              Auto-rotating
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-background/50 border border-primary/30">
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                Health Points
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-destructive">{enemyMaxHp}</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-background/50 border border-primary/30">
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">Threat Level</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{wave}</div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            size="lg"
            className="w-full text-lg sm:text-xl font-bold py-6 sm:py-8 bg-primary hover:bg-primary/80 border-2 border-primary-foreground shadow-lg active:scale-95"
            onClick={onBeginBattle}
          >
            FIGHT!
          </Button>
        </div>
      </Card>
    </div>
  )
}
