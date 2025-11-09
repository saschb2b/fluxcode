import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import type { TriggerActionPair } from "@/types/game"

interface ProtocolConfig {
  triggerId: string
  actionId: string
  priority: number
}

/**
 * Builds full TriggerActionPair objects from protocol configuration
 * by looking up triggers and actions from the available lists
 */
export function buildTriggerActionPairs(protocolConfigs: ProtocolConfig[]): TriggerActionPair[] {
  return protocolConfigs
    .map((config) => {
      const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === config.triggerId)
      const action = AVAILABLE_ACTIONS.find((a) => a.id === config.actionId)

      if (!trigger) {
        console.warn(`[v0] Trigger not found: ${config.triggerId}`)
        return null
      }

      if (!action) {
        console.warn(`[v0] Action not found: ${config.actionId}`)
        return null
      }

      return {
        trigger,
        action,
        priority: config.priority,
      }
    })
    .filter((pair): pair is TriggerActionPair => pair !== null)
    .sort((a, b) => b.priority - a.priority) // Sort by priority descending
}
