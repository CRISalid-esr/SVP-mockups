'use client'

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  Announcement01,
  Award01,
  BookOpen01,
  Briefcase01,
  Calendar,
  Edit01,
  File02,
  GraduationHat01,
  Lightbulb01,
  Link01,
  Trash01,
  Users01,
} from '@untitled-ui/icons-react'

import { Activity, ActivityType } from '@/types/Activity'
import { CustomCard } from '@/components/Card'

type UntitledIcon = React.ComponentType<{
  size?: number
  style?: React.CSSProperties
  className?: string
  color?: string
}>

const Briefcase = Briefcase01 as UntitledIcon
const Users = Users01 as UntitledIcon
const BookOpen = BookOpen01 as UntitledIcon
const Lightbulb = Lightbulb01 as UntitledIcon
const Megaphone = Announcement01 as UntitledIcon
const Award = Award01 as UntitledIcon
const FileText = File02 as UntitledIcon
const GraduationCap = GraduationHat01 as UntitledIcon
const CalendarIcon = Calendar as UntitledIcon
const LinkIcon = Link01 as UntitledIcon
const EditIcon = Edit01 as UntitledIcon
const TrashIcon = Trash01 as UntitledIcon

// ─── Mappings ──────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<ActivityType, UntitledIcon> = {
  projet: Briefcase,
  encadrement: Users,
  editorial: BookOpen,
  brevet: Lightbulb,
  conference: Megaphone,
  distinction: Award,
  mediation: FileText,
  enseignement: GraduationCap,
}

const TYPE_LABELS: Record<ActivityType, string> = {
  projet: 'Projet',
  encadrement: 'Encadrement',
  editorial: 'Éditorial',
  brevet: 'Brevet',
  conference: 'Conférence',
  distinction: 'Distinction',
  mediation: 'Médiation',
  enseignement: 'Enseignement',
}

const TYPE_COLORS: Record<ActivityType, string> = {
  projet: '#006A61',
  encadrement: '#0088CC',
  editorial: '#9B59B6',
  brevet: '#F39C12',
  conference: '#E74C3C',
  distinction: '#D4AF37',
  mediation: '#16A085',
  enseignement: '#2ECC71',
}

// Human-readable labels for specificData keys
const DATA_LABELS: Record<string, string> = {
  budget: 'Budget',
  role: 'Rôle',
  student: 'Étudiant·e',
  level: 'Niveau',
  percentage: 'Encadrement',
  number: 'N° de dépôt',
  status: 'Statut',
  location: 'Lieu',
  type: "Type d'intervention",
  organization: 'Organisation',
  establishment: 'Établissement',
  hours: 'Heures',
  courseType: 'Type de cours',
  subject: 'Matière',
  journal: 'Revue',
}

interface ActivityCardProps {
  activity: Activity
  onEdit?: (activity: Activity) => void
  onDelete?: (activity: Activity) => void
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onEdit, onDelete }) => {
  const theme = useTheme()
  const Icon = TYPE_ICONS[activity.type] ?? FileText
  const color = TYPE_COLORS[activity.type] ?? theme.palette.text.secondary

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })

  const header = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Avatar
          sx={{
            backgroundColor: `${color}18`,
            width: 40,
            height: 40,
            borderRadius: 1.5,
            flexShrink: 0,
          }}
        >
          <Icon size={20} style={{ color }} />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3, fontSize: '0.95rem' }}>
            {activity.title}
          </Typography>
          <Chip
            label={TYPE_LABELS[activity.type]}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              backgroundColor: `${color}18`,
              color,
              fontWeight: 600,
              mt: 0.5,
            }}
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
        {onEdit && (
          <IconButton size="small" onClick={() => onEdit(activity)} sx={{ color: 'text.secondary' }}>
            <EditIcon size={16} />
          </IconButton>
        )}
        {onDelete && (
          <IconButton size="small" onClick={() => onDelete(activity)} sx={{ color: 'text.secondary' }}>
            <TrashIcon size={16} />
          </IconButton>
        )}
      </Box>
    </Box>
  )

  return (
    <CustomCard header={header}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {activity.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarIcon size={14} color={theme.palette.text.secondary as string} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(activity.startDate)}
              {activity.endDate ? ` – ${formatDate(activity.endDate)}` : ' – en cours'}
            </Typography>
          </Box>

          {activity.url && (
            <Box
              component="a"
              href={activity.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <LinkIcon size={14} />
              <Typography variant="caption" color="inherit">
                {'Lien externe'}
              </Typography>
            </Box>
          )}
        </Box>

        {activity.specificData && Object.keys(activity.specificData).length > 0 && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {Object.entries(activity.specificData).map(([key, value]) => (
                <Box key={key}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}
                  >
                    {DATA_LABELS[key] ?? key}
                  </Typography>
                  <Typography variant="caption">{String(value)}</Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </CustomCard>
  )
}

export default ActivityCard
