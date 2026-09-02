'use client'

import { useEffect, useState } from 'react'
import { Node, Edge } from '@xyflow/react'
import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Grid2 as Grid, Snackbar, Typography,
} from '@mui/material'
import {
  AccountTree, Add, AutoAwesomeOutlined, CheckCircleOutlined, DeleteOutline, ExpandMore, Tune,
} from '@mui/icons-material'
import { Activity } from '@/types/Activity'
import {
  EdgeData,
  ExpertiseGraph,
  ExpertiseNodeData,
  INITIAL_GRAPH,
} from '../../types'
import {
  appendHistoryEntry, CARDS_KEY, FAMILIES_KEY, loadStoredGraph, saveStoredGraph,
} from '../../storage'
import {
  ImpactCard, ImpactFamily, INITIAL_CARDS, INITIAL_FAMILIES, PROFILE_CONFIG, ProfileType,
} from '../ImpactCards/impactCardsTypes'
import GenerationPanel from '../ThemeGeneration/GenerationPanel'
import ExpertiseFlatCard, { ExpertiseEntry, RelatedExpertise } from './ExpertiseFlatCard'
import AddThemeDialog, { NewTheme } from './AddThemeDialog'

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

// Fiches expertises et familles (thème → fiches par public), pour afficher
// les expertises liées sur chaque carte de thème.
function loadCards(): ImpactCard[] {
  if (typeof window === 'undefined') return INITIAL_CARDS
  try {
    const raw = localStorage.getItem(CARDS_KEY)
    if (raw) return JSON.parse(raw) as ImpactCard[]
  } catch (_e) { /* ignore */ }
  return INITIAL_CARDS
}

function loadFamilies(): ImpactFamily[] {
  if (typeof window === 'undefined') return INITIAL_FAMILIES
  try {
    const raw = localStorage.getItem(FAMILIES_KEY)
    if (raw) return JSON.parse(raw) as ImpactFamily[]
  } catch (_e) { /* ignore */ }
  return INITIAL_FAMILIES
}

const PROFILE_ORDER = Object.keys(PROFILE_CONFIG) as ProfileType[]

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
  /** Bascule sur la vue Relations (même onglet, autre rendu des thèmes). */
  onGoToMindMap: () => void
  /** Navigue vers l'onglet Expertises (fiches par public). */
  onGoToExpertises?: () => void
  /** Vrai juste après une génération IA : affiche la bannière de revue. */
  justGenerated?: boolean
  /** Appelé quand le graphe est modifié depuis la liste (ajout d'un thème). */
  onGraphChanged?: () => void
  /** Appelé après une génération IA réussie (met à jour le stepper de la page). */
  onThemesGenerated?: () => void
}

