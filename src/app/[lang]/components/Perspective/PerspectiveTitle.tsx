'use client'

import React from 'react'
import { t } from '@lingui/core/macro'
import { Box, ButtonBase, Link } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import useStore from '@/stores/global_store'
import { usePerspectiveUi } from './perspectiveUiStore'
import { usePerspectiveNavigation } from './usePerspectiveNavigation'

/**
 * Option B : le nom affiché dans le titre de page sert de sélecteur.
 * La commande est là où l'on regarde ; aucun bandeau n'est nécessaire.
 */
const PerspectiveTitle: React.FC<{ name: string }> = ({ name }) => {
  const theme = useTheme()
  const { ownPerspective, connectedUser } = useStore((s) => s.user)
  const { anchorEl, openPicker } = usePerspectiveUi()
  const { goHome } = usePerspectiveNavigation()

  return (
    <>
      <ButtonBase
        data-tour='perspective'
        aria-label={`${t`perspective_current_aria`} ${name}. ${t`perspective_change`}`}
        aria-haspopup='menu'
        aria-expanded={Boolean(anchorEl)}
        onClick={(e) => openPicker(e.currentTarget)}
        sx={{
          font: 'inherit',
          color: theme.palette.primary.main,
          textAlign: 'left',
          verticalAlign: 'baseline',
          borderBottom: `2px dashed ${theme.palette.primary.main}`,
          borderRadius: 0.5,
          '&:hover': { backgroundColor: 'navActive' },
          '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
        }}
      >
        {name}
        <KeyboardArrowDownIcon sx={{ fontSize: '0.9em', ml: 0.25 }} aria-hidden />
      </ButtonBase>
      {!ownPerspective && connectedUser && (
        <Box component='span' sx={{ display: 'block', mt: 0.5, fontSize: 14, fontWeight: 400, lineHeight: 1.5 }}>
          <Link component='button' underline='always' onClick={goHome} sx={{ font: 'inherit', verticalAlign: 'baseline' }}>
            {t`perspective_back_home`}
          </Link>
        </Box>
      )}
    </>
  )
}

export default PerspectiveTitle
