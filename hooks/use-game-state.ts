"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type {
  GameState,
  Position,
  TriggerActionPair,
  Trigger,
  Action,
  CharacterPreset,
  FighterCustomization,
  BattleHistoryPoint,
} from "@/types/game"
import { BattleEngine } from "@/lib/battle-engine"
import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import { generateRandomCustomization } from "@/lib/fighter-parts"
import {
  loadProgress,
  saveProgress,
  calculateCurrencyReward,
  getTotalStatBonus,
  type PlayerProgress,
} from "@/lib/meta-progression"

export function useGameState(): GameState {
  const [battleState, setBattleState] = useState<"idle" | "fighting" | "victory" | "defeat">("idle")
  const [wave, setWave] = useState(1)

  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(loadProgress())

  const baseMaxHp = 100
  const hpBonus = getTotalStatBonus(playerProgress, "hp")
  const playerMaxHp = baseMaxHp + hpBonus

  const [player, setPlayer] = useState({
    position: { x: 1, y: 1 } as Position,
    hp: playerMaxHp,
    maxHp: playerMaxHp,
  })

  const [enemy, setEnemy] = useState({
    position: { x: 4, y: 1 } as Position,
    hp: 100,
    maxHp: 100,
  })

  const [projectiles, setProjectiles] = useState<any[]>([])
  const [triggerActionPairs, setTriggerActionPairs] = useState<TriggerActionPair[]>([])
  const [unlockedTriggers, setUnlockedTriggers] = useState<Trigger[]>([])
  const [unlockedActions, setUnlockedActions] = useState<Action[]>([])
  const [showRewardSelection, setShowRewardSelection] = useState(false)
  const [availableRewardTriggers, setAvailableRewardTriggers] = useState<Trigger[]>([])
  const [availableRewardActions, setAvailableRewardActions] = useState<Action[]>([])
  const [showEnemyIntro, setShowEnemyIntro] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterPreset | null>(null)
  const [fighterCustomization, setFighterCustomization] = useState<FighterCustomization | null>(null)
  const [enemyCustomization, setEnemyCustomization] = useState<FighterCustomization>(generateRandomCustomization())

  const battleEngineRef = useRef<BattleEngine | null>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  const [battleHistory, setBattleHistory] = useState<BattleHistoryPoint[]>([])

  useEffect(() => {
    if (battleState !== "fighting" || !battleEngineRef.current) {
      return
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time
      }

      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      const update = battleEngineRef.current!.tick(deltaTime)

      if (update.playerPos) setPlayer((p) => ({ ...p, position: update.playerPos! }))
      if (update.playerHP !== undefined) setPlayer((p) => ({ ...p, hp: update.playerHP! }))
      if (update.enemyPos) setEnemy((e) => ({ ...e, position: update.enemyPos! }))
      if (update.enemyHP !== undefined) setEnemy((e) => ({ ...e, hp: update.enemyHP! }))
      if (update.projectiles) setProjectiles(update.projectiles)

      if (update.battleOver) {
        if (update.battleHistory) {
          setBattleHistory(update.battleHistory)
        }

        if (!update.playerWon) {
          const wavesCompleted = wave - 1
          const currencyEarned = calculateCurrencyReward(wavesCompleted)
          const newProgress = {
            ...playerProgress,
            currency: playerProgress.currency + currencyEarned,
            totalWavesCompleted: playerProgress.totalWavesCompleted + wavesCompleted,
            totalRuns: playerProgress.totalRuns + 1,
            bestWave: Math.max(playerProgress.bestWave, wavesCompleted),
          }
          setPlayerProgress(newProgress)
          saveProgress(newProgress)
          console.log(`[v0] Run ended. Earned ${currencyEarned} currency. Total: ${newProgress.currency}`)
        }

        setBattleState(update.playerWon ? "victory" : "defeat")
        return
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [battleState, wave, playerProgress])

  const startBattle = useCallback(() => {
    console.log("[v0] Starting battle with player pairs:", triggerActionPairs)

    const enemyPairs: TriggerActionPair[] = [
      {
        trigger: AVAILABLE_TRIGGERS[11],
        action: AVAILABLE_ACTIONS[10],
        priority: 6,
      },
      {
        trigger: AVAILABLE_TRIGGERS[19],
        action: AVAILABLE_ACTIONS[0],
        priority: 5,
      },
      {
        trigger: AVAILABLE_TRIGGERS[20],
        action: wave >= 3 ? AVAILABLE_ACTIONS[13] : AVAILABLE_ACTIONS[8],
        priority: 4,
      },
      {
        trigger: AVAILABLE_TRIGGERS[1],
        action: AVAILABLE_ACTIONS[3],
        priority: 3,
      },
      {
        trigger: AVAILABLE_TRIGGERS[0],
        action: AVAILABLE_ACTIONS[6],
        priority: 2,
      },
      {
        trigger: AVAILABLE_TRIGGERS[23],
        action: AVAILABLE_ACTIONS[0],
        priority: 1,
      },
    ]

    if (wave >= 2) {
      enemyPairs.push({
        trigger: AVAILABLE_TRIGGERS[5],
        action: AVAILABLE_ACTIONS[14],
        priority: 7,
      })
    }

    if (wave >= 3) {
      enemyPairs.push({
        trigger: AVAILABLE_TRIGGERS[4],
        action: AVAILABLE_ACTIONS[1],
        priority: 8,
      })
    }

    if (wave >= 4) {
      enemyPairs.push({
        trigger: AVAILABLE_TRIGGERS[2],
        action: AVAILABLE_ACTIONS[11],
        priority: 9,
      })
    }

    if (wave >= 5) {
      enemyPairs.push({
        trigger: AVAILABLE_TRIGGERS[6],
        action: AVAILABLE_ACTIONS[2],
        priority: 10,
      })
    }

    console.log("[v0] Enemy pairs:", enemyPairs)

    battleEngineRef.current = new BattleEngine(
      {
        playerPos: player.position,
        playerHP: player.hp,
        enemyPos: enemy.position,
        enemyHP: enemy.hp,
        projectiles: [],
        justTookDamage: false,
      },
      triggerActionPairs,
      enemyPairs,
      fighterCustomization,
      enemyCustomization,
    )

    console.log("[v0] Battle engine created, starting animation loop")
    lastTimeRef.current = 0
    setBattleState("fighting")
  }, [player, enemy, triggerActionPairs, wave, fighterCustomization, enemyCustomization])

  const nextWave = useCallback(() => {
    const allTriggers = AVAILABLE_TRIGGERS.filter((t) => !unlockedTriggers.includes(t))
    const allActions = AVAILABLE_ACTIONS.filter((a) => !unlockedActions.includes(a))

    if (allTriggers.length > 0 || allActions.length > 0) {
      setAvailableRewardTriggers(allTriggers)
      setAvailableRewardActions(allActions)
      setShowRewardSelection(true)
    } else {
      prepareNextWave()
    }
  }, [unlockedTriggers, unlockedActions])

  const prepareNextWave = useCallback(() => {
    setWave((w) => w + 1)
    const nextWave = wave + 1
    const enemyMaxHp = nextWave === 1 ? 100 : 100 + (nextWave - 1) * 20
    setEnemy({ position: { x: 4, y: 1 }, hp: enemyMaxHp, maxHp: enemyMaxHp })
    setEnemyCustomization(generateRandomCustomization())
    setShowEnemyIntro(true)
  }, [wave])

  const continueAfterIntro = useCallback(() => {
    const hpBonus = getTotalStatBonus(playerProgress, "hp")
    const maxHp = baseMaxHp + hpBonus
    setPlayer({ position: { x: 1, y: 1 }, hp: maxHp, maxHp })
    setProjectiles([])
    setBattleHistory([])
    setBattleState("idle")
    setShowEnemyIntro(false)
  }, [playerProgress])

  const continueToNextWave = useCallback(() => {
    setWave((w) => w + 1)
    const hpBonus = getTotalStatBonus(playerProgress, "hp")
    const maxHp = baseMaxHp + hpBonus
    setPlayer((prev) => ({ ...prev, maxHp, hp: Math.min(prev.hp, maxHp) }))
    const enemyMaxHp = wave === 1 ? 100 : 100 + (wave - 1) * 20
    setEnemy({ position: { x: 4, y: 1 }, hp: enemyMaxHp, maxHp: enemyMaxHp })
    setProjectiles([])
    setBattleHistory([])
    setEnemyCustomization(generateRandomCustomization())
    setBattleState("idle")
    setShowRewardSelection(false)
  }, [wave, playerProgress])

  const resetGame = useCallback(() => {
    setWave(1)
    const hpBonus = getTotalStatBonus(playerProgress, "hp")
    const maxHp = baseMaxHp + hpBonus
    setPlayer({ position: { x: 1, y: 1 }, hp: maxHp, maxHp })
    setEnemy({ position: { x: 4, y: 1 }, hp: 100, maxHp: 100 })
    setProjectiles([])
    setTriggerActionPairs([])
    setUnlockedTriggers([])
    setUnlockedActions([])
    setSelectedCharacter(null)
    setFighterCustomization(null)
    setEnemyCustomization(generateRandomCustomization())
    setBattleHistory([])
    setBattleState("idle")
    setShowRewardSelection(false)
    setShowEnemyIntro(false)
  }, [playerProgress])

  const addTriggerActionPair = useCallback((trigger: Trigger, action: Action) => {
    setTriggerActionPairs((prev) => [
      ...prev,
      {
        trigger,
        action,
        priority: prev.length + 1,
      },
    ])
  }, [])

  const removeTriggerActionPair = useCallback((index: number) => {
    setTriggerActionPairs((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updatePairPriority = useCallback((index: number, priority: number) => {
    setTriggerActionPairs((prev) => prev.map((pair, i) => (i === index ? { ...pair, priority } : pair)))
  }, [])

  const selectRewardTrigger = useCallback(
    (trigger: Trigger) => {
      setUnlockedTriggers((prev) => [...prev, trigger])
      setShowRewardSelection(false)
      prepareNextWave()
    },
    [prepareNextWave],
  )

  const selectRewardAction = useCallback(
    (action: Action) => {
      setUnlockedActions((prev) => [...prev, action])
      setShowRewardSelection(false)
      prepareNextWave()
    },
    [prepareNextWave],
  )

  const setCharacter = useCallback(
    (character: CharacterPreset) => {
      setSelectedCharacter(character)
      setTriggerActionPairs(character.startingPairs)
      setUnlockedTriggers(character.startingTriggers)
      setUnlockedActions(character.startingActions)

      const newProgress = {
        ...playerProgress,
        selectedCharacterId: character.id,
      }
      setPlayerProgress(newProgress)
      saveProgress(newProgress)
    },
    [playerProgress],
  )

  const setCustomization = useCallback((customization: FighterCustomization) => {
    setFighterCustomization(customization)
  }, [])

  const updatePlayerProgress = useCallback((progress: PlayerProgress) => {
    setPlayerProgress(progress)
    saveProgress(progress)

    // Update player HP if HP bonus changed
    const hpBonus = getTotalStatBonus(progress, "hp")
    const maxHp = baseMaxHp + hpBonus
    setPlayer((prev) => ({ ...prev, maxHp, hp: Math.min(prev.hp, maxHp) }))
  }, [])

  return {
    battleState,
    wave,
    player,
    enemy,
    projectiles,
    triggerActionPairs,
    unlockedTriggers,
    unlockedActions,
    startBattle,
    nextWave,
    resetGame,
    addTriggerActionPair,
    removeTriggerActionPair,
    updatePairPriority,
    showRewardSelection,
    availableRewardTriggers,
    availableRewardActions,
    selectRewardTrigger,
    selectRewardAction,
    setCharacter,
    selectedCharacter,
    fighterCustomization,
    setCustomization,
    enemyCustomization,
    battleHistory,
    showEnemyIntro,
    continueAfterIntro,
    playerProgress,
    updatePlayerProgress,
  }
}
