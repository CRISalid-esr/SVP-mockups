'use client'

import { useEffect, useState } from 'react'
import { Node, Edge } from '@xyflow/react'
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid2 as Grid,
  Typography,
} from '@mui/material'
import { AccountTree, Add } from '@mui/icons-material'
import { Activity } from '@/types/Activity'
import {
  ExpertiseGraph,
  ExpertiseNodeData,
  INITIAL_GRAPH,
  NODE_TYPE_CONFIG,
  RELATION_TYPES,
  RelationTypeKey,
} from '../../types'
import ExpertiseFlatCard, { ConnectedNode, ExpertiseEntry } from './ExpertiseFlatCard'

const GRAPH_KEY = 'expertise-graph-v1'
const ACTIVITIES_KEY = 'expertise-activities-v1'
const TEAL = '#006A61'

// Activités mock partagées avec la rubrique Activités de recherche
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1', type: 'projet', title: 'ANR DeepLearning4Science',
    startDate: '2023-01-15', endDate: '2025-12-31',
    description: "Développement de méthodes d'apprentissage profond pour l'analyse de données scientifiques massives.",
    specificData: { budget: '450 000 €', role: 'Coordinateur' },
  },
  {
    id: '2', type: 'encadrement', title: 'Thèse de Marie Dupont',
    startDate: '2022-10-01', endDate: '2025-09-30',
    description: "Optimisation des algorithmes de traitement d'images médicales par apprentissage profond.",
    specificData: { student: 'Marie Dupont', level: 'PhD', percentage: '50%' },
  },
  {
    id: '3', type: 'brevet', title: "Système d'analyse automatisée pour la détection précoce",
    startDate: '2024-03-15',
    description: "Brevet déposé pour un système innovant utilisant l'IA pour la détection précoce de pathologies.",
    specificData: { number: 'FR2024001234', status: "En cours d'examen" },
  },
  {
    id: '4', type: 'distinction', title: "Prix jeune chercheur – Société Française d'IA",
    startDate: '2024-06-10',
    description: "Récompense pour contributions exceptionnelles dans le domaine de l'apprentissage automatique.",
    specificData: { organization: 'SFIA' },
  },
  {
    id: '5', type: 'conference', title: 'Conférence invitée – NeurIPS 2024',
    startDate: '2024-12-10',
    description: "Présentation invitée sur les avancées récentes en apprentissage par renforcement.",
    url: 'https://neurips.cc',
    specificData: { location: 'Vancouver, Canada', type: 'Invited talk' },
  },
  {
    id: '6', type: 'enseignement', title: 'Intelligence Artificielle Avancée – Master 2',
    startDate: '2023-09-01', endDate: '2024-06-30',
    description: "Cours magistral et travaux dirigés sur l'apprentissage profond.",
    specificData: { establishment: 'Université de Nantes', level: 'Master 2', hours: '48' },
  },
  {
    id: '7', type: 'editorial', title: 'Éditeur associé – Journal of Machine Learning Research',
    startDate: '2022-01-01',
    description: "Responsabilités éditoriales pour une revue internationale classée A*.",
    specificData: { journal: 'JMLR', role: 'Éditeur associé' },
  },
  {
    id: '8', type: 'encadrement', title: 'Stage M2 – Lucas Martin',
    startDate: '2024-02-01', endDate: '2024-07-31',
    description: "Stage de master 2 sur la génération de texte médical par grands modèles de langage.",
    specificData: { student: 'Lucas Martin', level: 'Master', percentage: '100%' },
  },
]

// Associations initiales pour la démo
const INITIAL_ASSOCIATIONS: Record<string, string[]> = {
  n1: ['1', '2'],
  n3: ['5', '7'],
}

function loadGraph(): ExpertiseGraph {
  if (typeof window === 'undefined') return INITIAL_GRAPH
  try {
    const raw = localStorage.getItem(GRAPH_KEY)
    if (raw) return JSON.parse(raw) as ExpertiseGraph
  } catch {}
  return INITIAL_GRAPH
}

function loadAssociations(): Record<string, string[]> {
  if (typeof window === 'undefined') return INITIAL_ASSOCIATIONS
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY)
    if (raw) return JSON.parse(raw) as Record<string, string[]>
  } catch {}
  return INITIAL_ASSOCIATIONS
}

