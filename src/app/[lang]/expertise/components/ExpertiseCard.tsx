'use client'

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Biotech,
  Business,
  CalendarToday,
  Computer,
  Delete,
  Functions,
  Groups,
  Hub,
  LocationOn,
  MoreVert,
  Psychology,
  Public,
  School,
  Science,
  Tv,
  Visibility,
} from '@mui/icons-material'
import { Expertise, ExpertiseLevel } from '@/types/Expertise'
import { CustomCard } from '@/components/Card'

// ─── Mappings ──────────────────────────────────────────────────────────────

export const CATEGORIES: { name: string; icon: React.ElementType; color: string }[] = [
  { name: 'Informatique & IA', icon: Computer, color: '#006A61' },
  { name: 'Sciences de la vie', icon: Biotech, color: '#0088CC' },
  { name: 'Sciences & Technologies', icon: Science, color: '#F39C12' },
  { name: 'Sciences sociales', icon: Groups, color: '#9B59B6' },
  { name: 'Mathématiques', icon: Functions, color: '#16A085' },
  { name: 'Sciences de la Terre', icon: Public, color: '#E74C3C' },
  { name: 'Interdisciplinaire', icon: Hub, color: '#D4AF37' },
  { name: 'Santé', icon: Psychology, color: '#E91E63' },
]

export const LEVEL_INFO: Record<ExpertiseLevel, { label: string; color: string; description: string }> = {
  veille: {
    label: 'Intérêt secondaire / Veille',
    color: '#94a3b8',
    description: 'Je suis le sujet, je peux en discuter de manière informelle',
  },
  enseignement: {
    label: "Expertise d'enseignement",
    color: '#3b82f6',
    description: "Je maîtrise le sujet suffisamment pour l'enseigner",
  },
  recherche: {
    label: 'Expertise de recherche active',
    color: '#f59e0b',
    description: 'Je publie actuellement sur ce sujet',
  },
  reference: {
    label: 'Expertise de référence (Senior)',
    color: '#10b981',
    description: 'Je suis reconnu par mes pairs comme une référence',
  },
}

const ZONE_STYLES: Record<string, { bg: string; color: string }> = {
  country: { bg: '#e0f2fe', color: '#0369a1' },
  geopolitical: { bg: '#fef3c7', color: '#92400e' },
  physical: { bg: '#dcfce7', color: '#166534' },
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface ExpertiseCardProps {
  expertise: Expertise
  onEdit: (expertise: Expertise) => void
  onDelete: (expertise: Expertise) => void
}

// ─── Component ─────────────────────────────────────────────────────────────

const ExpertiseCard: React.FC<ExpertiseCardProps> = ({ expertise, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const catMeta = CATEGORIES.find((c) => c.name === expertise.category)
  const CatIcon = catMeta?.icon ?? Hub
  const catColor = catMeta?.color ?? '#6b7280'
  const levelInfo = LEVEL_INFO[expertise.level]

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })

  const periodLabel =
    expertise.temporalPeriod.type === 'custom'
      ? `${expertise.temporalPeriod.startYear} – ${expertise.temporalPeriod.endYear}`
      : (expertise.temporalPeriod.label ?? '')

  const header = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
        <Avatar
          sx={{
            bgcolor: `${catColor}18`,
            width: 44,
            height: 44,
            borderRadius: 1.5,
            flexShrink: 0,
          }}
        >
          <CatIcon sx={{ color: catColor, fontSize: 22 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>
              {expertise.name}
            </Typography>
            <Tooltip title={levelInfo.description} arrow placement="top">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: levelInfo.color,
                  cursor: 'help',
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {expertise.category}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Chip
          label={levelInfo.label}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            bgcolor: `${levelInfo.color}18`,
            color: levelInfo.color,
            fontWeight: 600,
          }}
        />
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onEdit(expertise)
          }}
        >
          {'Modifier'}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onDelete(expertise)
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          {'Supprimer'}
        </MenuItem>
      </Menu>
    </Box>
  )

  return (
    <CustomCard header={header}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {expertise.description}
        </Typography>

        {/* Zones géographiques */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {'Zones géographiques'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {expertise.geographicZones.map((zone, i) => {
              const s = ZONE_STYLES[zone.type] ?? { bg: '#f3f4f6', color: '#374151' }
              return (
                <Chip
                  key={i}
                  label={zone.name}
                  size="small"
                  sx={{ fontSize: '0.7rem', bgcolor: s.bg, color: s.color }}
                />
              )
            })}
          </Box>
        </Box>

        {/* Période */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
            {'Période :'}
          </Typography>
          <Chip
            label={periodLabel}
            size="small"
            sx={{ fontSize: '0.7rem', bgcolor: '#f3f4f6' }}
          />
        </Box>

        {/* Disponibilités */}
        {(expertise.availability.pressWritten ||
          expertise.availability.pressTvRadio ||
          expertise.availability.academicConferences ||
          expertise.availability.publicExpertise) && (
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}
            >
              {'Disponibilités :'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {expertise.availability.pressWritten && (
                <Tooltip title="Presse écrite / Web">
                  <Chip icon={<Visibility sx={{ fontSize: '14px !important' }} />} label="Presse" size="small" sx={{ fontSize: '0.7rem' }} />
                </Tooltip>
              )}
              {expertise.availability.pressTvRadio && (
                <Tooltip title="TV / Radio">
                  <Chip icon={<Tv sx={{ fontSize: '14px !important' }} />} label="TV/Radio" size="small" sx={{ fontSize: '0.7rem' }} />
                </Tooltip>
              )}
              {expertise.availability.academicConferences && (
                <Tooltip title="Colloques académiques">
                  <Chip icon={<School sx={{ fontSize: '14px !important' }} />} label="Colloques" size="small" sx={{ fontSize: '0.7rem' }} />
                </Tooltip>
              )}
              {expertise.availability.publicExpertise && (
                <Tooltip title="Expertise publique">
                  <Chip icon={<Business sx={{ fontSize: '14px !important' }} />} label="Expertise publique" size="small" sx={{ fontSize: '0.7rem' }} />
                </Tooltip>
              )}
            </Box>
          </Box>
        )}

        <Divider />

        {/* Chiffres clés */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { value: expertise.publications, label: 'Publications' },
            { value: expertise.thesesEncadrees, label: 'Thèses' },
            { value: expertise.brevets, label: 'Brevets' },
            { value: expertise.projects, label: 'Projets' },
          ].map((stat) => (
            <Box key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#006A61', fontWeight: 600 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Mots-clés */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {expertise.keywords.slice(0, 3).map((kw, i) => (
            <Chip
              key={i}
              label={kw}
              size="small"
              sx={{ bgcolor: '#f3f4f6', fontSize: '0.75rem' }}
            />
          ))}
          {expertise.keywords.length > 3 && (
            <Chip
              label={`+${expertise.keywords.length - 3}`}
              size="small"
              sx={{ bgcolor: '#e5e7eb', fontSize: '0.75rem', fontWeight: 600 }}
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {`Mise à jour : ${formatDate(expertise.lastUpdate)}`}
        </Typography>
      </Box>
    </CustomCard>
  )
}

export default ExpertiseCard
