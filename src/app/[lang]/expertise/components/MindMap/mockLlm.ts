import { Node, Edge } from '@xyflow/react'
import { ExpertiseNodeData, ExpertiseGraph } from '../../types'

const EXPERTISE_TEMPLATES: Record<
  string,
  { nodes: Node<ExpertiseNodeData>[]; edges: Edge[] }
> = {
  default: {
    nodes: [
      {
        id: 'n1', type: 'expertiseNode', position: { x: 350, y: 200 },
        data: { label: 'Expertise principale', nodeType: 'main', description: 'Domaine central identifié' },
      },
      {
        id: 'n2', type: 'expertiseNode', position: { x: 80, y: 60 },
        data: { label: 'Spécialisation A', nodeType: 'secondary', description: 'Axe de recherche spécifique' },
      },
      {
        id: 'n3', type: 'expertiseNode', position: { x: 640, y: 60 },
        data: { label: 'Spécialisation B', nodeType: 'secondary', description: 'Autre axe de recherche' },
      },
      {
        id: 'n4', type: 'expertiseNode', position: { x: 80, y: 360 },
        data: { label: 'Terrain géographique', nodeType: 'terrain', description: 'Zone d\'étude principale' },
      },
      {
        id: 'n5', type: 'expertiseNode', position: { x: 640, y: 360 },
        data: { label: 'Concept clé', nodeType: 'concept', description: 'Notion théorique structurante' },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', label: 'approfondit' },
      { id: 'e2', source: 'n1', target: 'n3', label: 'approfondit' },
      { id: 'e3', source: 'n1', target: 'n4', label: 'terrain', animated: true },
      { id: 'e4', source: 'n1', target: 'n5', label: 'mobilise' },
    ],
  },
}

function extractKeywords(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const keywords: string[] = []
  const patterns = [
    ['climat', 'changement climatique'], ['ia', 'intelligence artificielle'],
    ['santé', 'santé publique'], ['éducation', 'sciences de l\'éducation'],
    ['histoire', 'histoire sociale'], ['migration', 'migrations internationales'],
    ['genre', 'études de genre'], ['économi', 'économie'],
    ['sociologi', 'sociologie'], ['linguistiq', 'linguistique'],
    ['biologi', 'biologie'], ['chimie', 'chimie'],
    ['physique', 'physique'], ['mathématiq', 'mathématiques'],
    ['informatiq', 'informatique'], ['droit', 'droit'],
    ['philosophie', 'philosophie'], ['psychologi', 'psychologie'],
  ]
  for (const [key, label] of patterns) {
    if (lower.includes(key)) keywords.push(label)
  }
  return keywords
}

function buildGraphFromPrompt(
  prompt: string,
  existingPromptHistory: string[],
): { nodes: Node<ExpertiseNodeData>[]; edges: Edge[] } {
  const keywords = extractKeywords(prompt)
  const words = prompt
    .split(/[\s,.;:!?]+/)
    .filter((w) => w.length > 4)
    .slice(0, 8)

  const mainLabel =
    keywords[0] ||
    words.slice(0, 3).join(' ') ||
    'Mon expertise principale'

  const secondaryLabels = [
    keywords[1] || words[3] || 'Approche méthodologique',
    keywords[2] || words[4] || 'Dimension comparative',
  ]

  const terrainLabel =
    extractTerrain(prompt) || 'Terrain principal'
  const conceptLabels = extractConcepts(prompt)

  const nodes: Node<ExpertiseNodeData>[] = [
    {
      id: 'n1', type: 'expertiseNode', position: { x: 380, y: 200 },
      data: { label: mainLabel, nodeType: 'main', description: 'Expertise centrale identifiée depuis votre description' },
    },
    {
      id: 'n2', type: 'expertiseNode', position: { x: 80, y: 60 },
      data: { label: secondaryLabels[0], nodeType: 'secondary' },
    },
    {
      id: 'n3', type: 'expertiseNode', position: { x: 680, y: 60 },
      data: { label: secondaryLabels[1], nodeType: 'secondary' },
    },
    {
      id: 'n4', type: 'expertiseNode', position: { x: 80, y: 360 },
      data: { label: terrainLabel, nodeType: 'terrain', description: 'Terrain de recherche' },
    },
  ]

  const edges: Edge[] = [
    { id: 'e1', source: 'n1', target: 'n2', label: 'approfondit' },
    { id: 'e2', source: 'n1', target: 'n3', label: 'approfondit' },
    { id: 'e3', source: 'n1', target: 'n4', label: 'terrain', animated: true },
  ]

  conceptLabels.forEach((label, i) => {
    const id = `nc${i + 1}`
    nodes.push({
      id, type: 'expertiseNode',
      position: { x: 380 + (i % 2 === 0 ? 300 : -220), y: 360 + Math.floor(i / 2) * 120 },
      data: { label, nodeType: 'concept' },
    })
    edges.push({ id: `ec${i + 1}`, source: 'n1', target: id, label: 'mobilise' })
  })

  return { nodes, edges }
}

function extractTerrain(prompt: string): string {
  const lower = prompt.toLowerCase()
  const regions = [
    'france', 'europe', 'afrique', 'asie', 'amérique', 'maghreb',
    'moyen-orient', 'sri lanka', 'sahel', 'méditerranée', 'bretagne',
    'paris', 'nantes', 'lyon', 'québec', 'sénégal', 'maroc',
  ]
  for (const r of regions) {
    if (lower.includes(r)) {
      return r.charAt(0).toUpperCase() + r.slice(1)
    }
  }
  const yearMatch = prompt.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) return `Période ${yearMatch[0]} — aujourd'hui`
  return ''
}

function extractConcepts(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const conceptMap: Record<string, string> = {
    'genre': 'Genre et identité', 'identité': 'Construction identitaire',
    'culture': 'Dynamiques culturelles', 'pouvoir': 'Rapports de pouvoir',
    'classe': 'Classe sociale', 'race': 'Racialisation',
    'travail': 'Valeur du travail', 'famille': 'Structures familiales',
    'religion': 'Fait religieux', 'mémoire': 'Mémoire collective',
    'territoire': 'Territorialisation', 'inégalité': 'Inégalités sociales',
    'technologi': 'Innovations technologiques', 'données': 'Données et algorithmes',
  }
  return Object.entries(conceptMap)
    .filter(([key]) => lower.includes(key))
    .map(([, label]) => label)
    .slice(0, 3)
}

export async function generateGraphFromPrompt(
  prompt: string,
  existingMeta: ExpertiseGraph['meta'],
): Promise<ExpertiseGraph> {
  await new Promise((r) => setTimeout(r, 1800))

  const { nodes, edges } = buildGraphFromPrompt(prompt, existingMeta.promptHistory)

  return {
    nodes,
    edges,
    meta: {
      version: existingMeta.version + 1,
      lastUpdated: new Date().toISOString().split('T')[0],
      promptHistory: [...existingMeta.promptHistory, prompt],
    },
  }
}
