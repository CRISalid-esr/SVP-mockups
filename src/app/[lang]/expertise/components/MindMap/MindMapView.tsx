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
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add,
  AutoAwesome,
  ChevronLeft,
  ChevronRight,
  Close,
  Delete,
  Download,
  Edit,
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

function loadGraph(): ExpertiseGraph {
  if (typeof window === 'undefined') return INITIAL_GRAPH
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ExpertiseGraph
  } catch {}
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

  const [drawerOpen, setDrawerOpen] = useState(true)
  const [drawerTab, setDrawerTab] = useState<'graph' | 'edge'>('graph')
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

  // Panel gauche — contenu selon onglet drawer
  const renderDrawerContent = () => {
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

          {/* Relation actuelle */}
          <Box sx={{ bgcolor: `${cfg.color}15`, border: `1px solid ${cfg.color}55`, borderRadius: 1, p: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Relation actuelle</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
            <Typography variant="caption" color="text.secondary">{cfg.category}</Typography>
          </Box>

          {/* Sélecteur par catégorie */}
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
                        px: 1.5, py: 0.8,
                        borderRadius: 1,
                        border: `1.5px solid ${selectedEdgeType === key ? c.color : 'transparent'}`,
                        bgcolor: selectedEdgeType === key ? `${c.color}15` : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:hover': { bgcolor: `${c.color}10` },
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {/* Prévisualisation du trait */}
                      <Box sx={{ width: 28, height: 2, flexShrink: 0, position: 'relative' }}>
                        <Box sx={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
                          bgcolor: c.color,
                          opacity: c.strokeDasharray ? 0 : 1,
                        }} />
                        {c.strokeDasharray && (
                          <svg width="28" height="4" style={{ position: 'absolute', top: -1 }}>
                            <line x1="0" y1="2" x2="28" y2="2"
                              stroke={c.color} strokeWidth="2"
                              strokeDasharray={c.strokeDasharray}
                            />
                          </svg>
                        )}
                        {!c.strokeDasharray && (
                          <svg width="28" height="4" style={{ position: 'absolute', top: -1 }}>
                            <line x1="0" y1="2" x2="28" y2="2" stroke={c.color} strokeWidth="2" />
                          </svg>
                        )}
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
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            size="small"
            onClick={handleDeleteSelectedEdge}
            sx={{ textTransform: 'none' }}
          >
            Supprimer ce lien
          </Button>
        </Box>
      )
    }

    // Onglet principal (graphe)
    return (
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Prompt LLM */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: TEAL }}>
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
            fullWidth variant="contained"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}
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

        {/* Actions nœuds */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Nœuds</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined" startIcon={<Add />} onClick={handleOpenAddNode} size="small"
              sx={{ textTransform: 'none', justifyContent: 'flex-start', borderColor: TEAL, color: TEAL }}
            >
              Ajouter un nœud
            </Button>
            {selectedNodes.length > 0 && (
              <>
                {selectedNodes.length === 1 && (
                  <Button
                    variant="outlined" startIcon={<Edit />}
                    onClick={() => handleOpenEditNode(selectedNodes[0].id)}
                    size="small" sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                  >
                    Modifier le nœud sélectionné
                  </Button>
                )}
                <Button
                  variant="outlined" color="error" startIcon={<Delete />}
                  onClick={handleDeleteSelectedNodes} size="small"
                  sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                >
                  Supprimer ({selectedNodes.length})
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Légende nœuds */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Types de nœuds</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(Object.entries(NODE_TYPE_CONFIG) as [ExpertiseNodeType, typeof NODE_TYPE_CONFIG[ExpertiseNodeType]][]).map(
              ([type, cfg]) => (
                <Box key={type} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: '3px', flexShrink: 0, mt: 0.3, border: `2px solid ${cfg.color}`, bgcolor: cfg.bg }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: cfg.color, display: 'block' }}>{cfg.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{cfg.description}</Typography>
                  </Box>
                </Box>
              ),
            )}
          </Box>
        </Box>

        <Divider />

        {/* Légende liens */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Types de liens</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {RELATION_CATEGORIES.map((cat) => {
              const entries = (Object.entries(RELATION_TYPES) as [RelationTypeKey, typeof RELATION_TYPES[RelationTypeKey]][])
                .filter(([, v]) => v.category === cat)
              const color = entries[0]?.[1].color
              return (
                <Box key={cat}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color, display: 'block', mb: 0.5 }}>{cat}</Typography>
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
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`${nodes.length} nœuds`} sx={{ bgcolor: `${TEAL}15`, color: TEAL }} />
          <Chip size="small" label={`${edges.length} liens`} sx={{ bgcolor: `${TEAL}15`, color: TEAL }} />
          <Chip size="small" label={`v${meta.version}`} variant="outlined" />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 112px)', position: 'relative', overflow: 'hidden' }}>
      {/* Left drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            position: 'relative',
            height: '100%',
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
            overflowY: 'auto',
            boxSizing: 'border-box',
          },
        }}
      >
        {renderDrawerContent()}
      </Drawer>

      {/* Toggle drawer */}
      <Box sx={{ position: 'absolute', left: drawerOpen ? DRAWER_WIDTH - 1 : 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
        <IconButton
          onClick={() => setDrawerOpen((v) => !v)}
          size="small"
          sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: '0 6px 6px 0', '&:hover': { bgcolor: '#f5f5f5' } }}
        >
          {drawerOpen ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
        </IconButton>
      </Box>

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
            <Box sx={{ display: 'flex', gap: 1, bgcolor: 'white', p: 1, borderRadius: 2, boxShadow: 2 }}>
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
            </Box>
          </Panel>

          <Panel position="bottom-center">
            <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.85)', px: 1.5, py: 0.5, borderRadius: 2, color: 'text.secondary' }}>
              Glissez les nœuds · Tirez depuis un point d&apos;ancrage pour créer un lien · Cliquez sur un lien pour changer son type
            </Typography>
          </Panel>
        </ReactFlow>
      </Box>

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
