'use client'

import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  CheckCircleOutlined,
  ContentCopyOutlined,
  MoreVertOutlined,
  ScheduleOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import { useState } from 'react'
import { ImpactCard, PROFILE_CONFIG } from './impactCardsTypes'

const STATUS_CONFIG = {
  VALIDATED: { label: 'Validée', Icon: CheckCircleOutlined, color: '#065F46', bg: '#D1FAE5' },
  TO_VALIDATE: { label: 'À valider', Icon: ScheduleOutlined, color: '#92400E', bg: '#FEF3C7' },
}

interface Props {
  card: ImpactCard
  onClick: () => void
  onDuplicate: () => void
  onArchive: () => void
  /** Présent quand la fiche est en attente de validation : action rapide « Valider ». */
  onValidate?: () => void
}

export default function ImpactCardItem({ card, onClick, onDuplicate, onArchive, onValidate }: Props) {
  const cfg = PROFILE_CONFIG[card.profile]
  const statusCfg = STATUS_CONFIG[card.status]
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
  }

  const handleClose = () => setMenuAnchor(null)

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        borderLeft: `4px solid ${cfg.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: '100%',
        cursor: 'pointer',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* En-tête : public visé + statut + visibilité + menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          icon={<cfg.Icon sx={{ fontSize: 14 }} />}
          label={cfg.label}
          sx={{
            height: 22, fontSize: '0.68rem', fontWeight: 700,
            bgcolor: cfg.bg, color: cfg.color,
            '& .MuiChip-icon': { color: cfg.border },
          }}
        />
        <Chip
          size="small"
          icon={<statusCfg.Icon sx={{ fontSize: 13 }} />}
          label={statusCfg.label}
          sx={{
            height: 22, fontSize: '0.68rem', fontWeight: 600,
            bgcolor: statusCfg.bg, color: statusCfg.color,
            '& .MuiChip-icon': { color: statusCfg.color },
          }}
        />
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Tooltip title={card.visibility === 'PUBLIC' ? 'Visible sur votre profil public' : 'Privée — visible par vous seul·e'}>
            {card.visibility === 'PUBLIC'
              ? <VisibilityOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
              : <VisibilityOffOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
            }
          </Tooltip>
          <IconButton size="small" onClick={handleMenu} sx={{ p: 0.25 }}>
            <MoreVertOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Titre + description */}
      <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>
        {card.title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {card.description}
      </Typography>

      {/* Audiences */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {card.targetAudiences.slice(0, 4).map((a) => (
          <Chip
            key={a}
            label={a}
            size="small"
            sx={{ fontSize: '0.65rem', height: 20, bgcolor: cfg.bg, color: cfg.color }}
          />
        ))}
        {card.targetAudiences.length > 4 && (
          <Chip
            label={`+${card.targetAudiences.length - 4}`}
            size="small"
            sx={{ fontSize: '0.65rem', height: 20 }}
          />
        )}
      </Box>

      {/* Pied : spécialisation + date + validation rapide */}
      <Box sx={{
        mt: 'auto', pt: 1, display: 'flex', alignItems: 'center', gap: 1,
        borderTop: '1px solid', borderColor: 'divider',
      }}>
        <Tooltip title="Niveau de spécialisation : 1 (grand public) → 10 (très spécialisé)">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', whiteSpace: 'nowrap' }}>
              Spécialisation
            </Typography>
            <Box sx={{ width: 64, height: 5, bgcolor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${card.specialization * 10}%`, bgcolor: cfg.border, borderRadius: 2 }} />
            </Box>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
              {card.specialization}/10
            </Typography>
          </Box>
        </Tooltip>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {onValidate ? (
            <Button
              size="small"
              startIcon={<CheckCircleOutlined sx={{ fontSize: '15px !important' }} />}
              onClick={(e) => { e.stopPropagation(); onValidate() }}
              sx={{ textTransform: 'none', color: '#065F46', py: 0, minHeight: 24, fontSize: '0.72rem', fontWeight: 700 }}
            >
              Valider
            </Button>
          ) : (
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
              {card.lastUpdate}
            </Typography>
          )}
        </Box>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleClose}>
        {onValidate && (
          <MenuItem
            dense
            onClick={(e) => { e.stopPropagation(); onValidate(); handleClose() }}
            sx={{ color: '#065F46' }}
          >
            <CheckCircleOutlined fontSize="small" sx={{ mr: 1 }} /> Valider cette fiche
          </MenuItem>
        )}
        <MenuItem
          dense
          onClick={(e) => { e.stopPropagation(); onDuplicate(); handleClose() }}
        >
          <ContentCopyOutlined fontSize="small" sx={{ mr: 1 }} /> Dupliquer
        </MenuItem>
        <MenuItem
          dense
          onClick={(e) => { e.stopPropagation(); onArchive(); handleClose() }}
          sx={{ color: 'error.main' }}
        >
          Archiver
        </MenuItem>
      </Menu>
    </Paper>
  )
}
