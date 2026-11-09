import React, { useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, ButtonBase, Collapse, Typography } from '@mui/material'

interface Props {
  /** Ce que contient la section, sur une ligne : « Langues, frais de publication ». */
  summary: string
  children: React.ReactNode
}

/**
 * Analyses complémentaires, repliées par défaut. Les graphiques ne sont montés qu'à l'ouverture :
 * ECharts mesure son conteneur au premier rendu.
 */
const DashboardDetails = ({ summary, children }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <Box component='section'>
      <ButtonBase
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        sx={{
          width: '100%',
          minHeight: 56,
          justifyContent: 'flex-start',
          gap: 2,
          px: 0.5,
          textAlign: 'left',
          borderTop: '1px solid',
          borderBottom: open ? 'none' : '1px solid',
          borderColor: 'divider',
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 2 }}>
          <Typography fontWeight={600}>Analyses détaillées</Typography>
          <Typography variant='body2' color='text.secondary'>{summary}</Typography>
        </Box>
        <ExpandMoreIcon
          aria-hidden
          sx={{ color: 'text.secondary', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Box sx={{ pt: 1, pb: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  )
}

export default DashboardDetails
