'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Background, BackgroundVariant, Connection, ConnectionMode, Controls, Edge, Node, Panel, ReactFlow,
  useEdgesState, useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Alert, Box, Button, Chip, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Snackbar,
  TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material'
import { AddLink, DeleteOutline, EditOutlined, LinkOff, Timeline, ViewQuilt } from '@mui/icons-material'
import {
  CURRENT_YEAR, RELATION_SUGGESTIONS, RelationDirection, ResearchProfile, ResearchTheme, TEAL, TEAL_DARK,
  ThemeRelation, VISIBILITY_CONFIG, formatPeriod, relationSentence,
} from '../types'
import JourneyNode, { AxisLineNode, AxisTickNode, JourneyNodeData } from './JourneyNode'
import JourneyEdge, { ARROW_COLORS, JourneyEdgeData } from './JourneyEdge'
import { RefsSummary } from './ThemeDetail'

interface Props {
  profile: ResearchProfile
  onChangeRelations: (relations: ThemeRelation[]) => void
  onChangePositions: (positions: Record<string, { x: number; y: number }>) => void
  onEditTheme: (id: string) => void
}

type LayoutMode = 'timeline' | 'free'

interface RelationForm {
  id?: string
  source: string
  target: string
  direction: RelationDirection
  label: string
}

const PX_PER_YEAR = 44
const NODE_MIN_WIDTH = 180
const LANE_HEIGHT = 96
const PANEL_WIDTH = 420

// ─── Disposition « Frise » : x = année de début, largeur = durée, empilement par couloirs ──

function timelineLayout(themes: ResearchTheme[]) {
  const starts = themes.map((t) => t.yearFrom ?? CURRENT_YEAR - 1)
  const minYear = starts.length ? Math.min(...starts) : CURRENT_YEAR - 10
  const axisStart = Math.floor((minYear - 1) / 4) * 4
  const axisEnd = CURRENT_YEAR + 1
  const x = (year: number) => (year - axisStart) * PX_PER_YEAR

  const sorted = [...themes].sort((a, b) => (a.yearFrom ?? 0) - (b.yearFrom ?? 0))
  const laneEnds: number[] = []
  const nodes: Node<JourneyNodeData>[] = []

  for (const theme of sorted) {
    const from = theme.yearFrom ?? CURRENT_YEAR - 1
    const to = theme.yearTo ?? CURRENT_YEAR + 0.5
    const left = x(from)
    const width = Math.max(NODE_MIN_WIDTH, (to - from) * PX_PER_YEAR)
    let lane = laneEnds.findIndex((end) => end + 24 <= left)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0) }
    laneEnds[lane] = left + width
    nodes.push({
      id: theme.id,
      type: 'journeyNode',
      position: { x: left, y: lane * LANE_HEIGHT },
      data: { theme, width },
    })
  }

  const axisY = Math.max(1, laneEnds.length) * LANE_HEIGHT + 16
  const axisNodes: Node[] = [{
    id: 'axis-line',
    type: 'axisLine',
    position: { x: 0, y: axisY },
    data: { width: x(axisEnd) },
    selectable: false, draggable: false, connectable: false, focusable: false,
  }]
  for (let year = axisStart; year <= axisEnd; year += 4) {
    axisNodes.push({
      id: `axis-${year}`,
      type: 'axisTick',
      position: { x: x(year), y: axisY + 2 },
      data: { label: String(year) },
      selectable: false, draggable: false, connectable: false, focusable: false,
    })
  }
  return { nodes, axisNodes }
}

function toEdge(rel: ThemeRelation, selected = false): Edge<JourneyEdgeData> {
  return {
    id: rel.id, source: rel.source, target: rel.target, type: 'journeyEdge', selected,
    data: { label: rel.label, direction: rel.direction },
  }
}

const BLANK_FORM: RelationForm = { source: '', target: '', direction: 'forward', label: '' }

