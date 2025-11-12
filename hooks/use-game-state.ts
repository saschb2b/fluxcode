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
import {
  initializeContracts,
  refreshContracts,
  shouldRefreshContracts,
  checkContractProgress,
} from "@/lib/network-contracts"
import { generateEnemyName, generateGuardianPawnName } from "@/lib/enemy-names"

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

  const shieldBonus = getTotalStatBonus(playerProgress, "shield_capacity")
  const armorBonus = getTotalStatBonus(playerProgress, "armor_rating")

  const [player, setPlayer] = useState({
    position: { x: 1, y: 1 } as Position,
    hp: playerMaxHp,
    maxHp: playerMaxHp,
    shields: shieldBonus,
    maxShields: shieldBonus,
    armor: armorBonus,
    maxArmor: armorBonus,
  })

  const isGuardianBattle =
    networkLayers.length > 0 &&
    networkLayers[currentLayerIndex] &&
    networkLayers[currentLayerIndex].nodes[currentNodeIndex]?.type === "guardian"

  const [enemies, setEnemies] = useState<any[]>([])
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
  const [enemyCustomizations, setEnemyCustomizations] = useState<FighterCustomization[]>([
    generateRandomCustomization(),
  ])
  const [enemy, setEnemy] = useState<any>(null)

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

  const battleStartTimeRef = useRef<number>(0)

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
      // Update player shields and armor from battle engine
      if (update.playerShields !== undefined) setPlayer((p) => ({ ...p, shields: update.playerShields! }))
      if (update.playerArmor !== undefined) setPlayer((p) => ({ ...p, armor: update.playerArmor! }))

      if (update.enemyHP !== undefined || update.enemyShields !== undefined || update.enemyArmor !== undefined) {
        const engineState = battleEngineRef.current!.getState()
        setEnemies((prevEnemies) =>
          prevEnemies.map((prevEnemy, index) => {
            const engineEnemy = engineState.enemies[index]
            if (!engineEnemy) return prevEnemy

            return {
              ...prevEnemy,
              hp: engineEnemy.hp,
              shields: engineEnemy.shields,
              armor: engineEnemy.armor,
              position: engineEnemy.position,
            }
          }),
        )
      }

      if (update.projectiles) setProjectiles(update.projectiles)

      if (update.battleOver) {
        if (update.battleHistory) {
          setBattleHistory(update.battleHistory)

          if (update.playerWon) {
            const healthRemaining = update.battleHistory[update.battleHistory.length - 1]?.playerHP || 0
            const shieldsRemaining = update.battleHistory[update.battleHistory.length - 1]?.playerShields || 0
            const armorRemaining = update.battleHistory[update.battleHistory.length - 1]?.playerArmor || 0

            if (playerProgress.contractProgress) {
              const totalDamageDealt = Object.values(update.damageByType || {}).reduce((sum, val) => sum + val, 0)

              const runStats = {
                damageByType: update.damageByType || {},
                triggersUsed: update.triggersUsed || [],
                actionsUsed: update.actionsUsed || [],
                pairsCount: triggerActionPairs.length,
                guardianDefeated: isGuardianBattle,
                damageTaken: player.maxHp - healthRemaining,
                pairExecutions: update.pairExecutions || [],
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
              const battleDuration = (time - battleStartTimeRef.current) / 1000
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
            const currencyEarned = calculateCurrencyReward(currentTotalNodes)

            console.log("[v0] Player defeated at layer", currentLayerIndex, "node", currentNodeIndex)
            console.log("[v0] Total nodes completed:", currentTotalNodes)
            console.log("[v0] Currency earned:", currencyEarned)

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
            }

            console.log("[v0] New cipher fragments total:", newProgress.cipherFragments)
            setPlayerProgress(newProgress)
            saveProgress(newProgress)

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
    isGuardianBattle,
    triggerActionPairs,
    player.maxHp,
    player.maxShields, // Added player.maxShields to dependency array
    player.maxArmor, // Added player.maxArmor to dependency array
  ])

  const startBattle = useCallback(() => {
    const enabledPairs = triggerActionPairs.filter((pair) => pair.enabled !== false)

    console.log("[v0] Starting battle with player pairs:", enabledPairs)
    console.log("[v0] triggerActionPairs count:", enabledPairs.length)
    console.log(
      "[v0] triggerActionPairs details:",
      enabledPairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
    )
    console.log("[v0] startBattle - enemies array length:", enemies.length)
    console.log(
      "[v0] startBattle - enemies details:",
      enemies.map(
        (e, i) =>
          `Enemy ${i}: HP=${e.hp}/${e.maxHp} at (${e.position?.x},${e.position?.y}) isPawn=${e.isPawn} name=${e.name}`,
      ),
    )
    console.log("[v0] startBattle - player shields:", player.shields, "armor:", player.armor)
    setJustEarnedReward(null)

    const baseEnemyProtocols = []

    // High priority: Survival/positioning tactics
    if (wave >= 2) {
      baseEnemyProtocols.push({ triggerId: "critical-hp", actionId: "heal", priority: 10 })
      baseEnemyProtocols.push({ triggerId: "just-took-damage", actionId: "dodge", priority: 9 })
    }

    // Medium-high priority: Tactical positioning
    baseEnemyProtocols.push({ triggerId: "enemy-far", actionId: "move-forward", priority: 8 })
    baseEnemyProtocols.push({ triggerId: "enemy-close", actionId: "move-backward", priority: 7 })
    baseEnemyProtocols.push({ triggerId: "different-row", actionId: "move-up", priority: 6 })

    if (wave >= 3) {
      baseEnemyProtocols.push({ triggerId: "at-front", actionId: "move-backward", priority: 5 })
    }

    // Medium priority: Combat actions
    baseEnemyProtocols.push({ triggerId: "enemy-close", actionId: "shotgun-blast", priority: 4 })

    if (wave >= 4) {
      baseEnemyProtocols.push({ triggerId: "enemy-exposed", actionId: "power-shot", priority: 3 })
    }

    baseEnemyProtocols.push({ triggerId: "same-row", actionId: "shoot", priority: 2 })

    // Low priority: Default fallback
    baseEnemyProtocols.push({ triggerId: "always", actionId: "shoot", priority: 1 })

    console.log("[v0] Enemy protocol config:", baseEnemyProtocols)

    const enemyPairs = baseEnemyProtocols
      .map((config) => {
        const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === config.triggerId)
        const action = AVAILABLE_ACTIONS.find((a) => a.id === config.actionId)

        if (!trigger || !action) {
          console.warn(`[v0] Enemy protocol missing: ${config.triggerId} -> ${config.actionId}`)
          return null
        }

        return {
          trigger,
          action,
          priority: config.priority,
        }
      })
      .filter((pair): pair is TriggerActionPair => pair !== null)

    console.log("[v0] Enemy pairs created:", enemyPairs.length)
    console.log(
      "[v0] Enemy pairs details:",
      enemyPairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
    )

    const enemiesForBattle = enemies.map((e, index) => ({
      id: `enemy-${index}`,
      position: e.position, // Fixed: was "pos", now "position"
      hp: e.hp,
      maxHp: e.maxHp,
      shields: e.shields || 0,
      maxShields: e.maxShields || 0,
      armor: e.armor || 0,
      maxArmor: e.maxArmor || 0,
      burnStacks: [],
      viralStacks: [],
      empStacks: [],
      lagStacks: [],
      displaceStacks: [],
      shieldRegenDisabled: false,
      isPawn: e.isPawn || false,
    }))

    console.log("[v0] startBattle - enemiesForBattle array length:", enemiesForBattle.length)
    console.log(
      "[v0] startBattle - enemiesForBattle details:",
      enemiesForBattle.map(
        (e) => `${e.id}: HP=${e.hp}/${e.maxHp} at (${e.position?.x},${e.position?.y}) isPawn=${e.isPawn}`,
      ),
    )

    battleEngineRef.current = new BattleEngine(
      {
        playerPos: player.position,
        playerHP: player.hp,
        playerShields: player.shields || 0, // Pass player shields to battle engine
        playerArmor: player.armor || 0, // Pass player armor to battle engine
        enemyPos: enemies[0]?.position || { x: 4, y: 1 }, // Added fallback and provide backward-compatible single enemyPos
        enemyHP: enemies[0]?.hp || 0, // Added fallback
        enemies: enemiesForBattle,
        enemyShields: enemies[0]?.shields || 0, // Added backward compatibility
        enemyArmor: enemies[0]?.armor || 0, // Added backward compatibility
        enemyBurnStacks: [], // Initialize empty arrays for backward compatibility
        enemyViralStacks: [],
        enemyEMPStacks: [],
        enemyLagStacks: [],
        enemyDisplaceStacks: [],
        projectiles: [],
        justTookDamage: false,
        shieldRegenDisabled: false,
      },
      enabledPairs,
      enemyPairs,
      fighterCustomization,
      enemyCustomizations,
    )

    console.log("[v0] Battle engine created with", enemies.length, "enemies, starting animation loop")
    lastTimeRef.current = 0
    setBattleState("fighting")
  }, [player, enemies, triggerActionPairs, wave, fighterCustomization, enemyCustomizations])

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

      if (waveNumber === 4) {
        multiplier = 1.0
      } else if (waveNumber === 5) {
        if (winRate > 0.8) {
          multiplier += 0.15
        } else if (winRate > 0.6) {
          multiplier += 0.075
        } else if (winRate < 0.3) {
          multiplier -= 0.1
        } else if (winRate < 0.5) {
          multiplier -= 0.05
        }
      } else {
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
      baseHp = 30 + nextWave * 10
    } else if (nextWave <= 6) {
      baseHp = 40 + nextWave * 10
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

    let enemyCount = 1
    if (nextNodeIsGuardian) {
      const roll = Math.random()
      if (roll < 0.5) enemyCount = 2
      else if (roll < 0.8) enemyCount = 3
      else enemyCount = 4
    } else {
      if (nextWave >= 6) {
        const roll = Math.random()
        if (roll < 0.1) enemyCount = 3
        else if (roll < 0.3) enemyCount = 2
      } else if (nextWave >= 3) {
        if (Math.random() < 0.2) enemyCount = 2
      }
    }

    const totalHpBudget = nextNodeIsGuardian ? Math.floor(baseHp * 1.5) : baseHp
    const enemiesArray: Array<any> = []

    if (nextNodeIsGuardian && enemyCount > 1) {
      const guardianHp = Math.floor(totalHpBudget * 0.6)
      const pawnHpBudget = totalHpBudget - guardianHp
      const pawnHp = Math.floor(pawnHpBudget / (enemyCount - 1))

      enemiesArray.push({
        position: { x: 4, y: 1 },
        hp: guardianHp,
        maxHp: guardianHp,
        shields: 0,
        maxShields: 0,
        armor: 0,
        maxArmor: 0,
        resistances: {},
        statusEffects: [],
        name: generateEnemyName(currentLayerIndex, true),
      })

      for (let i = 1; i < enemyCount; i++) {
        enemiesArray.push({
          position: { x: 5, y: i % 2 === 0 ? 0 : 2 },
          hp: pawnHp,
          maxHp: pawnHp,
          shields: 0,
          maxShields: 0,
          armor: 0,
          maxArmor: 0,
          resistances: {},
          statusEffects: [],
          name: generateGuardianPawnName(),
        })
      }
    } else {
      const hpPerEnemy = Math.floor(totalHpBudget / enemyCount)
      const positions: Position[] = [
        { x: 4, y: 1 },
        { x: 5, y: 0 },
        { x: 5, y: 2 },
      ]

      for (let i = 0; i < enemyCount; i++) {
        enemiesArray.push({
          position: positions[i] || { x: 4, y: 1 },
          hp: hpPerEnemy,
          maxHp: hpPerEnemy,
          shields: 0,
          maxShields: 0,
          armor: 0,
          maxArmor: 0,
          resistances: {},
          statusEffects: [],
          name: generateEnemyName(currentLayerIndex, nextNodeIsGuardian && i === 0),
        })
      }
    }

    const currentLayerData = networkLayers[currentLayerIndex]
    if (currentLayerData) {
      enemiesArray.forEach((enemy, index) => {
        const isGuardian = nextNodeIsGuardian && index === 0
        let shields = 0
        let armor = 0
        let resistances: Partial<Record<DamageType, number>> = {}

        switch (currentLayerData.id) {
          case "data-stream":
            shields = 0
            armor = 0
            resistances = {}
            break
          case "firewall":
            armor = Math.floor(enemy.maxHp * 0.25)
            resistances = {
              kinetic: 0.3,
              corrosive: -0.2,
            }
            break
          case "archive":
            shields = Math.floor(enemy.maxHp * 0.3)
            armor = 0
            resistances = {
              energy: 0.25,
              viral: -0.15,
            }
            break
          case "core-approach":
            shields = Math.floor(enemy.maxHp * 0.25)
            armor = Math.floor(enemy.maxHp * 0.2)
            resistances = {
              energy: 0.2,
              kinetic: 0.2,
              thermal: -0.1,
            }
            break
        }

        if (isGuardian) {
          shields = Math.floor(shields * 1.3)
          armor = Math.floor(armor * 1.3)
        }

        enemy.shields = shields
        enemy.maxShields = shields
        enemy.armor = armor
        enemy.maxArmor = armor
        enemy.resistances = resistances
      })
    }

    console.log("[v0] Generated", enemyCount, "enemies with total HP budget:", totalHpBudget)
    console.log(
      "[v0] Enemy details:",
      enemiesArray.map((e) => `${e.name}: ${e.hp} HP at (${e.position.x},${e.position.y})`),
    )

    const customizationsArray: FighterCustomization[] = []
    for (let i = 0; i < enemyCount; i++) {
      const isGuardian = nextNodeIsGuardian && i === 0
      const isPawn = nextNodeIsGuardian && i > 0

      const customization = generateRandomCustomization()

      // Modify customization for visual variety
      if (isPawn) {
        enemiesArray[i].isPawn = true
      }

      customizationsArray.push(customization)
    }

    console.log("[v0] prepareNextWave - Setting enemies array with length:", enemiesArray.length)
    console.log("[v0] prepareNextWave - Setting customizations array with length:", customizationsArray.length)

    setEnemies(enemiesArray)
    setEnemy(enemiesArray[0])
    setEnemyCustomization(customizationsArray[0])
    setEnemyCustomizations(customizationsArray)
    setShowEnemyIntro(true)
  }, [wave, networkLayers, currentLayerIndex, currentNodeIndex, calculateDifficultyMultiplier])

  const continueToNextWave = useCallback(() => {
    setShowEnemyIntro(false)

    const nextWave = wave + 1
    setWave(nextWave)

    let baseHp: number

    if (nextWave <= 3) {
      baseHp = 30 + nextWave * 10
    } else if (nextWave <= 6) {
      baseHp = 40 + nextWave * 10
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

    let enemyCount = 1
    if (currentNodeIsGuardian) {
      const roll = Math.random()
      if (roll < 0.5) enemyCount = 2
      else if (roll < 0.8) enemyCount = 3
      else enemyCount = 4
    } else {
      if (nextWave >= 6) {
        const roll = Math.random()
        if (roll < 0.1) enemyCount = 3
        else if (roll < 0.3) enemyCount = 2
      } else if (nextWave >= 3) {
        if (Math.random() < 0.2) enemyCount = 2
      }
    }

    const totalHpBudget = currentNodeIsGuardian ? Math.floor(enemyMaxHp * 1.5) : enemyMaxHp
    const enemiesArray: Array<any> = []

    if (currentNodeIsGuardian && enemyCount > 1) {
      const guardianHp = Math.floor(totalHpBudget * 0.6)
      const pawnHpBudget = totalHpBudget - guardianHp
      const pawnHp = Math.floor(pawnHpBudget / (enemyCount - 1))

      enemiesArray.push({
        position: { x: 4, y: 1 },
        hp: guardianHp,
        maxHp: guardianHp,
        shields: 0,
        maxShields: 0,
        armor: 0,
        maxArmor: 0,
        resistances: {},
        statusEffects: [],
        name: generateEnemyName(currentLayerIndex, true),
      })

      for (let i = 1; i < enemyCount; i++) {
        enemiesArray.push({
          position: { x: 5, y: i % 2 === 0 ? 0 : 2 },
          hp: pawnHp,
          maxHp: pawnHp,
          shields: 0,
          maxShields: 0,
          armor: 0,
          maxArmor: 0,
          resistances: {},
          statusEffects: [],
          name: generateGuardianPawnName(),
        })
      }
    } else {
      const hpPerEnemy = Math.floor(totalHpBudget / enemyCount)
      const positions: Position[] = [
        { x: 4, y: 1 },
        { x: 5, y: 0 },
        { x: 5, y: 2 },
      ]

      for (let i = 0; i < enemyCount; i++) {
        enemiesArray.push({
          position: positions[i] || { x: 4, y: 1 },
          hp: hpPerEnemy,
          maxHp: hpPerEnemy,
          shields: 0,
          maxShields: 0,
          armor: 0,
          maxArmor: 0,
          resistances: {},
          statusEffects: [],
          name: generateEnemyName(currentLayerIndex, currentNodeIsGuardian && i === 0),
        })
      }
    }

    const currentLayerData = networkLayers[currentLayerIndex]
    if (currentLayerData) {
      enemiesArray.forEach((enemy, index) => {
        const isGuardian = currentNodeIsGuardian && index === 0
        let shields = 0
        let armor = 0
        let resistances: Partial<Record<DamageType, number>> = {}

        switch (currentLayerData.id) {
          case "data-stream":
            shields = 0
            armor = 0
            resistances = {}
            break
          case "firewall":
            armor = Math.floor(enemy.maxHp * 0.25)
            resistances = {
              kinetic: 0.3,
              corrosive: -0.2,
            }
            break
          case "archive":
            shields = Math.floor(enemy.maxHp * 0.3)
            armor = 0
            resistances = {
              energy: 0.25,
              viral: -0.15,
            }
            break
          case "core-approach":
            shields = Math.floor(enemy.maxHp * 0.25)
            armor = Math.floor(enemy.maxHp * 0.2)
            resistances = {
              energy: 0.2,
              kinetic: 0.2,
              thermal: -0.1,
            }
            break
        }

        if (isGuardian) {
          shields = Math.floor(shields * 1.3)
          armor = Math.floor(armor * 1.3)
        }

        enemy.shields = shields
        enemy.maxShields = shields
        enemy.armor = armor
        enemy.maxArmor = armor
        enemy.resistances = resistances
      })
    }

    const customizationsArray: FighterCustomization[] = []
    for (let i = 0; i < enemyCount; i++) {
      const isGuardian = currentNodeIsGuardian && i === 0
      const isPawn = currentNodeIsGuardian && i > 0

      const customization = generateRandomCustomization()

      if (isPawn) {
        enemiesArray[i].isPawn = true
      }

      customizationsArray.push(customization)
    }

    setPlayer((prev) => ({
      ...prev,
      position: { x: 1, y: 1 },
      hp: prev.maxHp,
    }))

    setEnemies(enemiesArray)
    setEnemy(enemiesArray[0])
    setProjectiles([])
    setBattleHistory([])
    setEnemyCustomization(customizationsArray[0])
    setEnemyCustomizations(customizationsArray)
    setBattleState("idle")
    setShowRewardSelection(false)
  }, [wave, playerProgress, networkLayers, currentLayerIndex, currentNodeIndex, calculateDifficultyMultiplier])

  const resetGame = useCallback(() => {
    const latestProgress = loadProgress()
    setPlayerProgress(latestProgress)

    setWave(1)
    setNetworkLayers(initializeRun())
    setCurrentLayerIndex(0)
    setCurrentNodeIndex(0)

    const hpBonus = getTotalStatBonus(latestProgress, "hp")
    const maxHp = baseMaxHp + hpBonus
    const shieldBonus = getTotalStatBonus(latestProgress, "shield_capacity")
    const armorBonus = getTotalStatBonus(latestProgress, "armor_rating")

    setPlayer({
      position: { x: 1, y: 1 },
      hp: maxHp,
      maxHp,
      shields: shieldBonus,
      maxShields: shieldBonus,
      armor: armorBonus,
      maxArmor: armorBonus,
    })

    setEnemies([
      {
        position: { x: 4, y: 1 },
        hp: 40,
        maxHp: 40,
        shields: 0,
        maxShields: 0,
        armor: 0,
        maxArmor: 0,
        resistances: {},
        statusEffects: [],
        name: generateEnemyName(0, false),
      },
    ])
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
      name: generateEnemyName(0, false),
    })
    setProjectiles([])
    if (selectedCharacter) {
      const customClasses = latestProgress.customFighterClasses || []
      const customClass = customClasses.find((c) => c.id === selectedCharacter.id)

      if (customClass && customClass.startingPairs.length > 0) {
        const pairs: TriggerActionPair[] = customClass.startingPairs
          .map((pair) => {
            const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === pair.triggerId)
            const action = AVAILABLE_ACTIONS.find((a) => a.id === pair.actionId)

            if (!trigger || !action) return null

            return {
              trigger,
              action,
              priority: pair.priority,
              enabled: true,
            }
          })
          .filter((p): p is TriggerActionPair => p !== null)

        console.log("[v0] Reloading custom class protocols for new run:", pairs)
        console.log("[v0] Loaded protocol count:", pairs.length)
        console.log(
          "[v0] Loaded protocol details:",
          pairs.map((p) => `${p.trigger.id}->${p.action.id} (priority: ${p.priority})`),
        )
        setTriggerActionPairs(pairs)

        const uniqueTriggers = Array.from(new Set(pairs.map((p) => p.trigger.id)))
          .map((id) => AVAILABLE_TRIGGERS.find((t) => t.id === id))
          .filter((t): t is Trigger => t !== null)

        const uniqueActions = Array.from(new Set(pairs.map((p) => p.action.id)))
          .map((id) => AVAILABLE_ACTIONS.find((a) => a.id === id))
          .filter((a): a is Action => a !== null)

        setUnlockedTriggers(uniqueTriggers)
        setUnlockedActions(uniqueActions)
      } else {
        setTriggerActionPairs(selectedCharacter.startingPairs.map((pair) => ({ ...pair, enabled: true })))

        const uniqueTriggers = Array.from(new Set(selectedCharacter.startingPairs.map((p) => p.trigger.id)))
          .map((id) => AVAILABLE_TRIGGERS.find((t) => t.id === id))
          .filter((t): t is Trigger => t !== null)

        const uniqueActions = Array.from(new Set(selectedCharacter.startingPairs.map((p) => p.action.id)))
          .map((id) => AVAILABLE_ACTIONS.find((a) => a.id === id))
          .filter((a): a is Action => a !== null)

        setUnlockedTriggers(uniqueTriggers)
        setUnlockedActions(uniqueActions)
      }
    } else {
      setTriggerActionPairs([])
      setUnlockedTriggers([])
      setUnlockedActions([])
    }
    setEnemyCustomization(generateRandomCustomization())
    setEnemyCustomizations([generateRandomCustomization()])
    setBattleHistory([])
    setBattleState("idle")
    setShowRewardSelection(false)
    setShowEnemyIntro(false)
    setRerollsRemaining(3)
    setJustEarnedReward(null)
  }, [selectedCharacter])

  const addTriggerActionPair = useCallback((trigger: Trigger, action: Action) => {
    console.log("[v0] addTriggerActionPair called:", trigger.id, "->", action.id)
    setTriggerActionPairs((prev) => {
      const updated = [
        ...prev,
        {
          trigger,
          action,
          priority: prev.length + 1,
          enabled: true,
        },
      ]
      console.log(
        "[v0] Updated triggerActionPairs:",
        updated.map((p) => `${p.trigger.id}->${p.action.id}`),
      )
      return updated
    })
  }, [])

  const removeTriggerActionPair = useCallback((index: number) => {
    console.log("[v0] removeTriggerActionPair called for index:", index)
    setTriggerActionPairs((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      console.log(
        "[v0] After removal, triggerActionPairs:",
        updated.map((p) => `${p.trigger.id}->${p.action.id}`),
      )
      return updated
    })
  }, [])

  const updatePairPriority = useCallback((index: number, priority: number) => {
    setTriggerActionPairs((prev) => prev.map((pair, i) => (i === index ? { ...pair, priority } : pair)))
  }, [])

  const togglePair = useCallback((index: number, enabled: boolean) => {
    console.log("[v0] togglePair called for index:", index, "enabled:", enabled)
    setTriggerActionPairs((prev) => prev.map((pair, i) => (i === index ? { ...pair, enabled } : pair)))
  }, [])

  const selectRewardTrigger = useCallback(
    (trigger: Trigger) => {
      setUnlockedTriggers((prev) => {
        console.log("[v0] selectRewardTrigger - prev value:", prev)
        console.log(
          "[v0] selectRewardTrigger - prev IDs:",
          prev?.map((t) => t.id),
        )
        const existing = prev || []
        if (existing.some((t) => t.id === trigger.id)) {
          return existing
        }
        const updated = [...existing, trigger]
        console.log(
          "[v0] Updated unlocked triggers after reward:",
          updated.map((t) => t.id),
        )
        return updated
      })
      setJustEarnedReward({ type: "trigger", name: trigger.name })
      setShowRewardSelection(false)
      prepareNextWave()
    },
    [prepareNextWave],
  )

  const selectRewardAction = useCallback(
    (action: Action) => {
      setUnlockedActions((prev) => {
        console.log("[v0] selectRewardAction - prev value:", prev)
        console.log(
          "[v0] selectRewardAction - prev IDs:",
          prev?.map((a) => a.id),
        )
        const existing = prev || []
        if (existing.some((a) => a.id === action.id)) {
          return existing
        }
        const updated = [...existing, action]
        console.log(
          "[v0] Updated unlocked actions after reward:",
          updated.map((a) => a.id),
        )
        return updated
      })
      setJustEarnedReward({ type: "action", name: action.name })
      setShowRewardSelection(false)
      prepareNextWave()
    },
    [prepareNextWave],
  )

  const nextWave = useCallback(() => {
    setBattleState("idle")
    setShowRewardSelection(true)

    const availableTriggers = AVAILABLE_TRIGGERS.filter((t) => !(unlockedTriggers || []).some((ut) => ut.id === t.id))
    const availableActions = AVAILABLE_ACTIONS.filter((a) => !(unlockedActions || []).some((ua) => ua.id === a.id))

    const { triggers, actions } = getRandomRewards(availableTriggers, availableActions)
    setAvailableRewardTriggers(triggers)
    setAvailableRewardActions(actions)
    setRerollsRemaining(3)
  }, [unlockedTriggers, unlockedActions, getRandomRewards])

  const rerollRewards = useCallback(() => {
    if (rerollsRemaining <= 0) return

    console.log("[v0] Rerolling rewards, rerolls remaining:", rerollsRemaining - 1)

    const availableTriggers = AVAILABLE_TRIGGERS.filter((t) => !(unlockedTriggers || []).some((ut) => ut.id === t.id))
    const availableActions = AVAILABLE_ACTIONS.filter((a) => !(unlockedActions || []).some((ua) => ua.id === a.id))

    const { triggers, actions } = getRandomRewards(availableTriggers, availableActions)
    setAvailableRewardTriggers(triggers)
    setAvailableRewardActions(actions)
    setRerollsRemaining((prev) => prev - 1)
  }, [rerollsRemaining, unlockedTriggers, unlockedActions, getRandomRewards])

  const continueAfterIntro = useCallback(() => {
    console.log("[v0] Continuing after intro, resetting player")
    setPlayer((prev) => ({
      ...prev,
      position: { x: 1, y: 1 },
      hp: prev.maxHp,
    }))

    setProjectiles([])
    setShowEnemyIntro(false)
    setBattleState("idle")
  }, [])

  const setCharacter = useCallback(
    (character: CharacterPreset) => {
      setSelectedCharacter(character)

      const customClasses = playerProgress.customFighterClasses || []
      const customClass = customClasses.find((c) => c.id === character.id)

      if (customClass && customClass.startingPairs.length > 0) {
        const pairs: TriggerActionPair[] = customClass.startingPairs
          .map((pair) => {
            const trigger = AVAILABLE_TRIGGERS.find((t) => t.id === pair.triggerId)
            const action = AVAILABLE_ACTIONS.find((a) => a.id === pair.actionId)

            if (!trigger || !action) {
              console.warn(`[v0] Missing trigger or action for pair: ${pair.triggerId}, ${pair.actionId}`)
              return null
            }

            return {
              trigger,
              action,
              priority: pair.priority,
              enabled: true,
            }
          })
          .filter((p): p is TriggerActionPair => p !== null)

        console.log("[v0] Loading custom class protocols:", pairs)
        setTriggerActionPairs(pairs)

        const uniqueTriggers = Array.from(new Set(pairs.map((p) => p.trigger.id)))
          .map((id) => AVAILABLE_TRIGGERS.find((t) => t.id === id))
          .filter((t): t is Trigger => t !== null)

        const uniqueActions = Array.from(new Set(pairs.map((p) => p.action.id)))
          .map((id) => AVAILABLE_ACTIONS.find((a) => a.id === id))
          .filter((a): a is Action => a !== null)

        console.log(
          "[v0] Setting unlocked triggers:",
          uniqueTriggers.map((t) => t.id),
        )
        console.log(
          "[v0] Setting unlocked actions:",
          uniqueActions.map((a) => a.id),
        )
        setUnlockedTriggers(uniqueTriggers)
        setUnlockedActions(uniqueActions)
      } else {
        console.log("[v0] Loading default preset protocols")
        setTriggerActionPairs(character.startingPairs.map((pair) => ({ ...pair, enabled: true })))

        const uniqueTriggers = Array.from(new Set(character.startingPairs.map((p) => p.trigger.id)))
          .map((id) => AVAILABLE_TRIGGERS.find((t) => t.id === id))
          .filter((t): t is Trigger => t !== null)

        const uniqueActions = Array.from(new Set(character.startingPairs.map((p) => p.action.id)))
          .map((id) => AVAILABLE_ACTIONS.find((a) => a.id === id))
          .filter((a): a is Action => a !== null)

        console.log(
          "[v0] Setting unlocked triggers from preset:",
          uniqueTriggers.map((t) => t.id),
        )
        console.log(
          "[v0] Setting unlocked actions from preset:",
          uniqueActions.map((a) => a.id),
        )
        setUnlockedTriggers(uniqueTriggers)
        setUnlockedActions(uniqueActions)
      }

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
    const shieldBonus = getTotalStatBonus(progress, "shield_capacity")
    const armorBonus = getTotalStatBonus(progress, "armor_rating")

    setPlayer((prev) => ({
      ...prev,
      maxHp,
      hp: Math.min(prev.hp, maxHp),
      maxShields: shieldBonus,
      shields: Math.min(prev.shields || 0, shieldBonus),
      maxArmor: armorBonus,
      armor: Math.min(prev.armor || 0, armorBonus),
    }))
  }, [])

  const extractFromBreach = useCallback(() => {
    const currentTotalNodes = currentLayerIndex * 7 + currentNodeIndex
    const currencyEarned = calculateCurrencyReward(currentTotalNodes)

    console.log("[v0] Player extracted at layer", currentLayerIndex, "node", currentNodeIndex)
    console.log("[v0] Total nodes completed:", currentTotalNodes)
    console.log("[v0] Currency earned:", currencyEarned)

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
    }

    console.log("[v0] New cipher fragments total after extraction:", newProgress.cipherFragments)
    setPlayerProgress(newProgress)
    saveProgress(newProgress)

    setBattleState("defeat")
  }, [playerProgress, currentLayerIndex, currentNodeIndex])

  return {
    battleState,
    wave,
    player,
    enemies,
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
    togglePair,
    showRewardSelection,
    availableRewardTriggers,
    availableRewardActions,
    selectRewardTrigger,
    selectRewardAction,
    rerollsRemaining,
    rerollRewards,
    continueToNextWave,
    nextWave,
    continueAfterIntro,
    setCharacter,
    selectedCharacter,
    fighterCustomization,
    setCustomization,
    enemyCustomization,
    enemyCustomizations,
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
    enemy,
  }
}
