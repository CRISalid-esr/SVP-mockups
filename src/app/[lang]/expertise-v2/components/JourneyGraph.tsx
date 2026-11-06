'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Connection, ConnectionMode, Controls, Edge, Node, Panel, ReactFlow, useEdgesState, useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Alert, Box, Button, Card, Chip, FormControl, IconButton, InputLabel, Link, MenuItem, Select, Snackbar,
  TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { Close, EditOutlined, LinkOff } from '@mui/icons-material'
import {
  RELATION_SUGGESTIONS, RelationDirection, ResearchProfile, ResearchTheme, ThemeRelation, formatPeriod, relationSentence,
} from '../types'
import JourneyNode, { JourneyNodeData } from './JourneyNode'
import JourneyEdge, { ARROW_COLORS, JourneyEdgeData } from './JourneyEdge'
import { defaultPositions } from './journeyLayout'

interface Props {
  profile: ResearchProfile
  onChangeRelations: (relations: ThemeRelation[]) => void
  onChangePositions: (positions: Record<string, { x: number; y: number }>) => void
  onEditTheme: (id: string) => void
}

type Selection = { kind: 'theme' | 'relation'; id: string } | null

const nodeTypes = { journeyNode: JourneyNode }
const edgeTypes = { journeyEdge: JourneyEdge }

const DIRECTIONS: { value: RelationDirection; symbol: string; label: string }[] = [
  { value: 'forward', symbol: '→', label: 'Du premier thème vers le second' },
  { value: 'backward', symbol: '←', label: 'Du second thème vers le premier' },
  { value: 'bidirectional', symbol: '↔', label: 'Réciproque' },
]

const panelTitleSx = { display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }

