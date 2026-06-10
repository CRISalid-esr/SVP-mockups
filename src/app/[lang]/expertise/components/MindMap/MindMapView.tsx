'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ReactFlow, Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, Connection, BackgroundVariant, Panel, Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button,
  Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Drawer, FormControl, IconButton, InputLabel, MenuItem,
  Select, Snackbar, TextField, Tooltip, Typography, useMediaQuery,
} from '@mui/material'
import {
  AccountTree, Add, ArrowBack, AutoAwesome, AutoGraph, Business, ChevronLeft, ChevronRight,
  Close, Delete, Download, Edit, ExpandMore, LocalOffer, Person, Place,
  RestartAlt, Save, Schedule,
} from '@mui/icons-material'
import ExpertiseNode from './ExpertiseNode'
import RelationEdge from './RelationEdge'
import { generateGraphFromPrompt, generateGraphFromPublications } from './mockLlm'
import {
  AttributeCategory,
  CONTROLLED_VOCABULARIES,
  EdgeData, EdgeDirection,
  ExpertiseGraph, ExpertiseNodeData, ExpertiseNodeType,
  INITIAL_GRAPH, NODE_TYPE_CONFIG,
} from '../../types'

const STORAGE_KEY_PREFIX = 'expertise-graph-v2'
const PUBS_KEY_PREFIX = 'expertise-selected-publications'
const TEAL = '#006A61'

function getPerspective(): string {
  if (typeof window === 'undefined') return 'default'
  return new URLSearchParams(window.location.search).get('perspective') || 'default'
}

const EMPTY_GRAPH: ExpertiseGraph = {
  nodes: [],
  edges: [],
  meta: { version: 1, lastUpdated: new Date().toISOString().split('T')[0], promptHistory: [] },
}
const DRAWER_WIDTH = 320

const ATTR_CONFIG: Array<{
  key: AttributeCategory
  label: string
  Icon: React.ElementType
  color: string
  placeholder: string
  showVocab?: boolean
}> = [
  { key: 'temporal', label: 'Couverture temporelle', Icon: Schedule, color: '#0288D1', placeholder: "Ex : 2005 — aujourd'hui, XIXe siècle…" },
  { key: 'geographic', label: 'Lieux', Icon: Place, color: '#388E3C', placeholder: 'Ex : France, Afrique subsaharienne…' },
  { key: 'persons', label: 'Personnes', Icon: Person, color: '#7B1FA2', placeholder: 'Ex : Arjun Appadurai, Michel Foucault…' },
  { key: 'organizations', label: 'Organisations', Icon: Business, color: '#E65100', placeholder: 'Ex : OIT, UNESCO, CNRS…' },
  { key: 'concepts', label: 'Concepts et mots-clés', Icon: LocalOffer, color: TEAL, placeholder: 'Ex : migration du travail, genre…', showVocab: true },
]

const EXAMPLE_PROMPTS: Record<string, string> = {
  Sociologue: "Je suis sociologue spécialisé·e dans les migrations de travail et les inégalités de genre. Mes recherches portent sur les dynamiques identitaires et les politiques migratoires entre l'Asie du Sud et le Moyen-Orient.",
  Historien: "Je suis historien·ne médiéviste. Mes travaux portent sur les pratiques religieuses monastiques, les échanges culturels entre l'Europe occidentale et Byzance, et l'histoire des manuscrits enluminés.",
  Physicien: "Je suis physicien·ne spécialisé·e en physique des matériaux. Mes recherches portent sur les propriétés optiques des matériaux bidimensionnels et leurs applications en optoélectronique.",
  Juriste: "Je suis juriste spécialisé·e en droit européen et droits numériques. Mes travaux portent sur la régulation des plateformes, la protection des données personnelles et les libertés fondamentales en ligne.",
}

function applyEdgeStyle(edge: Edge): Edge {
  return { ...edge, type: 'relationEdge', animated: false }
}

function loadGraph(key: string): ExpertiseGraph {
  if (typeof window === 'undefined') return EMPTY_GRAPH
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as ExpertiseGraph
  } catch (_e) { /* ignore */ }
  return EMPTY_GRAPH
}

