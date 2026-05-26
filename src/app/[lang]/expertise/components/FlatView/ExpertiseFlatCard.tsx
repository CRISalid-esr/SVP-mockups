'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  AccountTree,
  Add,
  CalendarToday,
  Close,
  CompareArrows,
  FolderOpen,
  HelpOutline,
  LocalLibrary,
  Place,
  Psychology,
  TravelExplore,
  TrendingFlat,
} from '@mui/icons-material'
import { Node } from '@xyflow/react'
import { Activity, ActivityType } from '@/types/Activity'
import {
  ExpertiseNodeData,
  ExpertiseNodeType,
  NODE_TYPE_CONFIG,
  RELATION_TYPES,
  RelationTypeKey,
} from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConnectedNode {
  node: Node<ExpertiseNodeData>
  relationType: RelationTypeKey
}

export interface ExpertiseEntry {
  node: Node<ExpertiseNodeData>
  terrains: ConnectedNode[]
  concepts: ConnectedNode[]
  hierarchyOut: ConnectedNode[]  // cette expertise → autre
  hierarchyIn: ConnectedNode[]   // autre expertise → cette expertise
  dialogue: ConnectedNode[]
}

interface Props {
  entry: ExpertiseEntry
  activities: Activity[]
  associatedIds: string[]
  onUpdateAssociations: (nodeId: string, ids: string[]) => void
  onGoToMindMap: () => void
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const TERRAIN_ICONS: Record<string, React.ElementType> = {
  terrain_geo: Place,
  terrain_temp: CalendarToday,
  cas_etude: TravelExplore,
  corpus: FolderOpen,
}

const CONCEPT_ICONS: Record<string, React.ElementType> = {
  mobilise: Psychology,
  problematise: HelpOutline,
  produit: LocalLibrary,
}

const DIALOGUE_ICONS: Record<string, React.ElementType> = {
  croise: CompareArrows,
  articule: AccountTree,
  a_conduit_a: TrendingFlat,
  en_tension: CompareArrows,
}

const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  projet: '#006A61',
  encadrement: '#0088CC',
  editorial: '#9B59B6',
  brevet: '#F39C12',
  conference: '#E74C3C',
  distinction: '#D4AF37',
  mediation: '#16A085',
  enseignement: '#2ECC71',
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  projet: 'Projet',
  encadrement: 'Encadrement',
  editorial: 'Éditorial',
  brevet: 'Brevet',
  conference: 'Conférence',
  distinction: 'Distinction',
  mediation: 'Médiation',
  enseignement: 'Enseignement',
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ExpertiseFlatCard({
  entry,
  activities,
  associatedIds,
  onUpdateAssociations,
  onGoToMindMap,
}: Props) {
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [pendingIds, setPendingIds] = useState<string[]>([])

  const { node, terrains, concepts, hierarchyOut, hierarchyIn, dialogue } = entry
  const nodeData = node.data as ExpertiseNodeData
  const cfg = NODE_TYPE_CONFIG[nodeData.nodeType]

  const associatedActivities = activities.filter((a) => associatedIds.includes(a.id))

  const openDialog = () => {
    setPendingIds([...associatedIds])
    setActivityDialogOpen(true)
  }

  const toggleActivity = (id: string) => {
    setPendingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const saveDialog = () => {
    onUpdateAssociations(node.id, pendingIds)
    setActivityDialogOpen(false)
  }

  const isEmpty =
    terrains.length === 0 &&
    concepts.length === 0 &&
    hierarchyOut.length === 0 &&
    hierarchyIn.length === 0 &&
    dialogue.length === 0 &&
    associatedActivities.length === 0

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: '0 8px 8px 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* En-tête */}
      <Box sx={{ p: 2.5, pb: isEmpty ? 2.5 : 1.5 }}>
        <Chip
          label={cfg.label}
          size="small"
          sx={{
            mb: 1,
            fontSize: '0.65rem',
            fontWeight: 700,
            height: 20,
            bgcolor: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.color}44`,
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: nodeData.description ? 0.5 : 0 }}>
          {nodeData.label}
        </Typography>
        {nodeData.description && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {nodeData.description}
          </Typography>
        )}
        {isEmpty && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
            Aucun élément rattaché.{' '}
            <Box
              component="span"
              onClick={onGoToMindMap}
              sx={{ color: cfg.color, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Enrichir dans la carte mentale →
            </Box>
          </Typography>
        )}
      </Box>

      {/* Terrains */}
      {terrains.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#E65100', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
              Terrains de recherche
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {terrains.map(({ node: t, relationType }) => {
                const Icon = TERRAIN_ICONS[relationType] ?? Place
                const relCfg = RELATION_TYPES[relationType]
                return (
                  <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon sx={{ fontSize: 16, color: '#E65100', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {(t.data as ExpertiseNodeData).label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {relCfg.label}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </>
      )}

      {/* Concepts */}
      {concepts.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#7B1FA2', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
              Concepts
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {concepts.map(({ node: c, relationType }) => {
                const Icon = CONCEPT_ICONS[relationType] ?? Psychology
                const relCfg = RELATION_TYPES[relationType]
                return (
                  <Tooltip key={c.id} title={relCfg.label} placement="top" arrow>
                    <Chip
                      icon={<Icon sx={{ fontSize: '14px !important', color: '#7B1FA2 !important' }} />}
                      label={(c.data as ExpertiseNodeData).label}
                      size="small"
                      sx={{
                        fontSize: '0.75rem',
                        bgcolor: '#F3E5F5',
                        color: '#7B1FA2',
                        border: '1px solid #CE93D844',
                        '& .MuiChip-icon': { color: '#7B1FA2' },
                      }}
                    />
                  </Tooltip>
                )
              })}
            </Box>
          </Box>
        </>
      )}

      {/* Relations avec d'autres expertises */}
      {(hierarchyOut.length > 0 || hierarchyIn.length > 0 || dialogue.length > 0) && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976D2', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
              Relations avec d&apos;autres expertises
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {hierarchyOut.map(({ node: other, relationType }) => {
                const relCfg = RELATION_TYPES[relationType]
                const otherData = other.data as ExpertiseNodeData
                const otherCfg = NODE_TYPE_CONFIG[otherData.nodeType]
                return (
                  <Box key={other.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingFlat sx={{ fontSize: 16, color: '#006A61' }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>{relCfg.label} </Box>
                      <Box component="span" sx={{ fontWeight: 600, color: otherCfg.color }}>{otherData.label}</Box>
                    </Typography>
                  </Box>
                )
              })}
              {hierarchyIn.map(({ node: other, relationType }) => {
                const relCfg = RELATION_TYPES[relationType]
                const otherData = other.data as ExpertiseNodeData
                const otherCfg = NODE_TYPE_CONFIG[otherData.nodeType]
                return (
                  <Box key={other.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingFlat sx={{ fontSize: 16, color: '#006A61', transform: 'rotate(180deg)' }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600, color: otherCfg.color }}>{otherData.label}</Box>
                      <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}> {relCfg.label} cette expertise</Box>
                    </Typography>
                  </Box>
                )
              })}
              {dialogue.map(({ node: other, relationType }) => {
                const relCfg = RELATION_TYPES[relationType]
                const otherData = other.data as ExpertiseNodeData
                const otherCfg = NODE_TYPE_CONFIG[otherData.nodeType]
                const Icon = DIALOGUE_ICONS[relationType] ?? CompareArrows
                const isEnTension = relationType === 'en_tension'
                return (
                  <Box key={other.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon sx={{ fontSize: 16, color: isEnTension ? '#C62828' : '#1976D2' }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: isEnTension ? '#C62828' : 'text.secondary', fontStyle: 'italic' }}>{relCfg.label} </Box>
                      <Box component="span" sx={{ fontWeight: 600, color: otherCfg.color }}>{otherData.label}</Box>
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </>
      )}

      {/* Activités associées */}
      <Divider />
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Activités associées
          </Typography>
          <Button
            size="small"
            startIcon={<Add sx={{ fontSize: '14px !important' }} />}
            onClick={openDialog}
            sx={{ textTransform: 'none', fontSize: '0.72rem', color: cfg.color, minWidth: 0, py: 0.25 }}
          >
            Associer
          </Button>
        </Box>
        {associatedActivities.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Aucune activité associée
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {associatedActivities.map((a) => {
              const color = ACTIVITY_TYPE_COLORS[a.type]
              return (
                <Chip
                  key={a.id}
                  label={a.title}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    maxWidth: 200,
                    bgcolor: `${color}12`,
                    color,
                    border: `1px solid ${color}33`,
                  }}
                />
              )
            })}
          </Box>
        )}
      </Box>

      {/* Dialog — lier des activités */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Associer des activités à « {nodeData.label} »
          <IconButton size="small" onClick={() => setActivityDialogOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List dense disablePadding>
            {activities.map((a) => {
              const color = ACTIVITY_TYPE_COLORS[a.type]
              const checked = pendingIds.includes(a.id)
              return (
                <ListItem key={a.id} disablePadding sx={{ px: 2, py: 0.5, '&:hover': { bgcolor: 'action.hover' } }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleActivity(a.id)}
                        size="small"
                        sx={{ color: cfg.color, '&.Mui-checked': { color: cfg.color } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={ACTIVITY_TYPE_LABELS[a.type]}
                          size="small"
                          sx={{ fontSize: '0.6rem', height: 18, bgcolor: `${color}12`, color, border: `1px solid ${color}33` }}
                        />
                        <ListItemText
                          primary={a.title}
                          secondary={new Date(a.startDate).getFullYear()}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: checked ? 600 : 400 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </ListItem>
              )
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)} sx={{ textTransform: 'none' }}>Annuler</Button>
          <Button
            variant="contained"
            onClick={saveDialog}
            sx={{ bgcolor: cfg.color, '&:hover': { bgcolor: cfg.color }, filter: 'brightness(0.9)', textTransform: 'none' }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