/** Une relation : ses modifications s'enregistrent au fil de l'eau. */
function RelationPanel({ relation, themes, onChange, onDelete, onClose }: {
  relation: ThemeRelation
  themes: ResearchTheme[]
  onChange: (patch: Partial<ThemeRelation>) => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <>
      <Box sx={panelTitleSx}>
        <Typography variant="body1" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>
          {relationSentence(relation, themes)}
        </Typography>
        <IconButton size="small" aria-label="Fermer" onClick={onClose}><Close fontSize="small" /></IconButton>
      </Box>
      <TextField
        fullWidth
        size="small"
        label="Nature du lien"
        placeholder="Ex : prolonge, nourrit…"
        value={relation.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
        {RELATION_SUGGESTIONS.map((suggestion) => (
          <Chip
            key={suggestion}
            size="small"
            clickable
            label={suggestion}
            color={relation.label === suggestion ? 'primary' : 'default'}
            variant={relation.label === suggestion ? 'filled' : 'outlined'}
            onClick={() => onChange({ label: suggestion })}
          />
        ))}
      </Box>
      <Typography variant="body1" fontWeight={600} sx={{ mt: 2.5, mb: 1 }}>Sens</Typography>
      <ToggleButtonGroup
        fullWidth
        exclusive
        size="small"
        value={relation.direction}
        onChange={(_e, direction: RelationDirection | null) => direction && onChange({ direction })}
      >
        {DIRECTIONS.map(({ value, symbol, label }) => (
          <ToggleButton key={value} value={value} aria-label={label} title={label} sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
            {symbol}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Button color="error" size="small" startIcon={<LinkOff />} onClick={onDelete} sx={{ mt: 2.5 }}>
        Supprimer la relation
      </Button>
    </>
  )
}

/** Un thème : l'ouvrir, voir ses liens, le relier à un autre. */
function ThemePanel({ theme, themes, relations, onEdit, onLink, onSelectRelation, onClose }: {
  theme: ResearchTheme
  themes: ResearchTheme[]
  relations: ThemeRelation[]
  onEdit: () => void
  onLink: (targetId: string) => void
  onSelectRelation: (id: string) => void
  onClose: () => void
}) {
  const mine = relations.filter((r) => r.source === theme.id || r.target === theme.id)
  const linkedIds = new Set(mine.flatMap((r) => [r.source, r.target]))

  return (
    <>
      <Box sx={panelTitleSx}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" component="h2">{theme.label || 'Thème sans titre'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{formatPeriod(theme)}</Typography>
        </Box>
        <IconButton size="small" aria-label="Fermer" onClick={onClose}><Close fontSize="small" /></IconButton>
      </Box>
      <Button size="small" variant="outlined" startIcon={<EditOutlined />} onClick={onEdit}>
        Modifier ce thème
      </Button>

      {mine.length > 0 && (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 2.5, p: 0, display: 'grid', gap: 1 }}>
          {mine.map((r) => (
            <li key={r.id}>
              <Link component="button" underline="hover" onClick={() => onSelectRelation(r.id)} sx={{ textAlign: 'left', fontSize: '0.875rem', color: 'text.primary' }}>
                {relationSentence(r, themes)}
              </Link>
            </li>
          ))}
        </Box>
      )}

      <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
        <InputLabel id="journey-link-label">Relier à un autre thème</InputLabel>
        <Select
          labelId="journey-link-label"
          label="Relier à un autre thème"
          value=""
          onChange={(e) => onLink(e.target.value)}
        >
          {themes.filter((t) => t.id !== theme.id).map((t) => (
            <MenuItem key={t.id} value={t.id} disabled={linkedIds.has(t.id)} sx={{ whiteSpace: 'normal' }}>
              {t.label || 'Thème sans titre'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}

export default function JourneyGraph({ profile, onChangeRelations, onChangePositions, onEditTheme }: Props) {
  const { themes, relations } = profile
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<JourneyEdgeData>>([])
  const [selection, setSelection] = useState<Selection>(null)
  const [warning, setWarning] = useState('')
  // Change à chaque réorganisation : le canevas se recadre sur la nouvelle disposition.
  const [layoutVersion, setLayoutVersion] = useState(0)

  const selectRelation = useCallback((id: string) => setSelection({ kind: 'relation', id }), [])

  const positions = useMemo(
    () => ({ ...defaultPositions(themes), ...profile.positions }),
    [themes, profile.positions],
  )

  useEffect(() => {
    setNodes(themes.map((theme): Node<JourneyNodeData> => ({
      id: theme.id,
      type: 'journeyNode',
      position: positions[theme.id],
      selected: selection?.kind === 'theme' && selection.id === theme.id,
      data: { theme },
    })))
  }, [themes, positions, selection, setNodes])

  useEffect(() => {
    setEdges(relations.map((relation): Edge<JourneyEdgeData> => ({
      id: relation.id,
      source: relation.source,
      target: relation.target,
      type: 'journeyEdge',
      selected: selection?.kind === 'relation' && selection.id === relation.id,
      data: { label: relation.label, direction: relation.direction, onSelect: selectRelation },
    })))
  }, [relations, selection, selectRelation, setEdges])

  const addRelation = useCallback((source: string, target: string) => {
    if (source === target) return
    const linked = relations.some((r) => (r.source === source && r.target === target) || (r.source === target && r.target === source))
    if (linked) {
      setWarning('Ces deux thèmes sont déjà reliés.')
      return
    }
    const relation: ThemeRelation = { id: `r${Date.now()}`, source, target, direction: 'forward', label: '' }
    onChangeRelations([...relations, relation])
    selectRelation(relation.id)
  }, [relations, onChangeRelations, selectRelation])

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) addRelation(connection.source, connection.target)
  }, [addRelation])

  const selectedRelation = selection?.kind === 'relation' ? relations.find((r) => r.id === selection.id) : undefined
  const selectedTheme = selection?.kind === 'theme' ? themes.find((t) => t.id === selection.id) : undefined
  const closePanel = () => setSelection(null)

  if (themes.length < 2) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Pas encore de parcours à dessiner</Typography>
        <Typography variant="body1" color="text.secondary">
          Décrivez au moins deux thèmes dans l’onglet Thèmes pour pouvoir les relier.
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 480, md: 'calc(100vh - 305px)' },
        minHeight: 400,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'background.default',
        // Les poignées de liaison n'apparaissent qu'au survol, sauf sur écran tactile.
        '& .react-flow__handle': { opacity: 0, transition: 'opacity 0.15s ease' },
        '& .react-flow__node:hover .react-flow__handle, & .react-flow__node.selected .react-flow__handle': { opacity: 1 },
        '@media (hover: none)': { '& .react-flow__handle': { opacity: 1 } },
      }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {ARROW_COLORS.map((color) => (
            <marker
              key={color}
              id={`journey-arrow-${color.replace('#', '')}`}
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

      <ReactFlow
        key={layoutVersion}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={(event, state) => {
          // Lâcher le trait n'importe où sur un thème suffit : viser sa poignée serait trop précis.
          if (state.isValid || !state.fromNode) return
          const point = 'changedTouches' in event ? event.changedTouches[0] : event
          const dropped = document.elementFromPoint(point.clientX, point.clientY)?.closest('.react-flow__node')
          const targetId = dropped?.getAttribute('data-id')
          if (targetId) addRelation(state.fromNode.id, targetId)
        }}
        onNodeClick={(_e, node) => setSelection({ kind: 'theme', id: node.id })}
        onEdgeClick={(_e, edge) => selectRelation(edge.id)}
        onPaneClick={closePanel}
        onNodeDragStop={(_e, node) => onChangePositions({ ...positions, [node.id]: node.position })}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.3}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <Panel position="top-left">
          <Typography variant="body2" color="text.secondary">
            Cliquez sur un thème pour le relier à un autre, ou tirez un trait de l’un à l’autre.
          </Typography>
        </Panel>
        {profile.positions && Object.keys(profile.positions).length > 0 && (
          <Panel position="bottom-right">
            <Button
              size="small"
              onClick={() => {
                onChangePositions({})
                setLayoutVersion((version) => version + 1)
              }}
            >
              Réorganiser
            </Button>
          </Panel>
        )}
      </ReactFlow>

      {(selectedRelation || selectedTheme) && (
        <Card
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 5,
            width: { xs: 'calc(100% - 32px)', sm: 320 },
            maxHeight: 'calc(100% - 32px)',
            overflowY: 'auto',
            p: 2.5,
          }}
        >
          {selectedRelation && (
            <RelationPanel
              relation={selectedRelation}
              themes={themes}
              onChange={(patch) => onChangeRelations(relations.map((r) => (r.id === selectedRelation.id ? { ...r, ...patch } : r)))}
              onDelete={() => {
                onChangeRelations(relations.filter((r) => r.id !== selectedRelation.id))
                closePanel()
              }}
              onClose={closePanel}
            />
          )}
          {selectedTheme && (
            <ThemePanel
              theme={selectedTheme}
              themes={themes}
              relations={relations}
              onEdit={() => onEditTheme(selectedTheme.id)}
              onLink={(targetId) => addRelation(selectedTheme.id, targetId)}
              onSelectRelation={selectRelation}
              onClose={closePanel}
            />
          )}
        </Card>
      )}

      <Snackbar
        open={Boolean(warning)}
        autoHideDuration={3000}
        onClose={() => setWarning('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setWarning('')}>{warning}</Alert>
      </Snackbar>
    </Box>
  )
}
