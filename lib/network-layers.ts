export type NodeType = "battle" | "upgrade" | "fragment" | "heal" | "special" | "guardian"

export interface NetworkNode {
  id: string
  type: NodeType
  completed: boolean
  current: boolean
}

export interface NetworkLayer {
  id: string
  name: string
  description: string
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
  }
  nodes: NetworkNode[]
  guardianName: string
  guardianDescription: string
  completed: boolean
}

export const NETWORK_LAYERS: Omit<NetworkLayer, "nodes" | "completed">[] = [
  {
    id: "data-stream",
    name: "Data Stream Layer",
    description: "Navigate the flowing rivers of data",
    theme: {
      primaryColor: "#06b6d4", // cyan
      secondaryColor: "#22d3ee",
      backgroundColor: "#0e7490",
    },
    guardianName: "The Data Weaver",
    guardianDescription: "A sophisticated AI that manipulates data flow to create zones of power",
  },
  {
    id: "firewall",
    name: "Firewall Layer",
    description: "Breach the defensive protocols",
    theme: {
      primaryColor: "#f97316", // orange
      secondaryColor: "#fb923c",
      backgroundColor: "#c2410c",
    },
    guardianName: "The Breach Warden",
    guardianDescription: "An advanced defensive AI with impenetrable shield protocols",
  },
  {
    id: "archive",
    name: "Archive Layer",
    description: "Explore the depths of forgotten data",
    theme: {
      primaryColor: "#a855f7", // purple
      secondaryColor: "#c084fc",
      backgroundColor: "#7e22ce",
    },
    guardianName: "The Memory Keeper",
    guardianDescription: "An ancient AI that adapts by learning from your every move",
  },
  {
    id: "core-approach",
    name: "Core Approach",
    description: "The final path to the Core System",
    theme: {
      primaryColor: "#ec4899", // magenta
      secondaryColor: "#f472b6",
      backgroundColor: "#be185d",
    },
    guardianName: "The Core System",
    guardianDescription: "The ultimate AI program - defeat it to become the Ciphernet Architect",
  },
]

export function generateLayer(layerIndex: number, nodesPerLayer = 6): NetworkLayer {
  const layerTemplate = NETWORK_LAYERS[layerIndex]
  const nodes: NetworkNode[] = []

  // Generate regular nodes
  for (let i = 0; i < nodesPerLayer; i++) {
    const nodeTypes: NodeType[] = ["battle", "upgrade", "fragment", "heal"]
    // Add special nodes occasionally
    if (Math.random() > 0.7) {
      nodeTypes.push("special")
    }

    nodes.push({
      id: `${layerTemplate.id}-node-${i}`,
      type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
      completed: false,
      current: i === 0, // First node is current
    })
  }

  // Add guardian node at the end
  nodes.push({
    id: `${layerTemplate.id}-guardian`,
    type: "guardian",
    completed: false,
    current: false,
  })

  return {
    ...layerTemplate,
    nodes,
    completed: false,
  }
}

export function initializeRun(): NetworkLayer[] {
  return NETWORK_LAYERS.map((_, index) => generateLayer(index))
}

export function getNodeRewardDescription(nodeType: NodeType): string {
  switch (nodeType) {
    case "battle":
      return "Standard battle - Choose a new Trigger or Action"
    case "upgrade":
      return "Upgrade an existing module or gain a temporary buff"
    case "fragment":
      return "Earn bonus Cipher Fragments (currency)"
    case "heal":
      return "Restore HP"
    case "special":
      return "Unique reward - System Perk or Malware Injection"
    case "guardian":
      return "Layer Guardian - Major rewards await"
    default:
      return "Unknown node type"
  }
}

export function getNodeIcon(nodeType: NodeType): string {
  switch (nodeType) {
    case "battle":
      return "⚔️"
    case "upgrade":
      return "⬆️"
    case "fragment":
      return "💎"
    case "heal":
      return "❤️"
    case "special":
      return "✨"
    case "guardian":
      return "👑"
    default:
      return "❓"
  }
}