function saveGraph(key: string, graph: ExpertiseGraph) {
  localStorage.setItem(key, JSON.stringify(graph))
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
  open: false, mode: 'add', label: '', nodeType: 'expertise', description: '',
}

export default function MindMapView() {
  const [perspective] = useState(() => getPerspective())
  const storageKey = `${STORAGE_KEY_PREFIX}-${perspective}`
  const pubsKey = `${PUBS_KEY_PREFIX}-${perspective}`

  const [initialGraph] = useState(() => loadGraph(storageKey))

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialGraph.edges.map(applyEdgeStyle),
  )
  const [meta, setMeta] = useState(initialGraph.meta)

  const isMobile = useMediaQuery('(max-width: 899px)')
  const [drawerOpen, setDrawerOpen] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth >= 900 : true,
  )
  const [drawerTab, setDrawerTab] = useState<'graph' | 'edge'>('graph')
  const [legendOpen, setLegendOpen] = useState(false)

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

  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || 'fr'

  const [selectedPubs, setSelectedPubs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(pubsKey)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [showManualInput, setShowManualInput] = useState(false)

  // Attribute inline-add state
  const [addingCat, setAddingCat] = useState<AttributeCategory | null>(null)
  const [addingForNodeId, setAddingForNodeId] = useState<string | null>(null)
  const [addingLabel, setAddingLabel] = useState('')
  const [addingVocab, setAddingVocab] = useState('')

  const nodeTypes = useMemo(() => ({ expertiseNode: ExpertiseNode }), [])
  const edgeTypes = useMemo(() => ({ relationEdge: RelationEdge }), [])

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null
  const selectedEdgeData = (selectedEdge?.data ?? {}) as EdgeData

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          applyEdgeStyle({
            ...connection,
            id: `e${Date.now()}`,
            data: { direction: 'forward' as EdgeDirection, label: '' },
          }),
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

  const handleChangeEdgeData = useCallback((updates: Partial<EdgeData>) => {
    if (!selectedEdgeId) return
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedEdgeId
          ? applyEdgeStyle({ ...e, data: { ...e.data, ...updates } })
          : e,
      ),
    )
  }, [selectedEdgeId, setEdges])

  const handleSave = useCallback(() => {
    saveGraph(storageKey, { nodes, edges, meta })
    setSnackbar({ open: true, msg: 'Carte enregistrée', severity: 'success' })
  }, [storageKey, nodes, edges, meta])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const result = await generateGraphFromPrompt(prompt, meta)
      setNodes(result.nodes)
      setEdges(result.edges.map(applyEdgeStyle))
      setMeta(result.meta)
      setPrompt('')
      setSnackbar({ open: true, msg: 'Graphe généré — vous pouvez le modifier', severity: 'info' })
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateFromPublications = async () => {
    setGenerating(true)
    try {
      const result = await generateGraphFromPublications(selectedPubs.length, meta)
      setNodes(result.nodes)
      setEdges(result.edges.map(applyEdgeStyle))
      setMeta(result.meta)
      saveGraph(storageKey, result)
      setSnackbar({ open: true, msg: 'Carte générée depuis vos publications — affinez-la via le chatbot', severity: 'info' })
    } finally {
      setGenerating(false)
    }
  }

  const handleOpenAddNode = () => {
    setAddingCat(null)
    setNodeDialog({ ...DEFAULT_DIALOG, open: true, mode: 'add' })
  }

  const handleOpenEditNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    const d = node.data as ExpertiseNodeData
    setAddingCat(null)
    setNodeDialog({ open: true, mode: 'edit', nodeId, label: d.label, nodeType: d.nodeType, description: d.description || '' })
  }

  const handleDeleteSelectedNodes = () => {
    setNodes((nds) => nds.filter((n) => !n.selected))
    setEdges((eds) => eds.filter((e) => !e.selected))
    setSelectedEdgeId(null)
    setAddingCat(null)
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
    setMeta({ version: 2, lastUpdated: new Date().toISOString().split('T')[0], promptHistory: [] })
    localStorage.removeItem(storageKey)
    setSelectedEdgeId(null)
    setDrawerTab('graph')
    setAddingCat(null)
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
          data: { label: nodeDialog.label, nodeType: 'expertise' as ExpertiseNodeType, description: nodeDialog.description },
        },
      ])
    } else if (nodeDialog.nodeId) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeDialog.nodeId
            ? { ...n, data: { ...n.data, label: nodeDialog.label, description: nodeDialog.description } }
            : n,
        ),
      )
    }
    setNodeDialog(DEFAULT_DIALOG)
  }

  // ── Attribute handlers ────────────────────────────────────────────────

  const openAddAttr = (nodeId: string, cat: AttributeCategory) => {
    setAddingCat(cat)
    setAddingForNodeId(nodeId)
    setAddingLabel('')
    setAddingVocab('')
  }

  const cancelAddAttr = () => {
    setAddingCat(null)
    setAddingForNodeId(null)
    setAddingLabel('')
    setAddingVocab('')
  }

  const confirmAddAttr = (nodeId: string, cat: AttributeCategory) => {
    if (!addingLabel.trim()) return
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      const d = n.data as ExpertiseNodeData
      const current = (d[cat] ?? []) as unknown[]
      const item = cat === 'concepts'
        ? { label: addingLabel.trim(), ...(addingVocab ? { vocabulary: addingVocab } : {}) }
        : { label: addingLabel.trim() }
      return { ...n, data: { ...d, [cat]: [...current, item] } }
    }))
    cancelAddAttr()
  }

  const removeAttr = (nodeId: string, cat: AttributeCategory, idx: number) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      const d = n.data as ExpertiseNodeData
      const current = [...((d[cat] ?? []) as unknown[])]
      current.splice(idx, 1)
      return { ...n, data: { ...d, [cat]: current } }
    }))
  }

  // ── Render helpers ────────────────────────────────────────────────────

  const selectedNodes = nodes.filter((n) => n.selected)
  const graphJson = JSON.stringify({ nodes, edges, meta }, null, 2)
  const lastPrompt = meta.promptHistory[meta.promptHistory.length - 1]

  const renderAddNodeButton = () => (
    <Button
      variant="outlined" startIcon={<Add />} onClick={handleOpenAddNode} size="small" fullWidth
      sx={{ textTransform: 'none', justifyContent: 'flex-start', borderColor: TEAL, color: TEAL }}
    >
      Ajouter une expertise
    </Button>
  )

  const renderStats = () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip size="small" label={`${nodes.length} expertise${nodes.length > 1 ? 's' : ''}`} sx={{ bgcolor: `${TEAL}15`, color: TEAL }} />
      <Chip size="small" label={`${edges.length} lien${edges.length > 1 ? 's' : ''}`} sx={{ bgcolor: `${TEAL}15`, color: TEAL }} />
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
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Nœuds
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', flexShrink: 0, border: `2px solid ${TEAL}`, bgcolor: NODE_TYPE_CONFIG.expertise.bg }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: TEAL }}>Expertise</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Liens
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <svg width="28" height="4"><line x1="0" y1="2" x2="28" y2="2" stroke={TEAL} strokeWidth="2" /></svg>
              <Typography variant="caption" color="text.secondary">Relation qualifiée</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <svg width="28" height="4"><line x1="0" y1="2" x2="28" y2="2" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 3" /></svg>
              <Typography variant="caption" color="text.secondary">Relation non qualifiée</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>A → B · A ← B · A ↔ B</Typography>
            </Box>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Caractéristiques
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {ATTR_CONFIG.map(({ key, label, Icon, color }) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ fontSize: 12, color, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )

  const renderAttributesPanel = (nodeId: string, nodeData: ExpertiseNodeData) => (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
        Caractéristiques
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {ATTR_CONFIG.map(({ key, label, Icon, color, placeholder, showVocab }) => {
          const items = (nodeData[key] ?? []) as Array<{ label: string; vocabulary?: string }>
          const isAdding = addingCat === key && addingForNodeId === nodeId
          return (
            <Box key={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: items.length > 0 || isAdding ? 0.75 : 0 }}>
                <Icon sx={{ fontSize: 13, color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color, flex: 1 }}>{label}</Typography>
                {!isAdding && (
                  <IconButton size="small" onClick={() => openAddAttr(nodeId, key)}
                    sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color } }}>
                    <Add sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
              {items.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: isAdding ? 0.75 : 0 }}>
                  {items.map((item, idx) => (
                    <Chip
                      key={idx}
                      label={item.vocabulary ? `${item.label} (${item.vocabulary})` : item.label}
                      size="small"
                      onDelete={() => removeAttr(nodeId, key, idx)}
                      sx={{
                        fontSize: '0.65rem', height: 20,
                        bgcolor: `${color}10`, color,
                        border: `1px solid ${color}33`,
                        '& .MuiChip-deleteIcon': { fontSize: 12, color: `${color}99`, '&:hover': { color } },
                      }}
                    />
                  ))}
                </Box>
              )}
              {isAdding && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pl: 0, pt: 0.5 }}>
                  <TextField
                    size="small" fullWidth autoFocus
                    placeholder={placeholder}
                    value={addingLabel}
                    onChange={(e) => setAddingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmAddAttr(nodeId, key)
                      if (e.key === 'Escape') cancelAddAttr()
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
                  />
                  {showVocab && (
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontSize: '0.8rem' }}>Vocabulaire (optionnel)</InputLabel>
                      <Select
                        label="Vocabulaire (optionnel)"
                        value={addingVocab}
                        onChange={(e) => setAddingVocab(e.target.value)}
                        sx={{ fontSize: '0.8rem' }}
                      >
                        <MenuItem value=""><em>Aucun</em></MenuItem>
                        {CONTROLLED_VOCABULARIES.map((v) => (
                          <MenuItem key={v.key} value={v.key} sx={{ fontSize: '0.8rem' }}>{v.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Button size="small" variant="contained"
                      disabled={!addingLabel.trim()}
                      onClick={() => confirmAddAttr(nodeId, key)}
                      sx={{ flex: 1, textTransform: 'none', fontSize: '0.75rem', bgcolor: color, '&:hover': { bgcolor: color }, filter: 'brightness(0.9)', py: 0.5 }}>
                      Ajouter
                    </Button>
                    <Button size="small" onClick={cancelAddAttr}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'text.secondary' }}>
                      Annuler
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )

  // ── Panneau gauche — 3 états contextuels ─────────────────────────────

  const renderDrawerContent = () => {
    // État 3 : lien sélectionné
    if (drawerTab === 'edge' && selectedEdge) {
      const direction = selectedEdgeData.direction ?? 'forward'
      const label = selectedEdgeData.label ?? ''
      const hasLabel = Boolean(label.trim())

      return (
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>Relation</Typography>
            <IconButton size="small" onClick={() => { setSelectedEdgeId(null); setDrawerTab('graph') }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Direction */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Direction
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['forward', 'bidirectional', 'backward'] as EdgeDirection[]).map((d) => (
                <Box
                  key={d}
                  onClick={() => handleChangeEdgeData({ direction: d })}
                  sx={{
                    flex: 1, textAlign: 'center', py: 1, borderRadius: 1, cursor: 'pointer',
                    border: `1.5px solid ${direction === d ? TEAL : '#e0e0e0'}`,
                    bgcolor: direction === d ? `${TEAL}12` : 'transparent',
                    '&:hover': { bgcolor: `${TEAL}08` },
                    transition: 'all 0.12s',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: direction === d ? 700 : 400, color: direction === d ? TEAL : 'text.secondary', fontFamily: 'monospace' }}>
                    {d === 'forward' ? 'A → B' : d === 'backward' ? 'A ← B' : 'A ↔ B'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Label */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Qualifier la relation
            </Typography>
            <TextField
              fullWidth size="small"
              placeholder="Ex : influence, prolonge, critique, s'appuie sur…"
              value={label}
              onChange={(e) => handleChangeEdgeData({ label: e.target.value })}
            />
            {!hasLabel && (
              <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', mt: 0.75 }}>
                Non qualifiée — la relation apparaît en pointillés gris
              </Typography>
            )}
          </Box>

          <Divider />
          <Button variant="outlined" color="error" startIcon={<Delete />} size="small"
            onClick={handleDeleteSelectedEdge} sx={{ textTransform: 'none' }}>
            Supprimer ce lien
          </Button>
        </Box>
      )
    }

    // État 2 : nœud(s) sélectionné(s)
    if (selectedNodes.length > 0) {
      const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null
      const singleData = singleNode ? (singleNode.data as ExpertiseNodeData) : null

      return (
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {singleNode && singleData ? (
            <Box sx={{ border: `1.5px solid ${TEAL}`, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: NODE_TYPE_CONFIG.expertise.bg, borderBottom: `1px solid ${TEAL}44`, px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Expertise
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
            <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedNodes.length} expertises sélectionnées
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            {singleNode && (
              <Button variant="outlined" startIcon={<Edit />} size="small"
                onClick={() => handleOpenEditNode(singleNode.id)}
                sx={{ flex: 1, textTransform: 'none' }}>
                Modifier
              </Button>
            )}
            <Button variant="outlined" color="error" startIcon={<Delete />} size="small"
              onClick={handleDeleteSelectedNodes}
              sx={{ flex: singleNode ? 1 : undefined, textTransform: 'none', ...(singleNode ? {} : { width: '100%' }) }}>
              Supprimer{selectedNodes.length > 1 ? ` (${selectedNodes.length})` : ''}
            </Button>
          </Box>

          {singleNode && singleData && (
            <>
              <Divider />
              {renderAttributesPanel(singleNode.id, singleData)}
            </>
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

    // État 1 : rien de sélectionné — prompt LLM en action principale
    return (
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        {!showManualInput ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <AutoGraph sx={{ fontSize: 52, color: TEAL, opacity: 0.85 }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                Calculez vos expertises à partir de vos publications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sélectionnez les publications à analyser, puis laissez l&apos;IA construire votre carte d&apos;expertise. Vous pourrez ensuite l&apos;affiner via le chatbot.
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
              bgcolor: selectedPubs.length > 0 ? `${TEAL}12` : '#f5f5f5',
              borderRadius: 2, minHeight: 44,
            }}>
              {selectedPubs.length > 0 ? (
                <>
                  <Chip
                    label={`${selectedPubs.length} publication${selectedPubs.length > 1 ? 's' : ''} sélectionnée${selectedPubs.length > 1 ? 's' : ''}`}
                    size="small"
                    sx={{ bgcolor: TEAL, color: 'white', fontWeight: 600 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    prête{selectedPubs.length > 1 ? 's' : ''} pour l&apos;analyse
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  Aucune publication sélectionnée pour l&apos;instant
                </Typography>
              )}
            </Box>

            <Button
              variant="outlined" fullWidth size="medium"
              onClick={() => router.push(`/${lang}/documents${perspective !== 'default' ? `?perspective=${perspective}` : ''}`)}
              sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL, borderRadius: 2 }}
            >
              Sélectionner des publications →
            </Button>

            <Button
              variant="contained" size="large" fullWidth
              startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
              onClick={handleGenerateFromPublications}
              disabled={selectedPubs.length === 0 || generating}
              sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none', py: 1.25, borderRadius: 2 }}
            >
              {generating ? 'Construction de la carte…' : 'Générer mes expertises'}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="caption" color="text.disabled">ou</Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            <Button
              size="small" variant="text"
              onClick={() => setShowManualInput(true)}
              sx={{ textTransform: 'none', color: 'text.secondary', alignSelf: 'center' }}
            >
              Décrire mes domaines manuellement
            </Button>
          </>
        ) : (
          <>
            <Button
              size="small" startIcon={<ArrowBack fontSize="small" />}
              onClick={() => setShowManualInput(false)}
              sx={{ textTransform: 'none', color: 'text.secondary', alignSelf: 'flex-start', mb: -1 }}
            >
              Retour
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                Décrivez vos domaines de recherche
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En quelques phrases, l&apos;IA construira votre carte d&apos;expertise que vous pourrez ensuite modifier librement.
              </Typography>
            </Box>
            <TextField
              multiline rows={5} fullWidth autoFocus
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
          </>
        )}
      </Box>
    </Box>
  )

  const isEmpty = nodes.length === 0
  const ARROW_COLORS = [TEAL, '#94a3b8']

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 112px)', position: 'relative', overflow: 'hidden' }}>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {ARROW_COLORS.map((color) => (
            <marker key={color} id={`arrow-${color.replace('#', '')}`}
              markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          ))}
        </defs>
      </svg>

      {isEmpty && renderEmptyState()}

      {!isEmpty && (
        <>
          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              ...(!isMobile && { width: drawerOpen ? DRAWER_WIDTH : 0, flexShrink: 0 }),
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH, overflowY: 'auto', boxSizing: 'border-box',
                ...(!isMobile && { position: 'relative', height: '100%', border: 'none', borderRight: '1px solid', borderColor: 'divider' }),
              },
            }}
          >
            {renderDrawerContent()}
          </Drawer>

          {!(isMobile && drawerOpen) && (
            <Box sx={{ position: 'absolute', left: !isMobile && drawerOpen ? DRAWER_WIDTH - 1 : 0, top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
              <IconButton
                onClick={() => setDrawerOpen((v) => !v)} size="small"
                sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: isMobile ? '50%' : '0 6px 6px 0', boxShadow: isMobile ? 2 : 0, '&:hover': { bgcolor: '#f5f5f5' } }}
              >
                {drawerOpen ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
              </IconButton>
            </Box>
          )}

          <Box sx={{ flex: 1, height: '100%' }}>
            <ReactFlow
              nodes={nodes} edges={edges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={onConnect} onEdgeClick={onEdgeClick} onPaneClick={onPaneClick}
              nodeTypes={nodeTypes} edgeTypes={edgeTypes}
              fitView fitViewOptions={{ padding: 0.2 }}
              defaultEdgeOptions={{ type: 'relationEdge' }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
              <Controls />
              <MiniMap
                nodeColor={() => TEAL}
                style={{ bottom: 60 }}
              />
              <Panel position="top-right">
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'white', p: 1, borderRadius: 2, boxShadow: 2 }}>
                  <Tooltip title="Enregistrer">
                    <Button size="small" variant="contained" startIcon={<Save />} onClick={handleSave}
                      sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}>
                      Enregistrer
                    </Button>
                  </Tooltip>
                  <Tooltip title="Voir / exporter le JSON">
                    <Button size="small" variant="outlined" startIcon={<Download />} onClick={() => setJsonOpen(true)}
                      sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
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
                    Glissez les nœuds · Tirez depuis un point d&apos;ancrage pour créer un lien · Cliquez sur un lien pour le qualifier
                  </Typography>
                </Panel>
              )}
            </ReactFlow>
          </Box>
        </>
      )}

      {/* Dialog — add / edit expertise */}
      <Dialog open={nodeDialog.open} onClose={() => setNodeDialog(DEFAULT_DIALOG)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {nodeDialog.mode === 'add' ? 'Ajouter une expertise' : "Modifier l'expertise"}
          <IconButton size="small" onClick={() => setNodeDialog(DEFAULT_DIALOG)}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Intitulé" fullWidth size="small" value={nodeDialog.label} autoFocus
            onChange={(e) => setNodeDialog((s) => ({ ...s, label: e.target.value }))} />
          <TextField label="Description (optionnelle)" fullWidth size="small" multiline rows={2}
            value={nodeDialog.description}
            onChange={(e) => setNodeDialog((s) => ({ ...s, description: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialog(DEFAULT_DIALOG)} sx={{ textTransform: 'none' }}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveNodeDialog} disabled={!nodeDialog.label.trim()}
            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}>
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
            sx={{ bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, fontSize: '0.75rem', overflow: 'auto', maxHeight: 400, fontFamily: 'monospace' }}>
            {graphJson}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Download />} sx={{ textTransform: 'none' }}
            onClick={() => {
              const blob = new Blob([graphJson], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `expertise-graph-v${meta.version}.json`; a.click()
              URL.revokeObjectURL(url)
            }}>
            Télécharger
          </Button>
          <Button onClick={() => setJsonOpen(false)} sx={{ textTransform: 'none' }}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
