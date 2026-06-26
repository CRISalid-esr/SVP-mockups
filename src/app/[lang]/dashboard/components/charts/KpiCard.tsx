import { ReactNode } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

export interface KpiCardData {
  label: string
  value: string
  hint?: string
  /** Icône MUI optionnelle affichée dans la pastille en haut à droite. */
  icon?: ReactNode
  /** Couleur d'accent (pastille d'icône, indice, survol). Défaut = primary. */
  color?: string
}

export const KpiCard = ({ label, value, hint, icon, color }: KpiCardData) => {
  const theme = useTheme()
  const accent = color ?? theme.palette.primary.main

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.cardBorder,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        overflow: 'hidden',
        transition: 'box-shadow .2s ease, transform .2s ease, border-color .2s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: accent,
          opacity: 0.85,
        },
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          borderColor: alpha(accent, 0.5),
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            lineHeight: 1.3,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Typography>
        {icon && (
          <Box
            sx={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              color: accent,
              bgcolor: alpha(accent, 0.12),
              '& svg': { fontSize: 20 },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Typography
        sx={{
          fontSize: theme.utils.pxToRem(30),
          fontWeight: theme.typography.fontWeightBold,
          color: 'text.primary',
          lineHeight: 1.05,
          mt: 'auto',
        }}
      >
        {value}
      </Typography>

      {hint && (
        <Typography
          variant='caption'
          sx={{ color: accent, fontWeight: 600, lineHeight: 1.3 }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  )
}

export const KpiCardGrid = ({ cards }: { cards: KpiCardData[] }) => {
  const size = cards.length <= 4 ? { xs: 6, md: 3 } : { xs: 6, sm: 4, md: 2.4 }
  return (
    <Grid container spacing={2}>
      {cards.map((c, i) => (
        <Grid key={i} size={size} sx={{ display: 'flex' }}>
          <KpiCard {...c} />
        </Grid>
      ))}
    </Grid>
  )
}