function buildEntries(
  nodes: Node<ExpertiseNodeData>[],
  edges: Edge[],
): ExpertiseEntry[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  const expertiseNodes = nodes.filter(
    (n) => (n.data as ExpertiseNodeData).nodeType === 'main' ||
            (n.data as ExpertiseNodeData).nodeType === 'secondary',
  )

  return expertiseNodes.map((eNode) => {
    const terrains: ConnectedNode[] = []
    const concepts: ConnectedNode[] = []
    const hierarchyOut: ConnectedNode[] = []
    const hierarchyIn: ConnectedNode[] = []
    const dialogue: ConnectedNode[] = []
    const dialogueIds = new Set<string>()

    for (const edge of edges) {
      const relationType = (edge.data?.relationType ?? 'croise') as RelationTypeKey
      const relCfg = RELATION_TYPES[relationType]
      if (!relCfg) continue

      if (edge.source === eNode.id) {
        const target = nodeMap.get(edge.target)
        if (!target) continue
        const targetType = (target.data as ExpertiseNodeData).nodeType

        if (targetType === 'terrain') {
          terrains.push({ node: target as Node<ExpertiseNodeData>, relationType })
        } else if (targetType === 'concept') {
          concepts.push({ node: target as Node<ExpertiseNodeData>, relationType })
        } else if (targetType === 'main' || targetType === 'secondary') {
          if (relCfg.category === 'Hiérarchie') {
            hierarchyOut.push({ node: target as Node<ExpertiseNodeData>, relationType })
          } else if (relCfg.category === 'Dialogue') {
            dialogueIds.add(target.id)
            dialogue.push({ node: target as Node<ExpertiseNodeData>, relationType })
          }
        }
      }

      if (edge.target === eNode.id) {
        const source = nodeMap.get(edge.source)
        if (!source) continue
        const sourceType = (source.data as ExpertiseNodeData).nodeType

        if (sourceType === 'main' || sourceType === 'secondary') {
          if (relCfg.category === 'Hiérarchie') {
            hierarchyIn.push({ node: source as Node<ExpertiseNodeData>, relationType })
          } else if (relCfg.category === 'Dialogue' && !dialogueIds.has(source.id)) {
            dialogueIds.add(source.id)
            dialogue.push({ node: source as Node<ExpertiseNodeData>, relationType })
          }
        }
      }
    }

    return { node: eNode, terrains, concepts, hierarchyOut, hierarchyIn, dialogue }
  }).sort((a, b) => {
    // main avant secondary
    const order = { main: 0, secondary: 1, terrain: 2, concept: 3 }
    const aType = (a.node.data as ExpertiseNodeData).nodeType
    const bType = (b.node.data as ExpertiseNodeData).nodeType
    return (order[aType] ?? 99) - (order[bType] ?? 99)
  })
}

interface Props {
  onGoToMindMap: () => void
}

export default function FlatView({ onGoToMindMap }: Props) {
  const [graph, setGraph] = useState<ExpertiseGraph>(INITIAL_GRAPH)
  const [associations, setAssociations] = useState<Record<string, string[]>>(INITIAL_ASSOCIATIONS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setGraph(loadGraph())
    setAssociations(loadAssociations())
    setMounted(true)
  }, [])

  const entries = buildEntries(
    graph.nodes as Node<ExpertiseNodeData>[],
    graph.edges,
  )

  const handleUpdateAssociations = (nodeId: string, ids: string[]) => {
    const next = { ...associations, [nodeId]: ids }
    setAssociations(next)
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(next))
  }

  const mainCount = entries.filter((e) => (e.node.data as ExpertiseNodeData).nodeType === 'main').length
  const secondaryCount = entries.filter((e) => (e.node.data as ExpertiseNodeData).nodeType === 'secondary').length

  if (!mounted) return null

  return (
    <Box sx={{ p: 3 }}>
      {/* Bannière de lien avec la carte mentale */}
      <Alert
        severity="info"
        icon={<AccountTree fontSize="small" />}
        action={
          <Button
            size="small"
            onClick={onGoToMindMap}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap', color: '#1976D2' }}
          >
            Modifier le graphe →
          </Button>
        }
        sx={{ mb: 3, '& .MuiAlert-message': { flex: 1 } }}
      >
        Cette vue est générée depuis votre carte mentale (v{graph.meta.version}, mise à jour le {graph.meta.lastUpdated}).
        Modifiez le graphe pour enrichir cette liste.
      </Alert>

      {/* En-tête avec compteurs */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Mes expertises
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {mainCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                <Box component="span" sx={{ fontWeight: 600, color: NODE_TYPE_CONFIG.main.color }}>
                  {mainCount}
                </Box>{' '}
                expertise{mainCount > 1 ? 's' : ''} principale{mainCount > 1 ? 's' : ''}
              </Typography>
            )}
            {secondaryCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                <Box component="span" sx={{ fontWeight: 600, color: NODE_TYPE_CONFIG.secondary.color }}>
                  {secondaryCount}
                </Box>{' '}
                secondaire{secondaryCount > 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onGoToMindMap}
          size="small"
          sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}
        >
          Ajouter dans la carte mentale
        </Button>
      </Box>

      {entries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <AccountTree sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune expertise définie
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Commencez par créer votre carte mentale pour alimenter cette vue.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AccountTree />}
            onClick={onGoToMindMap}
            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}
          >
            Créer ma carte mentale
          </Button>
        </Box>
      ) : (
        <>
          {/* Section expertises principales */}
          {mainCount > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: NODE_TYPE_CONFIG.main.color }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: NODE_TYPE_CONFIG.main.color }}>
                  Expertises principales
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
              <Grid container spacing={3}>
                {entries
                  .filter((e) => (e.node.data as ExpertiseNodeData).nodeType === 'main')
                  .map((entry) => (
                    <Grid key={entry.node.id} size={{ xs: 12, lg: 6 }}>
                      <ExpertiseFlatCard
                        entry={entry}
                        activities={MOCK_ACTIVITIES}
                        associatedIds={associations[entry.node.id] ?? []}
                        onUpdateAssociations={handleUpdateAssociations}
                        onGoToMindMap={onGoToMindMap}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}

          {/* Section expertises secondaires */}
          {secondaryCount > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: NODE_TYPE_CONFIG.secondary.color }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: NODE_TYPE_CONFIG.secondary.color }}>
                  Expertises secondaires
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
              <Grid container spacing={3}>
                {entries
                  .filter((e) => (e.node.data as ExpertiseNodeData).nodeType === 'secondary')
                  .map((entry) => (
                    <Grid key={entry.node.id} size={{ xs: 12, md: 6, lg: 4 }}>
                      <ExpertiseFlatCard
                        entry={entry}
                        activities={MOCK_ACTIVITIES}
                        associatedIds={associations[entry.node.id] ?? []}
                        onUpdateAssociations={handleUpdateAssociations}
                        onGoToMindMap={onGoToMindMap}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
