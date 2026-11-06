'use client'

import React from 'react'
import { t } from '@lingui/core/macro'
import { Box, ButtonBase, Tooltip, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import useStore from '@/stores/global_store'
import PerspectiveAvatar from './PerspectiveAvatar'
import { usePerspectiveUi } from './perspectiveUiStore'
import { toEntry } from './usePerspectiveNavigation'

/**
 * Option A : déclencheur en tête de barre latérale. Il montre en permanence quel espace est affiché
 * et invite à en changer. Remplace l'ancien champ « Chercher ».
 */
const PerspectiveSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const theme = useTheme()
  const { currentPerspective, ownPerspective } = useStore((s) => s.user)
  const { anchorEl, openPicker, variant } = usePerspectiveUi()
  const entry = currentPerspective ? toEntry(currentPerspective) : null
  if (variant !== 'sidebar' || !entry) return null

  const caption = ownPerspective
    ? t`perspective_switcher_own`
    : entry.kind === 'person'
      ? t`perspective_switcher_person`
      : t`perspective_switcher_structure`
  const ariaLabel = `${t`perspective_current_aria`} ${entry.label}. ${t`perspective_change`}`

  if (compact) {
    return (
      <Tooltip title={`${entry.label} · ${t`perspective_change`}`} placement='right'>
        <ButtonBase
          data-tour='perspective'
          aria-label={ariaLabel}
          aria-haspopup='menu'
          aria-expanded={Boolean(anchorEl)}
          onClick={(e) => openPicker(e.currentTarget)}
          sx={{ borderRadius: '50%', mx: 'auto', display: 'flex', '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 } }}
        >
          <PerspectiveAvatar kind={entry.kind} label={entry.label} size={40} />
        </ButtonBase>
      </Tooltip>
    )
  }

  return (
    <ButtonBase
      data-tour='perspective'
      aria-label={ariaLabel}
      aria-haspopup='menu'
      aria-expanded={Boolean(anchorEl)}
      onClick={(e) => openPicker(e.currentTarget)}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.25,
        borderRadius: 2,
        textAlign: 'left',
        color: 'text.primary',
        border: `1px solid ${ownPerspective ? theme.palette.divider : theme.palette.primary.main}`,
        backgroundColor: ownPerspective ? 'transparent' : 'navActive',
        transition: 'background-color .15s',
        '&:hover': { backgroundColor: ownPerspective ? 'navHover' : 'navActive' },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      }}
    >
      <PerspectiveAvatar kind={entry.kind} label={entry.label} size={36} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant='caption' component='div' color='text.secondary' sx={{ lineHeight: 1.3 }}>
          {caption}
        </Typography>
        <Typography variant='body2' fontWeight={600} noWrap sx={{ lineHeight: 1.35 }}>
          {entry.label}
        </Typography>
      </Box>
      <UnfoldMoreIcon fontSize='small' sx={{ opacity: 0.8 }} />
    </ButtonBase>
  )
}

export default PerspectiveSwitcher
