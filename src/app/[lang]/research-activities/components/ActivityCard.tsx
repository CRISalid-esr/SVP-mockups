'use client'

import React, { useState } from 'react'
import { DeleteOutline, EditOutlined, MoreHoriz, OpenInNew } from '@mui/icons-material'
import {
  Box,
  Card,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { Activity } from '@/types/Activity'
import { ACTIVITY_TYPES, isPunctual } from './activityTypes'

// Libellés des informations propres à chaque type
const DATA_LABELS: Record<string, string> = {
  budget: 'Budget',
  role: 'Rôle',
  student: 'Personne encadrée',
  thesisTitle: 'Sujet',
  currentPosition: 'Devenir',
  funder: 'Financeur',
  awardId: 'Référence',
  category: 'Nature',
  scope: 'Échelle',
  body: 'Instance',
  level: 'Niveau',
  percentage: 'Encadrement',
  number: 'N° de dépôt',
  status: 'État',
  location: 'Lieu',
  audience: 'Public cible',
  type: 'Intervention',
  organization: 'Organisation',
  establishment: 'Établissement',
  hours: 'Heures',
  courseType: 'Type de cours',
  subject: 'Matière',
  journal: 'Revue',
}

/** Sur la carte, deux informations suffisent ; le reste s'ouvre avec Modifier. */
const MAX_FACTS = 2

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })

interface ActivityCardProps {
  activity: Activity
  onEdit?: (activity: Activity) => void
  onDelete?: (activity: Activity) => void
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onEdit, onDelete }) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const style = ACTIVITY_TYPES[activity.type]
  const Icon = style.icon
  const facts = Object.entries(activity.specificData ?? {}).slice(0, MAX_FACTS)

  return (
    <Card component='article' sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2, bgcolor: style.tint }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 3,
            bgcolor: style.main,
            color: '#fff',
          }}
        >
          <Icon size={22} />
        </Box>
        <Typography variant='body1' sx={{ flex: 1, minWidth: 0, fontWeight: 600, color: style.ink }}>
          {style.label}
        </Typography>
        {(onEdit || onDelete) && (
          <>
            <IconButton
              aria-label={`Actions sur ${activity.title}`}
              aria-haspopup='menu'
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={{ color: style.ink }}
            >
              <MoreHoriz />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {onEdit && (
                <MenuItem onClick={() => { setMenuAnchor(null); onEdit(activity) }}>
                  <ListItemIcon><EditOutlined fontSize='small' /></ListItemIcon>
                  Modifier
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem onClick={() => { setMenuAnchor(null); onDelete(activity) }} sx={{ color: 'error.main' }}>
                  <ListItemIcon sx={{ color: 'inherit' }}><DeleteOutline fontSize='small' /></ListItemIcon>
                  Supprimer
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 3 }}>
        <Box>
          <Typography variant='h6' component='h2'>{activity.title}</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            {formatDate(activity.startDate)}
            {activity.endDate
              ? formatDate(activity.endDate) === formatDate(activity.startDate) ? '' : ` – ${formatDate(activity.endDate)}`
              : isPunctual(activity.type) ? '' : ' – en cours'}
            {activity.source && ` · Source : ${activity.source.label}`}
          </Typography>
        </Box>

        <Typography
          variant='body1'
          color='text.secondary'
          title={activity.description}
          sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {activity.description}
        </Typography>

        {facts.length > 0 && (
          <Box component='dl' sx={{ m: 0, mt: 'auto', pt: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
            {facts.map(([key, value]) => (
              <Box key={key} sx={{ minWidth: 0 }}>
                <Typography component='dt' variant='body2' color='text.secondary'>{DATA_LABELS[key] ?? key}</Typography>
                <Typography component='dd' variant='body1' sx={{ m: 0, fontWeight: 500, overflowWrap: 'anywhere' }}>
                  {String(value)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {activity.url && (
          <Link
            href={activity.url}
            target='_blank'
            rel='noopener noreferrer'
            underline='hover'
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', fontWeight: 500, color: style.ink }}
          >
            Voir le site <OpenInNew sx={{ fontSize: 14 }} aria-hidden />
          </Link>
        )}
      </Box>
    </Card>
  )
}

export default ActivityCard
