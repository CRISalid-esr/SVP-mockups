export type ExpertiseNodeType = 'expertise'

export type EdgeDirection = 'forward' | 'backward' | 'bidirectional'

export type AttributeCategory = 'temporal' | 'geographic' | 'persons' | 'organizations' | 'concepts'

export interface EdgeData {
  label?: string
  direction?: EdgeDirection
  [key: string]: unknown
}

export interface ConceptRef {
  label: string
  vocabulary?: string
  uri?: string
}

export interface TemporalRef {
  label: string
  yearFrom?: number
  yearTo?: number
}

export interface GeoRef {
  label: string
  geonamesId?: number
}

export interface PersonRef {
  label: string
  identifier?: string  // IdRef PPN
}

export interface OrgRef {
  label: string
  identifier?: string  // IdRef PPN
}

export interface ExpertiseAttributes {
  temporal?: TemporalRef[]
  geographic?: GeoRef[]
  persons?: PersonRef[]
  organizations?: OrgRef[]
  concepts?: ConceptRef[]
}

export interface HistoryEntry {
  id: string
  timestamp: string
  label: string
  nodeCount: number
  edgeCount: number
  graph: ExpertiseGraph
}

export interface ExpertiseNodeData extends ExpertiseAttributes {
  label: string
  nodeType: ExpertiseNodeType
  description?: string
  expanded?: boolean
  [key: string]: unknown
}

export interface ExpertiseGraphMeta {
  version: number
  lastUpdated: string
  promptHistory: string[]
}

export interface ExpertiseGraph {
  nodes: import('@xyflow/react').Node<ExpertiseNodeData>[]
  edges: import('@xyflow/react').Edge[]
  meta: ExpertiseGraphMeta
}

export const NODE_COLOR = '#006A61'
export const NODE_BG = '#E8F5F4'

export const NODE_TYPE_CONFIG: Record<
  ExpertiseNodeType,
  { label: string; color: string; bg: string; description: string }
> = {
  expertise: {
    label: 'Expertise',
    color: NODE_COLOR,
    bg: NODE_BG,
    description: 'Domaine de recherche',
  },
}

export const CONTROLLED_VOCABULARIES: { key: string; label: string }[] = [
  { key: 'rameau', label: 'RAMEAU' },
  { key: 'mesh', label: 'MeSH' },
  { key: 'wikidata', label: 'Wikidata' },
  { key: 'jel', label: 'JEL (Économie)' },
  { key: 'ams', label: 'AMS (Mathématiques)' },
  { key: 'msc', label: 'MSC (Sciences)' },
  { key: 'lcsh', label: 'LCSH (Library of Congress)' },
  { key: 'libre', label: 'Vocabulaire libre' },
]

export const INITIAL_GRAPH: ExpertiseGraph = {
  nodes: [
    {
      id: 'n1',
      type: 'expertiseNode',
      position: { x: 380, y: 200 },
      data: {
        label: 'Migration pour le travail',
        nodeType: 'expertise',
        description: "Étude des dynamiques migratoires motivées par l'emploi",
        temporal: [{ label: '2005 — aujourd\'hui' }],
        geographic: [{ label: 'Sri Lanka — Moyen-Orient' }],
        concepts: [
          { label: 'migration du travail', vocabulary: 'rameau' },
          { label: 'mobilité internationale', vocabulary: 'libre' },
        ],
      },
    },
    {
      id: 'n2',
      type: 'expertiseNode',
      position: { x: 80, y: 60 },
      data: {
        label: 'Politiques migratoires',
        nodeType: 'expertise',
        description: 'Cadres législatifs et diplomatiques',
        geographic: [{ label: 'Union européenne' }, { label: 'Golfe Persique' }],
      },
    },
    {
      id: 'n3',
      type: 'expertiseNode',
      position: { x: 700, y: 60 },
      data: {
        label: 'Genre et migration',
        nodeType: 'expertise',
        description: 'Intersections entre genre, travail et mobilité',
        concepts: [
          { label: 'études de genre', vocabulary: 'rameau' },
          { label: 'intersectionnalité', vocabulary: 'libre' },
        ],
        persons: [{ label: 'Rhacel Salazar Parreñas' }],
      },
    },
    {
      id: 'n4',
      type: 'expertiseNode',
      position: { x: 380, y: 420 },
      data: {
        label: 'Identités en migration',
        nodeType: 'expertise',
        description: "Construction et négociation de l'identité",
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', data: { label: 'approfondit', direction: 'forward' } },
    { id: 'e2', source: 'n1', target: 'n3', data: { label: 'croise', direction: 'bidirectional' } },
    { id: 'e3', source: 'n1', target: 'n4', data: { label: 'a conduit à', direction: 'forward' } },
    { id: 'e4', source: 'n3', target: 'n4', data: { direction: 'forward' } },
  ],
  meta: {
    version: 2,
    lastUpdated: '2026-06-09',
    promptHistory: [
      "Je suis spécialiste de la migration pour le travail, notamment entre le Sri Lanka et le Moyen-Orient. Cela m'a conduit à travailler sur le genre, l'identité et la valeur du travail.",
    ],
  },
}
