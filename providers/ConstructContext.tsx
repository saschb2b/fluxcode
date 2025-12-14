"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  TriggerActionPair,
  Construct,
  ActiveConstructSlot,
  Trigger,
  Action,
} from "@/types/game";
import { AVAILABLE_TRIGGERS } from "@/lib/triggers";
import { AVAILABLE_ACTIONS } from "@/lib/actions";
import { AVAILABLE_CONSTRUCTS } from "@/lib/constructs"; // Assuming you have this list
import {
  loadProgress,
  PlayerProgress,
  saveProgress,
} from "@/lib/meta-progression";
import { FighterCustomization } from "@/lib/fighter-parts";

// --- TYPES ---
export interface ConstructState {
  selectedConstruct: Construct | null;
  activeSlotId: string | null;
  fighterCustomization: FighterCustomization | null;
  movementPairs: TriggerActionPair[];
  tacticalPairs: TriggerActionPair[];
}

export interface ConstructActions {
  initConstructState: () => void; // Call on mount to load from disk
  selectConstruct: (construct: Construct, slotId: string) => void;
  setCustomization: (customization: FighterCustomization) => void;

  // Protocol CRUD
  addMovementPair: (trigger: Trigger, action: Action) => void;
  addTacticalPair: (trigger: Trigger, action: Action) => void;
  removeMovementPair: (index: number) => void;
  removeTacticalPair: (index: number) => void;
  updateMovementPriority: (index: number, newPriority: number) => void;
  updateTacticalPriority: (index: number, newPriority: number) => void;
  toggleMovementPair: (index: number, enabled: boolean) => void;
  toggleTacticalPair: (index: number, enabled: boolean) => void;
}

const ConstructContext = createContext<
  (ConstructState & ConstructActions) | undefined
>(undefined);