export default function JourneyGraph({ profile, onChangeRelations, onChangePositions, onEditTheme }: Props) {
  const [mode, setMode] = useState<LayoutMode>('timeline')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<JourneyEdgeData>>([])
  const [form, setForm] = useState<RelationForm>(BLANK_FORM)
  const [snackbar, setSnackbar] = useState('')

  const nodeTypes = useMemo(() => ({ journeyNode: JourneyNode, axisTick: AxisTickNode, axisLine: AxisLineNode }), [])
  const edgeTypes = useMemo(() => ({ journeyEdge: JourneyEdge }), [])

  const themes = profile.themes
  const themeById = useMemo(() => new Map(themes.map((t) => [t.id, t])), [themes])

  // Reconstruit nœuds et arêtes depuis le profil, en conservant la sélection courante.
  useEffect(() => {
    const { nodes: themeNodes, axisNodes } = timelineLayout(themes)
    setNodes((prev) => {
      const selectedIds = new Set(prev.filter((n) => n.selected).map((n) => n.id))
      const placed = themeNodes.map((n) => ({
        ...n,
        selected: selectedIds.has(n.id),
        draggable: mode === 'free',
        position: mode === 'free' && profile.positions?.[n.id] ? profile.positions[n.id] : n.position,
      }))
      return mode === 'timeline' ? [...axisNodes, ...placed] : placed
    })
    setEdges((prev) => {
      const selectedIds = new Set(prev.filter((e) => e.selected).map((e) => e.id))
      return profile.relations.map((r) => toEdge(r, selectedIds.has(r.id)))
    })
  }, [themes, profile.relations, profile.positions, mode, setNodes, setEdges])

  const selectedEdge = edges.find((e) => e.selected) ?? null
  const selectedNode = nodes.find((n) => n.selected && n.type === 'journeyNode') ?? null
  const selectedTheme = selectedNode ? themeById.get(selectedNode.id) ?? null : null

  // Le formulaire suit la sélection : relation sélectionnée → édition ; thème sélectionné → nouvelle relation depuis ce thème.
  useEffect(() => {
    if (selectedEdge) {
      const rel = profile.relations.find((r) => r.id === selectedEdge.id)
      if (rel) { setForm({ id: rel.id, source: rel.source, target: rel.target, direction: rel.direction, label: rel.label }); return }
    }
    setForm((f) => (f.id ? { ...BLANK_FORM, source: selectedTheme?.id ?? '' } : { ...f, source: selectedTheme?.id ?? f.source }))
  }, [selectedEdge?.id, selectedTheme?.id, profile.relations]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectEdge = useCallback((id: string | null) => {
    setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === id })))
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })))
  }, [setEdges, setNodes])

  const alreadyLinked = (a: string, b: string, exceptId?: string) =>
    profile.relations.some((r) => r.id !== exceptId
      && ((r.source === a && r.target === b) || (r.source === b && r.target === a)))

  const addRelation = useCallback((source: string, target: string, label = '', direction: RelationDirection = 'forward') => {
    if (!source || !target || source === target) return null
    if (alreadyLinked(source, target)) { setSnackbar('Ces deux thèmes sont déjà reliés : modifiez la relation existante.'); return null }
    const rel: ThemeRelation = { id: `r${Date.now()}`, source, target, direction, label: label.trim() }
    onChangeRelations([...profile.relations, rel])
    return rel
  }, [profile.relations, onChangeRelations]) // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target) return
    const rel = addRelation(c.source, c.target)
    if (rel) setTimeout(() => selectEdge(rel.id), 0)
  }, [addRelation, selectEdge])

  const handleSaveForm = () => {
    if (!form.source || !form.target || form.source === form.target) return
    if (form.id) {
      if (alreadyLinked(form.source, form.target, form.id)) { setSnackbar('Ces deux thèmes sont déjà reliés par une autre relation.'); return }
      onChangeRelations(profile.relations.map((r) => (r.id === form.id
        ? { ...r, source: form.source, target: form.target, direction: form.direction, label: form.label.trim() }
        : r)))
      setSnackbar('Relation enregistrée')
    } else {
      const rel = addRelation(form.source, form.target, form.label, form.direction)
      if (rel) { setSnackbar('Relation ajoutée'); setTimeout(() => selectEdge(rel.id), 0) }
    }
  }

  const handleDelete = (id: string) => {
    onChangeRelations(profile.relations.filter((r) => r.id !== id))
    if (form.id === id) { setForm(BLANK_FORM); selectEdge(null) }
  }

  const storedRelation = form.id ? profile.relations.find((r) => r.id === form.id) : undefined
  const formDirty = form.id
    ? Boolean(storedRelation) && (storedRelation!.source !== form.source || storedRelation!.target !== form.target
      || storedRelation!.direction !== form.direction || storedRelation!.label !== form.label.trim())
    : Boolean(form.source && form.target)
  const formValid = Boolean(form.source && form.target && form.source !== form.target)
  const otherRelations = profile.relations.filter((r) => r.id !== form.id)

  const previewRelation: ThemeRelation = { id: form.id ?? 'preview', source: form.source, target: form.target, direction: form.direction, label: form.label }

  const renderThemeSelect = (label: string, value: string, onChange: (v: string) => void, exclude?: string) => (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange(e.target.value)} displayEmpty={false}>
        {themes.map((t) => (
          <MenuItem key={t.id} value={t.id} disabled={t.id === exclude}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>{t.label || 'Thème sans titre'}</Typography>
              <Typography variant="caption" color="text.secondary">{formatPeriod(t)}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  if (themes.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Aucun thème à relier</Typography>
        <Typography variant="body2" color="text.secondary">
          Décrivez d’abord au moins deux thèmes de recherche dans l’onglet Thèmes.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      display: 'flex', flexDirection: { xs: 'column', md: 'row' },
      height: { md: 'calc(100vh - 236px)' }, minHeight: { md: 520 },
    }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {ARROW_COLORS.map((color) => (
            <marker key={color} id={`journey-arrow-${color.replace('#', '')}`}
              markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          ))}
        </defs>
      </svg>

      {/* ── Canevas ── */}
      <Box sx={{ flex: 1, minWidth: 0, height: { xs: 480, md: 'auto' }, position: 'relative', bgcolor: '#FAFBFC' }}>
        <ReactFlow
          key={mode}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={(_e, node) => onChangePositions({ ...(profile.positions ?? {}), [node.id]: node.position })}
          onPaneClick={() => setForm((f) => (f.id ? BLANK_FORM : f))}
          connectionMode={ConnectionMode.Loose}
          nodesDraggable={mode === 'free'}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.3 }}
          minZoom={0.3}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E0E4E8" />
          <Controls showInteractive={false} />
          <Panel position="top-left">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <ToggleButtonGroup size="small" exclusive value={mode}
                onChange={(_e, v: LayoutMode | null) => v && setMode(v)}
                sx={{ bgcolor: 'background.paper', '& .MuiToggleButton-root': { textTransform: 'none', gap: 0.5, px: 1.5 } }}>
                <ToggleButton value="timeline"><Timeline fontSize="small" />Frise</ToggleButton>
                <ToggleButton value="free"><ViewQuilt fontSize="small" />Libre</ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" sx={{ bgcolor: 'background.paper', px: 1.25, py: 0.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>
                Glissez d’une poignée de thème vers un autre thème pour créer une relation
                {mode === 'free' ? ' · déplacez les thèmes librement' : ''}
              </Typography>
            </Box>
          </Panel>
        </ReactFlow>
      </Box>

      {/* ── Panneau de qualification ── */}
      <Box sx={{
        width: { xs: '100%', md: PANEL_WIDTH }, flexShrink: 0,
        borderLeft: { md: '1px solid' }, borderTop: { xs: '1px solid', md: 'none' }, borderColor: 'divider',
        bgcolor: 'background.paper', overflowY: 'auto', p: 3,
      }}>
        {selectedTheme && !form.id && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: '#E8F5F4', border: `1px solid ${TEAL}30` }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{selectedTheme.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatPeriod(selectedTheme)} · {VISIBILITY_CONFIG[selectedTheme.visibility].label}
                </Typography>
              </Box>
              <Tooltip title="Modifier ce thème (intitulé, description, mots-clés, diffusion)">
                <IconButton size="small" onClick={() => onEditTheme(selectedTheme.id)} aria-label="Modifier ce thème">
                  <EditOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            {selectedTheme.keywords.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {selectedTheme.keywords.slice(0, 5).map((k) => (
                  <Chip key={`${k.vocabulary}-${k.label}`} size="small" label={k.label} sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#fff' }} />
                ))}
              </Box>
            )}
            <Box sx={{ mt: 1 }}>
              <RefsSummary theme={selectedTheme} dense />
            </Box>
          </Box>
        )}

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {form.id ? 'Relation entre deux thèmes' : 'Nouvelle relation'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {form.id
            ? 'Précisez le sens et la nature du lien. La phrase ci-dessous est celle qui sera affichée.'
            : 'Reliez deux thèmes pour raconter comment vos recherches se sont construites.'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {renderThemeSelect('Thème A', form.source, (v) => setForm((f) => ({ ...f, source: v })), form.target)}

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.75 }}>
              Direction
            </Typography>
            <ToggleButtonGroup fullWidth exclusive value={form.direction}
              onChange={(_e, v: RelationDirection | null) => v && setForm((f) => ({ ...f, direction: v }))}
              sx={{ '& .MuiToggleButton-root': { textTransform: 'none', py: 1, flexDirection: 'column', gap: 0.25, '&.Mui-selected': { bgcolor: `${TEAL}14`, color: TEAL, fontWeight: 700 } } }}>
              <ToggleButton value="forward"><Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>A → B</Typography><Typography variant="caption">A mène à B</Typography></ToggleButton>
              <ToggleButton value="backward"><Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>A ← B</Typography><Typography variant="caption">B mène à A</Typography></ToggleButton>
              <ToggleButton value="bidirectional"><Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>A ↔ B</Typography><Typography variant="caption">Réciproque</Typography></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {renderThemeSelect('Thème B', form.target, (v) => setForm((f) => ({ ...f, target: v })), form.source)}

          <Box>
            <TextField fullWidth size="small" label="Qualifier la relation" placeholder="Ex : prolonge, s’appuie sur, nourrit…"
              value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              inputProps={{ 'aria-label': 'Qualifier la relation' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
              {RELATION_SUGGESTIONS.map((s) => (
                <Chip key={s} size="small" label={s} clickable variant={form.label === s ? 'filled' : 'outlined'}
                  onClick={() => setForm((f) => ({ ...f, label: s }))}
                  sx={{ borderColor: `${TEAL}60`, color: form.label === s ? '#fff' : TEAL, bgcolor: form.label === s ? TEAL : 'transparent', '&:hover': { bgcolor: form.label === s ? TEAL_DARK : `${TEAL}10` } }} />
              ))}
            </Box>
          </Box>

          {formValid && (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${TEAL}0A`, borderLeft: `3px solid ${TEAL}` }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{relationSentence(previewRelation, themes)}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            {form.id ? (
              <Button size="small" color="error" startIcon={<LinkOff />} onClick={() => handleDelete(form.id!)} sx={{ textTransform: 'none' }}>
                Supprimer
              </Button>
            ) : <span />}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {form.id && (
                <Button size="small" onClick={() => { setForm(BLANK_FORM); selectEdge(null) }} sx={{ textTransform: 'none' }}>
                  Fermer
                </Button>
              )}
              <Button variant="contained" size="small" disabled={!formValid || !formDirty} onClick={handleSaveForm}
                startIcon={form.id ? undefined : <AddLink />}
                sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
                {form.id ? 'Enregistrer' : 'Ajouter la relation'}
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>
          {form.id
            ? `${otherRelations.length} autre${otherRelations.length > 1 ? 's' : ''} relation${otherRelations.length > 1 ? 's' : ''}`
            : `${otherRelations.length} relation${otherRelations.length > 1 ? 's' : ''}`}
        </Typography>
        {otherRelations.length === 0 ? (
          <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>Aucune relation pour l’instant.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {otherRelations.map((r) => (
              <Box key={r.id} onClick={() => selectEdge(r.id)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: 1.5, cursor: 'pointer',
                  border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: `${TEAL}08`, borderColor: `${TEAL}60` },
                }}>
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontStyle: r.label ? 'normal' : 'italic', color: r.label ? 'text.primary' : 'text.secondary' }}>
                  {relationSentence(r, themes)}
                </Typography>
                <IconButton size="small" aria-label="Supprimer cette relation"
                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}>
                  <DeleteOutline sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.startsWith('Ces deux') ? 'warning' : 'success'} onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  )
}
