import { TriggerActionPair } from "@/types/game";
import { AVAILABLE_TRIGGERS } from "../triggers";
import { AVAILABLE_ACTIONS } from "../actions";

/**
 * Creates a new trigger-action pair.
 * @param triggerId The ID of the trigger.
 * @param actionId The ID of the action.
 * @param priority The priority of the pair.
 * @returns The created trigger-action pair.
 */
export const createPair = (
  triggerId: string,
  actionId: string,
  priority: number,
): TriggerActionPair => {
  const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === triggerId)!;
  const action = AVAILABLE_ACTIONS.find((a) => a.id === actionId)!;
  return { trigger, action, priority, enabled: true };
};
