"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomizableFighter } from "@/components/customizable-fighter";
import {
  X,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Cpu,
  Box,
  Zap,
  Shield,
  Palette,
  Crosshair,
  FlaskConical,
} from "lucide-react";
import { AVAILABLE_TRIGGERS } from "@/lib/triggers";
import { AVAILABLE_ACTIONS } from "@/lib/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomFighterClass } from "@/lib/meta-progression";
import {
  HEAD_SHAPES,
  BODY_SHAPES,
  ARM_SHAPES,
  ACCESSORY_SHAPES,
  WEAPON_SHAPES,
  CHASSIS_TYPES,
  COLOR_PRESETS,
  DEFAULT_CUSTOMIZATION,
  type FighterCustomization,
} from "@/lib/fighter-parts";
import { Simulacrum } from "@/components/hub/construct/simulacrum";
import { Badge } from "@/components/ui/badge";
import { getConstructById } from "@/lib/constructs";

interface FighterClassEditorProps {
  classData: CustomFighterClass;
  onSave: (updatedClass: CustomFighterClass) => void;
  onCancel: () => void;
}

export function FighterClassEditor({
  classData,
  onSave,
  onCancel,
}: FighterClassEditorProps) {
  const [movementProtocols, setMovementProtocols] = useState(
    classData.startingMovementPairs || [],
  );
  const [tacticalProtocols, setTacticalProtocols] = useState(
    classData.startingTacticalPairs || [],
  );
  const [customization, setCustomization] = useState<FighterCustomization>(
    classData.customization || DEFAULT_CUSTOMIZATION,
  );
  const [activeTab, setActiveTab] = useState<"protocols" | "loadout">(
    "protocols",
  );
  const [showTestSimulator, setShowTestSimulator] = useState(false);
  const [loadoutTab, setLoadoutTab] = useState<
    "head" | "body" | "arms" | "accessory" | "weapon" | "chassis" | "colors"
  >("head");

  const construct = getConstructById(classData.id);
  const MAX_MOVEMENT_PROTOCOLS = construct?.maxMovementSlots || 6;
  const MAX_TACTICAL_PROTOCOLS = construct?.maxTacticalSlots || 6;

  const constructMaxHp =
    classData.constructStats?.maxHp || construct?.baseHp || 100;
  const constructMaxShields =
    classData.constructStats?.maxShields || construct?.baseShields || 0;
  const constructMaxArmor =
    classData.constructStats?.maxArmor || construct?.baseArmor || 0;

  const addMovementProtocol = () => {
    if (movementProtocols.length >= MAX_MOVEMENT_PROTOCOLS) {
      return;
    }

    const newPriority =
      movementProtocols.length > 0
        ? Math.min(...movementProtocols.map((p) => p.priority)) - 1
        : 100;

    setMovementProtocols([
      ...movementProtocols,
      {
        triggerId: "",
        actionId: "",
        priority: newPriority,
      },
    ]);
  };

  const addTacticalProtocol = () => {
    if (tacticalProtocols.length >= MAX_TACTICAL_PROTOCOLS) {
      return;
    }

    const newPriority =
      tacticalProtocols.length > 0
        ? Math.min(...tacticalProtocols.map((p) => p.priority)) - 1
        : 100;

    setTacticalProtocols([
      ...tacticalProtocols,
      {
        triggerId: "",
        actionId: "",
        priority: newPriority,
      },
    ]);
  };

  const removeMovementProtocol = (index: number) => {
    setMovementProtocols(movementProtocols.filter((_, i) => i !== index));
  };

  const removeTacticalProtocol = (index: number) => {
    setTacticalProtocols(tacticalProtocols.filter((_, i) => i !== index));
  };

  const updateMovementProtocolTrigger = (index: number, triggerId: string) => {
    const updated = [...movementProtocols];
    updated[index] = { ...updated[index], triggerId };
    setMovementProtocols(updated);
  };

  const updateMovementProtocolAction = (index: number, actionId: string) => {
    const updated = [...movementProtocols];
    updated[index] = { ...updated[index], actionId };
    setMovementProtocols(updated);
  };

  const updateTacticalProtocolTrigger = (index: number, triggerId: string) => {
    const updated = [...tacticalProtocols];
    if (updated[index].isDefault) {
      return;
    }
    updated[index] = { ...updated[index], triggerId };
    setTacticalProtocols(updated);
  };

  const updateTacticalProtocolAction = (index: number, actionId: string) => {
    const updated = [...tacticalProtocols];
    updated[index] = { ...updated[index], actionId };
    setTacticalProtocols(updated);
  };

  const moveMovementProtocol = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === movementProtocols.length - 1)
    ) {
      return;
    }

    const updated = [...movementProtocols];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];

    const tempPriority = updated[index].priority;
    updated[index].priority = updated[swapIndex].priority;
    updated[swapIndex].priority = tempPriority;

    setMovementProtocols(updated);
  };

  const moveTacticalProtocol = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tacticalProtocols.length - 1)
    ) {
      return;
    }

    const updated = [...tacticalProtocols];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];

    const tempPriority = updated[index].priority;
    updated[index].priority = updated[swapIndex].priority;
    updated[swapIndex].priority = tempPriority;

    setTacticalProtocols(updated);
  };

  const handleSave = () => {
    const hasIncompleteMovement = movementProtocols.some(
      (p) => !p.triggerId || !p.actionId,
    );
    const hasIncompleteTactical = tacticalProtocols.some(
      (p) => !p.triggerId || !p.actionId,
    );

    if (hasIncompleteMovement || hasIncompleteTactical) {
      alert(
        "Please complete all protocols before saving. Each protocol must have both a trigger and an action.",
      );
      return;
    }

    const orderedMovementProtocols = movementProtocols.map(
      (protocol, index) => ({
        ...protocol,
        priority: 100 - index,
      }),
    );

    const orderedTacticalProtocols = tacticalProtocols.map(
      (protocol, index) => ({
        ...protocol,
        priority: 100 - index,
      }),
    );

    onSave({
      ...classData,
      startingMovementPairs: orderedMovementProtocols,
      startingTacticalPairs: orderedTacticalProtocols,
      customization,
    });
  };

  const movementActions = AVAILABLE_ACTIONS.filter(
    (a) => a.coreType === "movement",
  );
  const tacticalActions = AVAILABLE_ACTIONS.filter(
    (a) => a.coreType === "tactical",
  );

  const sortedTriggers = [...AVAILABLE_TRIGGERS].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const sortedMovementActions = [...movementActions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const sortedTacticalActions = [...tacticalActions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const getElementColor = (damageType?: string) => {
    const elementColors: Record<string, string> = {
      kinetic: "#94a3b8",
      energy: "#22d3ee",
      thermal: "#f97316",
      viral: "#a855f7",
      corrosive: "#84cc16",
      explosive: "#ef4444",
      concussion: "#ef4444",
      glacial: "#06b6d4",
    };
    return damageType
      ? elementColors[damageType.toLowerCase()] || "#ffffff"
      : null;
  };

  const loadoutTabs = [
    { id: "head" as const, label: "CORE", icon: Cpu },
    { id: "chassis" as const, label: "CHASSIS", icon: Shield },
    { id: "body" as const, label: "HULL", icon: Box },
    { id: "arms" as const, label: "MODULES", icon: Zap },
    { id: "weapon" as const, label: "WEAPON", icon: Crosshair },
    { id: "accessory" as const, label: "ARRAY", icon: Shield },
    { id: "colors" as const, label: "PAINT", icon: Palette },
  ];

  if (showTestSimulator) {
    return (
      <Simulacrum
        classData={{
          ...classData,
          startingMovementPairs: movementProtocols,
          startingTacticalPairs: tacticalProtocols,
          customization,
        }}
        customization={customization}
        onClose={() => setShowTestSimulator(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 my-4 sm:my-6">
        <div className="bg-gradient-to-br from-black/90 to-gray-900/90 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,255,255,0.4)]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-950/95 to-black/95 border-b border-cyan-500/30 p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl sm:text-3xl font-bold text-cyan-400 truncate"
                  style={{ fontFamily: "monospace" }}
                >
                  {classData.name}
                </h2>
                <p className="text-xs sm:text-sm text-cyan-300/70 mt-1 hidden sm:block">
                  Customize the way your fighter class operates in combat
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="hover:bg-red-500/20 hover:border-red-500 border border-transparent flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
              <Button
                onClick={() => setActiveTab("protocols")}
                variant={activeTab === "protocols" ? "default" : "outline"}
                className={`text-xs sm:text-sm ${
                  activeTab === "protocols"
                    ? "bg-cyan-500 text-black border-cyan-400"
                    : "bg-black/50 border-cyan-500/30 hover:border-cyan-500/60"
                }`}
              >
                Combat Protocols
              </Button>
              <Button
                onClick={() => setActiveTab("loadout")}
                variant={activeTab === "loadout" ? "default" : "outline"}
                className={`text-xs sm:text-sm ${
                  activeTab === "loadout"
                    ? "bg-cyan-500 text-black border-cyan-400"
                    : "bg-black/50 border-cyan-500/30 hover:border-cyan-500/60"
                }`}
              >
                Visual Loadout
              </Button>
              <Button
                onClick={() => setShowTestSimulator(true)}
                variant="outline"
                className="bg-purple-950/50 border-purple-500/50 hover:bg-purple-500/20 hover:border-purple-500 text-xs sm:text-sm"
              >
                <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Test Configuration</span>
                <span className="sm:hidden">Test</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6">
            {activeTab === "protocols" && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-purple-950/50 border-purple-500/50 text-purple-300"
                        >
                          {movementProtocols.length}/{MAX_MOVEMENT_PROTOCOLS}
                        </Badge>
                        <h3
                          className="text-xl sm:text-2xl font-bold text-purple-400"
                          style={{ fontFamily: "monospace" }}
                        >
                          MOVEMENT PROTOCOLS
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
                        Controls movement, evasion, and positioning actions
                      </p>
                    </div>
                    <Button
                      onClick={addMovementProtocol}
                      className="bg-purple-500 hover:bg-purple-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                      size="sm"
                      disabled={
                        movementProtocols.length >= MAX_MOVEMENT_PROTOCOLS
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Movement
                    </Button>
                  </div>

                  {movementProtocols.length >= MAX_MOVEMENT_PROTOCOLS && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300">
                      ⚠ Maximum movement protocols reached.
                    </div>
                  )}

                  {movementProtocols.length === 0 ? (
                    <Card className="p-8 border-2 border-dashed border-purple-500/30 bg-black/20 text-center">
                      <p className="text-purple-300/50">
                        No movement protocols configured.
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {movementProtocols.map((protocol, index) => {
                        const trigger = AVAILABLE_TRIGGERS.find(
                          (t) => t.id === protocol.triggerId,
                        );
                        const action = AVAILABLE_ACTIONS.find(
                          (a) => a.id === protocol.actionId,
                        );

                        return (
                          <Card
                            key={index}
                            className="p-4 border-2 border-purple-500/30 bg-purple-950/10 hover:border-purple-500/50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    moveMovementProtocol(index, "up")
                                  }
                                  disabled={index === 0}
                                >
                                  <MoveUp className="w-3 h-3" />
                                </Button>
                                <span className="text-xs sm:text-sm text-purple-300/70 text-center">
                                  #{index + 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    moveMovementProtocol(index, "down")
                                  }
                                  disabled={
                                    index === movementProtocols.length - 1
                                  }
                                >
                                  <MoveDown className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs sm:text-sm text-purple-300/70 mb-2 block">
                                    <span className="text-purple-400 font-bold">
                                      IF
                                    </span>{" "}
                                    Trigger
                                    {!protocol.triggerId && (
                                      <span className="ml-2 text-yellow-400 text-xs">
                                        ⚠ Required
                                      </span>
                                    )}
                                  </label>
                                  <Select
                                    value={protocol.triggerId}
                                    onValueChange={(value) =>
                                      updateMovementProtocolTrigger(
                                        index,
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-full bg-black/50 ${!protocol.triggerId ? "border-yellow-500/70" : "border-purple-500/50"}`}
                                    >
                                      <SelectValue placeholder="Select trigger..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                      {sortedTriggers.map((t) => (
                                        <SelectItem
                                          key={t.id}
                                          value={t.id}
                                          className="font-mono"
                                        >
                                          <div className="flex items-center justify-between gap-3 w-full">
                                            <span className="font-bold text-xs tracking-wide uppercase">
                                              {t.name}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs sm:text-sm text-purple-300/50 mt-1">
                                    {trigger?.description ||
                                      "Choose when this protocol activates"}
                                  </p>
                                </div>

                                <div>
                                  <label className="text-xs sm:text-sm text-purple-300/70 mb-2 block">
                                    <span className="text-green-400 font-bold">
                                      THEN
                                    </span>{" "}
                                    Action (Movement Only)
                                    {!protocol.actionId && (
                                      <span className="ml-2 text-yellow-400 text-xs">
                                        ⚠ Required
                                      </span>
                                    )}
                                  </label>
                                  <Select
                                    value={protocol.actionId}
                                    onValueChange={(value) =>
                                      updateMovementProtocolAction(index, value)
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-full bg-black/50 ${!protocol.actionId ? "border-yellow-500/70" : "border-purple-500/50"}`}
                                    >
                                      <SelectValue placeholder="Select action..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                      {sortedMovementActions.map((a) => {
                                        const elementColor = getElementColor(
                                          a.damageType,
                                        );
                                        return (
                                          <SelectItem
                                            key={a.id}
                                            value={a.id}
                                            className="font-mono"
                                          >
                                            <div className="flex items-center justify-between gap-3 w-full">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {elementColor && (
                                                  <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                                                    style={{
                                                      backgroundColor:
                                                        elementColor,
                                                    }}
                                                  />
                                                )}
                                                <span className="font-bold text-xs tracking-wide uppercase truncate">
                                                  {a.name}
                                                </span>
                                              </div>
                                              <span className="text-[10px] text-cyan-400 shrink-0 ml-2">
                                                {a.cooldown}ms
                                              </span>
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs sm:text-sm text-purple-300/50 mt-1">
                                    {action?.description ||
                                      "Choose movement action"}
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMovementProtocol(index)}
                                className="hover:bg-red-500/20 hover:border-red-500 border border-transparent"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-orange-950/50 border-orange-500/50 text-orange-300"
                        >
                          {tacticalProtocols.length}/{MAX_TACTICAL_PROTOCOLS}
                        </Badge>
                        <h3
                          className="text-xl sm:text-2xl font-bold text-orange-400"
                          style={{ fontFamily: "monospace" }}
                        >
                          TACTICAL PROTOCOLS
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-orange-300/70 mt-1">
                        Controls attacks, buffs, debuffs, and healing
                      </p>
                    </div>
                    <Button
                      onClick={addTacticalProtocol}
                      className="bg-orange-500 hover:bg-orange-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                      size="sm"
                      disabled={
                        tacticalProtocols.length >= MAX_TACTICAL_PROTOCOLS
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tactical
                    </Button>
                  </div>

                  {tacticalProtocols.length >= MAX_TACTICAL_PROTOCOLS && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300">
                      ⚠ Maximum tactical protocols reached.
                    </div>
                  )}

                  {tacticalProtocols.length === 0 ? (
                    <Card className="p-8 border-2 border-dashed border-orange-500/30 bg-black/20 text-center">
                      <p className="text-orange-300/50">
                        No tactical protocols configured.
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {tacticalProtocols.map((protocol, index) => {
                        const trigger = AVAILABLE_TRIGGERS.find(
                          (t) => t.id === protocol.triggerId,
                        );
                        const action = AVAILABLE_ACTIONS.find(
                          (a) => a.id === protocol.actionId,
                        );
                        const isDefaultProtocol = protocol.isDefault === true;

                        return (
                          <Card
                            key={index}
                            className="p-4 border-2 border-orange-500/30 bg-orange-950/10 hover:border-orange-500/50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    moveTacticalProtocol(index, "up")
                                  }
                                  disabled={index === 0}
                                >
                                  <MoveUp className="w-3 h-3" />
                                </Button>
                                <span className="text-xs sm:text-sm text-orange-300/70 text-center">
                                  #{index + 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    moveTacticalProtocol(index, "down")
                                  }
                                  disabled={
                                    index === tacticalProtocols.length - 1
                                  }
                                >
                                  <MoveDown className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs sm:text-sm text-orange-300/70 mb-2 block">
                                    <span className="text-orange-400 font-bold">
                                      IF
                                    </span>{" "}
                                    Trigger
                                    {!protocol.triggerId && (
                                      <span className="ml-2 text-yellow-400 text-xs">
                                        ⚠ Required
                                      </span>
                                    )}
                                    {isDefaultProtocol && (
                                      <span className="ml-2 text-cyan-400 text-xs">
                                        🔒 Built-in
                                      </span>
                                    )}
                                  </label>
                                  <Select
                                    value={protocol.triggerId}
                                    onValueChange={(value) =>
                                      updateTacticalProtocolTrigger(
                                        index,
                                        value,
                                      )
                                    }
                                    disabled={isDefaultProtocol}
                                  >
                                    <SelectTrigger
                                      className={`w-full bg-black/50 ${
                                        isDefaultProtocol
                                          ? "opacity-60 cursor-not-allowed border-cyan-500/50"
                                          : !protocol.triggerId
                                            ? "border-yellow-500/70"
                                            : "border-orange-500/50"
                                      }`}
                                    >
                                      <SelectValue placeholder="Select trigger..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                      {sortedTriggers.map((t) => (
                                        <SelectItem
                                          key={t.id}
                                          value={t.id}
                                          className="font-mono"
                                        >
                                          <div className="flex items-center justify-between gap-3 w-full">
                                            <span className="font-bold text-xs tracking-wide uppercase">
                                              {t.name}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs sm:text-sm text-orange-300/50 mt-1">
                                    {isDefaultProtocol
                                      ? "Built-in trigger cannot be changed"
                                      : trigger?.description ||
                                        "Choose when this protocol activates"}
                                  </p>
                                </div>

                                <div>
                                  <label className="text-xs sm:text-sm text-orange-300/70 mb-2 block">
                                    <span className="text-green-400 font-bold">
                                      THEN
                                    </span>{" "}
                                    Action (Tactical Only)
                                    {!protocol.actionId && (
                                      <span className="ml-2 text-yellow-400 text-xs">
                                        ⚠ Required
                                      </span>
                                    )}
                                  </label>
                                  <Select
                                    value={protocol.actionId}
                                    onValueChange={(value) =>
                                      updateTacticalProtocolAction(index, value)
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-full bg-black/50 ${!protocol.actionId ? "border-yellow-500/70" : "border-orange-500/50"}`}
                                    >
                                      <SelectValue placeholder="Select action..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[150]">
                                      {sortedTacticalActions.map((a) => {
                                        const elementColor = getElementColor(
                                          a.damageType,
                                        );
                                        return (
                                          <SelectItem
                                            key={a.id}
                                            value={a.id}
                                            className="font-mono"
                                          >
                                            <div className="flex items-center justify-between gap-3 w-full">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {elementColor && (
                                                  <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                                                    style={{
                                                      backgroundColor:
                                                        elementColor,
                                                    }}
                                                  />
                                                )}
                                                <span className="font-bold text-xs tracking-wide uppercase truncate">
                                                  {a.name}
                                                </span>
                                              </div>
                                              <span className="text-[10px] text-cyan-400 shrink-0 ml-2">
                                                {a.cooldown}ms
                                              </span>
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs sm:text-sm text-orange-300/50 mt-1">
                                    {action?.description ||
                                      "Choose tactical action"}
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTacticalProtocol(index)}
                                className="hover:bg-red-500/20 hover:border-red-500 border border-transparent"
                                disabled={isDefaultProtocol}
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "loadout" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3D Preview */}
                <div className="bg-black/40 backdrop-blur border-2 border-cyan-500/50 rounded-lg p-4 relative overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.3)] flex items-center justify-center h-[500px]">
                  <div className="absolute top-2 left-2 text-xs sm:text-sm text-cyan-400/70 font-mono">
                    &gt; PREVIEW_RENDER
                  </div>
                  <div className="w-full h-full">
                    <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} intensity={1} />
                      <pointLight
                        position={[-10, -10, -10]}
                        intensity={0.5}
                        color="#ff00ff"
                      />
                      <CustomizableFighter
                        position={{ x: 3, y: 1 }}
                        isPlayer={true}
                        hp={constructMaxHp}
                        maxHp={constructMaxHp}
                        shields={constructMaxShields}
                        maxShields={constructMaxShields}
                        armor={constructMaxArmor}
                        maxArmor={constructMaxArmor}
                        customization={customization}
                      />
                      <OrbitControls enableZoom={false} enablePan={false} />
                      <gridHelper
                        args={[10, 10, "#00ffff", "#ff00ff"]}
                        position={[0, 0, 0]}
                      />
                    </Canvas>
                  </div>

                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-400/50" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-green-400/50" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-magenta-400/50" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-yellow-400/50" />
                </div>

                {/* Component Selector */}
                <div className="bg-black/40 backdrop-blur border-2 border-magenta-500/50 rounded-lg p-4 flex flex-col overflow-hidden shadow-[0_0_20px_rgba(255,0,255,0.3)]">
                  <div className="text-xs sm:text-sm text-magenta-400/70 font-mono mb-3">
                    &gt; COMPONENT_SELECTOR
                  </div>

                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
                    {loadoutTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <Button
                          key={tab.id}
                          onClick={() => setLoadoutTab(tab.id)}
                          variant={
                            loadoutTab === tab.id ? "default" : "outline"
                          }
                          className={`text-xs sm:text-sm whitespace-nowrap px-3 h-9 flex items-center gap-2 transition-all ${
                            loadoutTab === tab.id
                              ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                              : "bg-black/50 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
                    {/* HEAD options */}
                    {loadoutTab === "head" &&
                      HEAD_SHAPES.map((shape) => (
                        <Button
                          key={shape.id}
                          onClick={() =>
                            setCustomization({ ...customization, head: shape })
                          }
                          variant={
                            customization.head.id === shape.id
                              ? "default"
                              : "outline"
                          }
                          className={`w-full justify-start text-sm sm:text-base transition-all ${
                            customization.head.id === shape.id
                              ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                              : "bg-black/30 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <Cpu className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          {shape.name}
                        </Button>
                      ))}

                    {/* CHASSIS options */}
                    {loadoutTab === "chassis" &&
                      CHASSIS_TYPES.map((chassis) => (
                        <Button
                          key={chassis.id}
                          onClick={() =>
                            setCustomization({ ...customization, chassis })
                          }
                          variant={
                            customization.chassis?.id === chassis.id
                              ? "default"
                              : "outline"
                          }
                          className={`w-full justify-start text-sm sm:text-base transition-all ${
                            customization.chassis?.id === chassis.id
                              ? "bg-green-500 text-black border-green-400 shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                              : "bg-black/30 border-green-500/30 hover:border-green-500/60 hover:bg-green-500/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          {chassis.name}
                        </Button>
                      ))}

                    {/* BODY options */}
                    {loadoutTab === "body" &&
                      BODY_SHAPES.map((shape) => (
                        <Button
                          key={shape.id}
                          onClick={() =>
                            setCustomization({ ...customization, body: shape })
                          }
                          variant={
                            customization.body.id === shape.id
                              ? "default"
                              : "outline"
                          }
                          className={`w-full justify-start text-sm sm:text-base transition-all ${
                            customization.body.id === shape.id
                              ? "bg-magenta-500 text-black border-magenta-400 shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                              : "bg-black/30 border-magenta-500/30 hover:border-magenta-500/60 hover:bg-magenta-500/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <Box className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          {shape.name}
                        </Button>
                      ))}

                    {/* ARMS options */}
                    {loadoutTab === "arms" &&
                      ARM_SHAPES.map((shape) => (
                        <Button
                          key={shape.id}
                          onClick={() =>
                            setCustomization({
                              ...customization,
                              leftArm: shape,
                              rightArm: shape,
                            })
                          }
                          variant={
                            customization.leftArm.id === shape.id
                              ? "default"
                              : "outline"
                          }
                          className={`w-full justify-start text-sm sm:text-base transition-all ${
                            customization.leftArm.id === shape.id
                              ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_10px_rgba(255,255,0,0.5)]"
                              : "bg-black/30 border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          {shape.name}
                        </Button>
                      ))}

                    {/* WEAPON options */}
                    {loadoutTab === "weapon" &&
                      WEAPON_SHAPES.map((shape) => (
                        <Button
                          key={shape.id}
                          onClick={() =>
                            setCustomization({
                              ...customization,
                              weapon: shape,
                            })
                          }
                          variant={
                            customization.weapon?.id === shape.id
                              ? "default"
                              : "outline"
                          }
                          className={`w-full justify-start text-sm sm:text-base transition-all ${
                            customization.weapon?.id === shape.id
                              ? "bg-red-500 text-black border-red-400 shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                              : "bg-black/30 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          {shape.name}
                        </Button>
                      ))}

                    {/* ACCESSORY options */}
                    {loadoutTab === "accessory" &&
                      ACCESSORY_SHAPES.map((shape) => (
                        <Button
                          key={shape.id}
                          onClick={() =>
                            setCustomization({
                              ...customization,
                              accessory: shape,
                            })
                          }
                          variant={
                            customization.accessory?.id === shape.id
                              ? "default"
                              : "outline"
                          }
                          className={`w-full justify-start text-sm sm:text-base transition-all ${
                            customization.accessory?.id === shape.id
                              ? "bg-purple-500 text-black border-purple-400 shadow-[0_0_10px_rgba(128,0,255,0.5)]"
                              : "bg-black/30 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          {shape.name}
                        </Button>
                      ))}

                    {/* COLOR options */}
                    {loadoutTab === "colors" &&
                      COLOR_PRESETS.map((preset) => (
                        <Button
                          key={preset.name}
                          onClick={() =>
                            setCustomization({
                              ...customization,
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                            })
                          }
                          variant={
                            customization.primaryColor === preset.primary
                              ? "default"
                              : "outline"
                          }
                          className={`w-full justify-start gap-3 text-sm sm:text-base transition-all ${
                            customization.primaryColor === preset.primary
                              ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                              : "bg-black/30 border-white/30 hover:border-white/60 hover:bg-white/10"
                          }`}
                          style={{ fontFamily: "monospace" }}
                        >
                          <div className="flex gap-1">
                            <div
                              className="w-5 h-5 rounded border border-white/30"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-5 h-5 rounded border border-white/30"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          {preset.name}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gradient-to-t from-black/95 to-transparent border-t border-cyan-500/30 p-3 sm:p-6 flex gap-2 sm:gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-red-500/50 hover:bg-red-500/20 bg-transparent text-sm"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold text-sm"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Apply modifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
