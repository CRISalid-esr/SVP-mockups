import { Node, Edge } from '@xyflow/react'
import { ExpertiseNodeData, ExpertiseGraph } from '../../types'

function extractKeywords(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const patterns: [string, string][] = [
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
  return patterns.filter(([k]) => lower.includes(k)).map(([, l]) => l)
}

function extractGeographic(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const regions = [
    'france', 'europe', 'afrique', 'asie', 'amérique', 'maghreb',
    'moyen-orient', 'sri lanka', 'sahel', 'méditerranée', 'bretagne',
    'paris', 'nantes', 'lyon', 'québec', 'sénégal', 'maroc',
  ]
  return regions.filter((r) => lower.includes(r))
    .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
    .slice(0, 2)
}

function extractTemporal(prompt: string): string {
  const yearMatch = prompt.match(/\b(19|20)\d{2}\b/)
  return yearMatch ? `${yearMatch[0]} — aujourd'hui` : ''
}

function extractConcepts(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const conceptMap: Record<string, string> = {
    'genre': 'Genre et identité', 'identité': 'Construction identitaire',
    'culture': 'Dynamiques culturelles', 'pouvoir': 'Rapports de pouvoir',
    'classe': 'Classe sociale', 'travail': 'Valeur du travail',
    'famille': 'Structures familiales', 'religion': 'Fait religieux',
    'mémoire': 'Mémoire collective', 'territoire': 'Territorialisation',
    'inégalité': 'Inégalités sociales', 'technologi': 'Innovations technologiques',
    'données': 'Données et algorithmes',
  }
  return Object.entries(conceptMap)
    .filter(([k]) => lower.includes(k))
    .map(([, v]) => v)
    .slice(0, 3)
}

function buildGraphFromPrompt(prompt: string): { nodes: Node<ExpertiseNodeData>[]; edges: Edge[] } {
  const keywords = extractKeywords(prompt)
  const words = prompt.split(/[\s,.;:!?]+/).filter((w) => w.length > 4).slice(0, 8)
  const geos = extractGeographic(prompt)
  const temporal = extractTemporal(prompt)
  const concepts = extractConcepts(prompt)

  const mainLabel = keywords[0] || words.slice(0, 3).join(' ') || 'Mon expertise principale'
  const secondaryLabels = [
    keywords[1] || words[3] || 'Approche méthodologique',
    keywords[2] || words[4] || 'Dimension comparative',
  ]

  const nodes: Node<ExpertiseNodeData>[] = [
    {
      id: 'n1', type: 'expertiseNode', position: { x: 380, y: 200 },
      data: {
        label: mainLabel,
        nodeType: 'expertise',
        description: 'Expertise centrale identifiée depuis votre description',
        ...(geos.length > 0 && { geographic: geos.map((g) => ({ label: g })) }),
        ...(temporal && { temporal: [{ label: temporal }] }),
        ...(concepts.length > 0 && { concepts: concepts.map((c) => ({ label: c, vocabulary: 'libre' })) }),
      },
    },
    {
      id: 'n2', type: 'expertiseNode', position: { x: 80, y: 60 },
      data: { label: secondaryLabels[0], nodeType: 'expertise' },
    },
    {
      id: 'n3', type: 'expertiseNode', position: { x: 680, y: 60 },
      data: { label: secondaryLabels[1], nodeType: 'expertise' },
    },
  ]

  const edges: Edge[] = [
    { id: 'e1', source: 'n1', target: 'n2', data: { label: 'approfondit', direction: 'forward' } },
    { id: 'e2', source: 'n1', target: 'n3', data: { label: '', direction: 'forward' } },
  ]

  if (keywords.length > 3) {
    nodes.push({
      id: 'n4', type: 'expertiseNode', position: { x: 380, y: 400 },
      data: { label: keywords[3], nodeType: 'expertise' },
    })
    edges.push({ id: 'e3', source: 'n1', target: 'n4', data: { label: 'croise', direction: 'bidirectional' } })
  }

  return { nodes, edges }
}

export async function generateGraphFromPrompt(
  prompt: string,
  existingMeta: ExpertiseGraph['meta'],
): Promise<ExpertiseGraph> {
  await new Promise((r) => setTimeout(r, 1800))
  const { nodes, edges } = buildGraphFromPrompt(prompt)
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
