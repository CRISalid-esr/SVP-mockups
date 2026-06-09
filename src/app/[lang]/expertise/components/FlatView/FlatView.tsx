'use client'

import { useEffect, useState } from 'react'
import { Node, Edge } from '@xyflow/react'
import {
  Alert, Box, Button, Grid2 as Grid, Typography,
} from '@mui/material'
import { AccountTree, Add } from '@mui/icons-material'
import { Activity } from '@/types/Activity'
import {
  EdgeData,
  ExpertiseGraph,
  ExpertiseNodeData,
  INITIAL_GRAPH,
} from '../../types'
import ExpertiseFlatCard, { ExpertiseEntry, RelatedExpertise } from './ExpertiseFlatCard'

const GRAPH_KEY = 'expertise-graph-v2'
const ACTIVITIES_KEY = 'expertise-activities-v1'
const TEAL = '#006A61'

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

const INITIAL_ASSOCIATIONS: Record<string, string[]> = { n1: ['1', '2'], n3: ['5', '7'] }

function loadGraph(): ExpertiseGraph {
  if (typeof window === 'undefined') return INITIAL_GRAPH
  try {
    const raw = localStorage.getItem(GRAPH_KEY)
    if (raw) return JSON.parse(raw) as ExpertiseGraph
  } catch (_e) { /* ignore */ }
  return INITIAL_GRAPH
}

function loadAssociations(): Record<string, string[]> {
  if (typeof window === 'undefined') return INITIAL_ASSOCIATIONS
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY)
    if (raw) return JSON.parse(raw) as Record<string, string[]>
  } catch (_e) { /* ignore */ }
  return INITIAL_ASSOCIATIONS
}

function buildEntries(nodes: Node<ExpertiseNodeData>[], edges: Edge[]): ExpertiseEntry[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  return nodes.map((node) => {
    const relations: RelatedExpertise[] = []
    const seen = new Set<string>()

    for (const edge of edges) {
      const data = (edge.data ?? {}) as EdgeData
      const direction = data.direction ?? 'forward'

      if (edge.source === node.id && !seen.has(edge.target)) {
        const target = nodeMap.get(edge.target)
        if (target) {
          seen.add(edge.target)
          relations.push({
            node: target as Node<ExpertiseNodeData>,
            edgeLabel: data.label,
            directionArrow: direction === 'forward' ? 'to' : direction === 'backward' ? 'from' : 'both',
          })
        }
      } else if (edge.target === node.id && !seen.has(edge.source)) {
        const source = nodeMap.get(edge.source)
        if (source) {
          seen.add(edge.source)
          relations.push({
            node: source as Node<ExpertiseNodeData>,
            edgeLabel: data.label,
            directionArrow: direction === 'forward' ? 'from' : direction === 'backward' ? 'to' : 'both',
          })
        }
      }
    }

    return { node, relations }
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

  if (!mounted) return null

  return (
    <Box sx={{ p: 3 }}>
      <Alert
        severity="info"
        icon={<AccountTree fontSize="small" />}
        action={
          <Button size="small" onClick={onGoToMindMap}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap', color: '#1976D2' }}>
            Modifier le graphe →
          </Button>
        }
        sx={{ mb: 3, '& .MuiAlert-message': { flex: 1 } }}
      >
        Cette vue est générée depuis votre carte mentale (v{graph.meta.version}, mise à jour le {graph.meta.lastUpdated}).
        Modifiez le graphe pour enrichir cette liste.
      </Alert>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Mes expertises
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 600, color: TEAL }}>{entries.length}</Box>
            {' '}expertise{entries.length > 1 ? 's' : ''} définie{entries.length > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Add />} onClick={onGoToMindMap} size="small"
          sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
          Ajouter dans la carte
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
          <Button variant="contained" startIcon={<AccountTree />} onClick={onGoToMindMap}
            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}>
            Créer ma carte
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {entries.map((entry) => (
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
      )}
    </Box>
  )
}
