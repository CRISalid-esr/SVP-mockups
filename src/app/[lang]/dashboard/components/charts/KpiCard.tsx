import { Box, Typography } from '@mui/material'

export interface KpiCardData {
  label: string
  value: string
  /** Précision sous le libellé : part, montant, référence. */
  hint?: string
}

/** Indicateur : un chiffre et son libellé, sans couleur ni icône. */
export const KpiCard = ({ label, value, hint }: KpiCardData) => (
  <Box
    sx={{
      height: '100%',
      p: 2.5,
      boxSizing: 'border-box',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 4,
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant='h4' component='p'>{value}</Typography>
    <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5 }}>{label}</Typography>
    {hint && <Typography variant='body2' color='text.secondary'>{hint}</Typography>}
  </Box>
)

/** Quatre indicateurs au plus, sur une ligne. */
export const KpiCardGrid = ({ cards }: { cards: KpiCardData[] }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: `repeat(${Math.min(cards.length, 4)}, minmax(0, 1fr))` }, gap: 2 }}>
    {cards.slice(0, 4).map((card) => (
      <KpiCard key={card.label} {...card} />
    ))}
  </Box>
)
