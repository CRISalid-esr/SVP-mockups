'use client'

import React from 'react'
import { t } from '@lingui/core/macro'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PerspectiveVariant, usePerspectiveUi } from './perspectiveUiStore'

/** Commande de maquette : compare les deux emplacements du sélecteur. À retirer une fois le choix fait. */
const PerspectiveVariantSwitch: React.FC = () => {
  const theme = useTheme()
  const { variant, setVariant } = usePerspectiveUi()

  return (
    <Box sx={{ color: theme.palette.primaryContainer, mb: 1.5 }}>
      <Typography variant='caption' component='div' sx={{ opacity: 0.8, mb: 0.5 }}>
        {t`perspective_variant_label`}
      </Typography>
      <ToggleButtonGroup
        size='small'
        exclusive
        fullWidth
        value={variant}
        onChange={(_e, v: PerspectiveVariant | null) => v && setVariant(v)}
        aria-label={t`perspective_variant_label`}
        sx={{
          '& .MuiToggleButton-root': {
            color: 'inherit',
            textTransform: 'none',
            py: 0.25,
            borderColor: 'rgba(255,255,255,0.3)',
          },
          '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primaryContainer,
          },
        }}
      >
        <ToggleButton value='sidebar'>{t`perspective_variant_sidebar`}</ToggleButton>
        <ToggleButton value='title'>{t`perspective_variant_title`}</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

export default PerspectiveVariantSwitch
