'use client'

import { useState } from 'react'
import {
  Box, Button, Checkbox, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControlLabel, IconButton,
  List, ListItem, ListItemText, Typography,
} from '@mui/material'
import {
  Add,
  Business as BusinessIcon,
  CalendarToday,
  Close as CloseIcon,
  LocalOffer,
  Person,
  Place,
} from '@mui/icons-material'
import { Node } from '@xyflow/react'
import { Activity, ActivityType } from '@/types/Activity'
import {
  ExpertiseNodeData,
  NODE_TYPE_CONFIG,
} from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RelatedExpertise {
  node: Node<ExpertiseNodeData>
  edgeLabel?: string
  directionArrow: 'to' | 'from' | 'both'
}

export interface ExpertiseEntry {
  node: Node<ExpertiseNodeData>
  relations: RelatedExpertise[]
}

interface Props {
  entry: ExpertiseEntry
  activities: Activity[]
  associatedIds: string[]
  onUpdateAssociations: (nodeId: string, ids: string[]) => void
  onGoToMindMap: () => void
}

// ─── Constantes ───────────────────────────────────────────────────────────────

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

const TEAL = '#006A61'

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

  const { node, relations } = entry
  const nodeData = node.data as ExpertiseNodeData
  const cfg = NODE_TYPE_CONFIG.expertise

  const associatedActivities = activities.filter((a) => associatedIds.includes(a.id))

  const openDialog = () => {
    setPendingIds([...associatedIds])
    setActivityDialogOpen(true)
  }

  const toggleActivity = (id: string) => {
    setPendingIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const saveDialog = () => {
    onUpdateAssociations(node.id, pendingIds)
    setActivityDialogOpen(false)
  }

  const hasAttrs = (
    (nodeData.temporal?.length ?? 0) +
    (nodeData.geographic?.length ?? 0) +
    (nodeData.persons?.length ?? 0) +
    (nodeData.organizations?.length ?? 0) +
    (nodeData.concepts?.length ?? 0)
  ) > 0

  const isEmpty = !hasAttrs && relations.length === 0 && associatedActivities.length === 0

  const dirArrow = (d: 'to' | 'from' | 'both') =>
    d === 'to' ? '→' : d === 'from' ? '←' : '↔'

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      border: '1px solid', borderColor: 'divider',
      borderLeft: `4px solid ${cfg.color}`,
      borderRadius: '0 8px 8px 0',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* En-tête */}
      <Box sx={{ p: 2.5, pb: isEmpty ? 2.5 : 1.5 }}>
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
            <Box component="span" onClick={onGoToMindMap}
              sx={{ color: cfg.color, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Enrichir dans la carte →
            </Box>
          </Typography>
        )}
      </Box>

      {/* Caractéristiques */}
      {hasAttrs && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Caractéristiques
            </Typography>

            {nodeData.temporal && nodeData.temporal.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CalendarToday sx={{ fontSize: 14, color: '#0288D1', mt: 0.2, flexShrink: 0 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {nodeData.temporal.map((t, i) => (
                    <Chip key={i} label={t.label} size="small"
                      sx={{ fontSize: '0.7rem', bgcolor: '#E3F2FD', color: '#0288D1', border: '1px solid #90CAF944' }} />
                  ))}
                </Box>
              </Box>
            )}

            {nodeData.geographic && nodeData.geographic.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Place sx={{ fontSize: 14, color: '#388E3C', mt: 0.2, flexShrink: 0 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {nodeData.geographic.map((g, i) => (
                    <Chip key={i} label={g.label} size="small"
                      sx={{ fontSize: '0.7rem', bgcolor: '#E8F5E9', color: '#388E3C', border: '1px solid #A5D6A744' }} />
                  ))}
                </Box>
              </Box>
            )}

            {nodeData.persons && nodeData.persons.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Person sx={{ fontSize: 14, color: '#7B1FA2', mt: 0.2, flexShrink: 0 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {nodeData.persons.map((p, i) => (
                    <Chip key={i} label={p.label} size="small"
                      sx={{ fontSize: '0.7rem', bgcolor: '#F3E5F5', color: '#7B1FA2', border: '1px solid #CE93D844' }} />
                  ))}
                </Box>
              </Box>
            )}

            {nodeData.organizations && nodeData.organizations.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <BusinessIcon sx={{ fontSize: 14, color: '#E65100', mt: 0.2, flexShrink: 0 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {nodeData.organizations.map((o, i) => (
                    <Chip key={i} label={o.label} size="small"
                      sx={{ fontSize: '0.7rem', bgcolor: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC8044' }} />
                  ))}
                </Box>
              </Box>
            )}

            {nodeData.concepts && nodeData.concepts.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocalOffer sx={{ fontSize: 14, color: TEAL, mt: 0.2, flexShrink: 0 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {nodeData.concepts.map((c, i) => (
                    <Chip key={i}
                      label={c.vocabulary ? `${c.label} · ${c.vocabulary.toUpperCase()}` : c.label}
                      size="small"
                      sx={{ fontSize: '0.7rem', bgcolor: `${TEAL}10`, color: TEAL, border: `1px solid ${TEAL}33` }} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* Relations */}
      {relations.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
              Relations avec d&apos;autres expertises
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {relations.map(({ node: other, edgeLabel, directionArrow }, i) => {
                const otherData = other.data as ExpertiseNodeData
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: TEAL, fontWeight: 700, flexShrink: 0 }}>
                      {dirArrow(directionArrow)}
                    </Typography>
                    {edgeLabel && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', flexShrink: 0 }}>
                        {edgeLabel}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{otherData.label}</Typography>
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
          <Button size="small" startIcon={<Add sx={{ fontSize: '14px !important' }} />} onClick={openDialog}
            sx={{ textTransform: 'none', fontSize: '0.72rem', color: cfg.color, minWidth: 0, py: 0.25 }}>
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
                <Chip key={a.id} label={a.title} size="small"
                  sx={{ fontSize: '0.7rem', maxWidth: 200, bgcolor: `${color}12`, color, border: `1px solid ${color}33` }} />
              )
            })}
          </Box>
        )}
      </Box>

      {/* Dialog — lier des activités */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {`Associer des activités à « ${nodeData.label} »`}
          <IconButton size="small" onClick={() => setActivityDialogOpen(false)}>
            <CloseIcon fontSize="small" />
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
                      <Checkbox checked={checked} onChange={() => toggleActivity(a.id)} size="small"
                        sx={{ color: cfg.color, '&.Mui-checked': { color: cfg.color } }} />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={ACTIVITY_TYPE_LABELS[a.type]} size="small"
                          sx={{ fontSize: '0.6rem', height: 18, bgcolor: `${color}12`, color, border: `1px solid ${color}33` }} />
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
          <Button variant="contained" onClick={saveDialog}
            sx={{ bgcolor: cfg.color, '&:hover': { bgcolor: cfg.color }, filter: 'brightness(0.9)', textTransform: 'none' }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
