'use client'

import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  CheckCircleOutlined,
  ContentCopyOutlined,
  MoreVertOutlined,
  ScheduleOutlined,
  TuneOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import { useState } from 'react'
import { ImpactCard, PROFILE_CONFIG } from './impactCardsTypes'

const STATUS_CONFIG = {
  VALIDATED: { label: 'Validée', Icon: CheckCircleOutlined, color: '#065F46', bg: '#D1FAE5' },
  TO_VALIDATE: { label: 'À valider', Icon: ScheduleOutlined, color: '#92400E', bg: '#FEF3C7' },
  CUSTOM: { label: 'Personnalisée', Icon: TuneOutlined, color: '#1E40AF', bg: '#DBEAFE' },
}

interface Props {
  card: ImpactCard
  onClick: () => void
  onDuplicate: () => void
  onArchive: () => void
}

export default function ImpactCardItem({ card, onClick, onDuplicate, onArchive }: Props) {
  const cfg = PROFILE_CONFIG[card.profile]
  const statusCfg = STATUS_CONFIG[card.status]
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
  }

  const handleClose = () => setMenuAnchor(null)

  return (
    <Box
      onClick={onClick}
      sx={{
        width: 260,
        height: 390,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `3px solid ${cfg.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0,0,0,0.14)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: cfg.bg, px: 2, pt: 1.5, pb: 1 }}>
        <Chip
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: cfg.border,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 20,
            mb: 1,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: cfg.color,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {card.title}
        </Typography>
      </Box>

      {/* Center: icon + pattern + status badge */}
      <Box
        sx={{
          position: 'relative',
          height: 90,
          flexShrink: 0,
          bgcolor: cfg.bg,
          backgroundImage: cfg.pattern,
          backgroundSize: '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <cfg.Icon sx={{ fontSize: 28, color: cfg.border }} />
        </Box>

        {/* Status badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: statusCfg.bg,
            border: `1px solid ${statusCfg.color}`,
            borderRadius: '10px',
            px: 0.75,
            py: 0.25,
          }}
        >
          <statusCfg.Icon sx={{ fontSize: 11, color: statusCfg.color }} />
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: statusCfg.color, lineHeight: 1 }}>
            {statusCfg.label}
          </Typography>
        </Box>
      </Box>

      {/* Body: description + audiences */}
      <Box sx={{ flex: 1, px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            fontStyle: 'italic',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {card.description}
        </Typography>

        {/* Spécialisation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', whiteSpace: 'nowrap' }}>
            Spécialisation
          </Typography>
          <Box sx={{ flex: 1, height: 4, bgcolor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${card.specialization * 10}%`, bgcolor: cfg.border, borderRadius: 2 }} />
          </Box>
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', minWidth: 20 }}>
            {card.specialization}/10
          </Typography>
        </Box>

        {/* Audiences */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {card.targetAudiences.slice(0, 3).map((a) => (
            <Chip
              key={a}
              label={a}
              size="small"
              sx={{
                fontSize: '0.6rem',
                height: 18,
                bgcolor: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}40`,
              }}
            />
          ))}
          {card.targetAudiences.length > 3 && (
            <Chip
              label={`+${card.targetAudiences.length - 3}`}
              size="small"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: cfg.bg,
          px: 1.5,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={card.visibility === 'PUBLIC' ? 'Publique' : 'Privée'}>
            {card.visibility === 'PUBLIC'
              ? <VisibilityOutlined sx={{ fontSize: 14, color: cfg.color }} />
              : <VisibilityOffOutlined sx={{ fontSize: 14, color: cfg.color }} />
            }
          </Tooltip>
          <Typography sx={{ fontSize: '0.65rem', color: cfg.color }}>
            {card.lastUpdate}
          </Typography>
        </Box>

        <IconButton size="small" onClick={handleMenu} sx={{ p: 0.25 }}>
          <MoreVertOutlined sx={{ fontSize: 16, color: cfg.color }} />
        </IconButton>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleClose}>
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
    </Box>
  )
}
