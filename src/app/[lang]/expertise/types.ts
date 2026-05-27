export type ExpertiseNodeType = 'main' | 'secondary' | 'terrain' | 'concept'

export type RelationTypeKey =
  | 'approfondit' | 'specialise' | 'integre'
  | 'terrain_geo' | 'terrain_temp' | 'cas_etude' | 'corpus'
  | 'mobilise' | 'problematise' | 'produit'
  | 'croise' | 'articule' | 'a_conduit_a' | 'en_tension'

export interface RelationTypeConfig {
  label: string
  category: 'Hiérarchie' | 'Terrain' | 'Conceptuel' | 'Dialogue'
  color: string
  strokeDasharray?: string
  animated?: boolean
  bidirectional?: boolean
}

export const RELATION_TYPES: Record<RelationTypeKey, RelationTypeConfig> = {
  // Hiérarchie
  approfondit:  { label: 'approfondit',       category: 'Hiérarchie', color: '#006A61' },
  specialise:   { label: 'spécialise',         category: 'Hiérarchie', color: '#006A61' },
  integre:      { label: 'intègre',            category: 'Hiérarchie', color: '#006A61' },
  // Terrain
  terrain_geo:  { label: 'terrain géographique', category: 'Terrain', color: '#E65100', strokeDasharray: '6 3', animated: true },
  terrain_temp: { label: 'terrain temporel',     category: 'Terrain', color: '#E65100', strokeDasharray: '6 3', animated: true },
  cas_etude:    { label: "cas d'étude",           category: 'Terrain', color: '#E65100', strokeDasharray: '6 3', animated: true },
  corpus:       { label: 'corpus',                category: 'Terrain', color: '#E65100', strokeDasharray: '6 3', animated: true },
  // Conceptuel
  mobilise:     { label: 'mobilise',              category: 'Conceptuel', color: '#7B1FA2', strokeDasharray: '3 3' },
  problematise: { label: 'problématise',          category: 'Conceptuel', color: '#7B1FA2', strokeDasharray: '3 3' },
  produit:      { label: 'produit des connaissances sur', category: 'Conceptuel', color: '#7B1FA2', strokeDasharray: '3 3' },
  // Dialogue
  croise:       { label: 'croise',               category: 'Dialogue', color: '#1976D2', strokeDasharray: '8 4', bidirectional: true },
  articule:     { label: "s'articule avec",      category: 'Dialogue', color: '#1976D2', strokeDasharray: '8 4', bidirectional: true },
  a_conduit_a:  { label: 'a conduit à',          category: 'Dialogue', color: '#1976D2' },
  en_tension:   { label: 'en tension avec',      category: 'Dialogue', color: '#C62828', strokeDasharray: '4 4', bidirectional: true },
}

export const RELATION_CATEGORIES: Array<RelationTypeConfig['category']> = [
  'Hiérarchie', 'Terrain', 'Conceptuel', 'Dialogue',
]

export interface ExpertiseNodeData {
  label: string
  nodeType: ExpertiseNodeType
  description?: string
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

export const NODE_TYPE_CONFIG: Record<
  ExpertiseNodeType,
  { label: string; color: string; bg: string; description: string }
> = {
  main: {
    label: 'Expertise principale',
    color: '#006A61',
    bg: '#E8F5F4',
    description: 'Domaine central de recherche',
  },
  secondary: {
    label: 'Expertise secondaire',
    color: '#1976D2',
    bg: '#E3F2FD',
    description: 'Domaine connexe ou spécialisation',
  },
  terrain: {
    label: 'Terrain de recherche',
    color: '#E65100',
    bg: '#FFF3E0',
    description: 'Zone géographique, période, matériau, langage…',
  },
  concept: {
    label: 'Concept transversal',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    description: 'Notion théorique ou thématique',
  },
}

export const INITIAL_GRAPH: ExpertiseGraph = {
  nodes: [
    {
      id: 'n1',
      type: 'expertiseNode',
      position: { x: 400, y: 220 },
      data: {
        label: 'Migration pour le travail',
        nodeType: 'main',
        description: 'Étude des dynamiques migratoires motivées par l\'emploi',
      },
    },
    {
      id: 'n2',
      type: 'expertiseNode',
      position: { x: 80, y: 80 },
      data: {
        label: 'Sri Lanka — Moyen-Orient',
        nodeType: 'terrain',
        description: 'Corridor migratoire principal étudié',
      },
    },
    {
      id: 'n3',
      type: 'expertiseNode',
      position: { x: 750, y: 80 },
      data: {
        label: 'Politiques migratoires',
        nodeType: 'secondary',
        description: 'Cadres législatifs et diplomatiques',
      },
    },
    {
      id: 'n4',
      type: 'expertiseNode',
      position: { x: 60, y: 380 },
      data: {
        label: 'Genre et migration',
        nodeType: 'concept',
        description: 'Intersections entre genre, travail et mobilité',
      },
    },
    {
      id: 'n5',
      type: 'expertiseNode',
      position: { x: 400, y: 430 },
      data: {
        label: 'Identités en migration',
        nodeType: 'concept',
        description: 'Construction et négociation de l\'identité',
      },
    },
    {
      id: 'n6',
      type: 'expertiseNode',
      position: { x: 750, y: 380 },
      data: {
        label: 'Valeur du travail',
        nodeType: 'concept',
        description: 'Représentations sociales et économiques du travail',
      },
    },
    {
      id: 'n7',
      type: 'expertiseNode',
      position: { x: 150, y: 260 },
      data: {
        label: '2005 — aujourd\'hui',
        nodeType: 'terrain',
        description: 'Période de recherche',
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', data: { relationType: 'terrain_geo' } },
    { id: 'e2', source: 'n1', target: 'n3', data: { relationType: 'approfondit' } },
    { id: 'e3', source: 'n1', target: 'n4', data: { relationType: 'croise' } },
    { id: 'e4', source: 'n1', target: 'n5', data: { relationType: 'a_conduit_a' } },
    { id: 'e5', source: 'n1', target: 'n6', data: { relationType: 'articule' } },
    { id: 'e6', source: 'n1', target: 'n7', data: { relationType: 'terrain_temp' } },
    { id: 'e7', source: 'n4', target: 'n5', data: { relationType: 'approfondit' } },
  ],
  meta: {
    version: 1,
    lastUpdated: '2026-05-26',
    promptHistory: [
      'Je suis spécialiste de la migration pour le travail, notamment entre le Sri Lanka et le Moyen-Orient. Cela m\'a conduit à travailler sur le genre, l\'identité et la valeur du travail.',
    ],
  },
}
