'use client'

import React from 'react'
import { t } from '@lingui/core/macro'
import { Box, Button, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useStore from '@/stores/global_store'
import PerspectiveAvatar from './PerspectiveAvatar'
import { usePerspectiveUi } from './perspectiveUiStore'
import { toEntry, usePerspectiveNavigation } from './usePerspectiveNavigation'

/**
 * Option A : bandeau affiché en tête du contenu quand on consulte un autre espace que le sien.
 * Il rappelle à qui appartiennent les chiffres affichés et offre le retour en un clic.
 */
const PerspectiveBanner: React.FC = () => {
  const theme = useTheme()
  const { currentPerspective, ownPerspective, connectedUser } = useStore((s) => s.user)
  const { openPicker, variant } = usePerspectiveUi()
  const { goHome } = usePerspectiveNavigation()
  const entry = currentPerspective ? toEntry(currentPerspective) : null
  if (variant !== 'sidebar' || !entry || ownPerspective || !connectedUser) return null

  return (
    <Box
      role='region'
      aria-label={t`perspective_banner_region_aria`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 3,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        backgroundColor: 'navActive',
        color: 'text.primary',
      }}
    >
      <PerspectiveAvatar kind={entry.kind} label={entry.label} size={32} />
      <Typography variant='body2' sx={{ flexGrow: 1, minWidth: 200 }}>
        {entry.kind === 'person' ? t`perspective_banner_person` : t`perspective_banner_structure`}{' '}
        <strong>{entry.label}</strong>
        {entry.sublabel ? ` (${entry.sublabel})` : ''}.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size='small' color='inherit' onClick={(e) => openPicker(e.currentTarget)} sx={{ textTransform: 'none' }}>
          {t`perspective_change`}
        </Button>
        <Button size='small' variant='contained' onClick={goHome} sx={{ textTransform: 'none', boxShadow: 'none' }}>
          {t`perspective_back_home`}
        </Button>
      </Box>
    </Box>
  )
}

export default PerspectiveBanner
