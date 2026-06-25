import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export interface KpiCardData {
  label: string
  value: string
  hint?: string
}

export const KpiCard = ({ label, value, hint }: KpiCardData) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        height: '100%',
        p: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: theme.palette.cardBorder,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: theme.utils.pxToRem(26),
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.palette.primary.main,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      {hint && (
        <Typography variant='caption' color='text.secondary'>
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