// --- PROVIDER ---
export function ConstructProvider({ children }: { children: ReactNode }) {
  const [selectedConstruct, setSelectedConstruct] = useState<Construct | null>(
    null,
  );
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [fighterCustomization, setFighterCustomization] =
    useState<FighterCustomization | null>(null);
  const [movementPairs, setMovementPairs] = useState<TriggerActionPair[]>([]);
  const [tacticalPairs, setTacticalPairs] = useState<TriggerActionPair[]>([]);

  // --- HELPER: PERSIST TO DISK ---
  // Syncs current pairs/selection back to the PlayerProgress object
  const persistState = useCallback(
    (
      newConstruct?: Construct,
      newSlotId?: string,
      newMovement?: TriggerActionPair[],
      newTactical?: TriggerActionPair[],
      newCustomization?: FighterCustomization,
    ) => {
      const currentProgress = loadProgress();

      const c = newConstruct || selectedConstruct;
      const sId = newSlotId || activeSlotId;
      const mv = newMovement || movementPairs;
      const tac = newTactical || tacticalPairs;
      const cust = newCustomization || fighterCustomization;

      if (!c || !sId) return; // Not ready to save

      const updatedSlot: ActiveConstructSlot = {
        slotId: sId,
        constructId: c.id,
        // Serialize TriggerActionPair -> Simple IDs
        movementProtocols: mv.map((p) => ({
          triggerId: p.trigger.id,
          actionId: p.action.id,
          priority: p.priority,
          enabled: p.enabled,
          trigger: p.trigger,
          action: p.action,
        })),
        tacticalProtocols: tac.map((p) => ({
          triggerId: p.trigger.id,
          actionId: p.action.id,
          priority: p.priority,
          enabled: p.enabled,
          trigger: p.trigger,
          action: p.action,
        })),
      };

      const newProgress: PlayerProgress = {
        ...currentProgress,
        selectedConstructSlot: sId,
        activeConstructSlots: {
          ...(currentProgress.activeConstructSlots || {}),
          [sId]: updatedSlot,
        },
        // You might want to save customization separately if it's per-slot
      };

      saveProgress(newProgress);
    },
    [
      selectedConstruct,
      activeSlotId,
      movementPairs,
      tacticalPairs,
      fighterCustomization,
    ],
  );

  // --- ACTIONS ---

  const initConstructState = useCallback(() => {
    const progress = loadProgress();
    if (!progress || !progress.selectedConstructSlot) return;

    const slotId = progress.selectedConstructSlot;
    const slotData = progress.activeConstructSlots?.[slotId];

    if (slotData) {
      // Hydrate Construct
      const construct =
        AVAILABLE_CONSTRUCTS.find((c) => c.id === slotData.constructId) ||
        AVAILABLE_CONSTRUCTS[0];
      setSelectedConstruct(construct);
      setActiveSlotId(slotId);

      // Hydrate Protocols
      const hydratePairs = (protos: any[]): TriggerActionPair[] => {
        return protos
          .map((p) => ({
            trigger: AVAILABLE_TRIGGERS.find((t) => t.id === p.triggerId)!,
            action: AVAILABLE_ACTIONS.find((a) => a.id === p.actionId)!,
            priority: p.priority,
            enabled: p.enabled ?? true,
          }))
          .filter((p) => p.trigger && p.action);
      };

      setMovementPairs(hydratePairs(slotData.movementProtocols || []));
      setTacticalPairs(hydratePairs(slotData.tacticalProtocols || []));
    }
  }, []);

  const selectConstruct = useCallback(
    (construct: Construct, slotId: string) => {
      setSelectedConstruct(construct);
      setActiveSlotId(slotId);

      // Check if slot exists in storage to load it, else init empty
      const progress = loadProgress();
      const slotData = progress.activeConstructSlots?.[slotId];

      if (slotData && slotData.constructId === construct.id) {
        // Re-load existing logic if switching back to a known slot
        // (Can reuse init logic or just let the state update)
      } else {
        // Reset for new slot
        const always = AVAILABLE_TRIGGERS.find((t) => t.id === "always")!;
        const shoot = AVAILABLE_ACTIONS.find((a) => a.id === "shoot")!;
        const defaultTac = [
          { trigger: always, action: shoot, priority: 1, enabled: true },
        ];

        setMovementPairs([]);
        setTacticalPairs(defaultTac);

        // Force save immediate state so we don't lose the new slot creation
        persistState(construct, slotId, [], defaultTac);
      }
    },
    [persistState],
  );

  // -- CRUD WRAPPERS --
  const addMovementPair = useCallback(
    (trigger: Trigger, action: Action) => {
      setMovementPairs((prev) => {
        const next = [
          ...prev,
          { trigger, action, priority: prev.length + 1, enabled: true },
        ];
        persistState(undefined, undefined, next, undefined); // Auto-save
        return next;
      });
    },
    [persistState],
  );

  const addTacticalPair = useCallback(
    (trigger: Trigger, action: Action) => {
      setTacticalPairs((prev) => {
        const next = [
          ...prev,
          { trigger, action, priority: prev.length + 1, enabled: true },
        ];
        persistState(undefined, undefined, undefined, next);
        return next;
      });
    },
    [persistState],
  );

  const removeMovementPair = useCallback(
    (index: number) => {
      setMovementPairs((prev) => {
        const next = prev.filter((_, i) => i !== index);
        persistState(undefined, undefined, next, undefined);
        return next;
      });
    },
    [persistState],
  );

  const removeTacticalPair = useCallback(
    (index: number) => {
      setTacticalPairs((prev) => {
        const next = prev.filter((_, i) => i !== index);
        persistState(undefined, undefined, undefined, next);
        return next;
      });
    },
    [persistState],
  );

  const updateMovementPriority = useCallback(
    (index: number, priority: number) => {
      setMovementPairs((prev) => {
        const next = prev.map((p, i) => (i === index ? { ...p, priority } : p));
        persistState(undefined, undefined, next, undefined);
        return next;
      });
    },
    [persistState],
  );

  const updateTacticalPriority = useCallback(
    (index: number, priority: number) => {
      setTacticalPairs((prev) => {
        const next = prev.map((p, i) => (i === index ? { ...p, priority } : p));
        persistState(undefined, undefined, undefined, next);
        return next;
      });
    },
    [persistState],
  );

  const toggleMovementPair = useCallback(
    (index: number, enabled: boolean) => {
      setMovementPairs((prev) => {
        const next = prev.map((p, i) => (i === index ? { ...p, enabled } : p));
        persistState(undefined, undefined, next, undefined);
        return next;
      });
    },
    [persistState],
  );

  const toggleTacticalPair = useCallback(
    (index: number, enabled: boolean) => {
      setTacticalPairs((prev) => {
        const next = prev.map((p, i) => (i === index ? { ...p, enabled } : p));
        persistState(undefined, undefined, undefined, next);
        return next;
      });
    },
    [persistState],
  );

  const setCustomizationWrapper = useCallback(
    (customization: FighterCustomization) => {
      setFighterCustomization(customization);
      // If you save visual customization in PlayerProgress, add it to persistState here
      // persistState(undefined, undefined, undefined, undefined, customization);
    },
    [persistState],
  );

  return (
    <ConstructContext.Provider
      value={{
        selectedConstruct,
        activeSlotId,
        fighterCustomization,
        movementPairs,
        tacticalPairs,
        initConstructState,
        selectConstruct,
        setCustomization: setCustomizationWrapper,
        addMovementPair,
        addTacticalPair,
        removeMovementPair,
        removeTacticalPair,
        updateMovementPriority,
        updateTacticalPriority,
        toggleMovementPair,
        toggleTacticalPair,
      }}
    >
      {children}
    </ConstructContext.Provider>
  );
}

export function useConstruct() {
  const context = useContext(ConstructContext);
  if (!context)
    throw new Error("useConstruct must be used within ConstructProvider");
  return context;
}
