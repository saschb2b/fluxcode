import type { Trigger } from "@/types/game";
import { createOwnHpTrigger, createEnemyHpTrigger } from "./factories";

export const HEALTH_TRIGGERS: Trigger[] = [
  createOwnHpTrigger("full-hp", "Full HP", 100, "equals"),
  createOwnHpTrigger("high-hp", "High HP", 70, "above"),
  createOwnHpTrigger("low-hp", "Low HP", 30, "below"),
  createOwnHpTrigger("critical-hp", "Critical HP", 15, "below"),
  createEnemyHpTrigger("enemy-high-hp", "Enemy High HP", 70, "above"),
  createEnemyHpTrigger("enemy-low-hp", "Enemy Low HP", 30, "below"),
  createEnemyHpTrigger("enemy-critical-hp", "Enemy Critical HP", 15, "below"),
];
