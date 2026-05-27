'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  Panel,
  Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  useMediaQuery,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  AccountTree,
  Add,
  AutoAwesome,
  ChevronLeft,
  ChevronRight,
  Close,
  Delete,
  Download,
  Edit,
  ExpandMore,
  RestartAlt,
  Save,
  Timeline,
} from '@mui/icons-material'
import ExpertiseNode from './ExpertiseNode'
import RelationEdge from './RelationEdge'
import { generateGraphFromPrompt } from './mockLlm'
import {
  ExpertiseGraph,
  ExpertiseNodeData,
  ExpertiseNodeType,
  INITIAL_GRAPH,
  NODE_TYPE_CONFIG,
  RELATION_CATEGORIES,
  RELATION_TYPES,
  RelationTypeKey,
} from '../../types'

const STORAGE_KEY = 'expertise-graph-v1'
const TEAL = '#006A61'
const DRAWER_WIDTH = 320

const ESSENTIAL_RELATIONS: RelationTypeKey[] = ['approfondit', 'specialise', 'terrain_geo', 'mobilise', 'croise']
const ADVANCED_COUNT = Object.keys(RELATION_TYPES).length - ESSENTIAL_RELATIONS.length

const EXAMPLE_PROMPTS: Record<string, string> = {
  Sociologue: "Je suis sociologue spécialisé·e dans les migrations de travail et les inégalités de genre. Mes recherches portent sur les dynamiques identitaires et les politiques migratoires entre l'Asie du Sud et le Moyen-Orient.",
  Historien: "Je suis historien·ne médiéviste. Mes travaux portent sur les pratiques religieuses monastiques, les échanges culturels entre l'Europe occidentale et Byzance, et l'histoire des manuscrits enluminés.",
  Physicien: "Je suis physicien·ne spécialisé·e en physique des matériaux. Mes recherches portent sur les propriétés optiques des matériaux bidimensionnels et leurs applications en optoélectronique.",
  Juriste: "Je suis juriste spécialisé·e en droit européen et droits numériques. Mes travaux portent sur la régulation des plateformes, la protection des données personnelles et les libertés fondamentales en ligne.",
}

function loadGraph(): ExpertiseGraph {
  if (typeof window === 'undefined') return INITIAL_GRAPH
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ExpertiseGraph
  } catch (_e) { /* ignore parse errors */ }
  return INITIAL_GRAPH
}

function saveGraph(graph: ExpertiseGraph) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(graph))
}

interface NodeDialogState {
  open: boolean
  mode: 'add' | 'edit'
  nodeId?: string
  label: string
  nodeType: ExpertiseNodeType
  description: string
}

const DEFAULT_DIALOG: NodeDialogState = {
  open: false, mode: 'add', label: '', nodeType: 'concept', description: '',
}

function applyRelationStyle(edge: Edge): Edge {
  const relationType = (edge.data?.relationType ?? 'croise') as RelationTypeKey
  const cfg = RELATION_TYPES[relationType] ?? RELATION_TYPES.croise
  return {
    ...edge,
    type: 'relationEdge',
    animated: cfg.animated ?? false,
    label: undefined, // label handled by custom component
  }
}