export default function FlatView({
  onGoToMindMap, onGoToExpertises, justGenerated, onGraphChanged, onThemesGenerated,
}: Props) {
  const [graph, setGraph] = useState<ExpertiseGraph>(INITIAL_GRAPH)
  const [associations, setAssociations] = useState<Record<string, string[]>>(INITIAL_ASSOCIATIONS)
  const [cards, setCards] = useState<ImpactCard[]>([])
  const [families, setFamilies] = useState<ImpactFamily[]>([])
  const [mounted, setMounted] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<Node<ExpertiseNodeData> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Node<ExpertiseNodeData> | null>(null)
  const [snackbar, setSnackbar] = useState('')

  useEffect(() => {
    setGraph(loadStoredGraph())
    setAssociations(loadAssociations())
    setCards(loadCards())
    setFamilies(loadFamilies())
    setMounted(true)
  }, [])

  const linkedCardsFor = (node: Node<ExpertiseNodeData>): ImpactCard[] => {
    const family = families.find(
      (f) => f.nodeId === node.id || f.title === (node.data as ExpertiseNodeData).label,
    )
    if (!family) return []
    return cards
      .filter((c) => c.familyId === family.id)
      .sort((a, b) => PROFILE_ORDER.indexOf(a.profile) - PROFILE_ORDER.indexOf(b.profile))
  }

  const handlePanelGenerated = (result: ExpertiseGraph, sourceLabel: string) => {
    saveStoredGraph(result)
    setGraph(result)
    appendHistoryEntry(sourceLabel, result)
    setSnackbar('Thèmes générés — passez-les en revue')
    onGraphChanged?.()
    onThemesGenerated?.()
  }

  const handleAddTheme = (theme: NewTheme) => {
    const count = graph.nodes.length
    const newNode: Node<ExpertiseNodeData> = {
      id: `n${Date.now()}`,
      type: 'expertiseNode',
      position: { x: 80 + (count % 3) * 320, y: 80 + Math.floor(count / 3) * 190 },
      data: {
        label: theme.label,
        nodeType: 'expertise',
        ...(theme.description ? { description: theme.description } : {}),
        ...theme.attributes,
      },
    }
    const next: ExpertiseGraph = {
      ...graph,
      nodes: [...graph.nodes, newNode],
      meta: { ...graph.meta, lastUpdated: new Date().toISOString().split('T')[0] },
    }
    saveStoredGraph(next)
    setGraph(next)
    setAddOpen(false)
    setSnackbar(`Thème « ${theme.label} » ajouté`)
    onGraphChanged?.()
  }

  const handleEditTheme = (theme: NewTheme) => {
    if (!editingNode) return
    const next: ExpertiseGraph = {
      ...graph,
      nodes: graph.nodes.map((n) => n.id !== editingNode.id ? n : {
        ...n,
        data: {
          ...(n.data as ExpertiseNodeData),
          label: theme.label,
          description: theme.description || undefined,
          temporal: theme.attributes.temporal,
          geographic: theme.attributes.geographic,
          persons: theme.attributes.persons,
          organizations: theme.attributes.organizations,
          concepts: theme.attributes.concepts,
        },
      }),
      meta: { ...graph.meta, lastUpdated: new Date().toISOString().split('T')[0] },
    }
    saveStoredGraph(next)
    setGraph(next)
    setEditingNode(null)
    setSnackbar(`Thème « ${theme.label} » modifié`)
    onGraphChanged?.()
  }

  const handleDeleteTheme = () => {
    if (!deleteTarget) return
    const label = (deleteTarget.data as ExpertiseNodeData).label
    const next: ExpertiseGraph = {
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== deleteTarget.id),
      edges: graph.edges.filter((e) => e.source !== deleteTarget.id && e.target !== deleteTarget.id),
      meta: { ...graph.meta, lastUpdated: new Date().toISOString().split('T')[0] },
    }
    saveStoredGraph(next)
    setGraph(next)
    if (associations[deleteTarget.id]) {
      const { [deleteTarget.id]: _removed, ...rest } = associations
      setAssociations(rest)
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(rest))
    }
    setDeleteTarget(null)
    setSnackbar(`Thème « ${label} » supprimé`)
    onGraphChanged?.()
  }

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
      {justGenerated ? (
        <Alert
          severity="success"
          icon={<CheckCircleOutlined fontSize="small" />}
          sx={{ mb: 3, '& .MuiAlert-message': { flex: 1 } }}
        >
          Vos thèmes de recherche ont été générés — passez-les en revue : modifiez ou supprimez
          ce qui ne vous ressemble pas, puis générez vos fiches expertises.
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<AccountTree fontSize="small" />}
          action={
            <Button size="small" onClick={onGoToMindMap}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap', color: '#1976D2' }}>
              Voir les relations →
            </Button>
          }
          sx={{ mb: 3, '& .MuiAlert-message': { flex: 1 } }}
        >
          Thèmes mis à jour le {graph.meta.lastUpdated} (v{graph.meta.version}).
          Pour relier vos thèmes entre eux, utilisez la vue avancée « Relations ».
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Mes thèmes de recherche
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 600, color: TEAL }}>{entries.length}</Box>
            {' '}thème{entries.length > 1 ? 's' : ''} défini{entries.length > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)} size="small"
          sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' } }}>
          Ajouter un thème
        </Button>
      </Box>

      {entries.length === 0 ? (
        <GenerationPanel graph={graph} variant="empty" onGraphGenerated={handlePanelGenerated} />
      ) : (
        <>
          <Accordion
            disableGutters
            sx={{
              mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2,
              '&:before': { display: 'none' }, boxShadow: 'none',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tune sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Ajuster le périmètre ou régénérer des thèmes
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <GenerationPanel graph={graph} variant="inline" onGraphGenerated={handlePanelGenerated} />
            </AccordionDetails>
          </Accordion>

          <Grid container spacing={3}>
            {entries.map((entry) => (
              <Grid key={entry.node.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <ExpertiseFlatCard
                  entry={entry}
                  activities={MOCK_ACTIVITIES}
                  associatedIds={associations[entry.node.id] ?? []}
                  linkedCards={linkedCardsFor(entry.node as Node<ExpertiseNodeData>)}
                  onUpdateAssociations={handleUpdateAssociations}
                  onGoToMindMap={onGoToMindMap}
                  onGoToExpertises={onGoToExpertises}
                  onEdit={() => setEditingNode(entry.node as Node<ExpertiseNodeData>)}
                  onDelete={() => setDeleteTarget(entry.node as Node<ExpertiseNodeData>)}
                />
              </Grid>
            ))}
          </Grid>

          {onGoToExpertises && (
            <Box sx={{
              mt: 4, p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
              bgcolor: `${TEAL}08`, border: `1px solid ${TEAL}30`, borderRadius: 2,
            }}>
              <AutoAwesomeOutlined sx={{ color: TEAL, fontSize: 28, flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEAL }}>
                  Étape suivante : vos expertises
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Déclinez vos thèmes de recherche en fiches expertises adaptées à chaque public
                  (chercheurs, industriels, journalistes, grand public).
                </Typography>
              </Box>
              <Button variant="contained" onClick={onGoToExpertises}
                sx={{ textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0, bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' } }}>
                Générer mes expertises →
              </Button>
            </Box>
          )}
        </>
      )}

      <AddThemeDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddTheme} />

      <AddThemeDialog
        open={Boolean(editingNode)}
        onClose={() => setEditingNode(null)}
        onAdd={handleEditTheme}
        initial={editingNode ? {
          label: (editingNode.data as ExpertiseNodeData).label,
          description: (editingNode.data as ExpertiseNodeData).description ?? '',
          attributes: {
            temporal: (editingNode.data as ExpertiseNodeData).temporal,
            geographic: (editingNode.data as ExpertiseNodeData).geographic,
            persons: (editingNode.data as ExpertiseNodeData).persons,
            organizations: (editingNode.data as ExpertiseNodeData).organizations,
            concepts: (editingNode.data as ExpertiseNodeData).concepts,
          },
        } : undefined}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer ce thème ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le thème <strong>« {deleteTarget ? (deleteTarget.data as ExpertiseNodeData).label : ''} »</strong> sera
            retiré de vos thèmes de recherche, ainsi que ses relations avec les autres thèmes.
            Les fiches expertises déjà générées ne seront pas supprimées.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: 'none' }}>Annuler</Button>
          <Button variant="contained" color="error" startIcon={<DeleteOutline />} onClick={handleDeleteTheme}
            sx={{ textTransform: 'none' }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar('')} sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  )
}
