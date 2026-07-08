import { ExpertiseGraph, INITIAL_GRAPH } from './types'

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
