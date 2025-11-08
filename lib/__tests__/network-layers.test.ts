import { describe, it, expect } from "@jest/globals"
import {
  generateLayer,
  initializeRun,
  getNodeRewardDescription,
  getNodeIcon,
  NETWORK_LAYERS,
  type NodeType,
} from "../network-layers"

describe("Network Layers System", () => {
  describe("Layer Generation", () => {
    it("should generate layer with correct number of nodes", () => {
      const layer = generateLayer(0, 6)

      expect(layer.nodes).toHaveLength(7) // 6 regular + 1 guardian
    })

    it("should set first node as current", () => {
      const layer = generateLayer(0)

      expect(layer.nodes[0].current).toBe(true)
      expect(layer.nodes.slice(1).every((n) => !n.current)).toBe(true)
    })

    it("should have guardian as last node", () => {
      const layer = generateLayer(0, 6)

      const lastNode = layer.nodes[layer.nodes.length - 1]
      expect(lastNode.type).toBe("guardian")
    })

    it("should mark all nodes as not completed initially", () => {
      const layer = generateLayer(0)

      expect(layer.nodes.every((n) => !n.completed)).toBe(true)
      expect(layer.completed).toBe(false)
    })

    it("should use correct layer template", () => {
      const layer = generateLayer(1) // Firewall layer

      expect(layer.id).toBe("firewall")
      expect(layer.name).toBe("Firewall Layer")
      expect(layer.guardianName).toBe("The Breach Warden")
    })

    it("should generate valid node types", () => {
      const layer = generateLayer(0, 10)
      const validTypes: NodeType[] = ["battle", "upgrade", "fragment", "heal", "special", "guardian"]

      expect(layer.nodes.every((n) => validTypes.includes(n.type))).toBe(true)
    })
  })

  describe("Run Initialization", () => {
    it("should create all 4 layers", () => {
      const run = initializeRun()

      expect(run).toHaveLength(4)
    })

    it("should have unique layer IDs", () => {
      const run = initializeRun()
      const ids = run.map((l) => l.id)

      expect(new Set(ids).size).toBe(4)
    })

    it("should initialize each layer correctly", () => {
      const run = initializeRun()

      run.forEach((layer) => {
        expect(layer.nodes.length).toBeGreaterThan(0)
        expect(layer.nodes[0].current).toBe(true)
        expect(layer.completed).toBe(false)
      })
    })
  })

  describe("Node Reward Descriptions", () => {
    it("should return correct description for battle nodes", () => {
      expect(getNodeRewardDescription("battle")).toContain("battle")
    })

    it("should return correct description for upgrade nodes", () => {
      expect(getNodeRewardDescription("upgrade")).toContain("Upgrade")
    })

    it("should return correct description for fragment nodes", () => {
      expect(getNodeRewardDescription("fragment")).toContain("Cipher Fragments")
    })

    it("should return correct description for heal nodes", () => {
      expect(getNodeRewardDescription("heal")).toContain("HP")
    })

    it("should return correct description for special nodes", () => {
      expect(getNodeRewardDescription("special")).toContain("Unique")
    })

    it("should return correct description for guardian nodes", () => {
      expect(getNodeRewardDescription("guardian")).toContain("Guardian")
    })

    it("should handle unknown node types", () => {
      expect(getNodeRewardDescription("unknown" as NodeType)).toContain("Unknown")
    })
  })

  describe("Node Icons", () => {
    it("should return icons for all node types", () => {
      const types: NodeType[] = ["battle", "upgrade", "fragment", "heal", "special", "guardian"]

      types.forEach((type) => {
        const icon = getNodeIcon(type)
        expect(icon).toBeTruthy()
        expect(icon.length).toBeGreaterThan(0)
      })
    })

    it("should return question mark for unknown types", () => {
      expect(getNodeIcon("unknown" as NodeType)).toBe("❓")
    })
  })

  describe("Layer Templates", () => {
    it("should have 4 network layers defined", () => {
      expect(NETWORK_LAYERS).toHaveLength(4)
    })

    it("should have unique layer IDs", () => {
      const ids = NETWORK_LAYERS.map((l) => l.id)
      expect(new Set(ids).size).toBe(4)
    })

    it("should have theme colors defined for each layer", () => {
      NETWORK_LAYERS.forEach((layer) => {
        expect(layer.theme.primaryColor).toBeTruthy()
        expect(layer.theme.secondaryColor).toBeTruthy()
        expect(layer.theme.backgroundColor).toBeTruthy()
      })
    })

    it("should have guardian info for each layer", () => {
      NETWORK_LAYERS.forEach((layer) => {
        expect(layer.guardianName).toBeTruthy()
        expect(layer.guardianDescription).toBeTruthy()
      })
    })

    it("should progress in difficulty order", () => {
      expect(NETWORK_LAYERS[0].id).toBe("data-stream")
      expect(NETWORK_LAYERS[1].id).toBe("firewall")
      expect(NETWORK_LAYERS[2].id).toBe("archive")
      expect(NETWORK_LAYERS[3].id).toBe("core-approach")
    })
  })

  describe("Custom Node Count", () => {
    it("should respect custom node count parameter", () => {
      const layer = generateLayer(0, 10)
      expect(layer.nodes).toHaveLength(11) // 10 + guardian
    })

    it("should work with minimum nodes", () => {
      const layer = generateLayer(0, 1)
      expect(layer.nodes).toHaveLength(2) // 1 + guardian
    })
  })
})
