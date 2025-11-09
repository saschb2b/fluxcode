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
  PlayerProgress,
  DamageType,
} from "@/types/game"
import { BattleEngine } from "@/lib/battle-engine"
import { AVAILABLE_TRIGGERS } from "@/lib/triggers"
import { AVAILABLE_ACTIONS } from "@/lib/actions"
import { generateRandomCustomization } from "@/lib/fighter-parts"
import { loadProgress, saveProgress, getTotalStatBonus, calculateCurrencyReward } from "@/lib/meta-progression"
import { initializeRun, type NetworkLayer } from "@/lib/network-layers"
import type { PlayerMasteryProgress } from "@/lib/protocol-mastery"
import { checkMasteryCompletion, calculateMasteryRewards, PROTOCOL_MASTERIES } from "@/lib/protocol-mastery"
import {
  initializeContracts,
  refreshContracts,
  shouldRefreshContracts,
  checkContractProgress,
} from "@/lib/network-contracts"

export function useGameState(): GameState {
  const [battleState, setBattleState] = useState<"idle" | "fighting" | "victory" | "defeat">("idle")
  const [wave, setWave] = useState(1)

  const [networkLayers, setNetworkLayers] = useState<NetworkLayer[]>(initializeRun())
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0)
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0)

  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(loadProgress())

  useEffect(() => {
    if (!playerProgress.contractProgress) {
      const newProgress = {
        ...playerProgress,
        contractProgress: initializeContracts(),
      }
      setPlayerProgress(newProgress)
      saveProgress(newProgress)
    } else {
      const refresh = shouldRefreshContracts(playerProgress.contractProgress)
      if (refresh.daily || refresh.weekly) {
        const refreshedContracts = refreshContracts(playerProgress.contractProgress)
        const newProgress = {
          ...playerProgress,
          contractProgress: refreshedContracts,
        }
        setPlayerProgress(newProgress)
        saveProgress(newProgress)
      }
    }
  }, []) // Run once on mount

  const baseMaxHp = 100
  const hpBonus = getTotalStatBonus(playerProgress, "hp")
  const playerMaxHp = baseMaxHp + hpBonus

  const [player, setPlayer] = useState({
    position: { x: 1, y: 1 } as Position,
    hp: playerMaxHp,
    maxHp: playerMaxHp,
  })

  const isGuardianBattle =
    networkLayers.length > 0 &&
    networkLayers[currentLayerIndex] &&
    networkLayers[currentLayerIndex].nodes[currentNodeIndex]?.type === "guardian"

  const [enemy, setEnemy] = useState({
    position: { x: 4, y: 1 } as Position,
    hp: 40,
    maxHp: 40,
    shields: 0,
    maxShields: 0,
    armor: 0,
    maxArmor: 0,
    resistances: {} as Partial<Record<DamageType, number>>,
    statusEffects: [] as string[],
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

  const [rerollsRemaining, setRerollsRemaining] = useState(3)

  const [performanceHistory, setPerformanceHistory] = useState<{
    recentVictories: number[]
    avgTimeToWin: number
    avgHealthRemaining: number
  }>({
    recentVictories: [],
    avgTimeToWin: 30,
    avgHealthRemaining: 60,
  })

  const [justEarnedReward, setJustEarnedReward] = useState<{
    type: "trigger" | "action"
    name: string
  } | null>(null)

  const [masteryProgress, setMasteryProgress] = useState<PlayerMasteryProgress>({
    completedMasteries: playerProgress.completedMasteries || [],
    inProgressMasteries: {},
    currentRunStats: {
      triggerUsage: {},
      actionUsage: {},
      damageByType: {},
      pairExecutions: [],
    },
  })

  const battleStartTimeRef = useRef<number>(0)

  const trackPairExecution = useCallback((triggerId: string, actionId: string) => {
    setMasteryProgress((prev) => ({
      ...prev,
      currentRunStats: {
        ...prev.currentRunStats,
        triggerUsage: {
          ...prev.currentRunStats.triggerUsage,
          [triggerId]: (prev.currentRunStats.triggerUsage[triggerId] || 0) + 1,
        },
        actionUsage: {
          ...prev.currentRunStats.actionUsage,
          [actionId]: (prev.currentRunStats.actionUsage[actionId] || 0) + 1,
        },
        pairExecutions: [...prev.currentRunStats.pairExecutions, { triggerId, actionId, timestamp: Date.now() }],
      },
    }))
  }, [])

  const trackDamage = useCallback((damageType: string, amount: number) => {
    setMasteryProgress((prev) => ({
      ...prev,
      currentRunStats: {
        ...prev.currentRunStats,
        damageByType: {
          ...prev.currentRunStats.damageByType,
          [damageType]: (prev.currentRunStats.damageByType[damageType] || 0) + amount,
        },
      },
    }))
  }, [])

  useEffect(() => {
    if (battleState !== "fighting" || !battleEngineRef.current) {
      return
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time
        battleStartTimeRef.current = time
      }

      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      const update = battleEngineRef.current!.tick(deltaTime)

      if (update.playerPos) setPlayer((p) => ({ ...p, position: update.playerPos! }))
      if (update.playerHP !== undefined) setPlayer((p) => ({ ...p, hp: update.playerHP! }))
      if (update.enemyPos) setEnemy((e) => ({ ...e, position: update.enemyPos! }))
      if (update.enemyHP !== undefined) setEnemy((e) => ({ ...e, hp: update.enemyHP! }))
      if (update.projectiles) setProjectiles(update.projectiles)

      if (update.pairExecuted) {
        trackPairExecution(update.pairExecuted.triggerId, update.pairExecuted.actionId)
      }
      if (update.damageDealt) {
        trackDamage(update.damageDealt.type, update.damageDealt.amount)
      }

      if (update.battleOver) {
        if (update.battleHistory) {
          setBattleHistory(update.battleHistory)

          if (update.playerWon) {
            const battleDuration = (time - battleStartTimeRef.current) / 1000
            const healthRemaining = update.battleHistory[update.battleHistory.length - 1]?.playerHP || 0
            const playerHpPercent = (healthRemaining / player.maxHp) * 100

            const newlyCompleted: string[] = []
            for (const mastery of PROTOCOL_MASTERIES) {
              if (masteryProgress.completedMasteries.includes(mastery.id)) continue

              const completed = checkMasteryCompletion(mastery, masteryProgress.currentRunStats, {
                playerHpPercent,
                battleDuration,
                isGuardianBattle,
                activePairCount: triggerActionPairs.length,
              })

              if (completed) {
                newlyCompleted.push(mastery.id)
                console.log("[v0] Mastery completed:", mastery.name)
              }
            }

            if (newlyCompleted.length > 0) {
              setMasteryProgress((prev) => ({
                ...prev,
                completedMasteries: [...prev.completedMasteries, ...newlyCompleted],
              }))

              // Update player progress with new masteries
              const updatedProgress = {
                ...playerProgress,
                completedMasteries: [...(playerProgress.completedMasteries || []), ...newlyCompleted],
              }
              setPlayerProgress(updatedProgress)
              saveProgress(updatedProgress)
            }

            if (playerProgress.contractProgress) {
              const totalDamageDealt = Object.values(masteryProgress.currentRunStats.damageByType).reduce(
                (sum, val) => sum + val,
                0,
              )

              const runStats = {
                damageByType: masteryProgress.currentRunStats.damageByType,
                triggersUsed: Object.keys(masteryProgress.currentRunStats.triggerUsage),
                actionsUsed: Object.keys(masteryProgress.currentRunStats.actionUsage),
                pairsCount: triggerActionPairs.length,
                guardianDefeated: isGuardianBattle,
                damageTaken: player.maxHp - healthRemaining,
                pairExecutions: masteryProgress.currentRunStats.pairExecutions,
              }

              console.log("[v0] Checking contracts with run stats:", runStats)
              console.log("[v0] Total damage dealt this run:", totalDamageDealt)

              const updatedDailyContracts = playerProgress.contractProgress.dailyContracts.map((contract) => {
                if (contract.completed) return contract
                const { progress, completed } = checkContractProgress(contract, runStats)
                return { ...contract, progress, completed }
              })

              const updatedWeeklyContracts = playerProgress.contractProgress.weeklyContracts.map((contract) => {
                if (contract.completed) return contract
                const { progress, completed } = checkContractProgress(contract, runStats)
                return { ...contract, progress, completed }
              })

              const updatedContractProgress = {
                ...playerProgress.contractProgress,
                dailyContracts: updatedDailyContracts,
                weeklyContracts: updatedWeeklyContracts,
              }

              setPlayerProgress((prev) => ({
                ...prev,
                contractProgress: updatedContractProgress,
              }))

              saveProgress({
                ...playerProgress,
                contractProgress: updatedContractProgress,
              })
            }

            setPerformanceHistory((prev) => {
              const recentWins = [...prev.recentVictories, 1].slice(-5)
              const avgTime = prev.avgTimeToWin * 0.7 + battleDuration * 0.3
              const avgHealth = prev.avgHealthRemaining * 0.7 + healthRemaining * 0.3

              return {
                recentVictories: recentWins,
                avgTimeToWin: avgTime,
                avgHealthRemaining: avgHealth,
              }
            })
          } else {
            const currentTotalNodes = currentLayerIndex * 7 + currentNodeIndex
            let currencyEarned = calculateCurrencyReward(currentTotalNodes)

            const masteryRewards = calculateMasteryRewards(masteryProgress.completedMasteries, currencyEarned)
            currencyEarned = masteryRewards.totalFragments

            console.log("[v0] Player defeated at layer", currentLayerIndex, "node", currentNodeIndex)
            console.log("[v0] Total nodes completed:", currentTotalNodes)
            console.log("[v0] Base currency earned:", calculateCurrencyReward(currentTotalNodes))
            console.log("[v0] Mastery bonus:", masteryRewards.bonusFragments)
            console.log("[v0] Final currency earned:", currencyEarned)

            const newProgress: PlayerProgress = {
              ...playerProgress,
              cipherFragments: playerProgress.cipherFragments + currencyEarned,
              totalNodesCompleted: playerProgress.totalNodesCompleted + currentTotalNodes,
              totalRuns: playerProgress.totalRuns + 1,
              bestLayerReached: Math.max(playerProgress.bestLayerReached, currentLayerIndex),
              bestNodeInBestLayer:
                currentLayerIndex > playerProgress.bestLayerReached
                  ? currentNodeIndex
                  : Math.max(playerProgress.bestNodeInBestLayer, currentNodeIndex),
              completedMasteries: masteryProgress.completedMasteries,
            }

            console.log("[v0] New cipher fragments total:", newProgress.cipherFragments)
            setPlayerProgress(newProgress)
            saveProgress(newProgress)

            // Reset mastery run stats
            setMasteryProgress((prev) => ({
              ...prev,
              currentRunStats: {
                triggerUsage: {},
                actionUsage: {},
                damageByType: {},
                pairExecutions: [],
              },
            }))

            setPerformanceHistory((prev) => ({
              ...prev,
              recentVictories: [...prev.recentVictories, 0].slice(-5),
            }))
          }
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
  }, [
    battleState,
    wave,
    playerProgress,
    networkLayers,
    currentLayerIndex,
    currentNodeIndex,
    masteryProgress,
    isGuardianBattle,
    triggerActionPairs,
    player.maxHp,
    trackPairExecution,
    trackDamage,
  ])

  const startBattle = useCallback(() => {
    console.log("[v0] Starting battle with player pairs:", triggerActionPairs)
    setJustEarnedReward(null)

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

  const getRandomRewards = useCallback((allTriggers: Trigger[], allActions: Action[]) => {
    const allRewards: Array<{ type: "trigger" | "action"; item: Trigger | Action }> = [
      ...allTriggers.map((t) => ({ type: "trigger" as const, item: t })),
      ...allActions.map((a) => ({ type: "action" as const, item: a })),
    ]

    const shuffled = allRewards.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(3, shuffled.length))

    const triggers = selected.filter((r) => r.type === "trigger").map((r) => r.item as Trigger)
    const actions = selected.filter((r) => r.type === "action").map((r) => r.item as Action)

    return { triggers, actions }
  }, [])

  const calculateDifficultyMultiplier = useCallback(
    (waveNumber: number) => {
      const { recentVictories, avgTimeToWin, avgHealthRemaining } = performanceHistory

      const winRate =
        recentVictories.length > 0 ? recentVictories.reduce((a, b) => a + b, 0) / recentVictories.length : 0.5

      let multiplier = 1.0

      // Gradually introduce DDA rather than full impact
      if (waveNumber === 4) {
        multiplier = 1.0 // No DDA on wave 4 (difficulty saw pattern)
      } else if (waveNumber === 5) {
        // Only 50% of normal DDA adjustment
        if (winRate > 0.8) {
          multiplier += 0.15 // Half of normal +0.3
        } else if (winRate > 0.6) {
          multiplier += 0.075 // Half of normal +0.15
        } else if (winRate < 0.3) {
          multiplier -= 0.1 // Half of normal -0.2
        } else if (winRate < 0.5) {
          multiplier -= 0.05 // Half of normal -0.1
        }
      } else {
        // Full DDA from wave 6 onwards
        if (winRate > 0.8) {
          multiplier += 0.3
        } else if (winRate > 0.6) {
          multiplier += 0.15
        } else if (winRate < 0.3) {
          multiplier -= 0.2
        } else if (winRate < 0.5) {
          multiplier -= 0.1
        }

        if (avgTimeToWin < 20 && winRate > 0.5) {
          multiplier += 0.15
        } else if (avgTimeToWin > 60) {
          multiplier -= 0.1
        }

        if (avgHealthRemaining > 70 && winRate > 0.5) {
          multiplier += 0.1
        } else if (avgHealthRemaining < 30) {
          multiplier -= 0.05
        }
      }

      return Math.max(0.6, Math.min(1.5, multiplier))
    },
    [performanceHistory],
  )

  const prepareNextWave = useCallback(() => {
    if (networkLayers.length > 0) {
      const updatedLayers = [...networkLayers]
      const currentLayer = updatedLayers[currentLayerIndex]

      if (currentLayer.nodes[currentNodeIndex]) {
        currentLayer.nodes[currentNodeIndex].completed = true
        currentLayer.nodes[currentNodeIndex].current = false
      }

      if (currentNodeIndex + 1 < currentLayer.nodes.length) {
        const nextNodeIndex = currentNodeIndex + 1
        currentLayer.nodes[nextNodeIndex].current = true
        setCurrentNodeIndex(nextNodeIndex)
      } else {
        currentLayer.completed = true
        if (currentLayerIndex + 1 < updatedLayers.length) {
          setCurrentLayerIndex(currentLayerIndex + 1)
          setCurrentNodeIndex(0)
          updatedLayers[currentLayerIndex + 1].nodes[0].current = true
        }
      }

      setNetworkLayers(updatedLayers)
    }

    const nextWave = wave + 1
    setWave(nextWave)

    let baseHp: number

    if (nextWave <= 3) {
      baseHp = 30 + nextWave * 10 // 40, 50, 60
    } else if (nextWave <= 6) {
      baseHp = 40 + nextWave * 10 // Wave 4: 80, Wave 5: 90, Wave 6: 100
    } else if (nextWave <= 15) {
      baseHp = 40 + nextWave * 10
    } else {
      baseHp = 100 + Math.pow(nextWave - 15, 1.3) * 20
    }

    const difficultyMultiplier = nextWave > 3 ? calculateDifficultyMultiplier(nextWave) : 1.0
    baseHp = Math.floor(baseHp * difficultyMultiplier)

    console.log("[v0] Preparing wave", nextWave)
    console.log(
      "[v0] Base HP calculation - raw:",
      40 + nextWave * 10,
      "multiplier:",
      difficultyMultiplier.toFixed(2),
      "final:",
      baseHp,
    )

    const nextNodeIsGuardian =
      networkLayers.length > 0 &&
      networkLayers[currentLayerIndex] &&
      (currentNodeIndex + 1 < networkLayers[currentLayerIndex].nodes.length
        ? networkLayers[currentLayerIndex].nodes[currentNodeIndex + 1]?.type === "guardian"
        : false)
    const enemyMaxHp = nextNodeIsGuardian ? Math.floor(baseHp * 1.5) : baseHp

    let shields = 0
    let armor = 0
    let resistances: Partial<Record<DamageType, number>> = {}

    const currentLayerData = networkLayers[currentLayerIndex]
    if (currentLayerData) {
      switch (currentLayerData.id) {
        case "data-stream":
          shields = 0
          armor = 0
          resistances = {}
          break
        case "firewall":
          armor = Math.floor(enemyMaxHp * 0.25)
          resistances = {
            kinetic: 0.3,
            corrosive: -0.2,
          }
          break
        case "archive":
          shields = Math.floor(enemyMaxHp * 0.3)
          armor = 0
          resistances = {
            energy: 0.25,
            viral: -0.15,
          }
          break
        case "core-approach":
          shields = Math.floor(enemyMaxHp * 0.25)
          armor = Math.floor(enemyMaxHp * 0.2)
          resistances = {
            energy: 0.2,
            kinetic: 0.2,
            thermal: -0.1,
          }
          break
      }

      if (nextNodeIsGuardian) {
        shields = Math.floor(shields * 1.3)
        armor = Math.floor(armor * 1.3)
      }
    }

    setEnemy({
      position: { x: 4, y: 1 },
      hp: enemyMaxHp,
      maxHp: enemyMaxHp,
      shields,
      maxShields: shields,
      armor,
      maxArmor: armor,
      resistances,
      statusEffects: [],
    })
    setEnemyCustomization(generateRandomCustomization())
    setShowEnemyIntro(true)
  }, [wave, networkLayers, currentLayerIndex, currentNodeIndex, calculateDifficultyMultiplier])

  const continueToNextWave = useCallback(() => {
    setShowEnemyIntro(false)

    const nextWave = wave + 1
    setWave(nextWave)

    let baseHp: number

    if (nextWave <= 3) {
      baseHp = 30 + nextWave * 10 // 40, 50, 60
    } else if (nextWave <= 6) {
      baseHp = 40 + nextWave * 10 // Wave 4: 80, Wave 5: 90, Wave 6: 100
    } else if (nextWave <= 15) {
      baseHp = 40 + nextWave * 10
    } else {
      baseHp = 100 + Math.pow(nextWave - 15, 1.3) * 20
    }

    const difficultyMultiplier = nextWave > 3 ? calculateDifficultyMultiplier(nextWave) : 1.0
    baseHp = Math.floor(baseHp * difficultyMultiplier)

    console.log("[v0] Preparing wave", nextWave)
    console.log("[v0] Wave", nextWave, "baseHp:", baseHp, "multiplier:", difficultyMultiplier.toFixed(2))

    const currentNodeIsGuardian =
      networkLayers.length > 0 &&
      networkLayers[currentLayerIndex] &&
      networkLayers[currentLayerIndex].nodes[currentNodeIndex]?.type === "guardian"
    const enemyMaxHp = currentNodeIsGuardian ? Math.floor(baseHp * 1.5) : baseHp

    let shields = 0
    let armor = 0
    let resistances: Partial<Record<DamageType, number>> = {}

    const currentLayerData = networkLayers[currentLayerIndex]
    if (currentLayerData) {
      switch (currentLayerData.id) {
        case "data-stream":
          shields = 0
          armor = 0
          resistances = {}
          break
        case "firewall":
          armor = Math.floor(enemyMaxHp * 0.25)
          resistances = {
            kinetic: 0.3,
            corrosive: -0.2,
          }
          break
        case "archive":
          shields = Math.floor(enemyMaxHp * 0.3)
          armor = 0
          resistances = {
            energy: 0.25,
            viral: -0.15,
          }
          break
        case "core-approach":
          shields = Math.floor(enemyMaxHp * 0.25)
          armor = Math.floor(enemyMaxHp * 0.2)
          resistances = {
            energy: 0.2,
            kinetic: 0.2,
            thermal: -0.1,
          }
          break
      }

      if (currentNodeIsGuardian) {
        shields = Math.floor(shields * 1.3)
        armor = Math.floor(armor * 1.3)
      }
    }

    setPlayer((prev) => ({
      ...prev,
      position: { x: 1, y: 1 },
      hp: prev.maxHp,
    }))

    setEnemy({
      position: { x: 4, y: 1 },
      hp: enemyMaxHp,
      maxHp: enemyMaxHp,
      shields,
      maxShields: shields,
      armor,
      maxArmor: armor,
      resistances,
      statusEffects: [],
    })
    console.log("[v0] Enemy HP set to:", enemyMaxHp, "shields:", shields, "armor:", armor)
    setProjectiles([])
    setBattleHistory([])
    setEnemyCustomization(generateRandomCustomization())
    setBattleState("idle")
    setShowRewardSelection(false)
  }, [wave, playerProgress, networkLayers, currentLayerIndex, currentNodeIndex, calculateDifficultyMultiplier])

  const resetGame = useCallback(() => {
    setWave(1)
    setNetworkLayers(initializeRun())
    setCurrentLayerIndex(0)
    setCurrentNodeIndex(0)
    const hpBonus = getTotalStatBonus(playerProgress, "hp")
    const maxHp = baseMaxHp + hpBonus
    setPlayer({ position: { x: 1, y: 1 }, hp: maxHp, maxHp })
    setEnemy({
      position: { x: 4, y: 1 },
      hp: 40,
      maxHp: 40,
      shields: 0,
      maxShields: 0,
      armor: 0,
      maxArmor: 0,
      resistances: {},
      statusEffects: [],
    })
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
    setRerollsRemaining(3)
    setJustEarnedReward(null) // Clear the just earned reward notification
    // Reset mastery progress on game reset
    setMasteryProgress({
      completedMasteries: [],
      inProgressMasteries: {},
      currentRunStats: {
        triggerUsage: {},
        actionUsage: {},
        damageByType: {},
        pairExecutions: [],
      },
    })
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
      setJustEarnedReward({ type: "trigger", name: trigger.name })
      setShowRewardSelection(false)
      prepareNextWave()
    },
    [prepareNextWave],
  )

  const selectRewardAction = useCallback(
    (action: Action) => {
      setUnlockedActions((prev) => [...prev, action])
      setJustEarnedReward({ type: "action", name: action.name })
      setShowRewardSelection(false)
      prepareNextWave()
    },
    [prepareNextWave],
  )

  const nextWave = useCallback(() => {
    setBattleState("idle")
    setShowRewardSelection(true)

    const availableTriggers = AVAILABLE_TRIGGERS.filter((t) => !unlockedTriggers.some((ut) => ut.id === t.id))
    const availableActions = AVAILABLE_ACTIONS.filter((a) => !unlockedActions.some((ua) => ua.id === a.id))

    const { triggers, actions } = getRandomRewards(availableTriggers, availableActions)
    setAvailableRewardTriggers(triggers)
    setAvailableRewardActions(actions)
    setRerollsRemaining(3)
  }, [unlockedTriggers, unlockedActions, getRandomRewards])

  const continueAfterIntro = useCallback(() => {
    console.log("[v0] Continuing after intro, resetting player")
    setPlayer((prev) => ({
      ...prev,
      position: { x: 1, y: 1 },
      hp: prev.maxHp,
    }))

    setProjectiles([])
    setShowEnemyIntro(false)
    // It will be cleared when battle starts or when dismissed
    setBattleState("idle")
  }, [])

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

    const hpBonus = getTotalStatBonus(progress, "hp")
    const maxHp = baseMaxHp + hpBonus
    setPlayer((prev) => ({ ...prev, maxHp, hp: Math.min(prev.hp, maxHp) }))
  }, [])

  const extractFromBreach = useCallback(() => {
    const currentTotalNodes = currentLayerIndex * 7 + currentNodeIndex
    let currencyEarned = calculateCurrencyReward(currentTotalNodes)

    const masteryRewards = calculateMasteryRewards(masteryProgress.completedMasteries, currencyEarned)
    currencyEarned = masteryRewards.totalFragments

    console.log("[v0] Player extracted at layer", currentLayerIndex, "node", currentNodeIndex)
    console.log("[v0] Total nodes completed:", currentTotalNodes)
    console.log("[v0] Base currency earned:", calculateCurrencyReward(currentTotalNodes))
    console.log("[v0] Mastery bonus:", masteryRewards.bonusFragments)
    console.log("[v0] Final currency earned:", currencyEarned)

    const newProgress: PlayerProgress = {
      ...playerProgress,
      cipherFragments: playerProgress.cipherFragments + currencyEarned,
      totalNodesCompleted: playerProgress.totalNodesCompleted + currentTotalNodes,
      totalRuns: playerProgress.totalRuns + 1,
      bestLayerReached: Math.max(playerProgress.bestLayerReached, currentLayerIndex),
      bestNodeInBestLayer:
        currentLayerIndex > playerProgress.bestLayerReached
          ? currentNodeIndex
          : Math.max(playerProgress.bestNodeInBestLayer, currentNodeIndex),
      completedMasteries: masteryProgress.completedMasteries,
    }

    console.log("[v0] New cipher fragments total after extraction:", newProgress.cipherFragments)
    setPlayerProgress(newProgress)
    saveProgress(newProgress)

    // Reset mastery run stats
    setMasteryProgress((prev) => ({
      ...prev,
      currentRunStats: {
        triggerUsage: {},
        actionUsage: {},
        damageByType: {},
        pairExecutions: [],
      },
    }))

    setBattleState("defeat")
  }, [playerProgress, currentLayerIndex, currentNodeIndex, masteryProgress])

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
    prepareNextWave,
    resetGame,
    addTriggerActionPair,
    removeTriggerActionPair,
    updatePairPriority,
    showRewardSelection,
    availableRewardTriggers,
    availableRewardActions,
    selectRewardTrigger,
    selectRewardAction,
    rerollsRemaining,
    continueToNextWave,
    nextWave,
    continueAfterIntro,
    setCharacter,
    selectedCharacter,
    fighterCustomization,
    setCustomization,
    enemyCustomization,
    battleHistory,
    showEnemyIntro,
    playerProgress,
    updatePlayerProgress,
    networkLayers,
    currentLayerIndex,
    currentNodeIndex,
    isGuardianBattle,
    extractFromBreach,
    justEarnedReward,
    masteryProgress, // Added to return
    trackPairExecution, // Added to return
    trackDamage, // Added to return
  }
}
