'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, Connection, BackgroundVariant, Panel, Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button,
  Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Drawer, FormControl, IconButton, InputLabel, MenuItem,
  Select, Slider, Snackbar, TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography, useMediaQuery,
} from '@mui/material'
import {
  AccountTree, Add, Business, ChevronLeft, ChevronRight,
  Close, Delete, DeleteSweep, Download, Edit, ExpandMore, History, LocalOffer, Map as MapIcon,
  OpenInNew, Person, Place, RestartAlt, Save, Schedule,
} from '@mui/icons-material'
import ExpertiseNode from './ExpertiseNode'
import RelationEdge from './RelationEdge'
import { searchIdRefPersons, searchIdRefOrganizations, GEONAMES_MOCK, NAMED_PERIODS } from './mockIdRef'
import type { IdRefResult } from './mockIdRef'
import HistoryDialog from './HistoryDialog'
import {
  AttributeCategory,
  CONTROLLED_VOCABULARIES,
  EdgeData, EdgeDirection,
  ExpertiseGraph, ExpertiseNodeData, ExpertiseNodeType, HistoryEntry,
  INITIAL_GRAPH, NODE_TYPE_CONFIG,
} from '../../types'
import {
  EMPTY_GRAPH, GRAPH_KEY_PREFIX, appendHistoryEntry, getPerspective, loadHistory,
} from '../../storage'

const TEAL = '#006A61'

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

function formatYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} av. J.-C.` : `${y}`
}

function applyEdgeStyle(edge: Edge): Edge {
  return { ...edge, type: 'relationEdge', animated: false }
}

function loadGraph(key: string): ExpertiseGraph {
  if (typeof window === 'undefined') return INITIAL_GRAPH
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as ExpertiseGraph
  } catch (_e) { /* ignore */ }
  return getPerspective() === 'default' ? INITIAL_GRAPH : EMPTY_GRAPH
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

interface MindMapViewProps {
  /** Renvoie vers la vue Liste (bouton "Modifier mes thèmes" / fallback à vide). */
  onBackToList?: () => void
}

export default function MindMapView({ onBackToList }: MindMapViewProps) {
  const [perspective] = useState(() => getPerspective())
  const storageKey = `${GRAPH_KEY_PREFIX}-${perspective}`

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

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [nodeDialog, setNodeDialog] = useState<NodeDialogState>(DEFAULT_DIALOG)
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: 'success' | 'info' }>({
    open: false, msg: '', severity: 'success',
  })
  const [jsonOpen, setJsonOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())
  const [temporalMode, setTemporalMode] = useState<'range' | 'named'>('range')
  const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear()])
  const [addingIdRefPpn, setAddingIdRefPpn] = useState<string | undefined>(undefined)
  const [addingGeonamesLabel, setAddingGeonamesLabel] = useState<string | undefined>(undefined)
  const [idrefOptions, setIdrefOptions] = useState<IdRefResult[]>([])
  const [geoDialog, setGeoDialog] = useState<{ open: boolean; label: string }>({ open: false, label: '' })

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

  const addToHistory = useCallback((entryLabel: string, graph: ExpertiseGraph) => {
    setHistory(appendHistoryEntry(entryLabel, graph))
  }, [])

  const handleRestoreHistory = useCallback((entry: HistoryEntry) => {
    setNodes(entry.graph.nodes)
    setEdges(entry.graph.edges.map(applyEdgeStyle))
    setMeta(entry.graph.meta)
    saveGraph(storageKey, entry.graph)
    setHistoryOpen(false)
    setSnackbar({ open: true, msg: `Version restaurée — ${entry.label}`, severity: 'info' })
  }, [storageKey, setNodes, setEdges])

  const handleSave = useCallback(() => {
    const graph = { nodes, edges, meta }
    saveGraph(storageKey, graph)
    addToHistory('Modification manuelle', graph)
    setSnackbar({ open: true, msg: 'Thèmes de recherche enregistrés', severity: 'success' })
  }, [storageKey, nodes, edges, meta, addToHistory])

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
    setNodes(INITIAL_GRAPH.nodes)
    setEdges(INITIAL_GRAPH.edges.map(applyEdgeStyle))
    setMeta(INITIAL_GRAPH.meta)
    saveGraph(storageKey, INITIAL_GRAPH)
    setSelectedEdgeId(null)
    setDrawerTab('graph')
    setAddingCat(null)
  }, [setNodes, setEdges, storageKey])

  const handleClear = useCallback(() => {
    setNodes([])
    setEdges([])
    setMeta({ version: 2, lastUpdated: new Date().toISOString().split('T')[0], promptHistory: [] })
    localStorage.removeItem(storageKey)
    setSelectedEdgeId(null)
    setDrawerTab('graph')
    setAddingCat(null)
  }, [setNodes, setEdges, storageKey])

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
    setTemporalMode('range')
    setYearRange([1990, new Date().getFullYear()])
    setAddingIdRefPpn(undefined)
    setAddingGeonamesLabel(undefined)
    setIdrefOptions([])
  }

  const confirmAddAttr = (nodeId: string, cat: AttributeCategory) => {
    const label = cat === 'temporal' && temporalMode === 'range'
      ? `${formatYear(yearRange[0])} — ${formatYear(yearRange[1])}`
      : addingLabel.trim()
    if (!label) return
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      const d = n.data as ExpertiseNodeData
      const current = (d[cat] ?? []) as unknown[]
      let item: Record<string, unknown>
      if (cat === 'concepts') {
        item = { label, ...(addingVocab ? { vocabulary: addingVocab } : {}) }
      } else if (cat === 'temporal' && temporalMode === 'range') {
        item = { label, yearFrom: yearRange[0], yearTo: yearRange[1] }
      } else if (cat === 'geographic' && addingGeonamesLabel) {
        item = { label }
      } else if ((cat === 'persons' || cat === 'organizations') && addingIdRefPpn) {
        item = { label, identifier: addingIdRefPpn }
      } else {
        item = { label }
      }
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
      Ajouter un thème
    </Button>
  )

  const renderStats = () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip size="small" label={`${nodes.length} thème${nodes.length > 1 ? 's' : ''}`} sx={{ bgcolor: `${TEAL}15`, color: TEAL }} />
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
            <Typography variant="caption" sx={{ fontWeight: 600, color: TEAL }}>Thème de recherche</Typography>
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
          const items = (nodeData[key] ?? []) as Array<{ label: string; vocabulary?: string; identifier?: string; geonamesId?: number; yearFrom?: number; yearTo?: number }>
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
                  {items.map((item, idx) => {
                    const isGeo = key === 'geographic'
                    const hasIdRef = (key === 'persons' || key === 'organizations') && Boolean(item.identifier)
                    const chipLabel = key === 'temporal' && item.yearFrom != null && item.yearTo != null
                      ? `${formatYear(item.yearFrom)} — ${formatYear(item.yearTo)}`
                      : item.vocabulary ? `${item.label} (${item.vocabulary})` : item.label
                    return (
                      <Chip
                        key={idx}
                        label={chipLabel}
                        size="small"
                        onDelete={() => removeAttr(nodeId, key, idx)}
                        onClick={
                          isGeo ? () => setGeoDialog({ open: true, label: item.label })
                          : hasIdRef ? () => window.open(`https://www.idref.fr/${item.identifier}`, '_blank')
                          : undefined
                        }
                        icon={
                          isGeo ? <MapIcon sx={{ fontSize: '11px !important' }} />
                          : hasIdRef ? <OpenInNew sx={{ fontSize: '10px !important' }} />
                          : undefined
                        }
                        sx={{
                          fontSize: '0.65rem', height: 20,
                          bgcolor: `${color}10`, color,
                          border: `1px solid ${color}33`,
                          cursor: isGeo || hasIdRef ? 'pointer' : 'default',
                          '& .MuiChip-deleteIcon': { fontSize: 12, color: `${color}99`, '&:hover': { color } },
                          '& .MuiChip-icon': { color: `${color}88` },
                        }}
                      />
                    )
                  })}
                </Box>
              )}

              {isAdding && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 0.5 }}>
                  {key === 'temporal' ? (
                    <>
                      <ToggleButtonGroup
                        size="small" value={temporalMode} exclusive
                        onChange={(_, v) => { if (v) { setTemporalMode(v); setAddingLabel('') } }}
                        sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.7rem', py: 0.4, flex: 1 } }}
                        fullWidth
                      >
                        <ToggleButton value="range">Plage d&apos;années</ToggleButton>
                        <ToggleButton value="named">Période nommée</ToggleButton>
                      </ToggleButtonGroup>
                      {temporalMode === 'range' ? (
                        <Box sx={{ px: 1, pt: 0.5 }}>
                          <Slider
                            value={yearRange}
                            onChange={(_, v) => setYearRange(v as [number, number])}
                            min={-100000} max={2030} step={50}
                            valueLabelDisplay="off"
                            disableSwap
                            sx={{ color, '& .MuiSlider-thumb': { width: 14, height: 14 }, mb: 0.5 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              size="small"
                              label="De"
                              type="number"
                              value={yearRange[0]}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10)
                                if (!isNaN(v) && v >= -100000 && v <= yearRange[1]) setYearRange([v, yearRange[1]])
                              }}
                              inputProps={{ min: -100000, max: yearRange[1], step: 1, style: { fontSize: '0.75rem' } }}
                              sx={{ flex: 1, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
                            />
                            <Typography variant="caption" color="text.disabled">—</Typography>
                            <TextField
                              size="small"
                              label="À"
                              type="number"
                              value={yearRange[1]}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10)
                                if (!isNaN(v) && v >= yearRange[0] && v <= 2030) setYearRange([yearRange[0], v])
                              }}
                              inputProps={{ min: yearRange[0], max: 2030, step: 1, style: { fontSize: '0.75rem' } }}
                              sx={{ flex: 1, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Autocomplete
                          size="small" freeSolo
                          options={NAMED_PERIODS}
                          inputValue={addingLabel}
                          onInputChange={(_, v) => setAddingLabel(v)}
                          renderInput={(params) => (
                            <TextField {...params} size="small" autoFocus
                              placeholder="Ex : Révolution française, Moyen Âge…"
                              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
                            />
                          )}
                        />
                      )}
                    </>
                  ) : key === 'geographic' ? (
                    <>
                      <Autocomplete
                        size="small" freeSolo
                        options={addingLabel.length >= 1 ? GEONAMES_MOCK.filter(g => g.toLowerCase().includes(addingLabel.toLowerCase())).slice(0, 8) : GEONAMES_MOCK.slice(0, 6)}
                        inputValue={addingLabel}
                        onInputChange={(_, v) => { setAddingLabel(v); setAddingGeonamesLabel(v || undefined) }}
                        renderInput={(params) => (
                          <TextField {...params} size="small" autoFocus
                            placeholder="Ex : France, Afrique subsaharienne…"
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
                          />
                        )}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Place sx={{ fontSize: 11, color }} /> Source : GeoNames — cliquez sur le lieu pour l&apos;afficher sur la carte
                      </Typography>
                    </>
                  ) : key === 'persons' || key === 'organizations' ? (
                    <>
                      <Autocomplete
                        size="small" freeSolo
                        options={idrefOptions}
                        getOptionLabel={(o) => typeof o === 'string' ? o : o.label}
                        inputValue={addingLabel}
                        onInputChange={(_, v) => {
                          setAddingLabel(v)
                          setAddingIdRefPpn(undefined)
                          setIdrefOptions(key === 'persons' ? searchIdRefPersons(v) : searchIdRefOrganizations(v))
                        }}
                        onChange={(_, v) => {
                          if (v && typeof v === 'object') {
                            setAddingLabel(v.label)
                            setAddingIdRefPpn(v.ppn)
                          }
                        }}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.ppn} sx={{ flexDirection: 'column', alignItems: 'flex-start !important' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{option.label}</Typography>
                            {(option.dates || option.description) && (
                              <Typography variant="caption" color="text.secondary">
                                {[option.dates, option.description].filter(Boolean).join(' · ')}
                              </Typography>
                            )}
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} size="small" autoFocus
                            placeholder={key === 'persons' ? 'Rechercher dans IdRef (personnes)…' : 'Rechercher dans IdRef (organismes)…'}
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
                          />
                        )}
                      />
                      {addingIdRefPpn && (
                        <Typography variant="caption" sx={{ color, fontStyle: 'italic' }}>
                          PPN IdRef : {addingIdRefPpn} ✓
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <OpenInNew sx={{ fontSize: 11, color }} /> Source : IdRef — les identifiants seront liés à la notice
                      </Typography>
                    </>
                  ) : (
                    // Concepts : texte libre + vocabulaire contrôlé
                    <>
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
                    </>
                  )}

                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Button size="small" variant="contained"
                      disabled={key === 'temporal' && temporalMode === 'range' ? false : !addingLabel.trim()}
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
                {selectedNodes.length} thèmes sélectionnés
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

    // État 1 : rien de sélectionné — vue "Relations" : pas de génération ici,
    // seulement un rappel de la provenance et un renvoi vers la liste.
    return (
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
            Relations entre thèmes
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Vue avancée : dessinez ici les liens entre vos thèmes de recherche. Pour ajouter,
            modifier ou générer des thèmes, utilisez la vue Liste.
          </Typography>
          {lastPrompt && (
            <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1.5, mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Thèmes issus de :
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {lastPrompt.length > 120 ? `${lastPrompt.slice(0, 120)}…` : lastPrompt}
              </Typography>
            </Box>
          )}
          <Button
            fullWidth variant="outlined" size="small"
            onClick={onBackToList}
            sx={{ borderColor: TEAL, color: TEAL, textTransform: 'none' }}
          >
            Modifier mes thèmes →
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

  // ── Empty state onboarding ────────────────────────────────────────────

  // Ne s'affiche que si l'utilisateur supprime tous les thèmes pendant qu'il
  // est dans cette vue — la génération se fait désormais depuis la vue Liste.
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
        p: { xs: 3, sm: 4 }, maxWidth: 440, width: '90%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center',
      }}>
        <AccountTree sx={{ fontSize: 44, color: 'text.disabled' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Plus aucun thème
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vos thèmes de recherche se gèrent depuis la vue Liste — définissez-en de nouveaux
          depuis vos publications ou en quelques phrases.
        </Typography>
        <Button
          variant="contained" onClick={onBackToList}
          sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none', borderRadius: 2 }}
        >
          Retour à la vue Liste
        </Button>
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
                  <Tooltip title="Ajouter un thème de recherche">
                    <Button size="small" variant="contained" startIcon={<Add />} onClick={handleOpenAddNode}
                      sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none' }}>
                      Ajouter un thème
                    </Button>
                  </Tooltip>
                  <Tooltip title="Enregistrer">
                    <Button size="small" variant="outlined" startIcon={<Save />} onClick={handleSave}
                      sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
                      Enregistrer
                    </Button>
                  </Tooltip>
                  <Tooltip title="Voir / exporter le JSON">
                    <Button size="small" variant="outlined" startIcon={<Download />} onClick={() => setJsonOpen(true)}
                      sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
                      JSON
                    </Button>
                  </Tooltip>
                  <Tooltip title={`Historique (${history.length} version${history.length !== 1 ? 's' : ''})`}>
                    <IconButton size="small" onClick={() => setHistoryOpen(true)}
                      sx={{ color: history.length > 0 ? TEAL : 'text.disabled' }}>
                      <History fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restaurer l'exemple de démonstration">
                    <IconButton size="small" onClick={handleReset} sx={{ color: 'text.disabled', '&:hover': { color: TEAL } }}>
                      <RestartAlt fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Vider les thèmes de recherche (simuler un premier accès)">
                    <IconButton size="small" onClick={handleClear} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                      <DeleteSweep fontSize="small" />
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

      {/* Dialog — historique des versions */}
      <HistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreHistory}
      />

      {/* Dialog — carte géographique */}
      <Dialog open={geoDialog.open} onClose={() => setGeoDialog({ open: false, label: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapIcon sx={{ color: '#388E3C', fontSize: 20 }} />
            <Typography variant="h6">{geoDialog.label}</Typography>
          </Box>
          <IconButton size="small" onClick={() => setGeoDialog({ open: false, label: '' })}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: 320, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
            <iframe
              title={geoDialog.label}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(geoDialog.label)}&output=embed&hl=fr`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start', gap: 1, px: 2 }}>
          <Button size="small" startIcon={<OpenInNew sx={{ fontSize: '14px !important' }} />}
            onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(geoDialog.label)}`, '_blank')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>
            OpenStreetMap
          </Button>
          <Button size="small" startIcon={<OpenInNew sx={{ fontSize: '14px !important' }} />}
            onClick={() => window.open(`https://www.geonames.org/search.html?q=${encodeURIComponent(geoDialog.label)}`, '_blank')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>
            GeoNames
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setGeoDialog({ open: false, label: '' })} sx={{ textTransform: 'none' }}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog — add / edit expertise */}
      <Dialog open={nodeDialog.open} onClose={() => setNodeDialog(DEFAULT_DIALOG)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {nodeDialog.mode === 'add' ? 'Ajouter un thème' : 'Modifier le thème'}
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
