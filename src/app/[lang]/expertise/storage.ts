import { ExpertiseGraph, HistoryEntry, INITIAL_GRAPH } from './types'

// Clés localStorage partagées entre les vues de la rubrique Expertises.
// Le graphe (thèmes de recherche) est isolé par perspective ; les fiches
// expertises et les familles le sont aussi.
export const GRAPH_KEY_PREFIX = 'expertise-graph-v2'
export const PUBS_KEY_PREFIX = 'expertise-selected-publications'
export const HISTORY_KEY_PREFIX = 'expertise-history'
export const CARDS_KEY = 'expertise-cards-v1'
export const FAMILIES_KEY = 'expertise-families-v1'

export const EMPTY_GRAPH: ExpertiseGraph = {
  nodes: [],
  edges: [],
  meta: { version: 1, lastUpdated: new Date().toISOString().split('T')[0], promptHistory: [] },
}

export function getPerspective(): string {
  if (typeof window === 'undefined') return 'default'
  return new URLSearchParams(window.location.search).get('perspective') || 'default'
}

export function graphStorageKey(): string {
  return `${GRAPH_KEY_PREFIX}-${getPerspective()}`
}

// Le profil de démo (perspective « default ») dispose d'un graphe pré-rempli ;
// tout autre profil démarre sur l'empty state d'onboarding.
export function loadStoredGraph(): ExpertiseGraph {
  if (typeof window === 'undefined') return INITIAL_GRAPH
  try {
    const raw = localStorage.getItem(graphStorageKey())
    if (raw) return JSON.parse(raw) as ExpertiseGraph
  } catch (_e) { /* ignore */ }
  return getPerspective() === 'default' ? INITIAL_GRAPH : EMPTY_GRAPH
}

export function saveStoredGraph(graph: ExpertiseGraph) {
  localStorage.setItem(graphStorageKey(), JSON.stringify(graph))
}

export function pubsStorageKey(): string {
  return `${PUBS_KEY_PREFIX}-${getPerspective()}`
}

export function loadSelectedPublications(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(pubsStorageKey())
    return raw ? JSON.parse(raw) : []
  } catch (_e) { /* ignore */ }
  return []
}

export function historyStorageKey(): string {
  return `${HISTORY_KEY_PREFIX}-${getPerspective()}`
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(historyStorageKey())
    return raw ? JSON.parse(raw) : []
  } catch (_e) { /* ignore */ }
  return []
}

// Ajoute une entrée à l'historique du graphe (max 10, la plus récente en tête) —
// utilisé aussi bien par la génération IA depuis la liste que par la vue Relations,
// pour que HistoryDialog reste cohérent quelle que soit la vue d'origine.
export function appendHistoryEntry(label: string, graph: ExpertiseGraph): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: `h${Date.now()}`,
    timestamp: new Date().toISOString(),
    label,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    graph,
  }
  const next = [entry, ...loadHistory()].slice(0, 10)
  localStorage.setItem(historyStorageKey(), JSON.stringify(next))
  return next
}
