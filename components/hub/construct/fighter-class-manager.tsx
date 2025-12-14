"use client";

import { useState, useMemo } from "react";
import { CONSTRUCTS } from "@/lib/constructs";
import type { CustomFighterClass } from "@/lib/meta-progression";
import { FighterClassEditor } from "./fighter-class-editor";

interface FighterClassManagerProps {
  customClasses: CustomFighterClass[];
  onSaveClasses: (classes: CustomFighterClass[]) => void;
  onClose: () => void;
}

export function FighterClassManager({
  customClasses,
  onSaveClasses,
  onClose,
}: FighterClassManagerProps) {
  const [editingClass] = useState<CustomFighterClass | null>(() => {
    if (customClasses.length > 0) {
      return customClasses[0];
    }
    return null;
  });

  const activeClasses = useMemo(() => {
    if (customClasses.length > 0) {
      return customClasses;
    }
    return CONSTRUCTS.map((construct) => ({
      id: construct.id,
      name: construct.name,
      color: construct.color,
      startingPairs: [],
      startingMovementPairs: [],
      startingTacticalPairs: [],
      customization: undefined,
    }));
  }, [customClasses]);

  const handleSaveEdit = (updatedClass: CustomFighterClass) => {
    const updatedClasses = activeClasses.map((c) =>
      c.id === updatedClass.id ? updatedClass : c,
    );
    onSaveClasses(updatedClasses);
    onClose();
  };

  if (!editingClass) {
    return null;
  }

  return (
    <FighterClassEditor
      classData={editingClass}
      onSave={handleSaveEdit}
      onCancel={onClose}
    />
  );
}
