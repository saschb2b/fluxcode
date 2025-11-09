"use client"

import { useEffect, useState } from "react"
import { Trophy, Sparkles } from "lucide-react"
import type { ProtocolMastery } from "@/lib/protocol-mastery"

interface MasteryCompletionNotificationProps {
  masteries: ProtocolMastery[]
  totalBonus: number
  onDismiss: () => void
}

export function MasteryCompletionNotification({
  masteries,
  totalBonus,
  onDismiss,
}: MasteryCompletionNotificationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 500)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="bg-gradient-to-br from-yellow-900/95 to-amber-900/95 border-4 border-yellow-500 rounded-lg p-6 shadow-2xl max-w-md animate-in zoom-in-95 pointer-events-auto"
        style={{
          animation: "slideIn 0.5s ease-out, pulse 2s ease-in-out infinite",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
              MASTERY ACHIEVED
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </h3>
            <p className="text-xs text-yellow-200/80">Protocol proficiency recognized</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {masteries.map((mastery) => (
            <div key={mastery.id} className="bg-black/30 rounded p-3 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">{mastery.name}</span>
                <span className="text-cyan-400 font-mono text-xs">+{mastery.reward.cipherFragmentBonus} CF</span>
              </div>
              <p className="text-xs text-slate-300">{mastery.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-black/40 rounded-lg p-4 border-2 border-cyan-500/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Total Mastery Bonus:</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono">+{totalBonus} CF</span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={() => {
              setVisible(false)
              onDismiss()
            }}
            className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            Click to dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