export default function MindMapView() {
  const initialGraph = loadGraph()

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialGraph.edges.map(applyRelationStyle),
  )
  const [meta, setMeta] = useState(initialGraph.meta)

  const isMobile = useMediaQuery('(max-width: 899px)')
  const [drawerOpen, setDrawerOpen] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth >= 900 : true,
  )
  const [drawerTab, setDrawerTab] = useState<'graph' | 'edge'>('graph')
  const [legendOpen, setLegendOpen] = useState(false)
  const [advancedRelationsOpen, setAdvancedRelationsOpen] = useState(false)

  // Ferme le drawer automatiquement quand on passe en mobile
  useEffect(() => {
    if (isMobile) setDrawerOpen(false)
  }, [isMobile])
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [nodeDialog, setNodeDialog] = useState<NodeDialogState>(DEFAULT_DIALOG)
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: 'success' | 'info' }>({
    open: false, msg: '', severity: 'success',
  })
  const [jsonOpen, setJsonOpen] = useState(false)

  const nodeTypes = useMemo(() => ({ expertiseNode: ExpertiseNode }), [])
  const edgeTypes = useMemo(() => ({ relationEdge: RelationEdge }), [])

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null
  const selectedEdgeType = (selectedEdge?.data?.relationType ?? 'croise') as RelationTypeKey

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          applyRelationStyle({ ...connection, id: `e${Date.now()}`, data: { relationType: 'croise' } }),
          eds,
        ),
      ),
    [setEdges],
  )

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id)
    setDrawerTab('edge')
    setDrawerOpen(true)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null)
    if (drawerTab === 'edge') setDrawerTab('graph')
  }, [drawerTab])

  const handleChangeRelationType = (relationType: RelationTypeKey) => {
    if (!selectedEdgeId) return
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedEdgeId
          ? applyRelationStyle({ ...e, data: { ...e.data, relationType } })
          : e,
      ),
    )
  }

  const handleSave = useCallback(() => {
    const graph: ExpertiseGraph = { nodes, edges, meta }
    saveGraph(graph)
    setSnackbar({ open: true, msg: 'Carte enregistrée', severity: 'success' })
  }, [nodes, edges, meta])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const result = await generateGraphFromPrompt(prompt, meta)
      setNodes(result.nodes)
      setEdges(result.edges.map(applyRelationStyle))
      setMeta(result.meta)
      setPrompt('')
      setSnackbar({ open: true, msg: 'Graphe généré — vous pouvez le modifier', severity: 'info' })
    } finally {
      setGenerating(false)
    }
  }

  const handleOpenAddNode = () => setNodeDialog({ ...DEFAULT_DIALOG, open: true, mode: 'add' })

  const handleOpenEditNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    const data = node.data as ExpertiseNodeData
    setNodeDialog({ open: true, mode: 'edit', nodeId, label: data.label, nodeType: data.nodeType, description: data.description || '' })
  }

  const handleDeleteSelectedNodes = () => {
    setNodes((nds) => nds.filter((n) => !n.selected))
    setEdges((eds) => eds.filter((e) => !e.selected))
    setSelectedEdgeId(null)
  }

  const handleDeleteSelectedEdge = () => {
    if (!selectedEdgeId) return
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId))
    setSelectedEdgeId(null)
    setDrawerTab('graph')
  }

  const handleReset = useCallback(() => {
    setNodes([])
    setEdges([])
    setMeta({ version: 1, lastUpdated: new Date().toISOString().split('T')[0], promptHistory: [] })
    localStorage.removeItem(STORAGE_KEY)
    setSelectedEdgeId(null)
    setDrawerTab('graph')
  }, [setNodes, setEdges])

  const handleSaveNodeDialog = () => {
    if (!nodeDialog.label.trim()) return
    if (nodeDialog.mode === 'add') {
      setNodes((nds) => [
        ...nds,
        {
          id: `n${Date.now()}`,
          type: 'expertiseNode' as const,
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
          data: { label: nodeDialog.label, nodeType: nodeDialog.nodeType, description: nodeDialog.description },
        },
      ])
    } else if (nodeDialog.nodeId) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeDialog.nodeId
            ? { ...n, data: { ...n.data, label: nodeDialog.label, nodeType: nodeDialog.nodeType, description: nodeDialog.description } }
            : n,
        ),
      )
    }
    setNodeDialog(DEFAULT_DIALOG)
  }

  const selectedNodes = nodes.filter((n) => n.selected)
  const graphJson = JSON.stringify({ nodes, edges, meta }, null, 2)
  const lastPrompt = meta.promptHistory[meta.promptHistory.length - 1]

  // ── Empty state onboarding ────────────────────────────────────────────

  const renderEmptyState = () => (
    <Box sx={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#f8fafb',
      backgroundImage: 'radial-gradient(circle, #c8d8d6 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>
      <Box sx={{
        bgcolor: 'background.paper', borderRadius: 3,
        border: '1px solid', borderColor: 'divider',
        p: { xs: 3, sm: 4 }, maxWidth: 520, width: '90%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column', gap: 2.5,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <AccountTree sx={{ fontSize: 52, color: TEAL, opacity: 0.8 }} />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
            Décrivez vos domaines de recherche
          </Typography>
          <Typography variant="body2" color="text.secondary">
            En quelques phrases, l&apos;IA construira votre carte d&apos;expertise que vous pourrez ensuite modifier librement.
          </Typography>
        </Box>

        <TextField
          multiline rows={6} fullWidth autoFocus
          placeholder="Ex : Je suis spécialiste des migrations de travail entre le Sri Lanka et le Moyen-Orient. Mes recherches portent sur le genre, l'identité et les politiques migratoires…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={generating}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate() }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Exemples de profils :
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(EXAMPLE_PROMPTS).map(([label, text]) => (
              <Chip
                key={label} label={label} size="small" variant="outlined"
                onClick={() => setPrompt(text)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: `${TEAL}10`, borderColor: TEAL, color: TEAL } }}
              />
            ))}
          </Box>
        </Box>

        <Button
          variant="contained" size="large"
          startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none', py: 1.25, borderRadius: 2 }}
        >
          {generating ? 'Construction de la carte…' : 'Générer ma carte'}
        </Button>
      </Box>
    </Box>
  )

  // ── Helpers partagés ──────────────────────────────────────────────────

  const renderAddNodeButton = () => (
    <Button
      variant="outlined" startIcon={<Add />} onClick={handleOpenAddNode} size="small" fullWidth
      sx={{ textTransform: 'none', justifyContent: 'flex-start', borderColor: TEAL, color: TEAL }}
    >
      Ajouter un nœud
    </Button>
  )

  const renderStats = () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip size="small" label={`${nodes.length} nœuds`} sx={{ bgcolor: `${TEAL}15`, color: TEAL }} />
      <Chip size="small" label={`${edges.length} liens`} sx={{ bgcolor: `${TEAL}15`, color: TEAL }} />
      <Chip size="small" label={`v${meta.version}`} variant="outlined" />
    </Box>
  )

  const renderLegend = () => (
    <Accordion
      disableGutters elevation={0} expanded={legendOpen}
      onChange={(_, v) => setLegendOpen(v)}
      sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent' }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore fontSize="small" />}
        sx={{ px: 0, minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Légende
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pb: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Types de nœuds */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Types de nœuds
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {(Object.entries(NODE_TYPE_CONFIG) as [ExpertiseNodeType, typeof NODE_TYPE_CONFIG[ExpertiseNodeType]][]).map(
              ([type, cfg]) => (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', flexShrink: 0, border: `2px solid ${cfg.color}`, bgcolor: cfg.bg }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</Typography>
                </Box>
              ),
            )}
          </Box>
        </Box>
        {/* Types de liens */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Types de liens
          </Typography>
          {/* Essentiels — toujours visibles */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {ESSENTIAL_RELATIONS.map((key) => {
              const c = RELATION_TYPES[key]
              return (
                <Chip key={key} label={c.label} size="small"
                  sx={{ fontSize: '0.6rem', height: 20, bgcolor: `${c.color}12`, color: c.color, border: `1px solid ${c.color}44` }}
                />
              )
            })}
          </Box>
          {/* Toggle relations avancées */}
          <Box
            onClick={() => setAdvancedRelationsOpen((v) => !v)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: 'text.secondary', userSelect: 'none' }}
          >
            <ExpandMore sx={{ fontSize: 14, transition: 'transform 0.2s', transform: advancedRelationsOpen ? 'rotate(180deg)' : 'none' }} />
            <Typography variant="caption">Relations avancées ({ADVANCED_COUNT})</Typography>
          </Box>
          {advancedRelationsOpen && (
            <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {RELATION_CATEGORIES.map((cat) => {
                const entries = (Object.entries(RELATION_TYPES) as [RelationTypeKey, typeof RELATION_TYPES[RelationTypeKey]][])
                  .filter(([key, v]) => v.category === cat && !ESSENTIAL_RELATIONS.includes(key as RelationTypeKey))
                if (!entries.length) return null
                const color = entries[0]?.[1].color
                return (
                  <Box key={cat}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color, display: 'block', mb: 0.4 }}>{cat}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {entries.map(([key, c]) => (
                        <Chip key={key} label={c.label} size="small"
                          sx={{ fontSize: '0.6rem', height: 20, bgcolor: `${c.color}12`, color: c.color, border: `1px solid ${c.color}44` }}
                        />
                      ))}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )

  // ── Panel gauche — 3 états contextuels ────────────────────────────────

  const renderDrawerContent = () => {
    // État 3 : lien sélectionné
    if (drawerTab === 'edge' && selectedEdge) {
      const cfg = RELATION_TYPES[selectedEdgeType]
      return (
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline sx={{ color: cfg.color, fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cfg.color }}>
              Type de relation
            </Typography>
            <IconButton size="small" sx={{ ml: 'auto' }} onClick={() => { setSelectedEdgeId(null); setDrawerTab('graph') }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ bgcolor: `${cfg.color}15`, border: `1px solid ${cfg.color}55`, borderRadius: 1, p: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Relation actuelle</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
            <Typography variant="caption" color="text.secondary">{cfg.category}</Typography>
          </Box>

          {RELATION_CATEGORIES.map((cat) => {
            const entries = (Object.entries(RELATION_TYPES) as [RelationTypeKey, typeof RELATION_TYPES[RelationTypeKey]][])
              .filter(([, v]) => v.category === cat)
            return (
              <Box key={cat}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                  {cat}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {entries.map(([key, c]) => (
                    <Box
                      key={key}
                      onClick={() => handleChangeRelationType(key)}
                      sx={{
                        px: 1.5, py: 0.8, borderRadius: 1,
                        border: `1.5px solid ${selectedEdgeType === key ? c.color : 'transparent'}`,
                        bgcolor: selectedEdgeType === key ? `${c.color}15` : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
                        '&:hover': { bgcolor: `${c.color}10` },
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <Box sx={{ width: 28, height: 4, flexShrink: 0 }}>
                        <svg width="28" height="4">
                          <line x1="0" y1="2" x2="28" y2="2"
                            stroke={c.color} strokeWidth="2"
                            strokeDasharray={c.strokeDasharray ?? undefined}
                          />
                        </svg>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: selectedEdgeType === key ? 700 : 400, color: c.color }}>
                        {c.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )
          })}

          <Divider />
          <Button variant="outlined" color="error" startIcon={<Delete />} size="small"
            onClick={handleDeleteSelectedEdge} sx={{ textTransform: 'none' }}
          >
            Supprimer ce lien
          </Button>
        </Box>
      )
    }

    // État 2 : nœud(s) sélectionné(s)
    if (selectedNodes.length > 0) {
      const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null
      const singleData = singleNode ? (singleNode.data as ExpertiseNodeData) : null
      const singleCfg = singleData ? NODE_TYPE_CONFIG[singleData.nodeType] : null

      return (
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {singleNode && singleData && singleCfg ? (
            /* Carte info — nœud unique */
            <Box sx={{ border: `1.5px solid ${singleCfg.color}`, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: singleCfg.bg, borderBottom: `1px solid ${singleCfg.color}44`, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: singleCfg.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: singleCfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {singleCfg.label}
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: singleData.description ? 0.5 : 0 }}>
                  {singleData.label}
                </Typography>
                {singleData.description && (
                  <Typography variant="caption" color="text.secondary">{singleData.description}</Typography>
                )}
              </Box>
            </Box>
          ) : (
            /* Sélection multiple */
            <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                {selectedNodes.length} nœuds sélectionnés
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(Object.entries(
                  selectedNodes.reduce((acc, n) => {
                    const t = (n.data as ExpertiseNodeData).nodeType
                    acc[t] = (acc[t] ?? 0) + 1
                    return acc
                  }, {} as Record<string, number>),
                ) as [ExpertiseNodeType, number][]).map(([type, count]) => {
                  const cfg = NODE_TYPE_CONFIG[type]
                  return (
                    <Chip key={type} size="small"
                      label={`${count} ${cfg.label}`}
                      sx={{ bgcolor: `${cfg.color}15`, color: cfg.color, fontSize: '0.65rem', height: 20 }}
                    />
                  )
                })}
              </Box>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {singleNode && (
              <Button variant="outlined" startIcon={<Edit />} size="small"
                onClick={() => handleOpenEditNode(singleNode.id)}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                Modifier
              </Button>
            )}
            <Button variant="outlined" color="error" startIcon={<Delete />} size="small"
              onClick={handleDeleteSelectedNodes}
              sx={{ flex: singleNode ? 1 : undefined, textTransform: 'none', ...(singleNode ? {} : { width: '100%' }) }}
            >
              Supprimer{selectedNodes.length > 1 ? ` (${selectedNodes.length})` : ''}
            </Button>
          </Box>

          <Divider />
          {renderAddNodeButton()}
          <Divider />
          {renderLegend()}
          <Divider />
          {renderStats()}
        </Box>
      )
    }

    // État 1 : rien de sélectionné — prompt LLM en action principale
    return (
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Prompt LLM */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: TEAL }}>
            Décrire mes expertises
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Décrivez vos domaines en langage naturel. L&apos;IA génèrera un graphe que vous pourrez modifier.
          </Typography>
          <TextField
            multiline rows={5} fullWidth size="small"
            placeholder="Ex : Je suis spécialiste des migrations pour le travail entre le Sri Lanka et le Moyen-Orient. Mes recherches portent sur le genre, l'identité et les politiques migratoires…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
            sx={{ mb: 1.5 }}
          />
          <Button
            fullWidth variant="contained" size="medium"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none', py: 1 }}
          >
            {generating ? 'Génération en cours…' : 'Générer le graphe'}
          </Button>
        </Box>

        {lastPrompt && (
          <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Dernier prompt ({meta.promptHistory.length} itération{meta.promptHistory.length > 1 ? 's' : ''})
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {lastPrompt.length > 120 ? `${lastPrompt.slice(0, 120)}…` : lastPrompt}
            </Typography>
          </Box>
        )}

        <Divider />
        {renderAddNodeButton()}
        <Divider />
        {renderLegend()}
        <Divider />
        {renderStats()}
      </Box>
    )
  }

  const isEmpty = nodes.length === 0

  // Couleurs uniques utilisées par les types de relations
  const ARROW_COLORS = ['#006A61', '#E65100', '#7B1FA2', '#1976D2', '#C62828']

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 112px)', position: 'relative', overflow: 'hidden' }}>

      {/* Marqueurs SVG pour les flèches des arêtes */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {ARROW_COLORS.map((color) => (
            <marker
              key={color}
              id={`arrow-${color.replace('#', '')}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto-start-reverse"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          ))}
        </defs>
      </svg>

      {/* Empty state — affiché à la place du canvas quand aucun nœud */}
      {isEmpty && renderEmptyState()}

      {/* Canvas + panneau gauche — masqués quand vide */}
      {!isEmpty && (
        <>
          {/* Left drawer — overlay sur mobile, inline sur desktop */}
          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              // Sur desktop : prend de la place dans le flex layout
              ...(!isMobile && { width: drawerOpen ? DRAWER_WIDTH : 0, flexShrink: 0 }),
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                overflowY: 'auto',
                boxSizing: 'border-box',
                // Sur desktop : positionné dans le flux (pas de position fixed)
                ...(!isMobile && {
                  position: 'relative',
                  height: '100%',
                  border: 'none',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }),
              },
            }}
          >
            {renderDrawerContent()}
          </Drawer>

          {/* Toggle drawer — caché sur mobile quand le drawer overlay est ouvert */}
          {!(isMobile && drawerOpen) && (
            <Box sx={{
              position: 'absolute',
              left: !isMobile && drawerOpen ? DRAWER_WIDTH - 1 : 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
            }}>
              <IconButton
                onClick={() => setDrawerOpen((v) => !v)}
                size="small"
                sx={{
                  bgcolor: 'white',
                  border: '1px solid', borderColor: 'divider',
                  borderRadius: isMobile ? '50%' : '0 6px 6px 0',
                  boxShadow: isMobile ? 2 : 0,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                {drawerOpen ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
              </IconButton>
            </Box>
          )}

          {/* React Flow canvas */}
          <Box sx={{ flex: 1, height: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              defaultEdgeOptions={{ type: 'relationEdge' }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const data = node.data as ExpertiseNodeData
                  return NODE_TYPE_CONFIG[data.nodeType]?.color ?? '#94a3b8'
                }}
                style={{ bottom: 60 }}
              />

              <Panel position="top-right">
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'white', p: 1, borderRadius: 2, boxShadow: 2 }}>
                  <Tooltip title="Enregistrer">
                    <Button
                      size="small" variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}
                    >
                      Enregistrer
                    </Button>
                  </Tooltip>
                  <Tooltip title="Voir / exporter le JSON">
                    <Button
                      size="small" variant="outlined"
                      startIcon={<Download />}
                      onClick={() => setJsonOpen(true)}
                      sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}
                    >
                      JSON
                    </Button>
                  </Tooltip>
                  <Tooltip title="Réinitialiser la carte">
                    <IconButton size="small" onClick={handleReset} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                      <RestartAlt fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Panel>

              {!isMobile && (
                <Panel position="bottom-center">
                  <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.85)', px: 1.5, py: 0.5, borderRadius: 2, color: 'text.secondary' }}>
                    Glissez les nœuds · Tirez depuis un point d&apos;ancrage pour créer un lien · Cliquez sur un lien pour changer son type
                  </Typography>
                </Panel>
              )}
            </ReactFlow>
          </Box>
        </>
      )}


      {/* Dialog — add / edit node */}
      <Dialog open={nodeDialog.open} onClose={() => setNodeDialog(DEFAULT_DIALOG)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {nodeDialog.mode === 'add' ? 'Ajouter un nœud' : 'Modifier le nœud'}
          <IconButton size="small" onClick={() => setNodeDialog(DEFAULT_DIALOG)}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Intitulé" fullWidth size="small" value={nodeDialog.label}
            onChange={(e) => setNodeDialog((s) => ({ ...s, label: e.target.value }))} autoFocus />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={nodeDialog.nodeType}
              onChange={(e) => setNodeDialog((s) => ({ ...s, nodeType: e.target.value as ExpertiseNodeType }))}
            >
              {(Object.entries(NODE_TYPE_CONFIG) as [ExpertiseNodeType, typeof NODE_TYPE_CONFIG[ExpertiseNodeType]][]).map(
                ([type, cfg]) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '2px', border: `2px solid ${cfg.color}`, bgcolor: cfg.bg }} />
                      {cfg.label}
                    </Box>
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          <TextField label="Description (optionnelle)" fullWidth size="small" multiline rows={2}
            value={nodeDialog.description}
            onChange={(e) => setNodeDialog((s) => ({ ...s, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialog(DEFAULT_DIALOG)} sx={{ textTransform: 'none' }}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveNodeDialog} disabled={!nodeDialog.label.trim()}
            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}
          >
            {nodeDialog.mode === 'add' ? 'Ajouter' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog — JSON viewer */}
      <Dialog open={jsonOpen} onClose={() => setJsonOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Graphe JSON — v{meta.version}
          <IconButton size="small" onClick={() => setJsonOpen(false)}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Ce fichier JSON s&apos;enrichit à chaque itération.
          </Typography>
          <Box component="pre"
            sx={{ bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, fontSize: '0.75rem', overflow: 'auto', maxHeight: 400, fontFamily: 'monospace' }}
          >
            {graphJson}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Download />} sx={{ textTransform: 'none' }}
            onClick={() => {
              const blob = new Blob([graphJson], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `expertise-graph-v${meta.version}.json`; a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Télécharger
          </Button>
          <Button onClick={() => setJsonOpen(false)} sx={{ textTransform: 'none' }}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
